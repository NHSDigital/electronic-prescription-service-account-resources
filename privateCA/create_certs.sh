#!/usr/bin/env bash
set -eE -o functrace

failure() {
  local lineno=$1
  local msg=$2
  echo "Failed at $lineno: $msg"
}
trap 'failure ${LINENO} "$BASH_COMMAND"' ERR

while getopts e:d:a: flag
do
  case "$flag" in
    e) environment=${OPTARG};;
    d) dry_run_param=${OPTARG};;
    a) app_name=${OPTARG};;
    *) echo "usage: $0 [-e] environment [-d] dry run [-a] application name" >&2
       exit 1 ;;
  esac
done

if [ "$dry_run_param" = "false" ]; then
    DRY_RUN=false
else
    DRY_RUN=true
fi

if [ "$environment" = "" ]; then
    echo "You must pass in an environment name using the e flag"
    exit 1
fi

if [ "$app_name" = "" ]; then
    echo "You must pass in the application name using the a flag"
    exit 1
fi

# Convert the app_name to all lowercase
app_name_lowercase=$(echo "$app_name" | tr '[:upper:]' '[:lower:]')

# Capitalise the first letter of each word and remove spaces
secret_output_prefix=$(echo "$app_name_lowercase" | sed -e 's/\([[:alpha:]]\)\([[:alpha:]]*\)/\u\1\L\2/g' -e 's/ //g')

BASE_DIR=$(pwd)
readonly BASE_DIR

CERTS_DIR="${BASE_DIR}/certs"
readonly CERTS_DIR

KEYS_DIR="${BASE_DIR}/private"
readonly KEYS_DIR

DATESTAMP=$(date +%Y%m%d_%H%M%S)
readonly DATESTAMP

BACKUP_CERTS_DIR="${BASE_DIR}/certs_backup_${DATESTAMP}"
readonly BACKUP_CERTS_DIR

BACKUP_KEYS_DIR="${BASE_DIR}/private_backup_${DATESTAMP}"
readonly BACKUP_KEYS_DIR

CRL_DIR="${BASE_DIR}/crl"
readonly CRL_DIR

CONFIG_DIR="${BASE_DIR}/config"
readonly CONFIG_DIR

# OpenSSL Configs
CA_CERT_SIGNING_CONFIG="openssl-ca.conf"
readonly CA_CERT_SIGNING_CONFIG

CERT_VALIDITY_DAYS="365"
readonly CERT_VALIDITY_DAYS

# CA config
CA_NAME="ca"
readonly CA_NAME

CA_CERTIFICATE_SUBJECT="/C=GB/ST=Leeds/L=Leeds/O=nhs/OU=${app_name_lowercase} private CA/CN=${app_name_lowercase} Private CA $(date +%Y%m%d_%H%M%S)"
readonly CA_CERTIFICATE_SUBJECT

CERT_PREFIX="${environment}-"
readonly CERT_PREFIX

CERT_PREFIX_CI="ci"
readonly CERT_PREFIX_CI

CERT_PREFIX_SANDBOX="sandbox"
readonly CERT_PREFIX_SANDBOX

SECRET_OUTPUT_PREFIX="${secret_output_prefix}"
readonly SECRET_OUTPUT_PREFIX

BUCKET_PREFIX="${app_name_lowercase// /-}"
if [ "$BUCKET_PREFIX" == "fhir-facade" ]; then  
    BUCKET_PREFIX=fhirfacade
fi
readonly BUCKET_PREFIX

FILE_PREFIX="${app_name_lowercase// /_}"

readonly FILE_PREFIX

CLIENT_CERT_SUBJECT_PREFIX="/C=GB/ST=Leeds/L=Leeds/O=nhs/OU=${app_name_lowercase} private CA/CN=client-cert-"
readonly CLIENT_CERT_SUBJECT_PREFIX

# v3 extensions (unused)

V3_EXT="$BASE_DIR/v3.ext"
readonly V3_EXT
export V3_EXT

function generate_crl {
    openssl ca -config openssl-ca.conf -gencrl -out "$CRL_DIR/$CA_NAME.crl"
}

function convert_cert_to_der {
    local -r cert_name="$1"
    echo "@ Converting $cert_name to DER format..."
    openssl x509 -outform DER -in "$CERTS_DIR/$cert_name.pem" -out "$CERTS_DIR/$cert_name.crt"
}

function generate_key {
    local -r key_name="$1"
    echo "@ Generating key '$key_name'..."
    openssl genrsa -out "$KEYS_DIR/$key_name.key" 2048
}

function generate_ca_cert {
    local -r key_name="$1"
    echo "@ Generating CA certificate..."
    openssl req -new -x509 -days "$CERT_VALIDITY_DAYS" -config "$BASE_DIR/$CA_CERT_SIGNING_CONFIG" \
        -key "$KEYS_DIR/$key_name.key" \
        -out "$CERTS_DIR/$key_name.pem" -outform PEM -subj "$CA_CERTIFICATE_SUBJECT"

    convert_cert_to_der "$key_name"
}

function create_csr {
    local -r key_name="$1"
    local -r client_description="$2"

    if [ "$key_name" = "apigee_client_cert" ]
    then
        echo "@ Creating CSR for '$key_name'..."
        openssl req -config "$BASE_DIR/$SMARTCARD_CERT_SIGNING_CONFIG" -new \
        -key "$KEYS_DIR/$key_name.key" \
        -out "$CERTS_DIR/$key_name.csr" -outform PEM \
        -subj "${CLIENT_CERT_SUBJECT_PREFIX}${CERT_PREFIX}${CERT_PREFIX_CI}${client_description}"
    elif [ "$key_name" = "apigee_client_cert_sandbox" ]
    then
        echo "@ Creating CSR for '$key_name'..."
        openssl req -config "$BASE_DIR/$SMARTCARD_CERT_SIGNING_CONFIG" -new \
        -key "$KEYS_DIR/$key_name.key" \
        -out "$CERTS_DIR/$key_name.csr" -outform PEM \
        -subj "${CLIENT_CERT_SUBJECT_PREFIX}${CERT_PREFIX}${CERT_PREFIX_SANDBOX}${client_description}"
    fi
}

function sign_csr_with_ca {
    local -r key_name="$1"
    echo "@ Using CSR to generate signed cert for \"$key_name\"..."
    openssl ca -batch \
        -config "$BASE_DIR/$CA_CERT_SIGNING_CONFIG" -policy signing_policy -extensions signing_req \
        -keyfile "$KEYS_DIR/$CA_NAME.key" -cert "$CERTS_DIR/$CA_NAME.pem" \
        -days "$CERT_VALIDITY_DAYS" -out "$CERTS_DIR/$key_name.pem" -in "$CERTS_DIR/$key_name.csr" \
        -notext # don't output the text form of a certificate to the output file
}

function generate_ca_signed_cert {
    local -r key_name="$1"
    local -r cert_subject="$2"

    create_csr "$key_name" "$cert_subject"
    sign_csr_with_ca "$key_name"
}

function generate_client_cert {
    local -r name="$1"

    local -r description="-apigee-client-cert"
    generate_key "$name"
    generate_ca_signed_cert "$name" "$description"
    convert_cert_to_der "$name"
}

# These shellcheck disables are to prevent the linter from trying to analyse 
# the query string in the commands below
# shellcheck disable=SC2016
CA_KEY_ARN=$(aws cloudformation describe-stacks \
    --stack-name account-resources \
    --query 'Stacks[0].Outputs[?OutputKey==`'"${SECRET_OUTPUT_PREFIX}"'CAKeySecret`].OutputValue' --output text)
# shellcheck disable=SC2016
CA_CERT_ARN=$(aws cloudformation describe-stacks \
    --stack-name account-resources \
    --query 'Stacks[0].Outputs[?OutputKey==`'"${SECRET_OUTPUT_PREFIX}"'CACertSecret`].OutputValue' --output text)
# shellcheck disable=SC2016
CLIENT_KEY_ARN=$(aws cloudformation describe-stacks \
    --stack-name account-resources \
    --query 'Stacks[0].Outputs[?OutputKey==`'"${SECRET_OUTPUT_PREFIX}"'ClientKeySecret`].OutputValue' --output text)
# shellcheck disable=SC2016
CLIENT_CERT_ARN=$(aws cloudformation describe-stacks \
    --stack-name account-resources \
    --query 'Stacks[0].Outputs[?OutputKey==`'"${SECRET_OUTPUT_PREFIX}"'ClientCertSecret`].OutputValue' --output text)
# shellcheck disable=SC2016
CLIENT_SANDBOX_KEY_ARN=$(aws cloudformation describe-stacks \
    --stack-name account-resources \
    --query 'Stacks[0].Outputs[?OutputKey==`'"${SECRET_OUTPUT_PREFIX}"'ClientSandboxKeySecret`].OutputValue' --output text)
# shellcheck disable=SC2016
CLIENT_SANDBOX_CERT_ARN=$(aws cloudformation describe-stacks \
    --stack-name account-resources \
    --query 'Stacks[0].Outputs[?OutputKey==`'"${SECRET_OUTPUT_PREFIX}"'ClientSandboxCertSecret`].OutputValue' --output text)
# shellcheck disable=SC2016
TRUSTSTORE_BUCKET_ARN=$(aws cloudformation describe-stacks \
    --stack-name account-resources \
    --query 'Stacks[0].Outputs[?OutputKey==`TrustStoreBucket`].OutputValue' --output text)
TRUSTSTORE_BUCKET_NAME=$(echo "${TRUSTSTORE_BUCKET_ARN}" | cut -d ":" -f 6)


echo "Going to create mutual TLS certs with these details"
echo "AWS_PROFILE: ${AWS_PROFILE}"
echo "CERT_PREFIX: ${CERT_PREFIX}"
echo "SECRET_OUTPUT_PREFIX: ${SECRET_OUTPUT_PREFIX}"
echo "BUCKET_PREFIX: ${BUCKET_PREFIX}"
echo "FILE_PREFIX: ${FILE_PREFIX}"
echo "DRY_RUN: ${DRY_RUN}"
echo "CA_KEY_ARN: ${CA_KEY_ARN}"
echo "CA_CERT_ARN: ${CA_CERT_ARN}"
echo "CLIENT_KEY_ARN: ${CLIENT_KEY_ARN}"
echo "CLIENT_CERT_ARN: ${CLIENT_CERT_ARN}"
echo "CLIENT_SANDBOX_KEY_ARN: ${CLIENT_SANDBOX_KEY_ARN}"
echo "CLIENT_SANDBOX_CERT_ARN: ${CLIENT_SANDBOX_CERT_ARN}"
echo "TRUSTSTORE_BUCKET_ARN: ${TRUSTSTORE_BUCKET_ARN}"
echo "TRUSTSTORE_BUCKET_NAME: ${TRUSTSTORE_BUCKET_NAME}"
echo "BACKUP_CERTS_DIR: ${BACKUP_CERTS_DIR}"
read -r -p "Press any key to resume or press ctrl+c to exit ..."

# Recreate output dirs
rm -rf "$CERTS_DIR" "$KEYS_DIR" "$CRL_DIR" "$CONFIG_DIR"
mkdir "$CERTS_DIR" "$KEYS_DIR" "$CRL_DIR" "$CONFIG_DIR" "$BACKUP_CERTS_DIR" "$BACKUP_KEYS_DIR"

# Create database and serial files
touch "$CONFIG_DIR/index.txt"
echo '1000' > "$CONFIG_DIR/crlnumber.txt"
echo '01' > "$CONFIG_DIR/serial.txt"

# Generate CA key and self-signed cert
echo "Generating CA credentials..."
generate_key "$CA_NAME"
generate_ca_cert "$CA_NAME"

generate_client_cert "apigee_client_cert"
generate_client_cert "apigee_client_cert_sandbox"


echo "Backing up existing secrets to local file"

aws secretsmanager get-secret-value \
    --secret-id "${CA_KEY_ARN}" \
    --query SecretString \
    --output text > "${BACKUP_KEYS_DIR}/${CA_NAME}.key"

aws secretsmanager get-secret-value \
    --secret-id "${CA_CERT_ARN}" \
    --query SecretString \
    --output text > "${BACKUP_CERTS_DIR}/${CA_NAME}.pem"

aws secretsmanager get-secret-value \
    --secret-id "${CLIENT_KEY_ARN}" \
    --query SecretString \
    --output text > "${BACKUP_KEYS_DIR}/apigee_client_cert.key"

aws secretsmanager get-secret-value \
    --secret-id "${CLIENT_CERT_ARN}" \
    --query SecretString \
    --output text > "${BACKUP_CERTS_DIR}/apigee_client_cert.pem"

aws secretsmanager get-secret-value \
    --secret-id "${CLIENT_SANDBOX_KEY_ARN}" \
    --query SecretString \
    --output text > "${BACKUP_KEYS_DIR}/apigee_client_cert_sandbox.key"

aws secretsmanager get-secret-value \
    --secret-id "${CLIENT_SANDBOX_CERT_ARN}" \
    --query SecretString \
    --output text > "${BACKUP_CERTS_DIR}/apigee_client_cert_sandbox.pem"

echo "Creating new combined truststore files for upload"

aws s3api head-object --bucket "${TRUSTSTORE_BUCKET_NAME}" --key "${BUCKET_PREFIX}"-truststore.pem || NOT_EXIST=true
if [ "$NOT_EXIST" ]; then
  echo "" > "${BACKUP_CERTS_DIR}/s3_${FILE_PREFIX}_truststore.pem"
else
    aws s3 cp "s3://${TRUSTSTORE_BUCKET_NAME}/${BUCKET_PREFIX}-truststore.pem" "${BACKUP_CERTS_DIR}/s3_${FILE_PREFIX}_truststore.pem"
fi

aws s3api head-object --bucket "${TRUSTSTORE_BUCKET_NAME}" --key "${BUCKET_PREFIX}"-sandbox-truststore.pem || NOT_EXIST=true
if [ "$NOT_EXIST" ]; then
  echo "" > "${BACKUP_CERTS_DIR}/s3_${FILE_PREFIX}_sandbox_truststore.pem"
else
    aws s3 cp "s3://${TRUSTSTORE_BUCKET_NAME}/${BUCKET_PREFIX}-sandbox-truststore.pem" "${BACKUP_CERTS_DIR}/s3_${FILE_PREFIX}_sandbox_truststore.pem"
fi

cat "${BACKUP_CERTS_DIR}/s3_${FILE_PREFIX}_truststore.pem" "${CERTS_DIR}/${CA_NAME}.pem" > "${CERTS_DIR}/${FILE_PREFIX}_truststore.pem"
cat "${BACKUP_CERTS_DIR}/s3_${FILE_PREFIX}_sandbox_truststore.pem" "${CERTS_DIR}/${CA_NAME}.pem" > "${CERTS_DIR}/${FILE_PREFIX}_sandbox_truststore.pem"

if [ "$DRY_RUN" = "false" ]; then
    echo "Setting new keys in secrets manager"
    read -r -p "Press any key to resume or press ctrl+c to exit ..."
    aws secretsmanager put-secret-value \
        --secret-id "${CA_KEY_ARN}" \
        --secret-string "file://${KEYS_DIR}/${CA_NAME}.key"
    aws secretsmanager put-secret-value \
        --secret-id "${CA_CERT_ARN}" \
        --secret-string "file://${CERTS_DIR}/${CA_NAME}.pem"

    aws secretsmanager put-secret-value \
        --secret-id "${CLIENT_KEY_ARN}" \
        --secret-string "file://${KEYS_DIR}/apigee_client_cert.key"
    aws secretsmanager put-secret-value \
        --secret-id "${CLIENT_CERT_ARN}" \
        --secret-string "file://${CERTS_DIR}/apigee_client_cert.pem"

    aws secretsmanager put-secret-value \
        --secret-id "${CLIENT_SANDBOX_KEY_ARN}" \
        --secret-string "file://${KEYS_DIR}/apigee_client_cert_sandbox.key"
    aws secretsmanager put-secret-value \
        --secret-id "${CLIENT_SANDBOX_CERT_ARN}" \
        --secret-string "file://${CERTS_DIR}/apigee_client_cert_sandbox.pem"

    echo "Going to create new truststore files on S3"
    read -r -p "Press any key to resume or press ctrl+c to exit ..."

    aws s3 cp "${CERTS_DIR}/${FILE_PREFIX}_truststore.pem" "s3://${TRUSTSTORE_BUCKET_NAME}/${BUCKET_PREFIX}-truststore.pem"
    aws s3 cp "${CERTS_DIR}/${FILE_PREFIX}_sandbox_truststore.pem" "s3://${TRUSTSTORE_BUCKET_NAME}/${BUCKET_PREFIX}-sandbox-truststore.pem"

else
    echo "Not setting new secrets or uploading truststore files as dry run set to true"
fi

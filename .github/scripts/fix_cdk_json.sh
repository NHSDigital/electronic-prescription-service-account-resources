#!/usr/bin/env bash
set -e

# script used to set context key values in cdk.json pre deployment from environment variables

# helper function to set string values
fix_string_key() {
    KEY_NAME=$1
    KEY_VALUE=$2
    if [ -z "${KEY_VALUE}" ]; then
        echo "${KEY_NAME} value is unset or set to the empty string"
        exit 1
    fi
    echo "Setting ${KEY_NAME}"
    jq \
        --arg key_value "${KEY_VALUE}" \
        --arg key_name "${KEY_NAME}" \
        '. += {($key_name): $key_value}' "$OUTPUT_FILE_NAME" > "${TEMP_FILE}"
    mv "${TEMP_FILE}" "$OUTPUT_FILE_NAME"
}

fix_list_key() {
    KEY_NAME=$1
    KEY_VALUE=$2
    if [ -z "${KEY_VALUE}" ]; then
        echo "${KEY_NAME} value is unset or set to empty list"
        exit 1
    fi
    echo "Setting ${KEY_NAME}"
    jq \
        --argjson key_value "${KEY_VALUE}" \
        --arg key_name "${KEY_NAME}" \
        '. += {($key_name): $key_value}' "$OUTPUT_FILE_NAME" > "${TEMP_FILE}"
    mv "${TEMP_FILE}" "$OUTPUT_FILE_NAME"
}

# helper function to set boolean and number values (without quotes)
fix_boolean_number_key() {
    KEY_NAME=$1
    KEY_VALUE=$2
    if [ -z "${KEY_VALUE}" ]; then
        echo "${KEY_NAME} value is unset or set to the empty string"
        exit 1
    fi
    echo "Setting ${KEY_NAME}"
    jq \
        --argjson key_value "${KEY_VALUE}" \
        --arg key_name "${KEY_NAME}" \
        '. += {($key_name): $key_value}' "$OUTPUT_FILE_NAME" > "${TEMP_FILE}"
    mv "${TEMP_FILE}" "$OUTPUT_FILE_NAME"
}

OUTPUT_FILE_NAME=$1
if [ -z "${OUTPUT_FILE_NAME}" ]; then
    echo "OUTPUT_FILE_NAME value is unset or set to the empty string"
    exit 1
fi
echo "{}" > "$OUTPUT_FILE_NAME"
TEMP_FILE=$(mktemp)


CFN_DRIFT_DETECTION_GROUP="account-resources"
if [[ "$IS_PULL_REQUEST" = "true" ]]; then
  CFN_DRIFT_DETECTION_GROUP="account-resources-pull-request"
fi

# go through all the key values we need to set
fix_string_key versionNumber "${VERSION_NUMBER}"
fix_string_key commitId "${COMMIT_ID}"
fix_string_key cfnDriftDetectionGroup "${CFN_DRIFT_DETECTION_GROUP}"
fix_string_key stackName "${STACK_NAME}"
fix_boolean_number_key isPullRequest "${IS_PULL_REQUEST}"
fix_boolean_number_key lambdaConcurrencyThreshold "${LAMBDA_CONCURRENCY_THRESHOLD}"
fix_boolean_number_key lambdaConcurrencyWarningThreshold "${LAMBDA_CONCURRENCY_WARNING_THRESHOLD}"
fix_boolean_number_key enableAlerts "${ENABLE_ALERTS}"

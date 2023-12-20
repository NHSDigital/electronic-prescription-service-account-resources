#!/usr/bin/env bash

# This script can be used to set role secrets in all EPS repos
# it gets the role from cloudformation exports
# it needs the following aws profiles defined in ~/.aws/config
# prescription-dev
# prescription-ref
# prescription-qa
# prescription-int
# prescription-prod
#
# you need to be authenticated to aws and github before running this by running these two commands
#
# make aws-login
# gh auth login
#



check_gh_logged_in() {
    if ! gh auth status >/dev/null 2>&1; then
        echo "You need to login using gh auth login"
        exit 1
    fi
}

get_dev_roles() {
    DEV_CLOUD_FORMATION_DEPLOY_ROLE=$(aws cloudformation list-exports \
        --profile prescription-dev \
        --query 'Exports[?Name==`ci-resources:CloudFormationDeployRole`].Value' \
        --output text)

    if [ -z "${DEV_CLOUD_FORMATION_DEPLOY_ROLE}" ]; then
        echo "Can not get DEV_CLOUD_FORMATION_DEPLOY_ROLE. Check you are logged into aws using make aws-login and you have prescription-dev profile set up"
        exit 1
    fi

    DEV_CLOUD_FORMATION_CHECK_VERSION_ROLE=$(aws cloudformation list-exports \
        --profile prescription-dev \
        --query 'Exports[?Name==`ci-resources:CloudFormationCheckVersionRole`].Value' \
        --output text)

    if [ -z "${DEV_CLOUD_FORMATION_CHECK_VERSION_ROLE}" ]; then
        echo "Can not get DEV_CLOUD_FORMATION_CHECK_VERSION_ROLE. Setting to DEV_CLOUD_FORMATION_DEPLOY_ROLE"
        DEV_CLOUD_FORMATION_CHECK_VERSION_ROLE=${DEV_CLOUD_FORMATION_DEPLOY_ROLE}
    fi

    DEV_CLOUD_FORMATION_EXECUTE_LAMBDA_ROLE=$(aws cloudformation list-exports \
        --profile prescription-dev \
        --query 'Exports[?Name==`ci-resources:ReleaseNotesExecuteLambdaRole`].Value' \
        --output text)    

    if [ -z "${DEV_CLOUD_FORMATION_EXECUTE_LAMBDA_ROLE}" ]; then
        echo "Can not get DEV_CLOUD_FORMATION_EXECUTE_LAMBDA_ROLE. Setting to DEV_CLOUD_FORMATION_DEPLOY_ROLE"
        DEV_CLOUD_FORMATION_EXECUTE_LAMBDA_ROLE=${DEV_CLOUD_FORMATION_DEPLOY_ROLE}
    fi

    DEV_CLOUD_FORMATION_CREATE_CHANGESET_ROLE=$(aws cloudformation list-exports \
        --profile prescription-dev \
        --query 'Exports[?Name==`ci-resources:CloudFormationPrepareChangesetRole`].Value' \
        --output text)    

    if [ -z "${DEV_CLOUD_FORMATION_CREATE_CHANGESET_ROLE}" ]; then
        echo "Can not get DEV_CLOUD_FORMATION_CREATE_CHANGESET_ROLE. Setting to DEV_CLOUD_FORMATION_DEPLOY_ROLE"
        DEV_CLOUD_FORMATION_CREATE_CHANGESET_ROLE=${DEV_CLOUD_FORMATION_DEPLOY_ROLE}
    fi
}

get_ref_roles() {
    REF_CLOUD_FORMATION_DEPLOY_ROLE=$(aws cloudformation list-exports \
        --profile prescription-ref \
        --query 'Exports[?Name==`ci-resources:CloudFormationDeployRole`].Value' \
        --output text)

    if [ -z "${REF_CLOUD_FORMATION_DEPLOY_ROLE}" ]; then
        echo "Can not get REF_CLOUD_FORMATION_DEPLOY_ROLE. Check you are logged into aws using make aws-login and you have prescription-ref profile set up"
        exit 1
    fi

    REF_CLOUD_FORMATION_CHECK_VERSION_ROLE=$(aws cloudformation list-exports \
        --profile prescription-ref \
        --query 'Exports[?Name==`ci-resources:CloudFormationCheckVersionRole`].Value' \
        --output text)

    if [ -z "${REF_CLOUD_FORMATION_CHECK_VERSION_ROLE}" ]; then
        echo "Can not get REF_CLOUD_FORMATION_CHECK_VERSION_ROLE. Setting to REF_CLOUD_FORMATION_DEPLOY_ROLE"
        REF_CLOUD_FORMATION_CHECK_VERSION_ROLE=${REF_CLOUD_FORMATION_DEPLOY_ROLE}
    fi

    REF_CLOUD_FORMATION_CREATE_CHANGESET_ROLE=$(aws cloudformation list-exports \
        --profile prescription-ref \
        --query 'Exports[?Name==`ci-resources:CloudFormationPrepareChangesetRole`].Value' \
        --output text)

    if [ -z "${REF_CLOUD_FORMATION_CREATE_CHANGESET_ROLE}" ]; then
        echo "Can not get REF_CLOUD_FORMATION_CREATE_CHANGESET_ROLE. Setting to REF_CLOUD_FORMATION_DEPLOY_ROLE"
        REF_CLOUD_FORMATION_CREATE_CHANGESET_ROLE=${REF_CLOUD_FORMATION_DEPLOY_ROLE}
    fi
}

get_qa_roles() {
    QA_CLOUD_FORMATION_DEPLOY_ROLE=$(aws cloudformation list-exports \
        --profile prescription-qa \
        --query 'Exports[?Name==`ci-resources:CloudFormationDeployRole`].Value' \
        --output text)

    if [ -z "${QA_CLOUD_FORMATION_DEPLOY_ROLE}" ]; then
        echo "Can not get QA_CLOUD_FORMATION_DEPLOY_ROLE. Check you are logged into aws using make aws-login and you have prescription-qa profile set up"
        exit 1
    fi

    QA_CLOUD_FORMATION_CHECK_VERSION_ROLE=$(aws cloudformation list-exports \
        --profile prescription-qa \
        --query 'Exports[?Name==`ci-resources:CloudFormationCheckVersionRole`].Value' \
        --output text)

    if [ -z "${QA_CLOUD_FORMATION_CHECK_VERSION_ROLE}" ]; then
        echo "Can not get QA_CLOUD_FORMATION_CHECK_VERSION_ROLE. Setting to QA_CLOUD_FORMATION_DEPLOY_ROLE"
        QA_CLOUD_FORMATION_CHECK_VERSION_ROLE=${QA_CLOUD_FORMATION_DEPLOY_ROLE}
    fi

    QA_CLOUD_FORMATION_CREATE_CHANGESET_ROLE=$(aws cloudformation list-exports \
        --profile prescription-qa \
        --query 'Exports[?Name==`ci-resources:CloudFormationPrepareChangesetRole`].Value' \
        --output text)

    if [ -z "${QA_CLOUD_FORMATION_CREATE_CHANGESET_ROLE}" ]; then
        echo "Can not get QA_CLOUD_FORMATION_CREATE_CHANGESET_ROLE. Setting to QA_CLOUD_FORMATION_DEPLOY_ROLE"
        QA_CLOUD_FORMATION_CREATE_CHANGESET_ROLE=${QA_CLOUD_FORMATION_DEPLOY_ROLE}
    fi
}

get_int_roles() {
    INT_CLOUD_FORMATION_DEPLOY_ROLE=$(aws cloudformation list-exports \
        --profile prescription-int \
        --query 'Exports[?Name==`ci-resources:CloudFormationDeployRole`].Value' \
        --output text)

    if [ -z "${INT_CLOUD_FORMATION_DEPLOY_ROLE}" ]; then
        echo "Can not get INT_CLOUD_FORMATION_DEPLOY_ROLE. Check you are logged into aws using make aws-login and you have prescription-int profile set up"
        exit 1
    fi

    INT_CLOUD_FORMATION_CHECK_VERSION_ROLE=$(aws cloudformation list-exports \
        --profile prescription-int \
        --query 'Exports[?Name==`ci-resources:CloudFormationCheckVersionRole`].Value' \
        --output text)

    if [ -z "${INT_CLOUD_FORMATION_CHECK_VERSION_ROLE}" ]; then
        echo "Can not get INT_CLOUD_FORMATION_CHECK_VERSION_ROLE. Setting to INT_CLOUD_FORMATION_DEPLOY_ROLE"
        INT_CLOUD_FORMATION_CHECK_VERSION_ROLE=${INT_CLOUD_FORMATION_DEPLOY_ROLE}
    fi

    INT_CLOUD_FORMATION_CREATE_CHANGESET_ROLE=$(aws cloudformation list-exports \
        --profile prescription-int \
        --query 'Exports[?Name==`ci-resources:CloudFormationPrepareChangesetRole`].Value' \
        --output text)

    if [ -z "${INT_CLOUD_FORMATION_CREATE_CHANGESET_ROLE}" ]; then
        echo "Can not get INT_CLOUD_FORMATION_CREATE_CHANGESET_ROLE. Setting to INT_CLOUD_FORMATION_DEPLOY_ROLE"
        INT_CLOUD_FORMATION_CREATE_CHANGESET_ROLE=${INT_CLOUD_FORMATION_DEPLOY_ROLE}
    fi
}

get_prod_roles() {
    PROD_CLOUD_FORMATION_DEPLOY_ROLE=$(aws cloudformation list-exports \
        --profile prescription-prod \
        --query 'Exports[?Name==`ci-resources:CloudFormationDeployRole`].Value' \
        --output text)

    if [ -z "${PROD_CLOUD_FORMATION_DEPLOY_ROLE}" ]; then
        echo "Can not get PROD_CLOUD_FORMATION_DEPLOY_ROLE. Check you are logged into aws using make aws-login and you have prescription-prod profile set up"
        exit 1
    fi

    PROD_CLOUD_FORMATION_CHECK_VERSION_ROLE=$(aws cloudformation list-exports \
        --profile prescription-prod \
        --query 'Exports[?Name==`ci-resources:CloudFormationCheckVersionRole`].Value' \
        --output text)

    if [ -z "${PROD_CLOUD_FORMATION_CHECK_VERSION_ROLE}" ]; then
        echo "Can not get PROD_CLOUD_FORMATION_CHECK_VERSION_ROLE. Setting to PROD_CLOUD_FORMATION_DEPLOY_ROLE"
        PROD_CLOUD_FORMATION_CHECK_VERSION_ROLE=${PROD_CLOUD_FORMATION_DEPLOY_ROLE}
    fi

    PROD_CLOUD_FORMATION_CREATE_CHANGESET_ROLE=$(aws cloudformation list-exports \
        --profile prescription-prod \
        --query 'Exports[?Name==`ci-resources:CloudFormationPrepareChangesetRole`].Value' \
        --output text)

    if [ -z "${PROD_CLOUD_FORMATION_CREATE_CHANGESET_ROLE}" ]; then
        echo "Can not get PROD_CLOUD_FORMATION_CREATE_CHANGESET_ROLE. Setting to PROD_CLOUD_FORMATION_DEPLOY_ROLE"
        PROD_CLOUD_FORMATION_CREATE_CHANGESET_ROLE=${PROD_CLOUD_FORMATION_DEPLOY_ROLE}
    fi
}

set_secrets() {
    REPO=$1
    echo "Setting secrets in ${REPO}"
    echo

    if ! gh secret list --repo ${REPO} >/dev/null 2>&1; then
        echo "Can not list secrets in repo. Check permissions"
        exit 1
    fi

    # for dev secrets, we need to set for actions and dependabot so dependabot pull requests work
    echo "setting DEV_CLOUD_FORMATION_DEPLOY_ROLE for actions"
    gh secret set DEV_CLOUD_FORMATION_DEPLOY_ROLE \
        --repo ${REPO} \
        --app actions \
        --body "$DEV_CLOUD_FORMATION_DEPLOY_ROLE"

    echo "setting DEV_CLOUD_FORMATION_DEPLOY_ROLE for dependabot"
    gh secret set DEV_CLOUD_FORMATION_DEPLOY_ROLE \
        --repo ${REPO} \
        --app dependabot \
        --body "$DEV_CLOUD_FORMATION_DEPLOY_ROLE"

    echo "setting DEV_CLOUD_FORMATION_CHECK_VERSION_ROLE for actions"
    gh secret set DEV_CLOUD_FORMATION_CHECK_VERSION_ROLE \
        --repo ${REPO} \
        --app actions \
        --body "$DEV_CLOUD_FORMATION_CHECK_VERSION_ROLE"

    echo "setting DEV_CLOUD_FORMATION_CHECK_VERSION_ROLE for dependabot"
    gh secret set DEV_CLOUD_FORMATION_CHECK_VERSION_ROLE \
        --repo ${REPO} \
        --app dependabot \
        --body "$DEV_CLOUD_FORMATION_CHECK_VERSION_ROLE"

    echo "setting DEV_CLOUD_FORMATION_CREATE_CHANGESET_ROLE for actions"
    gh secret set DEV_CLOUD_FORMATION_CREATE_CHANGESET_ROLE \
        --repo ${REPO} \
        --app actions \
        --body "$DEV_CLOUD_FORMATION_CREATE_CHANGESET_ROLE"

    echo "setting DEV_CLOUD_FORMATION_CREATE_CHANGESET_ROLE for dependabot"
    gh secret set DEV_CLOUD_FORMATION_CREATE_CHANGESET_ROLE \
        --repo ${REPO} \
        --app dependabot \
        --body "$DEV_CLOUD_FORMATION_CREATE_CHANGESET_ROLE"

    echo "setting DEV_CLOUD_FORMATION_EXECUTE_LAMBDA_ROLE for actions"
    gh secret set DEV_CLOUD_FORMATION_EXECUTE_LAMBDA_ROLE \
        --repo ${REPO} \
        --app actions \
        --body "$DEV_CLOUD_FORMATION_EXECUTE_LAMBDA_ROLE"

    # set int secrets
    echo "setting INT_CLOUD_FORMATION_DEPLOY_ROLE for actions"
    gh secret set INT_CLOUD_FORMATION_DEPLOY_ROLE \
        --repo ${REPO} \
        --app actions \
        --body "$INT_CLOUD_FORMATION_DEPLOY_ROLE"

    echo "setting INT_CLOUD_FORMATION_CHECK_VERSION_ROLE for actions"
    gh secret set INT_CLOUD_FORMATION_CHECK_VERSION_ROLE \
        --repo ${REPO} \
        --app actions \
        --body "$INT_CLOUD_FORMATION_CHECK_VERSION_ROLE"

    echo "setting INT_CLOUD_FORMATION_CREATE_CHANGESET_ROLE for actions"
    gh secret set INT_CLOUD_FORMATION_CREATE_CHANGESET_ROLE \
        --repo ${REPO} \
        --app actions \
        --body "$INT_CLOUD_FORMATION_CREATE_CHANGESET_ROLE"

    # set prod secrets
    echo "setting PROD_CLOUD_FORMATION_DEPLOY_ROLE for actions"
    gh secret set PROD_CLOUD_FORMATION_DEPLOY_ROLE \
        --repo ${REPO} \
        --app actions \
        --body "$PROD_CLOUD_FORMATION_DEPLOY_ROLE"

    echo "setting PROD_CLOUD_FORMATION_CHECK_VERSION_ROLE for actions"
    gh secret set PROD_CLOUD_FORMATION_CHECK_VERSION_ROLE \
        --repo ${REPO} \
        --app actions \
        --body "$PROD_CLOUD_FORMATION_CHECK_VERSION_ROLE"

    echo "setting PROD_CLOUD_FORMATION_CREATE_CHANGESET_ROLE for actions"
    gh secret set PROD_CLOUD_FORMATION_CREATE_CHANGESET_ROLE \
        --repo ${REPO} \
        --app actions \
        --body "$PROD_CLOUD_FORMATION_CREATE_CHANGESET_ROLE"

    # set qa secrets
    echo "setting QA_CLOUD_FORMATION_DEPLOY_ROLE for actions"
    gh secret set QA_CLOUD_FORMATION_DEPLOY_ROLE \
        --repo ${REPO} \
        --app actions \
        --body "$QA_CLOUD_FORMATION_DEPLOY_ROLE"

    echo "setting QA_CLOUD_FORMATION_CHECK_VERSION_ROLE for actions"
    gh secret set QA_CLOUD_FORMATION_CHECK_VERSION_ROLE \
        --repo ${REPO} \
        --app actions \
        --body "$QA_CLOUD_FORMATION_CHECK_VERSION_ROLE"

    echo "setting QA_CLOUD_FORMATION_CREATE_CHANGESET_ROLE for actions"
    gh secret set QA_CLOUD_FORMATION_CREATE_CHANGESET_ROLE \
        --repo ${REPO} \
        --app actions \
        --body "$QA_CLOUD_FORMATION_CREATE_CHANGESET_ROLE"

    # set ref secrets
    echo "setting REF_CLOUD_FORMATION_DEPLOY_ROLE for actions"
    gh secret set REF_CLOUD_FORMATION_DEPLOY_ROLE \
        --repo ${REPO} \
        --app actions \
        --body "$REF_CLOUD_FORMATION_DEPLOY_ROLE"

    echo "setting REF_CLOUD_FORMATION_CHECK_VERSION_ROLE for actions"
    gh secret set REF_CLOUD_FORMATION_CHECK_VERSION_ROLE \
        --repo ${REPO} \
        --app actions \
        --body "$REF_CLOUD_FORMATION_CHECK_VERSION_ROLE"

    echo "setting REF_CLOUD_FORMATION_CREATE_CHANGESET_ROLE for actions"
    gh secret set REF_CLOUD_FORMATION_CREATE_CHANGESET_ROLE \
        --repo ${REPO} \
        --app actions \
        --body "$REF_CLOUD_FORMATION_CREATE_CHANGESET_ROLE"
}

check_gh_logged_in

echo "Getting dev roles"
get_dev_roles

echo "Getting ref roles"
get_ref_roles

echo "Getting QA roles"
get_qa_roles

echo "Getting int roles"
get_int_roles

echo "Getting prod roles"
get_prod_roles

echo
echo "************************************************"
echo

echo "DEV_CLOUD_FORMATION_DEPLOY_ROLE:            ${DEV_CLOUD_FORMATION_DEPLOY_ROLE}"
echo "DEV_CLOUD_FORMATION_CHECK_VERSION_ROLE:     ${DEV_CLOUD_FORMATION_CHECK_VERSION_ROLE}"
echo "DEV_CLOUD_FORMATION_EXECUTE_LAMBDA_ROLE:    ${DEV_CLOUD_FORMATION_EXECUTE_LAMBDA_ROLE}"
echo "DEV_CLOUD_FORMATION_CREATE_CHANGESET_ROLE:  ${DEV_CLOUD_FORMATION_CREATE_CHANGESET_ROLE}"
echo

echo "REF_CLOUD_FORMATION_DEPLOY_ROLE:            ${REF_CLOUD_FORMATION_DEPLOY_ROLE}"
echo "REF_CLOUD_FORMATION_CHECK_VERSION_ROLE:     ${REF_CLOUD_FORMATION_CHECK_VERSION_ROLE}"
echo "REF_CLOUD_FORMATION_CREATE_CHANGESET_ROLE:  ${REF_CLOUD_FORMATION_CREATE_CHANGESET_ROLE}"
echo

echo "QA_CLOUD_FORMATION_DEPLOY_ROLE:             ${QA_CLOUD_FORMATION_DEPLOY_ROLE}"
echo "QA_CLOUD_FORMATION_CHECK_VERSION_ROLE:      ${QA_CLOUD_FORMATION_CHECK_VERSION_ROLE}"
echo "QA_CLOUD_FORMATION_CREATE_CHANGESET_ROLE:   ${QA_CLOUD_FORMATION_CREATE_CHANGESET_ROLE}"
echo

echo "INT_CLOUD_FORMATION_DEPLOY_ROLE:            ${INT_CLOUD_FORMATION_DEPLOY_ROLE}"
echo "INT_CLOUD_FORMATION_CHECK_VERSION_ROLE:     ${INT_CLOUD_FORMATION_CHECK_VERSION_ROLE}"
echo "INT_CLOUD_FORMATION_CREATE_CHANGESET_ROLE:  ${INT_CLOUD_FORMATION_CREATE_CHANGESET_ROLE}"
echo

echo "PROD_CLOUD_FORMATION_DEPLOY_ROLE:           ${PROD_CLOUD_FORMATION_DEPLOY_ROLE}"
echo "PROD_CLOUD_FORMATION_CHECK_VERSION_ROLE:    ${PROD_CLOUD_FORMATION_CHECK_VERSION_ROLE}"
echo "PROD_CLOUD_FORMATION_CREATE_CHANGESET_ROLE: ${PROD_CLOUD_FORMATION_CREATE_CHANGESET_ROLE}"
echo

read -p "Press Enter to start setting secrets or ctrl+c to exit"

echo
echo "************************************************"
echo
set_secrets "NHSDigital/electronic-prescription-service-clinical-prescription-tracker"
echo
set_secrets "NHSDigital/prescriptionsforpatients"
echo
set_secrets "NHSDigital/prescriptions-for-patients"
echo
set_secrets "NHSDigital/electronic-prescription-service-api"
echo
set_secrets "NHSDigital/electronic-prescription-service-release-notes"
echo
set_secrets "NHSDigital/electronic-prescription-service-account-resources"
echo

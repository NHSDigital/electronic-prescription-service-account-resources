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
    # Disable shellcheck, so it doesn't try and lint the queries
    # shellcheck disable=SC2016
    DEV_CLOUD_FORMATION_DEPLOY_ROLE=$(aws cloudformation list-exports \
        --profile prescription-dev \
        --query 'Exports[?Name==`ci-resources:CloudFormationDeployRole`].Value' \
        --output text)

    if [ -z "${DEV_CLOUD_FORMATION_DEPLOY_ROLE}" ]; then
        echo "Can not get DEV_CLOUD_FORMATION_DEPLOY_ROLE. Check you are logged into aws using make aws-login and you have prescription-dev profile set up"
        exit 1
    fi

    # shellcheck disable=SC2016
    DEV_CLOUD_FORMATION_CHECK_VERSION_ROLE=$(aws cloudformation list-exports \
        --profile prescription-dev \
        --query 'Exports[?Name==`ci-resources:CloudFormationCheckVersionRole`].Value' \
        --output text)

    if [ -z "${DEV_CLOUD_FORMATION_CHECK_VERSION_ROLE}" ]; then
        echo "Can not get DEV_CLOUD_FORMATION_CHECK_VERSION_ROLE. Setting to DEV_CLOUD_FORMATION_DEPLOY_ROLE"
        DEV_CLOUD_FORMATION_CHECK_VERSION_ROLE=${DEV_CLOUD_FORMATION_DEPLOY_ROLE}
    fi

    # shellcheck disable=SC2016
    DEV_CLOUD_FORMATION_EXECUTE_LAMBDA_ROLE=$(aws cloudformation list-exports \
        --profile prescription-dev \
        --query 'Exports[?Name==`ci-resources:ReleaseNotesExecuteLambdaRole`].Value' \
        --output text)    

    if [ -z "${DEV_CLOUD_FORMATION_EXECUTE_LAMBDA_ROLE}" ]; then
        echo "Can not get DEV_CLOUD_FORMATION_EXECUTE_LAMBDA_ROLE. Setting to DEV_CLOUD_FORMATION_DEPLOY_ROLE"
        DEV_CLOUD_FORMATION_EXECUTE_LAMBDA_ROLE=${DEV_CLOUD_FORMATION_DEPLOY_ROLE}
    fi

    # shellcheck disable=SC2016
    DEV_CLOUD_FORMATION_CREATE_CHANGESET_ROLE=$(aws cloudformation list-exports \
        --profile prescription-dev \
        --query 'Exports[?Name==`ci-resources:CloudFormationPrepareChangesetRole`].Value' \
        --output text)    

    if [ -z "${DEV_CLOUD_FORMATION_CREATE_CHANGESET_ROLE}" ]; then
        echo "Can not get DEV_CLOUD_FORMATION_CREATE_CHANGESET_ROLE. Setting to DEV_CLOUD_FORMATION_DEPLOY_ROLE"
        DEV_CLOUD_FORMATION_CREATE_CHANGESET_ROLE=${DEV_CLOUD_FORMATION_DEPLOY_ROLE}
    fi

    # shellcheck disable=SC2016
    DEV_ARTILLERY_RUNNER_ROLE=$(aws cloudformation list-exports \
        --profile prescription-dev \
        --query 'Exports[?Name==`ci-resources:ArtilleryRunnerRole`].Value' \
        --output text)    

    if [ -z "${DEV_ARTILLERY_RUNNER_ROLE}" ]; then
        echo "Can not get DEV_ARTILLERY_RUNNER_ROLE. Setting to unset"
        DEV_ARTILLERY_RUNNER_ROLE="unset"
    fi

    # shellcheck disable=SC2016
    DEV_CDK_PULL_IMAGE_ROLE=$(aws cloudformation list-exports \
        --profile prescription-dev \
        --query 'Exports[?Name==`ci-resources:CDKPullImageRole`].Value' \
        --output text)    

    if [ -z "${DEV_CDK_PULL_IMAGE_ROLE}" ]; then
        echo "Can not get DEV_CDK_PULL_IMAGE_ROLE. Setting to unset"
        DEV_CDK_PULL_IMAGE_ROLE="unset"
    fi

    # shellcheck disable=SC2016
    DEV_CDK_PUSH_IMAGE_ROLE=$(aws cloudformation list-exports \
        --profile prescription-dev \
        --query 'Exports[?Name==`ci-resources:CDKPushImageRole`].Value' \
        --output text)    

    if [ -z "${DEV_CDK_PUSH_IMAGE_ROLE}" ]; then
        echo "Can not get DEV_CDK_PUSH_IMAGE_ROLE. Setting to unset"
        DEV_CDK_PUSH_IMAGE_ROLE="unset"
    fi
}

get_ref_roles() {
    # shellcheck disable=SC2016
    REF_CLOUD_FORMATION_DEPLOY_ROLE=$(aws cloudformation list-exports \
        --profile prescription-ref \
        --query 'Exports[?Name==`ci-resources:CloudFormationDeployRole`].Value' \
        --output text)

    if [ -z "${REF_CLOUD_FORMATION_DEPLOY_ROLE}" ]; then
        echo "Can not get REF_CLOUD_FORMATION_DEPLOY_ROLE. Check you are logged into aws using make aws-login and you have prescription-ref profile set up"
        exit 1
    fi

    # shellcheck disable=SC2016
    REF_CLOUD_FORMATION_CHECK_VERSION_ROLE=$(aws cloudformation list-exports \
        --profile prescription-ref \
        --query 'Exports[?Name==`ci-resources:CloudFormationCheckVersionRole`].Value' \
        --output text)

    if [ -z "${REF_CLOUD_FORMATION_CHECK_VERSION_ROLE}" ]; then
        echo "Can not get REF_CLOUD_FORMATION_CHECK_VERSION_ROLE. Setting to REF_CLOUD_FORMATION_DEPLOY_ROLE"
        REF_CLOUD_FORMATION_CHECK_VERSION_ROLE=${REF_CLOUD_FORMATION_DEPLOY_ROLE}
    fi

    # shellcheck disable=SC2016
    REF_CLOUD_FORMATION_CREATE_CHANGESET_ROLE=$(aws cloudformation list-exports \
        --profile prescription-ref \
        --query 'Exports[?Name==`ci-resources:CloudFormationPrepareChangesetRole`].Value' \
        --output text)

    if [ -z "${REF_CLOUD_FORMATION_CREATE_CHANGESET_ROLE}" ]; then
        echo "Can not get REF_CLOUD_FORMATION_CREATE_CHANGESET_ROLE. Setting to REF_CLOUD_FORMATION_DEPLOY_ROLE"
        REF_CLOUD_FORMATION_CREATE_CHANGESET_ROLE=${REF_CLOUD_FORMATION_DEPLOY_ROLE}
    fi

    # shellcheck disable=SC2016
    REF_ARTILLERY_RUNNER_ROLE=$(aws cloudformation list-exports \
        --profile prescription-ref \
        --query 'Exports[?Name==`ci-resources:ArtilleryRunnerRole`].Value' \
        --output text)    

    if [ -z "${REF_ARTILLERY_RUNNER_ROLE}" ]; then
        echo "Can not get REF_ARTILLERY_RUNNER_ROLE. Setting to unset"
        REF_ARTILLERY_RUNNER_ROLE="unset"
    fi

    # shellcheck disable=SC2016
    REF_CDK_PULL_IMAGE_ROLE=$(aws cloudformation list-exports \
        --profile prescription-ref \
        --query 'Exports[?Name==`ci-resources:CDKPullImageRole`].Value' \
        --output text)    

    if [ -z "${REF_CDK_PULL_IMAGE_ROLE}" ]; then
        echo "Can not get REF_CDK_PULL_IMAGE_ROLE. Setting to unset"
        REF_CDK_PULL_IMAGE_ROLE="unset"
    fi

    # shellcheck disable=SC2016
    REF_CDK_PUSH_IMAGE_ROLE=$(aws cloudformation list-exports \
        --profile prescription-ref \
        --query 'Exports[?Name==`ci-resources:CDKPushImageRole`].Value' \
        --output text)    

    if [ -z "${REF_CDK_PUSH_IMAGE_ROLE}" ]; then
        echo "Can not get REF_CDK_PUSH_IMAGE_ROLE. Setting to unset"
        REF_CDK_PUSH_IMAGE_ROLE="unset"
    fi
}

get_qa_roles() {
    # shellcheck disable=SC2016
    QA_CLOUD_FORMATION_DEPLOY_ROLE=$(aws cloudformation list-exports \
        --profile prescription-qa \
        --query 'Exports[?Name==`ci-resources:CloudFormationDeployRole`].Value' \
        --output text)

    if [ -z "${QA_CLOUD_FORMATION_DEPLOY_ROLE}" ]; then
        echo "Can not get QA_CLOUD_FORMATION_DEPLOY_ROLE. Check you are logged into aws using make aws-login and you have prescription-qa profile set up"
        exit 1
    fi

    # shellcheck disable=SC2016
    QA_CLOUD_FORMATION_CHECK_VERSION_ROLE=$(aws cloudformation list-exports \
        --profile prescription-qa \
        --query 'Exports[?Name==`ci-resources:CloudFormationCheckVersionRole`].Value' \
        --output text)

    if [ -z "${QA_CLOUD_FORMATION_CHECK_VERSION_ROLE}" ]; then
        echo "Can not get QA_CLOUD_FORMATION_CHECK_VERSION_ROLE. Setting to QA_CLOUD_FORMATION_DEPLOY_ROLE"
        QA_CLOUD_FORMATION_CHECK_VERSION_ROLE=${QA_CLOUD_FORMATION_DEPLOY_ROLE}
    fi

    # shellcheck disable=SC2016
    QA_CLOUD_FORMATION_CREATE_CHANGESET_ROLE=$(aws cloudformation list-exports \
        --profile prescription-qa \
        --query 'Exports[?Name==`ci-resources:CloudFormationPrepareChangesetRole`].Value' \
        --output text)

    if [ -z "${QA_CLOUD_FORMATION_CREATE_CHANGESET_ROLE}" ]; then
        echo "Can not get QA_CLOUD_FORMATION_CREATE_CHANGESET_ROLE. Setting to QA_CLOUD_FORMATION_DEPLOY_ROLE"
        QA_CLOUD_FORMATION_CREATE_CHANGESET_ROLE=${QA_CLOUD_FORMATION_DEPLOY_ROLE}
    fi

    # shellcheck disable=SC2016
    QA_CDK_PULL_IMAGE_ROLE=$(aws cloudformation list-exports \
        --profile prescription-qa \
        --query 'Exports[?Name==`ci-resources:CDKPullImageRole`].Value' \
        --output text)    

    if [ -z "${QA_CDK_PULL_IMAGE_ROLE}" ]; then
        echo "Can not get QA_CDK_PULL_IMAGE_ROLE. Setting to unset"
        QA_CDK_PULL_IMAGE_ROLE="unset"
    fi

    # shellcheck disable=SC2016
    QA_CDK_PUSH_IMAGE_ROLE=$(aws cloudformation list-exports \
        --profile prescription-qa \
        --query 'Exports[?Name==`ci-resources:CDKPushImageRole`].Value' \
        --output text)    

    if [ -z "${QA_CDK_PUSH_IMAGE_ROLE}" ]; then
        echo "Can not get QA_CDK_PUSH_IMAGE_ROLE. Setting to unset"
        QA_CDK_PUSH_IMAGE_ROLE="unset"
    fi
}

get_int_roles() {
    # shellcheck disable=SC2016
    INT_CLOUD_FORMATION_DEPLOY_ROLE=$(aws cloudformation list-exports \
        --profile prescription-int \
        --query 'Exports[?Name==`ci-resources:CloudFormationDeployRole`].Value' \
        --output text)

    if [ -z "${INT_CLOUD_FORMATION_DEPLOY_ROLE}" ]; then
        echo "Can not get INT_CLOUD_FORMATION_DEPLOY_ROLE. Check you are logged into aws using make aws-login and you have prescription-int profile set up"
        exit 1
    fi

    # shellcheck disable=SC2016
    INT_CLOUD_FORMATION_CHECK_VERSION_ROLE=$(aws cloudformation list-exports \
        --profile prescription-int \
        --query 'Exports[?Name==`ci-resources:CloudFormationCheckVersionRole`].Value' \
        --output text)

    if [ -z "${INT_CLOUD_FORMATION_CHECK_VERSION_ROLE}" ]; then
        echo "Can not get INT_CLOUD_FORMATION_CHECK_VERSION_ROLE. Setting to INT_CLOUD_FORMATION_DEPLOY_ROLE"
        INT_CLOUD_FORMATION_CHECK_VERSION_ROLE=${INT_CLOUD_FORMATION_DEPLOY_ROLE}
    fi

    # shellcheck disable=SC2016
    INT_CLOUD_FORMATION_CREATE_CHANGESET_ROLE=$(aws cloudformation list-exports \
        --profile prescription-int \
        --query 'Exports[?Name==`ci-resources:CloudFormationPrepareChangesetRole`].Value' \
        --output text)

    if [ -z "${INT_CLOUD_FORMATION_CREATE_CHANGESET_ROLE}" ]; then
        echo "Can not get INT_CLOUD_FORMATION_CREATE_CHANGESET_ROLE. Setting to INT_CLOUD_FORMATION_DEPLOY_ROLE"
        INT_CLOUD_FORMATION_CREATE_CHANGESET_ROLE=${INT_CLOUD_FORMATION_DEPLOY_ROLE}
    fi

    # shellcheck disable=SC2016
    INT_CDK_PULL_IMAGE_ROLE=$(aws cloudformation list-exports \
        --profile prescription-int \
        --query 'Exports[?Name==`ci-resources:CDKPullImageRole`].Value' \
        --output text)    

    if [ -z "${INT_CDK_PULL_IMAGE_ROLE}" ]; then
        echo "Can not get INT_CDK_PULL_IMAGE_ROLE. Setting to unset"
        INT_CDK_PULL_IMAGE_ROLE="unset"
    fi

    # shellcheck disable=SC2016
    INT_CDK_PUSH_IMAGE_ROLE=$(aws cloudformation list-exports \
        --profile prescription-int \
        --query 'Exports[?Name==`ci-resources:CDKPushImageRole`].Value' \
        --output text)    

    if [ -z "${INT_CDK_PUSH_IMAGE_ROLE}" ]; then
        echo "Can not get INT_CDK_PUSH_IMAGE_ROLE. Setting to unset"
        INT_CDK_PUSH_IMAGE_ROLE="unset"
    fi
}

get_prod_roles() {
    # shellcheck disable=SC2016
    PROD_CLOUD_FORMATION_DEPLOY_ROLE=$(aws cloudformation list-exports \
        --profile prescription-prod \
        --query 'Exports[?Name==`ci-resources:CloudFormationDeployRole`].Value' \
        --output text)

    if [ -z "${PROD_CLOUD_FORMATION_DEPLOY_ROLE}" ]; then
        echo "Can not get PROD_CLOUD_FORMATION_DEPLOY_ROLE. Check you are logged into aws using make aws-login and you have prescription-prod profile set up"
        exit 1
    fi

    # shellcheck disable=SC2016
    PROD_CLOUD_FORMATION_CHECK_VERSION_ROLE=$(aws cloudformation list-exports \
        --profile prescription-prod \
        --query 'Exports[?Name==`ci-resources:CloudFormationCheckVersionRole`].Value' \
        --output text)

    if [ -z "${PROD_CLOUD_FORMATION_CHECK_VERSION_ROLE}" ]; then
        echo "Can not get PROD_CLOUD_FORMATION_CHECK_VERSION_ROLE. Setting to PROD_CLOUD_FORMATION_DEPLOY_ROLE"
        PROD_CLOUD_FORMATION_CHECK_VERSION_ROLE=${PROD_CLOUD_FORMATION_DEPLOY_ROLE}
    fi

    # shellcheck disable=SC2016
    PROD_CLOUD_FORMATION_CREATE_CHANGESET_ROLE=$(aws cloudformation list-exports \
        --profile prescription-prod \
        --query 'Exports[?Name==`ci-resources:CloudFormationPrepareChangesetRole`].Value' \
        --output text)

    if [ -z "${PROD_CLOUD_FORMATION_CREATE_CHANGESET_ROLE}" ]; then
        echo "Can not get PROD_CLOUD_FORMATION_CREATE_CHANGESET_ROLE. Setting to PROD_CLOUD_FORMATION_DEPLOY_ROLE"
        PROD_CLOUD_FORMATION_CREATE_CHANGESET_ROLE=${PROD_CLOUD_FORMATION_DEPLOY_ROLE}
    fi

    # shellcheck disable=SC2016
    PROXYGEN_PTL_ROLE=$(aws cloudformation list-exports \
        --profile prescription-prod \
        --query 'Exports[?Name==`ci-resources:ProxygenPTLRole`].Value' \
        --output text)    

    if [ -z "${PROXYGEN_PTL_ROLE}" ]; then
        echo "Can not get PROXYGEN_PTL_ROLE. Setting to PROXYGEN_PTL_ROLE"
        PROXYGEN_PTL_ROLE="unset"
    fi

    # shellcheck disable=SC2016
    PROXYGEN_PROD_ROLE=$(aws cloudformation list-exports \
        --profile prescription-prod \
        --query 'Exports[?Name==`ci-resources:ProxygenProdRole`].Value' \
        --output text)    

    if [ -z "${PROXYGEN_PROD_ROLE}" ]; then
        echo "Can not get PROXYGEN_PROD_ROLE. Setting to PROXYGEN_PROD_ROLE"
        PROXYGEN_PROD_ROLE="unset"
    fi

    # shellcheck disable=SC2016
    PROD_CDK_PULL_IMAGE_ROLE=$(aws cloudformation list-exports \
        --profile prescription-prod \
        --query 'Exports[?Name==`ci-resources:CDKPullImageRole`].Value' \
        --output text)    

    if [ -z "${PROD_CDK_PULL_IMAGE_ROLE}" ]; then
        echo "Can not get PROD_CDK_PULL_IMAGE_ROLE. Setting to unset"
        PROD_CDK_PULL_IMAGE_ROLE="unset"
    fi

    # shellcheck disable=SC2016
    PROD_CDK_PUSH_IMAGE_ROLE=$(aws cloudformation list-exports \
        --profile prescription-prod \
        --query 'Exports[?Name==`ci-resources:CDKPushImageRole`].Value' \
        --output text)    

    if [ -z "${PROD_CDK_PUSH_IMAGE_ROLE}" ]; then
        echo "Can not get PROD_CDK_PUSH_IMAGE_ROLE. Setting to unset"
        PROD_CDK_PUSH_IMAGE_ROLE="unset"
    fi
}

get_gh_details() {
    GITHUB_ADMIN_GROUP=$(gh api -H "Accept: application/vnd.github+json" -X GET /orgs/NHSDigital/teams/eps-administrators --jq ".id")
    GITHUB_TESTERS_GROUP=$(gh api -H "Accept: application/vnd.github+json" -X GET /orgs/NHSDigital/teams/eps-testers --jq ".id")
    GITHUB_DEV_GROUP=$(gh api -H "Accept: application/vnd.github+json" -X GET /orgs/NHSDigital/teams/EPS --jq ".id")
}

set_repository_secret() {
    repo=$1
    secret_name=$2
    secret_value=$3
    app=$4
    if [ -z "${secret_value}" ]; then
        echo "value passed for secret ${secret_name} is unset or set to the empty string. Not setting"
        return 0
    fi
    echo
    echo "*****************************************"
    echo
    echo "setting value for ${secret_name} for ${app}"
    gh secret set "${secret_name}" \
        --repo "${repo}" \
        --app "${app}" \
        --body "${secret_value}"
    # sleep to avoid hitting rate limits
    sleep 1
}

set_secrets() {
    REPO=$1
    echo "Setting secrets in ${REPO}"
    echo

    if ! gh secret list --repo "${REPO}" >/dev/null 2>&1; then
        echo "Can not list secrets in repo. Check permissions"
        exit 1
    fi

    # for dev secrets, we need to set for actions and dependabot so dependabot pull requests work
    set_repository_secret "${REPO}" \
        REGRESSION_TESTS_PEM \
        "${REGRESSION_TESTS_PEM}" \
        actions

    set_repository_secret "${REPO}" \
        REGRESSION_TESTS_PEM \
        "${REGRESSION_TESTS_PEM}" \
        dependabot

    set_repository_secret "${REPO}" \
        AUTOMERGE_PEM \
        "${REGRESSION_TESTS_PEM}" \
        actions

    set_repository_secret "${REPO}" \
        AUTOMERGE_PEM \
        "${REGRESSION_TESTS_PEM}" \
        dependabot

    set_repository_secret "${REPO}" \
        AUTOMERGE_APP_ID \
        420347 \
        actions

    set_repository_secret "${REPO}" \
        AUTOMERGE_APP_ID \
        420347 \
        dependabot

    set_repository_secret "${REPO}" \
        DEV_CLOUD_FORMATION_DEPLOY_ROLE \
        "$DEV_CLOUD_FORMATION_DEPLOY_ROLE" \
        actions

    set_repository_secret "${REPO}" \
        DEV_CLOUD_FORMATION_DEPLOY_ROLE \
        "$DEV_CLOUD_FORMATION_DEPLOY_ROLE" \
        dependabot

    set_repository_secret "${REPO}" \
        DEV_CLOUD_FORMATION_CHECK_VERSION_ROLE \
        "$DEV_CLOUD_FORMATION_CHECK_VERSION_ROLE" \
        actions

    set_repository_secret "${REPO}" \
        DEV_CLOUD_FORMATION_CHECK_VERSION_ROLE \
        "$DEV_CLOUD_FORMATION_CHECK_VERSION_ROLE" \
        dependabot

    set_repository_secret "${REPO}" \
        DEV_CLOUD_FORMATION_CREATE_CHANGESET_ROLE \
        "$DEV_CLOUD_FORMATION_CREATE_CHANGESET_ROLE" \
        actions

    set_repository_secret "${REPO}" \
        DEV_CLOUD_FORMATION_CREATE_CHANGESET_ROLE \
        "$DEV_CLOUD_FORMATION_CREATE_CHANGESET_ROLE" \
        dependabot

    set_repository_secret "${REPO}" \
        DEV_CLOUD_FORMATION_EXECUTE_LAMBDA_ROLE \
        "$DEV_CLOUD_FORMATION_EXECUTE_LAMBDA_ROLE" \
        actions

    set_repository_secret "${REPO}" \
        DEV_CDK_PULL_IMAGE_ROLE \
        "$DEV_CDK_PULL_IMAGE_ROLE" \
        actions

    set_repository_secret "${REPO}" \
        DEV_CDK_PULL_IMAGE_ROLE \
        "$DEV_CDK_PULL_IMAGE_ROLE" \
        dependabot

    set_repository_secret "${REPO}" \
        DEV_CDK_PUSH_IMAGE_ROLE \
        "$DEV_CDK_PUSH_IMAGE_ROLE" \
        actions


    # set int secrets
    set_repository_secret "${REPO}" \
        INT_CLOUD_FORMATION_DEPLOY_ROLE \
        "$INT_CLOUD_FORMATION_DEPLOY_ROLE" \
        actions

    set_repository_secret "${REPO}" \
        INT_CLOUD_FORMATION_CHECK_VERSION_ROLE \
        "$INT_CLOUD_FORMATION_CHECK_VERSION_ROLE" \
        actions

    set_repository_secret "${REPO}" \
        INT_CLOUD_FORMATION_CREATE_CHANGESET_ROLE \
        "$INT_CLOUD_FORMATION_CREATE_CHANGESET_ROLE" \
        actions

    set_repository_secret "${REPO}" \
        INT_CDK_PULL_IMAGE_ROLE \
        "$INT_CDK_PULL_IMAGE_ROLE" \
        actions

    set_repository_secret "${REPO}" \
        INT_CDK_PUSH_IMAGE_ROLE \
        "$INT_CDK_PUSH_IMAGE_ROLE" \
        actions


    # set prod secrets
    set_repository_secret "${REPO}" \
        PROD_CLOUD_FORMATION_DEPLOY_ROLE \
        "$PROD_CLOUD_FORMATION_DEPLOY_ROLE" \
        actions

    set_repository_secret "${REPO}" \
        PROD_CLOUD_FORMATION_CHECK_VERSION_ROLE \
        "$PROD_CLOUD_FORMATION_CHECK_VERSION_ROLE" \
        actions

    set_repository_secret "${REPO}" \
        PROD_CLOUD_FORMATION_CREATE_CHANGESET_ROLE \
        "$PROD_CLOUD_FORMATION_CREATE_CHANGESET_ROLE" \
        actions

    set_repository_secret "${REPO}" \
        PROD_CDK_PULL_IMAGE_ROLE \
        "$PROD_CDK_PULL_IMAGE_ROLE" \
        actions

    set_repository_secret "${REPO}" \
        PROD_CDK_PUSH_IMAGE_ROLE \
        "$PROD_CDK_PUSH_IMAGE_ROLE" \
        actions


    # set qa secrets
    set_repository_secret "${REPO}" \
        QA_CLOUD_FORMATION_DEPLOY_ROLE \
        "$QA_CLOUD_FORMATION_DEPLOY_ROLE" \
        actions

    set_repository_secret "${REPO}" \
        QA_CLOUD_FORMATION_CHECK_VERSION_ROLE \
        "$QA_CLOUD_FORMATION_CHECK_VERSION_ROLE" \
        actions

    set_repository_secret "${REPO}" \
        QA_CLOUD_FORMATION_CREATE_CHANGESET_ROLE \
        "$QA_CLOUD_FORMATION_CREATE_CHANGESET_ROLE" \
        actions

    set_repository_secret "${REPO}" \
        QA_CDK_PULL_IMAGE_ROLE \
        "$QA_CDK_PULL_IMAGE_ROLE" \
        actions

    set_repository_secret "${REPO}" \
        QA_CDK_PUSH_IMAGE_ROLE \
        "$QA_CDK_PUSH_IMAGE_ROLE" \
        actions


    # set ref secrets
    set_repository_secret "${REPO}" \
        REF_CLOUD_FORMATION_DEPLOY_ROLE \
        "$REF_CLOUD_FORMATION_DEPLOY_ROLE" \
        actions

    set_repository_secret "${REPO}" \
        REF_CLOUD_FORMATION_CHECK_VERSION_ROLE \
        "$REF_CLOUD_FORMATION_CHECK_VERSION_ROLE" \
        actions

    set_repository_secret "${REPO}" \
        REF_CLOUD_FORMATION_CREATE_CHANGESET_ROLE \
        "$REF_CLOUD_FORMATION_CREATE_CHANGESET_ROLE" \
        actions

    set_repository_secret "${REPO}" \
        REF_CDK_PULL_IMAGE_ROLE \
        "$REF_CDK_PULL_IMAGE_ROLE" \
        actions

    set_repository_secret "${REPO}" \
        REF_CDK_PUSH_IMAGE_ROLE \
        "$REF_CDK_PUSH_IMAGE_ROLE" \
        actions


    # set proxygen secrets
    set_repository_secret "${REPO}" \
        PROXYGEN_PTL_ROLE \
        "$PROXYGEN_PTL_ROLE" \
        actions

    set_repository_secret "${REPO}" \
        PROXYGEN_PTL_ROLE \
        "$PROXYGEN_PTL_ROLE" \
        dependabot

    set_repository_secret "${REPO}" \
        PROXYGEN_PROD_ROLE \
        "$PROXYGEN_PROD_ROLE" \
        actions

    set_repository_secret "${REPO}" \
        PROXYGEN_PROD_ROLE \
        "$PROXYGEN_PROD_ROLE" \
        dependabot


    echo "setting environments"

    if [ "$REPO" = "NHSDigital/electronic-prescription-service-account-resources" ]; then
        # dev has no protection
        sleep 1
        gh api --method PUT -H "Accept: application/vnd.github+json" "repos/${REPO}/environments/dev-ci"
        sleep 1
        gh api --method PUT -H "Accept: application/vnd.github+json" "repos/${REPO}/environments/dev-account"
        sleep 1
        gh api --method PUT -H "Accept: application/vnd.github+json" "repos/${REPO}/environments/dev-lambda"

        # qa allows admins and devs
        sleep 1
        jq -n   --argjson GITHUB_ADMIN_GROUP "${GITHUB_ADMIN_GROUP}" \
                --argjson GITHUB_DEV_GROUP "${GITHUB_DEV_GROUP}" \
            '{"prevent_self_review":false,"reviewers":[{"type":"Team","id":$GITHUB_ADMIN_GROUP}, {"type":"Team","id":$GITHUB_DEV_GROUP}], "deployment_branch_policy":{"protected_branches":true,"custom_branch_policies":false}}' | \
            gh api -H "Accept: application/vnd.github+json" -X PUT "/repos/${REPO}/environments/qa-ci" --input -
        sleep 1
        jq -n   --argjson GITHUB_ADMIN_GROUP "${GITHUB_ADMIN_GROUP}" \
                --argjson GITHUB_DEV_GROUP "${GITHUB_DEV_GROUP}" \
            '{"prevent_self_review":false,"reviewers":[{"type":"Team","id":$GITHUB_ADMIN_GROUP}, {"type":"Team","id":$GITHUB_DEV_GROUP}], "deployment_branch_policy":{"protected_branches":true,"custom_branch_policies":false}}' | \
            gh api -H "Accept: application/vnd.github+json" -X PUT "/repos/${REPO}/environments/qa-account" --input -
        sleep 1
        jq -n   --argjson GITHUB_ADMIN_GROUP "${GITHUB_ADMIN_GROUP}" \
                --argjson GITHUB_DEV_GROUP "${GITHUB_DEV_GROUP}" \
            '{"prevent_self_review":false,"reviewers":[{"type":"Team","id":$GITHUB_ADMIN_GROUP}, {"type":"Team","id":$GITHUB_DEV_GROUP}], "deployment_branch_policy":{"protected_branches":true,"custom_branch_policies":false}}' | \
            gh api -H "Accept: application/vnd.github+json" -X PUT "/repos/${REPO}/environments/qa-lambda" --input -

        # ref allows admins and devs
        sleep 1
        jq -n   --argjson GITHUB_ADMIN_GROUP "${GITHUB_ADMIN_GROUP}" \
                --argjson GITHUB_DEV_GROUP "${GITHUB_DEV_GROUP}" \
            '{"prevent_self_review":false,"reviewers":[{"type":"Team","id":$GITHUB_ADMIN_GROUP}, {"type":"Team","id":$GITHUB_DEV_GROUP}], "deployment_branch_policy":{"protected_branches":true,"custom_branch_policies":false}}' | \
            gh api -H "Accept: application/vnd.github+json" -X PUT "/repos/${REPO}/environments/ref-ci" --input -
        sleep 1
        jq -n   --argjson GITHUB_ADMIN_GROUP "${GITHUB_ADMIN_GROUP}" \
                --argjson GITHUB_DEV_GROUP "${GITHUB_DEV_GROUP}" \
            '{"prevent_self_review":false,"reviewers":[{"type":"Team","id":$GITHUB_ADMIN_GROUP}, {"type":"Team","id":$GITHUB_DEV_GROUP}], "deployment_branch_policy":{"protected_branches":true,"custom_branch_policies":false}}' | \
            gh api -H "Accept: application/vnd.github+json" -X PUT "/repos/${REPO}/environments/ref-account" --input -
        sleep 1
        jq -n   --argjson GITHUB_ADMIN_GROUP "${GITHUB_ADMIN_GROUP}" \
                --argjson GITHUB_DEV_GROUP "${GITHUB_DEV_GROUP}" \
            '{"prevent_self_review":false,"reviewers":[{"type":"Team","id":$GITHUB_ADMIN_GROUP}, {"type":"Team","id":$GITHUB_DEV_GROUP}], "deployment_branch_policy":{"protected_branches":true,"custom_branch_policies":false}}' | \
            gh api -H "Accept: application/vnd.github+json" -X PUT "/repos/${REPO}/environments/ref-lambda" --input -

        # int allows admins and devs
        sleep 1
        jq -n   --argjson GITHUB_ADMIN_GROUP "${GITHUB_ADMIN_GROUP}" \
                --argjson GITHUB_DEV_GROUP "${GITHUB_DEV_GROUP}" \
            '{"prevent_self_review":false,"reviewers":[{"type":"Team","id":$GITHUB_ADMIN_GROUP}, {"type":"Team","id":$GITHUB_DEV_GROUP}], "deployment_branch_policy":{"protected_branches":true,"custom_branch_policies":false}}' | \
            gh api -H "Accept: application/vnd.github+json" -X PUT "/repos/${REPO}/environments/int-ci" --input -
        sleep 1
        jq -n   --argjson GITHUB_ADMIN_GROUP "${GITHUB_ADMIN_GROUP}" \
                --argjson GITHUB_DEV_GROUP "${GITHUB_DEV_GROUP}" \
            '{"prevent_self_review":false,"reviewers":[{"type":"Team","id":$GITHUB_ADMIN_GROUP}, {"type":"Team","id":$GITHUB_DEV_GROUP}], "deployment_branch_policy":{"protected_branches":true,"custom_branch_policies":false}}' | \
            gh api -H "Accept: application/vnd.github+json" -X PUT "/repos/${REPO}/environments/int-account" --input -
        sleep 1
        jq -n   --argjson GITHUB_ADMIN_GROUP "${GITHUB_ADMIN_GROUP}" \
                --argjson GITHUB_DEV_GROUP "${GITHUB_DEV_GROUP}" \
            '{"prevent_self_review":false,"reviewers":[{"type":"Team","id":$GITHUB_ADMIN_GROUP}, {"type":"Team","id":$GITHUB_DEV_GROUP}], "deployment_branch_policy":{"protected_branches":true,"custom_branch_policies":false}}' | \
            gh api -H "Accept: application/vnd.github+json" -X PUT "/repos/${REPO}/environments/int-lambda" --input -

        # prod only allows admins
        sleep 1
        jq -n   --argjson GITHUB_ADMIN_GROUP "${GITHUB_ADMIN_GROUP}" \
            '{"prevent_self_review":false,"reviewers":[{"type":"Team","id":$GITHUB_ADMIN_GROUP}], "deployment_branch_policy":{"protected_branches":true,"custom_branch_policies":false}}' | \
            gh api -H "Accept: application/vnd.github+json" -X PUT "/repos/${REPO}/environments/prod-ci" --input -
        sleep 1
        jq -n   --argjson GITHUB_ADMIN_GROUP "${GITHUB_ADMIN_GROUP}" \
            '{"prevent_self_review":false,"reviewers":[{"type":"Team","id":$GITHUB_ADMIN_GROUP}], "deployment_branch_policy":{"protected_branches":true,"custom_branch_policies":false}}' | \
            gh api -H "Accept: application/vnd.github+json" -X PUT "/repos/${REPO}/environments/prod-account" --input -
        sleep 1
        jq -n   --argjson GITHUB_ADMIN_GROUP "${GITHUB_ADMIN_GROUP}" \
            '{"prevent_self_review":false,"reviewers":[{"type":"Team","id":$GITHUB_ADMIN_GROUP}], "deployment_branch_policy":{"protected_branches":true,"custom_branch_policies":false}}' | \
            gh api -H "Accept: application/vnd.github+json" -X PUT "/repos/${REPO}/environments/prod-lamdbda" --input -

    else
        # dev has no protection
        sleep 1
        gh api --method PUT -H "Accept: application/vnd.github+json" "repos/${REPO}/environments/dev"

        # dev-pr has no protection
        sleep 1
        gh api --method PUT -H "Accept: application/vnd.github+json" "repos/${REPO}/environments/dev-pr"

        # qa allows admins and devs
        sleep 1
        jq -n   --argjson GITHUB_ADMIN_GROUP "${GITHUB_ADMIN_GROUP}" \
                --argjson GITHUB_DEV_GROUP "${GITHUB_DEV_GROUP}" \
            '{"prevent_self_review":false,"reviewers":[{"type":"Team","id":$GITHUB_ADMIN_GROUP}, {"type":"Team","id":$GITHUB_DEV_GROUP}], "deployment_branch_policy":{"protected_branches":true,"custom_branch_policies":false}}' | \
            gh api -H "Accept: application/vnd.github+json" -X PUT "/repos/${REPO}/environments/qa" --input -

        # ref allows admins and devs
        sleep 1
        jq -n   --argjson GITHUB_ADMIN_GROUP "${GITHUB_ADMIN_GROUP}" \
                --argjson GITHUB_DEV_GROUP "${GITHUB_DEV_GROUP}" \
            '{"prevent_self_review":false,"reviewers":[{"type":"Team","id":$GITHUB_ADMIN_GROUP}, {"type":"Team","id":$GITHUB_DEV_GROUP}], "deployment_branch_policy":{"protected_branches":true,"custom_branch_policies":false}}' | \
            gh api -H "Accept: application/vnd.github+json" -X PUT "/repos/${REPO}/environments/ref" --input -

        # int allows admins and devs
        sleep 1
        jq -n   --argjson GITHUB_ADMIN_GROUP "${GITHUB_ADMIN_GROUP}" \
                --argjson GITHUB_DEV_GROUP "${GITHUB_DEV_GROUP}" \
            '{"prevent_self_review":false,"reviewers":[{"type":"Team","id":$GITHUB_ADMIN_GROUP}, {"type":"Team","id":$GITHUB_DEV_GROUP}], "deployment_branch_policy":{"protected_branches":true,"custom_branch_policies":false}}' | \
            gh api -H "Accept: application/vnd.github+json" -X PUT "/repos/${REPO}/environments/int" --input -

        # prod only allows admins
        sleep 1
        jq -n   --argjson GITHUB_ADMIN_GROUP "${GITHUB_ADMIN_GROUP}" \
            '{"prevent_self_review":false,"reviewers":[{"type":"Team","id":$GITHUB_ADMIN_GROUP}], "deployment_branch_policy":{"protected_branches":true,"custom_branch_policies":false}}' | \
            gh api -H "Accept: application/vnd.github+json" -X PUT "/repos/${REPO}/environments/prod" --input -

    fi
}

set_artillery_secrets() {
    REPO=$1
    echo "Setting secrets in ${REPO}"
    echo

    if ! gh secret list --repo "${REPO}" >/dev/null 2>&1; then
        echo "Can not list secrets in repo. Check permissions"
        exit 1
    fi

    # for dev secrets, we need to set for actions and dependabot so dependabot pull requests work
    set_repository_secret "${REPO}" \
        DEV_ARTILLERY_RUNNER_ROLE \
        "$DEV_ARTILLERY_RUNNER_ROLE" \
        actions

    set_repository_secret "${REPO}" \
        DEV_ARTILLERY_RUNNER_ROLE \
        "$DEV_ARTILLERY_RUNNER_ROLE" \
        dependabot

    set_repository_secret "${REPO}" \
        REF_ARTILLERY_RUNNER_ROLE \
        "$REF_ARTILLERY_RUNNER_ROLE" \
        actions
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

echo "Getting github details"
get_gh_details

REGRESSION_TESTS_PEM=$(cat .secrets/regression_test_app.pem)
AUTOMERGE_PEM=$(cat .secrets/automerge.pem)

echo
echo "************************************************"
echo

echo "DEV_CLOUD_FORMATION_DEPLOY_ROLE:            ${DEV_CLOUD_FORMATION_DEPLOY_ROLE}"
echo "DEV_CLOUD_FORMATION_CHECK_VERSION_ROLE:     ${DEV_CLOUD_FORMATION_CHECK_VERSION_ROLE}"
echo "DEV_CLOUD_FORMATION_EXECUTE_LAMBDA_ROLE:    ${DEV_CLOUD_FORMATION_EXECUTE_LAMBDA_ROLE}"
echo "DEV_CLOUD_FORMATION_CREATE_CHANGESET_ROLE:  ${DEV_CLOUD_FORMATION_CREATE_CHANGESET_ROLE}"
echo "DEV_ARTILLERY_RUNNER_ROLE:                  ${DEV_ARTILLERY_RUNNER_ROLE}"
echo "DEV_CDK_PULL_IMAGE_ROLE:                    ${DEV_CDK_PULL_IMAGE_ROLE}"
echo "DEV_CDK_PUSH_IMAGE_ROLE:                    ${DEV_CDK_PUSH_IMAGE_ROLE}"
echo

echo "REF_CLOUD_FORMATION_DEPLOY_ROLE:            ${REF_CLOUD_FORMATION_DEPLOY_ROLE}"
echo "REF_CLOUD_FORMATION_CHECK_VERSION_ROLE:     ${REF_CLOUD_FORMATION_CHECK_VERSION_ROLE}"
echo "REF_CLOUD_FORMATION_CREATE_CHANGESET_ROLE:  ${REF_CLOUD_FORMATION_CREATE_CHANGESET_ROLE}"
echo "REF_ARTILLERY_RUNNER_ROLE:                  ${REF_ARTILLERY_RUNNER_ROLE}"
echo "REF_CDK_PULL_IMAGE_ROLE:                    ${REF_CDK_PULL_IMAGE_ROLE}"
echo "REF_CDK_PUSH_IMAGE_ROLE:                    ${REF_CDK_PUSH_IMAGE_ROLE}"
echo

echo "QA_CLOUD_FORMATION_DEPLOY_ROLE:             ${QA_CLOUD_FORMATION_DEPLOY_ROLE}"
echo "QA_CLOUD_FORMATION_CHECK_VERSION_ROLE:      ${QA_CLOUD_FORMATION_CHECK_VERSION_ROLE}"
echo "QA_CLOUD_FORMATION_CREATE_CHANGESET_ROLE:   ${QA_CLOUD_FORMATION_CREATE_CHANGESET_ROLE}"
echo "QA_CDK_PULL_IMAGE_ROLE:                     ${QA_CDK_PULL_IMAGE_ROLE}"
echo "QA_CDK_PUSH_IMAGE_ROLE:                     ${QA_CDK_PUSH_IMAGE_ROLE}"
echo

echo "INT_CLOUD_FORMATION_DEPLOY_ROLE:            ${INT_CLOUD_FORMATION_DEPLOY_ROLE}"
echo "INT_CLOUD_FORMATION_CHECK_VERSION_ROLE:     ${INT_CLOUD_FORMATION_CHECK_VERSION_ROLE}"
echo "INT_CLOUD_FORMATION_CREATE_CHANGESET_ROLE:  ${INT_CLOUD_FORMATION_CREATE_CHANGESET_ROLE}"
echo "INT_CDK_PULL_IMAGE_ROLE:                    ${INT_CDK_PULL_IMAGE_ROLE}"
echo "INT_CDK_PUSH_IMAGE_ROLE:                    ${INT_CDK_PUSH_IMAGE_ROLE}"
echo

echo "PROD_CLOUD_FORMATION_DEPLOY_ROLE:           ${PROD_CLOUD_FORMATION_DEPLOY_ROLE}"
echo "PROD_CLOUD_FORMATION_CHECK_VERSION_ROLE:    ${PROD_CLOUD_FORMATION_CHECK_VERSION_ROLE}"
echo "PROD_CLOUD_FORMATION_CREATE_CHANGESET_ROLE: ${PROD_CLOUD_FORMATION_CREATE_CHANGESET_ROLE}"
echo "PROD_CDK_PULL_IMAGE_ROLE:                   ${PROD_CDK_PULL_IMAGE_ROLE}"
echo "PROD_CDK_PUSH_IMAGE_ROLE:                   ${PROD_CDK_PUSH_IMAGE_ROLE}"
echo

echo "GITHUB  eps-administrators GROUP ID:        ${GITHUB_ADMIN_GROUP}"
echo "GITHUB  eps-testers GROUP ID:               ${GITHUB_TESTERS_GROUP}"
echo "GITHUB  EPS GROUP ID:                       ${GITHUB_DEV_GROUP}"

echo
echo "REGRESSION_TESTS_PEM: ${REGRESSION_TESTS_PEM}"
echo
echo "AUTOMERGE_PEM: ${AUTOMERGE_PEM}"

read -r -p "Press Enter to start setting secrets or ctrl+c to exit"

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
set_secrets "NHSDigital/eps-prescription-status-update-api"
echo
set_secrets "NHSDigital/eps-FHIR-validator-lambda"
echo
set_secrets "NHSDigital/eps-dynamodb-poc"
echo
set_secrets "NHSDigital/eps-load-test"
echo
set_artillery_secrets "NHSDigital/eps-load-test"
echo
set_secrets "NHSDigital/eps-prescription-tracker-ui"
echo
set_secrets "NHSDigital/eps-aws-dashboards"
echo
set_secrets "NHSDigital/eps-cdk-utils"
echo
set_secrets "NHSDigital/eps-vpc-resources"
echo
set_secrets "NHSDigital/eps-storage-resources"
echo

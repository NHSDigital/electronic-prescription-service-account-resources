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

    DEV_ARTILLERY_RUNNER_ROLE=$(aws cloudformation list-exports \
        --profile prescription-dev \
        --query 'Exports[?Name==`ci-resources:ArtilleryRunnerRole`].Value' \
        --output text)    

    if [ -z "${DEV_ARTILLERY_RUNNER_ROLE}" ]; then
        echo "Can not get DEV_ARTILLERY_RUNNER_ROLE. Setting to unset"
        DEV_ARTILLERY_RUNNER_ROLE="unset"
    fi

    DEV_CDK_PULL_IMAGE_ROLE=$(aws cloudformation list-exports \
        --profile prescription-dev \
        --query 'Exports[?Name==`ci-resources:CDKPullImageRole`].Value' \
        --output text)    

    if [ -z "${DEV_CDK_PULL_IMAGE_ROLE}" ]; then
        echo "Can not get DEV_CDK_PULL_IMAGE_ROLE. Setting to unset"
        DEV_CDK_PULL_IMAGE_ROLE="unset"
    fi

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

    REF_ARTILLERY_RUNNER_ROLE=$(aws cloudformation list-exports \
        --profile prescription-ref \
        --query 'Exports[?Name==`ci-resources:ArtilleryRunnerRole`].Value' \
        --output text)    

    if [ -z "${REF_ARTILLERY_RUNNER_ROLE}" ]; then
        echo "Can not get REF_ARTILLERY_RUNNER_ROLE. Setting to unset"
        REF_ARTILLERY_RUNNER_ROLE="unset"
    fi

    REF_CDK_PULL_IMAGE_ROLE=$(aws cloudformation list-exports \
        --profile prescription-ref \
        --query 'Exports[?Name==`ci-resources:CDKPullImageRole`].Value' \
        --output text)    

    if [ -z "${REF_CDK_PULL_IMAGE_ROLE}" ]; then
        echo "Can not get REF_CDK_PULL_IMAGE_ROLE. Setting to unset"
        REF_CDK_PULL_IMAGE_ROLE="unset"
    fi

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

    QA_CDK_PULL_IMAGE_ROLE=$(aws cloudformation list-exports \
        --profile prescription-qa \
        --query 'Exports[?Name==`ci-resources:CDKPullImageRole`].Value' \
        --output text)    

    if [ -z "${QA_CDK_PULL_IMAGE_ROLE}" ]; then
        echo "Can not get QA_CDK_PULL_IMAGE_ROLE. Setting to unset"
        QA_CDK_PULL_IMAGE_ROLE="unset"
    fi

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

    INT_CDK_PULL_IMAGE_ROLE=$(aws cloudformation list-exports \
        --profile prescription-int \
        --query 'Exports[?Name==`ci-resources:CDKPullImageRole`].Value' \
        --output text)    

    if [ -z "${INT_CDK_PULL_IMAGE_ROLE}" ]; then
        echo "Can not get INT_CDK_PULL_IMAGE_ROLE. Setting to unset"
        INT_CDK_PULL_IMAGE_ROLE="unset"
    fi

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

    PROXYGEN_PTL_ROLE=$(aws cloudformation list-exports \
        --profile prescription-prod \
        --query 'Exports[?Name==`ci-resources:ProxygenPTLRole`].Value' \
        --output text)    

    if [ -z "${PROXYGEN_PTL_ROLE}" ]; then
        echo "Can not get PROXYGEN_PTL_ROLE. Setting to PROXYGEN_PTL_ROLE"
        PROXYGEN_PTL_ROLE=${PROXYGEN_PTL_ROLE}
    fi

    PROXYGEN_PROD_ROLE=$(aws cloudformation list-exports \
        --profile prescription-prod \
        --query 'Exports[?Name==`ci-resources:ProxygenProdRole`].Value' \
        --output text)    

    if [ -z "${PROXYGEN_PROD_ROLE}" ]; then
        echo "Can not get PROXYGEN_PROD_ROLE. Setting to PROXYGEN_PROD_ROLE"
        PROXYGEN_PTL_ROLE=${PROXYGEN_PROD_ROLE}
    fi

    PROD_CDK_PULL_IMAGE_ROLE=$(aws cloudformation list-exports \
        --profile prescription-prod \
        --query 'Exports[?Name==`ci-resources:CDKPullImageRole`].Value' \
        --output text)    

    if [ -z "${PROD_CDK_PULL_IMAGE_ROLE}" ]; then
        echo "Can not get PROD_CDK_PULL_IMAGE_ROLE. Setting to unset"
        PROD_CDK_PULL_IMAGE_ROLE="unset"
    fi

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

    echo "setting DEV_CDK_PULL_IMAGE_ROLE for actions"
    gh secret set DEV_CDK_PULL_IMAGE_ROLE \
        --repo ${REPO} \
        --app actions \
        --body "$DEV_CDK_PULL_IMAGE_ROLE"

    echo "setting DEV_CDK_PULL_IMAGE_ROLE for dependabot"
    gh secret set DEV_CDK_PULL_IMAGE_ROLE \
        --repo ${REPO} \
        --app dependabot \
        --body "$DEV_CDK_PULL_IMAGE_ROLE"

    echo "setting DEV_CDK_PUSH_IMAGE_ROLE for actions"
    gh secret set DEV_CDK_PUSH_IMAGE_ROLE \
        --repo ${REPO} \
        --app actions \
        --body "$DEV_CDK_PUSH_IMAGE_ROLE"

    echo "setting DEV_CDK_PUSH_IMAGE_ROLE for dependabot"
    gh secret set DEV_CDK_PUSH_IMAGE_ROLE \
        --repo ${REPO} \
        --app dependabot \
        --body "$DEV_CDK_PUSH_IMAGE_ROLE"

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

    echo "setting INT_CDK_PULL_IMAGE_ROLE for actions"
    gh secret set INT_CDK_PULL_IMAGE_ROLE \
        --repo ${REPO} \
        --app actions \
        --body "$INT_CDK_PULL_IMAGE_ROLE"

    echo "setting INT_CDK_PUSH_IMAGE_ROLE for actions"
    gh secret set INT_CDK_PUSH_IMAGE_ROLE \
        --repo ${REPO} \
        --app actions \
        --body "$INT_CDK_PUSH_IMAGE_ROLE"

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

    echo "setting PROD_CDK_PULL_IMAGE_ROLE for actions"
    gh secret set PROD_CDK_PULL_IMAGE_ROLE \
        --repo ${REPO} \
        --app actions \
        --body "$PROD_CDK_PULL_IMAGE_ROLE"

    echo "setting PROD_CDK_PUSH_IMAGE_ROLE for actions"
    gh secret set PROD_CDK_PUSH_IMAGE_ROLE \
        --repo ${REPO} \
        --app actions \
        --body "$PROD_CDK_PUSH_IMAGE_ROLE"

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

    echo "setting QA_CDK_PULL_IMAGE_ROLE for actions"
    gh secret set QA_CDK_PULL_IMAGE_ROLE \
        --repo ${REPO} \
        --app actions \
        --body "$QA_CDK_PULL_IMAGE_ROLE"

    echo "setting QA_CDK_PUSH_IMAGE_ROLE for actions"
    gh secret set QA_CDK_PUSH_IMAGE_ROLE \
        --repo ${REPO} \
        --app actions \
        --body "$QA_CDK_PUSH_IMAGE_ROLE"

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

    echo "setting REF_CDK_PULL_IMAGE_ROLE for actions"
    gh secret set REF_CDK_PULL_IMAGE_ROLE \
        --repo ${REPO} \
        --app actions \
        --body "$REF_CDK_PULL_IMAGE_ROLE"

    echo "setting REF_CDK_PUSH_IMAGE_ROLE for actions"
    gh secret set REF_CDK_PUSH_IMAGE_ROLE \
        --repo ${REPO} \
        --app actions \
        --body "$REF_CDK_PUSH_IMAGE_ROLE"

    # set proxygen secrets
    echo "setting PROXYGEN_PTL_ROLE for actions"
    gh secret set PROXYGEN_PTL_ROLE \
        --repo ${REPO} \
        --app actions \
        --body "$PROXYGEN_PTL_ROLE"

    echo "setting PROXYGEN_PTL_ROLE for dependabot"
    gh secret set PROXYGEN_PTL_ROLE \
        --repo ${REPO} \
        --app dependabot \
        --body "$PROXYGEN_PTL_ROLE"

    echo "setting PROXYGEN_PROD_ROLE for actions"
    gh secret set PROXYGEN_PROD_ROLE \
        --repo ${REPO} \
        --app actions \
        --body "$PROXYGEN_PROD_ROLE"

    echo "setting PROXYGEN_PROD_ROLE for dependabot"
    gh secret set PROXYGEN_PROD_ROLE \
        --repo ${REPO} \
        --app dependabot \
        --body "$PROXYGEN_PROD_ROLE"

    echo "setting envrionments"

    # dev has no protection
    gh api --method PUT -H "Accept: application/vnd.github+json" "repos/${REPO}/environments/dev"

    # dev-pr has no protection
    gh api --method PUT -H "Accept: application/vnd.github+json" "repos/${REPO}/environments/dev-pr"

    # qa allows admins and devs
    jq -n   --argjson GITHUB_ADMIN_GROUP "${GITHUB_ADMIN_GROUP}" \
            --argjson GITHUB_DEV_GROUP "${GITHUB_DEV_GROUP}" \
        '{"prevent_self_review":false,"reviewers":[{"type":"Team","id":$GITHUB_ADMIN_GROUP}, {"type":"Team","id":$GITHUB_DEV_GROUP}], "deployment_branch_policy":{"protected_branches":true,"custom_branch_policies":false}}' | \
        gh api -H "Accept: application/vnd.github+json" -X PUT "/repos/${REPO}/environments/qa" --input -

    # ref allows admins and devs
    jq -n   --argjson GITHUB_ADMIN_GROUP "${GITHUB_ADMIN_GROUP}" \
            --argjson GITHUB_DEV_GROUP "${GITHUB_DEV_GROUP}" \
        '{"prevent_self_review":false,"reviewers":[{"type":"Team","id":$GITHUB_ADMIN_GROUP}, {"type":"Team","id":$GITHUB_DEV_GROUP}], "deployment_branch_policy":{"protected_branches":true,"custom_branch_policies":false}}' | \
        gh api -H "Accept: application/vnd.github+json" -X PUT "/repos/${REPO}/environments/ref" --input -

    # int allows admins and devs
    jq -n   --argjson GITHUB_ADMIN_GROUP "${GITHUB_ADMIN_GROUP}" \
            --argjson GITHUB_DEV_GROUP "${GITHUB_DEV_GROUP}" \
        '{"prevent_self_review":false,"reviewers":[{"type":"Team","id":$GITHUB_ADMIN_GROUP}, {"type":"Team","id":$GITHUB_DEV_GROUP}], "deployment_branch_policy":{"protected_branches":true,"custom_branch_policies":false}}' | \
        gh api -H "Accept: application/vnd.github+json" -X PUT "/repos/${REPO}/environments/int" --input -

    # prod only allows admins
    jq -n   --argjson GITHUB_ADMIN_GROUP "${GITHUB_ADMIN_GROUP}" \
        '{"prevent_self_review":false,"reviewers":[{"type":"Team","id":$GITHUB_ADMIN_GROUP}], "deployment_branch_policy":{"protected_branches":true,"custom_branch_policies":false}}' | \
        gh api -H "Accept: application/vnd.github+json" -X PUT "/repos/${REPO}/environments/prod" --input -
}

set_artillery_secrets() {
    REPO=$1
    echo "Setting secrets in ${REPO}"
    echo

    if ! gh secret list --repo ${REPO} >/dev/null 2>&1; then
        echo "Can not list secrets in repo. Check permissions"
        exit 1
    fi

    # for dev secrets, we need to set for actions and dependabot so dependabot pull requests work
    echo "setting DEV_ARTILLERY_RUNNER_ROLE for actions"
    gh secret set DEV_ARTILLERY_RUNNER_ROLE \
        --repo ${REPO} \
        --app actions \
        --body "$DEV_ARTILLERY_RUNNER_ROLE"

    echo "setting DEV_ARTILLERY_RUNNER_ROLE for dependabot"
    gh secret set DEV_ARTILLERY_RUNNER_ROLE \
        --repo ${REPO} \
        --app dependabot \
        --body "$DEV_ARTILLERY_RUNNER_ROLE"

    echo "setting REF_ARTILLERY_RUNNER_ROLE for actions"
    gh secret set REF_ARTILLERY_RUNNER_ROLE \
        --repo ${REPO} \
        --app actions \
        --body "$REF_ARTILLERY_RUNNER_ROLE"
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

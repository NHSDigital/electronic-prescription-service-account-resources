#!/usr/bin/env bash
set -e

echo "$COMMIT_ID"

AWS_MAX_ATTEMPTS=10
export AWS_MAX_ATTEMPTS

CF_LONDON_EXPORTS=$(aws cloudformation list-exports --region eu-west-2 --output json)
# change this to account-resources-cdk-uk:Bucket:ArtifactsBucket:Arn once other change is merged
artifact_bucket_arn=$(echo "$CF_LONDON_EXPORTS" | \
    jq \
    --arg EXPORT_NAME "account-resources:ArtifactsBucket" \
    -r '.Exports[] | select(.Name == $EXPORT_NAME) | .Value')
artifact_bucket=$(echo "$artifact_bucket_arn" | cut -d: -f6 | cut -d/ -f1)
if [ -z "${artifact_bucket}" ]; then
    echo "could not retrieve artifact_bucket from aws cloudformation list-exports"
    exit 1
fi
export artifact_bucket

cloud_formation_execution_role=$(echo "$CF_LONDON_EXPORTS" | \
    jq \
    --arg EXPORT_NAME "iam-cdk:IAM:CloudFormationExecutionRole:Arn" \
    -r '.Exports[] | select(.Name == $EXPORT_NAME) | .Value')
if [ -z "${cloud_formation_execution_role}" ]; then
    echo "could not retrieve cloud_formation_execution_role from aws cloudformation list-exports"
    exit 1
fi
export cloud_formation_execution_role

REPO=electronic-prescription-service-account-resources
CFN_DRIFT_DETECTION_GROUP="account-resources"
if [[ "$STACK_NAME" =~ -pr-[0-9]+$ ]]; then
  CFN_DRIFT_DETECTION_GROUP="account-resources-pull-request"
fi

cd ../..

stack_status=$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --query "Stacks[0].StackStatus" --output text 2>/dev/null || echo "NOT_FOUND")
if [ "$stack_status" == "ROLLBACK_COMPLETE" ]; then
    echo "Stack $STACK_NAME is in ROLLBACK_COMPLETE status. Deleting stack..."
    aws cloudformation delete-stack --stack-name "$STACK_NAME"
    echo "Waiting for stack $STACK_NAME to be deleted..."
    aws cloudformation wait stack-delete-complete --stack-name "$STACK_NAME"
fi

sam deploy \
    --template-file "$TEMPLATE_FILE" \
    --stack-name "$STACK_NAME" \
    --capabilities CAPABILITY_NAMED_IAM CAPABILITY_AUTO_EXPAND \
    --region eu-west-2 \
    --s3-bucket "$artifact_bucket" \
    --s3-prefix "$ARTIFACT_BUCKET_PREFIX" \
    --config-file samconfig_package_and_deploy.toml \
    --no-fail-on-empty-changeset \
    --role-arn "$cloud_formation_execution_role" \
    --no-confirm-changeset \
    --force-upload \
    --tags "version=$VERSION_NUMBER stack=$STACK_NAME repo=$REPO cfnDriftDetectionGroup=$CFN_DRIFT_DETECTION_GROUP" \
    --parameter-overrides "$PARAMETERS"

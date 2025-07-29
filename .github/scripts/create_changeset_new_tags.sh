#!/usr/bin/env bash
set -e

cd ../..

AWS_MAX_ATTEMPTS=10
export AWS_MAX_ATTEMPTS
ROLE=$(aws cloudformation list-exports --output json | jq -r '.Exports[] | select(.Name == "ci-resources:CloudFormationExecutionRole") | .Value' )
if [ -z "${ROLE}" ]; then
    echo "could not retrieve ROLE from aws cloudformation list-exports"
    exit 1
fi

# wait for stack to finish creating or updating
aws cloudformation wait stack-create-complete --stack-name "$STACK_NAME" 

# if stack status is CREATE_COMPLETE then stack-update-complete will time out
status=$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --query Stacks[0].StackStatus)
if [ "${status}" != '"CREATE_COMPLETE"' ] && [ "${status}" != '"UPDATE_ROLLBACK_COMPLETE"' ]; then
  aws cloudformation wait stack-update-complete --stack-name "$STACK_NAME" 
fi

# upload file to s3
artifact_bucket=$(aws cloudformation list-exports --output json | jq -r '.Exports[] | select(.Name == "account-resources:ArtifactsBucket") | .Value' | grep -o '[^:]*$')
if [ -z "${artifact_bucket}" ]; then
    echo "could not retrieve artifact_bucket from aws cloudformation list-exports"
    exit 1
fi

target_location=account-resources/$CHANGE_SET_VERSION/new-tag/$STACK_NAME/template.yml
target_s3_location=s3://${artifact_bucket}/${target_location}
target_uri_location=https://${artifact_bucket}.s3.amazonaws.com/${target_location}
aws s3 cp "${TEMPLATE}" "${target_s3_location}"

echo "create changeset"
aws cloudformation create-change-set \
  --stack-name "$STACK_NAME" \
  --change-set-name "$STACK_NAME-$CHANGE_SET_VERSION" \
  --change-set-type UPDATE \
  --template-url "$target_uri_location" \
  --capabilities "$CAPABILITIES" \
  --parameters "file://$PARAMETERS" \
  --cli-binary-format raw-in-base64-out \
  --tags "Key=\"version\",Value=\"$VERSION\" Key=\"repo\",Value=\"account-resources\"" \
  --role-arn="$ROLE"

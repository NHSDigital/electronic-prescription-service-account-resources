#!/usr/bin/env bash

cd ../..

current_deployed_tag=$(aws cloudformation describe-stacks --stack-name  "$STACK_NAME" --query "Stacks[0].Tags[?Key=='version'].Value" --output text)
if [ "${current_deployed_tag}" == "" ]; then
  echo "Can not find target tag. Using initial tag in repo"
  export current_deployed_tag="v1.0.4-alpha"
fi

ROLE=$(aws cloudformation list-exports --output json | jq -r '.Exports[] | select(.Name == "ci-resources:CloudFormationExecutionRole") | .Value' )

# wait for stack to finish creating or updating
aws cloudformation wait stack-create-complete --stack-name "$STACK_NAME" 

# if stack status is CREATE_COMPLETE then stack-update-complete will time out
status=$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --query Stacks[0].StackStatus)
if [ "${status}" != '"CREATE_COMPLETE"' ]; then
  aws cloudformation wait stack-update-complete --stack-name "$STACK_NAME" 
fi

# upload file to s3
artifact_bucket=$(aws cloudformation list-exports --output json | jq -r '.Exports[] | select(.Name == "account-resources:ArtifactsBucket") | .Value' | grep -o '[^:]*$')
target_s3_location=s3://${artifact_bucket}/account-resources/$STACK_NAME/$CHANGE_SET_VERSION-current-tag/${TEMPLATE}
aws s3 cp "${TEMPLATE}" "${target_s3_location}"

aws cloudformation create-change-set \
  --stack-name "$STACK_NAME" \
  --change-set-name "$STACK_NAME-$CHANGE_SET_VERSION-current-tag" \
  --change-set-type UPDATE \
  --template-uri "$target_s3_location" \
  --capabilities "$CAPABILITIES" \
  --parameters "file://$PARAMETERS" \
  --cli-binary-format raw-in-base64-out \
  --tags "Key=\"version\",Value=\"${current_deployed_tag}\"" \
  --role-arn="$ROLE"

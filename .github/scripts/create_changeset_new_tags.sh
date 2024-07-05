#!/usr/bin/env bash

cd ../..

echo "role"
ROLE=$(aws cloudformation list-exports --output json | jq -r '.Exports[] | select(.Name == "ci-resources:CloudFormationExecutionRole") | .Value' )

# wait for stack to finish creating or updating
echo "waiting for create"
aws cloudformation wait stack-create-complete --stack-name "$STACK_NAME" 

# if stack status is CREATE_COMPLETE then stack-update-complete will time out
status=$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --query Stacks[0].StackStatus)
echo "$status"
if [ "${status}" != "CREATE_COMPLETE" ]; then
  echo "waiting for update"
  aws cloudformation wait stack-update-complete --stack-name "$STACK_NAME" 
fi

echo "create changeset"
aws cloudformation create-change-set \
  --stack-name "$STACK_NAME" \
  --change-set-name "$STACK_NAME-$CHANGE_SET_VERSION" \
  --change-set-type UPDATE \
  --template-body "file://$TEMPLATE" \
  --capabilities "$CAPABILITIES" \
  --parameters "file://$PARAMETERS" \
  --cli-binary-format raw-in-base64-out \
  --tags "Key=\"version\",Value=\"$VERSION\"" \
  --role-arn="$ROLE"

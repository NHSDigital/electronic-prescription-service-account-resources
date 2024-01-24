#!/usr/bin/env bash

ROLE=$(aws cloudformation list-exports --output json | jq -r '.Exports[] | select(.Name == "ci-resources:CloudFormationExecutionRole") | .Value' )

aws cloudformation create-change-set \
  --stack-name "$STACK_NAME" \
  --change-set-name "$STACK_NAME-$CHANGE_SET_VERSION" \
  --change-set-type UPDATE \
  --template-body "file://$TEMPLATE" \
  --capabilities "$CAPABILITIES" \
  --parameters "file://../.$PARAMETERS_FILE_NAME" \
  --cli-binary-format raw-in-base64-out \
  --tags "Key=\"version\",Value=\"$VERSION\"" \
  --role-arn="$ROLE"

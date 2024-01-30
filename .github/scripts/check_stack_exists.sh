#!/usr/bin/env bash

stacks=$( aws cloudformation list-stacks --query "StackSummaries[].StackName" )
stack_exists=$( grep -c "$STACK_NAME" <<< "$stacks" || true )
if [ "${stack_exists}" == "0" ]
then
  echo "Stack does not exist"
  echo "STACK_EXISTS=false" >> "$GITHUB_OUTPUT"
else
  echo "Stack does exist"
  echo "STACK_EXISTS=true" >> "$GITHUB_OUTPUT"
fi

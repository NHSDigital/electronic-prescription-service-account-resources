#!/usr/bin/env bash

aws cloudformation execute-change-set \
  --stack-name "$STACK_NAME" \
  --change-set-name "$STACK_NAME-$CHANGE_SET_VERSION"

STATUS="UPDATE_IN_PROGRESS"
while [[ "$STATUS" == "UPDATE_IN_PROGRESS" ]] || [[ "$STATUS" == "UPDATE_COMPLETE_CLEANUP_IN_PROGRESS" ]] 
do
  echo "Checking stack status..."
  STACKS=$(aws cloudformation describe-stacks --stack-name "$STACK_NAME")
  STATUS=$(jq -r '.["Stacks"][0]["StackStatus"]' <<< "$STACKS")
  if [ "$STATUS" == "UPDATE_IN_PROGRESS" ]; then
    echo "sleeping 5..."
    sleep 5
  fi
  if [ "$STATUS" == "UPDATE_COMPLETE_CLEANUP_IN_PROGRESS" ]; then
    echo "sleeping 5..."
    sleep 5
  fi
done

if [ "$STATUS" == "ROLLBACK_IN_PROGRESS " ]; then
  echo "Failed to execute change set, rollback in progress..."
  echo "$STACKS"
  exit 1
elif [ "$STATUS" == "ROLLBACK_COMPLETE  " ]; then
  echo "Failed to execute change set, rollback complete."
  echo "$STACKS"
  exit 1
elif [ "$STATUS" == "UPDATE_FAILED   " ]; then
  echo "Failed to execute change set."
  echo "$STACKS"
  exit 1
elif [ "$STATUS" == "UPDATE_ROLLBACK_IN_PROGRESS" ]; then
  echo "Failed to execute change set, rollback in progress..."
  echo "$STACKS"
  exit 1
elif [ "$STATUS" == "UPDATE_ROLLBACK_FAILED" ]; then
  echo "Failed to execute change set, rollback failed."
  echo "$STACKS"
  exit 1
elif [ "$STATUS" == "UPDATE_COMPLETE" ]; then
  echo "Execute change set comeplete."
  exit 0
fi

echo "Failed to execute change set, for unknown reason."
echo "$STACKS"
exit 1

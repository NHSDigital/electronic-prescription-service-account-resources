#!/usr/bin/env bash

# deleted stacks are included in results for 90days after deletion, this filters them out
stacks=$( aws cloudformation list-stacks --stack-status-filter CREATE_IN_PROGRESS CREATE_FAILED CREATE_COMPLETE ROLLBACK_IN_PROGRESS \
ROLLBACK_FAILED ROLLBACK_COMPLETE DELETE_IN_PROGRESS DELETE_FAILED UPDATE_IN_PROGRESS UPDATE_COMPLETE_CLEANUP_IN_PROGRESS UPDATE_COMPLETE \
UPDATE_FAILED UPDATE_ROLLBACK_IN_PROGRESS UPDATE_ROLLBACK_FAILED UPDATE_ROLLBACK_COMPLETE_CLEANUP_IN_PROGRESS  UPDATE_ROLLBACK_COMPLETE \
REVIEW_IN_PROGRESS IMPORT_IN_PROGRESS IMPORT_COMPLETE IMPORT_ROLLBACK_IN_PROGRESS IMPORT_ROLLBACK_FAILED IMPORT_ROLLBACK_COMPLETE --query "StackSummaries[].StackName" )
stack_exists=$( grep -c "$STACK_NAME" <<< "$stacks" || true )
if [ "${stack_exists}" == "0" ]
then
  echo "Stack does not exist"
  echo "STACK_EXISTS=false" >> "$GITHUB_OUTPUT"
else
  echo "Stack does exist"
  echo "STACK_EXISTS=true" >> "$GITHUB_OUTPUT"
fi

#!/usr/bin/env bash
set -e
AWS_MAX_ATTEMPTS=20
export AWS_MAX_ATTEMPTS

CF_LONDON_EXPORTS=$(aws cloudformation list-exports --region eu-west-2 --output json)
artifact_bucket_arn=$(echo "$CF_LONDON_EXPORTS" | \
    jq \
    --arg EXPORT_NAME "account-resources:ArtifactsBucket" \
    -r '.Exports[] | select(.Name == $EXPORT_NAME) | .Value')
artifact_bucket=$(echo "$artifact_bucket_arn" | cut -d: -f6 | cut -d/ -f1)
if [ -z "${artifact_bucket}" ]; then
    echo "could not retrieve artifact_bucket from aws cloudformation list-exports"
    exit 1
fi

deployment_lock_key="account-resources/${STACK_NAME}/deployment.lock"
echo "created deployment lock ${deployment_lock_key}" | aws s3 cp - "s3://$artifact_bucket/$deployment_lock_key"

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

aws s3 rm "s3://$artifact_bucket/$deployment_lock_key" || true
echo "removed deployment lock ${deployment_lock_key}"

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
  echo "Execute change set complete."
  exit 0
fi

echo "Failed to execute change set, for unknown reason."
echo "$STACKS"
exit 1

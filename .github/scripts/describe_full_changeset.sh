#!/usr/bin/env bash

STATUS="CREATE_IN_PROGRESS"
while [[ "$STATUS" == "CREATE_IN_PROGRESS" ]] 
do
  echo "Getting change set..."
  CHANGE_SET=$(aws cloudformation describe-change-set \
  --stack-name "$STACK_NAME" \
  --change-set-name "$STACK_NAME-$CHANGE_SET_VERSION")
  STATUS=$(jq -r '.["Status"]' <<< "$CHANGE_SET")
  if [ "$STATUS" == "CREATE_IN_PROGRESS" ]; then
    echo "sleeping 1..."
    sleep 1
  fi
done

echo "$CHANGE_SET"
STACK_NAME=$(jq -r '.["StackName"]' <<< "$CHANGE_SET")
STACK_ID=$(jq -r '.["StackId"]' <<< "$CHANGE_SET")
CHANGE_SET_NAME=$(jq -r '.["ChangeSetName"]' <<< "$CHANGE_SET")
CHANGE_SET_ID=$(jq -r '.["ChangeSetId"]' <<< "$CHANGE_SET")
STATUS_REASON=$(jq -r '.["StatusReason"]' <<< "$CHANGE_SET")
PARAMETERS=$(jq '.["Parameters"]' <<< "$CHANGE_SET")
CAPABILITIES=$(jq '.["Capabilities"]' <<< "$CHANGE_SET")
CHANGES=$(jq '.["Changes"]' <<< "$CHANGE_SET")
TAGS=$(jq '.["Tags"]' <<< "$CHANGE_SET")
TAGS="${TAGS//[$'\t\r\n ']}"

if [ "$STATUS" == "FAILED" ] && [ "$STATUS_REASON" != "The submitted information didn't contain changes. Submit different information to create a change set." ]; then
  echo "Failed to create change set."
  exit 1
fi

{
  echo "<details><summary>[$TARGET_ENVIRONMENT] FULL Change Set for $STACK_NAME</summary>"
  echo ""
  echo "- **Stack Name:** $STACK_NAME"
  echo "- **Change Set Name:** $CHANGE_SET_NAME"
  echo "- **Tags:** $TAGS"
  echo "- **Stack ID:** $STACK_ID"
  echo "- **Change Set ID:** $CHANGE_SET_ID"
  echo ""
  echo "#### Parameters:"
  echo "~~~ json"
  echo "$PARAMETERS"
  echo "~~~"
  echo "#### Capabilities:"
  echo "~~~ json"
  echo "$CAPABILITIES"
  echo "~~~"
  echo "#### Changes:"
  echo "~~~ json"
} >> "$GITHUB_STEP_SUMMARY"

if [ "$STATUS" == "FAILED" ]; then
  echo "$STATUS_REASON" >> "$GITHUB_STEP_SUMMARY"
else
  echo "$CHANGES" >> "$GITHUB_STEP_SUMMARY"
fi

{
  echo "~~~"
  echo "</details>"
} >> "$GITHUB_STEP_SUMMARY"

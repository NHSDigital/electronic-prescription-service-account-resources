#!/usr/bin/env bash

ACTIVE_STACKS=$(aws cloudformation list-stacks | jq -r '.StackSummaries[] | select ( .StackStatus != "DELETE_COMPLETE" ) | select( .StackName | capture("^lambda-resources-pr-(sandbox-)?(\\d+)$") ) | .StackName ')

mapfile -t ACTIVE_STACKS_ARRAY <<< "$ACTIVE_STACKS"

for i in "${ACTIVE_STACKS_ARRAY[@]}"
do 
  echo "Checking if stack $i has open pull request"
  PULL_REQUEST=${i//lambda-resources-pr-/}
  PULL_REQUEST=${PULL_REQUEST//sandbox-/}
  echo "Checking pull request id ${PULL_REQUEST}"
  URL="https://api.github.com/repos/NHSDigital/electronic-prescription-service-account-resources/pulls/${PULL_REQUEST}"
  RESPONSE=$(curl "${URL}" 2>/dev/null)
  STATE=$(echo "${RESPONSE}" | jq -r .state)
  if [ "$STATE" == "closed" ]; then
    echo "** going to delete stack $i as state is ${STATE} **"
    aws cloudformation delete-stack --stack-name "${i}"
    echo "** Sleeping for 60 seconds to avoid 429 on delete stack **"
    sleep 60
  else
    echo "not going to delete stack $i as state is ${STATE}"
  fi
done

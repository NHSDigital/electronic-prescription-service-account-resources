#!/usr/bin/env bash

current_deployed_account_resources_tag=$(aws cloudformation describe-stacks --stack-name account-resources --query "Stacks[0].Tags[?Key=='version'].Value" --output text)
export current_deployed_account_resources_tag

current_deployed_ci_resources_tag=$(aws cloudformation describe-stacks --stack-name ci-resources --query "Stacks[0].Tags[?Key=='version'].Value" --output text)
export current_deployed_ci_resources_tag

if [ "${current_deployed_account_resources_tag}" != "${current_deployed_ci_resources_tag}" ]; then
  echo "ci-resources and account-resources tags do not match in target. Please investigate"
  exit 1
fi

if [ "${current_deployed_account_resources_tag}" == "" ]; then
  echo "Can not find target tag. Using initial tag in repo"
  export current_deployed_ci_resources_tag="v1.0.4-alpha"
fi

echo "current_deployed_tag=${current_deployed_ci_resources_tag}" >> "$GITHUB_ENV"

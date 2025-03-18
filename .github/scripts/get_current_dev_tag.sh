#!/usr/bin/env bash
set -e 

AWS_MAX_ATTEMPTS=10
export AWS_MAX_ATTEMPTS

dev_account_resources_tag=$(aws cloudformation describe-stacks --stack-name account-resources --query "Stacks[0].Tags[?Key=='version'].Value" --output text)
if [ -z "${dev_account_resources_tag}" ]; then
    echo "could not retrieve dev_account_resources_tag from aws cloudformation describe-stacks"
    exit 1
fi
export dev_account_resources_tag

dev_ci_resources_tag=$(aws cloudformation describe-stacks --stack-name ci-resources --query "Stacks[0].Tags[?Key=='version'].Value" --output text)
if [ -z "${dev_ci_resources_tag}" ]; then
    echo "could not retrieve dev_ci_resources_tag from aws cloudformation describe-stacks"
    exit 1
fi
export dev_ci_resources_tag

if [ "${dev_account_resources_tag}" != "${dev_ci_resources_tag}" ]; then
  echo "ci-resources and account-resources tags do not match in dev. Please investigate"
  exit 1
fi

if [ "${dev_account_resources_tag}" == "" ]; then
  echo "Can not find tag on dev account. Please investigate"
  exit 1
fi

echo "DEV_TAG=${dev_account_resources_tag}" >> "$GITHUB_ENV"

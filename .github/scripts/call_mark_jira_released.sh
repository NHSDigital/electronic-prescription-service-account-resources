#!/usr/bin/env bash
set -e

AWS_MAX_ATTEMPTS=10
export AWS_MAX_ATTEMPTS

echo "calling mark jira released"

cat <<EOF > payload.json
{ 
  "releaseVersion": "AWS-account-resources-$RELEASE_TAG"
}
EOF
cat payload.json

function_arn=$(aws cloudformation list-exports --query "Exports[?Name=='release-notes:MarkJiraReleasedLambdaArn'].Value" --output text)
if [ -z "${function_arn}" ]; then
    echo "could not retrieve function_arn from aws cloudformation list-exports"
    exit 1
fi
aws lambda invoke --function-name "${function_arn}" --cli-binary-format raw-in-base64-out --payload file://payload.json out.txt
cat out.txt

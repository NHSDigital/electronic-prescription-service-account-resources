#!/usr/bin/env bash
set -e

AWS_MAX_ATTEMPTS=10
export AWS_MAX_ATTEMPTS

cat <<EOF > payload.json
{
  "currentTag": "$CURRENT_DEPLOYED_TAG",
  "targetTag": "$DEV_TAG",
  "repoName": "electronic-prescription-service-account-resources",
  "targetEnvironment": "$ENV",
  "productName": "AWS account resources layer",
  "releaseNotesPageId": "$PAGE_ID",
  "releaseNotesPageTitle": "Current AWS account resources release notes - $ENV"
}
EOF
cat payload.json

function_arn=$(aws cloudformation list-exports --query "Exports[?Name=='release-notes:CreateReleaseNotesLambdaArn'].Value" --output text)
if [ -z "${function_arn}" ]; then
    echo "could not retrieve function_arn from aws cloudformation list-exports"
    exit 1
fi
aws lambda invoke --function-name "${function_arn}" --cli-binary-format raw-in-base64-out --payload file://payload.json out.txt

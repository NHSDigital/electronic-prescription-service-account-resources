#!/usr/bin/env bash

cat <<EOF > payload.json
{ 
  "currentTag": "$CURRENT_DEPLOYED_TAG", 
  "targetTag": "$RELEASE_TAG", 
  "repoName": "electronic-prescription-service-account-resources", 
  "targetEnvironment": "INT", 
  "productName": "AWS account resources layer", 
  "releaseNotesPageId": "$PAGE_ID", 
  "releaseNotesPageTitle": "AWS-account-resources-$RELEASE_TAG - Deployed to [INT] on $(date +'%d-%m-%y')",
  "createReleaseCandidate": "true",
  "releasePrefix": "AWS-account-resources-",
  "releaseURL": "$RELEASE_URL"
}
EOF
cat payload.json

function_arn=$(aws cloudformation list-exports --query "Exports[?Name=='release-notes:CreateReleaseNotesLambdaArn'].Value" --output text)
aws lambda invoke --function-name "${function_arn}" --cli-binary-format raw-in-base64-out --payload file://payload.json out.txt

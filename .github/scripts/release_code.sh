#!/usr/bin/env bash

# shellcheck disable=SC2153

echo "$COMMIT_ID"

artifact_bucket=$(aws cloudformation list-exports --output json | jq -r '.Exports[] | select(.Name == "account-resources:ArtifactsBucket") | .Value' | grep -o '[^:]*$')
export artifact_bucket

export artifact_bucket_prefix=lambda_resources/$ARTIFACT_BUCKET_PREFIX
export template_file=template.yaml

cloud_formation_execution_role=$(aws cloudformation list-exports --output json | jq -r '.Exports[] | select(.Name == "ci-resources:CloudFormationExecutionRole") | .Value' )
export cloud_formation_execution_role

cd ../..
make sam-deploy-package

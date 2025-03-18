#!/usr/bin/env bash
set -e

echo "$COMMIT_ID"

AWS_MAX_ATTEMPTS=10
export AWS_MAX_ATTEMPTS

artifact_bucket=$(aws cloudformation list-exports --output json | jq -r '.Exports[] | select(.Name == "account-resources:ArtifactsBucket") | .Value' | grep -o '[^:]*$')
if [ -z "${artifact_bucket}" ]; then
    echo "could not retrieve artifact_bucket from aws cloudformation list-exports"
    exit 1
fi
export artifact_bucket

cloud_formation_execution_role=$(aws cloudformation list-exports --output json | jq -r '.Exports[] | select(.Name == "ci-resources:CloudFormationExecutionRole") | .Value' )
if [ -z "${cloud_formation_execution_role}" ]; then
    echo "could not retrieve cloud_formation_execution_role from aws cloudformation list-exports"
    exit 1
fi
export cloud_formation_execution_role

cd ../..
make sam-deploy-package

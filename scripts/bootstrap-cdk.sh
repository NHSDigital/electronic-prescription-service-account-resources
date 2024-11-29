#!/usr/bin/env bash

# get the policy arns
GrantCloudFormationExecutionAccessIAMPolicy=$(aws cloudformation list-exports --output json | jq -r '.Exports[] | select(.Name == "ci-resources:GrantCloudFormationExecutionAccessIAMPolicy") | .Value')
GrantCloudFormationExecutionAccessPolicyA=$(aws cloudformation list-exports --output json | jq -r '.Exports[] | select(.Name == "ci-resources:GrantCloudFormationExecutionAccessPolicyA") | .Value')
GrantCloudFormationExecutionAccessPolicyB=$(aws cloudformation list-exports --output json | jq -r '.Exports[] | select(.Name == "ci-resources:GrantCloudFormationExecutionAccessPolicyB") | .Value')
GrantCloudFormationExecutionAccessPolicyC=$(aws cloudformation list-exports --output json | jq -r '.Exports[] | select(.Name == "ci-resources:GrantCloudFormationExecutionAccessPolicyC") | .Value')
GrantCloudFormationExecutionAccessPolicyD=$(aws cloudformation list-exports --output json | jq -r '.Exports[] | select(.Name == "ci-resources:GrantCloudFormationExecutionAccessPolicyD") | .Value')
GrantCloudFormationExecutionEc2AccessPolicy=$(aws cloudformation list-exports --output json | jq -r '.Exports[] | select(.Name == "ci-resources:GrantCloudFormationExecutionEc2AccessPolicy") | .Value')
AllowCloudFormationSecretsAccessManagedPolicy=$(aws cloudformation list-exports --output json | jq -r '.Exports[] | select(.Name == "ci-resources:AllowCloudFormationSecretsAccessManagedPolicy") | .Value')

# get the current aws account id
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

ALL_POLICIES=${GrantCloudFormationExecutionAccessIAMPolicy}
ALL_POLICIES="${ALL_POLICIES},${GrantCloudFormationExecutionAccessPolicyA}"
ALL_POLICIES="${ALL_POLICIES},${GrantCloudFormationExecutionAccessPolicyB}"
ALL_POLICIES="${ALL_POLICIES},${GrantCloudFormationExecutionAccessPolicyC}"
ALL_POLICIES="${ALL_POLICIES},${GrantCloudFormationExecutionAccessPolicyD}"
ALL_POLICIES="${ALL_POLICIES},${GrantCloudFormationExecutionEc2AccessPolicy}"
ALL_POLICIES="${ALL_POLICIES},${AllowCloudFormationSecretsAccessManagedPolicy}"


echo "Going to run cdk bootstrap with these parameters"
echo "GrantCloudFormationExecutionAccessIAMPolicy: ${GrantCloudFormationExecutionAccessIAMPolicy}"
echo "GrantCloudFormationExecutionAccessPolicyA: ${GrantCloudFormationExecutionAccessPolicyA}"
echo "GrantCloudFormationExecutionAccessPolicyB: ${GrantCloudFormationExecutionAccessPolicyB}"
echo "GrantCloudFormationExecutionAccessPolicyC: ${GrantCloudFormationExecutionAccessPolicyC}"
echo "GrantCloudFormationExecutionAccessPolicyD: ${GrantCloudFormationExecutionAccessPolicyD}"
echo "GrantCloudFormationExecutionEc2AccessPolicy: ${GrantCloudFormationExecutionEc2AccessPolicy}"
echo "AllowCloudFormationSecretsAccessManagedPolicy: ${AllowCloudFormationSecretsAccessManagedPolicy}"
echo "ALL_POLICIES: ${ALL_POLICIES}"
echo "AWS_ACCOUNT_ID: ${AWS_ACCOUNT_ID}"

read -p "Press any key to resume or press ctrl+c to exit ..."

cdk bootstrap aws://${AWS_ACCOUNT_ID}/eu-west-2 \
  --bootstrap-customer-key \
  --cloudformation-execution-policies "${ALL_POLICIES}" 

cdk bootstrap aws://${AWS_ACCOUNT_ID}/us-east-1 \
  --bootstrap-customer-key \
  --cloudformation-execution-policies "${ALL_POLICIES}" 

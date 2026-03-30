#!/usr/bin/env bash

set -euo pipefail

# Update this list with the owner/repo pairs you need to clean up.
REPOS=(
    "NHSDigital/electronic-prescription-service-api"
    "NHSDigital/prescriptionsforpatients"
    "NHSDigital/prescriptions-for-patients"
    "NHSDigital/electronic-prescription-service-account-resources"
    "NHSDigital/eps-prescription-status-update-api"
    "NHSDigital/electronic-prescription-service-clinical-prescription-tracker"
    "NHSDigital/eps-prescription-tracker-ui"
    "NHSDigital/eps-FHIR-validator-lambda"
    "NHSDigital/validation-service-fhir-r4"
    "NHSDigital/electronic-prescription-service-release-notes"
    "NHSDigital/electronic-prescription-service-get-secrets"
    "NHSDigital/nhs-fhir-middy-error-handler"
    "NHSDigital/nhs-eps-spine-client"
    "NHSDigital/eps-load-test"
    "NHSDigital/electronic-prescription-service-api-regression-tests"
    "NHSDigital/eps-aws-dashboards"
    "NHSDigital/eps-storage-terraform"
    "NHSDigital/eps-cdk-utils"
    "NHSDigital/eps-assist-me"
    "NHSDigital/eps-vpc-resources"
    "NHSDigital/eps-common-workflows"
    "NHSDigital/eps-spine-shared"
    "NHSDigital/eps-repo-status"
    "NHSDigital/eps-devcontainers"
    "NHSDigital/eps-data-extract"
)

SECRETS=(
  "CREATE_PULL_REQUEST_APP_ID"
  "CREATE_PULL_REQUEST_PEM"
  "DEV_CONTAINER_PUSH_IMAGE_ROLE"
  "DEV_CONTAINER_PULL_IMAGE_ROLE"
  "QA_CONTAINER_PUSH_IMAGE_ROLE"
  "QA_CONTAINER_PULL_IMAGE_ROLE"
  "REF_CONTAINER_PUSH_IMAGE_ROLE"
  "REF_CONTAINER_PULL_IMAGE_ROLE"
  "INT_CONTAINER_PUSH_IMAGE_ROLE"
  "INT_CONTAINER_PULL_IMAGE_ROLE"
  "PROD_CONTAINER_PUSH_IMAGE_ROLE"
  "PROD_CONTAINER_PULL_IMAGE_ROLE"
  "DEV_CDK_PULL_IMAGE_ROLE"
  "REF_CDK_PULL_IMAGE_ROLE"
  "QA_CDK_PULL_IMAGE_ROLE"
  "INT_CDK_PULL_IMAGE_ROLE"
  "PROD_CDK_PULL_IMAGE_ROLE"
  "DEV_CDK_PUSH_IMAGE_ROLE"
  "REF_CDK_PUSH_IMAGE_ROLE"
  "QA_CDK_PUSH_IMAGE_ROLE"
  "INT_CDK_PUSH_IMAGE_ROLE"
  "PROD_CDK_PUSH_IMAGE_ROLE"
)

APPS=(
  "actions"
  "dependabot"
)

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

require_command gh

if ! gh auth status >/dev/null 2>&1; then
  echo "GitHub CLI is not authenticated. Run 'gh auth login' or set GH_TOKEN." >&2
  exit 1
fi

delete_secret() {
  local repo="$1"
  local secret="$2"
  local app="$3"

  if output=$(gh secret delete "$secret" --repo "$repo" --app "$app" --confirm 2>&1); then
    echo "[$repo] Deleted $secret for $app."
  else
    echo "[$repo] Skipped $secret for $app ($output)." >&2
  fi
}

for repo in "${REPOS[@]}"; do
  echo "Processing $repo"
  for secret in "${SECRETS[@]}"; do
    for app in "${APPS[@]}"; do
      delete_secret "$repo" "$secret" "$app"
    done
  done
  echo
done

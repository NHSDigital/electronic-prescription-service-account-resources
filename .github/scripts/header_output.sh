#!/usr/bin/env bash

{
  echo "## [$TARGET_ENVIRONMENT] Change Set for $STACK_NAME"
  echo "- **Stack Name:** $STACK_NAME"
  echo "- **Version Tag:** $VERSION"
  echo ""
  echo "The FULL change set below shows all changes including tag changes"
  echo "The change set with existing tag below shows all changes using the current tag and may be easier to identify changes"
} >> "$GITHUB_STEP_SUMMARY"

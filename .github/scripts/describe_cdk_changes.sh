#!/usr/bin/env bash
set -e

{
  echo "<details><summary>$SUMMARY</summary>"
  echo ""
  echo "- **Stack Name:** $STACK_NAME"
  echo ""
  echo "#### Parameters:"
  echo "~~~ json"
  cat "$PARAMETERS_FILE"
  echo "~~~"
  echo "#### Changes:"
  echo "~~~ json"
  cat "$DIFF_FILE"
  echo "~~~"
  echo "</details>"
} >> "$GITHUB_STEP_SUMMARY"

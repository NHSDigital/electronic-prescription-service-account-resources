#!/usr/bin/env bash
set -euo pipefail

PREFIXES=("account-resources:" "ci-resources:" "lambda-resources:" "secrets:")
PROFILE="${AWS_PROFILE:-}"
REGION="${AWS_REGION:-${AWS_DEFAULT_REGION:-}}"

usage() {
  cat <<'USAGE'
Usage: find-cfn-export-usage.sh [--profile PROFILE] [--region REGION]

Enumerates CloudFormation exports whose names start with:
  account-resources:
  ci-resources:
  lambda-resources:
  secrets:

For each matching export the script reports which stacks import it. Exports
with no importers are listed separately.

Environment:
  AWS_PROFILE / AWS_REGION / AWS_DEFAULT_REGION can be used instead of flags.

Requires: aws, jq
USAGE
}

require_binary() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Error: '$1' is required but not found on PATH." >&2
    exit 1
  fi
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --profile)
      [[ $# -lt 2 ]] && { echo "Missing value for --profile" >&2; exit 1; }
      PROFILE="$2"
      shift 2
      ;;
    --region)
      [[ $# -lt 2 ]] && { echo "Missing value for --region" >&2; exit 1; }
      REGION="$2"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

require_binary aws
require_binary jq

aws_cf() {
  aws ${PROFILE:+--profile "$PROFILE"} ${REGION:+--region "$REGION"} cloudformation "$@"
}

build_prefix_regex() {
  local part escaped joined=""
  for part in "${PREFIXES[@]}"; do
    escaped=$(printf '%s' "$part" | sed -e 's/[].[^$\\*+?|(){}]/\\&/g')
    joined+="${escaped}|"
  done
  printf '^%s' "(${joined%|})"
}

collect_exports() {
  local next_token=""
  local resp
  local prefix_regex
  prefix_regex="$(build_prefix_regex)"
  while :; do
    if [[ -n "$next_token" ]]; then
      resp="$(aws_cf list-exports --output json --starting-token "$next_token")"
    else
      resp="$(aws_cf list-exports --output json)"
    fi

    while IFS= read -r name; do
      [[ -z "$name" ]] && continue
      EXPORTS+=("$name")
    done < <(printf '%s' "$resp" | jq -r --arg pattern "$prefix_regex" '
      .Exports[]?.Name | select(test($pattern))
    ')

    next_token="$(printf '%s' "$resp" | jq -r '.NextToken // ""')"
    [[ -z "$next_token" ]] && break
  done
}

main() {
  declare -a EXPORTS=()
  declare -A USED_EXPORTS=()
  declare -a UNUSED_EXPORTS=()

  collect_exports

  if [[ ${#EXPORTS[@]} -eq 0 ]]; then
    echo "No exports found with the expected prefixes (${PREFIXES[*]})."
    exit 0
  fi

  for export_name in "${EXPORTS[@]}"; do
    readarray -t importers < <(aws_cf list-imports --export-name "$export_name" --output json | jq -r '.Imports[]?')
    if [[ ${#importers[@]} -gt 0 ]]; then
      USED_EXPORTS["$export_name"]="$(printf '%s\n' "${importers[@]}")"
    else
      UNUSED_EXPORTS+=("$export_name")
    fi
  done

  if ((${#USED_EXPORTS[@]})); then
    echo "Exports in use:"
    readarray -t sorted_used < <(printf '%s\n' "${!USED_EXPORTS[@]}" | sort)
    for export_name in "${sorted_used[@]}"; do
      echo "  $export_name"
      while IFS= read -r stack; do
        [[ -z "$stack" ]] && continue
        echo "    - $stack"
      done <<<"${USED_EXPORTS[$export_name]}"
    done
  else
    echo "No matching exports are currently imported by other stacks."
  fi

  echo

  if ((${#UNUSED_EXPORTS[@]})); then
    echo "Exports with no importers:"
    readarray -t sorted_unused < <(printf '%s\n' "${UNUSED_EXPORTS[@]}" | sort)
    for export_name in "${sorted_unused[@]}"; do
      echo "  - $export_name"
    done
  else
    echo "All matching exports are referenced by other stacks."
  fi
}

main "$@"

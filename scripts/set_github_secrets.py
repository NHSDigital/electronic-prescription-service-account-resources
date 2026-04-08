import argparse
from dataclasses import dataclass, field
import json
import os
from typing import Any, TypedDict
import time
import boto3
from github import Github
from github.Repository import Repository
from github.EnvironmentProtectionRuleReviewer import ReviewerParams
from github.EnvironmentDeploymentBranchPolicy import (
        EnvironmentDeploymentBranchPolicyParams,
    )

"""
This script is used to set common secrets in all repositories
When we add a new repository, add it to the repos list in the main function
When we add a new environment, you need to do the following
  - modify Secrets class to have roles for the new environment
  - modify main function so all exports are retrieved for the new environment
  - modify main function so roles are retrieved from exports for the new environment
  - modify set_all_secrets function to set variables for the new environment

You need a github token to run this and have aws config setup for each environment
You can get a github token by first authenticating with github cli

make github-login

and then get the token

gh auth token

This must be passed to this script as gh_auth_token param - eg

GH_TOKEN=`gh auth token`
poetry run python scripts/set_github_secrets.py --gh_auth_token $GH_TOKEN
"""


class Roles(TypedDict):
    cloud_formation_deploy_role: str
    cloud_formation_check_version_role: str
    cloud_formation_prepare_changeset_role: str
    release_notes_execute_lambda_role: str
    artillery_runner_role: str


class Secrets(TypedDict):
    regression_test_pem: str
    automerge_pem: str
    create_pull_request_pem: str
    eps_multi_repo_deployment_pem: str
    dev_roles: Roles
    int_roles: Roles
    prod_roles: Roles
    qa_roles: Roles
    ref_roles: Roles
    recovery_roles: Roles
    proxygen_prod_role: str
    proxygen_ptl_role: str
    dev_target_spine_server: str
    int_target_spine_server: str
    prod_target_spine_server: str
    qa_target_spine_server: str
    ref_target_spine_server: str
    recovery_target_spine_server: str
    dev_target_service_search_server: str
    int_target_service_search_server: str
    prod_target_service_search_server: str
    qa_target_service_search_server: str
    ref_target_service_search_server: str
    recovery_target_service_search_server: str
    dependabot_token: str


class GithubTeams(TypedDict):
    eps_administrator_team: str
    eps_testers_team: str
    eps_team: str
    eps_deployments_team: str


class RepoConfig(TypedDict):
    repoUrl: str
    setTargetSpineServers: bool
    isAccountResources: bool
    setTargetServiceSearchServers: bool
    isEchoRepo: bool


@dataclass
class RepoEnvironment():
    name: str
    reviewers: list[ReviewerParams] = field(default_factory=list)
    deployment_branch_policy: EnvironmentDeploymentBranchPolicyParams | None = None


def _as_bool(entry: dict[str, Any], camel_key: str, snake_key: str, default: bool = False) -> bool:
    value = entry.get(camel_key)
    if value is None:
        value = entry.get(snake_key)
    if value is None:
        return default
    return bool(value)


def _normalise_repo_entry(entry: Any, fallback_repo_url: str | None = None) -> RepoConfig:
    if isinstance(entry, str):
        repo_url = entry
        entry_dict: dict[str, Any] = {}
    elif isinstance(entry, dict):
        entry_dict = dict(entry)
        repo_url = entry_dict.get("repoUrl") or entry_dict.get("repo") or fallback_repo_url
    else:
        raise ValueError("Unsupported repo entry type in repos.json")

    if not repo_url:
        raise ValueError("Repo entry missing repoUrl")

    repo_url = repo_url.strip()
    if not repo_url:
        raise ValueError("Repo entry contains empty repoUrl")

    return {
        "repoUrl": repo_url,
        "setTargetSpineServers": _as_bool(entry_dict,
                                          camel_key="setTargetSpineServers",
                                          snake_key="set_target_spine_servers"),
        "isAccountResources": _as_bool(entry_dict,
                                       camel_key="isAccountResources",
                                       snake_key="is_account_resources"),
        "setTargetServiceSearchServers": _as_bool(
            entry_dict,
            camel_key="setTargetServiceSearchServers",
            snake_key="set_target_service_search_servers"
        ),
        "isEchoRepo": _as_bool(
            entry_dict,
            camel_key="isEchoRepo",
            snake_key="is_echo_repo"
        ),
    }


def _parse_repos_payload(payload: Any) -> list[RepoConfig]:
    if isinstance(payload, list):
        return [_normalise_repo_entry(entry) for entry in payload]
    if isinstance(payload, dict):
        repos_section = payload.get("repos")
        if isinstance(repos_section, list):
            return [_normalise_repo_entry(entry) for entry in repos_section]
        if isinstance(repos_section, dict):
            return [
                _normalise_repo_entry(entry, fallback_repo_url=key)
                for key, entry in repos_section.items()
            ]
    raise ValueError("repos.json must contain either a list of repos or a 'repos' section")


def load_repo_configs_from_repo_status(github: Github) -> list[RepoConfig]:
    print("Loading repo configuration from NHSDigital/eps-repo-status")
    repo = github.get_repo("NHSDigital/eps-repo-status")
    content_file = repo.get_contents("repos.json", ref="main")
    payload = json.loads(content_file.decoded_content.decode("utf-8"))
    return _parse_repos_payload(payload)


def get_named_export(all_exports: list, export_name: str, required: bool) -> str | None:
    export_value = None

    for export in all_exports:
        if export['Name'] == export_name:
            export_value = export['Value']
            break

    if required and export_value is None:
        raise Exception(f"export {export_name} is required but not found")
    return export_value


def get_all_exports(profile_name: str) -> list:
    print(f"Getting exports for profile {profile_name}")
    session = boto3.Session(profile_name=profile_name)
    # Create a CloudFormation client
    cf_client = session.client('cloudformation')

    # Get all exports
    all_exports = []
    next_token = None

    while True:
        if next_token:
            response = cf_client.list_exports(NextToken=next_token)
        else:
            response = cf_client.list_exports()

        all_exports.extend(response.get('Exports', []))

        next_token = response.get('NextToken')
        if not next_token:
            break
    return all_exports


def get_role_exports(all_exports: list) -> Roles:
    role_exports = [
        {
            "variable_name": "cloud_formation_deploy_role",
            "export_name": "ci-resources:CloudFormationDeployRole",
            "required": True
        },
        {
            "variable_name": "cloud_formation_check_version_role",
            "export_name": "ci-resources:CloudFormationCheckVersionRole",
            "required": True
        },
        {
            "variable_name": "cloud_formation_prepare_changeset_role",
            "export_name": "ci-resources:CloudFormationPrepareChangesetRole",
            "required": True
        },
        {
            "variable_name": "release_notes_execute_lambda_role",
            "export_name": "ci-resources:ReleaseNotesExecuteLambdaRole",
            "required": False
        },
        {
            "variable_name": "artillery_runner_role",
            "export_name": "ci-resources:ArtilleryRunnerRole",
            "required": False
        },
    ]
    all_roles = {}
    for role_export in role_exports:
        all_roles[role_export["variable_name"]] = get_named_export(all_exports,
                                                                   export_name=role_export["export_name"],
                                                                   required=role_export["required"])
    return all_roles


def get_github_teams(github: Github) -> GithubTeams:
    print("Getting github teams")
    org = github.get_organization("NHSDigital")
    eps_administrator_team = org.get_team_by_slug("eps-administrators")
    eps_testers_team = org.get_team_by_slug("eps-testers")
    eps_team = org.get_team_by_slug("eps")
    eps_deployments_team = org.get_team_by_slug("eps-deployments")
    github_teams: GithubTeams = {
        "eps_administrator_team": eps_administrator_team.id,
        "eps_testers_team": eps_testers_team.id,
        "eps_team": eps_team.id,
        "eps_deployments_team": eps_deployments_team.id
    }
    return github_teams


def set_secret(github: Github, repoUrl: str, secret_name: str, secret_value: str, set_dependabot: bool):
    repo = github.get_repo(repoUrl)
    if secret_value is None:
        print(f"Secret value for {secret_name} in repo {repoUrl} is not set. Not setting")
        return
    print(f"Setting value for {secret_name} in repo {repoUrl}")
    repo.create_secret(secret_name=secret_name,
                       unencrypted_value=secret_value,
                       secret_type="actions")
    time.sleep(1)  # Sleep for 1 second to avoid rate limiting
    if (set_dependabot):
        print(f"Setting value for {secret_name} in repo {repoUrl} for dependabot")
        repo.create_secret(secret_name=secret_name,
                           unencrypted_value=secret_value,
                           secret_type="dependabot")
        time.sleep(1)  # Sleep for 1 second to avoid rate limiting


def set_environment_secret(github: Github, repoUrl: str, environment_name: str, secret_name: str, secret_value: str):
    repo = github.get_repo(repoUrl)
    if secret_value is None:
        print(f"Secret value for {secret_name} in repo {repoUrl} is not set. Not setting")
        return
    environment = repo.get_environment(environment_name)
    print(f"Setting value for {secret_name} in repo {repoUrl} for environment {environment_name}")
    environment.create_secret(secret_name=secret_name,
                              unencrypted_value=secret_value)
    time.sleep(1)  # Sleep for 1 second to avoid rate limiting


def set_role_secrets(github: Github, repoUrl: str, roles: Roles, env_name: str, set_dependabot: bool):
    set_secret(github=github, repoUrl=repoUrl, secret_name=f"{env_name}_CLOUD_FORMATION_DEPLOY_ROLE",
               secret_value=roles["cloud_formation_deploy_role"],
               set_dependabot=set_dependabot)
    set_secret(github=github, repoUrl=repoUrl, secret_name=f"{env_name}_CLOUD_FORMATION_CHECK_VERSION_ROLE",
               secret_value=roles["cloud_formation_check_version_role"],
               set_dependabot=set_dependabot)
    set_secret(github=github, repoUrl=repoUrl, secret_name=f"{env_name}_CLOUD_FORMATION_CREATE_CHANGESET_ROLE",
               secret_value=roles["cloud_formation_prepare_changeset_role"],
               set_dependabot=set_dependabot)


def set_all_secrets(github: Github,
                    repoUrl: str,
                    setTargetSpineServers: bool,
                    setTargetServiceSearchServers: bool,
                    set_account_resources_secrets: bool,
                    secrets: Secrets,
                    is_echo_repo: bool):
    response = input(f"Setting secrets in repo {repoUrl}. Do you want to continue? (y/N): ")

    if response.lower() == "y":
        print("Continuing...")
    else:
        print("Returning.")
        return

    # automerge secrets
    set_secret(github=github, repoUrl=repoUrl, secret_name="AUTOMERGE_PEM",
               secret_value=secrets["automerge_pem"],
               set_dependabot=True)
    set_secret(github=github, repoUrl=repoUrl, secret_name="AUTOMERGE_APP_ID",
               secret_value="420347",
               set_dependabot=True)
    set_secret(github=github, repoUrl=repoUrl, secret_name="DEPENDABOT_TOKEN",
               secret_value=secrets["dependabot_token"],
               set_dependabot=True)
    set_environment_secret(github=github,
                           repoUrl=repoUrl,
                           environment_name="create_pull_request",
                           secret_name="CREATE_PULL_REQUEST_PEM",
                           secret_value=secrets["create_pull_request_pem"])
    set_environment_secret(github=github,
                           repoUrl=repoUrl,
                           environment_name="create_pull_request",
                           secret_name="CREATE_PULL_REQUEST_APP_ID",
                           secret_value="3182106")

    # dev secrets
    set_secret(github=github, repoUrl=repoUrl, secret_name="DEV_CLOUD_FORMATION_EXECUTE_LAMBDA_ROLE",
               secret_value=secrets["dev_roles"]["release_notes_execute_lambda_role"],
               set_dependabot=False)

    if is_echo_repo:
        print(f"All required secrets set for echo repo {repoUrl}.")
        return

    # common secrets
    set_secret(github=github, repoUrl=repoUrl, secret_name="REGRESSION_TESTS_PEM",
               secret_value=secrets["regression_test_pem"],
               set_dependabot=True)
    set_secret(github=github, repoUrl=repoUrl, secret_name="APIM_STATUS_API_KEY",
               secret_value=os.environ.get("apim_status_api_key"),
               set_dependabot=True)

    # proxygen roles
    set_secret(github=github, repoUrl=repoUrl, secret_name="PROXYGEN_PTL_ROLE",
               secret_value=secrets["proxygen_ptl_role"],
               set_dependabot=True)
    set_secret(github=github, repoUrl=repoUrl, secret_name="PROXYGEN_PROD_ROLE",
               secret_value=secrets["proxygen_prod_role"],
               set_dependabot=True)

    # artillery role
    set_secret(github=github, repoUrl=repoUrl, secret_name="DEV_ARTILLERY_RUNNER_ROLE",
               secret_value=secrets["dev_roles"]["artillery_runner_role"],
               set_dependabot=True)
    set_secret(github=github, repoUrl=repoUrl, secret_name="REF_ARTILLERY_RUNNER_ROLE",
               secret_value=secrets["ref_roles"]["artillery_runner_role"],
               set_dependabot=False)

    set_role_secrets(github=github, repoUrl=repoUrl, roles=secrets["dev_roles"], env_name="DEV",
                     set_dependabot=True)
    set_role_secrets(github=github, repoUrl=repoUrl, roles=secrets["int_roles"], env_name="INT",
                     set_dependabot=False)
    set_role_secrets(github=github, repoUrl=repoUrl, roles=secrets["prod_roles"], env_name="PROD",
                     set_dependabot=False)
    set_role_secrets(github=github, repoUrl=repoUrl, roles=secrets["qa_roles"], env_name="QA",
                     set_dependabot=False)
    set_role_secrets(github=github, repoUrl=repoUrl, roles=secrets["ref_roles"], env_name="REF",
                     set_dependabot=False)
    set_role_secrets(github=github, repoUrl=repoUrl, roles=secrets["ref_roles"], env_name="REF",
                     set_dependabot=False)
    set_role_secrets(github=github, repoUrl=repoUrl, roles=secrets["recovery_roles"], env_name="RECOVERY",
                     set_dependabot=False)
    if setTargetSpineServers:
        set_secret(github=github,
                   repoUrl=repoUrl,
                   secret_name="DEV_TARGET_SPINE_SERVER",
                   secret_value=secrets["dev_target_spine_server"],
                   set_dependabot=True)
        set_secret(github=github,
                   repoUrl=repoUrl,
                   secret_name="REF_TARGET_SPINE_SERVER",
                   secret_value=secrets["ref_target_spine_server"],
                   set_dependabot=False)
        set_secret(github=github,
                   repoUrl=repoUrl,
                   secret_name="QA_TARGET_SPINE_SERVER",
                   secret_value=secrets["qa_target_spine_server"],
                   set_dependabot=False)
        set_secret(github=github,
                   repoUrl=repoUrl,
                   secret_name="INT_TARGET_SPINE_SERVER",
                   secret_value=secrets["int_target_spine_server"],
                   set_dependabot=False)
        set_secret(github=github,
                   repoUrl=repoUrl,
                   secret_name="PROD_TARGET_SPINE_SERVER",
                   secret_value=secrets["prod_target_spine_server"],
                   set_dependabot=False)
        set_secret(github=github,
                   repoUrl=repoUrl,
                   secret_name="RECOVERY_TARGET_SPINE_SERVER",
                   secret_value=secrets["recovery_target_spine_server"],
                   set_dependabot=False)

    if setTargetServiceSearchServers:
        set_secret(github=github,
                   repoUrl=repoUrl,
                   secret_name="DEV_TARGET_SERVICE_SEARCH_SERVER",
                   secret_value=secrets["dev_target_service_search_server"],
                   set_dependabot=True)
        set_secret(github=github,
                   repoUrl=repoUrl,
                   secret_name="INT_TARGET_SERVICE_SEARCH_SERVER",
                   secret_value=secrets["int_target_service_search_server"],
                   set_dependabot=False)
        set_secret(github=github,
                   repoUrl=repoUrl,
                   secret_name="REF_TARGET_SERVICE_SEARCH_SERVER",
                   secret_value=secrets["ref_target_service_search_server"],
                   set_dependabot=False)
        set_secret(github=github,
                   repoUrl=repoUrl,
                   secret_name="QA_TARGET_SERVICE_SEARCH_SERVER",
                   secret_value=secrets["qa_target_service_search_server"],
                   set_dependabot=False)
        set_secret(github=github,
                   repoUrl=repoUrl,
                   secret_name="PROD_TARGET_SERVICE_SEARCH_SERVER",
                   secret_value=secrets["prod_target_service_search_server"],
                   set_dependabot=False)
        set_secret(github=github,
                   repoUrl=repoUrl,
                   secret_name="RECOVERY_TARGET_SERVICE_SEARCH_SERVER",
                   secret_value=secrets["recovery_target_service_search_server"],
                   set_dependabot=False)
    if set_account_resources_secrets:
        # eps multi repo deployment pem
        set_secret(github=github, repoUrl=repoUrl, secret_name="EPS_MULTI_REPO_DEPLOYMENT_PEM",
                   secret_value=secrets["eps_multi_repo_deployment_pem"],
                   set_dependabot=False)
        set_secret(github=github, repoUrl=repoUrl, secret_name="EPS_MULTI_REPO_DEPLOYMENT_APP_ID",
                   secret_value="2278388",
                   set_dependabot=False)


def setup_account_resources_environments(repo: Repository, environment: RepoEnvironment):
    print(f"Setting up account-resources environments in repo {repo.name}")
    for suffix in ["ci", "account", "lambda"]:
        print(f"Creating {environment.name}-{suffix} environment")
        repo.create_environment(f"{environment.name}-{suffix}",
                                reviewers=environment.reviewers,
                                deployment_branch_policy=environment.deployment_branch_policy)
        time.sleep(1)  # Sleep for 1 second to avoid rate


def setup_repo_environment(repo: Repository, environment: RepoEnvironment):
    print(f"Creating {environment.name} environment in repo {repo.name}")
    repo.create_environment(environment.name,
                            reviewers=environment.reviewers,
                            deployment_branch_policy=environment.deployment_branch_policy)
    time.sleep(1)  # Sleep for 1 second to avoid rate


def setup_environments(github: Github,
                       repoUrl: str,
                       set_account_resources_environments: bool,
                       github_teams: GithubTeams,
                       is_echo_repo: bool):
    response = input(f"Setting environments in repo {repoUrl}. Do you want to continue? (y/N): ")

    if response.lower() == "y":
        print("Continuing...")
    else:
        print("Returning.")
        return

    repo = github.get_repo(repoUrl)
    eps_administrator_team_reviewer: ReviewerParams = ReviewerParams("Team", github_teams["eps_administrator_team"])
    eps_deployments_team_reviewer: ReviewerParams = ReviewerParams("Team", github_teams["eps_deployments_team"])
    eps_team_reviewer: ReviewerParams = ReviewerParams("Team", github_teams["eps_team"])
    deployment_branch_policy = EnvironmentDeploymentBranchPolicyParams(protected_branches=True,
                                                                       custom_branch_policies=False)

    create_pull_request_environment = RepoEnvironment("create_pull_request", [], deployment_branch_policy)

    int_deployment_branch_policy = deployment_branch_policy
    if repo.name == "NHSDigital/electronic-prescription-service-api-regression-tests":
        int_deployment_branch_policy = None
    common_environments: list[RepoEnvironment] = [
        RepoEnvironment("dev"),
        RepoEnvironment("ref", [eps_administrator_team_reviewer, eps_team_reviewer]),
        RepoEnvironment("int", [eps_administrator_team_reviewer, eps_team_reviewer], int_deployment_branch_policy),
    ]

    if set_account_resources_environments:
        environments = common_environments + [
            RepoEnvironment("recovery", [eps_administrator_team_reviewer, eps_team_reviewer]),
            RepoEnvironment("qa", [eps_administrator_team_reviewer, eps_team_reviewer], deployment_branch_policy),
            RepoEnvironment("prod",
                            [eps_administrator_team_reviewer, eps_deployments_team_reviewer],
                            deployment_branch_policy),
        ]
        for environment in environments:
            setup_account_resources_environments(repo=repo, environment=environment)
        setup_repo_environment(repo, create_pull_request_environment)
        return

    common_environments = common_environments + [
        create_pull_request_environment
    ]
    if not is_echo_repo:
        environments = common_environments + [
            RepoEnvironment("dev-pr"),
            RepoEnvironment("recovery", [eps_administrator_team_reviewer, eps_team_reviewer]),
            RepoEnvironment("qa", [eps_administrator_team_reviewer, eps_team_reviewer], deployment_branch_policy),
            RepoEnvironment("prod",
                            [eps_administrator_team_reviewer, eps_deployments_team_reviewer],
                            deployment_branch_policy),
        ]
    else:
        environments = common_environments + [
            RepoEnvironment("veit"),
            RepoEnvironment("dep", [eps_administrator_team_reviewer, eps_team_reviewer], deployment_branch_policy),
            RepoEnvironment("live", [eps_administrator_team_reviewer], deployment_branch_policy),
        ]
    for environment in environments:
        setup_repo_environment(repo, environment)


def setup_repo(github: Github,
               repo: RepoConfig,
               secrets: Secrets,
               github_teams: GithubTeams):
    setup_environments(github=github,
                       repoUrl=repo["repoUrl"],
                       set_account_resources_environments=repo["isAccountResources"],
                       github_teams=github_teams,
                       is_echo_repo=repo["isEchoRepo"])
    set_all_secrets(github=github,
                    repoUrl=repo["repoUrl"],
                    setTargetSpineServers=repo["setTargetSpineServers"],
                    setTargetServiceSearchServers=repo["setTargetServiceSearchServers"],
                    set_account_resources_secrets=repo["isAccountResources"],
                    secrets=secrets,
                    is_echo_repo=repo["isEchoRepo"])
    # TODO - setup other things automatically
    # see https://nhsd-confluence.digital.nhs.uk/spaces/APIMC/pages/693753388/Git+repository+checklist


def main():
    parser = argparse.ArgumentParser()

    parser.add_argument(
        "--gh_auth_token",
        required=True,
        help="Please provide a github auth token. If authenticated with github cli this can be retrieved using 'gh auth token'", # noqa E501
    )

    arguments = parser.parse_args()
    github = Github(arguments.gh_auth_token)
    github_teams = get_github_teams(github=github)

    # get all the exports for each environment
    dev_exports = get_all_exports("prescription-dev")
    qa_exports = get_all_exports("prescription-qa")
    ref_exports = get_all_exports("prescription-ref")
    int_exports = get_all_exports("prescription-int")
    prod_exports = get_all_exports("prescription-prod-readonly")
    recovery_exports = get_all_exports("prescription-recovery")

    # get the roles from the exports
    dev_roles = get_role_exports(dev_exports)
    qa_roles = get_role_exports(qa_exports)
    ref_roles = get_role_exports(ref_exports)
    int_roles = get_role_exports(int_exports)
    prod_roles = get_role_exports(prod_exports)
    recovery_roles = get_role_exports(recovery_exports)
    proxygen_ptl_role = get_named_export(all_exports=prod_exports,
                                         export_name="ci-resources:ProxygenPTLRole",
                                         required=True)
    proxygen_prod_role = get_named_export(all_exports=prod_exports,
                                          export_name="ci-resources:ProxygenProdRole",
                                          required=True)

    # read in secret files
    with open(".secrets/regression_test_app.pem") as f:
        regression_test_pem = f.read()
    with open(".secrets/automerge.pem") as f:
        automerge_pem = f.read()
    with open(".secrets/create_pull_request.pem") as f:
        create_pull_request_pem = f.read()
    with open(".secrets/eps_multi_repo_deployment.pem") as f:
        eps_multi_repo_deployment_pem = f.read()

    # set up a variable with all the roles and secrets for all environments
    secrets: Secrets = {
        "regression_test_pem": regression_test_pem,
        "eps_multi_repo_deployment_pem": eps_multi_repo_deployment_pem,
        "automerge_pem": automerge_pem,
        "create_pull_request_pem": create_pull_request_pem,
        "dev_roles": dev_roles,
        "int_roles": int_roles,
        "prod_roles": prod_roles,
        "qa_roles": qa_roles,
        "ref_roles": ref_roles,
        "recovery_roles": recovery_roles,
        "proxygen_prod_role": proxygen_prod_role,
        "proxygen_ptl_role": proxygen_ptl_role,
        "dev_target_spine_server": "msg.veit07.devspineservices.nhs.uk",
        "int_target_spine_server": "msg.intspineservices.nhs.uk",
        "prod_target_spine_server": "prescriptions.spineservices.nhs.uk",
        "qa_target_spine_server": "msg.intspineservices.nhs.uk",
        "ref_target_spine_server": "prescriptions.refspineservices.nhs.uk",
        "recovery_target_spine_server": "msg.veit07.devspineservices.nhs.uk",
        "dev_target_service_search_server": "int.api.service.nhs.uk",
        "int_target_service_search_server": "api.service.nhs.uk",
        "prod_target_service_search_server": "api.service.nhs.uk",
        "qa_target_service_search_server": "int.api.service.nhs.uk",
        "ref_target_service_search_server": "api.service.nhs.uk",
        "recovery_target_service_search_server": "api.service.nhs.uk",
        "dependabot_token": os.environ.get("dependabot_token")
    }

    print("\n\n************************************************")
    print("************************************************")
    print(f"github_teams: {json.dumps(github_teams, indent=2)}")
    print("************************************************")
    print(f"secrets: {json.dumps(secrets, indent=2)}")
    print("************************************************")
    print("\n\n************************************************")

    repos: list[RepoConfig] = load_repo_configs_from_repo_status(github)

    for repo in repos:
        setup_repo(github=github,
                   repo=repo,
                   secrets=secrets,
                   github_teams=github_teams)


if __name__ == "__main__":
    main()

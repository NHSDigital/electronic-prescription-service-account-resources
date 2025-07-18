import argparse
import json
from typing import TypedDict
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

gh auth login

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
    CDK_pull_image_role: str
    CDK_push_image_role: str
    release_notes_execute_lambda_role: str
    artillery_runner_role: str


class Secrets(TypedDict):
    regression_test_pem: str
    automerge_pem: str
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


class GithubTeams(TypedDict):
    eps_administrator_team: str
    eps_testers_team: str
    eps_team: str


class RepoConfig(TypedDict):
    repo_name: str
    set_target_spine_servers: bool
    set_account_resources_environments: bool
    set_target_service_search_servers: bool


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
            "variable_name": "CDK_pull_image_role",
            "export_name": "ci-resources:CDKPullImageRole",
            "required": True
        },
        {
            "variable_name": "CDK_push_image_role",
            "export_name": "ci-resources:CDKPushImageRole",
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
    eps_team = org.get_team_by_slug("EPS")
    github_teams: GithubTeams = {
        "eps_administrator_team": eps_administrator_team.id,
        "eps_testers_team": eps_testers_team.id,
        "eps_team": eps_team.id
    }
    return github_teams


def set_secret(github: Github, repo_name: str, secret_name: str, secret_value: str, set_dependabot: bool):
    repo = github.get_repo(repo_name)
    if secret_value is None:
        print(f"Secret value for {secret_name} in repo {repo_name} is not set. Not setting")
        return
    print(f"Setting value for {secret_name} in repo {repo_name}")
    repo.create_secret(secret_name=secret_name,
                       unencrypted_value=secret_value,
                       secret_type="actions")
    time.sleep(1)  # Sleep for 1 second to avoid rate limiting
    if (set_dependabot):
        print(f"Setting value for {secret_name} in repo {repo_name} for dependabot")
        repo.create_secret(secret_name=secret_name,
                           unencrypted_value=secret_value,
                           secret_type="dependabot")
        time.sleep(1)  # Sleep for 1 second to avoid rate limiting


def set_role_secrets(github: Github, repo_name: str, roles: Roles, env_name: str, set_dependabot: bool):
    set_secret(github=github, repo_name=repo_name, secret_name=f"{env_name}_CLOUD_FORMATION_DEPLOY_ROLE",
               secret_value=roles["cloud_formation_deploy_role"],
               set_dependabot=set_dependabot)
    set_secret(github=github, repo_name=repo_name, secret_name=f"{env_name}_CLOUD_FORMATION_CHECK_VERSION_ROLE",
               secret_value=roles["cloud_formation_check_version_role"],
               set_dependabot=set_dependabot)
    set_secret(github=github, repo_name=repo_name, secret_name=f"{env_name}_CLOUD_FORMATION_CREATE_CHANGESET_ROLE",
               secret_value=roles["cloud_formation_prepare_changeset_role"],
               set_dependabot=set_dependabot)
    set_secret(github=github, repo_name=repo_name, secret_name=f"{env_name}_CDK_PULL_IMAGE_ROLE",
               secret_value=roles["CDK_pull_image_role"],
               set_dependabot=set_dependabot)
    set_secret(github=github, repo_name=repo_name, secret_name=f"{env_name}_CDK_PUSH_IMAGE_ROLE",
               secret_value=roles["CDK_push_image_role"],
               set_dependabot=set_dependabot)


def set_all_secrets(github: Github,
                    repo_name: str,
                    set_target_spine_servers: bool,
                    set_target_service_search_servers: bool,
                    secrets: Secrets,
                    ):
    response = input(f"Setting secrets in repo {repo_name}. Do you want to continue? (y/N): ")

    if response.lower() == "y":
        print("Continuing...")
    else:
        print("Returning.")
        return
    # common secrets
    set_secret(github=github, repo_name=repo_name, secret_name="REGRESSION_TESTS_PEM",
               secret_value=secrets["regression_test_pem"],
               set_dependabot=True)
    set_secret(github=github, repo_name=repo_name, secret_name="AUTOMERGE_PEM",
               secret_value=secrets["automerge_pem"],
               set_dependabot=True)
    set_secret(github=github, repo_name=repo_name, secret_name="AUTOMERGE_APP_ID",
               secret_value="420347",
               set_dependabot=True)

    # dev secrets
    set_secret(github=github, repo_name=repo_name, secret_name="DEV_CLOUD_FORMATION_EXECUTE_LAMBDA_ROLE",
               secret_value=secrets["dev_roles"]["release_notes_execute_lambda_role"],
               set_dependabot=False)

    # proxygen roles
    set_secret(github=github, repo_name=repo_name, secret_name="PROXYGEN_PTL_ROLE",
               secret_value=secrets["proxygen_ptl_role"],
               set_dependabot=True)
    set_secret(github=github, repo_name=repo_name, secret_name="PROXYGEN_PROD_ROLE",
               secret_value=secrets["proxygen_prod_role"],
               set_dependabot=True)

    # artillery role
    set_secret(github=github, repo_name=repo_name, secret_name="DEV_ARTILLERY_RUNNER_ROLE",
               secret_value=secrets["dev_roles"]["artillery_runner_role"],
               set_dependabot=True)
    set_secret(github=github, repo_name=repo_name, secret_name="REF_ARTILLERY_RUNNER_ROLE",
               secret_value=secrets["ref_roles"]["artillery_runner_role"],
               set_dependabot=False)

    set_role_secrets(github=github, repo_name=repo_name, roles=secrets["dev_roles"], env_name="DEV",
                     set_dependabot=True)
    set_role_secrets(github=github, repo_name=repo_name, roles=secrets["int_roles"], env_name="INT",
                     set_dependabot=False)
    set_role_secrets(github=github, repo_name=repo_name, roles=secrets["prod_roles"], env_name="PROD",
                     set_dependabot=False)
    set_role_secrets(github=github, repo_name=repo_name, roles=secrets["qa_roles"], env_name="QA",
                     set_dependabot=False)
    set_role_secrets(github=github, repo_name=repo_name, roles=secrets["ref_roles"], env_name="REF",
                     set_dependabot=False)
    set_role_secrets(github=github, repo_name=repo_name, roles=secrets["ref_roles"], env_name="REF",
                     set_dependabot=False)
    set_role_secrets(github=github, repo_name=repo_name, roles=secrets["recovery_roles"], env_name="RECOVERY",
                     set_dependabot=False)
    if set_target_spine_servers:
        set_secret(github=github,
                   repo_name=repo_name,
                   secret_name="DEV_TARGET_SPINE_SERVER",
                   secret_value=secrets["dev_target_spine_server"],
                   set_dependabot=True)
        set_secret(github=github,
                   repo_name=repo_name,
                   secret_name="REF_TARGET_SPINE_SERVER",
                   secret_value=secrets["ref_target_spine_server"],
                   set_dependabot=False)
        set_secret(github=github,
                   repo_name=repo_name,
                   secret_name="QA_TARGET_SPINE_SERVER",
                   secret_value=secrets["qa_target_spine_server"],
                   set_dependabot=False)
        set_secret(github=github,
                   repo_name=repo_name,
                   secret_name="INT_TARGET_SPINE_SERVER",
                   secret_value=secrets["int_target_spine_server"],
                   set_dependabot=False)
        set_secret(github=github,
                   repo_name=repo_name,
                   secret_name="PROD_TARGET_SPINE_SERVER",
                   secret_value=secrets["prod_target_spine_server"],
                   set_dependabot=False)
        set_secret(github=github,
                   repo_name=repo_name,
                   secret_name="RECOVERY_TARGET_SPINE_SERVER",
                   secret_value=secrets["recovery_target_spine_server"],
                   set_dependabot=False)

    if set_target_service_search_servers:
        set_secret(github=github,
                   repo_name=repo_name,
                   secret_name="DEV_TARGET_SERVICE_SEARCH_SERVER",
                   secret_value=secrets["dev_target_service_search_server"],
                   set_dependabot=True)
        set_secret(github=github,
                   repo_name=repo_name,
                   secret_name="INT_TARGET_SERVICE_SEARCH_SERVER",
                   secret_value=secrets["int_target_service_search_server"],
                   set_dependabot=False)
        set_secret(github=github,
                   repo_name=repo_name,
                   secret_name="REF_TARGET_SERVICE_SEARCH_SERVER",
                   secret_value=secrets["ref_target_service_search_server"],
                   set_dependabot=False)
        set_secret(github=github,
                   repo_name=repo_name,
                   secret_name="QA_TARGET_SERVICE_SEARCH_SERVER",
                   secret_value=secrets["qa_target_service_search_server"],
                   set_dependabot=False)
        set_secret(github=github,
                   repo_name=repo_name,
                   secret_name="PROD_TARGET_SERVICE_SEARCH_SERVER",
                   secret_value=secrets["prod_target_service_search_server"],
                   set_dependabot=False)
        set_secret(github=github,
                   repo_name=repo_name,
                   secret_name="RECOVERY_TARGET_SERVICE_SEARCH_SERVER",
                   secret_value=secrets["recovery_target_service_search_server"],
                   set_dependabot=False)


def setup_account_resources_environments(repo: Repository,
                                         environment_name: str,
                                         reviewers: list[ReviewerParams] = [],
                                         deployment_branch_policy: EnvironmentDeploymentBranchPolicyParams | None = None, # noqa E501
                                         ):
    print(f"Creating {environment_name}-ci environment")
    repo.create_environment(f"{environment_name}-ci",
                            reviewers=reviewers,
                            deployment_branch_policy=deployment_branch_policy)
    time.sleep(1)  # Sleep for 1 second to avoid rate
    print(f"Creating {environment_name}-account environment")
    repo.create_environment(f"{environment_name}-account",
                            reviewers=reviewers,
                            deployment_branch_policy=deployment_branch_policy)
    time.sleep(1)  # Sleep for 1 second to avoid rate
    print(f"Creating {environment_name}-lambda environment")
    repo.create_environment(f"{environment_name}-lambda",
                            reviewers=reviewers,
                            deployment_branch_policy=deployment_branch_policy)
    time.sleep(1)  # Sleep for 1 second to avoid rate


def setup_environments(github: Github,
                       repo_name: str,
                       set_account_resources_environments: bool,
                       github_teams: GithubTeams):
    response = input(f"Setting environments in repo {repo_name}. Do you want to continue? (y/N): ")

    if response.lower() == "y":
        print("Continuing...")
    else:
        print("Returning.")
        return
    repo = github.get_repo(repo_name)
    eps_administrator_team_reviewer: ReviewerParams = ReviewerParams("Team", github_teams["eps_administrator_team"])
    eps_team_reviewer: ReviewerParams = ReviewerParams("Team", github_teams["eps_team"])
    deployment_branch_policy = EnvironmentDeploymentBranchPolicyParams(protected_branches=True,
                                                                       custom_branch_policies=False)
    if set_account_resources_environments:
        print(f"Setting up account-resources environments in repo {repo_name}")
        setup_account_resources_environments(repo=repo, environment_name="dev")
        setup_account_resources_environments(repo=repo,
                                             environment_name="qa",
                                             reviewers=[eps_administrator_team_reviewer, eps_team_reviewer],
                                             deployment_branch_policy=deployment_branch_policy
                                             )
        setup_account_resources_environments(repo=repo,
                                             environment_name="ref",
                                             reviewers=[eps_administrator_team_reviewer, eps_team_reviewer],
                                             deployment_branch_policy=deployment_branch_policy
                                             )
        setup_account_resources_environments(repo=repo,
                                             environment_name="int",
                                             reviewers=[eps_administrator_team_reviewer, eps_team_reviewer],
                                             deployment_branch_policy=deployment_branch_policy
                                             )
        setup_account_resources_environments(repo=repo,
                                             environment_name="recovery",
                                             reviewers=[eps_administrator_team_reviewer, eps_team_reviewer]
                                             )
        setup_account_resources_environments(repo=repo,
                                             environment_name="prod",
                                             reviewers=[eps_administrator_team_reviewer],
                                             deployment_branch_policy=deployment_branch_policy
                                             )
    else:
        print(f"Creating dev environment in repo {repo_name}")
        repo.create_environment("dev")
        time.sleep(1)  # Sleep for 1 second to avoid rate limiting
        print(f"Creating dev-pr environment in repo {repo_name}")
        repo.create_environment("dev-pr")
        time.sleep(1)  # Sleep for 1 second to avoid rate

        print(f"Creating qa environment in repo {repo_name}")
        repo.create_environment("qa", reviewers=[
            eps_administrator_team_reviewer,
            eps_team_reviewer
        ], deployment_branch_policy=deployment_branch_policy)
        time.sleep(1)  # Sleep for 1 second to avoid rate

        print(f"Creating ref environment in repo {repo_name}")
        repo.create_environment("ref", reviewers=[
            eps_administrator_team_reviewer,
            eps_team_reviewer
        ])
        time.sleep(1)  # Sleep for 1 second to avoid rate

        print(f"Creating int environment in repo {repo_name}")
        repo.create_environment("int", reviewers=[
            eps_administrator_team_reviewer,
            eps_team_reviewer
        ], deployment_branch_policy=deployment_branch_policy)
        time.sleep(1)  # Sleep for 1 second to avoid rate

        print(f"Creating recovery environment in repo {repo_name}")
        repo.create_environment("recovery", reviewers=[
            eps_administrator_team_reviewer,
            eps_team_reviewer
        ])
        time.sleep(1)  # Sleep for 1 second to avoid rate

        print(f"Creating prod environment in repo {repo_name}")
        repo.create_environment("prod", reviewers=[
            eps_administrator_team_reviewer
        ], deployment_branch_policy=deployment_branch_policy)
        time.sleep(1)  # Sleep for 1 second to avoid rate


def setup_repo(github: Github,
               repo: RepoConfig,
               secrets: Secrets,
               github_teams: GithubTeams):
    set_all_secrets(github=github,
                    repo_name=repo["repo_name"],
                    set_target_spine_servers=repo["set_target_spine_servers"],
                    set_target_service_search_servers=repo["set_target_service_search_servers"],
                    secrets=secrets)
    setup_environments(github=github,
                       repo_name=repo["repo_name"],
                       set_account_resources_environments=repo["set_account_resources_environments"],
                       github_teams=github_teams)
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
    prod_exports = get_all_exports("prescription-prod")
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
    f = open(".secrets/regression_test_app.pem")
    regression_test_pem = f.read()
    f = open(".secrets/automerge.pem")
    automerge_pem = f.read()

    # set up a variable with all the roles and secrets for all environments
    secrets: Secrets = {
        "regression_test_pem": regression_test_pem,
        "automerge_pem": automerge_pem,
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
        "recovery_target_spine_server": "msg.intspineservices.nhs.uk",
        "dev_target_service_search_server": "nhsuk-apim-stag-uks.azure-api.net",
        "int_target_service_search_server": "api.nhs.uk",
        "prod_target_service_search_server": "api.nhs.uk",
        "qa_target_service_search_server": "api.nhs.uk",
        "ref_target_service_search_server": "api.nhs.uk",
        "recovery_target_service_search_server": "api.nhs.uk"
    }

    print("\n\n************************************************")
    print("************************************************")
    print(f"github_teams: {json.dumps(github_teams, indent=2)}")
    print("************************************************")
    print(f"secrets: {json.dumps(secrets, indent=2)}")
    print("************************************************")
    print("\n\n************************************************")

    repos: list[RepoConfig] = [
        {
            "repo_name": "NHSDigital/electronic-prescription-service-clinical-prescription-tracker",
            "set_target_spine_servers": True,
            "set_account_resources_environments": False,
            "set_target_service_search_servers": False
        },
        {
            "repo_name": "NHSDigital/prescriptionsforpatients",
            "set_target_spine_servers": True,
            "set_account_resources_environments": False,
            "set_target_service_search_servers": True
        },
        {
            "repo_name": "NHSDigital/prescriptions-for-patients",
            "set_target_spine_servers": False,
            "set_account_resources_environments": False,
            "set_target_service_search_servers": False
        },
        {
            "repo_name": "NHSDigital/electronic-prescription-service-api",
            "set_target_spine_servers": False,
            "set_account_resources_environments": False,
            "set_target_service_search_servers": False
        },
        {
            "repo_name": "NHSDigital/electronic-prescription-service-release-notes",
            "set_target_spine_servers": False,
            "set_account_resources_environments": False,
            "set_target_service_search_servers": False
        },
        {
            "repo_name": "NHSDigital/electronic-prescription-service-account-resources",
            "set_target_spine_servers": False,
            "set_account_resources_environments": True,
            "set_target_service_search_servers": False
        },
        {
            "repo_name": "NHSDigital/eps-prescription-status-update-api",
            "set_target_spine_servers": False,
            "set_account_resources_environments": False,
            "set_target_service_search_servers": False
        },
        {
            "repo_name": "NHSDigital/eps-FHIR-validator-lambda",
            "set_target_spine_servers": False,
            "set_account_resources_environments": False,
            "set_target_service_search_servers": False
        },
        {
            "repo_name": "NHSDigital/eps-load-test",
            "set_target_spine_servers": False,
            "set_account_resources_environments": False,
            "set_target_service_search_servers": False
        },
        {
            "repo_name": "NHSDigital/eps-prescription-tracker-ui",
            "set_target_spine_servers": False,
            "set_account_resources_environments": False,
            "set_target_service_search_servers": False
        },
        {
            "repo_name": "NHSDigital/eps-aws-dashboards",
            "set_target_spine_servers": False,
            "set_account_resources_environments": False,
            "set_target_service_search_servers": False
        },
        {
            "repo_name": "NHSDigital/eps-cdk-utils",
            "set_target_spine_servers": False,
            "set_account_resources_environments": False,
            "set_target_service_search_servers": False
        },
        {
            "repo_name": "NHSDigital/eps-vpc-resources",
            "set_target_spine_servers": False,
            "set_account_resources_environments": False,
            "set_target_service_search_servers": False
        },
        {
            "repo_name": "NHSDigital/eps-assist-me",
            "set_target_spine_servers": False,
            "set_account_resources_environments": False,
            "set_target_service_search_servers": False
        }
    ]
    for repo in repos:
        setup_repo(github=github,
                   repo=repo,
                   secrets=secrets,
                   github_teams=github_teams)


if __name__ == "__main__":
    main()

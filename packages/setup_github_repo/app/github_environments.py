"""GitHub environment creation rules for EPS repositories."""

from github.EnvironmentDeploymentBranchPolicy import EnvironmentDeploymentBranchPolicyParams
from github.EnvironmentProtectionRuleReviewer import ReviewerParams
from github.Repository import Repository

from .github_base import GithubOperationBase
from .models import RepoEnvironment


class GithubEnvironmentManager(GithubOperationBase):
    """Manage GitHub environments for EPS repositories."""

    def setup_environments(
        self,
        repo_url: str,
        set_account_resources_environments: bool,
        is_echo_repo: bool,
    ) -> None:
        if not self._confirm_action(f'Setting environments in repo {repo_url}. Do you want to continue? (y/N): '):
            return

        repo = self._github.get_repo(repo_url)
        eps_administrator_team_reviewer = ReviewerParams('Team', self._github_teams['eps_administrator_team'])
        eps_deployments_team_reviewer = ReviewerParams('Team', self._github_teams['eps_deployments_team'])
        eps_team_reviewer = ReviewerParams('Team', self._github_teams['eps_team'])
        deployment_branch_policy = EnvironmentDeploymentBranchPolicyParams(
            protected_branches=True,
            custom_branch_policies=False,
        )

        create_pull_request_environment = RepoEnvironment('create_pull_request', [], deployment_branch_policy)

        int_deployment_branch_policy = deployment_branch_policy
        if repo.name == 'NHSDigital/electronic-prescription-service-api-regression-tests':
            int_deployment_branch_policy = None

        common_environments: list[RepoEnvironment] = [
            RepoEnvironment('dev'),
            RepoEnvironment('ref', [eps_administrator_team_reviewer, eps_team_reviewer]),
            RepoEnvironment('int', [eps_administrator_team_reviewer, eps_team_reviewer], int_deployment_branch_policy),
        ]

        if set_account_resources_environments:
            environments = common_environments + [
                RepoEnvironment('recovery', [eps_administrator_team_reviewer, eps_team_reviewer]),
                RepoEnvironment('qa', [eps_administrator_team_reviewer, eps_team_reviewer], deployment_branch_policy),
                RepoEnvironment(
                    'prod',
                    [eps_administrator_team_reviewer, eps_deployments_team_reviewer],
                    deployment_branch_policy,
                ),
            ]
            for environment in environments:
                self._setup_account_resources_environments(repo=repo, environment=environment)
            self._setup_repo_environment(repo, create_pull_request_environment)
            return

        common_environments.append(create_pull_request_environment)
        if not is_echo_repo:
            environments = common_environments + [
                RepoEnvironment('dev-pr'),
                RepoEnvironment('recovery', [eps_administrator_team_reviewer, eps_team_reviewer]),
                RepoEnvironment('qa', [eps_administrator_team_reviewer, eps_team_reviewer], deployment_branch_policy),
                RepoEnvironment(
                    'prod',
                    [eps_administrator_team_reviewer, eps_deployments_team_reviewer],
                    deployment_branch_policy,
                ),
            ]
        else:
            environments = common_environments + [
                RepoEnvironment('veit'),
                RepoEnvironment('dep', [eps_administrator_team_reviewer, eps_team_reviewer], deployment_branch_policy),
                RepoEnvironment('live', [eps_administrator_team_reviewer], deployment_branch_policy),
            ]

        for environment in environments:
            self._setup_repo_environment(repo, environment)

    def _setup_account_resources_environments(self, repo: Repository, environment: RepoEnvironment) -> None:
        print(f'Setting up account-resources environments in repo {repo.name}')
        for suffix in ['ci', 'account', 'lambda']:
            print(f'Creating {environment.name}-{suffix} environment')
            repo.create_environment(
                f'{environment.name}-{suffix}',
                reviewers=environment.reviewers,
                deployment_branch_policy=environment.deployment_branch_policy,
            )
            self._sleep_for_rate_limit()

    def _setup_repo_environment(self, repo: Repository, environment: RepoEnvironment) -> None:
        print(f'Creating {environment.name} environment in repo {repo.name}')
        repo.create_environment(
            environment.name,
            reviewers=environment.reviewers,
            deployment_branch_policy=environment.deployment_branch_policy,
        )
        self._sleep_for_rate_limit()

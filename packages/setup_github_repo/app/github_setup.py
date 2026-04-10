from github import Github

from .github_access import GithubAccessManager
from .github_environments import GithubEnvironmentManager
from .github_secrets import GithubSecretManager
from .models import GithubTeams, RepoConfig, Secrets


class GithubSetupService:
    """Facade that coordinates repo access, environment, and secret setup."""

    def __init__(
        self,
        github: Github,
        github_teams: GithubTeams,
        interactive: bool = True,
        rate_limit_delay_seconds: float = 1.0,
    ):
        self._access_manager = GithubAccessManager(
            github=github,
            github_teams=github_teams,
            interactive=interactive,
            rate_limit_delay_seconds=rate_limit_delay_seconds,
        )
        self._environment_manager = GithubEnvironmentManager(
            github=github,
            github_teams=github_teams,
            interactive=interactive,
            rate_limit_delay_seconds=rate_limit_delay_seconds,
        )
        self._secret_manager = GithubSecretManager(
            github=github,
            github_teams=github_teams,
            interactive=interactive,
            rate_limit_delay_seconds=rate_limit_delay_seconds,
        )

    @staticmethod
    def get_github_teams(github: Github) -> GithubTeams:
        print('Getting github teams')
        org = github.get_organization('NHSDigital')
        eps_administrator_team = org.get_team_by_slug('eps-administrators')
        eps_testers_team = org.get_team_by_slug('eps-testers')
        eps_team = org.get_team_by_slug('eps')
        eps_deployments_team = org.get_team_by_slug('eps-deployments')

        return {
            'eps_administrator_team': eps_administrator_team.id,
            'eps_testers_team': eps_testers_team.id,
            'eps_team': eps_team.id,
            'eps_deployments_team': eps_deployments_team.id,
        }

    def setup_repo(self, repo_config: RepoConfig, secrets: Secrets) -> None:
        self._access_manager.setup_access(repo_url=repo_config['repoUrl'])
        self._environment_manager.setup_environments(
            repo_url=repo_config['repoUrl'],
            set_account_resources_environments=repo_config['isAccountResources'],
            is_echo_repo=repo_config['isEchoRepo'],
        )
        self._secret_manager.set_all_secrets(repo_config=repo_config, secrets=secrets)

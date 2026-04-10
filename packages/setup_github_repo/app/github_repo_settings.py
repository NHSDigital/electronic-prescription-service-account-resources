"""Repository-level settings management, including pull request merge options."""

from .github_base import GithubOperationBase


class GithubRepoSettingsManager(GithubOperationBase):
    """Handles repository settings that are not access, environments, or secrets."""

    def setup_general_settings(self, repo_url: str) -> None:
        if not self._confirm_action(f'Setting general settings in repo {repo_url}. Do you want to continue? (y/N): '):
            return

        print(f'Applying general repository settings in {repo_url}')
        repo = self._github.get_repo(repo_url)
        repo.edit(
            allow_merge_commit=False,
            allow_squash_merge=True,
            allow_rebase_merge=False,
            allow_auto_merge=True,
            delete_branch_on_merge=True,
            squash_merge_commit_title='PR_TITLE',
            squash_merge_commit_message='PR_BODY',
        )
        self._sleep_for_rate_limit()
        print(f'General repository settings applied in {repo_url}')

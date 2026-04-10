"""Unit tests for repository-level settings updates in GithubRepoSettingsManager."""

import unittest
from unittest.mock import MagicMock, patch

from packages.setup_github_repo.app.github_repo_settings import GithubRepoSettingsManager


class TestGithubRepoSettingsManager(unittest.TestCase):
    def test_setup_general_settings_applies_expected_pr_options(self):
        fake_repo = MagicMock()
        fake_github = MagicMock()
        fake_github.get_repo.return_value = fake_repo

        manager = GithubRepoSettingsManager(
            github=fake_github,
            github_teams={},  # type: ignore[arg-type]
            interactive=False,
            rate_limit_delay_seconds=0,
        )

        manager.setup_general_settings('NHSDigital/example-repo')

        fake_github.get_repo.assert_called_once_with('NHSDigital/example-repo')
        fake_repo.edit.assert_called_once_with(
            allow_merge_commit=False,
            allow_squash_merge=True,
            allow_rebase_merge=False,
            allow_auto_merge=True,
            delete_branch_on_merge=True,
            squash_merge_commit_title='PR_TITLE',
            squash_merge_commit_message='PR_BODY',
        )

    @patch(
        'packages.setup_github_repo.app.github_repo_settings.GithubRepoSettingsManager._confirm_action',
        return_value=False,
    )
    def test_setup_general_settings_skips_when_not_confirmed(self, _mock_confirm_action: MagicMock):
        fake_repo = MagicMock()
        fake_github = MagicMock()
        fake_github.get_repo.return_value = fake_repo

        manager = GithubRepoSettingsManager(
            github=fake_github,
            github_teams={},  # type: ignore[arg-type]
            interactive=True,
            rate_limit_delay_seconds=0,
        )

        manager.setup_general_settings('NHSDigital/example-repo')

        fake_github.get_repo.assert_not_called()
        fake_repo.edit.assert_not_called()


if __name__ == '__main__':
    unittest.main()

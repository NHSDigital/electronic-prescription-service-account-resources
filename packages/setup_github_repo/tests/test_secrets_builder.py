"""Unit tests for secrets payload creation from exports, files, and environment."""

import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from packages.setup_github_repo.app.constants import AWS_PROFILE_BY_ENV
from packages.setup_github_repo.app.secrets_builder import SecretsBuilder


class StubAwsExportsService:
    def __init__(self):
        self.requested_profiles: list[str] = []
        self.get_named_export_calls: list[tuple[str, bool]] = []

    def get_all_exports(self, profile_name: str):
        self.requested_profiles.append(profile_name)
        return [
            {'Name': 'ci-resources:CloudFormationDeployRole', 'Value': f'{profile_name}-deploy'},
            {'Name': 'ci-resources:CloudFormationCheckVersionRole', 'Value': f'{profile_name}-check'},
            {'Name': 'ci-resources:CloudFormationPrepareChangesetRole', 'Value': f'{profile_name}-changeset'},
            {'Name': 'ci-resources:ReleaseNotesExecuteLambdaRole', 'Value': f'{profile_name}-release'},
            {'Name': 'ci-resources:ArtilleryRunnerRole', 'Value': f'{profile_name}-artillery'},
            {'Name': 'ci-resources:ProxygenPTLRole', 'Value': 'ptl-role-arn'},
            {'Name': 'ci-resources:ProxygenProdRole', 'Value': 'prod-role-arn'},
        ]

    def get_role_exports(self, all_exports):
        def _find(name: str):
            return next(export['Value'] for export in all_exports if export['Name'] == name)

        return {
            'cloud_formation_deploy_role': _find('ci-resources:CloudFormationDeployRole'),
            'cloud_formation_check_version_role': _find('ci-resources:CloudFormationCheckVersionRole'),
            'cloud_formation_prepare_changeset_role': _find('ci-resources:CloudFormationPrepareChangesetRole'),
            'release_notes_execute_lambda_role': _find('ci-resources:ReleaseNotesExecuteLambdaRole'),
            'artillery_runner_role': _find('ci-resources:ArtilleryRunnerRole'),
        }

    def get_named_export(self, all_exports, export_name: str, required: bool):
        self.get_named_export_calls.append((export_name, required))
        return next(export['Value'] for export in all_exports if export['Name'] == export_name)


class TestSecretsBuilder(unittest.TestCase):
    def test_build_returns_complete_secrets_payload(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            secrets_dir = Path(temp_dir)
            (secrets_dir / 'regression_test_app.pem').write_text('regression', encoding='utf-8')
            (secrets_dir / 'eps_multi_repo_deployment.pem').write_text('multi-repo', encoding='utf-8')
            (secrets_dir / 'automerge.pem').write_text('automerge', encoding='utf-8')
            (secrets_dir / 'create_pull_request.pem').write_text('create-pr', encoding='utf-8')

            aws_exports = StubAwsExportsService()
            builder = SecretsBuilder(aws_exports=aws_exports, secrets_directory=secrets_dir)

            with patch.dict(os.environ, {'dependabot_token': 'token-123'}, clear=False):
                result = builder.build()

        self.assertEqual('regression', result['regression_test_pem'])
        self.assertEqual('multi-repo', result['eps_multi_repo_deployment_pem'])
        self.assertEqual('automerge', result['automerge_pem'])
        self.assertEqual('create-pr', result['create_pull_request_pem'])
        self.assertEqual('ptl-role-arn', result['proxygen_ptl_role'])
        self.assertEqual('prod-role-arn', result['proxygen_prod_role'])
        self.assertEqual('token-123', result['dependabot_token'])

        self.assertEqual(set(AWS_PROFILE_BY_ENV.values()), set(aws_exports.requested_profiles))
        self.assertIn(('ci-resources:ProxygenPTLRole', True), aws_exports.get_named_export_calls)
        self.assertIn(('ci-resources:ProxygenProdRole', True), aws_exports.get_named_export_calls)

    def test_build_raises_when_secret_file_missing(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            secrets_dir = Path(temp_dir)
            (secrets_dir / 'regression_test_app.pem').write_text('regression', encoding='utf-8')
            (secrets_dir / 'automerge.pem').write_text('automerge', encoding='utf-8')
            (secrets_dir / 'create_pull_request.pem').write_text('create-pr', encoding='utf-8')

            aws_exports = StubAwsExportsService()
            builder = SecretsBuilder(aws_exports=aws_exports, secrets_directory=secrets_dir)

            with self.assertRaises(FileNotFoundError):
                builder.build()


if __name__ == '__main__':
    unittest.main()

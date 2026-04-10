import json
import unittest

from packages.setup_github_repo.app.repo_status import _normalise_repo_entry, _parse_repos_payload, RepoStatusLoader


class FakeContentFile:
    def __init__(self, payload: dict):
        self.decoded_content = json.dumps(payload).encode('utf-8')


class FakeRepo:
    def __init__(self, payload: dict):
        self._payload = payload
        self.last_get_contents_args: tuple[str, str] | None = None

    def get_contents(self, path: str, ref: str):
        self.last_get_contents_args = (path, ref)
        return FakeContentFile(self._payload)


class FakeGithub:
    def __init__(self, payload: dict):
        self._repo = FakeRepo(payload)
        self.requested_repo_name: str | None = None

    def get_repo(self, repo_name: str):
        self.requested_repo_name = repo_name
        return self._repo


class TestRepoStatusParsing(unittest.TestCase):
    def test_parse_repos_payload_from_list_of_strings(self):
        payload = ['NHSDigital/repo-one', 'NHSDigital/repo-two']

        result = _parse_repos_payload(payload)

        self.assertEqual(2, len(result))
        self.assertEqual('NHSDigital/repo-one', result[0]['repoUrl'])
        self.assertFalse(result[0]['setTargetSpineServers'])
        self.assertFalse(result[0]['isAccountResources'])
        self.assertFalse(result[0]['setTargetServiceSearchServers'])
        self.assertFalse(result[0]['isEchoRepo'])

    def test_parse_repos_payload_from_repos_dict(self):
        payload = {
            'repos': {
                'NHSDigital/repo-one': {
                    'set_target_spine_servers': True,
                    'is_account_resources': True,
                    'set_target_service_search_servers': False,
                    'is_echo_repo': True,
                }
            }
        }

        result = _parse_repos_payload(payload)

        self.assertEqual(1, len(result))
        self.assertEqual('NHSDigital/repo-one', result[0]['repoUrl'])
        self.assertTrue(result[0]['setTargetSpineServers'])
        self.assertTrue(result[0]['isAccountResources'])
        self.assertFalse(result[0]['setTargetServiceSearchServers'])
        self.assertTrue(result[0]['isEchoRepo'])

    def test_normalise_repo_entry_rejects_empty_repo_url(self):
        with self.assertRaises(ValueError):
            _normalise_repo_entry({'repoUrl': '   '})

    def test_parse_repos_payload_rejects_invalid_shape(self):
        with self.assertRaises(ValueError):
            _parse_repos_payload({'notRepos': []})


class TestRepoStatusLoader(unittest.TestCase):
    def test_load_repo_configs_from_repo_status_repo(self):
        payload = {
            'repos': [
                {
                    'repoUrl': 'NHSDigital/repo-one',
                    'setTargetSpineServers': True,
                    'isAccountResources': False,
                    'setTargetServiceSearchServers': True,
                    'isEchoRepo': False,
                }
            ]
        }
        fake_github = FakeGithub(payload)
        loader = RepoStatusLoader(fake_github)  # type: ignore[arg-type]

        result = loader.load_repo_configs()

        self.assertEqual('NHSDigital/eps-repo-status', fake_github.requested_repo_name)
        self.assertEqual(('repos.json', 'main'), fake_github._repo.last_get_contents_args)
        self.assertEqual('NHSDigital/repo-one', result[0]['repoUrl'])
        self.assertTrue(result[0]['setTargetSpineServers'])
        self.assertTrue(result[0]['setTargetServiceSearchServers'])


if __name__ == '__main__':
    unittest.main()

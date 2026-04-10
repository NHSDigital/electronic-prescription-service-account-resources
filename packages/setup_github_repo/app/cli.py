import argparse

from .runner import SetupGithubRepoRunner


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        '--gh_auth_token',
        required=True,
        help=(
            "Please provide a github auth token. If authenticated with github cli this can be "
            "retrieved using 'gh auth token'"
        ),
    )

    arguments = parser.parse_args()
    runner = SetupGithubRepoRunner(gh_auth_token=arguments.gh_auth_token)
    runner.run()

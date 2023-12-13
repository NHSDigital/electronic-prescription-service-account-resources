# Electronic Prescriptions Service Account Resources

![Build](https://github.com/NHSDigital/electronic-prescription-service-account-resources/workflows/release/badge.svg?branch=main)

This is the repo containing infrastructure code that defines resources that are to be used in AWS accounts associated with the EPS project.

- `.devcontainer` Contains a dockerfile and vscode devcontainer definition
- `.github` Contains github workflows that are used for building and deploying from pull requests and releases
- `.vscode` Contains vscode workspace file
- `cloudformation/` Contains cloudformation files used to create resources for CI builds and deployments

## Contributing

Contributions to this project are welcome from anyone, providing that they conform to the [guidelines for contribution](./CONTRIBUTING.md) and the [community code of conduct](./CODE_OF_CONDUCT.md).

### Licensing

This code is dual licensed under the MIT license and the OGL (Open Government License). Any new work added to this repository must conform to the conditions of these licenses. In particular this means that this project may not depend on GPL-licensed or AGPL-licensed libraries, as these would violate the terms of those libraries' licenses.

The contents of this repository are protected by Crown Copyright (C).

## Development

It is recommended that you use visual studio code and a devcontainer as this will install all necessary components and correct versions of tools and languages.  
See https://code.visualstudio.com/docs/devcontainers/containers for details on how to set this up on your host machine.  
There is also a workspace file in .vscode that should be opened once you have started the devcontainer. The workspace file can also be opened outside of a devcontainer if you wish.  


All commits must be made using [signed commits](https://docs.github.com/en/authentication/managing-commit-signature-verification/signing-commits)

Once the steps at the link above have been completed. Add to your ~/.gnupg/gpg.conf as below:

```
use-agent
pinentry-mode loopback
```

and to your ~/.gnupg/gpg-agent.conf as below:

```
allow-loopback-pinentry
```

As described here:
https://stackoverflow.com/a/59170001

You will need to create the files, if they do not already exist.
This will ensure that your VSCode bash terminal prompts you for your GPG key password.

You can cache the gpg key passphrase by following instructions at https://superuser.com/questions/624343/keep-gnupg-credentials-cached-for-entire-user-session


### Setup

Ensure you have the following lines in the file .envrc

```
export AWS_DEFAULT_PROFILE=prescription-dev
export stack_name=<UNIQUE_NAME_FOR_YOU>
export TARGET_SPINE_SERVER=<NAME OF DEV TARGET SPINE SERVER>
```

UNIQUE_NAME_FOR_YOU should be a unique name for you with no underscores in it - eg anthony-brown-1

Once you have saved .envrc, start a new terminal in vscode and run this command to authenticate against AWS.

```
make aws-configure
```

Put the following values in:

```
SSO session name (Recommended): sso-session
SSO start URL [None]: <USE VALUE OF SSO START URL FROM AWS LOGIN COMMAND LINE ACCESS INSTRUCTIONS ACCESSED FROM https://myapps.microsoft.com>
SSO region [None]: eu-west-2
SSO registration scopes [sso:account:access]:
```

This will then open a browser window and you should authenticate with your hscic credentials
You should then select the development account and set default region to be eu-west-2.

You will now be able to use AWS CLI commands to access the dev account. You can also use the AWS extension to view resources.

When the token expires, you may need to reauthorise using `make aws-login`

### Pre-commit hooks

Some pre-commit hooks are installed as part of the install above, to run basic lint checks and ensure you can't accidentally commit invalid changes.
The pre-commit hook uses python package pre-commit and is configured in the file .pre-commit-config.yaml.
A combination of these checks are also run in CI.

### Make commands

There are `make` commands that are run as part of the CI pipeline and help alias some functionality during development.

#### install targets
- `install-python` installs python dependencies
- `install-hooks` installs git pre commit hooks
- `install` runs all install targets

#### Clean and deep-clean targets

- `deep-clean` removes any python libraries installed locally.

#### Linting and testing

- `lint` runs lint for all code
- `lint-cloudformation` runs lint for cloudformation templates
- `lint-githubactions` runs lint for github actions

#### Check licenses

- `check-licenses` checks licenses for all packages used
- `check-licenses-python` checks licenses for all python code

#### CLI Login to AWS

- `aws-configure` configures a connection to AWS
- `aws-login` reconnects to AWS from a previously configured connection

### Github folder

This .github folder contains workflows and templates related to github

- `pull_request_template.yml`: Template for pull requests.

Workflows are in the .github/workflows folder

- `combine-dependabot-prs.yml`: Workflow for combining dependabot pull requests. Runs on demand
- `pull_request.yml`: Called when pull request is opened or updated. Creates change sets for stacks against dev. The changesets are named <stack_name>-PR<PR_NO>
- `quality_checks.yml`: Runs check-licenses and linting against the repo. Called from pull_request.yml and release.yml
- `release.yml`: Run when code is merged to main branch or a tag starting v is pushed. Creates versioned changesets that are executed after being reviewed.
- `pr-link.yaml`: This workflow template links Pull Requests to Jira tickets and runs when a pull request is opened.
- `dependabot.yml`: Dependabot definition file

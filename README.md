# Electronic Prescriptions Service Account Resources

![Build](https://github.com/NHSDigital/electronic-prescription-service-account-resources/workflows/release/badge.svg?branch=main)

This is the repo containing infrastructure code that defines resources that are to be used in AWS accounts associated with the EPS project.

- `.devcontainer` Contains a dockerfile and vscode devcontainer definition
- `.github` Contains github workflows that are used for building and deploying from pull requests and releases
- `.vscode` Contains vscode workspace file
- `cloudformation/` Contains cloudformation files used to create resources for CI builds and deployments
- `privateCA/` Contains script to create self signed CA certificate and a client certificate used for mutual TLS
- `scripts/` Useful scripts

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
```

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

### Stacks

The following stacks are defined in this repository

# CI Resources

`cloudformation/ci_resources.yml` contains resources that are needed for the CI pipeline to work. This should be applied to each environment.  
This is created as part of CI pipeline.  
It creates the following resources

- OIDC provider allowing github to assume a role in the account
- Cloudformation deploy role - github runners assume this role
- Cloudformation execution role - cloudformation uses this role when applying a changeset. This has minimum permissions so if a new resource type is added, the permissions will need modifying
- CloudFormationCheckVersionRole - role used by github pipelines to check a deployed version of a stack
- ReleaseNotesExecuteLambdaRole - role used by github pipelines to execute the release notes lambda
- CloudFormationPrepareChangesetRole - role used by github pipelines to prepare a changeset
- ArtilleryRunnerRole - role used by github pipelines to run artillery
- various managed policies attached to these roles to give minimum permissions needed

# Account Resources

`cloudformation/account_resources.yml` contains resources that are account wide. This should be applied to each environment, and should be deployed before the app.
This is created as part of CI pipeline.  
It creates the following resources

- API Gateway account role with logging permissions
- Cloudwatch Logs Resource Policy
- KMS Key for Cloudwatch (API GW) logging
- Artifact bucket and KMS key - resources used by CI build are uploaded to this bucket
- Trust store bucket and KMS key - public CA certs used for mutual TLS are uploaded to this bucket
- Splunk delivery stream bucket and KMS key - cloudwatch logs that can not be delivered to splunk are put in here
- Audit logging bucket - s3 access logs from artifact, trust store and splunk delivery stream buckets are sent to here
- KMS key for encrypting SNS messages
- Secrets and KMS key - there are various secrets created for storing keys used in mutual TLS. These have a default value set, but the values are modified when creating new keys.
    - CAKeySecret - used to store the private CA key
    - CACertSecret - used to store the public CA cert
    - ClientKeySecret - used to store the private client key
    - ClientCertSecret - used to store the public client cert
    - SpinePrivateKey - used to store the spine private key
    - SpinePublicCertificate - used to store the spine public key
    - SpineASID - used to store the spine ASID
    - SpinePartyKey - used to store the spine party key
    - SpineCAChain - used to store the spine CA chain
    - ServiceSearchApiKey - used to store the service search API key
    - JiraToken - used to store token for jira
    - ConfluenceToken - used to store token for confluence
    - ProxgenPrivateKey - used to store the private key for proxygen
    - ProxgenPublicKey - used to store the public key for proxygen
    - PSUProxygenPrivateKey - used to store the private key for deploying the PSU proxy via proxygen
    - PSUProxygenPublicKey - used to store the public key for deploying the PSU proxy via proxygen
    - CPSUProxygenPrivateKey - used to store the private key for deploying the CPSU proxy via proxygen
    - CPSUProxygenPublicKey - used to store the public key for deploying the CPSU proxy via proxygen
    - SlackWebHookUrl - used to store the slack webhook url needed for the Slack Alerter lambda to post to eps alert slack channels


# Route 53 resources - environment accounts

`cloudformation/eps_environment_route53.yml` contains route 53 resources created in each environment account.  
This needs to be manually deployed to each environment.  
It creates the following resources

- route 53 hosted zone for `{environment}.{domain}.national.nhs.uk`

To deploy the stack, use the following

```
make aws-login
export AWS_PROFILE=<name of AWS profile defined in ~/.aws/config>

aws cloudformation deploy \
          --template-file cloudformation/eps_environment_route53.yml \
          --stack-name route53-resources \
          --region eu-west-2 \
          --parameter-overrides environment=<ENVIRONMENT>
```

On bootstrap or major changes, you should get the name server host names for the created zone and update the file eps_management_route53.yml and deploy it

# Route 53 resources - management account

cloudformation/eps_management_route53.yml contains route 53 resources created in the management account. This should only be applied manually to the management account.  
It creates the following resources

- route 53 hosted zone for {domain}.national.nhs.uk
- NS records for {dev, int, ref, qa, prod}.{domain}.national.nhs.uk pointing to route 53 hosted zones in each account

To deploy the stack, use the following

```
make aws-login
export AWS_PROFILE=prescription-management

aws cloudformation deploy \
          --template-file cloudformation/eps_management_route53.yml \
          --stack-name route53-resources \
          --region eu-west-2
```

# lambda_resources

`SAMtemplates/lambda_resources.yaml` contains common lambdas and resources needed per environment.  
This is created as part of CI pipeline.  
It creates the following resources

- CloudWatchKMSKey - used to encrypt cloudwatch logs
 - LambdaInsightsCloudwatchLogGroup - log group used by insights
 - LambdaInsightsLogGroupPolicy - policy to allow the use of the lambda insights log group
- SplunkSubscriptionFilterRole - used by filters on cloudwatch logs to send to splunk
- SplunkDeliveryStream - kinesis firehose delivery stream used to send cloudwatch logs to splunk
- SplunkDeliveryStreamLogGroup - log group used by SplunkDeliveryStream
- SplunkDeliveryStreamProcessor - lambda used to transform logs for sending to splunk
- SplunkDeliveryStreamProcessorRole - role used by SplunkDeliveryStreamProcessor
- SplunkDeliveryStreamProcessorLogGroup - used by SplunkDeliveryStreamProcessor lambda
- SplunkDeliveryStreamProcessorInvokeRole - used by delivery stream to invoke SplunkDeliveryStreamProcessor lambda
- CertExpiryCheckFunction & common resources - lambda used to check cert expiry
- SlackAlertsSnsTopic - SNS topic used to pass Cloudwatch (& other) alerts to the Slack Alerter lambda
- SlackAlerter & common resources - lambda used to process, format and post incoming alerts to eps alert slack channels
- LambdaInsightsCloudwatchLogGroup - log group for lambda insights
- CertExpiryCheckFunction - lambda function to check certificate expiry dates
- CertExpiryCheckFunctionScheduleEvent - schedule to run CertExpiryCheckFunction
- ExecuteProxygenPTLManagedPolicy - policy allowing execution of PTL proxygen lambdas
- ExecuteProxygenProdManagedPolicy - policy allowing execution of PROD proxygen lambdas
- ProxygenManagedPolicy - policy that proxygen lambdas use to access secrets
- ProxygenPTLInstanceDeleteFunction - lambda use to delete proxygen instances in internal-dev apigee environment
- ProxygenPTLInstanceGetFunction - lambda used to get proxygen instances in internal-dev apigee environments
- ProxygenPTLInstancePutFunction - lambda used to deploy proxy using proxygen api in PTL apigee environments
- ProxygenPTLMTLSSecretPutFunction - lambda used to create or update MTLS secrets in PTL apigee environments
- ProxygenPTLSpecPublishFunction - lambda used to update proxy spec on UAT API catalogue page
- ProxygenProdInstancePutFunction - lambda used to deploy proxy using proxygen api in PROD apigee environments
- ProxygenProdMTLSSecretPutFunction - lambda used to create or update MTLS secrets in PROD apigee environments
- ProxygenProdSpecPublishFunction - lambda used to update proxy spec on API catalogue page

PTL apigee environments are `internal-dev,internal-dev-sandbox,internal-qa,ref`
ROD apigee environments are `int,sandbox,prod`

# vpc_resources

`cloudformation/vpc_resources.yml` contains resources that are account wide. This should be applied to each environment, and should be deployed before the app.
This is created as part of CI pipeline.  
It creates the following resources

- a VPC
- Internet gateway
- NAT gateway in all 3 AZ
- ElasticIP in 3 AZ for the NAT gateways in each AZ
- Routes and route table for private subnets in each AZ
- Private subnet in each AZ
- Public subnet in each AZ

# artillery_resources

`cloudformation/artillery_resources.yml` contains resources that are account wide. This should be applied to each environment, and should be deployed before the app.
This is created as part of CI pipeline.  
It creates the following resources

- an S3 bucket named "`artilleryio-test-data-${AWS::AccountId}`"
- a standard bucket policy
- KMS key used to encrypt objects in the bucket
- alias for the KMS key
- managed policy to use the KMS key
- an artillery worker role
- a minimum policy for the worker role to allow artillery to run
- log group named "`artilleryio-log-group/artilleryio-cluster`"
- an ECS cluster named "`artilleryio-cluster`"

## Parameters for stacks

Environment specific parameters are defined in JSON files in cloudformation/env folder.

This is used to create subject claim filters used for the OIDC connection to restrict which repositories and environments can connect to AWS

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
- `cfn-guard` runs cfn-guard for sam and cloudformation templates

#### Check licenses

- `check-licenses` checks licenses for all packages used
- `check-licenses-python` checks licenses for all python code

#### CLI Login to AWS

- `aws-configure` configures a connection to AWS
- `aws-login` reconnects to AWS from a previously configured connection

### Github folder

This `.github` folder contains workflows and templates related to github

- `pull_request_template.yml`: Template for pull requests.

Workflows are in the `.github/workflows` folder

- `combine-dependabot-prs.yml`: Workflow for combining dependabot pull requests. Runs on demand
- `pull_request.yml`: Called when pull request is opened or updated. Creates change sets for stacks against dev. The changesets are named `<stack_name>-pr-<PR_NO>`
- `quality_checks.yml`: Runs check-licenses and linting against the repo. Called from pull_request.yml and release.yml
- `release.yml`: Run when code is merged to main branch or a tag starting v is pushed. Creates versioned changesets that are executed after being reviewed.
- `pr-link.yaml`: This workflow template links Pull Requests to Jira tickets and runs when a pull request is opened.
- `dependabot.yml`: Dependabot definition file
- `cloudformation.yml`: Creates a changeset for specified stack and outputs changes. Either runs it or deletes it

## Scripts

- `calculate_version.py` - used when merge to main to calculate a semver-compliant version number to name the release in github
- `check_python_licenses.sh` - check that all python libraries used have a compatible license
- `parse_parameters.py` - used in github pipelines to parse cloudformation/env files to set parameters in format that can be passed to cloudformation command
- `set_secrets.sh` - script which can be manually run to set secrets in all EPS repositories

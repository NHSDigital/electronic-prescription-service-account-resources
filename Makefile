SHELL=/bin/bash -euo pipefail
export CDK_CONFIG_accountResourcesUKStackName=account-resources-cdk-uk
export CDK_CONFIG_accountResourcesUSStackName=account-resources-cdk-us
export CDK_CONFIG_monitoringStackName=monitoring


.PHONY: install lint test

install: install-python install-node install-hooks
	sudo apt update
	sudo apt install -y faketime

install-python:
	poetry install

install-node:
	npm ci

install-hooks: install-python
	poetry run pre-commit install --install-hooks --overwrite


lint: lint-node

lint-node:
	npm run lint --workspace packages/certificateChecker
	npm run lint --workspace packages/slackAlerter
	npm run lint --workspace packages/proxygen
	npm run lint --workspace packages/lambdaJanitor
	npm run lint --workspace packages/cdk

test: generate-mock-certs
	poetry run scripts/check_policy_length.py
	npm run test --workspace packages/splunkProcessor
	npm run test --workspace packages/certificateChecker
	npm run test --workspace packages/slackAlerter
	npm run test --workspace packages/proxygen
	npm run test --workspace packages/lambdaJanitor

generate-mock-certs:
	cd packages/certificateChecker/tests && bash ./generate_mock_certs.sh

package-code:
	npm run build

clean:
	rm -rf cdk.out
	rm -rf cfn_guard_output
	rm -rf .local_config
	rm -rf packages/certificateChecker/coverage
	rm -rf packages/certificateChecker/lib
	rm -rf packages/certificateChecker/tests/mock-certs/
	rm -rf packages/splunkProcessor/lib
	rm -rf packages/splunkProcessor/coverage
	rm -rf packages/slackAlerter/coverage
	rm -rf packages/slackAlerter/lib
	rm -rf packages/proxygen/coverage
	rm -rf packages/proxygen/lib
	rm -rf packages/lambdaJanitor/coverage
	rm -rf packages/lambdaJanitor/lib
	rm -rf packages/driftDetector/coverage
	rm -rf packages/driftDetector/lib
	rm -rf dist

deep-clean: clean
	rm -rf venv
	find . -name 'node_modules' -type d -prune -exec rm -rf '{}' +
	poetry env remove --all

sam-validate: 
	sam validate --template-file SAMtemplates/lambda_resources.yaml --region eu-west-2

sam-build: sam-validate
	sam build --template-file SAMtemplates/lambda_resources.yaml --region eu-west-2

sam-deploy-package: guard-artifact_bucket guard-ARTIFACT_BUCKET_PREFIX guard-STACK_NAME guard-TEMPLATE_FILE guard-cloud_formation_execution_role guard-VERSION_NUMBER guard-PARAMETERS
	sam deploy \
		--template-file $$TEMPLATE_FILE \
		--stack-name $$STACK_NAME \
		--capabilities CAPABILITY_NAMED_IAM CAPABILITY_AUTO_EXPAND \
		--region eu-west-2 \
		--s3-bucket $$artifact_bucket \
		--s3-prefix $$ARTIFACT_BUCKET_PREFIX \
		--config-file samconfig_package_and_deploy.toml \
		--no-fail-on-empty-changeset \
		--role-arn $$cloud_formation_execution_role \
		--no-confirm-changeset \
		--force-upload \
		--tags "version=$$VERSION_NUMBER" \
		--parameter-overrides $$PARAMETERS


prepare-eps-route-53-changeset-management:
	@echo -e "\nChecking if stack exists in management ...";
	@if ! aws cloudformation describe-stacks --stack-name eps-route53-resources --profile prescription-management; then \
		echo -e "\nStack does not exist in management, creating empty stack..."; \
		aws cloudformation create-stack \
			--stack-name eps-route53-resources \
			--template-body file://cloudformation/empty_stack.yml \
			--profile prescription-management; \
		echo "Waiting for stack to be created ..."; \
		aws cloudformation wait stack-create-complete \
			--stack-name eps-route53-resources --profile prescription-management; \
	fi
	@echo -e "\nCreating changeset for stack in management ...";
	aws cloudformation create-change-set \
			--stack-name eps-route53-resources \
			--change-set-name update-eps-route-53-$$(date +"%Y-%m-%d-%H%-M%-S") \
			--change-set-type UPDATE \
			--template-body file://cloudformation/eps_management_route53.yml \
			--tags Key="stack_name",Value="eps-route53-resources" \
			--profile prescription-management

prepare-eps-route-53-changeset-environment: guard-env
	@echo -e "\nChecking if stack exists in $${env} ...";
	@if ! aws cloudformation describe-stacks --stack-name eps-route53-resources --profile prescription-$${env}; then \
		echo -e "\nStack does not exist in $${env}, creating empty stack ..."; \
		aws cloudformation create-stack \
			--stack-name eps-route53-resources \
			--template-body file://cloudformation/empty_stack.yml \
			--profile prescription-$${env}; \
		echo "Waiting for stack to be created ..."; \
		aws cloudformation wait stack-create-complete \
			--stack-name eps-route53-resources --profile prescription-$${env}; \
	fi
	@echo -e "\nCreating changeset for stack in $${env} ...";
	@aws cloudformation create-change-set \
			--stack-name eps-route53-resources \
			--change-set-name update-route-53-$$(date +"%Y-%m-%d-%H%-M%-S") \
			--change-set-type UPDATE \
			--template-body file://cloudformation/eps_environment_route53.yml \
			--tags Key="stack_name",Value="eps-$${env}-route53-resources" \
			--parameters ParameterKey=environment,ParameterValue=$${env} \
			--profile prescription-$${env}

show-eps-route-53-nameservers: guard-env
	aws cloudformation describe-stacks \
		--stack-name eps-route53-resources \
		--query "Stacks[*].Outputs[?OutputKey=='NameServers'].{OutputKey: OutputKey, OutputValue: OutputValue, Description: Description}" \
		--profile prescription-$${env}
	aws cloudformation describe-stacks \
		--stack-name eps-route53-resources \
		--query "Stacks[*].Outputs[?OutputKey=='IntCPTNameServers'].{OutputKey: OutputKey, OutputValue: OutputValue, Description: Description}" \
		--profile prescription-$${env}
	aws cloudformation describe-stacks \
		--stack-name eps-route53-resources \
		--query "Stacks[*].Outputs[?OutputKey=='ProdCPTNameServers'].{OutputKey: OutputKey, OutputValue: OutputValue, Description: Description}" \
		--profile prescription-$${env}

cdk-synth:
	CDK_APP_NAME=AccountResources \
	CDK_CONFIG_versionNumber=undefined \
	CDK_CONFIG_commitId=undefined \
	CDK_CONFIG_isPullRequest=false \
	CDK_CONFIG_environment=dev \
	CDK_CONFIG_lambdaConcurrencyThreshold=900 \
	CDK_CONFIG_lambdaConcurrencyWarningThreshold=700 \
	CDK_CONFIG_enableAlerts=false \
	CDK_CONFIG_lambdaInsightsLogGroupName=foo_bar \
	CDK_CONFIG_splunkHECEndpoint=https://example.com:8088/services/collector/event \
	CDK_CONFIG_hecToken=example-token \
	CDK_CONFIG_deploySubjectClaimFilters=foo,bar,baz \
	CDK_CONFIG_checkVersionSubjectClaimFilters=foo,bar,baz \
	CDK_CONFIG_prepareChangesetClaimFilters=foo,bar,baz \
	CDK_CONFIG_releaseNotesExecuteLambdaClaimFilters=foo,bar,baz \
	CDK_CONFIG_artilleryLoadTestRoleClaimFilters=foo,bar,baz \
	CDK_CONFIG_proxygenPTLClaimFilters=foo,bar,baz \
	CDK_CONFIG_proxygenProdClaimFilters=foo,bar,baz \
	CDK_CONFIG_CDKPullImageClaimFilters=foo,bar,baz \
	CDK_CONFIG_CDKPushImageClaimFilters=foo,bar,baz \
	CDK_CONFIG_assistMeRegressionTestClaimFilters=foo,bar,baz \
	CDK_CONFIG_assistMeDocumentSyncClaimFilters=foo,bar,baz \
	npm run cdk-synth --workspace packages/cdk/

compile:
	echo "Does nothing yet"

%:
	@$(MAKE) -f /usr/local/share/eps/Mk/common.mk $@

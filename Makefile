SHELL=/bin/bash -euo pipefail

guard-%:
	@ if [ "${${*}}" = "" ]; then \
		echo "Environment variable $* not set"; \
		exit 1; \
	fi

.PHONY: install check-licenses lint

install: install-python install-node install-hooks

install-python:
	poetry install

install-node:
	npm ci

install-hooks: install-python
	poetry run pre-commit install --install-hooks --overwrite

check-licenses: check-licenses-python check-licenses-node

check-licenses-python:
	scripts/check_python_licenses.sh

check-licenses-node:
	npm run check-licenses --workspace packages/splunkProcessor

lint: lint-cloudformation lint-node lint-githubactions lint-githubaction-scripts
lint-cloudformation:
	poetry run cfn-lint -I "cloudformation/**/*.y*ml" 2>&1 | awk '/Run scan/ { print } /^[EW][0-9]/ { print; getline; print }'
	poetry run cfn-lint -I "SAMtemplates/**/*.y*ml" 2>&1 | awk '/Run scan/ { print } /^[EW][0-9]/ { print; getline; print }'

lint-node:
	npm run lint --workspace packages/certificateChecker
	npm run lint --workspace packages/slackAlerter
	npm run lint --workspace packages/proxygen
	npm run lint --workspace packages/lambdaJanitor

lint-githubactions:
	actionlint

lint-githubaction-scripts:
	shellcheck .github/scripts/*.sh

test: generate-mock-certs
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
	rm -rf packages/splunkProcessor/lib
	rm -rf dist

deep-clean: clean
	rm -rf venv
	find . -name 'node_modules' -type d -prune -exec rm -rf '{}' +
	poetry env remove --all

aws-configure:
	aws configure sso --region eu-west-2

aws-login:
	aws sso login --sso-session sso-session

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

cfn-guard:
	./scripts/run_cfn_guard.sh

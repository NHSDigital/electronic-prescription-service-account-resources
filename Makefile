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

lint: lint-cloudformation

lint-cloudformation:
	poetry run cfn-lint -t cloudformation/*.yml

lint-githubactions:
	actionlint

test:
	npm run test --workspace packages/splunkProcessor

package-code:
	npm run build

clean:
	rm -rf packages/splunkProcessor/lib
	rm -rf dist

deep-clean: clean
	rm -rf venv
	poetry env remove --all

aws-configure:
	aws configure sso --region eu-west-2

aws-login:
	aws sso login --sso-session sso-session

sam-validate: 
	sam validate --template-file SAMtemplates/lambda_resources.yaml --region eu-west-2

sam-build: sam-validate
	sam build --template-file SAMtemplates/lambda_resources.yaml --region eu-west-2

sam-deploy-package: guard-artifact_bucket guard-artifact_bucket_prefix guard-stack_name guard-template_file guard-cloud_formation_execution_role guard-SPLUNK_HEC_TOKEN guard-SPLUNK_HEC_ENDPOINT guard-VERSION_NUMBER guard-COMMIT_ID guard-LOG_LEVEL guard-LOG_RETENTION_DAYS guard-TARGET_ENVIRONMENT
	sam deploy \
		--template-file $$template_file \
		--stack-name $$stack_name \
		--capabilities CAPABILITY_NAMED_IAM CAPABILITY_AUTO_EXPAND \
		--region eu-west-2 \
		--s3-bucket $$artifact_bucket \
		--s3-prefix $$artifact_bucket_prefix \
		--config-file samconfig_package_and_deploy.toml \
		--no-fail-on-empty-changeset \
		--role-arn $$cloud_formation_execution_role \
		--no-confirm-changeset \
		--force-upload \
		--tags "version=$$VERSION_NUMBER" \
		--parameter-overrides \
			  SplunkHECToken=$$SPLUNK_HEC_TOKEN \
			  SplunkHECEndpoint=$$SPLUNK_HEC_ENDPOINT \
			  VersionNumber=$$VERSION_NUMBER \
			  CommitId=$$COMMIT_ID \
			  LogLevel=$$LOG_LEVEL \
			  LogRetentionDays=$$LOG_RETENTION_DAYS \
			  Env=$$TARGET_ENVIRONMENT



			  TruststoreVersion=$$LATEST_TRUSTSTORE_VERSION \
			  EnableMutualTLS=$$enable_mutual_tls \
			  TargetSpineServer=$$target_spine_server \
			  EnableSplunk=true \

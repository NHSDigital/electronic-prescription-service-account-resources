guard-%:
	@ if [ "${${*}}" = "" ]; then \
		echo "Environment variable $* not set"; \
		exit 1; \
	fi

.PHONY: install build test publish release clean

install: install-python install-hooks

install-python:
	poetry install

install-hooks: install-python
	poetry run pre-commit install --install-hooks --overwrite

lint-cloudformation:
	poetry run cfn-lint -t cloudformation/*.yml


lint-githubactions:
	actionlint

lint: lint-cloudformation lint-python


clean:
	# rm -rf packages/capabilityStatement/coverage
	# rm -rf packages/getMyPrescriptions/coverage
	# rm -rf packages/middleware/coverage
	# rm -rf packages/sandbox/coverage
	# rm -rf packages/spineClient/coverage
	# rm -rf packages/splunkProcessor/coverage
	# rm -rf packages/statusLambda/coverage
	# rm -rf packages/common/testing/coverage
	# rm -rf packages/capabilityStatement/lib
	# rm -rf packages/getMyPrescriptions/lib
	# rm -rf packages/middleware/lib
	# rm -rf packages/sandbox/lib
	# rm -rf packages/spineClient/lib
	# rm -rf packages/splunkProcessor/lib
	# rm -rf packages/statusLambda/lib
	# rm -rf packages/getSecretLayer/lib
	# rm -rf packages/common/testing/lib
	# rm -rf .aws-sam

deep-clean: clean
	rm -rf .venv
	find . -name 'node_modules' -type d -prune -exec rm -rf '{}' +

check-licenses: check-licenses-python 

check-licenses-python:
	scripts/check_python_licenses.sh


aws-configure:
	aws configure sso --region eu-west-2

aws-login:
	aws sso login --sso-session sso-session

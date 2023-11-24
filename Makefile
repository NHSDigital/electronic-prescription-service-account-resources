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

lint: lint-cloudformation 

lint-cloudformation:
	poetry run cfn-lint -t cloudformation/*.yml


lint-githubactions:
	actionlint

deep-clean:
	rm -rf .venv

check-licenses: check-licenses-python 

check-licenses-python:
	scripts/check_python_licenses.sh


aws-configure:
	aws configure sso --region eu-west-2

aws-login:
	aws sso login --sso-session sso-session

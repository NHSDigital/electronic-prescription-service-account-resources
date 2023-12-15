.PHONY: install check-licenses lint

install: install-python install-hooks

install-python:
	poetry install

install-hooks: install-python
	poetry run pre-commit install --install-hooks --overwrite

check-licenses: check-licenses-python

check-licenses-python:
	scripts/check_python_licenses.sh

lint: lint-cloudformation

lint-cloudformation:
	poetry run cfn-lint -t cloudformation/*.yml

lint-githubactions:
	actionlint

deep-clean: clean
	rm -rf venv
	poetry env remove --all

aws-configure:
	aws configure sso --region eu-west-2

aws-login:
	aws sso login --sso-session sso-session

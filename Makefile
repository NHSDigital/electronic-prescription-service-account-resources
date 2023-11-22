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
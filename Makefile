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

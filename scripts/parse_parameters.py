#!/usr/bin/env python
import argparse
import json
import re
import os

EMPTY = ""


def parse_parameters(env, stack, secrets, dynamic_vars):
    """ Parse Cloudformation Parameters
    - Reads and parses json file of parameters @ cloudformation/env/<env_name>.json
    - Takes the name of the environment, the name of the stack, and any secrets to substitute as arguments
    - Also expect environment variables parameter_secrets and dynamic_vars to be set
     -This is used as they may have quotes in it which are hard to pass on command line
    - Outputs "" for no parameters
    - Outputs parameters in the form 'ParameterKey=Somekey,ParameterValue=SomeValue' for create-change-set aws cli calls
    - Parameter values can be either a string for a single value,
        a list of strings to concatenate for multiple values,
        or a string containing a reference to a secret in the format 'SECRET.<secret_name>'
    """

    with open(f"cloudformation/env/{env}.json") as f:
        d = json.load(f)

    output = []

    parsed_secrets = json.loads(secrets)
    parsed_dynamic_vars = json.loads(dynamic_vars)

    parameters = d.get("parameters")
    if not parameters:
        return EMPTY

    stack_parameters = parameters.get(stack)
    if not stack_parameters:
        return EMPTY

    for parameter_key, raw_value in stack_parameters.items():
        if not raw_value:
            return EMPTY
        elif isinstance(raw_value, str):
            value = replace_secrets(raw_value, parsed_secrets)
            value = replace_dynamic_variables(value, parsed_dynamic_vars)
            output.append({"ParameterKey": parameter_key, "ParameterValue": value})
        elif isinstance(raw_value, list):
            values = []
            for list_value in raw_value:
                value = replace_secrets(list_value, parsed_secrets)
                value = replace_dynamic_variables(value, parsed_dynamic_vars)
                values.append(value)
            concatenated_values = ','.join(values)
            output.append({"ParameterKey": parameter_key, "ParameterValue": concatenated_values})
        else:
            return EMPTY

    file_name = f"{env}-{stack}-params.json"
    with open(file_name, "w") as f:
        json.dump(output, f)
    return file_name


def replace_secrets(value, secrets):
    if value.startswith("SECRET."):
        [_, secret_name] = value.split(".")
        real_value = secrets.get(secret_name)
        return real_value
    else:
        return value


def replace_dynamic_variables(value, dynamic_vars):
    if value.startswith("VAR."):
        [_, dynamic_var_name] = value.split(".")
        real_value = dynamic_vars.get(dynamic_var_name)
        return real_value
    else:
        return value


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("env", help="the environment to parse for")
    parser.add_argument("stack", help="the stack to parse for")
    args = parser.parse_args()

    [env, _] = args.env.split("-")
    regex = re.compile(r"-pr-[\d]+", re.IGNORECASE)
    stack = regex.sub("", args.stack)

    parameter_secrets = os.environ.get("parameter_secrets", "{}")
    dynamic_vars = os.environ.get("dynamic_vars", "{}")

    print(parse_parameters(env, stack, parameter_secrets, dynamic_vars))

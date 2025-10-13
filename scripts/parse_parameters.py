#!/usr/bin/env python
import argparse
import json
import re
import os
import sys

EMPTY = ""


def parse_parameters(env, stack, secrets, dynamic_vars, output_format):
    """ Parse Cloudformation Parameters
    - Reads and parses json file of parameters @ cloudformation/env/<env_name>.json
    - Takes
        - the name of the environment
        - the name of the stack
        - any secrets to substitute
        - any dynamic vars to substitute
        - the desired output format (raw string, or json file)
    - parameter_secrets and dynamic_vars only need to be set if needed, will otherwise default to empty json
    - If there are no parameters for a stack it will output a valid empty value for the desired output format
    - Parameter values can be either a string for a single value,
        a list of strings to concatenate for multiple values,
        or a string containing a reference to a secret in the format 'SECRET.<secret_name>'
        or a number (integer or float) for numerical values.
    """

    with open(f"environmentSettings/{env}.json") as f:
        d = json.load(f)

    output = [] if output_format == "json_file" else ""

    parsed_secrets = json.loads(secrets)
    parsed_dynamic_vars = json.loads(dynamic_vars)

    parameters = d.get("parameters")
    if not parameters:
        print("invalid parameters file")
        sys.exit(1)

    stack_parameters = parameters.get(stack)
    if not stack_parameters and stack not in parameters:
        print("invalid stack")
        sys.exit(1)

    for parameter_key, raw_value in stack_parameters.items():
        if isinstance(raw_value, str):
            value = replace_secrets(raw_value, parsed_secrets)
            value = replace_dynamic_variables(value, parsed_dynamic_vars)
            if output_format == "json_file":
                output.append({"ParameterKey": parameter_key, "ParameterValue": value})
            elif output_format == "raw":
                output = f'{output}ParameterKey="{parameter_key}",ParameterValue="{value}" '
            else:
                output = f'{output}{parameter_key}="{value}"\n'
        elif isinstance(raw_value, list):
            values = []
            for list_value in raw_value:
                value = replace_secrets(list_value, parsed_secrets)
                value = replace_dynamic_variables(value, parsed_dynamic_vars)
                values.append(value)
            concatenated_values = ','.join(values)
            if output_format == "json_file":
                output.append({"ParameterKey": parameter_key, "ParameterValue": concatenated_values})
            elif output_format == "raw":
                output = f'{output}ParameterKey="{parameter_key}",ParameterValue="{concatenated_values}" '
            else:
                output = f'{output}{parameter_key}="{concatenated_values}"\n'
        elif isinstance(raw_value, (int, float)):
            value = str(raw_value)  # Convert the number to string for output consistency
            if output_format == "json_file":
                output.append({"ParameterKey": parameter_key, "ParameterValue": value})
            elif output_format == "raw":
                output = f'{output}ParameterKey="{parameter_key}",ParameterValue="{value}" '
            else:
                output = f'{output}{parameter_key}="{value}"\n'
        else:
            print(f"invalid value type for {parameter_key}, skipping...")
            continue
    if output_format == "json_file":
        file_name = f"{env}-{stack}-params.json"
        with open(file_name, "w") as f:
            json.dump(output, f)
        return file_name
    else:
        return output.rstrip()


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
    output_format = os.environ.get("output_format", "json_file")
    if output_format not in ["json_file", "raw", "env_vars"]:
        print("invalid return format")
        sys.exit(1)
    print(parse_parameters(env, stack, parameter_secrets, dynamic_vars, output_format))

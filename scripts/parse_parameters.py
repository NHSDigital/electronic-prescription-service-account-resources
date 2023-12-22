#!/usr/bin/env python
import argparse
import json

EMPTY = ""


def parse_parameters(env, stack, secrets):
    """ Parse Cloudformation Parameters
    - Reads and parses json file of parameters @ cloudformation/env/<env_name>.json
    - Takes the name of the environment, the name of the stack, and any secrets to substitute as arguments
    - Outputs "" for no parameters
    - Outputs parameters in the form 'ParameterKey=Somekey,ParameterValue=SomeValue' for create-change-set aws cli calls
    - Parameter values can be either a string for a single value,
        a list of strings to concatenate for multiple values,
        or a string containing a reference to a secret in the format 'SECRET.<secret_name>'
    """

    with open(f"cloudformation/env/{env}.json") as f:
        d = json.load(f)

    output = EMPTY

    parsed_secrets = json.loads(secrets)

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
            output = f'{output}ParameterKey="{parameter_key}",ParameterValue="\'{value}\'" '
        elif isinstance(raw_value, list):
            values = []
            for list_value in raw_value:
                value = replace_secrets(list_value, parsed_secrets)
                values.append(value)
            concatenated_values = ','.join(values)
            output = f'{output}ParameterKey="{parameter_key}",ParameterValue="\'{concatenated_values}\'" '
        else:
            return EMPTY

    return output.rstrip()


def replace_secrets(value, secrets):
    if value.startswith("SECRET."):
        [_, secret_name] = value.split(".")
        real_value = secrets.get(secret_name)
        return real_value
    else:
        return value


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("env", help="the environment to parse for")
    parser.add_argument("stack", help="the stack to parse for")
    parser.add_argument("secrets", help="secrets to substitute (json string)")
    args = parser.parse_args()
    [env, _] = args.env.split("-")

    print(parse_parameters(env, args.stack, args.secrets))

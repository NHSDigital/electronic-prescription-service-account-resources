#!/usr/bin/env python
import argparse
import json

EMPTY = ""


def parse_parameters(env, stack):
    """ Parse Cloudformation Parameters
    - Reads and parses json file of parameters @ cloudformation/env/<env_name>.json
    - Takes the name of the environment and the name of the stack as arguments
    - Outputs "" for no parameters
    - Outputs parameters in the form 'ParameterKey=Somekey,ParameterValue=SomeValue' for create-change-set aws cli calls
    - Parameter values can be either a string for a single value,
        or a list of strings to concatenate for multiple values
    """

    with open(f"cloudformation/env/{env}.json") as f:
        d = json.load(f)

    output = EMPTY

    parameters = d.get("parameters")
    if not parameters:
        return EMPTY

    stack_parameters = parameters.get(stack)
    if not stack_parameters:
        return EMPTY

    for parameter, value in stack_parameters.items():
        if not value:
            return EMPTY
        elif isinstance(value, str):
            output = f'{output}ParameterKey="{parameter}",ParameterValue="\'{value}\'" '
        elif isinstance(value, list):
            values = ','.join(value)
            output = f'{output}ParameterKey="{parameter}",ParameterValue="\'{values}\'" '
        else:
            return EMPTY

    return output.rstrip()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("env", help="the environment to parse for")
    parser.add_argument("stack", help="the stack to parse for")
    args = parser.parse_args()

    print(parse_parameters(args.env, args.stack))

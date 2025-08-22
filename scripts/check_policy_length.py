#!/usr/bin/env python
from cfn_tools import load_yaml

text = open('cloudformation/ci_resources.yml').read()
data = load_yaml(text)

policy_a = data["Resources"]["GrantCloudFormationExecutionAccessPolicyA"]["Properties"]["PolicyDocument"]
policy_b = data["Resources"]["GrantCloudFormationExecutionAccessPolicyB"]["Properties"]["PolicyDocument"]
policy_c = data["Resources"]["GrantCloudFormationExecutionAccessPolicyC"]["Properties"]["PolicyDocument"]
policy_d = data["Resources"]["GrantCloudFormationExecutionAccessPolicyD"]["Properties"]["PolicyDocument"]
policy_e = data["Resources"]["GrantCloudFormationExecutionAccessPolicyE"]["Properties"]["PolicyDocument"]

policy_a_length = len(str(policy_a))
policy_b_length = len(str(policy_b))
policy_c_length = len(str(policy_c))
policy_d_length = len(str(policy_d))
policy_e_length = len(str(policy_e))

# estimate at max length due to replacement in cloudformation template
# and how it is rendered
# max size in policy is 6144
max_length = 6300
if (policy_a_length > max_length
        or policy_b_length > max_length
        or policy_c_length > max_length
        or policy_d_length > max_length
        or policy_e_length > max_length):
    print(f"policy_a_length {policy_a_length}")
    print(f"policy_b_length {policy_b_length}")
    print(f"policy_c_length {policy_c_length}")
    print(f"policy_d_length {policy_d_length}")
    print(f"policy_e_length {policy_e_length}")
    raise Exception("Policy lengths are probably too big - please investigate")

print("Policy lengths are probably OK")

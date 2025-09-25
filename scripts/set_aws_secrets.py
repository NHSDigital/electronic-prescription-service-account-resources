import argparse
import os
import boto3


"""
This script is used to set common secrets in all aws accounts
This must be passed to this script as gh_auth_token param - eg

poetry run python scripts/set_aws_secrets.py
"""


def get_named_export(all_exports: list, export_name: str, required: bool) -> str | None:
    export_value = None

    for export in all_exports:
        if export['Name'] == export_name:
            export_value = export['Value']
            break

    if required and export_value is None:
        raise Exception(f"export {export_name} is required but not found")
    return export_value


def get_all_exports(profile_name: str) -> list:
    print(f"Getting exports for profile {profile_name}")
    session = boto3.Session(profile_name=profile_name)
    # Create a CloudFormation client
    cf_client = session.client('cloudformation')

    # Get all exports
    all_exports = []
    next_token = None

    while True:
        if next_token:
            response = cf_client.list_exports(NextToken=next_token)
        else:
            response = cf_client.list_exports()

        all_exports.extend(response.get('Exports', []))

        next_token = response.get('NextToken')
        if not next_token:
            break
    return all_exports


def get_secret_arns_and_local_values(all_exports: list, environment: str) -> list:
    secret_exports = [
        {
            "variable_name": "slack_webhook_url",
            "export_name": "account-resources:SlackWebHookUrl",
            "required": True,
            "local_value": os.environ.get(f"{environment}_slack_webhook_url")
        },
        {
            "variable_name": "splunk_hec_token",
            "export_name": "account-resources:SplunkHECToken",
            "required": True,
            "local_value": os.environ.get(f"{environment}_splunk_hec_token")
        },
        {
            "variable_name": "jira_token",
            "export_name": "account-resources:JiraToken",
            "required": True,
            "local_value": os.environ.get(f"{environment}_jira_token")
        },
        {
            "variable_name": "confluence_token",
            "export_name": "account-resources:ConfluenceToken",
            "required": True,
            "local_value": os.environ.get(f"{environment}_confluence_token")
        },
        {
            "variable_name": "spine_asid",
            "export_name": "account-resources:SpineASID",
            "required": True,
            "local_value": os.environ.get(f"{environment}_spine_asid")
        },
        {
            "variable_name": "spine_ca_chain",
            "export_name": "account-resources:SpineCAChain",
            "required": True,
            "local_value": read_local_secret(f"{environment}/spine_ca_chain")
        },
        {
            "variable_name": "spine_public_certificate",
            "export_name": "account-resources:SpinePublicCertificate",
            "required": True,
            "local_value": read_local_secret(f"{environment}/spine_public_certificate")
        },
        {
            "variable_name": "spine_private_key",
            "export_name": "account-resources:SpinePrivateKey",
            "required": True,
            "local_value": read_local_secret(f"{environment}/spine_private_key")
        },
        {
            "variable_name": "spine_party_key",
            "export_name": "account-resources:SpinePartyKey",
            "required": True,
            "local_value": os.environ.get(f"{environment}_spine_party_key")
        },
        {
            "variable_name": "eps_signing_cert_chain",
            "export_name": "secrets:epsSigningCertChain",
            "required": True,
            "local_value": read_local_secret(f"{environment}/eps_signing_cert_chain")
        },
        {
            "variable_name": "service_search_api_key",
            "export_name": "account-resources:ServiceSearchApiKey",
            "required": True,
            "local_value": os.environ.get(f"{environment}_service_search_api_key")
        },
        {
            "variable_name": "PSU_proxygen_private_key",
            "export_name": "account-resources:PSUProxygenPrivateKey",
            "required": True,
            "local_value": read_local_secret(f"{environment}/PSU_proxygen_private_key")
        },
        {
            "variable_name": "PSU_proxygen_public_key",
            "export_name": "account-resources:PSUProxygenPublicKey",
            "required": True,
            "local_value": read_local_secret(f"{environment}/PSU_proxygen_public_key")
        },
        {
            "variable_name": "CPSU_proxygen_private_key",
            "export_name": "account-resources:CPSUProxygenPrivateKey",
            "required": True,
            "local_value": read_local_secret(f"{environment}/CPSU_proxygen_private_key")
        },
        {
            "variable_name": "CPSU_proxygen_public_key",
            "export_name": "account-resources:CPSUProxygenPublicKey",
            "required": True,
            "local_value": read_local_secret(f"{environment}/CPSU_proxygen_public_key")
        },
        {
            "variable_name": "ClinicalTracker_proxygen_private_key",
            "export_name": "account-resources:ClinicalTrackerProxygenPrivateKey",
            "required": True,
            "local_value": read_local_secret(f"{environment}/ClinicalTracker_proxygen_private_key")
        },
        {
            "variable_name": "ClinicalTracker_proxygen_public_key",
            "export_name": "account-resources:ClinicalTrackerProxygenPublicKey",
            "required": True,
            "local_value": read_local_secret(f"{environment}/ClinicalTracker_proxygen_public_key")
        },
        {
            "variable_name": "FhirDispensing_proxygen_private_key",
            "export_name": "secrets:FhirDispensingProxygenPrivateKey",
            "required": True,
            "local_value": read_local_secret(f"{environment}/FhirDispensing_proxygen_private_key")
        },
        {
            "variable_name": "FhirDispensing_proxygen_public_key",
            "export_name": "secrets:FhirDispensingProxygenPublicKey",
            "required": True,
            "local_value": read_local_secret(f"{environment}/FhirDispensing_proxygen_public_key")
        },
        {
            "variable_name": "ptl_prescription_signing_public_key",
            "export_name": "secrets:ptlPrescriptionSigningPublicKey",
            "required": True,
            "local_value": read_local_secret(f"{environment}/ptl_prescription_signing_public_key")
        },
        {
            "variable_name": "ptl_prescription_signing_private_key",
            "export_name": "secrets:ptlPrescriptionSigningPrivateKey",
            "required": True,
            "local_value": read_local_secret(f"{environment}/ptl_prescription_signing_private_key")
        },
        {
            "variable_name": "PSUNotify_callback_api_key",
            "export_name": "secrets:PSUNotifyCallbackApiKey",
            "required": True,
            "local_value": os.environ.get(f"{environment}_PSUNotify_callback_api_key")
        },
        {
            "variable_name": "PSUNotify_callback_app_name",
            "export_name": "secrets:PSUNotifyCallbackAppName",
            "required": True,
            "local_value": os.environ.get(f"{environment}_PSUNotify_callback_app_name")
        },
        {
            "variable_name": "PSUNotify_app_kid",
            "export_name": "secrets:PSUNotifyAppKID",
            "required": True,
            "local_value": os.environ.get(f"{environment}_PSUNotify_app_kid")
        },
        {
            "variable_name": "PSUNotify_kid_secret",
            "export_name": "secrets:PSUNotifyAppIdSecret",
            "required": True,
            "local_value": os.environ.get(f"{environment}_PSUNotify_kid_secret")
        },
        {
            "variable_name": "PSUNotify_private_key_secret",
            "export_name": "secrets:PSUNotifyPrivateKeySecret",
            "required": True,
            "local_value": read_local_secret(f"{environment}/PSUNotify_private_key_secret")

        },
    ]

    secret_arns = []
    for secret_export in secret_exports:
        secret_arn = get_named_export(all_exports,
                                      export_name=secret_export["export_name"],
                                      required=secret_export["required"])

        secret_arns.append({
            "secret_arn": secret_arn,
            "local_value": secret_export["local_value"],
            "variable_name": secret_export["variable_name"]
        })
    return secret_arns


def read_local_secret(filename: str) -> str:
    print(f"Reading file {filename}")
    try:
        with open(f".secrets/{filename}") as f:
            return f.read()
    except IOError:
        print(f"Can non read file {filename}")
        return None


def set_secrets(profile_name: str, secret_arns_and_local_values: list):
    session = boto3.Session(profile_name=profile_name)
    # Create a secret client
    secret_client = session.client('secretsmanager')
    for secret_arn_and_local_value in secret_arns_and_local_values:
        if secret_arn_and_local_value["secret_arn"] is not None:
            aws_secret_value = secret_client.get_secret_value(SecretId=secret_arn_and_local_value["secret_arn"])
            if aws_secret_value["SecretString"] != secret_arn_and_local_value["local_value"]:
                print(f"Variable {secret_arn_and_local_value["variable_name"]} values are different")
                print(f"Secret arn: {secret_arn_and_local_value["secret_arn"]}")
                print(f"Local value: {secret_arn_and_local_value["local_value"]}")
                print(f"Secret value: {aws_secret_value["SecretString"]}")
                print("Use this to set local values")
                print(f'export {secret_arn_and_local_value["variable_name"]}={aws_secret_value["SecretString"]}')
                print(f'echo -n """{aws_secret_value["SecretString"]}""" > .secrets/{secret_arn_and_local_value["variable_name"]}') # noqa E501
                response = input("Do you want to update the secret? (y/N): ")

                if response.lower() == "y":
                    print("Setting secret...")
                    secret_client.put_secret_value(SecretId=secret_arn_and_local_value["secret_arn"],
                                                   SecretString=secret_arn_and_local_value["local_value"])
                else:
                    print("Continuing...")
                    next
            else:
                print(f"Variable {secret_arn_and_local_value["variable_name"]} values are the same. Continuing...")
            print("\n\n************************************************")
            print("************************************************\n\n")


def main():
    parser = argparse.ArgumentParser()

    parser.add_argument(
        "--environment",
        required=True,
        help="Please provide an environment to set secrets in",
        choices=["dev", "ref", "qa", "int", "prod", "recovery"]
    )

    arguments = parser.parse_args()
    # get all the exports for each environment
    all_exports = get_all_exports(profile_name=f"prescription-{arguments.environment}")
    print("Getting secret arns and local values")
    secret_arns_and_local_values = get_secret_arns_and_local_values(all_exports=all_exports,
                                                                    environment=arguments.environment)
    print("Setting secrets")
    print("************************************************")
    print("************************************************\n\n")
    set_secrets(profile_name=f"prescription-{arguments.environment}",
                secret_arns_and_local_values=secret_arns_and_local_values)


if __name__ == "__main__":
    main()

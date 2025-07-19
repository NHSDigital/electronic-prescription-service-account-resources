import argparse
import json
from typing import TypedDict
import os
import boto3


"""
This script is used to set common secrets in all aws accounts
This must be passed to this script as gh_auth_token param - eg

poetry run python scripts/set_aws_secrets.py
"""


class Secrets(TypedDict):
    slack_webhook_url: str
    splunk_hec_token: str
    jira_token: str
    confluence_token: str
    spine_asid: str
    spine_ca_chain: str
    spine_public_certificate: str
    spine_private_key: str
    spine_party_key: str
    eps_signing_cert_chain: str
    service_search_api_key: str
    PSU_proxygen_private_key: str
    PSU_proxygen_public_key: str
    CPSU_proxygen_private_key: str
    CPSU_proxygen_public_key: str
    ClinicalTracker_proxygen_private_key: str
    ClinicalTracker_proxygen_public_key: str
    FhirDispensing_proxygen_private_key: str
    FhirDispensing_proxygen_public_key: str
    ptl_prescription_signing_public_key: str
    ptl_prescription_signing_private_key: str
    PSUNotify_callback_api_key: str
    PSUNotify_callback_app_name: str
    PSUNotify_kid_secret: str
    PSUNotify_private_key_secret: str


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


def get_secret_arns(all_exports: list) -> Secrets:
    slack_webhook_url = get_named_export(all_exports=all_exports,
                                         export_name="account-resources:SlackWebHookUrl",
                                         required=True)
    splunk_hec_token = get_named_export(all_exports=all_exports,
                                        export_name="account-resources:SplunkHECToken",
                                        required=True)
    jira_token = get_named_export(all_exports=all_exports,
                                  export_name="account-resources:JiraToken",
                                  required=True)
    confluence_token = get_named_export(all_exports=all_exports,
                                        export_name="account-resources:ConfluenceToken",
                                        required=True)

    spine_asid = get_named_export(all_exports=all_exports,
                                  export_name="account-resources:SpineASID",
                                  required=True)
    spine_ca_chain = get_named_export(all_exports=all_exports,
                                      export_name="account-resources:SpineCAChain",
                                      required=True)
    spine_public_certificate = get_named_export(all_exports=all_exports,
                                                export_name="account-resources:SpinePublicCertificate",
                                                required=True)
    spine_private_key = get_named_export(all_exports=all_exports,
                                         export_name="account-resources:SpinePrivateKey",
                                         required=True)
    spine_party_key = get_named_export(all_exports=all_exports,
                                       export_name="account-resources:SpinePartyKey",
                                       required=True)
    eps_signing_cert_chain = get_named_export(all_exports=all_exports,
                                              export_name="secrets:epsSigningCertChain",
                                              required=True)

    service_search_api_key = get_named_export(all_exports=all_exports,
                                              export_name="account-resources:ServiceSearchApiKey",
                                              required=True)

    PSU_proxygen_private_key = get_named_export(all_exports=all_exports,
                                                export_name="account-resources:PSUProxygenPrivateKey",
                                                required=True)
    PSU_proxygen_public_Key = get_named_export(all_exports=all_exports,
                                               export_name="account-resources:PSUProxygenPublicKey",
                                               required=True)
    CPSU_proxygen_private_key = get_named_export(all_exports=all_exports,
                                                 export_name="account-resources:CPSUProxygenPrivateKey",
                                                 required=True)
    CPSU_proxygen_public_key = get_named_export(all_exports=all_exports,
                                                export_name="account-resources:CPSUProxygenPublicKey",
                                                required=True)

    ClinicalTracker_proxygen_private_key = get_named_export(all_exports=all_exports,
                                                            export_name="account-resources:ClinicalTrackerProxygenPrivateKey", # noqa E501
                                                            required=True)
    ClinicalTracker_proxygen_public_key = get_named_export(all_exports=all_exports,
                                                           export_name="account-resources:ClinicalTrackerProxygenPublicKey", # noqa E501
                                                           required=True)

    FhirDispensing_proxygen_private_key = get_named_export(all_exports=all_exports,
                                                           export_name="secrets:FhirDispensingProxygenPrivateKey",
                                                           required=True)
    FhirDispensing_proxygen_public_key = get_named_export(all_exports=all_exports,
                                                          export_name="secrets:FhirDispensingProxygenPublicKey",
                                                          required=True)

    ptl_prescription_signing_public_key = get_named_export(all_exports=all_exports,
                                                           export_name="secrets:ptlPrescriptionSigningPublicKey",
                                                           required=True)
    ptl_prescription_signing_private_key = get_named_export(all_exports=all_exports,
                                                            export_name="secrets:ptlPrescriptionSigningPrivateKey",
                                                            required=False)  # this should be true

    PSUNotify_callback_api_key = get_named_export(all_exports=all_exports,
                                                  export_name="secrets:PSUNotifyCallbackApiKey",
                                                  required=True)
    PSUNotify_callback_app_name = get_named_export(all_exports=all_exports,
                                                   export_name="secrets:PSUNotifyCallbackAppName",
                                                   required=True)
    PSUNotify_kid_secret = get_named_export(all_exports=all_exports,
                                            export_name="secrets:PSUNotifyKidSecret",
                                            required=True)
    PSUNotify_private_key_secret = get_named_export(all_exports=all_exports,
                                                    export_name="secrets:PSUNotifyPrivateKeySecret",
                                                    required=True)

    secret_arns: Secrets = {
        "slack_webhook_url": slack_webhook_url,
        "splunk_hec_token": splunk_hec_token,
        "jira_token": jira_token,
        "confluence_token": confluence_token,
        "spine_asid": spine_asid,
        "spine_ca_chain": spine_ca_chain,
        "spine_public_certificate": spine_public_certificate,
        "spine_private_key": spine_private_key,
        "spine_party_key": spine_party_key,
        "eps_signing_cert_chain": eps_signing_cert_chain,
        'service_search_api_key': service_search_api_key,
        "PSU_proxygen_private_key": PSU_proxygen_private_key,
        "PSU_proxygen_public_key": PSU_proxygen_public_Key,
        "CPSU_proxygen_private_key": CPSU_proxygen_private_key,
        'CPSU_proxygen_public_key': CPSU_proxygen_public_key,
        "ClinicalTracker_proxygen_private_key": ClinicalTracker_proxygen_private_key,
        "ClinicalTracker_proxygen_public_key": ClinicalTracker_proxygen_public_key,
        "FhirDispensing_proxygen_private_key": FhirDispensing_proxygen_private_key,
        "FhirDispensing_proxygen_public_key": FhirDispensing_proxygen_public_key,
        "ptl_prescription_signing_public_key": ptl_prescription_signing_public_key,
        "ptl_prescription_signing_private_key": ptl_prescription_signing_private_key,
        "PSUNotify_callback_api_key": PSUNotify_callback_api_key,
        "PSUNotify_callback_app_name": PSUNotify_callback_app_name,
        "PSUNotify_kid_secret": PSUNotify_kid_secret,
        'PSUNotify_private_key_secret': PSUNotify_private_key_secret
    }
    return secret_arns


def read_local_secret(filename: str) -> str:
    f = open(f".secrets/{filename}")
    return f.read()


def get_local_secret_values(environment: str) -> Secrets:
    slack_webhook_url = os.environ.get(f"{environment}_slack_webhook_url")
    splunk_hec_token = os.environ.get(f"{environment}_splunk_hec_token")
    jira_token = os.environ.get(f"{environment}_jira_token")
    confluence_token = os.environ.get(f"{environment}_confluence_token")
    spine_asid = os.environ.get(f"{environment}_spine_asid")
    spine_ca_chain = read_local_secret(f"{environment}_spine_ca_chain")
    spine_public_certificate = read_local_secret(f"{environment}_spine_public_certificate")
    spine_private_key = read_local_secret(f"{environment}_spine_private_key")
    spine_party_key = os.environ.get(f"{environment}_spine_party_key")
    eps_signing_cert_chain = read_local_secret(f"{environment}_eps_signing_cert_chain")
    service_search_api_key = os.environ.get(f"{environment}_service_search_api_key")
    PSU_proxygen_private_key = read_local_secret(f"{environment}_PSU_proxygen_private_key")
    PSU_proxygen_public_Key = read_local_secret(f"{environment}_PSU_proxygen_public_key")
    CPSU_proxygen_private_key = read_local_secret(f"{environment}_CPSU_proxygen_private_key")
    CPSU_proxygen_public_key = read_local_secret(f"{environment}_CPSU_proxygen_public_key")
    ClinicalTracker_proxygen_private_key = read_local_secret(f"{environment}_ClinicalTracker_proxygen_private_key")
    ClinicalTracker_proxygen_public_key = read_local_secret(f"{environment}_ClinicalTracker_proxygen_public_key")
    FhirDispensing_proxygen_private_key = read_local_secret(f"{environment}_FhirDispensing_proxygen_private_key")
    FhirDispensing_proxygen_public_key = read_local_secret(f"{environment}_FhirDispensing_proxygen_public_key")
    ptl_prescription_signing_public_key = read_local_secret(f"{environment}_ptl_prescription_signing_public_key")
    ptl_prescription_signing_private_key = read_local_secret(f"{environment}_ptl_prescription_signing_private_key")
    PSUNotify_callback_api_key = os.environ.get(f"{environment}_PSUNotify_callback_api_key")
    PSUNotify_callback_app_name = os.environ.get(f"{environment}_PSUNotify_callback_app_name")
    PSUNotify_kid_secret = os.environ.get(f"{environment}_PSUNotify_kid_secret")
    PSUNotify_private_key_secret = read_local_secret(f"{environment}_PSUNotify_private_key_secret")

    secret_values: Secrets = {
        "slack_webhook_url": slack_webhook_url,
        "splunk_hec_token": splunk_hec_token,
        "jira_token": jira_token,
        "confluence_token": confluence_token,
        "spine_asid": spine_asid,
        "spine_ca_chain": spine_ca_chain,
        "spine_public_certificate": spine_public_certificate,
        "spine_private_key": spine_private_key,
        "spine_party_key": spine_party_key,
        "eps_signing_cert_chain": eps_signing_cert_chain,
        'service_search_api_key': service_search_api_key,
        "PSU_proxygen_private_key": PSU_proxygen_private_key,
        "PSU_proxygen_public_key": PSU_proxygen_public_Key,
        "CPSU_proxygen_private_key": CPSU_proxygen_private_key,
        'CPSU_proxygen_public_key': CPSU_proxygen_public_key,
        "ClinicalTracker_proxygen_private_key": ClinicalTracker_proxygen_private_key,
        "ClinicalTracker_proxygen_public_key": ClinicalTracker_proxygen_public_key,
        "FhirDispensing_proxygen_private_key": FhirDispensing_proxygen_private_key,
        "FhirDispensing_proxygen_public_key": FhirDispensing_proxygen_public_key,
        "ptl_prescription_signing_public_key": ptl_prescription_signing_public_key,
        "ptl_prescription_signing_private_key": ptl_prescription_signing_private_key,
        "PSUNotify_callback_api_key": PSUNotify_callback_api_key,
        "PSUNotify_callback_app_name": PSUNotify_callback_app_name,
        "PSUNotify_kid_secret": PSUNotify_kid_secret,
        'PSUNotify_private_key_secret': PSUNotify_private_key_secret
    }
    return secret_values


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
    all_exports = get_all_exports(f"prescription-{arguments.environment}")
    secret_arns = get_secret_arns(all_exports=all_exports)
    secret_values = get_local_secret_values(all_exports=all_exports)
    print(f"secret_arns: {json.dumps(secret_arns, indent=2)}")
    print(f"secret_values: {json.dumps(secret_values, indent=2)}")


if __name__ == "__main__":
    main()

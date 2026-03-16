import {IRole, ManagedPolicy, PolicyStatement} from "aws-cdk-lib/aws-iam"
import {IKey} from "aws-cdk-lib/aws-kms"
import {ISecret} from "aws-cdk-lib/aws-secretsmanager"
import {Construct} from "constructs"

export interface SecretPoliciesProps {
  readonly region: string
  readonly accountId: string
  readonly cloudFormationDeployRole: IRole

  readonly PfpCAKey: ISecret
  readonly PfpCACert: ISecret
  readonly PfpClientKey: ISecret
  readonly PfpClientCert: ISecret
  readonly PfpClientSandboxKey: ISecret
  readonly PfpClientSandboxCert: ISecret
  readonly PfpProxygenPrivateKey: ISecret
  readonly PfpProxygenPublicKey: ISecret

  readonly PSUCAKey: ISecret
  readonly PSUCACert: ISecret
  readonly PSUClientKey: ISecret
  readonly PSUClientCert: ISecret
  readonly PSUClientSandboxKey: ISecret
  readonly PSUClientSandboxCert: ISecret
  readonly PSUProxygenPrivateKey: ISecret
  readonly PSUProxygenPublicKey: ISecret

  readonly ClinicalTrackerCAKey: ISecret
  readonly ClinicalTrackerCACert: ISecret
  readonly ClinicalTrackerClientKey: ISecret
  readonly ClinicalTrackerClientCert: ISecret
  readonly ClinicalTrackerClientSandboxKey: ISecret
  readonly ClinicalTrackerClientSandboxCert: ISecret
  readonly ClinicalTrackerProxygenPrivateKey: ISecret
  readonly ClinicalTrackerProxygenPublicKey: ISecret

  readonly FhirFacadeCAKey: ISecret
  readonly FhirFacadeCACert: ISecret
  readonly FhirFacadeClientKey: ISecret
  readonly FhirFacadeClientCert: ISecret
  readonly FhirFacadeClientSandboxKey: ISecret
  readonly FhirFacadeClientSandboxCert: ISecret
  readonly FhirFacadeProxygenPrivateKey: ISecret
  readonly FhirFacadeProxygenPublicKey: ISecret

  readonly secretKMSKey: IKey

}
export class SecretPolicies extends Construct {
  public readonly allowCloudFormationSecretsAccessManagedPolicy: ManagedPolicy

  public constructor(scope: Construct, id: string, props: SecretPoliciesProps) {
    super(scope, id)

    const allowCloudFormationSecretsAccessManagedPolicy =
      new ManagedPolicy(this, "AllowCloudFormationSecretsAccessManagedPolicy", {
        statements: [
          new PolicyStatement({
            actions: [
              "secretsmanager:GetSecretValue"
            ],
            resources: [
              props.PfpCAKey.secretArn,
              props.PfpCACert.secretArn,
              props.PfpClientKey.secretArn,
              props.PfpClientCert.secretArn,
              props.PfpClientSandboxKey.secretArn,
              props.PfpClientSandboxCert.secretArn,
              props.PfpProxygenPrivateKey.secretArn,
              props.PfpProxygenPublicKey.secretArn,
              props.PSUCAKey.secretArn,
              props.PSUCACert.secretArn,
              props.PSUClientKey.secretArn,
              props.PSUClientCert.secretArn,
              props.PSUClientSandboxKey.secretArn,
              props.PSUClientSandboxCert.secretArn,
              props.PSUProxygenPrivateKey.secretArn,
              props.PSUProxygenPublicKey.secretArn,
              props.ClinicalTrackerCAKey.secretArn,
              props.ClinicalTrackerCACert.secretArn,
              props.ClinicalTrackerClientKey.secretArn,
              props.ClinicalTrackerClientCert.secretArn,
              props.ClinicalTrackerClientSandboxKey.secretArn,
              props.ClinicalTrackerClientSandboxCert.secretArn,
              props.ClinicalTrackerProxygenPrivateKey.secretArn,
              props.ClinicalTrackerProxygenPublicKey.secretArn,
              props.FhirFacadeCAKey.secretArn,
              props.FhirFacadeCACert.secretArn,
              props.FhirFacadeClientKey.secretArn,
              props.FhirFacadeClientCert.secretArn,
              props.FhirFacadeClientSandboxKey.secretArn,
              props.FhirFacadeClientSandboxCert.secretArn,
              props.FhirFacadeProxygenPrivateKey.secretArn,
              props.FhirFacadeProxygenPublicKey.secretArn

            ]
          }),
          new PolicyStatement({
            actions: [
              "kms:Decrypt"
            ],
            resources: [
              props.secretKMSKey.keyArn
            ]
          })
        ],
        roles: [
          props.cloudFormationDeployRole
        ]
      })

    this.allowCloudFormationSecretsAccessManagedPolicy = allowCloudFormationSecretsAccessManagedPolicy
  }
}

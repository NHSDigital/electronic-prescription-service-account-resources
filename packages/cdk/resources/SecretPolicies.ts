import {IRole, ManagedPolicy, PolicyStatement} from "aws-cdk-lib/aws-iam"
import {IKey} from "aws-cdk-lib/aws-kms"
import {ISecret} from "aws-cdk-lib/aws-secretsmanager"
import {Construct} from "constructs"

export interface SecretPoliciesProps {
  readonly region: string
  readonly accountId: string
  readonly cloudFormationDeployRole: IRole

  readonly pfpCAKey: ISecret
  readonly pfpCACert: ISecret
  readonly pfpClientKey: ISecret
  readonly pfpClientCert: ISecret
  readonly pfpClientSandboxKey: ISecret
  readonly pfpClientSandboxCert: ISecret
  readonly pfpProxygenPrivateKey: ISecret
  readonly pfpProxygenPublicKey: ISecret

  readonly psuCAKey: ISecret
  readonly psuCACert: ISecret
  readonly psuClientKey: ISecret
  readonly psuClientCert: ISecret
  readonly psuClientSandboxKey: ISecret
  readonly psuClientSandboxCert: ISecret
  readonly psuProxygenPrivateKey: ISecret
  readonly psuProxygenPublicKey: ISecret
  readonly cpsuProxygenPublicKey: ISecret
  readonly cpsuProxygenPrivateKey: ISecret

  readonly clinicalTrackerCAKey: ISecret
  readonly clinicalTrackerCACert: ISecret
  readonly clinicalTrackerClientKey: ISecret
  readonly clinicalTrackerClientCert: ISecret
  readonly clinicalTrackerClientSandboxKey: ISecret
  readonly clinicalTrackerClientSandboxCert: ISecret
  readonly clinicalTrackerProxygenPrivateKey: ISecret
  readonly clinicalTrackerProxygenPublicKey: ISecret

  readonly fhirFacadeCAKey: ISecret
  readonly fhirFacadeCACert: ISecret
  readonly fhirFacadeClientKey: ISecret
  readonly fhirFacadeClientCert: ISecret
  readonly fhirFacadeClientSandboxKey: ISecret
  readonly fhirFacadeClientSandboxCert: ISecret
  readonly prescribingProxygenPrivateKey: ISecret
  readonly prescribingProxygenPublicKey: ISecret
  readonly dispensingProxygenPrivateKey: ISecret
  readonly dispensingProxygenPublicKey: ISecret

  readonly secretKMSKey: IKey

}
export class SecretPolicies extends Construct {
  public readonly allowCloudFormationSecretsAccessManagedPolicy: ManagedPolicy
  public readonly proxygenManagedPolicy: ManagedPolicy

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
              props.pfpCAKey.secretArn,
              props.pfpCACert.secretArn,
              props.pfpClientKey.secretArn,
              props.pfpClientCert.secretArn,
              props.pfpClientSandboxKey.secretArn,
              props.pfpClientSandboxCert.secretArn,
              props.pfpProxygenPrivateKey.secretArn,
              props.pfpProxygenPublicKey.secretArn,
              props.psuCAKey.secretArn,
              props.psuCACert.secretArn,
              props.psuClientKey.secretArn,
              props.psuClientCert.secretArn,
              props.psuClientSandboxKey.secretArn,
              props.psuClientSandboxCert.secretArn,
              props.psuProxygenPrivateKey.secretArn,
              props.psuProxygenPublicKey.secretArn,
              props.cpsuProxygenPrivateKey.secretArn,
              props.cpsuProxygenPublicKey.secretArn,
              props.clinicalTrackerCAKey.secretArn,
              props.clinicalTrackerCACert.secretArn,
              props.clinicalTrackerClientKey.secretArn,
              props.clinicalTrackerClientCert.secretArn,
              props.clinicalTrackerClientSandboxKey.secretArn,
              props.clinicalTrackerClientSandboxCert.secretArn,
              props.clinicalTrackerProxygenPrivateKey.secretArn,
              props.clinicalTrackerProxygenPublicKey.secretArn,
              props.fhirFacadeCAKey.secretArn,
              props.fhirFacadeCACert.secretArn,
              props.fhirFacadeClientKey.secretArn,
              props.fhirFacadeClientCert.secretArn,
              props.fhirFacadeClientSandboxKey.secretArn,
              props.fhirFacadeClientSandboxCert.secretArn,
              props.prescribingProxygenPrivateKey.secretArn,
              props.prescribingProxygenPublicKey.secretArn,
              props.dispensingProxygenPrivateKey.secretArn,
              props.dispensingProxygenPublicKey.secretArn
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

    const proxygenManagedPolicy =
      new ManagedPolicy(this, "ProxygenManagedPolicy", {
        statements: [
          new PolicyStatement({
            actions: [
              "secretsmanager:GetSecretValue"
            ],
            resources: [
              props.psuProxygenPrivateKey.secretArn,
              props.cpsuProxygenPrivateKey.secretArn,
              props.clinicalTrackerProxygenPublicKey.secretArn,
              props.prescribingProxygenPrivateKey.secretArn,
              props.dispensingProxygenPrivateKey.secretArn,
              props.pfpProxygenPrivateKey.secretArn
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
    this.proxygenManagedPolicy = proxygenManagedPolicy
  }
}

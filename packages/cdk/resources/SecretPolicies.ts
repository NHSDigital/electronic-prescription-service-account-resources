import {IRole, ManagedPolicy, PolicyStatement} from "aws-cdk-lib/aws-iam"
import {IKey} from "aws-cdk-lib/aws-kms"
import {ISecret} from "aws-cdk-lib/aws-secretsmanager"
import {Construct} from "constructs"
import {ProxygenSecretKeys} from "./ProxygenSecrets"

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
  readonly pfpProxygenKeys: ProxygenSecretKeys

  readonly psuCAKey: ISecret
  readonly psuCACert: ISecret
  readonly psuClientKey: ISecret
  readonly psuClientCert: ISecret
  readonly psuClientSandboxKey: ISecret
  readonly psuClientSandboxCert: ISecret
  readonly psuProxygenKeys: ProxygenSecretKeys
  readonly cpsuProxygenKeys: ProxygenSecretKeys

  readonly clinicalTrackerCAKey: ISecret
  readonly clinicalTrackerCACert: ISecret
  readonly clinicalTrackerClientKey: ISecret
  readonly clinicalTrackerClientCert: ISecret
  readonly clinicalTrackerClientSandboxKey: ISecret
  readonly clinicalTrackerClientSandboxCert: ISecret
  readonly clinicalTrackerProxygenKeys: ProxygenSecretKeys

  readonly fhirFacadeCAKey: ISecret
  readonly fhirFacadeCACert: ISecret
  readonly fhirFacadeClientKey: ISecret
  readonly fhirFacadeClientCert: ISecret
  readonly fhirFacadeClientSandboxKey: ISecret
  readonly fhirFacadeClientSandboxCert: ISecret
  readonly prescribingProxygenKeys: ProxygenSecretKeys
  readonly dispensingProxygenKeys: ProxygenSecretKeys

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
              props.pfpProxygenKeys.proxygenPrivateKey.secretArn,
              props.pfpProxygenKeys.proxygenPublicKey.secretArn,
              props.pfpProxygenKeys.proxygenKid.secretArn,
              props.pfpProxygenKeys.proxygenPTLPrivateKey.secretArn,
              props.pfpProxygenKeys.proxygenPTLPublicKey.secretArn,
              props.pfpProxygenKeys.proxygenPTLKid.secretArn,
              props.pfpProxygenKeys.proxygenProdPrivateKey.secretArn,
              props.pfpProxygenKeys.proxygenProdPublicKey.secretArn,
              props.pfpProxygenKeys.proxygenProdKid.secretArn,
              props.psuCAKey.secretArn,
              props.psuCACert.secretArn,
              props.psuClientKey.secretArn,
              props.psuClientCert.secretArn,
              props.psuClientSandboxKey.secretArn,
              props.psuClientSandboxCert.secretArn,

              props.psuProxygenKeys.proxygenPrivateKey.secretArn,
              props.psuProxygenKeys.proxygenPublicKey.secretArn,
              props.psuProxygenKeys.proxygenKid.secretArn,
              props.psuProxygenKeys.proxygenPTLPrivateKey.secretArn,
              props.psuProxygenKeys.proxygenPTLPublicKey.secretArn,
              props.psuProxygenKeys.proxygenPTLKid.secretArn,
              props.psuProxygenKeys.proxygenProdPrivateKey.secretArn,
              props.psuProxygenKeys.proxygenProdPublicKey.secretArn,
              props.psuProxygenKeys.proxygenProdKid.secretArn,

              props.cpsuProxygenKeys.proxygenPrivateKey.secretArn,
              props.cpsuProxygenKeys.proxygenPublicKey.secretArn,
              props.cpsuProxygenKeys.proxygenKid.secretArn,
              props.cpsuProxygenKeys.proxygenPTLPrivateKey.secretArn,
              props.cpsuProxygenKeys.proxygenPTLPublicKey.secretArn,
              props.cpsuProxygenKeys.proxygenPTLKid.secretArn,
              props.cpsuProxygenKeys.proxygenProdPrivateKey.secretArn,
              props.cpsuProxygenKeys.proxygenProdPublicKey.secretArn,
              props.cpsuProxygenKeys.proxygenProdKid.secretArn,

              props.clinicalTrackerCAKey.secretArn,
              props.clinicalTrackerCACert.secretArn,
              props.clinicalTrackerClientKey.secretArn,
              props.clinicalTrackerClientCert.secretArn,
              props.clinicalTrackerClientSandboxKey.secretArn,
              props.clinicalTrackerClientSandboxCert.secretArn,

              props.clinicalTrackerProxygenKeys.proxygenPrivateKey.secretArn,
              props.clinicalTrackerProxygenKeys.proxygenPublicKey.secretArn,
              props.clinicalTrackerProxygenKeys.proxygenKid.secretArn,
              props.clinicalTrackerProxygenKeys.proxygenPTLPrivateKey.secretArn,
              props.clinicalTrackerProxygenKeys.proxygenPTLPublicKey.secretArn,
              props.clinicalTrackerProxygenKeys.proxygenPTLKid.secretArn,
              props.clinicalTrackerProxygenKeys.proxygenProdPrivateKey.secretArn,
              props.clinicalTrackerProxygenKeys.proxygenProdPublicKey.secretArn,
              props.clinicalTrackerProxygenKeys.proxygenProdKid.secretArn,

              props.fhirFacadeCAKey.secretArn,
              props.fhirFacadeCACert.secretArn,
              props.fhirFacadeClientKey.secretArn,
              props.fhirFacadeClientCert.secretArn,
              props.fhirFacadeClientSandboxKey.secretArn,
              props.fhirFacadeClientSandboxCert.secretArn,

              props.prescribingProxygenKeys.proxygenPrivateKey.secretArn,
              props.prescribingProxygenKeys.proxygenPublicKey.secretArn,
              props.prescribingProxygenKeys.proxygenKid.secretArn,
              props.prescribingProxygenKeys.proxygenPTLPrivateKey.secretArn,
              props.prescribingProxygenKeys.proxygenPTLPublicKey.secretArn,
              props.prescribingProxygenKeys.proxygenPTLKid.secretArn,
              props.prescribingProxygenKeys.proxygenProdPrivateKey.secretArn,
              props.prescribingProxygenKeys.proxygenProdPublicKey.secretArn,
              props.prescribingProxygenKeys.proxygenProdKid.secretArn,

              props.dispensingProxygenKeys.proxygenPrivateKey.secretArn,
              props.dispensingProxygenKeys.proxygenPublicKey.secretArn,
              props.dispensingProxygenKeys.proxygenKid.secretArn,
              props.dispensingProxygenKeys.proxygenPTLPrivateKey.secretArn,
              props.dispensingProxygenKeys.proxygenPTLPublicKey.secretArn,
              props.dispensingProxygenKeys.proxygenPTLKid.secretArn,
              props.dispensingProxygenKeys.proxygenProdPrivateKey.secretArn,
              props.dispensingProxygenKeys.proxygenProdPublicKey.secretArn,
              props.dispensingProxygenKeys.proxygenProdKid.secretArn
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
              props.pfpProxygenKeys.proxygenPrivateKey.secretArn,
              props.pfpProxygenKeys.proxygenKid.secretArn,
              props.pfpProxygenKeys.proxygenProdPrivateKey.secretArn,
              props.pfpProxygenKeys.proxygenProdKid.secretArn,
              props.pfpProxygenKeys.proxygenPTLPrivateKey.secretArn,
              props.pfpProxygenKeys.proxygenPTLKid.secretArn,

              props.psuProxygenKeys.proxygenPrivateKey.secretArn,
              props.psuProxygenKeys.proxygenKid.secretArn,
              props.psuProxygenKeys.proxygenProdPrivateKey.secretArn,
              props.psuProxygenKeys.proxygenProdKid.secretArn,
              props.psuProxygenKeys.proxygenPTLPrivateKey.secretArn,
              props.psuProxygenKeys.proxygenPTLKid.secretArn,

              props.cpsuProxygenKeys.proxygenPrivateKey.secretArn,
              props.cpsuProxygenKeys.proxygenKid.secretArn,
              props.cpsuProxygenKeys.proxygenProdPrivateKey.secretArn,
              props.cpsuProxygenKeys.proxygenProdKid.secretArn,
              props.cpsuProxygenKeys.proxygenPTLPrivateKey.secretArn,
              props.cpsuProxygenKeys.proxygenPTLKid.secretArn,

              props.clinicalTrackerProxygenKeys.proxygenPrivateKey.secretArn,
              props.clinicalTrackerProxygenKeys.proxygenKid.secretArn,
              props.clinicalTrackerProxygenKeys.proxygenProdPrivateKey.secretArn,
              props.clinicalTrackerProxygenKeys.proxygenProdKid.secretArn,
              props.clinicalTrackerProxygenKeys.proxygenPTLPrivateKey.secretArn,
              props.clinicalTrackerProxygenKeys.proxygenPTLKid.secretArn,

              props.prescribingProxygenKeys.proxygenPrivateKey.secretArn,
              props.prescribingProxygenKeys.proxygenKid.secretArn,
              props.prescribingProxygenKeys.proxygenProdPrivateKey.secretArn,
              props.prescribingProxygenKeys.proxygenProdKid.secretArn,
              props.prescribingProxygenKeys.proxygenPTLPrivateKey.secretArn,
              props.prescribingProxygenKeys.proxygenPTLKid.secretArn,

              props.dispensingProxygenKeys.proxygenPrivateKey.secretArn,
              props.dispensingProxygenKeys.proxygenKid.secretArn,
              props.dispensingProxygenKeys.proxygenProdPrivateKey.secretArn,
              props.dispensingProxygenKeys.proxygenProdKid.secretArn,
              props.dispensingProxygenKeys.proxygenPTLPrivateKey.secretArn,
              props.dispensingProxygenKeys.proxygenPTLKid.secretArn
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

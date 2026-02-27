
import {IKey} from "aws-cdk-lib/aws-kms"
import {Construct} from "constructs"
import {StaticSecret} from "../constructs/StaticSecret"
import {ManagedPolicy, PolicyStatement} from "aws-cdk-lib/aws-iam"
import {Secret} from "aws-cdk-lib/aws-secretsmanager"

export interface ConfigSecretsProps {
  readonly stackName: string
  readonly configSecretsKmsKey: IKey
}
export class ConfigSecrets extends Construct {
  readonly accessSlackSecretsManagedPolicy: ManagedPolicy
  readonly lambdaAccessSecretsPolicy: ManagedPolicy
  readonly epsSigningCertChainManagedPolicy: ManagedPolicy
  readonly splunkHECToken: Secret
  readonly epsSigningCertChain: Secret
  readonly ptlPrescriptionSigningPrivateKey: Secret
  readonly ptlPrescriptionSigningPublicKey: Secret

  public constructor(scope: Construct, id: string, props: ConfigSecretsProps){
    super(scope, id)

    const serviceSearchApiKey = new StaticSecret(this, "ServiceSearchApiKey", {
      secretName:  `${props.stackName}-ServiceSearchApiKey`,
      description: "API key for service search",
      encryptionKey: props.configSecretsKmsKey
    })
    const slackWebHookUrl = new StaticSecret(this, "SlackWebHookUrl", {
      secretName:  `${props.stackName}-SlackWebHookUrl`,
      description: "Slack webhook URL for notifications",
      encryptionKey: props.configSecretsKmsKey
    })
    const spineASID = new StaticSecret(this, "SpineASID", {
      secretName:  `${props.stackName}-SpineASID`,
      description: "ASID for spine",
      encryptionKey: props.configSecretsKmsKey
    })
    const spineCAChain = new StaticSecret(this, "SpineCAChain", {
      secretName:  `${props.stackName}-SpineCAChain`,
      description: "CA chain for spine",
      encryptionKey: props.configSecretsKmsKey
    })
    const spinePartyKey = new StaticSecret(this, "SpinePartyKey", {
      secretName:  `${props.stackName}-SpinePartyKey`,
      description: "Party key for spine",
      encryptionKey: props.configSecretsKmsKey
    })
    const spinePrivateKey = new StaticSecret(this, "SpinePrivateKey", {
      secretName:  `${props.stackName}-SpinePrivateKey`,
      description: "Private key for spine",
      encryptionKey: props.configSecretsKmsKey
    })
    const spinePublicCertificate = new StaticSecret(this, "SpinePublicCertificate", {
      secretName:  `${props.stackName}-SpinePublicCertificate`,
      description: "Public certificate for spine",
      encryptionKey: props.configSecretsKmsKey
    })
    const splunkHECToken = new StaticSecret(this, "SplunkHECToken", {
      secretName:  `${props.stackName}-SplunkHECToken`,
      description: "Splunk HEC token",
      encryptionKey: props.configSecretsKmsKey
    })
    const epsSigningCertChain = new StaticSecret(this, "EPSSigningCertChain", {
      secretName:  `${props.stackName}-EPSSigningCertChain`,
      description: "Certificate chain for EPS signing",
      encryptionKey: props.configSecretsKmsKey
    })
    const ptlPrescriptionSigningPrivateKey = new StaticSecret(this, "PTLPrescriptionSigningPrivateKey", {
      secretName:  `${props.stackName}-PTLPrescriptionSigningPrivateKey`,
      description: "Private key for PTL prescription signing",
      encryptionKey: props.configSecretsKmsKey
    })
    const ptlPrescriptionSigningPublicKey = new StaticSecret(this, "PTLPrescriptionSigningPublicKey", {
      secretName:  `${props.stackName}-PTLPrescriptionSigningPublicKey`,
      description: "Public key for PTL prescription signing",
      encryptionKey: props.configSecretsKmsKey
    })
    const accessSlackSecretsManagedPolicy = new ManagedPolicy(this, "AccessSlackSecretsManagedPolicy", {
      statements: [
        new PolicyStatement({
          actions: [
            "secretsmanager:GetSecretValue"
          ],
          resources: [
            slackWebHookUrl.secret.secretArn
          ]
        })]
    })
    const lambdaAccessSecretsPolicy = new ManagedPolicy(this, "LambdaAccessSecretsPolicy", {
      statements: [
        new PolicyStatement({
          actions: [
            "secretsmanager:GetSecretValue"
          ],
          resources: [
            spinePrivateKey.secret.secretArn,
            spinePublicCertificate.secret.secretArn,
            spineASID.secret.secretArn,
            spinePartyKey.secret.secretArn,
            spineCAChain.secret.secretArn,
            serviceSearchApiKey.secret.secretArn
          ]
        })]
    })

    const epsSigningCertChainManagedPolicy = new ManagedPolicy(this, "epsSigningCertChainManagedPolicy", {
      statements: [
        new PolicyStatement({
          actions: [
            "secretsmanager:GetSecretValue"
          ],
          resources: [
            epsSigningCertChain.secret.secretArn
          ]
        })]
    })

    this.accessSlackSecretsManagedPolicy = accessSlackSecretsManagedPolicy
    this.lambdaAccessSecretsPolicy = lambdaAccessSecretsPolicy
    this.epsSigningCertChainManagedPolicy = epsSigningCertChainManagedPolicy
    this.splunkHECToken = splunkHECToken.secret
    this.epsSigningCertChain = epsSigningCertChain.secret
    this.ptlPrescriptionSigningPrivateKey = ptlPrescriptionSigningPrivateKey.secret
    this.ptlPrescriptionSigningPublicKey = ptlPrescriptionSigningPublicKey.secret
  }
}

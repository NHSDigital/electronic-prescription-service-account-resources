
import {IKey} from "aws-cdk-lib/aws-kms"
import {Construct} from "constructs"
import {StaticSecret} from "../constructs/StaticSecret"
import {Secret} from "aws-cdk-lib/aws-secretsmanager"

export interface ProxygenSecretsProps {
  readonly stackName: string
  readonly proxygenSecretsKmsKey: IKey
}
export class ProxygenSecrets extends Construct {
  readonly CPSUProxygenPrivateKey: Secret
  readonly CPSUProxygenPublicKey: Secret
  readonly ClinicalTrackerProxygenPrivateKey: Secret
  readonly ClinicalTrackerProxygenPublicKey: Secret
  readonly PSUProxygenPrivateKey: Secret
  readonly PSUProxygenPublicKey: Secret

  public constructor(scope: Construct, id: string, props: ProxygenSecretsProps){
    super(scope, id)

    const cpsuProxygenPrivateKey = new StaticSecret(this, "CPSUProxygenPrivateKey", {
      secretName:  `${props.stackName}-CPSU-ProxygenPrivateKey`,
      description: "Private key for cpsu proxygen",
      encryptionKey: props.proxygenSecretsKmsKey
    })
    const cpsuProxygenPublicKey = new StaticSecret(this, "CPSUProxygenPublicKey", {
      secretName:  `${props.stackName}-CPSU-ProxygenPublicKey`,
      description: "Public key for cpsu proxygen",
      encryptionKey: props.proxygenSecretsKmsKey
    })
    const clinicalTrackerProxygenPrivateKey = new StaticSecret(this, "ClinicalTrackerProxygenPrivateKey", {
      secretName:  `${props.stackName}-ClinicalTracker-ProxygenPrivateKey`,
      description: "Private key for clinical tracker proxygen",
      encryptionKey: props.proxygenSecretsKmsKey
    })
    const clinicalTrackerProxygenPublicKey = new StaticSecret(this, "ClinicalTrackerProxygenPublicKey", {
      secretName:  `${props.stackName}-ClinicalTracker-ProxygenPublicKey`,
      description: "Public key for clinical tracker proxygen",
      encryptionKey: props.proxygenSecretsKmsKey
    })
    const psuProxygenPrivateKey = new StaticSecret(this, "PSUProxygenPrivateKey", {
      secretName:  `${props.stackName}-PSU-ProxygenPrivateKey`,
      description: "Private key for PSU proxygen",
      encryptionKey: props.proxygenSecretsKmsKey
    })
    const psuProxygenPublicKey = new StaticSecret(this, "PSUProxygenPublicKey", {
      secretName:  `${props.stackName}-PSU-ProxygenPublicKey`,
      description: "Public key for PSU proxygen",
      encryptionKey: props.proxygenSecretsKmsKey
    })

    this.CPSUProxygenPrivateKey = cpsuProxygenPrivateKey.secret
    this.CPSUProxygenPublicKey = cpsuProxygenPublicKey.secret
    this.ClinicalTrackerProxygenPrivateKey = clinicalTrackerProxygenPrivateKey.secret
    this.ClinicalTrackerProxygenPublicKey = clinicalTrackerProxygenPublicKey.secret
    this.PSUProxygenPrivateKey = psuProxygenPrivateKey.secret
    this.PSUProxygenPublicKey = psuProxygenPublicKey.secret

  }
}

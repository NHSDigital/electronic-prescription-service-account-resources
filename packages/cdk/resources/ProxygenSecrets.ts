
import {IKey} from "aws-cdk-lib/aws-kms"
import {Construct} from "constructs"
import {StaticSecret} from "../constructs/StaticSecret"

export interface ProxygenSecretsProps {
  readonly stackName: string
  readonly proxygenSecretsKmsKey: IKey
}
export class ProxygenSecrets extends Construct {

  public constructor(scope: Construct, id: string, props: ProxygenSecretsProps){
    super(scope, id)

    new StaticSecret(this, "CPSUProxygenPrivateKey", {
      secretName:  `${props.stackName}-CPSU-ProxygenPrivateKey`,
      description: "Private key for cpsu proxygen",
      encryptionKey: props.proxygenSecretsKmsKey
    })
    new StaticSecret(this, "CPSUProxygenPublicKey", {
      secretName:  `${props.stackName}-CPSU-ProxygenPublicKey`,
      description: "Public key for cpsu proxygen",
      encryptionKey: props.proxygenSecretsKmsKey
    })
    new StaticSecret(this, "ClinicalTrackerProxygenPrivateKey", {
      secretName:  `${props.stackName}-ClinicalTracker-ProxygenPrivateKey`,
      description: "Private key for clinical tracker proxygen",
      encryptionKey: props.proxygenSecretsKmsKey
    })
    new StaticSecret(this, "ClinicalTrackerProxygenPublicKey", {
      secretName:  `${props.stackName}-ClinicalTracker-ProxygenPublicKey`,
      description: "Public key for clinical tracker proxygen",
      encryptionKey: props.proxygenSecretsKmsKey
    })
    new StaticSecret(this, "PSUProxygenPrivateKey", {
      secretName:  `${props.stackName}-PSU-ProxygenPrivateKey`,
      description: "Private key for PSU proxygen",
      encryptionKey: props.proxygenSecretsKmsKey
    })
    new StaticSecret(this, "PSUProxygenPublicKey", {
      secretName:  `${props.stackName}-PSU-ProxygenPublicKey`,
      description: "Public key for PSU proxygen",
      encryptionKey: props.proxygenSecretsKmsKey
    })

  }
}

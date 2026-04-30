
import {IKey} from "aws-cdk-lib/aws-kms"
import {Construct} from "constructs"
import {StaticSecret} from "../constructs/StaticSecret"
import {Secret} from "aws-cdk-lib/aws-secretsmanager"

export interface ConfigSecretsProps {
  readonly stackName: string
  readonly configSecretsKmsKey: IKey
}
export class ConfigSecrets extends Construct {
  public readonly serviceSearch3ApiKey: Secret

  public constructor(scope: Construct, id: string, props: ConfigSecretsProps){
    super(scope, id)
    const serviceSearch3ApiKey = new StaticSecret(this, "ServiceSearch3ApiKey", {
      secretName:  `${props.stackName}-ServiceSearch3ApiKey`,
      description: "Service Search 3 API Key",
      encryptionKey: props.configSecretsKmsKey
    })

    this.serviceSearch3ApiKey = serviceSearch3ApiKey.secret
  }
}

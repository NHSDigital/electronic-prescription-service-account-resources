import {SecretValue} from "aws-cdk-lib"
import {Construct} from "constructs"
import {IKey} from "aws-cdk-lib/aws-kms"
import {Secret} from "aws-cdk-lib/aws-secretsmanager"
import {NagSuppressions} from "cdk-nag"

export interface StaticSecretProps {
  readonly secretName: string
  readonly description: string
  readonly encryptionKey: IKey
}

export class StaticSecret extends Construct {

  public constructor(scope: Construct, id: string, props: StaticSecretProps){
    super(scope, id)
    const secret = new Secret(this, "staticSecret", {
      secretName: props.secretName,
      description: props.description,
      secretStringValue: SecretValue.unsafePlainText("ChangeMe"),
      encryptionKey: props.encryptionKey
    })
    NagSuppressions.addResourceSuppressions(secret, [
      {
        id: "AwsSolutions-SMG4",
        reason: "Static secret - does not need rotation"
      }
    ])

  }
}

import {Construct} from "constructs"
import {Key} from "aws-cdk-lib/aws-kms"
import {ManagedPolicy, PolicyStatement, IRole} from "aws-cdk-lib/aws-iam"
import {RemovalPolicy} from "aws-cdk-lib"

export interface SecretsEncryptionProps {
  readonly accountId: string
  readonly region: string
  readonly cloudFormationExecutionRole: IRole
}
export class SecretsEncryption extends Construct {
  public readonly secretsKmsKey: Key
  public readonly useSecretsKmsKeyManagedPolicy: ManagedPolicy
  public readonly lambdaDecryptSecretsKmsPolicy: ManagedPolicy

  public constructor(scope: Construct, id: string, props: SecretsEncryptionProps) {
    super(scope, id)

    const secretsKmsKey = new Key(this, "SecretsKMSKey", {
      enableKeyRotation: true,
      removalPolicy: RemovalPolicy.DESTROY
    })
    secretsKmsKey.addAlias("alias/SecretsKMSKeyAlias")

    const useSecretsKmsKeyManagedPolicy = new ManagedPolicy(this, "UseSecretsKMSKeyManagedPolicy", {
      statements: [
        new PolicyStatement({
          actions: [
            "kms:DescribeKey",
            "kms:GenerateDataKey*",
            "kms:Encrypt",
            "kms:ReEncrypt*",
            "kms:Decrypt"
          ],
          resources: [
            secretsKmsKey.keyArn
          ]
        })],
      roles: [
        props.cloudFormationExecutionRole
      ]
    })

    const lambdaDecryptSecretsKmsPolicy = new ManagedPolicy(this, "LambdaDecryptSecretsKMSPolicy", {
      statements: [
        new PolicyStatement({
          actions: [
            "kms:Decrypt"
          ],
          resources: [
            secretsKmsKey.keyArn
          ]
        })
      ]
    })
    this.secretsKmsKey = secretsKmsKey
    this.useSecretsKmsKeyManagedPolicy = useSecretsKmsKeyManagedPolicy
    this.lambdaDecryptSecretsKmsPolicy = lambdaDecryptSecretsKmsPolicy
  }
}

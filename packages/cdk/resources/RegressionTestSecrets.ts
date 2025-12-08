import {Duration, RemovalPolicy, SecretValue} from "aws-cdk-lib"
import {
  AccountRootPrincipal,
  Effect,
  PolicyDocument,
  PolicyStatement
} from "aws-cdk-lib/aws-iam"
import {Key} from "aws-cdk-lib/aws-kms"
import {Secret} from "aws-cdk-lib/aws-secretsmanager"
import {NagSuppressions} from "cdk-nag"
import {Construct} from "constructs"

export interface RegressionTestSecretsProps {
  readonly stackName: string
}
export class RegressionTestSecrets extends Construct {

  public constructor(scope: Construct, id: string, props: RegressionTestSecretsProps){
    super(scope, id)
    const regressionTestSecrets = [
      "CPT_FHIR_CLIENT_ID",
      "CPT_FHIR_CLIENT_SECRET",
      "EPS_ASSIST_ME_ROLE_ARN",
      "EPS_FHIR_CLIENT_ID",
      "EPS_FHIR_CLIENT_SECRET",
      "EPS_FHIR_DISPENSING_CLIENT_ID",
      "EPS_FHIR_DISPENSING_CLIENT_SECRET",
      "EPS_FHIR_PRESCRIBING_CLIENT_ID",
      "EPS_FHIR_PRESCRIBING_CLIENT_SECRET",
      "EPS_FHIR_PRESCRIBING_SHA1_CLIENT_ID",
      "EPS_FHIR_PRESCRIBING_SHA1_CLIENT_SECRET",
      "EPS_FHIR_SHA1_CLIENT_ID",
      "EPS_FHIR_SHA1_CLIENT_SECRET",
      "PFP_CLIENT_ID",
      "PFP_CLIENT_SECRET",
      "PSU_CLIENT_ID",
      "PSU_CLIENT_SECRET",
      "JWT_KID",
      "JWT_PRIVATE_KEY"
    ]
    const environments = [
      "REF",
      "INTERNAL_DEV_SANDBOX",
      "INTERNAL_DEV",
      "INT",
      "INTERNAL_QA"
    ]

    const regressionTestSecretsKmsKey = new Key(this, "RegressionTestSecretsKMSKey", {
      removalPolicy: RemovalPolicy.DESTROY,
      pendingWindow: Duration.days(7),
      alias: `${props.stackName}-RegressionTestSecretsKMSKey`,
      description: `${props.stackName}-RegressionTestSecretsKMSKey`,
      enableKeyRotation: true,
      policy: new PolicyDocument({
        statements: [
          new PolicyStatement({
            sid: "Enable IAM User Permissions",
            effect: Effect.ALLOW,
            actions: [
              "kms:*"
            ],
            principals: [
              new AccountRootPrincipal
            ],
            resources: ["*"]
          })
        ]
      })
    })
    for (const environment of environments){
      for (const regressionTestSecret of regressionTestSecrets){
        const secret = new Secret(this, `${environment}-${regressionTestSecret}`, {
          secretName: `/regression-tests/${environment}/${regressionTestSecret}`,
          description: `Regression test secret for ${regressionTestSecret} in ${environment} environment`,
          secretStringValue: SecretValue.unsafePlainText("ChangeMe"),
          encryptionKey: regressionTestSecretsKmsKey
        })
        NagSuppressions.addResourceSuppressions(secret, [
          {
            id: "AwsSolutions-SMG4",
            reason: "Static secret - does not need rotation"
          }
        ])
      }
    }
  }
}

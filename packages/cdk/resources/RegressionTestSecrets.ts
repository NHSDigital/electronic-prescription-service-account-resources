import {Duration, RemovalPolicy} from "aws-cdk-lib"
import {
  AccountRootPrincipal,
  Effect,
  PolicyDocument,
  PolicyStatement
} from "aws-cdk-lib/aws-iam"
import {Key} from "aws-cdk-lib/aws-kms"
import {Construct} from "constructs"
import {StaticSecret} from "../constructs/StaticSecret"

export interface RegressionTestSecretsProps {
  readonly stackName: string
}
export class RegressionTestSecrets extends Construct {

  public constructor(scope: Construct, id: string, props: RegressionTestSecretsProps){
    super(scope, id)

    // list of all the secrets used by regression tests
    const regressionTestSecrets = [
      "CPT_FHIR_CLIENT_ID",
      "CPT_FHIR_CLIENT_SECRET",
      "EPS_ASSIST_ME_ROLE_ARN",
      "EPS_FHIR_CLIENT_ID",
      "EPS_FHIR_CLIENT_SECRET",
      "EPS_FHIR_DISPENSING_CLIENT_ID",
      "EPS_FHIR_DISPENSING_CLIENT_SECRET",
      "EPS_FHIR_DISPENSING_JWT_PRIVATE_KEY",
      "EPS_FHIR_DISPENSING_JWT_KID",
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

    // list of all environments where regression test secrets are needed for
    const environments = [
      "REF",
      "INTERNAL_DEV_SANDBOX",
      "INTERNAL_DEV",
      "INT",
      "INTERNAL_QA"
    ]

    // create all secrets for all environments
    // note - value is ChangeMe and is set outside deployment
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
        new StaticSecret(this, `${environment}-${regressionTestSecret}-StaticSecret`, {
          secretName: `/regression-tests/${environment}/${regressionTestSecret}`,
          description: `Regression test secret for ${regressionTestSecret} in ${environment} environment`,
          encryptionKey: regressionTestSecretsKmsKey
        })
      }
    }

    // secrets for PTL prescription signing keys
    new StaticSecret(this, `ptl-Prescription-SigningPublicKey-StaticSecret`, {
      secretName: `/regression-tests/ptl-Prescription-SigningPublicKey`,
      description: `Regression test secret for SigningPublicKey`,
      encryptionKey: regressionTestSecretsKmsKey
    })
    new StaticSecret(this, `ptl-Prescription-SigningPrivateKey-StaticSecret`, {
      secretName: `/regression-tests/ptl-Prescription-SigningPrivateKey`,
      description: `Regression test secret for SigningPrivateKey`,
      encryptionKey: regressionTestSecretsKmsKey
    })

  }
}

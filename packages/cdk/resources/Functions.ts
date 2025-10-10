import {Construct} from "constructs"
import {LambdaFunction} from "../constructs/LambdaFunction"
import { LayerVersion } from "aws-cdk-lib/aws-lambda"

export interface FunctionsProps {
  readonly stackName: string
  readonly version: string
  readonly commitId: string
  readonly logRetentionInDays: number
  readonly logLevel: string
}

export class Functions extends Construct {
  functions: {[key: string]: LambdaFunction}

  public constructor(scope: Construct, id: string, props: FunctionsProps){
    super(scope, id)

    // Imports
    const parameterAndSecretsLayerArn =
      "arn:aws:lambda:eu-west-2:133256977650:layer:AWS-Parameters-and-Secrets-Lambda-Extension:20"
    const parameterAndSecretsLayer = LayerVersion.fromLayerVersionArn(
      this, "LayerFromArn", parameterAndSecretsLayerArn)

    // Resources
    const reportAlertSuppressionsLambda = new LambdaFunction(this, "ReportAlertSuppressionsLambda", {
      stackName: props.stackName,
      functionName: `${props.stackName}-suppression-reporter`,
      packageBasePath: "packages/slackAlerter",
      entryPoint: "src/suppressionReporter.ts",
      environmentVariables: {
        PARAMETERS_SECRETS_EXTENSION_HTTP_PORT: "2773"
      },
      additionalPolicies: [],
      logRetentionInDays: props.logRetentionInDays,
      logLevel: props.logLevel,
      version: props.version,
      commitId: props.commitId,
      layers: [
        parameterAndSecretsLayer
      ]
    })

    this.functions = {
      reportAlertSuppressionsLambda: reportAlertSuppressionsLambda
    }
  }
}

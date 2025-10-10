import {Construct} from "constructs"
import {LambdaFunction} from "../constructs/LambdaFunction"

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
      commitId: props.commitId
    })

    this.functions = {
      reportAlertSuppressionsLambda: reportAlertSuppressionsLambda
    }
  }
}

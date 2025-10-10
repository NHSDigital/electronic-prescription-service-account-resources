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

    const lambdaDefaultEnvironmentVariables: {[key: string]: string} = {
      NODE_OPTIONS: "--enable-source-maps",
      VERSION_NUMBER: props.version,
      COMMIT_ID: props.commitId
    }

    // Resources
    const reportAlertSuppressionsLambda = new LambdaFunction(this, "ReportAlertSuppressionsLambda", {
      stackName: props.stackName,
      functionName: `${props.stackName}-suppression-reporter`,
      packageBasePath: "packages/slackAlerter",
      entryPoint: "src/suppressionReporter.ts",
      environmentVariables: {...lambdaDefaultEnvironmentVariables},
      additionalPolicies: [],
      logRetentionInDays: props.logRetentionInDays,
      logLevel: props.logLevel
    })

    this.functions = {
      reportAlertSuppressionsLambda: reportAlertSuppressionsLambda
    }
  }
}

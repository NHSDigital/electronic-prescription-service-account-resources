import {Construct} from "constructs"
import {LayerVersion} from "aws-cdk-lib/aws-lambda"
import {IStringParameter} from "aws-cdk-lib/aws-ssm"
import {ManagedPolicy, PolicyStatement} from "aws-cdk-lib/aws-iam"
import {Stack} from "aws-cdk-lib"
import {TypescriptLambdaFunction} from "@nhsdigital/eps-cdk-constructs"
import {resolve} from "path"

export interface FunctionsProps {
  readonly stackName: string
  readonly version: string
  readonly commitId: string
  readonly logRetentionInDays: number
  readonly logLevel: string
  readonly alertSuppressionsParameter: IStringParameter
}

export class Functions extends Construct {
  functions: {[key: string]: TypescriptLambdaFunction}

  public constructor(scope: Construct, id: string, props: FunctionsProps){
    super(scope, id)

    // Imports
    const parameterAndSecretsLayerArn =
      "arn:aws:lambda:eu-west-2:133256977650:layer:AWS-Parameters-and-Secrets-Lambda-Extension:20"
    const parameterAndSecretsLayer = LayerVersion.fromLayerVersionArn(
      this, "LayerFromArn", parameterAndSecretsLayerArn)

    // Resources

    const readAlertSuppressionsPolicy = new ManagedPolicy(this, "ReadAlertSuppressionsPolicy", {
      description: `read ${props.alertSuppressionsParameter.parameterName} SSM parameter`,
      statements: [
        new PolicyStatement({
          actions: [
            "ssm:GetParameter",
            "ssm:GetParameters",
            "ssm:GetParametersByPath"
          ],
          resources: [
            props.alertSuppressionsParameter.parameterArn
          ]
        }),
        new PolicyStatement({
          actions: [
            "secretsmanager:GetSecretValue"
          ],
          resources: [
            // eslint-disable-next-line max-len
            `arn:aws:secretsmanager:${Stack.of(this).region}:${Stack.of(this).account}:secret:account-resources-SlackWebhookUrl*`
          ]
        })
      ]
    })
    const reportAlertSuppressionsLambda = new TypescriptLambdaFunction(this, "ReportAlertSuppressionsLambda", {
      functionName: `${props.stackName}-suppression-reporter`,
      packageBasePath: "packages/slackAlerter",
      entryPoint: "src/suppressionReporter.ts",
      environmentVariables: {
        PARAMETERS_SECRETS_EXTENSION_HTTP_PORT: "2773"
      },
      additionalPolicies: [readAlertSuppressionsPolicy],
      logRetentionInDays: props.logRetentionInDays,
      logLevel: props.logLevel,
      version: props.version,
      commitId: props.commitId,
      layers: [
        parameterAndSecretsLayer
      ],
      projectBaseDir: resolve(__dirname, "../../..")
    })

    this.functions = {
      reportAlertSuppressionsLambda: reportAlertSuppressionsLambda
    }
  }
}

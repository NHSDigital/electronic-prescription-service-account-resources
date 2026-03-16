import {Construct} from "constructs"
import {IStringParameter} from "aws-cdk-lib/aws-ssm"
import {ManagedPolicy, PolicyStatement} from "aws-cdk-lib/aws-iam"
import {Stack} from "aws-cdk-lib"
import {LogGroup} from "aws-cdk-lib/aws-logs"
import {Key} from "aws-cdk-lib/aws-kms"

export interface FunctionPoliciesProps {
  readonly alertSuppressionsParameter: IStringParameter
  readonly lambdaInsightsLogGroup: LogGroup
  readonly cloudwatchLogsKmsKey: Key
}

export class FunctionPolicies extends Construct {
  policies: {[key: string]: ManagedPolicy}

  public constructor(scope: Construct, id: string, props: FunctionPoliciesProps){
    super(scope, id)

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
    const lambdaInsightsLogGroupPolicy = new ManagedPolicy(this, "LambdaInsightsLogGroupPolicy", {
      description: "permissions to create log group and set retention policy for Lambda Insights",
      statements: [
        new PolicyStatement({
          actions: [
            "logs:CreateLogStream",
            "logs:PutLogEvents"
          ],
          resources: [
            props.lambdaInsightsLogGroup.logGroupArn
          ]
        }),
        new PolicyStatement({
          actions: [
            "kms:DescribeKey",
            "kms:GenerateDataKey",
            "kms:Encrypt",
            "kms:ReEncrypt*"
          ],
          resources: [
            props.cloudwatchLogsKmsKey.keyArn
          ]
        })
      ]
    })
    this.policies = {
      readAlertSuppressionsPolicy: readAlertSuppressionsPolicy,
      lambdaInsightsLogGroupPolicy: lambdaInsightsLogGroupPolicy
    }
  }
}

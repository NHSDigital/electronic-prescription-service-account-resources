import {Construct} from "constructs"
import {IStringParameter} from "aws-cdk-lib/aws-ssm"
import {ManagedPolicy, PolicyStatement} from "aws-cdk-lib/aws-iam"
import {Stack} from "aws-cdk-lib"
import {LogGroup} from "aws-cdk-lib/aws-logs"
import {Key} from "aws-cdk-lib/aws-kms"
import {Secret} from "aws-cdk-lib/aws-secretsmanager"
import {Queue} from "aws-cdk-lib/aws-sqs"

export interface FunctionPoliciesProps {
  readonly alertSuppressionsParameter: IStringParameter
  readonly lambdaInsightsLogGroup: LogGroup
  readonly cloudwatchLogsKmsKey: Key
  readonly clinicalTrackerCACertSecret: Secret
  readonly clinicalTrackerClientCertSecret: Secret
  readonly clinicalTrackerClientSandboxCertSecret: Secret
  readonly pfpCACertSecret: Secret
  readonly pfpClientCertSecret: Secret
  readonly pfpClientSandboxCertSecret: Secret
  readonly psuCACertSecret: Secret
  readonly psuClientCertSecret: Secret
  readonly psuClientSandboxCertSecret: Secret
  readonly fhirFacadeCACertSecret: Secret
  readonly fhirFacadeClientCertSecret: Secret
  readonly fhirFacadeClientSandboxCertSecret: Secret
  readonly spinePublicCertificate: Secret
  readonly ptlPrescriptionSigningPublicKey: Secret
  readonly slackAlerterSqsQueue: Queue
  readonly fhirValidatorUkCoreLambdaArn?: string
}

export class FunctionPolicies extends Construct {
  public readonly readAlertSuppressionsPolicy: ManagedPolicy
  public readonly lambdaInsightsLogGroupPolicy: ManagedPolicy
  public readonly certificateCheckerManagedPolicy: ManagedPolicy
  public readonly readSlackAlerterSqsQueuePolicy: ManagedPolicy
  public readonly FHIRValidatorListLambdaPolicy: ManagedPolicy
  public readonly FHIRValidatorDeleteVersionPolicy: ManagedPolicy

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
    const certificateCheckerManagedPolicy = new ManagedPolicy(this, "CertificateCheckerManagedPolicy", {
      description: "permissions for Lambda function to check if certificate is valid",
      statements: [
        new PolicyStatement({
          actions: [
            "secretsmanager:GetSecretValue"
          ],
          resources: [
            props.clinicalTrackerCACertSecret.secretArn,
            props.clinicalTrackerClientCertSecret.secretArn,
            props.clinicalTrackerClientSandboxCertSecret.secretArn,
            props.pfpCACertSecret.secretArn,
            props.pfpClientCertSecret.secretArn,
            props.pfpClientSandboxCertSecret.secretArn,
            props.psuCACertSecret.secretArn,
            props.psuClientCertSecret.secretArn,
            props.psuClientSandboxCertSecret.secretArn,
            props.fhirFacadeCACertSecret.secretArn,
            props.fhirFacadeClientCertSecret.secretArn,
            props.fhirFacadeClientSandboxCertSecret.secretArn,
            props.spinePublicCertificate.secretArn,
            props.ptlPrescriptionSigningPublicKey.secretArn
          ]
        })
      ]
    })

    const readSlackAlerterSqsQueuePolicy = new ManagedPolicy(this, "ReadSlackAlerterSqsQueuePolicy", {
      description: "permissions for Lambda function to read Slack Alerter SQS queue",
      statements: [
        new PolicyStatement({
          actions: [
            "sqs:ChangeMessageVisibility",
            "sqs:DeleteMessage",
            "sqs:ReceiveMessage",
            "sqs:GetQueueAttributes",
            "sqs:GetQueueUrl",
            "sqs:ListQueues"
          ],
          resources: [
            props.slackAlerterSqsQueue.queueArn
          ]
        })
      ]
    })

    let FHIRValidatorListLambdaPolicy: ManagedPolicy
    let FHIRValidatorDeleteVersionPolicy: ManagedPolicy
    if (props.fhirValidatorUkCoreLambdaArn){
      FHIRValidatorListLambdaPolicy = new ManagedPolicy(this, "FHIRValidatorListLambdaPolicy", {
        description: "permissions for Lambda function to list FHIR validators",
        statements: [
          new PolicyStatement({
            actions: [
              "lambda:ListVersionsByFunction"
            ],
            resources: [
              props.fhirValidatorUkCoreLambdaArn
            ]
          })
        ]
      })

      FHIRValidatorDeleteVersionPolicy = new ManagedPolicy(this, "FHIRValidatorDeleteVersionPolicy", {
        description: "permissions for Lambda function to delete FHIR validator versions",
        statements: [
          new PolicyStatement({
            actions: [
              "lambda:DeleteFunction"
            ],
            resources: [
              `${props.fhirValidatorUkCoreLambdaArn}:*`
            ]
          })
        ]
      })
      this.FHIRValidatorListLambdaPolicy = FHIRValidatorListLambdaPolicy
      this.FHIRValidatorDeleteVersionPolicy = FHIRValidatorDeleteVersionPolicy
    }

    this.readAlertSuppressionsPolicy = readAlertSuppressionsPolicy
    this.lambdaInsightsLogGroupPolicy = lambdaInsightsLogGroupPolicy
    this.certificateCheckerManagedPolicy = certificateCheckerManagedPolicy
    this.readSlackAlerterSqsQueuePolicy = readSlackAlerterSqsQueuePolicy
  }
}

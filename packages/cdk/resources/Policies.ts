import {
  IRole,
  ManagedPolicy,
  PolicyStatement,
  ServicePrincipal
} from "aws-cdk-lib/aws-iam"
import {IKey} from "aws-cdk-lib/aws-kms"
import {ResourcePolicy} from "aws-cdk-lib/aws-logs"
import {IBucket} from "aws-cdk-lib/aws-s3"
import {Construct} from "constructs"

export interface PoliciesProps {
  readonly region: string
  readonly accountId: string
  readonly apiGwCloudWatchRole: IRole
  readonly snsFeedbackLoggingRole: IRole
  readonly splunkDeliveryStreamBackupBucketRole: IRole
  readonly CloudFormationDeployRole: IRole
  readonly cloudFormationExecutionRole: IRole
  readonly cloudFormationCheckVersionRole: IRole
  readonly cloudFormationPrepareChangesetRole: IRole
  readonly releaseNotesExecuteLambdaRole: IRole
  readonly artilleryRunnerRole: IRole
  readonly proxygenPTLRole: IRole
  readonly proxygenProdRole: IRole
  readonly CDKPullImageRole: IRole
  readonly CDKPushImageRole: IRole
  readonly assistMeRegressionTestRole: IRole
  readonly assistMeDocumentSyncRole: IRole
  readonly athenaResultsBucketKmsKey?: IKey
  readonly athenaResultsBucket?: IBucket
}
export class Policies extends Construct {
  public readonly allowApiGwLoggingPolicy: ManagedPolicy
  public readonly dashboardViewerPolicy: ManagedPolicy
  public readonly snsFeedbackLoggingPolicy: ManagedPolicy
  public readonly epsReadOnlyExtraPermissions: ManagedPolicy

  public constructor(scope: Construct, id: string, props: PoliciesProps) {
    super(scope, id)

    const allowApiGwLoggingPolicy = new ManagedPolicy(this, "AllowApiGwLoggingPolicy", {
      statements: [
        new PolicyStatement({
          actions: [
            "logs:CreateLogGroup",
            "logs:CreateLogStream",
            "logs:DescribeLogGroups",
            "logs:DescribeLogStreams",
            "logs:PutLogEvents",
            "logs:GetLogEvents",
            "logs:FilterLogEvents",
            "logs:CreateLogDelivery",
            "logs:PutResourcePolicy",
            "logs:UpdateLogDelivery",
            "logs:DeleteLogDelivery",
            "logs:DescribeResourcePolicies",
            "logs:GetLogDelivery",
            "logs:ListLogDeliveries"
          ],
          resources: [
            `arn:aws:logs:${props.region}:${props.accountId}:log-group:/aws/apigateway/*`
          ]
        })]
    })
    props.apiGwCloudWatchRole.addManagedPolicy(allowApiGwLoggingPolicy)

    // TODO - refactor to common
    const logDeliveryPolicy = new PolicyStatement({
      actions: ["logs:PutLogEvents", "logs:CreateLogStream"],
      resources: ["*"],
      principals: [new ServicePrincipal("delivery.logs.amazonaws.com")]
    })

    // this policy allows AWS services to deliver logs to CloudWatch Logs on your behalf
    // the name is set by AWS and must match exactly
    new ResourcePolicy(this, "AWSLogDeliveryWrite20150319", {
      policyStatements: [logDeliveryPolicy],
      resourcePolicyName: "AWSLogDeliveryWrite20150319"
    })

    const dashboardViewerPolicy = new ManagedPolicy(this, "DashboardViewerPolicy", {
      statements: [
        new PolicyStatement({
          actions: [
            "cloudwatch:DescribeAlarmHistory",
            "cloudwatch:DescribeAlarms",
            "cloudwatch:GetDashboard",
            "cloudfront:GetDistribution",
            "dynamodb:DescribeTable",
            "ecs:DescribeClusters",
            "ecs:DescribeContainerInstances",
            "ecs:ListContainerInstances",
            "elasticloadbalancing:DescribeLoadBalancers",
            "kinesis:DescribeStream",
            "lambda:GetFunction",
            "resource-groups:ListGroupResources",
            "route53:GetHealthCheck",
            "s3:ListBucket",
            "sns:ListTopics",
            "sqs:GetQueueAttributes",
            "sqs:GetQueueUrl",
            "tag:GetResources"
          ],
          resources: [
            `arn:aws:cloudwatch:*:${props.accountId}:*`,
            `arn:aws:cloudfront::${props.accountId}:*`,
            `arn:aws:dynamodb::${props.accountId}:*`,
            `arn:aws:ecs:eu-west-2:${props.accountId}:*`,
            `arn:aws:elasticloadbalancing:eu-west-2:${props.accountId}:*`,
            `arn:aws:kinesis:eu-west-2:${props.accountId}:*`,
            `arn:aws:lambda:eu-west-2:${props.accountId}:*`,
            `arn:aws:resource-groups:eu-west-2:${props.accountId}:*`,
            "arn:aws:route53:::*",
            "arn:aws:s3:::*",
            `arn:aws:sns:eu-west-2:${props.accountId}:*`,
            `arn:aws:sqs:eu-west-2:${props.accountId}:*`,
            `arn:aws:tag::${props.accountId}:*`
          ]
        }),
        new PolicyStatement({
          actions: [
            "arn:aws:apigateway:eu-west-2::/restapis*"
          ],
          resources: [
            "apigateway:GET"
          ]
        }),

        new PolicyStatement({
          actions: [
            "cloudfront:ListDistributions",
            "cloudwatch:GetMetricData",
            "cloudwatch:GetMetricStatistics",
            "cloudwatch:ListDashboards",
            "cloudwatch:ListMetrics",
            "dynamodb:ListTables",
            "ecs:ListClusters",
            "ecs:ListServices",
            "kinesis:ListStreams",
            "lambda:ListFunctions",
            "resource-groups:ListGroups",
            "route53:ListHealthChecks",
            "s3:ListAllMyBuckets",
            "sqs:ListQueues"
          ],
          resources: [
            "*"
          ]
        })

      ]
    })

    const snsFeedbackLoggingPolicy = new ManagedPolicy(this, "AllowApiGwLoggingPolicy", {
      statements: [
        new PolicyStatement({
          actions: [
            "logs:CreateLogGroup",
            "logs:CreateLogStream",
            "logs:PutLogEvents",
            "logs:PutMetricFilter",
            "logs:PutRetentionPolicy"
          ],
          resources: [
            "*"
          ]
        })]
    })
    props.snsFeedbackLoggingRole.addManagedPolicy(this.snsFeedbackLoggingPolicy)
    const epsReadOnlyPolicies: Array<PolicyStatement> = [
      new PolicyStatement({
        actions: [
          "kms:Decrypt"
        ],
        resources: [
          `arn:aws:kms:eu-west-2:${props.accountId}:key/*`
        ]
      }),
      new PolicyStatement({
        actions: [
          "athena:StartQueryExecution",
          "athena:StopQueryExecution"
        ],
        resources: [
          "*"
        ]
      }),
      new PolicyStatement({
        actions: [
          "ssm:GetParameter",
          "ssm:PutParameter"
        ],
        resources: [
          `arn:aws:ssm:${props.region}:${props.accountId}:parameter/monitoring-alertSuppressions`
        ]
      })
    ]
    if (props.athenaResultsBucketKmsKey) {
      epsReadOnlyPolicies.push( new PolicyStatement({
        actions: [
          "kms:DescribeKey",
          "kms:GenerateDataKey*",
          "kms:Encrypt",
          "kms:ReEncrypt*"
        ],
        resources: [
          props.athenaResultsBucketKmsKey.keyArn
        ]
      })
      )
    }
    if (props.athenaResultsBucket) {
      epsReadOnlyPolicies.push(
        new PolicyStatement({
          actions: [
            "s3:GetObject*",
            "s3:PutObject*",
            "s3:GetBucket*",
            "s3:List*"
          ],
          resources: [
            props.athenaResultsBucket.bucketArn,
            `${props.athenaResultsBucket.bucketArn}/*`
          ]
        })
      )
    }
    const epsReadOnlyExtraPermissions = new ManagedPolicy(this, "EPSReadOnlyExtraPermissions", {
      statements: epsReadOnlyPolicies
    })

    this.allowApiGwLoggingPolicy = allowApiGwLoggingPolicy
    this.dashboardViewerPolicy = dashboardViewerPolicy
    this.snsFeedbackLoggingPolicy = snsFeedbackLoggingPolicy
    this.epsReadOnlyExtraPermissions = epsReadOnlyExtraPermissions
  }
}

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
  public readonly allowOpenIdProviderPermissionsPolicy: ManagedPolicy
  public readonly artilleryRunnerPolicy: ManagedPolicy
  public readonly assistMeDocumentSyncPolicy: ManagedPolicy
  public readonly assumeCdkRolesPolicy: ManagedPolicy
  public readonly assumeExecutionRolePolicy: ManagedPolicy
  public readonly cdkPullImageRolePolicy: ManagedPolicy
  public readonly cdkPushImageRolePolicy: ManagedPolicy
  public readonly createCloudFormationStackChangeSetAssumeLookupRole: ManagedPolicy
  public readonly createCloudFormationStackChangeSetPolicy: ManagedPolicy
  public readonly createCloudFormationStackPolicy: ManagedPolicy
  public readonly describeCloudFormationStackPolicy: ManagedPolicy
  public readonly ecrPushImagePolicy: ManagedPolicy
  public readonly proxygenAccessExportPolicy: ManagedPolicy
  public readonly removeOldCnameRecordsPolicy: ManagedPolicy
  public readonly updateCloudfrontKvs: ManagedPolicy

  public constructor(scope: Construct, id: string, props: PoliciesProps) {
    super(scope, id)

    const artilleryRunnerPolicy = new ManagedPolicy(this, "ArtilleryRunnerPolicy", {
      statements: [
        new PolicyStatement({
          actions: [
            "iam:PassRole",
            "iam:GetRole"
          ],
          resources: [
            `arn:aws:iam::${props.accountId}:role/artilleryio-ecs-worker-role`
          ]
        }),
        new PolicyStatement({
          sid: "SQSPermissions",
          actions: [
            "sqs:*"
          ],
          resources: [
            `arn:aws:sqs:*:${props.accountId}:artilleryio*`
          ]
        }),
        new PolicyStatement({
          sid: "SQSListQueues",
          actions: [
            "sqs:ListQueues"
          ],
          resources: [
            "*"
          ]
        }),
        new PolicyStatement({
          sid: "ECSPermissionsGeneral",
          actions: [
            "ecs:ListClusters",
            "ecs:RegisterTaskDefinition",
            "ecs:DeregisterTaskDefinition",
            "ecs:DescribeTaskDefinition"
          ],
          resources: [
            "*"
          ]
        }),
        new PolicyStatement({
          sid: "ECSPermissionsScopedToCluster",
          actions: [
            "ecs:DescribeClusters",
            "ecs:ListContainerInstances"
          ],
          resources: [
            `arn:aws:ecs:*:${props.accountId}:cluster/*`
          ]
        }),
        new PolicyStatement({
          sid: "ECSPermissionsScopedWithCondition",
          actions: [
            "ecs:SubmitTaskStateChange",
            "ecs:DescribeTasks",
            "ecs:ListTasks",
            "ecs:ListTaskDefinitions",
            "ecs:DescribeTaskDefinition",
            "ecs:StartTask",
            "ecs:StopTask",
            "ecs:RunTask"
          ],
          resources: [
            "*"
          ],
          conditions: {
            ArnEquals: {
              "ecs:cluster": `arn:aws:ecs:*:${props.accountId}:cluster/*`
            }
          }
        }),
        new PolicyStatement({
          sid: "S3Permissions",
          actions: [
            "s3:DeleteObject",
            "s3:GetObject",
            "s3:GetObjectAcl",
            "s3:GetObjectTagging",
            "s3:GetObjectVersion",
            "s3:PutObject",
            "s3:PutObjectAcl",
            "s3:ListBucket",
            "s3:GetBucketLocation",
            "s3:GetBucketLogging",
            "s3:GetBucketPolicy",
            "s3:GetBucketTagging",
            "s3:PutBucketPolicy",
            "s3:PutBucketTagging",
            "s3:PutMetricsConfiguration",
            "s3:GetLifecycleConfiguration",
            "s3:PutLifecycleConfiguration"
          ],
          resources: [
            `arn:aws:s3:::artilleryio-test-data-${props.accountId}`,
            `arn:aws:s3:::artilleryio-test-data-${props.accountId}/*`
          ]
        }),
        new PolicyStatement({
          actions: [
            "secretsmanager:GetSecretValue"
          ],
          resources: [
            `arn:aws:secretsmanager:*:${props.accountId}:secret:artilleryio/*`
          ]
        }),
        new PolicyStatement({
          actions: [
            "ssm:PutParameter",
            "ssm:GetParameter",
            "ssm:GetParameters",
            "ssm:DeleteParameter",
            "ssm:DescribeParameters",
            "ssm:GetParametersByPath"
          ],
          resources: [
            `arn:aws:ssm:eu-west-2:${props.accountId}:parameter/artilleryio/*`
          ]
        }),
        new PolicyStatement({
          actions: [
            "ec2:DescribeRouteTables",
            "ec2:DescribeVpcs",
            "ec2:DescribeSubnets"
          ],
          resources: [
            "*"
          ]
        }),
        new PolicyStatement({
          actions: [
            "cloudformation:ListExports"
          ],
          resources: [
            "*"
          ]
        }),
        new PolicyStatement({
          actions: [
            "logs:PutRetentionPolicy"
          ],
          resources: [
            `arn:aws:logs:eu-west-2:${props.accountId}:log-group:artilleryio-log-group/*`
          ]
        })
      ],
      roles: [props.artilleryRunnerRole]
    })
    const allowOpenIdProviderPermissionsPolicy = new ManagedPolicy(this, "AllowOpenIDProviderPermissionsPolicy", {
      statements: [
        new PolicyStatement({
          actions: [
            "iam:GetOpenIDConnectProvider"
          ],
          resources: [
            "*"
          ]
        })
      ],
      roles: [
        props.CloudFormationDeployRole,
        props.cloudFormationCheckVersionRole,
        props.releaseNotesExecuteLambdaRole,
        props.cloudFormationPrepareChangesetRole,
        props.artilleryRunnerRole,
        props.proxygenPTLRole,
        props.proxygenProdRole
      ]
    })
    props.CloudFormationDeployRole.addManagedPolicy(allowOpenIdProviderPermissionsPolicy)
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
            `arn:aws:apigateway:${props.region}:${props.accountId}:/restapis*`
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

    const snsFeedbackLoggingPolicy = new ManagedPolicy(this, "SnsFeedbackLoggingPolicy", {
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
    props.snsFeedbackLoggingRole.addManagedPolicy(snsFeedbackLoggingPolicy)
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

    const assistMeDocumentSyncPolicy = new ManagedPolicy(this, "AssistMeDocumentSyncPolicy", {
      statements: [
        new PolicyStatement({
          actions: [
            "cloudformation:ListExports"
          ],
          resources: [
            "*"
          ]
        })
      ],
      roles: [props.assistMeDocumentSyncRole]
    })

    const assumeCdkRolesPolicy = new ManagedPolicy(this, "AssumeCDKRolesPolicy", {
      statements: [
        new PolicyStatement({
          actions: [
            "sts:AssumeRole"
          ],
          resources: [
            `arn:aws:iam::${props.accountId}:role/cdk-hnb659fds-deploy-role-${props.accountId}-us-east-1`,
            `arn:aws:iam::${props.accountId}:role/cdk-hnb659fds-deploy-role-${props.accountId}-eu-west-2`,
            `arn:aws:iam::${props.accountId}:role/cdk-hnb659fds-file-publishing-role-${props.accountId}-us-east-1`,
            `arn:aws:iam::${props.accountId}:role/cdk-hnb659fds-file-publishing-role-${props.accountId}-eu-west-2`,
            `arn:aws:iam::${props.accountId}:role/cdk-hnb659fds-lookup-role-${props.accountId}-us-east-1`,
            `arn:aws:iam::${props.accountId}:role/cdk-hnb659fds-lookup-role-${props.accountId}-eu-west-2`
          ]
        })
      ],
      roles: [
        props.CloudFormationDeployRole
      ]
    })

    const assumeExecutionRolePolicy = new ManagedPolicy(this, "AssumeExecutionRolePolicy", {
      statements: [
        new PolicyStatement({
          actions: [
            "iam:PassRole"
          ],
          resources: [
            props.cloudFormationExecutionRole.roleArn
          ]
        })
      ],
      roles: [
        props.CloudFormationDeployRole,
        props.cloudFormationPrepareChangesetRole
      ]
    })

    const cdkPullImageRolePolicy = new ManagedPolicy(this, "CDKPullImageRolePolicy", {
      statements: [
        new PolicyStatement({
          actions: [
            "ecr:BatchCheckLayerAvailability",
            "ecr:BatchGetImage",
            "ecr:DescribeImages",
            "ecr:GetDownloadUrlForLayer",
            "ecr:ListImages",
            "ecr:ListTagsForResource"
          ],
          resources: [
            `arn:aws:ecr:${props.region}:${props.accountId}:repository/cdk-utils-build-repo`
          ]
        }),
        new PolicyStatement({
          actions: [
            "ecr:GetAuthorizationToken"
          ],
          resources: [
            "*"
          ]
        })
      ],
      roles: [
        props.CDKPullImageRole
      ]
    })

    const cdkPushImageRolePolicy = new ManagedPolicy(this, "CDKPushImageRolePolicy", {
      statements: [
        new PolicyStatement({
          actions: [
            "ecr:DescribeImages",
            "ecr:DescribeRepositories",
            "ecr:ListImages",
            "ecr:ListTagsForResource",
            "ecr:PutImage",
            "ecr:InitiateLayerUpload",
            "ecr:TagResource",
            "ecr:UntagResource",
            "ecr:UploadLayerPart",
            "ecr:CompleteLayerUpload",
            "ecr:BatchCheckLayerAvailability",
            "ecr:DescribeImageScanFindings"
          ],
          resources: [
            `arn:aws:ecr:${props.region}:${props.accountId}:repository/cdk-utils-build-repo`
          ]
        }),
        new PolicyStatement({
          actions: [
            "ecr:GetAuthorizationToken"
          ],
          resources: [
            "*"
          ]
        }),
        new PolicyStatement({
          actions: [
            "inspector2:ListCoverage",
            "inspector2:ListFindings"
          ],
          resources: [
            `arn:aws:inspector2:${props.region}:${props.accountId}:*`
          ]
        })
      ],
      roles: [
        props.CDKPushImageRole
      ]
    })

    const createCloudFormationStackChangeSetAssumeLookupRole =
      new ManagedPolicy(this, "CreateCloudFormationStackChangeSetAssumeLookupRole", {
        statements: [
          new PolicyStatement({
            actions: [
              "sts:AssumeRole"
            ],
            resources: [
              `arn:aws:iam::${props.accountId}:role/cdk-hnb659fds-lookup-role-${props.accountId}-us-east-1`,
              `arn:aws:iam::${props.accountId}:role/cdk-hnb659fds-lookup-role-${props.accountId}-eu-west-2`,
              `arn:aws:iam::${props.accountId}:role/cdk-hnb659fds-file-publishing-role-${props.accountId}-us-east-1`,
              `arn:aws:iam::${props.accountId}:role/cdk-hnb659fds-file-publishing-role-${props.accountId}-eu-west-2`
            ]
          })
        ],
        roles: [
          props.cloudFormationPrepareChangesetRole
        ]
      })

    const createCloudFormationStackChangeSetPolicy =
      new ManagedPolicy(this, "CreateCloudFormationStackChangeSetPolicy", {
        statements: [
          new PolicyStatement({
            actions: [
              "cloudformation:DescribeStacks",
              "cloudformation:ListExports",
              "cloudformation:CreateChangeSet",
              "cloudformation:DescribeChangeSet",
              "cloudformation:DescribeStackEvents",
              "cloudformation:GetTemplateSummary",
              "cloudformation:ListStacks",
              "cloudformation:DeleteChangeSet",
              "cloudformation:GetTemplate"
            ],
            resources: [
              "*"
            ]
          }),
          new PolicyStatement({
            actions: [
              "ssm:GetParameter",
              "ec2:Describe*"
            ],
            resources: [
              "*"
            ]
          })
        ],
        roles: [
          props.cloudFormationPrepareChangesetRole
        ]
      })
    const createCloudFormationStackPolicy = new ManagedPolicy(this, "CreateCloudFormationStackPolicy", {
      statements: [
        new PolicyStatement({
          actions: [
            "cloudformation:CreateStack",
            "cloudformation:UpdateStack",
            "cloudformation:DeleteStack",
            "cloudformation:Describe*",
            "cloudformation:ListExports",
            "cloudformation:CreateChangeSet",
            "cloudformation:ExecuteChangeSet",
            "cloudformation:GetTemplateSummary",
            "cloudformation:ListStacks",
            "cloudformation:DeleteChangeSet"
          ],
          resources: [
            "*"
          ]
        })
      ],
      roles: [
        props.CloudFormationDeployRole
      ]
    })

    const describeCloudFormationStackPolicy = new ManagedPolicy(this, "DescribeCloudFormationStackPolicy", {
      statements: [
        new PolicyStatement({
          actions: [
            "cloudformation:DescribeStacks",
            "cloudformation:ListExports",
            "cloudformation:ListStacks"
          ],
          resources: [
            "*"
          ]
        })
      ],
      roles: [
        props.cloudFormationCheckVersionRole
      ]
    })

    const ecrPushImagePolicy = new ManagedPolicy(this, "ECRPushImagePolicy", {
      statements: [
        new PolicyStatement({
          actions: [
            "ecr:BatchCheckLayerAvailability",
            "ecr:BatchGetImage",
            "ecr:CompleteLayerUpload",
            "ecr:DescribeImages",
            "ecr:DescribeImageScanFindings",
            "ecr:DescribeRepositories",
            "ecr:ListImages",
            "ecr:ListTagsForResource",
            "ecr:PutImage",
            "ecr:InitiateLayerUpload",
            "ecr:TagResource",
            "ecr:UntagResource",
            "ecr:UploadLayerPart"
          ],
          resources: [
            `arn:aws:ecr:${props.region}:${props.accountId}:*`
          ]
        }),
        new PolicyStatement({
          actions: [
            "ecr:GetAuthorizationToken"
          ],
          resources: [
            "*"
          ]
        }),
        new PolicyStatement({
          actions: [
            "inspector2:ListCoverage",
            "inspector2:ListFindings"
          ],
          resources: [
            `arn:aws:inspector2:${props.region}:${props.accountId}:*`
          ]
        })
      ],
      roles: [
        props.CloudFormationDeployRole
      ]
    })

    const proxygenAccessExportPolicy = new ManagedPolicy(this, "ProxygenAccessExportPolicy", {
      statements: [
        new PolicyStatement({
          actions: [
            "cloudformation:ListExports"
          ],
          resources: [
            "*"
          ]
        })
      ],
      roles: [
        props.proxygenPTLRole,
        props.proxygenProdRole
      ]
    })

    const removeOldCnameRecordsPolicy = new ManagedPolicy(this, "RemoveOldCnameRecordsPolicy", {
      statements: [
        new PolicyStatement({
          actions: [
            "route53:ListHostedZonesByName",
            "route53:ListResourceRecordSets"
          ],
          resources: [
            "*"
          ]
        }),
        new PolicyStatement({
          actions: [
            "route53:ChangeResourceRecordSets"
          ],
          resources: [
            "*"
          ],
          conditions: {
            "ForAllValues:StringEquals": {
              "route53:ChangeResourceRecordSetsRecordTypes": "CNAME"
            },
            "ForAllValues:StringLike": {
              "route53:ChangeResourceRecordSetsNormalizedRecordNames": "_*"
            }
          }
        })
      ],
      roles: [
        props.CloudFormationDeployRole
      ]
    })

    const updateCloudfrontKvs = new ManagedPolicy(this, "UpdateCloudfrontKvs", {
      statements: [
        new PolicyStatement({
          actions: [
            "cloudfront-keyvaluestore:DescribeKeyValueStore",
            "cloudfront-keyvaluestore:ListKeys",
            "cloudfront-keyvaluestore:PutKey",
            "cloudfront-keyvaluestore:UpdateKeys",
            "cloudfront:CreateInvalidation"
          ],
          resources: [
            "*"
          ]
        })
      ],
      roles: [
        props.CloudFormationDeployRole
      ]
    })
    this.allowApiGwLoggingPolicy = allowApiGwLoggingPolicy
    this.dashboardViewerPolicy = dashboardViewerPolicy
    this.snsFeedbackLoggingPolicy = snsFeedbackLoggingPolicy
    this.epsReadOnlyExtraPermissions = epsReadOnlyExtraPermissions
    this.allowOpenIdProviderPermissionsPolicy = allowOpenIdProviderPermissionsPolicy
    this.artilleryRunnerPolicy = artilleryRunnerPolicy
    this.assistMeDocumentSyncPolicy = assistMeDocumentSyncPolicy
    this.assumeCdkRolesPolicy = assumeCdkRolesPolicy
    this.assumeExecutionRolePolicy = assumeExecutionRolePolicy
    this.cdkPullImageRolePolicy = cdkPullImageRolePolicy
    this.cdkPushImageRolePolicy = cdkPushImageRolePolicy
    this.createCloudFormationStackChangeSetAssumeLookupRole = createCloudFormationStackChangeSetAssumeLookupRole
    this.createCloudFormationStackChangeSetPolicy = createCloudFormationStackChangeSetPolicy
    this.createCloudFormationStackPolicy = createCloudFormationStackPolicy
    this.describeCloudFormationStackPolicy = describeCloudFormationStackPolicy
    this.ecrPushImagePolicy = ecrPushImagePolicy
    this.proxygenAccessExportPolicy = proxygenAccessExportPolicy
    this.removeOldCnameRecordsPolicy = removeOldCnameRecordsPolicy
    this.updateCloudfrontKvs = updateCloudfrontKvs
  }
}

import {IRole, ManagedPolicy, PolicyStatement} from "aws-cdk-lib/aws-iam"
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
}
export class Policies extends Construct {
  public readonly allowApiGwLoggingPolicy: ManagedPolicy
  public constructor(scope: Construct, id: string, props: PoliciesProps) {
    super(scope, id)

    this.allowApiGwLoggingPolicy = new ManagedPolicy(this, "AllowApiGwLoggingPolicy", {
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
    props.apiGwCloudWatchRole.addManagedPolicy(this.allowApiGwLoggingPolicy)
  }
}

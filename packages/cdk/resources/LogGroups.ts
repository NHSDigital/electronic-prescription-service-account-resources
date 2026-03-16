import {RemovalPolicy} from "aws-cdk-lib"
import {IKey} from "aws-cdk-lib/aws-kms"
import {LogGroup} from "aws-cdk-lib/aws-logs"
import {Construct} from "constructs"

export interface LogGroupProps {
  readonly cloudWatchLogsKmsKey: IKey
  readonly lambdaInsightsLogGroupName: string
  readonly logRetentionInDays: number
}
export class LogGroups extends Construct {
  public lambdaInsightsLogGroup: LogGroup

  public constructor(scope: Construct, id: string, props: LogGroupProps){
    super(scope, id)

    const lambdaInsightsLogGroup = new LogGroup(scope, "LambdaInsightsLogGroup", {
      encryptionKey: props.cloudWatchLogsKmsKey,
      logGroupName: props.lambdaInsightsLogGroupName,
      retention: props.logRetentionInDays,
      removalPolicy: RemovalPolicy.DESTROY
    })

    this.lambdaInsightsLogGroup = lambdaInsightsLogGroup
  }
}

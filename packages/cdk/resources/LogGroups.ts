import {RemovalPolicy} from "aws-cdk-lib"
import {IKey} from "aws-cdk-lib/aws-kms"
import {LogGroup, LogStream} from "aws-cdk-lib/aws-logs"
import {Construct} from "constructs"

export interface LogGroupProps {
  readonly cloudWatchLogsKmsKey: IKey
  readonly lambdaInsightsLogGroupName: string
  readonly logRetentionInDays: number
  readonly stackName: string
}
export class LogGroups extends Construct {
  public readonly lambdaInsightsLogGroup: LogGroup
  public readonly splunkDeliveryStreamLogGroup: LogGroup
  public readonly splunkDeliveryStreamLogStream: LogStream

  public constructor(scope: Construct, id: string, props: LogGroupProps){
    super(scope, id)

    const lambdaInsightsLogGroup = new LogGroup(scope, "LambdaInsightsLogGroup", {
      encryptionKey: props.cloudWatchLogsKmsKey,
      logGroupName: props.lambdaInsightsLogGroupName,
      retention: props.logRetentionInDays,
      removalPolicy: RemovalPolicy.DESTROY
    })

    const splunkDeliveryStreamLogGroup = new LogGroup(scope, "SplunkDeliveryStreamLogGroup", {
      encryptionKey: props.cloudWatchLogsKmsKey,
      logGroupName: `/aws/kinesisfirehose/${props.stackName}-SplunkDeliveryStream`,
      retention: props.logRetentionInDays,
      removalPolicy: RemovalPolicy.DESTROY
    })
    const splunkDeliveryStreamLogStream = new LogStream(scope, "SplunkDeliveryStreamLogStream", {
      logGroup: splunkDeliveryStreamLogGroup
    })
    this.lambdaInsightsLogGroup = lambdaInsightsLogGroup
    this.splunkDeliveryStreamLogGroup = splunkDeliveryStreamLogGroup
    this.splunkDeliveryStreamLogStream = splunkDeliveryStreamLogStream
  }
}

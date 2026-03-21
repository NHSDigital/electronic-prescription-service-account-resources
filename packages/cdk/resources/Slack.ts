
import {Key} from "aws-cdk-lib/aws-kms"
import {Construct} from "constructs"
import {Role} from "aws-cdk-lib/aws-iam"
import {
  LoggingProtocol,
  Subscription,
  SubscriptionProtocol,
  Topic
} from "aws-cdk-lib/aws-sns"
import {CfnQueuePolicy, Queue} from "aws-cdk-lib/aws-sqs"
import {Duration} from "aws-cdk-lib"

export interface SlackProps {
  readonly snsFeedbackLoggingRole: Role
  readonly stackName: string
  readonly sqsKMSKey: Key
}
export class Slack extends Construct {
  public readonly slackAlertsSnsTopic: Topic
  public readonly slackAlerterSqsQueue: Queue

  public constructor(scope: Construct, id: string, props: SlackProps){
    super(scope, id)

    const slackAlertsSnsTopic = new Topic(this, "SlackAlertsSnsTopic", {
      loggingConfigs: [{
        protocol: LoggingProtocol.SQS,
        failureFeedbackRole: props.snsFeedbackLoggingRole,
        successFeedbackRole: props.snsFeedbackLoggingRole
      }]
    })
    const slackAlerterDeadLetterQueue = new Queue(this, "SlackAlerterDeadLetterQueue", {
      queueName: `${props.stackName}-SlackAlertsDeadLetter`,
      encryptionMasterKey: props.sqsKMSKey,
      retentionPeriod: Duration.days(7),
      visibilityTimeout: Duration.minutes(1)
    })

    const slackAlerterSqsQueue = new Queue(this, "SlackAlerterSqsQueue", {
      queueName: `${props.stackName}-SlackAlerts`,
      encryptionMasterKey: props.sqsKMSKey,
      retentionPeriod: Duration.days(1),
      visibilityTimeout: Duration.minutes(1),
      deadLetterQueue: {
        maxReceiveCount: 5,
        queue: slackAlerterDeadLetterQueue
      }
    })

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const slackAlerterSqsQueuePolicy = new CfnQueuePolicy(this, "SlackAlerterSqsQueuePolicy", {
      policyDocument: {
        Version: "2012-10-17",
        Statement: [{
          Effect: "Allow",
          Principal: {
            Service: "sns.amazonaws.com"
          },
          Action: [
            "sqs:GetQueueAttributes",
            "sqs:GetQueueUrl",
            "sqs:SendMessage"
          ],
          Resource: [
            slackAlerterSqsQueue.queueArn
          ],
          Condition: {
            ArnEquals: {
              "aws:SourceArn": slackAlertsSnsTopic.topicArn
            }
          }
        }]
      },
      queues: [slackAlerterSqsQueue.queueUrl]
    })

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const slackAlerterDeadLetterQueuePolicy = new CfnQueuePolicy(this, "SlackAlerterDeadLetterQueuePolicy", {
      policyDocument: {
        Effect: "Allow",
        Principal: {
          Service: "sqs.amazonaws.com"
        },
        Action: [
          "sqs:GetQueueAttributes",
          "sqs:GetQueueUrl",
          "sqs:SendMessage"
        ],
        Resource: [
          slackAlerterDeadLetterQueue.queueArn
        ],
        Condition: {
          ArnEquals: {
            "aws:SourceArn": slackAlertsSnsTopic.topicArn
          }
        }
      },
      queues: [slackAlerterDeadLetterQueue.queueUrl]
    })

    new Subscription(this, "SlackAlerterSqsQueueSnsSubscription", {
      topic: slackAlertsSnsTopic,
      endpoint: slackAlerterSqsQueue.queueArn,
      protocol: SubscriptionProtocol.SQS,
      rawMessageDelivery: true
    })
    this.slackAlertsSnsTopic = slackAlertsSnsTopic
    this.slackAlerterSqsQueue = slackAlerterSqsQueue
  }
}

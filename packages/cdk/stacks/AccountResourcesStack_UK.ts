import {
  StackProps,
  Stack,
  App,
  Tags,
  CfnOutput
} from "aws-cdk-lib"
import {ECRRepositories} from "../resources/ECRRepositories"
import {nagSuppressions} from "../nagSuppressions"
import {Functions} from "../resources/Functions"
import {Alarms} from "../resources/Alarms"
import {Topic} from "aws-cdk-lib/aws-sns"
import {getExportValue} from "../resources/ExportMigrations"
import {RegressionTestSecrets} from "../resources/RegressionTestSecrets"

export interface AccountResourcesStackProps_UK extends StackProps {
  readonly stackName: string
  readonly version: string
  readonly commitId: string
  readonly environment: string
  readonly enableAlerts: boolean
  readonly lambdaConcurrencyThreshold: number
  readonly lambdaConcurrencyWarningThreshold: number
}

export class AccountResourcesStack_UK extends Stack {
  public constructor(scope: App, id: string, props: AccountResourcesStackProps_UK){
    super(scope, id, props)

    Tags.of(this).add("stackName", props.stackName)

    // Imports
    // import the existing slack alert topic until we migrate rest of slack alerter code to cdk
    const slackAlertsSnsTopic = Topic.fromTopicArn(this, "SlackAlertTopic",
      getExportValue("lambda-resources:SlackAlertsSnsTopicArn", props.environment))

    new ECRRepositories(this, "ECRRepositories")

    // this will be migrated to secrets stack
    new RegressionTestSecrets(this, "RegressionTestSecrets", {stackName: props.stackName})

    const alarms = new Alarms(this, "Alarms", {
      stackName: props.stackName,
      enableAlerts: props.enableAlerts,
      lambdaConcurrencyThreshold: props.lambdaConcurrencyThreshold,
      lambdaConcurrencyWarningThreshold: props.lambdaConcurrencyWarningThreshold,
      slackAlertsSnsTopic: slackAlertsSnsTopic
    })
    new Functions(this, "Functions", {
      stackName: props.stackName,
      version: props.version,
      commitId: props.commitId,
      logRetentionInDays: 30,
      logLevel: "DEBUG",
      environment: props.environment,
      alertSuppressionsParameter: alarms.parameters.alertSuppressions
    })

    // checked they are in the right stack

    new CfnOutput(this, "AccountResourcesALBLoggingBucketNameMigrationExport", {
      value: getExportValue("account-resources:ALBLoggingBucketName", props.environment),
      exportName: `${props.stackName}:Bucket:ALBLoggingBucket:Name`
    })
    new CfnOutput(this, "AccountResourcesAuditLoggingBucketMigrationExport", {
      value: getExportValue("account-resources:AuditLoggingBucket", props.environment),
      exportName: `${props.stackName}:Bucket:AuditLoggingBucket:Arn`
    })

    new CfnOutput(this, "AccountResourcesCloudwatchEncryptionKMSPolicyArnMigrationExport", {
      value: getExportValue("account-resources:CloudwatchEncryptionKMSPolicyArn", props.environment),
      exportName: `${props.stackName}:IAM:CloudwatchEncryptionKMSPolicy:Arn`
    })
    new CfnOutput(this, "AccountResourcesCloudwatchLogsKmsKeyArnMigrationExport", {
      value: getExportValue("account-resources:CloudwatchLogsKmsKeyArn", props.environment),
      exportName: `${props.stackName}:KMS:CloudwatchLogsKmsKey:Arn`
    })
    new CfnOutput(this, "AccountResourcesLambdaEncryptCloudwatchKMSPolicyMigrationExport", {
      value: getExportValue("account-resources:LambdaEncryptCloudwatchKMSPolicy", props.environment),
      exportName: `${props.stackName}:IAM:LambdaEncryptCloudwatchKMSPolicy:Arn`
    })
    new CfnOutput(this, "AccountResourcesSNSFeedbackLoggingRoleArnMigrationExport", {
      value: getExportValue("account-resources:SNSFeedbackLoggingRoleArn", props.environment),
      exportName: `${props.stackName}:IAM:SNSFeedbackLoggingRole:Arn`
    })
    new CfnOutput(this, "AccountResourcesSnsKMSKeyMigrationExport", {
      value: getExportValue("account-resources:SnsKMSKey", props.environment),
      exportName: `${props.stackName}:KMS:SnsKMSKey:Arn`
    })

    new CfnOutput(this, "AccountResourcesSplunkDeliveryStreamBackupBucketMigrationExport", {
      value: getExportValue("account-resources:SplunkDeliveryStreamBackupBucket", props.environment),
      exportName: `${props.stackName}:Bucket:SplunkDeliveryStreamBackupBucket:Arn`
    })

    new CfnOutput(this, "AccountResourcesSplunkDeliveryStreamBackupBucketRoleMigrationExport", {
      value: getExportValue("account-resources:SplunkDeliveryStreamBackupBucketRole", props.environment),
      exportName: `${props.stackName}:IAM:SplunkDeliveryStreamBackupBucketRole:Name`
    })

    new CfnOutput(this, "AccountResourcesSplunkDeliveryStreamBackupBucketRoleArnMigrationExport", {
      value: getExportValue("account-resources:SplunkDeliveryStreamBackupBucketRoleArn", props.environment),
      exportName: `${props.stackName}:IAM:SplunkDeliveryStreamBackupBucketRole:Arn`
    })

    new CfnOutput(this, "AccountResourcesSplunkDeliveryStreamBackupKMSKeyMigrationExport", {
      value: getExportValue("account-resources:SplunkDeliveryStreamBackupKMSKey", props.environment),
      exportName: `${props.stackName}:KMS:SplunkDeliveryStreamBackupKMSKey:Arn`
    })

    new CfnOutput(this, "AccountResourcesSqsDecryptSecretsKMSPolicyMigrationExport", {
      value: getExportValue("account-resources:SqsDecryptSecretsKMSPolicy", props.environment),
      exportName: `${props.stackName}:IAM:SqsDecryptSecretsKMSPolicy:Arn`
    })
    new CfnOutput(this, "AccountResourcesSqsKMSKeyMigrationExport", {
      value: getExportValue("account-resources:SqsKMSKey", props.environment),
      exportName: `${props.stackName}:KMS:SqsKMSKey:Arn`
    })
    new CfnOutput(this, "AccountResourcesTrustStoreBucketMigrationExport", {
      value: getExportValue("account-resources:TrustStoreBucket", props.environment),
      exportName: `${props.stackName}:Bucket:TrustStoreBucket:Arn`
    })
    new CfnOutput(this, "AccountResourcesTrustStoreBucketKMSKeyMigrationExport", {
      value: getExportValue("account-resources:TrustStoreBucketKMSKey", props.environment),
      exportName: `${props.stackName}:KMS:TrustStoreBucketKMSKey:Arn`
    })
    new CfnOutput(this, "AccountResourcesTrustStoreDeploymentBucketMigrationExport", {
      value: getExportValue("account-resources:TrustStoreDeploymentBucket", props.environment),
      exportName: `${props.stackName}:Bucket:TrustStoreDeploymentBucket:Arn`
    })
    new CfnOutput(this, "LambdaResourcesLambdaInsightsLogGroupPolicyMigrationExport", {
      value: getExportValue("lambda-resources:LambdaInsightsLogGroupPolicy", props.environment),
      exportName: `${props.stackName}:IAM:LambdaInsightsLogGroupPolicy:Arn`
    })
    new CfnOutput(this, "LambdaResourcesSlackAlertsSnsTopicArnMigrationExport", {
      value: getExportValue("lambda-resources:SlackAlertsSnsTopicArn", props.environment),
      exportName: `${props.stackName}:SNS:SlackAlertsSnsTopicArn:Arn`
    })
    new CfnOutput(this, "LambdaResourcesSplunkDeliveryStreamMigrationExport", {
      value: getExportValue("lambda-resources:SplunkDeliveryStream", props.environment),
      exportName: `${props.stackName}:Firehose:SplunkDeliveryStream:Arn`
    })
    new CfnOutput(this, "LambdaResourcesSplunkSubscriptionFilterRoleMigrationExport", {
      value: getExportValue("lambda-resources:SplunkSubscriptionFilterRole", props.environment),
      exportName: `${props.stackName}:IAM:SplunkSubscriptionFilterRole:Arn`
    })

    nagSuppressions(this, "AccountResources_UK")
  }
}

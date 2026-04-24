import {
  StackProps,
  Stack,
  App,
  Tags,
  Fn,
  CfnOutput
} from "aws-cdk-lib"
import {ECRRepositories} from "../resources/ECRRepositories"
import {RegressionTestSecrets} from "../resources/RegressionTestSecrets"
import {ManagedPolicy, Role} from "aws-cdk-lib/aws-iam"
import {nagSuppressions} from "../nagSuppressions"
import {Functions} from "../resources/Functions"
import {InspectorFilters} from "../resources/InspectorFilters"
import {Alarms} from "../resources/Alarms"
import {Secret} from "aws-cdk-lib/aws-secretsmanager"
import {Topic} from "aws-cdk-lib/aws-sns"
import {getExportValue} from "../resources/ExportMigrations"

export interface AccountResourcesStackProps_UK extends StackProps {
  readonly stackName: string
  readonly version: string
  readonly commitId: string
  readonly environment: string
  readonly cloudFormationExecutionRole: Role
  readonly cloudFormationPrepareChangesetRole: Role
  readonly cloudFormationDeployRole: Role
  readonly apiGwCloudWatchRole: Role
  readonly splunkDeliveryStreamBackupBucketRole: Role
  readonly enableAlerts: boolean
  readonly lambdaConcurrencyThreshold: number
  readonly lambdaConcurrencyWarningThreshold: number
  readonly lambdaDecryptSecretsKmsPolicy: ManagedPolicy
  readonly lambdaInsightsLogGroupName: string
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
  readonly splunkHECEndpoint: string
  readonly snsFeedbackLoggingRole: Role
  readonly fhirValidatorUkCoreLambdaArn?: string
  readonly accessSlackSecretsManagedPolicy: ManagedPolicy
  readonly proxygenPTLRole: Role
  readonly proxygenProdRole: Role
  readonly proxygenManagedPolicy: ManagedPolicy
  readonly artifactsBucketArn?: string
  readonly trustStoreBucketArn?: string
  readonly trustStoreDeploymentBucketArn?: string
  readonly cptUIStatefulResourcesStaticContentBucketArn?: string
  readonly epsamKbDocsBucketArn?: string
}

export class AccountResourcesStack_UK extends Stack {
  public constructor(scope: App, id: string, props: AccountResourcesStackProps_UK){
    super(scope, id, props)

    Tags.of(this).add("stackName", props.stackName)

    // Imports
    // import the existing slack alert topic until we migrate rest of slack alerter code to cdk
    const slackAlertsSnsTopic = Topic.fromTopicArn(this, "SlackAlertTopic",
      Fn.importValue("lambda-resources:SlackAlertsSnsTopicArn"))

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const ecrRepositories = new ECRRepositories(this, "ECRRepositories")
    new RegressionTestSecrets(this, "RegressionTestSecrets", {stackName: props.stackName})

    new InspectorFilters(this, "InspectorFilters")

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
      alertSuppressionsParameter: alarms.parameters.alertSuppressions
    })

    // checked they are in the right stack

    new CfnOutput(this, "AccountResourcesALBLoggingBucketNameMigrationExport", {
      value: getExportValue("account-resources:ALBLoggingBucketName", props.environment),
      exportName: "account-resources:ALBLoggingBucketName"
    })
    new CfnOutput(this, "AccountResourcesAuditLoggingBucketMigrationExport", {
      value: getExportValue("account-resources:AuditLoggingBucket", props.environment),
      exportName: "account-resources:AuditLoggingBucket"
    })

    new CfnOutput(this, "AccountResourcesCloudwatchEncryptionKMSPolicyArnMigrationExport", {
      value: getExportValue("account-resources:CloudwatchEncryptionKMSPolicyArn", props.environment),
      exportName: "account-resources:CloudwatchEncryptionKMSPolicyArn"
    })
    new CfnOutput(this, "AccountResourcesCloudwatchLogsKmsKeyArnMigrationExport", {
      value: getExportValue("account-resources:CloudwatchLogsKmsKeyArn", props.environment),
      exportName: "account-resources:CloudwatchLogsKmsKeyArn"
    })
    new CfnOutput(this, "AccountResourcesLambdaEncryptCloudwatchKMSPolicyMigrationExport", {
      value: getExportValue("account-resources:LambdaEncryptCloudwatchKMSPolicy", props.environment),
      exportName: "account-resources:LambdaEncryptCloudwatchKMSPolicy"
    })
    new CfnOutput(this, "AccountResourcesSNSFeedbackLoggingRoleArnMigrationExport", {
      value: getExportValue("account-resources:SNSFeedbackLoggingRoleArn", props.environment),
      exportName: "account-resources:SNSFeedbackLoggingRoleArn"
    })
    new CfnOutput(this, "AccountResourcesSnsKMSKeyMigrationExport", {
      value: getExportValue("account-resources:SnsKMSKey", props.environment),
      exportName: "account-resources:SnsKMSKey"
    })

    new CfnOutput(this, "AccountResourcesSplunkDeliveryStreamBackupBucketMigrationExport", {
      value: getExportValue("account-resources:SplunkDeliveryStreamBackupBucket", props.environment),
      exportName: "account-resources:SplunkDeliveryStreamBackupBucket"
    })

    new CfnOutput(this, "AccountResourcesSplunkDeliveryStreamBackupBucketRoleMigrationExport", {
      value: getExportValue("account-resources:SplunkDeliveryStreamBackupBucketRole", props.environment),
      exportName: "account-resources:SplunkDeliveryStreamBackupBucketRole"
    })

    new CfnOutput(this, "AccountResourcesSplunkDeliveryStreamBackupBucketRoleArnMigrationExport", {
      value: getExportValue("account-resources:SplunkDeliveryStreamBackupBucketRoleArn", props.environment),
      exportName: "account-resources:SplunkDeliveryStreamBackupBucketRoleArn"
    })

    new CfnOutput(this, "AccountResourcesSplunkDeliveryStreamBackupKMSKeyMigrationExport", {
      value: getExportValue("account-resources:SplunkDeliveryStreamBackupKMSKey", props.environment),
      exportName: "account-resources:SplunkDeliveryStreamBackupKMSKey"
    })

    new CfnOutput(this, "AccountResourcesSqsDecryptSecretsKMSPolicyMigrationExport", {
      value: getExportValue("account-resources:SqsDecryptSecretsKMSPolicy", props.environment),
      exportName: "account-resources:SqsDecryptSecretsKMSPolicy"
    })
    new CfnOutput(this, "AccountResourcesSqsKMSKeyMigrationExport", {
      value: getExportValue("account-resources:SqsKMSKey", props.environment),
      exportName: "account-resources:SqsKMSKey"
    })
    new CfnOutput(this, "AccountResourcesTrustStoreBucketMigrationExport", {
      value: getExportValue("account-resources:TrustStoreBucket", props.environment),
      exportName: "account-resources:TrustStoreBucket"
    })
    new CfnOutput(this, "AccountResourcesTrustStoreBucketKMSKeyMigrationExport", {
      value: getExportValue("account-resources:TrustStoreBucketKMSKey", props.environment),
      exportName: "account-resources:TrustStoreBucketKMSKey"
    })
    new CfnOutput(this, "AccountResourcesTrustStoreDeploymentBucketMigrationExport", {
      value: getExportValue("account-resources:TrustStoreDeploymentBucket", props.environment),
      exportName: "account-resources:TrustStoreDeploymentBucket"
    })
    new CfnOutput(this, "LambdaResourcesLambdaInsightsLogGroupPolicyMigrationExport", {
      value: getExportValue("lambda-resources:LambdaInsightsLogGroupPolicy", props.environment),
      exportName: "lambda-resources:LambdaInsightsLogGroupPolicy"
    })
    new CfnOutput(this, "LambdaResourcesSlackAlertsSnsTopicArnMigrationExport", {
      value: getExportValue("lambda-resources:SlackAlertsSnsTopicArn", props.environment),
      exportName: "lambda-resources:SlackAlertsSnsTopicArn"
    })
    new CfnOutput(this, "LambdaResourcesSplunkDeliveryStreamMigrationExport", {
      value: getExportValue("lambda-resources:SplunkDeliveryStream", props.environment),
      exportName: "lambda-resources:SplunkDeliveryStream"
    })
    new CfnOutput(this, "LambdaResourcesSplunkSubscriptionFilterRoleMigrationExport", {
      value: getExportValue("lambda-resources:SplunkSubscriptionFilterRole", props.environment),
      exportName: "lambda-resources:SplunkSubscriptionFilterRole"
    })

    nagSuppressions(this, "AccountResources_UK")
  }
}

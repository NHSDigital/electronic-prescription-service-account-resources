import {
  StackProps,
  Stack,
  App,
  Tags,
  CfnOutput
} from "aws-cdk-lib"
import {ECRRepositories} from "../resources/ECRRepositories"
import {RegressionTestSecrets} from "../resources/RegressionTestSecrets"
import {Storage} from "../resources/Storage"
import {Encryption} from "../resources/Encryption"
import {ManagedPolicy, Role} from "aws-cdk-lib/aws-iam"
import {nagSuppressions} from "../nagSuppressions"
import {MonitoringStorage} from "../resources/MonitoringStorage"
import {Functions} from "../resources/Functions"
import {InspectorFilters} from "../resources/InspectorFilters"
import {Alarms} from "../resources/Alarms"
import {FunctionPolicies} from "../resources/FunctionPolicies"
import {LogGroups} from "../resources/LogGroups"
import {Secret} from "aws-cdk-lib/aws-secretsmanager"
import {Splunk} from "../resources/Splunk"
import {Slack} from "../resources/Slack"
import {Proxygen} from "../resources/Proxygen"

export interface AccountResourcesStackProps_UK extends StackProps {
  readonly stackName: string
  readonly version: string
  readonly commitId: string
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const ecrRepositories = new ECRRepositories(this, "ECRRepositories")
    new RegressionTestSecrets(this, "RegressionTestSecrets", {stackName: props.stackName})
    const storage = new Storage(this, "Storage", {
      logRetentionDays: 30,
      accountId: this.account,
      region: this.region,
      cloudFormationExecutionRole: props.cloudFormationExecutionRole,
      cloudFormationPrepareChangesetRole: props.cloudFormationPrepareChangesetRole,
      cloudFormationDeployRole: props.cloudFormationDeployRole,
      artifactsBucketArn: props.artifactsBucketArn,
      trustStoreBucketArn: props.trustStoreBucketArn,
      trustStoreDeploymentBucketArn: props.trustStoreDeploymentBucketArn,
      cptUIStatefulResourcesStaticContentBucketArn: props.cptUIStatefulResourcesStaticContentBucketArn,
      epsamKbDocsBucketArn: props.epsamKbDocsBucketArn
    })

    const encryption =new Encryption(this, "Encryption", {
      accountId: this.account,
      region: this.region,
      apiGwCloudWatchRole: props.apiGwCloudWatchRole,
      cloudFormationExecutionRole: props.cloudFormationExecutionRole
    })

    new InspectorFilters(this, "InspectorFilters")

    const logGroups = new LogGroups(this, "LogGroups", {
      cloudWatchLogsKmsKey: encryption.cloudwatchLogsKmsKey,
      lambdaInsightsLogGroupName: props.lambdaInsightsLogGroupName,
      logRetentionInDays: 30,
      stackName: props.stackName
    })
    const slack = new Slack(this, "Slack", {
      snsFeedbackLoggingRole: props.snsFeedbackLoggingRole,
      stackName: props.stackName,
      sqsKMSKey: encryption.sqsKmsKey
    })
    const alarms = new Alarms(this, "Alarms", {
      stackName: props.stackName,
      enableAlerts: props.enableAlerts,
      lambdaConcurrencyThreshold: props.lambdaConcurrencyThreshold,
      lambdaConcurrencyWarningThreshold: props.lambdaConcurrencyWarningThreshold,
      slackAlertsSnsTopic: slack.slackAlertsSnsTopic
    })
    const functionPolicies = new FunctionPolicies(this, "FunctionPolicies", {
      alertSuppressionsParameter: alarms.parameters.alertSuppressions,
      cloudwatchLogsKmsKey: encryption.cloudwatchLogsKmsKey,
      lambdaInsightsLogGroup: logGroups.lambdaInsightsLogGroup,
      clinicalTrackerCACertSecret: props.clinicalTrackerCACertSecret,
      clinicalTrackerClientCertSecret: props.clinicalTrackerClientCertSecret,
      clinicalTrackerClientSandboxCertSecret: props.clinicalTrackerClientSandboxCertSecret,
      pfpCACertSecret: props.pfpCACertSecret,
      pfpClientCertSecret: props.pfpClientCertSecret,
      pfpClientSandboxCertSecret: props.pfpClientSandboxCertSecret,
      psuCACertSecret: props.psuCACertSecret,
      psuClientCertSecret: props.psuClientCertSecret,
      psuClientSandboxCertSecret: props.psuClientSandboxCertSecret,
      fhirFacadeCACertSecret: props.fhirFacadeCACertSecret,
      fhirFacadeClientCertSecret: props.fhirFacadeClientCertSecret,
      fhirFacadeClientSandboxCertSecret: props.fhirFacadeClientSandboxCertSecret,
      spinePublicCertificate: props.spinePublicCertificate,
      ptlPrescriptionSigningPublicKey: props.ptlPrescriptionSigningPublicKey,
      slackAlerterSqsQueue: slack.slackAlerterSqsQueue,
      fhirValidatorUkCoreLambdaArn: props.fhirValidatorUkCoreLambdaArn
    })
    const monitoringStorage = new MonitoringStorage(this, "MonitoringStorage", {
      accountId: this.account,
      region: this.region,
      splunkDeliveryStreamBackupBucketRole: props.splunkDeliveryStreamBackupBucketRole,
      auditLoggingBucket: storage.auditLoggingBucket
    })

    const splunk = new Splunk(this, "Splunk", {
      stackName: props.stackName,
      version: props.version,
      commitId: props.commitId,
      logRetentionInDays: 30,
      logLevel: "DEBUG",
      cloudWatchLogsKmsKey: encryption.cloudwatchLogsKmsKey,
      lambdaInsightsLogGroupPolicy: functionPolicies.lambdaInsightsLogGroupPolicy,
      cloudwatchEncryptionKMSPolicy: encryption.useCloudwatchLogsKmsKeyManagedPolicy,
      splunkHECEndpoint: props.splunkHECEndpoint,
      splunkDeliveryStreamBackupBucket: monitoringStorage.splunkDeliveryStreamBackupBucket,
      splunkDeliveryStreamBackupKMSKey: monitoringStorage.splunkDeliveryStreamBackupKmsKey,
      splunkDeliveryStreamBackupBucketRole: props.splunkDeliveryStreamBackupBucketRole,
      splunkDeliveryStreamLogGroup: logGroups.splunkDeliveryStreamLogGroup,
      splunkDeliveryStreamLogStream: logGroups.splunkDeliveryStreamLogStream
    })
    new Functions(this, "Functions", {
      stackName: props.stackName,
      version: props.version,
      commitId: props.commitId,
      logRetentionInDays: 30,
      logLevel: "DEBUG",
      readAlertSuppressionsPolicy: functionPolicies.readAlertSuppressionsPolicy,
      lambdaDecryptSecretsKmsPolicy: props.lambdaDecryptSecretsKmsPolicy,
      splunkDeliveryStream: splunk.splunkDeliveryStream,
      splunkSubscriptionFilterRole: splunk.splunkSubscriptionFilterRole,
      lambdaInsightsLogGroupPolicy: functionPolicies.lambdaInsightsLogGroupPolicy,
      cloudwatchEncryptionKMSPolicy: encryption.useCloudwatchLogsKmsKeyManagedPolicy,
      cloudWatchLogsKmsKey: encryption.cloudwatchLogsKmsKey,
      certificateCheckerManagedPolicy: functionPolicies.certificateCheckerManagedPolicy,
      clinicalTrackerCACertSecret: props.clinicalTrackerCACertSecret,
      clinicalTrackerClientCertSecret: props.clinicalTrackerClientCertSecret,
      clinicalTrackerClientSandboxCertSecret: props.clinicalTrackerClientSandboxCertSecret,
      pfpCACertSecret: props.pfpCACertSecret,
      pfpClientCertSecret: props.pfpClientCertSecret,
      pfpClientSandboxCertSecret: props.pfpClientSandboxCertSecret,
      psuCACertSecret: props.psuCACertSecret,
      psuClientCertSecret: props.psuClientCertSecret,
      psuClientSandboxCertSecret: props.psuClientSandboxCertSecret,
      fhirFacadeCACertSecret: props.fhirFacadeCACertSecret,
      fhirFacadeClientCertSecret: props.fhirFacadeClientCertSecret,
      fhirFacadeClientSandboxCertSecret: props.fhirFacadeClientSandboxCertSecret,
      spinePublicCertificate: props.spinePublicCertificate,
      ptlPrescriptionSigningPublicKey: props.ptlPrescriptionSigningPublicKey,
      sqsDecryptSecretsKmsPolicy: encryption.sqsDecryptSecretsKmsPolicy,
      accessSlackSecretsManagedPolicy: props.accessSlackSecretsManagedPolicy,
      readSlackAlerterSqsQueuePolicy: functionPolicies.readSlackAlerterSqsQueuePolicy,
      FHIRValidatorListLambdaPolicy: functionPolicies.FHIRValidatorListLambdaPolicy,
      FHIRValidatorDeleteVersionPolicy: functionPolicies.FHIRValidatorDeleteVersionPolicy
    })

    new Proxygen(this, "Proxygen", {
      stackName: props.stackName,
      version: props.version,
      commitId: props.commitId,
      logRetentionInDays: 30,
      logLevel: "DEBUG",
      proxygenPTLRole: props.proxygenPTLRole,
      proxygenProdRole: props.proxygenProdRole,
      proxygenManagedPolicy: props.proxygenManagedPolicy,
      cloudWatchLogsKmsKey: encryption.cloudwatchLogsKmsKey,
      lambdaInsightsLogGroupPolicy: functionPolicies.lambdaInsightsLogGroupPolicy,
      cloudwatchEncryptionKMSPolicy: encryption.useCloudwatchLogsKmsKeyManagedPolicy
    })

    // account-resources:AccessSlackSecretsManagedPolicy
    // used by lambda-resources stack
    new CfnOutput(this, "AccessSlackSecretsManagedPolicy", {
      value: props.accessSlackSecretsManagedPolicy.managedPolicyArn,
      exportName: `${props.stackName}:ManagedPolicy:AccessSlackSecretsManagedPolicy:Arn`
    })
    // account-resources:ALBLoggingBucketName
    // used by prescribe-dispense stack
    new CfnOutput(this, "ALBLoggingBucketName", {
      value: storage.albLoggingBucket.bucketName || "UNDEFINED",
      exportName: `${props.stackName}:Bucket:ALBLoggingBucket:Name`
    })
    // account-resources:AuditLoggingBucket
    // used by cpt-ui-stateful-resources and epsam stacks
    new CfnOutput(this, "AuditLoggingBucketName", {
      value: storage.auditLoggingBucket.bucketName || "UNDEFINED",
      exportName: `${props.stackName}:Bucket:AuditLoggingBucket:Name`
    })

    // account-resources:CloudwatchEncryptionKMSPolicyArn
    // used by
    // pfp
    // psu
    // cpt
    // cpt-api
    // monitoring
    // epsam
    // lambda-resources
    // fhir-validator
    // vpc-resources
    // prescribe-dispense
    new CfnOutput(this, "CloudwatchEncryptionKMSPolicyArn", {
      value: encryption.useCloudwatchLogsKmsKeyManagedPolicy.managedPolicyArn,
      exportName: `${props.stackName}:ManagedPolicy:CloudwatchEncryptionKMSPolicy:Arn`
    })

    // account-resources:CloudwatchLogsKmsKeyArn
    // used by
    // cpt-api
    // cpt-ui
    // pfp
    // lambda-resources
    // monitoring
    // fhir-validator
    // psu
    // vpc-resources
    // prescribe-dispense
    // epsam
    new CfnOutput(this, "CloudwatchLogsKmsKeyArn", {
      value: encryption.cloudwatchLogsKmsKey.keyArn,
      exportName: `${props.stackName}:Key:CloudwatchLogsKmsKey:Arn`
    })

    // account-resources:LambdaEncryptCloudwatchKMSPolicy
    // used by
    // lambda-resources
    // fhir-validator
    new CfnOutput(this, "LambdaEncryptCloudwatchKMSPolicy", {
      value: encryption.lambdaEncryptCloudwatchKmsPolicy.managedPolicyArn,
      exportName: `${props.stackName}:ManagedPolicy:LambdaEncryptCloudwatchKMSPolicy:Arn`
    })

    // account-resources:SNSFeedbackLoggingRoleArn
    // used by lambda-resources
    new CfnOutput(this, "SNSFeedbackLoggingRoleArn", {
      value: props.snsFeedbackLoggingRole.roleArn,
      exportName: `${props.stackName}:Role:SNSFeedbackLoggingRole:Arn`
    })

    // account-resources:SnsKMSKey
    // used by lambda-resources
    new CfnOutput(this, "SnsKMSKey", {
      value: encryption.snsKmsKey.keyArn,
      exportName: `${props.stackName}:Key:SnsKmsKey:Arn`
    })

    // account-resources:SplunkDeliveryStreamBackupBucket
    // used by lambda-resources
    new CfnOutput(this, "SplunkDeliveryStreamBackupBucket", {
      value: monitoringStorage.splunkDeliveryStreamBackupBucket.attrArn,
      exportName: `${props.stackName}:Bucket:SplunkDeliveryStreamBackupBucket:Arn`
    })

    // account-resources:SplunkDeliveryStreamBackupBucketRole
    // used by lambda-resources
    new CfnOutput(this, "SplunkDeliveryStreamBackupBucketRole", {
      value: props.splunkDeliveryStreamBackupBucketRole.roleName,
      exportName: `${props.stackName}:Role:SplunkDeliveryStreamBackupBucketRole:Name`
    })

    // account-resources:SplunkDeliveryStreamBackupBucketRoleArn
    // used by lambda-resources
    new CfnOutput(this, "SplunkDeliveryStreamBackupBucketRoleArn", {
      value: props.splunkDeliveryStreamBackupBucketRole.roleArn,
      exportName: `${props.stackName}:Role:SplunkDeliveryStreamBackupBucketRole:Arn`
    })

    // account-resources:SplunkDeliveryStreamBackupKMSKey
    // used by lambda-resources
    new CfnOutput(this, "SplunkDeliveryStreamBackupKMSKey", {
      value: monitoringStorage.splunkDeliveryStreamBackupKmsKey.attrArn,
      exportName: `${props.stackName}:Key:SplunkDeliveryStreamBackupKMSKey:Arn`
    })

    // account-resources:SqsDecryptSecretsKMSPolicy
    // used by lambda-resources
    new CfnOutput(this, "SqsDecryptSecretsKMSPolicy", {
      value: encryption.sqsDecryptSecretsKmsPolicy.managedPolicyArn,
      exportName: `${props.stackName}:ManagedPolicy:SqsDecryptSecretsKMSPolicy:Arn`
    })

    // account-resources:SqsKMSKey
    // used by lambda-resources
    new CfnOutput(this, "SqsKMSKey", {
      value: encryption.sqsKmsKey.keyArn,
      exportName: `${props.stackName}:Key:SqsKMSKey:Arn`
    })

    // account-resources:TrustStoreBucket
    // used by
    // cpt-api
    // psu
    // pfp
    new CfnOutput(this, "TrustStoreBucket", {
      value: storage.trustStoreBucket.attrArn,
      exportName: `${props.stackName}:Bucket:TrustStoreBucket:Arn`
    })

    // account-resources:TrustStoreBucketKMSKey
    // used by cpt-api
    new CfnOutput(this, "TrustStoreBucketKMSKey", {
      value: storage.trustStoreBucketKmsKey.attrArn,
      exportName: `${props.stackName}:Key:TrustStoreBucketKMSKey:Arn`
    })

    // account-resources:TrustStoreBucketKMSKey
    // used by cpt-api
    new CfnOutput(this, "TrustStoreDeploymentBucket", {
      value: storage.trustStoreDeploymentBucket.attrArn,
      exportName: `${props.stackName}:Bucket:TrustStoreDeploymentBucket:Arn`
    })

    // lambda-resources:LambdaInsightsLogGroupPolicy
    // used by
    // lambda-resources ????
    // psu
    // pfp
    // psu
    // cpt-ui
    // epsam
    // cpt-api
    // fhir-validator
    // monitoring
    new CfnOutput(this, "LambdaInsightsLogGroupPolicy", {
      value: functionPolicies.lambdaInsightsLogGroupPolicy.managedPolicyArn,
      exportName: `${props.stackName}:Policy:LambdaInsightsLogGroupPolicy:Arn`
    })

    // lambda-resources:SlackAlertsSnsTopicArn
    // used by
    // pfp
    // psu
    // fhir-validator
    // monitoring
    new CfnOutput(this, "SlackAlertsSnsTopicArn", {
      value: slack.slackAlertsSnsTopic.topicArn,
      exportName: `${props.stackName}:SnsTopic:SlackAlertsSnsTopic:Arn`
    })

    // lambda-resources:SplunkDeliveryStream
    // used by
    // cpt-api
    // pfp
    // psu
    // fhir-validator
    // cpt-ui
    // prescribe-dispense
    // epsam
    // monitoring
    new CfnOutput(this, "SplunkDeliveryStream", {
      value: splunk.splunkDeliveryStream.attrArn,
      exportName: `${props.stackName}:KinesisFirehose:SplunkDeliveryStream:Arn`
    })

    // lambda-resources:SplunkSubscriptionFilterRole
    // used by
    // cpt-api
    // pfp
    // psu
    // fhir-validator
    // cpt-ui
    // prescribe-dispense
    // epsam
    // monitoring
    new CfnOutput(this, "SplunkSubscriptionFilterRole", {
      value: splunk.splunkSubscriptionFilterRole.roleArn,
      exportName: `${props.stackName}:Role:SplunkSubscriptionFilterRole:Arn`
    })
    nagSuppressions(this, "AccountResources_UK")
  }
}

import {
  StackProps,
  Stack,
  App,
  Tags,
  Fn
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

    nagSuppressions(this, "AccountResources_UK")
  }
}

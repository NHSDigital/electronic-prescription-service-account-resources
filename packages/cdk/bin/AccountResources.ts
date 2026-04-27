import {
  createApp,
  getBooleanConfigFromEnvVar,
  getNumberConfigFromEnvVar,
  getConfigFromEnvVar
} from "@nhsdigital/eps-cdk-constructs"
import {tryGetConfigFromEnvVar} from "./utils"
import {AccountResourcesStack_UK} from "../stacks/AccountResourcesStack_UK"
import {AccountResourcesStack_US} from "../stacks/AccountResourcesStack_US"
import {IAMStack} from "../stacks/IAMStack"
import {SecretsStack} from "../stacks/SecretsStack"

// for what we can migrate see
// https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/resource-import-supported-resources.html

async function main() {
  const {app, props} = createApp({
    productName: "Account Resources",
    appName: "AccountResourcesApp",
    repoName: "electronic-prescription-service-account-resources",
    driftDetectionGroup: "account-resources"
  })

  const accountResourcesUKStackName = getConfigFromEnvVar("accountResourcesUKStackName")
  const accountResourcesUSStackName = getConfigFromEnvVar("accountResourcesUSStackName")
  const deploySubjectClaimFilters = getConfigFromEnvVar("deploySubjectClaimFilters")
    .split(",").map(filter => filter.trim())
  const checkVersionSubjectClaimFilters = getConfigFromEnvVar("checkVersionSubjectClaimFilters")
    .split(",").map(filter => filter.trim())
  const prepareChangesetClaimFilters = getConfigFromEnvVar("prepareChangesetClaimFilters")
    .split(",").map(filter => filter.trim())
  const releaseNotesExecuteLambdaClaimFilters = getConfigFromEnvVar("releaseNotesExecuteLambdaClaimFilters")
    .split(",").map(filter => filter.trim())
  const artilleryLoadTestRoleClaimFilters = getConfigFromEnvVar("artilleryLoadTestRoleClaimFilters")
    .split(",").map(filter => filter.trim())
  const proxygenPTLClaimFilters = getConfigFromEnvVar("proxygenPTLClaimFilters")
    .split(",").map(filter => filter.trim())
  const proxygenProdClaimFilters = getConfigFromEnvVar("proxygenProdClaimFilters")
    .split(",").map(filter => filter.trim())
  const CDKPullImageClaimFilters = getConfigFromEnvVar("CDKPullImageClaimFilters")
    .split(",").map(filter => filter.trim())
  const CDKPushImageClaimFilters = getConfigFromEnvVar("CDKPushImageClaimFilters")
    .split(",").map(filter => filter.trim())
  const assistMeRegressionTestClaimFilters = getConfigFromEnvVar("assistMeRegressionTestClaimFilters")
    .split(",").map(filter => filter.trim())
  const assistMeDocumentSyncClaimFilters = getConfigFromEnvVar("assistMeDocumentSyncClaimFilters")
    .split(",").map(filter => filter.trim())

  const iamStack = new IAMStack(app, "IAM", {
    ...props,
    stackName: "iam-stack",
    deploySubjectClaimFilters,
    checkVersionSubjectClaimFilters,
    prepareChangesetClaimFilters,
    releaseNotesExecuteLambdaClaimFilters,
    artilleryLoadTestRoleClaimFilters,
    proxygenPTLClaimFilters,
    proxygenProdClaimFilters,
    CDKPullImageClaimFilters,
    CDKPushImageClaimFilters,
    assistMeRegressionTestClaimFilters,
    assistMeDocumentSyncClaimFilters
  })
  const secretsStack = new SecretsStack(app, "Secrets", {
    ...props,
    stackName: "secrets-stack",
    cloudFormationExecutionRole: iamStack.cloudFormationExecutionRole,
    cloudFormationDeployRole: iamStack.cloudFormationDeployRole
  })

  new AccountResourcesStack_UK(app, "AccountResources_UK", {
    ...props,
    stackName: accountResourcesUKStackName,
    cloudFormationExecutionRole: iamStack.cloudFormationExecutionRole,
    cloudFormationPrepareChangesetRole: iamStack.cloudFormationPrepareChangesetRole,
    cloudFormationDeployRole: iamStack.cloudFormationDeployRole,
    apiGwCloudWatchRole: iamStack.apiGwCloudWatchRole,
    splunkDeliveryStreamBackupBucketRole: iamStack.splunkDeliveryStreamBackupBucketRole,
    enableAlerts: getBooleanConfigFromEnvVar("enableAlerts"),
    lambdaConcurrencyThreshold:  getNumberConfigFromEnvVar("lambdaConcurrencyThreshold"),
    lambdaConcurrencyWarningThreshold: getNumberConfigFromEnvVar("lambdaConcurrencyWarningThreshold"),
    lambdaDecryptSecretsKmsPolicy: secretsStack.lambdaDecryptSecretsKmsPolicy,
    lambdaInsightsLogGroupName: getConfigFromEnvVar("lambdaInsightsLogGroupName"),
    clinicalTrackerCACertSecret: secretsStack.clinicalTrackerCACertSecret,
    clinicalTrackerClientCertSecret: secretsStack.clinicalTrackerClientCertSecret,
    clinicalTrackerClientSandboxCertSecret: secretsStack.clinicalTrackerClientSandboxCertSecret,
    pfpCACertSecret: secretsStack.pfpCACertSecret,
    pfpClientCertSecret: secretsStack.pfpClientCertSecret,
    pfpClientSandboxCertSecret: secretsStack.pfpClientSandboxCertSecret,
    psuCACertSecret: secretsStack.psuCACertSecret,
    psuClientCertSecret: secretsStack.psuClientCertSecret,
    psuClientSandboxCertSecret: secretsStack.psuClientSandboxCertSecret,
    fhirFacadeCACertSecret: secretsStack.fhirFacadeCACertSecret,
    fhirFacadeClientCertSecret: secretsStack.fhirFacadeClientCertSecret,
    fhirFacadeClientSandboxCertSecret: secretsStack.fhirFacadeClientSandboxCertSecret,
    spinePublicCertificate: secretsStack.spinePublicCertificate,
    ptlPrescriptionSigningPublicKey: secretsStack.ptlPrescriptionSigningPublicKey,
    splunkHECEndpoint: getConfigFromEnvVar("splunkHECEndpoint"),
    snsFeedbackLoggingRole: iamStack.snsFeedbackLoggingRole,
    accessSlackSecretsManagedPolicy: secretsStack.accessSlackSecretsManagedPolicy,
    proxygenPTLRole: iamStack.proxygenPTLRole,
    proxygenProdRole: iamStack.proxygenProdRole,
    proxygenManagedPolicy: secretsStack.proxygenManagedPolicy,
    fhirValidatorUkCoreLambdaArn: tryGetConfigFromEnvVar("fhirValidatorUkCoreLambdaArn"),
    artifactsBucketArn: tryGetConfigFromEnvVar("artifactsBucketArn"),
    trustStoreBucketArn: tryGetConfigFromEnvVar("trustStoreBucketArn"),
    trustStoreDeploymentBucketArn: tryGetConfigFromEnvVar("trustStoreDeploymentBucketArn"),
    cptUIStatefulResourcesStaticContentBucketArn:
      tryGetConfigFromEnvVar("cptUIStatefulResourcesStaticContentBucketArn"),
    epsamKbDocsBucketArn: tryGetConfigFromEnvVar("epsamKbDocsBucketArn")
  })

  new AccountResourcesStack_US(app, "AccountResources_US", {
    ...props,
    env: {
	    region: "us-east-1"
    },
    stackName: accountResourcesUSStackName
  })
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

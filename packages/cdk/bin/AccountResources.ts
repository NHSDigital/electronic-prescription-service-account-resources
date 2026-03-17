import {
  createApp,
  getBooleanConfigFromEnvVar,
  getNumberConfigFromEnvVar,
  getConfigFromEnvVar
} from "@nhsdigital/eps-cdk-constructs"
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

  const iamStack = new IAMStack(app, "IAM", {
    ...props,
    stackName: "iam-stack"
  })
  const secretsStack = new SecretsStack(app, "Secrets", {
    ...props,
    stackName: "secrets-stack",
    cloudFormationExecutionRole: iamStack.cloudFormationExecutionRole,
    cloudFormationDeployRole: iamStack.cloudFormationDeployRole
  })

  // safely retrieve fhirValidatorUkCoreLambdaArn from environment variable to allow for bootstrapping
  let fhirValidatorUkCoreLambdaArn: string | undefined
  try {
    fhirValidatorUkCoreLambdaArn = getConfigFromEnvVar("fhirValidatorUkCoreLambdaArn")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    console.warn("FHIR Validator UK Core Lambda ARN not found in environment variables.")
  }
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
    fhirValidatorUkCoreLambdaArn: fhirValidatorUkCoreLambdaArn
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

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

async function main() {
  const {app, props} = createApp({
    productName: "Account Resources",
    appName: "AccountResourcesApp",
    repoName: "electronic-prescription-service-account-resources",
    driftDetectionGroup: "account-resources"
  })

  const accountResourcesUKStackName = getConfigFromEnvVar("accountResourcesUKStackName")
  const accountResourcesUSStackName = getConfigFromEnvVar("accountResourcesUSStackName")

  new IAMStack(app, "IAM", {
    ...props,
    stackName: "iam-stack"
  })
  new SecretsStack(app, "Secrets", {
    ...props,
    stackName: "secrets-stack"
  })

  new AccountResourcesStack_UK(app, "AccountResources_UK", {
    ...props,
    stackName: accountResourcesUKStackName,
    enableAlerts: getBooleanConfigFromEnvVar("enableAlerts"),
    lambdaConcurrencyThreshold:  getNumberConfigFromEnvVar("lambdaConcurrencyThreshold"),
    lambdaConcurrencyWarningThreshold: getNumberConfigFromEnvVar("lambdaConcurrencyWarningThreshold")
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

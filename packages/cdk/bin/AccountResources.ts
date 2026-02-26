import {
  createApp,
  getBooleanConfigFromEnvVar,
  getNumberConfigFromEnvVar,
  getConfigFromEnvVar
} from "@nhsdigital/eps-cdk-constructs"
import {AccountResourcesStack_UK} from "../stacks/AccountResourcesStack_UK"
import {AccountResourcesStack_US} from "../stacks/AccountResourcesStack_US"
import {MonitoringStack} from "../stacks/MonitoringStack"
import {IAMStack} from "../stacks/IAMStack"

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
  const monitoringStackName = getConfigFromEnvVar("monitoringStackName")

  new IAMStack(app, "IAM", {
    ...props,
    stackName: "iam-stack"
  })
  new AccountResourcesStack_UK(app, "AccountResources_UK", {
    ...props,
    stackName: accountResourcesUKStackName
  })
  new AccountResourcesStack_US(app, "AccountResources_US", {
    ...props,
    env: {
	    region: "us-east-1"
    },
    stackName: accountResourcesUSStackName
  })
  new MonitoringStack(app, "Monitoring", {
    ...props,
    stackName: monitoringStackName,
    lambdaConcurrencyThreshold:  getNumberConfigFromEnvVar("lambdaConcurrencyThreshold"),
    lambdaConcurrencyWarningThreshold: getNumberConfigFromEnvVar("lambdaConcurrencyWarningThreshold"),
    enableAlerts: getBooleanConfigFromEnvVar("enableAlerts")
  })
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

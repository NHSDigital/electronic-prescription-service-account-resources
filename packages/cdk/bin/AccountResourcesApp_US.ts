import {App, Aspects, Tags} from "aws-cdk-lib"
import {AwsSolutionsChecks} from "cdk-nag"
import {AccountResourcesStack_US} from "../stacks/AccountResourcesStack_US"
import fs from "fs"

// read the config in
const configFileName = process.env["CONFIG_FILE_NAME"]
if (configFileName === undefined) {
  throw new Error("Can not read config file")
}

const configDetails = JSON.parse(fs.readFileSync(configFileName, "utf-8"))

// create the app using the config details
const app = new App({context: configDetails})

const accountId = app.node.tryGetContext("accountId")
const stackName = app.node.tryGetContext("stackName")
const version = app.node.tryGetContext("versionNumber")
const commit = app.node.tryGetContext("commitId")
const cfnDriftDetectionGroup = app.node.tryGetContext("cfnDriftDetectionGroup")

Aspects.of(app).add(new AwsSolutionsChecks({verbose: true}))

Tags.of(app).add("version", version)
Tags.of(app).add("commit", commit)
Tags.of(app).add("stackName", stackName)
Tags.of(app).add("cdkApp", "AccountResources-cdk-US")
Tags.of(app).add("repo", "electronic-prescription-service-account-resources")
Tags.of(app).add("cfnDriftDetectionGroup", cfnDriftDetectionGroup)

new AccountResourcesStack_US(app, "AccountResources_US", {
  env: {
    region: "us-east-1",
    account: accountId
  },
  stackName: stackName,
  version: version,
  commitId: commit
})

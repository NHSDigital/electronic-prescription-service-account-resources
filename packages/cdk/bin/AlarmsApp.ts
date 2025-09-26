import {App, Aspects, Tags} from "aws-cdk-lib"
import {AwsSolutionsChecks} from "cdk-nag"
import {AlarmStack} from "../stacks/AlarmsStack"
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
const alarmStackName = app.node.tryGetContext("alarmStackName")
const version = app.node.tryGetContext("versionNumber")
const commit = app.node.tryGetContext("commitId")
const cfnDriftDetectionGroup = app.node.tryGetContext("cfnDriftDetectionGroup")

Aspects.of(app).add(new AwsSolutionsChecks({verbose: true}))

Tags.of(app).add("version", version)
Tags.of(app).add("commit", commit)
Tags.of(app).add("cdkApp", "AccountResources")
Tags.of(app).add("repo", "electronic-prescription-service-account-resources")
Tags.of(app).add("cfnDriftDetectionGroup", cfnDriftDetectionGroup)

const alarmStack = new AlarmStack(app, "AlarmStack", {
  env: {
    region: "eu-west-2",
    account: accountId
  },
  stackName: alarmStackName,
  version: version,
  commitId: commit
})
Tags.of(alarmStack).add("stackName", alarmStackName)

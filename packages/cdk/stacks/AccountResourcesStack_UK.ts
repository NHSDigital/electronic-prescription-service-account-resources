import {
  StackProps,
  Stack,
  App,
  Tags
} from "aws-cdk-lib"
import {ECRRepositories} from "../resources/ECRRepositories"
import {RegressionTestSecrets} from "../resources/RegressionTestSecrets"
import {Storage} from "../resources/Storage"
import {Encryption} from "../resources/Encryption"
import {MTLSSecrets} from "../resources/MTLSSecrets"
import {ProxygenSecrets} from "../resources/ProxygenSecrets"
import {AtlassianSecrets} from "../resources/AtlassianSecrets"
import {ConfigSecrets} from "../resources/ConfigSecrets"
import {IRole} from "aws-cdk-lib/aws-iam"

export interface AccountResourcesStackProps_UK extends StackProps {
  readonly stackName: string
  readonly version: string
  readonly commitId: string
  readonly cloudFormationExecutionRole: IRole
  readonly cloudFormationPrepareChangesetRole: IRole
  readonly CloudFormationDeployRole: IRole
  readonly apiGwCloudWatchRole: IRole
}

export class AccountResourcesStack_UK extends Stack {
  public constructor(scope: App, id: string, props: AccountResourcesStackProps_UK){
    super(scope, id, props)

    Tags.of(this).add("stackName", props.stackName)
    new ECRRepositories(this, "ECRRepositories")
    new RegressionTestSecrets(this, "RegressionTestSecrets", {stackName: props.stackName})
    new Storage(this, "Storage", {
      logRetentionDays: 30,
      accountId: this.account,
      region: this.region,
      cloudFormationExecutionRole: props.cloudFormationExecutionRole,
      cloudFormationPrepareChangesetRole: props.cloudFormationPrepareChangesetRole,
      CloudFormationDeployRole: props.CloudFormationDeployRole
      // need a way to pass these in
      // artifactsBucketArn
      // trustStoreBucketArn
      // trustStoreDeploymentBucketArn
      // cptUIStatefulResourcesStaticContentBucketArn
      // epsamKbDocsBucketArn
    })
    const encryption =new Encryption(this, "Encryption", {
      accountId: this.account,
      region: this.region,
      apiGwCloudWatchRole: props.apiGwCloudWatchRole,
      cloudFormationExecutionRole: props.cloudFormationExecutionRole,
      cloudFormationPrepareChangesetRole: props.cloudFormationPrepareChangesetRole,
      CloudFormationDeployRole: props.CloudFormationDeployRole
    })
    new MTLSSecrets(this, "MTLSSecrets", {
      stackName: props.stackName,
      MTLSSecretsKmsKey: encryption.secretsKmsKey
    })
    new ProxygenSecrets(this, "ProxygenSecrets", {
      stackName: props.stackName,
      proxygenSecretsKmsKey: encryption.secretsKmsKey
    })
    new AtlassianSecrets(this, "AtlassianSecrets", {
      stackName: props.stackName,
      atlassianSecretsKmsKey: encryption.secretsKmsKey
    })
    new ConfigSecrets(this, "ConfigSecrets", {
      stackName: props.stackName,
      configSecretsKmsKey: encryption.secretsKmsKey
    })
  }
}

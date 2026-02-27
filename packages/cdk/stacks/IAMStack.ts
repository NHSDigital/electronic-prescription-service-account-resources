import {StackProps, Stack, App} from "aws-cdk-lib"
import {IdentityProvider} from "../resources/IdentityProvider"
import {Roles} from "../resources/Roles"
import {Policies} from "../resources/Policies"
import {ApiGatewayAccount} from "../resources/ApiGatewayAccount"
import {Role} from "aws-cdk-lib/aws-iam"
import {DeploymentPolicies} from "../resources/deploymentPolicies"

export interface IAMStackProps extends StackProps {
  readonly stackName: string
  readonly version: string
  readonly commitId: string
}

export class IAMStack extends Stack {
  readonly cloudFormationExecutionRole: Role
  readonly cloudFormationPrepareChangesetRole: Role
  readonly CloudFormationDeployRole: Role
  readonly apiGwCloudWatchRole: Role
  readonly splunkDeliveryStreamBackupBucketRole: Role

  public constructor(scope: App, id: string, props: IAMStackProps) {
    super(scope, id, props)

    const identityProvider = new IdentityProvider(this, "IdentityProvider")
    const roles = new Roles(this, "Roles", {
      gitHubIdentityProvider: identityProvider.gitHubIdentityProvider,
      deploySubjectClaimFilters: ["foo"],
      checkVersionSubjectClaimFilters: ["foo"],
      prepareChangesetClaimFilters: ["foo"],
      releaseNotesExecuteLambdaClaimFilters: ["foo"],
      artilleryLoadTestRoleClaimFilters: ["foo"],
      proxygenPTLClaimFilters: ["foo"],
      proxygenProdClaimFilters: ["foo"],
      CDKPullImageClaimFilters: ["foo"],
      CDKPushImageClaimFilters: ["foo"],
      assistMeRegressionTestClaimFilters: ["foo"],
      assistMeDocumentSyncClaimFilters: ["foo"]
    })
    const policies = new Policies(this, "Policies", {
      region: this.region,
      accountId: this.account,
      apiGwCloudWatchRole: roles.apiGwCloudWatchRole,
      snsFeedbackLoggingRole: roles.snsFeedbackLoggingRole,
      splunkDeliveryStreamBackupBucketRole: roles.splunkDeliveryStreamBackupBucketRole,
      CloudFormationDeployRole: roles.CloudFormationDeployRole,
      cloudFormationExecutionRole: roles.cloudFormationExecutionRole,
      cloudFormationCheckVersionRole: roles.cloudFormationCheckVersionRole,
      cloudFormationPrepareChangesetRole: roles.cloudFormationPrepareChangesetRole,
      releaseNotesExecuteLambdaRole: roles.releaseNotesExecuteLambdaRole,
      artilleryRunnerRole: roles.artilleryRunnerRole,
      proxygenPTLRole: roles.proxygenPTLRole,
      proxygenProdRole: roles.proxygenProdRole,
      CDKPullImageRole: roles.CDKPullImageRole,
      CDKPushImageRole: roles.CDKPushImageRole,
      assistMeRegressionTestRole: roles.assistMeRegressionTestRole,
      assistMeDocumentSyncRole: roles.assistMeDocumentSyncRole
      // need a way of passing athenaResultsBucketKmsKey and athenaResultsBucket
    })

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const deploymentPolicies = new DeploymentPolicies(this, "DeploymentPolicies", {
      region: this.region,
      accountId: this.account,
      cloudFormationExecutionRole: roles.cloudFormationExecutionRole
    })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const apiGatewayAccount = new ApiGatewayAccount(this, "ApiGatewayAccount", {
      apiGwCloudWatchRole: roles.apiGwCloudWatchRole,
      allowApiGwLoggingPolicy: policies.allowApiGwLoggingPolicy
    })

    this.cloudFormationExecutionRole = roles.cloudFormationExecutionRole
    this.cloudFormationPrepareChangesetRole = roles.cloudFormationPrepareChangesetRole
    this.CloudFormationDeployRole = roles.CloudFormationDeployRole
    this.apiGwCloudWatchRole = roles.apiGwCloudWatchRole
    this.splunkDeliveryStreamBackupBucketRole = roles.splunkDeliveryStreamBackupBucketRole
  }
}

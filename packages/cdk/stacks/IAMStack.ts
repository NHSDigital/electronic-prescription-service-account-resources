import {
  StackProps,
  Stack,
  App,
  CfnOutput
} from "aws-cdk-lib"
import {IdentityProvider} from "../resources/IdentityProvider"
import {Roles} from "../resources/Roles"
import {Policies} from "../resources/Policies"
import {ApiGatewayAccount} from "../resources/ApiGatewayAccount"
import {Role} from "aws-cdk-lib/aws-iam"
import {DeploymentPolicies} from "../resources/DeploymentPolicies"
import {nagSuppressions} from "../nagSuppressions"

export interface IAMStackProps extends StackProps {
  readonly stackName: string
  readonly version: string
  readonly commitId: string
}

export class IAMStack extends Stack {
  public readonly cloudFormationExecutionRole: Role
  public readonly cloudFormationPrepareChangesetRole: Role
  public readonly cloudFormationDeployRole: Role
  public readonly apiGwCloudWatchRole: Role
  public readonly splunkDeliveryStreamBackupBucketRole: Role
  public readonly snsFeedbackLoggingRole: Role
  public readonly proxygenPTLRole: Role
  public readonly proxygenProdRole: Role

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
      cloudFormationDeployRole: roles.cloudFormationDeployRole,
      cloudFormationExecutionRole: roles.cloudFormationExecutionRole,
      cloudFormationCheckVersionRole: roles.cloudFormationCheckVersionRole,
      cloudFormationPrepareChangesetRole: roles.cloudFormationPrepareChangesetRole,
      releaseNotesExecuteLambdaRole: roles.releaseNotesExecuteLambdaRole,
      artilleryRunnerRole: roles.artilleryRunnerRole,
      proxygenPTLRole: roles.proxygenPTLRole,
      proxygenProdRole: roles.proxygenProdRole,
      cdkPullImageRole: roles.cdkPullImageRole,
      cdkPushImageRole: roles.cdkPushImageRole,
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
    this.cloudFormationDeployRole = roles.cloudFormationDeployRole
    this.apiGwCloudWatchRole = roles.apiGwCloudWatchRole
    this.splunkDeliveryStreamBackupBucketRole = roles.splunkDeliveryStreamBackupBucketRole
    this.snsFeedbackLoggingRole = roles.snsFeedbackLoggingRole
    this.proxygenPTLRole = roles.proxygenPTLRole
    this.proxygenProdRole = roles.proxygenProdRole

    // ci-resources:AssistMeDocumentSyncRole
    // used by epsam
    new CfnOutput(this, "AssistMeDocumentSyncRole", {
      value: roles.assistMeDocumentSyncRole.roleArn,
      exportName: `${props.stackName}:Role:AssistMeDocumentSyncRole:Arn`
    })

    // ci-resources:CloudFormationDeployRole
    // used by
    // account-resources
    // cpt-ui
    // epsam
    new CfnOutput(this, "CloudFormationDeployRole", {
      value: roles.cloudFormationDeployRole.roleArn,
      exportName: `${props.stackName}:Role:CloudFormationDeployRole:Arn`
    })

    // ci-resources:CloudFormationDeployRoleName
    // used by account-resources
    new CfnOutput(this, "CloudFormationDeployRoleName", {
      value: roles.cloudFormationDeployRole.roleName,
      exportName: `${props.stackName}:Role:CloudFormationDeployRole:Name`
    })

    // ci-resources:CloudFormationExecutionRole
    // used by account-resources
    new CfnOutput(this, "CloudFormationExecutionRole", {
      value: roles.cloudFormationExecutionRole.roleArn,
      exportName: `${props.stackName}:Role:CloudFormationExecutionRole:Arn`
    })

    // ci-resources:CloudFormationExecutionRoleName
    // used by account-resources
    new CfnOutput(this, "CloudFormationExecutionRoleName", {
      value: roles.cloudFormationExecutionRole.roleName,
      exportName: `${props.stackName}:Role:CloudFormationExecutionRole:Name`
    })

    // ci-resources:CloudFormationPrepareChangesetRole
    // used by account-resources
    new CfnOutput(this, "CloudFormationPrepareChangesetRole", {
      value: roles.cloudFormationPrepareChangesetRole.roleArn,
      exportName: `${props.stackName}:Role:CloudFormationPrepareChangesetRole:Arn`
    })

    // ci-resources:CloudFormationPrepareChangesetRoleName
    // used by account-resources
    new CfnOutput(this, "CloudFormationPrepareChangesetRoleName", {
      value: roles.cloudFormationPrepareChangesetRole.roleName,
      exportName: `${props.stackName}:Role:CloudFormationPrepareChangesetRole:Name`
    })

    // ci-resources:ProxygenProdRoleName
    // used by lambda-resources
    new CfnOutput(this, "ProxygenProdRoleName", {
      value: roles.proxygenProdRole.roleName,
      exportName: `${props.stackName}:Role:ProxygenProdRole:Name`
    })

    // ci-resources:ProxygenPTLRoleName
    // used by lambda-resources
    new CfnOutput(this, "ProxygenPTLRoleName", {
      value: roles.proxygenPTLRole.roleName,
      exportName: `${props.stackName}:Role:ProxygenPTLRole:Name`
    })

    nagSuppressions(this, "IAM")

  }
}

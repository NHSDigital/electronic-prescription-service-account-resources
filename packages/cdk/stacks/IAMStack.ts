import {StackProps, Stack, App} from "aws-cdk-lib"
import {IdentityProvider} from "../resources/IdentityProvider"
import {CfnAccount} from "aws-cdk-lib/aws-apigateway"
import {Roles} from "../resources/Roles"
import {Policies} from "../resources/Policies"

export interface IAMStackProps extends StackProps {
  readonly stackName: string
  readonly version: string
  readonly commitId: string
}

export class IAMStack extends Stack {
  public constructor(scope: App, id: string, props: IAMStackProps) {
    super(scope, id, props)

    const identityProvider = new IdentityProvider(this, "IdentityProvider", {
      importResources: true
    })
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
    })

    const account = new CfnAccount(this, "Account", {
      cloudWatchRoleArn: roles.apiGwCloudWatchRole.roleArn
    })

    account.node.addDependency(policies.allowApiGwLoggingPolicy)
  }
}

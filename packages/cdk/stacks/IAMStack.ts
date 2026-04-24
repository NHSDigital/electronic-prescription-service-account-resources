import {
  StackProps,
  Stack,
  App,
  CfnOutput
} from "aws-cdk-lib"
import {Role} from "aws-cdk-lib/aws-iam"
import {nagSuppressions} from "../nagSuppressions"
import {getExportValue} from "../resources/ExportMigrations"

export interface IAMStackProps extends StackProps {
  readonly stackName: string
  readonly version: string
  readonly commitId: string
  readonly environment: string
  readonly deploySubjectClaimFilters: Array<string>
  readonly checkVersionSubjectClaimFilters: Array<string>
  readonly prepareChangesetClaimFilters: Array<string>
  readonly releaseNotesExecuteLambdaClaimFilters: Array<string>
  readonly artilleryLoadTestRoleClaimFilters: Array<string>
  readonly proxygenPTLClaimFilters: Array<string>
  readonly proxygenProdClaimFilters: Array<string>
  readonly CDKPullImageClaimFilters: Array<string>
  readonly CDKPushImageClaimFilters: Array<string>
  readonly assistMeRegressionTestClaimFilters: Array<string>
  readonly assistMeDocumentSyncClaimFilters: Array<string>
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

    new CfnOutput(this, "CiResourcesAssistMeDocumentSyncRoleMigrationExport", {
      value: getExportValue("ci-resources:AssistMeDocumentSyncRole", props.environment),
      exportName: `${props.stackName}:IAM:AssistMeDocumentSyncRole:Arn`
    })
    new CfnOutput(this, "CiResourcesCloudFormationDeployRoleMigrationExport", {
      value: getExportValue("ci-resources:CloudFormationDeployRole", props.environment),
      exportName: `${props.stackName}:IAM:CloudFormationDeployRole:Arn`
    })
    new CfnOutput(this, "CiResourcesCloudFormationDeployRoleNameMigrationExport", {
      value: getExportValue("ci-resources:CloudFormationDeployRoleName", props.environment),
      exportName: `${props.stackName}:IAM:CloudFormationDeployRole:Name`
    })
    new CfnOutput(this, "CiResourcesCloudFormationExecutionRoleMigrationExport", {
      value: getExportValue("ci-resources:CloudFormationExecutionRole", props.environment),
      exportName: `${props.stackName}:IAM:CloudFormationExecutionRole:Arn`
    })
    new CfnOutput(this, "CiResourcesCloudFormationExecutionRoleNameMigrationExport", {
      value: getExportValue("ci-resources:CloudFormationExecutionRoleName", props.environment),
      exportName: `${props.stackName}:IAM:CloudFormationExecutionRole:Name`
    })

    new CfnOutput(this, "CiResourcesCloudFormationPrepareChangesetRoleMigrationExport", {
      value: getExportValue("ci-resources:CloudFormationPrepareChangesetRole", props.environment),
      exportName: `${props.stackName}:IAM:CloudFormationPrepareChangesetRole:Arn`
    })
    new CfnOutput(this, "CiResourcesCloudFormationPrepareChangesetRoleNameMigrationExport", {
      value: getExportValue("ci-resources:CloudFormationPrepareChangesetRoleName", props.environment),
      exportName: `${props.stackName}:IAM:CloudFormationPrepareChangesetRole:Name`
    })
    new CfnOutput(this, "CiResourcesProxygenProdRoleNameMigrationExport", {
      value: getExportValue("ci-resources:ProxygenProdRoleName", props.environment),
      exportName: `${props.stackName}:IAM:ProxygenProdRole:Name`
    })

    new CfnOutput(this, "CiResourcesProxygenPTLRoleNameMigrationExport", {
      value: getExportValue("ci-resources:ProxygenPTLRoleName", props.environment),
      exportName: `${props.stackName}:IAM:ProxygenPTLRole:Name`
    })

    nagSuppressions(this, "IAM")

  }
}

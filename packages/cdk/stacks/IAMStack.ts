import {
  StackProps,
  Stack,
  App,
  CfnOutput
} from "aws-cdk-lib"
import {nagSuppressions} from "../nagSuppressions"
import {getExportValue} from "../resources/ExportMigrations"

export interface IAMStackProps extends StackProps {
  readonly stackName: string
  readonly version: string
  readonly commitId: string
  readonly environment: string
}

export class IAMStack extends Stack {

  public constructor(scope: App, id: string, props: IAMStackProps) {
    super(scope, id, props)

    new CfnOutput(this, "AssistMeDocumentSyncRoleArn", {
      value: getExportValue("ci-resources:AssistMeDocumentSyncRole", props.environment),
      exportName: `${props.stackName}:IAM:AssistMeDocumentSyncRole:Arn`
    })
    new CfnOutput(this, "CloudFormationDeployRoleArn", {
      value: getExportValue("ci-resources:CloudFormationDeployRole", props.environment),
      exportName: `${props.stackName}:IAM:CloudFormationDeployRole:Arn`
    })
    new CfnOutput(this, "CloudFormationDeployRoleName", {
      value: getExportValue("ci-resources:CloudFormationDeployRoleName", props.environment),
      exportName: `${props.stackName}:IAM:CloudFormationDeployRole:Name`
    })
    new CfnOutput(this, "CloudFormationExecutionRoleArn", {
      value: getExportValue("ci-resources:CloudFormationExecutionRole", props.environment),
      exportName: `${props.stackName}:IAM:CloudFormationExecutionRole:Arn`
    })
    new CfnOutput(this, "CloudFormationExecutionRoleName", {
      value: getExportValue("ci-resources:CloudFormationExecutionRoleName", props.environment),
      exportName: `${props.stackName}:IAM:CloudFormationExecutionRole:Name`
    })

    new CfnOutput(this, "CloudFormationPrepareChangesetRoleArn", {
      value: getExportValue("ci-resources:CloudFormationPrepareChangesetRole", props.environment),
      exportName: `${props.stackName}:IAM:CloudFormationPrepareChangesetRole:Arn`
    })
    new CfnOutput(this, "CloudFormationPrepareChangesetRoleName", {
      value: getExportValue("ci-resources:CloudFormationPrepareChangesetRoleName", props.environment),
      exportName: `${props.stackName}:IAM:CloudFormationPrepareChangesetRole:Name`
    })
    new CfnOutput(this, "ProxygenProdRoleName", {
      value: getExportValue("ci-resources:ProxygenProdRoleName", props.environment),
      exportName: `${props.stackName}:IAM:ProxygenProdRole:Name`
    })

    new CfnOutput(this, "ProxygenPTLRoleName", {
      value: getExportValue("ci-resources:ProxygenPTLRoleName", props.environment),
      exportName: `${props.stackName}:IAM:ProxygenPTLRole:Name`
    })

    new CfnOutput(this, "GitHubIdentityProviderArn", {
      value: getExportValue("ci-resources:GitHubIdentityProvider", props.environment),
      exportName: `${props.stackName}:IAM:GitHubIdentityProvider:Arn`
    })

    nagSuppressions(this, "IAM")

  }
}

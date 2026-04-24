import {StackProps, Stack, App} from "aws-cdk-lib"
import {Role} from "aws-cdk-lib/aws-iam"
import {nagSuppressions} from "../nagSuppressions"

export interface IAMStackProps extends StackProps {
  readonly stackName: string
  readonly version: string
  readonly commitId: string
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

    nagSuppressions(this, "IAM")

  }
}

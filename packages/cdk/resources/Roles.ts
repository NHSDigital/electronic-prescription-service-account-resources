import {
  FederatedPrincipal,
  IOidcProvider,
  Role,
  ServicePrincipal
} from "aws-cdk-lib/aws-iam"
import {Construct} from "constructs"

export interface RolesProps {
  readonly gitHubIdentityProvider: IOidcProvider
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
export class Roles extends Construct {
  public readonly apiGwCloudWatchRole: Role
  public readonly snsFeedbackLoggingRole: Role
  public readonly splunkDeliveryStreamBackupBucketRole: Role
  public readonly cloudFormationDeployRole: Role
  public readonly cloudFormationExecutionRole: Role
  public readonly cloudFormationCheckVersionRole: Role
  public readonly cloudFormationPrepareChangesetRole: Role
  public readonly releaseNotesExecuteLambdaRole: Role
  public readonly artilleryRunnerRole: Role
  public readonly proxygenPTLRole: Role
  public readonly proxygenProdRole: Role
  public readonly cdkPullImageRole: Role
  public readonly cdkPushImageRole: Role
  public readonly assistMeRegressionTestRole: Role
  public readonly assistMeDocumentSyncRole: Role

  public constructor(scope: Construct, id: string, props: RolesProps) {
    super(scope, id)

    // from account_resources.yaml

    const apiGwCloudWatchRole = new Role(this, "ApiGwCloudWatchRole", {
      assumedBy: new ServicePrincipal("apigateway.amazonaws.com")
    })
    // this is used in an export
    const snsFeedbackLoggingRole = new Role(this, "SNSFeedbackLoggingRole", {
      assumedBy: new ServicePrincipal("sns.amazonaws.com")
    })
    // this is used in a bucket policy and an export???
    const splunkDeliveryStreamBackupBucketRole = new Role(this, "SplunkDeliveryStreamBackupBucketRole", {
      assumedBy: new ServicePrincipal("firehose.amazonaws.com")
    })

    // from ci-resources
    const cloudFormationDeployRole = new Role(this, "CloudFormationDeployRole", {
      assumedBy: new FederatedPrincipal(
        props.gitHubIdentityProvider.openIdConnectProviderArn,
        {
          StringEquals: {
            "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
          },
          "ForAnyValue:StringLike": {
            "token.actions.githubusercontent.com:sub": props.deploySubjectClaimFilters
          }
        },
        "sts:AssumeRoleWithWebIdentity"
      )
    })
    const cloudFormationExecutionRole = new Role(this, "CloudFormationExecutionRole", {
      assumedBy: new ServicePrincipal("cloudformation.amazonaws.com")
    })
    const cloudFormationCheckVersionRole = new Role(this, "CloudFormationCheckVersionRole", {
      assumedBy: new FederatedPrincipal(
        props.gitHubIdentityProvider.openIdConnectProviderArn,
        {
          StringEquals: {
            "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
          },
          "ForAnyValue:StringLike": {
            "token.actions.githubusercontent.com:sub": props.checkVersionSubjectClaimFilters
          }
        },
        "sts:AssumeRoleWithWebIdentity"
      )
    })
    const cloudFormationPrepareChangesetRole = new Role(this, "CloudFormationPrepareChangesetRole", {
      assumedBy: new FederatedPrincipal(
        props.gitHubIdentityProvider.openIdConnectProviderArn,
        {
          StringEquals: {
            "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
          },
          "ForAnyValue:StringLike": {
            "token.actions.githubusercontent.com:sub": props.prepareChangesetClaimFilters
          }
        },
        "sts:AssumeRoleWithWebIdentity"
      )
    })
    const releaseNotesExecuteLambdaRole = new Role(this, "ReleaseNotesExecuteLambdaRole", {
      assumedBy: new FederatedPrincipal(
        props.gitHubIdentityProvider.openIdConnectProviderArn,
        {
          StringEquals: {
            "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
          },
          "ForAnyValue:StringLike": {
            "token.actions.githubusercontent.com:sub": props.releaseNotesExecuteLambdaClaimFilters
          }
        },
        "sts:AssumeRoleWithWebIdentity"
      )
    })
    const artilleryRunnerRole = new Role(this, "ArtilleryRunnerRole", {
      assumedBy: new FederatedPrincipal(
        props.gitHubIdentityProvider.openIdConnectProviderArn,
        {
          StringEquals: {
            "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
          },
          "ForAnyValue:StringLike": {
            "token.actions.githubusercontent.com:sub": props.artilleryLoadTestRoleClaimFilters
          }
        },
        "sts:AssumeRoleWithWebIdentity"
      )
    })
    const proxygenPTLRole = new Role(this, "ProxygenPTLRole", {
      assumedBy: new FederatedPrincipal(
        props.gitHubIdentityProvider.openIdConnectProviderArn,
        {
          StringEquals: {
            "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
          },
          "ForAnyValue:StringLike": {
            "token.actions.githubusercontent.com:sub": props.proxygenPTLClaimFilters
          }
        },
        "sts:AssumeRoleWithWebIdentity"
      )
    })
    const proxygenProdRole = new Role(this, "ProxygenProdRole", {
      assumedBy: new FederatedPrincipal(
        props.gitHubIdentityProvider.openIdConnectProviderArn,
        {
          StringEquals: {
            "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
          },
          "ForAnyValue:StringLike": {
            "token.actions.githubusercontent.com:sub": props.proxygenProdClaimFilters
          }
        },
        "sts:AssumeRoleWithWebIdentity"
      )
    })
    const cdkPullImageRole = new Role(this, "CDKPullImageRole", {
      assumedBy: new FederatedPrincipal(
        props.gitHubIdentityProvider.openIdConnectProviderArn,
        {
          StringEquals: {
            "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
          },
          "ForAnyValue:StringLike": {
            "token.actions.githubusercontent.com:sub": props.CDKPullImageClaimFilters
          }
        },
        "sts:AssumeRoleWithWebIdentity"
      )
    })
    const cdkPushImageRole = new Role(this, "CDKPushImageRole", {
      assumedBy: new FederatedPrincipal(
        props.gitHubIdentityProvider.openIdConnectProviderArn,
        {
          StringEquals: {
            "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
          },
          "ForAnyValue:StringLike": {
            "token.actions.githubusercontent.com:sub": props.CDKPushImageClaimFilters
          }
        },
        "sts:AssumeRoleWithWebIdentity"
      )
    })
    const assistMeRegressionTestRole = new Role(this, "AssistMeRegressionTestRole", {
      assumedBy: new FederatedPrincipal(
        props.gitHubIdentityProvider.openIdConnectProviderArn,
        {
          StringEquals: {
            "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
          },
          "ForAnyValue:StringLike": {
            "token.actions.githubusercontent.com:sub": props.assistMeRegressionTestClaimFilters
          }
        },
        "sts:AssumeRoleWithWebIdentity"
      )
    })
    const assistMeDocumentSyncRole = new Role(this, "AssistMeDocumentSyncRole", {
      assumedBy: new FederatedPrincipal(
        props.gitHubIdentityProvider.openIdConnectProviderArn,
        {
          StringEquals: {
            "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
          },
          "ForAnyValue:StringLike": {
            "token.actions.githubusercontent.com:sub": props.assistMeDocumentSyncClaimFilters
          }
        },
        "sts:AssumeRoleWithWebIdentity"
      )
    })

    this.apiGwCloudWatchRole = apiGwCloudWatchRole
    this.snsFeedbackLoggingRole = snsFeedbackLoggingRole
    this.splunkDeliveryStreamBackupBucketRole = splunkDeliveryStreamBackupBucketRole
    this.cloudFormationDeployRole = cloudFormationDeployRole
    this.cloudFormationExecutionRole = cloudFormationExecutionRole
    this.cloudFormationCheckVersionRole = cloudFormationCheckVersionRole
    this.cloudFormationPrepareChangesetRole = cloudFormationPrepareChangesetRole
    this.releaseNotesExecuteLambdaRole = releaseNotesExecuteLambdaRole
    this.artilleryRunnerRole = artilleryRunnerRole
    this.proxygenPTLRole = proxygenPTLRole
    this.proxygenProdRole = proxygenProdRole
    this.cdkPullImageRole = cdkPullImageRole
    this.cdkPushImageRole = cdkPushImageRole
    this.assistMeRegressionTestRole = assistMeRegressionTestRole
    this.assistMeDocumentSyncRole = assistMeDocumentSyncRole
  }
}

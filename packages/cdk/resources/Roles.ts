import {
  FederatedPrincipal,
  IOidcProvider,
  IRole,
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
  public readonly apiGwCloudWatchRole: IRole
  public readonly snsFeedbackLoggingRole: IRole
  public readonly splunkDeliveryStreamBackupBucketRole: IRole
  public readonly CloudFormationDeployRole: IRole
  public readonly cloudFormationExecutionRole: IRole
  public readonly cloudFormationCheckVersionRole: IRole
  public readonly cloudFormationPrepareChangesetRole: IRole
  public readonly releaseNotesExecuteLambdaRole: IRole
  public readonly artilleryRunnerRole: IRole
  public readonly proxygenPTLRole: IRole
  public readonly proxygenProdRole: IRole
  public readonly CDKPullImageRole: IRole
  public readonly CDKPushImageRole: IRole
  public readonly assistMeRegressionTestRole: IRole
  public readonly assistMeDocumentSyncRole: IRole
  public constructor(scope: Construct, id: string, props: RolesProps) {
    super(scope, id)

    // from account_resources.yaml

    this.apiGwCloudWatchRole = new Role(this, "ApiGwCloudWatchRole", {
      assumedBy: new ServicePrincipal("apigateway.amazonaws.com")
    })
    // this is used in an export
    this.snsFeedbackLoggingRole = new Role(this, "SNSFeedbackLoggingRole", {
      assumedBy: new ServicePrincipal("sns.amazonaws.com")
    })
    // this is used in a bucket policy and an export???
    this.splunkDeliveryStreamBackupBucketRole = new Role(this, "SplunkDeliveryStreamBackupBucketRole", {
      assumedBy: new ServicePrincipal("firehose.amazonaws.com")
    })

    // from ci-resources
    this.CloudFormationDeployRole = new Role(this, "CloudFormationDeployRole", {
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
    this.cloudFormationExecutionRole = new Role(this, "CloudFormationExecutionRole", {
      assumedBy: new ServicePrincipal("cloudformation.amazonaws.com")
    })
    this.cloudFormationCheckVersionRole = new Role(this, "CloudFormationCheckVersionRole", {
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
    this.cloudFormationPrepareChangesetRole = new Role(this, "CloudFormationPrepareChangesetRole", {
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
    this.releaseNotesExecuteLambdaRole = new Role(this, "ReleaseNotesExecuteLambdaRole", {
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
    this.artilleryRunnerRole = new Role(this, "ArtilleryRunnerRole", {
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
    this.proxygenPTLRole = new Role(this, "ProxygenPTLRole", {
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
    this.proxygenProdRole = new Role(this, "ProxygenProdRole", {
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
    this.CDKPullImageRole = new Role(this, "CDKPullImageRole", {
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
    this.CDKPushImageRole = new Role(this, "CDKPushImageRole", {
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
    this.assistMeRegressionTestRole = new Role(this, "AssistMeRegressionTestRole", {
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
    this.assistMeDocumentSyncRole = new Role(this, "AssistMeDocumentSyncRole", {
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

  }
}

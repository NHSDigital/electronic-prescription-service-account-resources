/* eslint-disable max-len */
import {Stack} from "aws-cdk-lib"
import {safeAddNagSuppressionGroup, safeAddNagSuppression} from "@nhsdigital/eps-cdk-constructs"

export const nagSuppressions = (stack: Stack) => {
  safeAddNagSuppressionGroup(
    stack,
    [
      "/Monitoring/Functions/ReadAlertSuppressionsPolicy/Resource"
    ],
    [
      {
        id: "AwsSolutions-IAM5",
        reason: "Suppress error for not having wildcards in permissions. This is a fine as we need to have permissions on all log streams under path"
      }
    ]
  )

  // lots of nag suppressions based on import of cloudformation code
  // these will be removed once migration is complete
  safeAddNagSuppression(
    stack,
    "/IAM/Policies/ArtilleryRunnerPolicy/Resource",
    [
      {
        id: "AwsSolutions-IAM5",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/IAM/Policies/ArtilleryRunnerPolicy/Resource",
    [
      {
        id: "EpsNagPack-EPS12",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/AccountResources_UK/Storage/AuditLoggingBucket",
    [
      {
        id: "EpsNagPack-EPS15",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/AccountResources_UK/Storage/ALBLoggingBucket",
    [
      {
        id: "EpsNagPack-EPS15",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/IAM/Policies/AllowOpenIDProviderPermissionsPolicy/Resource",
    [
      {
        id: "AwsSolutions-IAM5",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/IAM/Policies/AllowApiGwLoggingPolicy/Resource",
    [
      {
        id: "AwsSolutions-IAM5",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/IAM/Policies/SNSFeedbackLoggingPolicy/Resource",
    [
      {
        id: "AwsSolutions-IAM5",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/IAM/Policies/EPSReadOnlyExtraPermissions/Resource",
    [
      {
        id: "AwsSolutions-IAM5[Resource::arn:aws:kms:eu-west-2:<AWS::AccountId>:key/*]",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/IAM/Policies/EPSReadOnlyExtraPermissions/Resource",
    [
      {
        id: "AwsSolutions-IAM5",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/IAM/Policies/AssistMeDocumentSyncPolicy/Resource",
    [
      {
        id: "AwsSolutions-IAM5",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/IAM/Policies/CDKPullImageRolePolicy/Resource",
    [
      {
        id: "AwsSolutions-IAM5",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/IAM/Policies/CDKPushImageRolePolicy/Resource",
    [
      {
        id: "AwsSolutions-IAM5",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/IAM/Policies/CDKPushImageRolePolicy/Resource",
    [
      {
        id: "AwsSolutions-IAM5[Resource::arn:aws:inspector2:eu-west-2:<AWS::AccountId>:*]",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/IAM/Policies/CreateCloudFormationStackChangeSetPolicy/Resource",
    [
      {
        id: "AwsSolutions-IAM5[Action::ec2:Describe*]",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/IAM/Policies/CreateCloudFormationStackChangeSetPolicy/Resource",
    [
      {
        id: "AwsSolutions-IAM5",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/IAM/Policies/CreateCloudFormationStackPolicy/Resource",
    [
      {
        id: "AwsSolutions-IAM5[Action::cloudformation:Describe*]",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/IAM/Policies/CreateCloudFormationStackPolicy/Resource",
    [
      {
        id: "AwsSolutions-IAM5",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/IAM/Policies/DescribeCloudFormationStackPolicy/Resource",
    [
      {
        id: "AwsSolutions-IAM5",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/IAM/Policies/ECRPushImagePolicy/Resource",
    [
      {
        id: "AwsSolutions-IAM5[Resource::arn:aws:ecr:eu-west-2:<AWS::AccountId>:*]",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/IAM/Policies/ECRPushImagePolicy/Resource",
    [
      {
        id: "AwsSolutions-IAM5",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/IAM/Policies/ECRPushImagePolicy/Resource",
    [
      {
        id: "AwsSolutions-IAM5[Resource::arn:aws:inspector2:eu-west-2:<AWS::AccountId>:*]",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/IAM/Policies/ProxygenAccessExportPolicy/Resource",
    [
      {
        id: "AwsSolutions-IAM5",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/IAM/Policies/RemoveOldCNAMERecordsPolicy/Resource",
    [
      {
        id: "AwsSolutions-IAM5",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/IAM/Policies/UpdateCloudfrontKVS/Resource",
    [
      {
        id: "AwsSolutions-IAM5",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/IAM/DeploymentPolicies/GrantCloudFormationExecutionAccessIAMPolicy/Resource",
    [
      {
        id: "AwsSolutions-IAM5[Action::iam:Attach*]",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/IAM/DeploymentPolicies/GrantCloudFormationExecutionAccessIAMPolicy/Resource",
    [
      {
        id: "AwsSolutions-IAM5[Action::iam:Create*]",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/IAM/DeploymentPolicies/GrantCloudFormationExecutionAccessIAMPolicy/Resource",
    [
      {
        id: "AwsSolutions-IAM5[Action::iam:Delete*]",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/IAM/DeploymentPolicies/GrantCloudFormationExecutionAccessIAMPolicy/Resource",
    [
      {
        id: "AwsSolutions-IAM5[Action::iam:Detach*]",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/IAM/DeploymentPolicies/GrantCloudFormationExecutionAccessIAMPolicy/Resource",
    [
      {
        id: "AwsSolutions-IAM5[Action::iam:Get*]",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/IAM/DeploymentPolicies/GrantCloudFormationExecutionAccessIAMPolicy/Resource",
    [
      {
        id: "AwsSolutions-IAM5[Action::iam:List*]",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/IAM/DeploymentPolicies/GrantCloudFormationExecutionAccessIAMPolicy/Resource",
    [
      {
        id: "AwsSolutions-IAM5[Action::iam:Put*]",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/IAM/DeploymentPolicies/GrantCloudFormationExecutionAccessIAMPolicy/Resource",
    [
      {
        id: "AwsSolutions-IAM5[Action::iam:Remove*]",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/IAM/DeploymentPolicies/GrantCloudFormationExecutionAccessIAMPolicy/Resource",
    [
      {
        id: "AwsSolutions-IAM5[Action::iam:Tag*]",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/IAM/DeploymentPolicies/GrantCloudFormationExecutionAccessIAMPolicy/Resource",
    [
      {
        id: "AwsSolutions-IAM5[Action::iam:Untag*]",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/IAM/DeploymentPolicies/GrantCloudFormationExecutionAccessIAMPolicy/Resource",
    [
      {
        id: "AwsSolutions-IAM5[Action::iam:Update*]",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/IAM/DeploymentPolicies/GrantCloudFormationExecutionAccessIAMPolicy/Resource",
    [
      {
        id: "AwsSolutions-IAM5",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/IAM/DeploymentPolicies/GrantCloudFormationExecutionAccessPolicyA/Resource",
    [
      {
        id: "AwsSolutions-IAM5[Action::kms:Create*]",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/IAM/DeploymentPolicies/GrantCloudFormationExecutionAccessPolicyA/Resource",
    [
      {
        id: "AwsSolutions-IAM5[Action::kms:Decrypt*]",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/IAM/DeploymentPolicies/GrantCloudFormationExecutionAccessPolicyA/Resource",
    [
      {
        id: "AwsSolutions-IAM5[Action::kms:Delete*]",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/IAM/DeploymentPolicies/GrantCloudFormationExecutionAccessPolicyA/Resource",
    [
      {
        id: "AwsSolutions-IAM5[Action::kms:Describe*]",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/IAM/DeploymentPolicies/GrantCloudFormationExecutionAccessPolicyA/Resource",
    [
      {
        id: "AwsSolutions-IAM5",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/IAM/DeploymentPolicies/GrantCloudFormationExecutionAccessPolicyA/Resource",
    [
      {
        id: "AwsSolutions-IAM5[Action::kms:Get*]",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/IAM/DeploymentPolicies/GrantCloudFormationExecutionAccessPolicyA/Resource",
    [
      {
        id: "AwsSolutions-IAM5[Action::kms:List*]",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/IAM/DeploymentPolicies/GrantCloudFormationExecutionAccessPolicyA/Resource",
    [
      {
        id: "AwsSolutions-IAM5[Action::kms:Put*]",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/IAM/DeploymentPolicies/GrantCloudFormationExecutionAccessPolicyA/Resource",
    [
      {
        id: "AwsSolutions-IAM5[Action::kms:ScheduleKeyDeletion*]",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/IAM/DeploymentPolicies/GrantCloudFormationExecutionAccessPolicyA/Resource",
    [
      {
        id: "AwsSolutions-IAM5[Action::kms:Tag*]",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/IAM/DeploymentPolicies/GrantCloudFormationExecutionAccessPolicyA/Resource",
    [
      {
        id: "AwsSolutions-IAM5[Action::kms:Untag*]",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/IAM/DeploymentPolicies/GrantCloudFormationExecutionAccessPolicyA/Resource",
    [
      {
        id: "AwsSolutions-IAM5[Action::kms:Update*]",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/IAM/DeploymentPolicies/GrantCloudFormationExecutionAccessPolicyA/Resource",
    [
      {
        id: "AwsSolutions-IAM5[Action::lambda:Add*]",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/IAM/DeploymentPolicies/GrantCloudFormationExecutionAccessPolicyA/Resource",
    [
      {
        id: "AwsSolutions-IAM5[Action::lambda:Create*]",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/IAM/DeploymentPolicies/GrantCloudFormationExecutionAccessPolicyA/Resource",
    [
      {
        id: "AwsSolutions-IAM5[Action::lambda:Delete*]",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/IAM/DeploymentPolicies/GrantCloudFormationExecutionAccessPolicyA/Resource",
    [
      {
        id: "AwsSolutions-IAM5[Action::lambda:Get*]",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/IAM/DeploymentPolicies/GrantCloudFormationExecutionAccessPolicyA/Resource",
    [
      {
        id: "AwsSolutions-IAM5[Action::lambda:List*]",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/IAM/DeploymentPolicies/GrantCloudFormationExecutionAccessPolicyA/Resource",
    [
      {
        id: "AwsSolutions-IAM5[Action::lambda:Publish*]",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/IAM/DeploymentPolicies/GrantCloudFormationExecutionAccessPolicyA/Resource",
    [
      {
        id: "AwsSolutions-IAM5[Action::lambda:Put*]",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/IAM/DeploymentPolicies/GrantCloudFormationExecutionAccessPolicyA/Resource",
    [
      {
        id: "AwsSolutions-IAM5[Action::lambda:Remove*]",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/IAM/DeploymentPolicies/GrantCloudFormationExecutionAccessPolicyA/Resource",
    [
      {
        id: "AwsSolutions-IAM5[Action::lambda:Tag*]",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/IAM/DeploymentPolicies/GrantCloudFormationExecutionAccessPolicyA/Resource",
    [
      {
        id: "AwsSolutions-IAM5[Action::lambda:Untag*]",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/IAM/DeploymentPolicies/GrantCloudFormationExecutionAccessPolicyA/Resource",
    [
      {
        id: "AwsSolutions-IAM5[Action::lambda:Update*]",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/IAM/DeploymentPolicies/GrantCloudFormationExecutionAccessPolicyA/Resource",
    [
      {
        id: "AwsSolutions-IAM5",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/IAM/DeploymentPolicies/GrantCloudFormationExecutionAccessPolicyB/Resource",
    [
      {
        id: "AwsSolutions-IAM5[Action::secretsmanager:Create*]",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/IAM/DeploymentPolicies/GrantCloudFormationExecutionAccessPolicyB/Resource",
    [
      {
        id: "AwsSolutions-IAM5[Action::secretsmanager:Delete*]",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/IAM/DeploymentPolicies/GrantCloudFormationExecutionAccessPolicyB/Resource",
    [
      {
        id: "AwsSolutions-IAM5[Action::secretsmanager:Describe*]",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/IAM/DeploymentPolicies/GrantCloudFormationExecutionAccessPolicyB/Resource",
    [
      {
        id: "AwsSolutions-IAM5[Action::secretsmanager:List*]",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/IAM/DeploymentPolicies/GrantCloudFormationExecutionAccessPolicyB/Resource",
    [
      {
        id: "AwsSolutions-IAM5[Action::secretsmanager:Tag*]",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/IAM/DeploymentPolicies/GrantCloudFormationExecutionAccessPolicyB/Resource",
    [
      {
        id: "AwsSolutions-IAM5[Action::secretsmanager:Untag*]",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/IAM/DeploymentPolicies/GrantCloudFormationExecutionAccessPolicyB/Resource",
    [
      {
        id: "AwsSolutions-IAM5[Action::secretsmanager:Update*]",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/IAM/DeploymentPolicies/GrantCloudFormationExecutionAccessPolicyB/Resource",
    [
      {
        id: "AwsSolutions-IAM5",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/IAM/DeploymentPolicies/GrantCloudFormationExecutionAccessPolicyC/Resource",
    [
      {
        id: "AwsSolutions-IAM5[Action::cloudformation:Describe*]",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/IAM/DeploymentPolicies/GrantCloudFormationExecutionAccessPolicyC/Resource",
    [
      {
        id: "AwsSolutions-IAM5",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/IAM/DeploymentPolicies/GrantCloudFormationExecutionAccessPolicyD/Resource",
    [
      {
        id: "AwsSolutions-IAM5",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/IAM/DeploymentPolicies/GrantCloudFormationExecutionAccessPolicyD/Resource",
    [
      {
        id: "AwsSolutions-IAM5[Action::s3:GetBucket*]",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/IAM/DeploymentPolicies/GrantCloudFormationExecutionAccessPolicyD/Resource",
    [
      {
        id: "AwsSolutions-IAM5[Action::s3:GetObject*]",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/IAM/DeploymentPolicies/GrantCloudFormationExecutionAccessPolicyD/Resource",
    [
      {
        id: "AwsSolutions-IAM5[Action::s3:PutObject*]",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/IAM/DeploymentPolicies/GrantCloudFormationExecutionAccessPolicyD/Resource",
    [
      {
        id: "AwsSolutions-IAM5[Resource::arn:aws:lambda:*:<AWS::AccountId>:function:*AWS679f53fac002430cb0da5*]",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/IAM/DeploymentPolicies/GrantCloudFormationExecutionAccessPolicyD/Resource",
    [
      {
        id: "AwsSolutions-IAM5[Resource::arn:aws:lambda:*:<AWS::AccountId>:function:*CustomCrossRegionExport*]",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/IAM/DeploymentPolicies/GrantCloudFormationExecutionAccessPolicyD/Resource",
    [
      {
        id: "AwsSolutions-IAM5[Resource::arn:aws:lambda:*:<AWS::AccountId>:function:*CustomS3AutoDeleteObject*]",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/IAM/DeploymentPolicies/GrantCloudFormationExecutionAccessPolicyD/Resource",
    [
      {
        id: "AwsSolutions-IAM5[Resource::arn:aws:lambda:*:<AWS::AccountId>:function:*CustomVpcRestrictDefaultSG*]",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/IAM/DeploymentPolicies/GrantCloudFormationExecutionAccessPolicyD/Resource",
    [
      {
        id: "AwsSolutions-IAM5[Resource::arn:aws:s3:::cdk-hnb659fds-assets-<AWS::AccountId>-eu-west-2/*]",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/IAM/DeploymentPolicies/GrantCloudFormationExecutionAccessPolicyD/Resource",
    [
      {
        id: "AwsSolutions-IAM5[Resource::arn:aws:s3:::cdk-hnb659fds-assets-<AWS::AccountId>-us-east-1/*]",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/IAM/DeploymentPolicies/GrantCloudFormationExecutionEc2AccessPolicy/Resource",
    [
      {
        id: "AwsSolutions-IAM5",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/AccountResources_UK/Storage/UseArtifactBucketKMSKeyManagedPolicy/Resource",
    [
      {
        id: "AwsSolutions-IAM5",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/AccountResources_UK/Storage/UseArtifactBucketKMSKeyManagedPolicy/Resource",
    [
      {
        id: "AwsSolutions-IAM5",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/AccountResources_UK/Storage/AthenaResultsBucket",
    [
      {
        id: "AwsSolutions-S1",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/AccountResources_UK/Storage/UseTrustStoreBucketKMSKeyManagedPolicy/Resource",
    [
      {
        id: "AwsSolutions-IAM5",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/AccountResources_UK/Storage/UseTrustStoreBucketKMSKeyManagedPolicy/Resource",
    [
      {
        id: "AwsSolutions-IAM5",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/AccountResources_UK/Storage/ALBLoggingBucket",
    [
      {
        id: "AwsSolutions-S1",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/Secrets/SecretsEncryption/UseSecretsKMSKeyManagedPolicy/Resource",
    [
      {
        id: "AwsSolutions-IAM5",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/Secrets/SecretsEncryption/UseSecretsKMSKeyManagedPolicy/Resource",
    [
      {
        id: "AwsSolutions-IAM5",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/AccountResources_UK/Encryption/UseSnsKMSKeyManagedPolicy/Resource",
    [
      {
        id: "AwsSolutions-IAM5",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/AccountResources_UK/Encryption/UseSnsKMSKeyManagedPolicy/Resource",
    [
      {
        id: "AwsSolutions-IAM5",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/AccountResources_UK/Encryption/UseSqsKMSKeyManagedPolicy/Resource",
    [
      {
        id: "AwsSolutions-IAM5",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/AccountResources_UK/Encryption/UseSqsKMSKeyManagedPolicy/Resource",
    [
      {
        id: "AwsSolutions-IAM5",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/AccountResources_UK/Encryption/CloudwatchEncryptionKMSPolicy/Resource",
    [
      {
        id: "AwsSolutions-IAM5",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/AccountResources_UK/Encryption/CloudwatchEncryptionKMSPolicy/Resource",
    [
      {
        id: "AwsSolutions-IAM5",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/AccountResources_UK/Encryption/LambdaEncryptCloudwatchKMSPolicy/Resource",
    [
      {
        id: "AwsSolutions-IAM5",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/AccountResources_UK/Encryption/LambdaEncryptCloudwatchKMSPolicy/Resource",
    [
      {
        id: "AwsSolutions-IAM5",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/Monitoring/MonitoringStorage/SplunkDeliveryStreamBackupBucketRoleKMSMangedPolicy/Resource",
    [
      {
        id: "AwsSolutions-IAM5",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )

  safeAddNagSuppression(
    stack,
    "/Monitoring/MonitoringStorage/SplunkDeliveryStreamBackupBucketRoleKMSMangedPolicy/Resource",
    [
      {
        id: "AwsSolutions-IAM5",
        reason: "Suppress error from cloudformation migration"
      }
    ]
  )
}

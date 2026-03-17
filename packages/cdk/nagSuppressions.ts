
import {Stack} from "aws-cdk-lib"
import {safeAddNagSuppression} from "@nhsdigital/eps-cdk-constructs"

export const nagSuppressions = (stack: Stack, stackName: string) => {
  if (stackName === "AccountResources_UK") {
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
      "/AccountResources_UK/MonitoringStorage/SplunkDeliveryStreamBackupBucketRoleKMSMangedPolicy/Resource",
      [
        {
          id: "AwsSolutions-IAM5",
          reason: "Suppress error from cloudformation migration"
        }
      ]
    )

    safeAddNagSuppression(
      stack,
      "/AccountResources_UK/MonitoringStorage/SplunkDeliveryStreamBackupBucketRoleKMSMangedPolicy/Resource",
      [
        {
          id: "AwsSolutions-IAM5",
          reason: "Suppress error from cloudformation migration"
        }
      ]
    )

    safeAddNagSuppression(
      stack,
      "/AccountResources_UK/Splunk/SplunkDeliveryStream",
      [
        {
          id: "AwsSolutions-KDF1",
          reason: "Suppress error from cloudformation migration"
        }
      ]
    )

    safeAddNagSuppression(
      stack,
      "/AccountResources_UK/FunctionPolicies/ReadAlertSuppressionsPolicy/Resource",
      [
        {
          id: "AwsSolutions-IAM5",
          reason: "Suppress error from cloudformation migration"
        }
      ]
    )
    safeAddNagSuppression(
      stack,
      "/AccountResources_UK/FunctionPolicies/LambdaInsightsLogGroupPolicy/Resource",
      [
        {
          id: "AwsSolutions-IAM5",
          reason: "Suppress error from cloudformation migration"
        }
      ]
    )
    safeAddNagSuppression(
      stack,
      "/AccountResources_UK/Splunk/SplunkDeliveryStreamLoggingManagedPolicy/Resource",
      [
        {
          id: "AwsSolutions-IAM5",
          reason: "Suppress error from cloudformation migration"
        }
      ]
    )

  }
  if (stackName === "IAM") {
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
          id: "AwsSolutions-IAM5",
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
      "/IAM/DeploymentPolicies/GrantCloudFormationExecutionEc2AccessPolicy/Resource",
      [
        {
          id: "AwsSolutions-IAM5",
          reason: "Suppress error from cloudformation migration"
        }
      ]
    )

  }
  if (stackName === "Secrets") {
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
  }

}
// lots of nag suppressions based on import of cloudformation code
// these will be removed once migration is complete

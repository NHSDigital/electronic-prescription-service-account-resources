
import {Stack} from "aws-cdk-lib"
import {safeAddNagSuppression} from "@nhsdigital/eps-cdk-constructs"

export const nagSuppressions = (stack: Stack, stackName: string) => {
  if (stackName === "AccountResources_UK") {
    safeAddNagSuppression(
      stack,
      "/AccountResources_UK/Functions/ReadAlertSuppressionsPolicy/Resource",
      [
        {
          id: "AwsSolutions-IAM5",
          reason: "Allow wildcard resource as the policy needs to allow access to the parameter and all its versions"
        }
      ]
    )

  }
}

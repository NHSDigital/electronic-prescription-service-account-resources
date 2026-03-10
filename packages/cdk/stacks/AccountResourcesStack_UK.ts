import {
  StackProps,
  Stack,
  App,
  Tags
} from "aws-cdk-lib"
import {ECRRepositories} from "../resources/ECRRepositories"
import {RegressionTestSecrets} from "../resources/RegressionTestSecrets"

export interface AccountResourcesStackProps_UK extends StackProps {
  readonly stackName: string
  readonly version: string
  readonly commitId: string
}

export class AccountResourcesStack_UK extends Stack {
  public constructor(scope: App, id: string, props: AccountResourcesStackProps_UK){
    super(scope, id, props)

    Tags.of(this).add("stackName", props.stackName)
    new ECRRepositories(this, "ECRRepositories")
    new RegressionTestSecrets(this, "RegressionTestSecrets", {stackName: props.stackName})

  }
}

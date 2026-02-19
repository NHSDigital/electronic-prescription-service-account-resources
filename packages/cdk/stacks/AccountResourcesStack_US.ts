import {
  StackProps,
  Stack,
  App,
  Tags
} from "aws-cdk-lib"
import {ResourcePolicies_US} from "../resources/ResourcePolicies_US"

export interface AccountResourcesStackProps_US extends StackProps {
  readonly stackName: string
  readonly version: string
  readonly commitId: string
}

export class AccountResourcesStack_US extends Stack {
  public constructor(scope: App, id: string, props: AccountResourcesStackProps_US){
    super(scope, id, props)

    Tags.of(this).add("stackName", props.stackName)
    new ResourcePolicies_US(this, "ResourcePolicies_US")
  }
}

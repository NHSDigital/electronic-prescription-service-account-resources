import {StackProps, Stack, App} from "aws-cdk-lib"
import {nagSuppressions} from "../nagSuppressions"
import {ResourcePolicies_US} from "../resources/ResourcePolicies_US"

export interface AccountResourcesStackProps_US extends StackProps {
  readonly stackName: string
  readonly version: string
  readonly commitId: string
}

export class AccountResourcesStack_US extends Stack {
  public constructor(scope: App, id: string, props: AccountResourcesStackProps_US){
    super(scope, id, props)

    new ResourcePolicies_US(this, "ResourcePolicies_US")

    nagSuppressions(this)
  }
}

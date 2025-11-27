import {StackProps, Stack, App} from "aws-cdk-lib"
import {nagSuppressions} from "../nagSuppressions"
import {ECRRepositories} from "../resources/ECRRepositories"

export interface AccountResourcesStackProps_UK extends StackProps {
  readonly stackName: string
  readonly version: string
  readonly commitId: string
}

export class AccountResourcesStack_UK extends Stack {
  public constructor(scope: App, id: string, props: AccountResourcesStackProps_UK){
    super(scope, id, props)

    new ECRRepositories(this, "ECRRepositories")

    nagSuppressions(this)
  }
}

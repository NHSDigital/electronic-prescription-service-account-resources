import {StackProps, Stack, App} from "aws-cdk-lib"
import {Alarms} from "../resources/Alarms"

export interface AlarmStackProps extends StackProps {
  readonly stackName: string
  readonly version: string
  readonly commitId: string
}

export class AlarmStack extends Stack {
  public constructor(scope: App, id: string, props: AlarmStackProps){
    super(scope, id, props)

    const lambdaConcurrencyThreshold = this.node.tryGetContext("lambdaConcurrencyThreshold")
    const lambdaConcurrencyWarningThreshold = this.node.tryGetContext("lambdaConcurrencyWarningThreshold")

    new Alarms(this, "Alarms", {
      stackName: props.stackName,
      enableAlerts: true,
      lambdaConcurrencyThreshold: lambdaConcurrencyThreshold,
      lambdaConcurrencyWarningThreshold: lambdaConcurrencyWarningThreshold
    })
  }
}

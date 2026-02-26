import {CfnAccount} from "aws-cdk-lib/aws-apigateway"
import {IRole, ManagedPolicy} from "aws-cdk-lib/aws-iam"
import {Construct} from "constructs"

export interface ApiGatewayAccountProps {
  readonly apiGwCloudWatchRole: IRole
  readonly allowApiGwLoggingPolicy: ManagedPolicy
}
export class ApiGatewayAccount extends Construct {
  public readonly allowApiGwLoggingPolicy: ManagedPolicy
  public constructor(scope: Construct, id: string, props: ApiGatewayAccountProps) {
    super(scope, id)
    const account = new CfnAccount(this, "Account", {
      cloudWatchRoleArn: props.apiGwCloudWatchRole.roleArn
    })

    account.node.addDependency(props.allowApiGwLoggingPolicy)
  }
}

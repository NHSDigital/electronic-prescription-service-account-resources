import {PolicyStatement, ServicePrincipal} from "aws-cdk-lib/aws-iam"
import {ResourcePolicy} from "aws-cdk-lib/aws-logs"
import {Construct} from "constructs"

export class ResourcePolicies_US extends Construct {

  public constructor(scope: Construct, id: string){
    super(scope, id)

    const policyStatement = new PolicyStatement({
      actions: ["logs:PutLogEvents", "logs:CreateLogStream"],
      resources: ["*"],
      principals: [new ServicePrincipal("delivery.logs.amazonaws.com")]
    })

    // this policy allows AWS services to deliver logs to CloudWatch Logs on your behalf
    // the name is set by AWS and must match exactly
    new ResourcePolicy(this, "AWSLogDeliveryWrite20150319", {
      policyStatements: [policyStatement],
      resourcePolicyName: "AWSLogDeliveryWrite20150319"
    })
  }
}


import {IKey} from "aws-cdk-lib/aws-kms"
import {Construct} from "constructs"
import {
  Effect,
  ManagedPolicy,
  PolicyStatement,
  Role
} from "aws-cdk-lib/aws-iam"
import {TypescriptLambdaFunction} from "@nhsdigital/eps-cdk-constructs"
import {Runtime} from "aws-cdk-lib/aws-lambda"
import {resolve} from "path"

export interface ProxygenProps {
  readonly proxygenPTLRole: Role
  readonly proxygenProdRole: Role
  readonly proxygenManagedPolicy: ManagedPolicy
  readonly stackName: string
  readonly logRetentionInDays: number
  readonly logLevel: string
  readonly version: string
  readonly commitId: string
  readonly cloudWatchLogsKmsKey: IKey
  readonly lambdaInsightsLogGroupPolicy: ManagedPolicy
  readonly cloudwatchEncryptionKMSPolicy: ManagedPolicy
}
export class Proxygen extends Construct {

  public constructor(scope: Construct, id: string, props: ProxygenProps){
    super(scope, id)

    const proxygenPTLInstancePutFunction = new TypescriptLambdaFunction(this, "ProxygenPTLInstancePutFunction", {
      functionName: `${props.stackName}-ProxygenPTLInstancePut`,
      packageBasePath: "packages/proxygen",
      entryPoint: "src/proxygenInstancePut.ts",
      environmentVariables: {
        ALLOWED_ENVIRONMENTS: "internal-dev,internal-dev-sandbox,internal-qa,ref"
      },
      additionalPolicies: [props.proxygenManagedPolicy],
      logRetentionInDays: props.logRetentionInDays,
      logLevel: props.logLevel,
      version: props.version,
      commitId: props.commitId,
      projectBaseDir: resolve(__dirname, "../../.."),
      runtime: Runtime.NODEJS_24_X,
      cloudWatchLogsKmsKey: props.cloudWatchLogsKmsKey,
      lambdaInsightsLogGroupPolicy: props.lambdaInsightsLogGroupPolicy,
      cloudwatchEncryptionKMSPolicy: props.cloudwatchEncryptionKMSPolicy,
      addSplunkSubscriptionFilter: false
    })

    const proxygenProdInstancePutFunction = new TypescriptLambdaFunction(this, "ProxygenProdInstancePutFunction", {
      functionName: `${props.stackName}-ProxygenProdInstancePut`,
      packageBasePath: "packages/proxygen",
      entryPoint: "src/proxygenInstancePut.ts",
      environmentVariables: {
        ALLOWED_ENVIRONMENTS: "int,sandbox,prod"
      },
      additionalPolicies: [props.proxygenManagedPolicy],
      logRetentionInDays: props.logRetentionInDays,
      logLevel: props.logLevel,
      version: props.version,
      commitId: props.commitId,
      projectBaseDir: resolve(__dirname, "../../.."),
      runtime: Runtime.NODEJS_24_X,
      cloudWatchLogsKmsKey: props.cloudWatchLogsKmsKey,
      lambdaInsightsLogGroupPolicy: props.lambdaInsightsLogGroupPolicy,
      cloudwatchEncryptionKMSPolicy: props.cloudwatchEncryptionKMSPolicy,
      addSplunkSubscriptionFilter: false
    })

    const proxygenPTLMTLSSecretPutFunction = new TypescriptLambdaFunction(this, "ProxygenPTLMTLSSecretPutFunction", {
      functionName: `${props.stackName}-ProxygenPTLMTLSSecretPut`,
      packageBasePath: "packages/proxygen",
      entryPoint: "src/proxygenMTLSSecretPut.ts",
      environmentVariables: {
        ALLOWED_ENVIRONMENTS: "internal-dev,internal-dev-sandbox,internal-qa,ref"
      },
      additionalPolicies: [props.proxygenManagedPolicy],
      logRetentionInDays: props.logRetentionInDays,
      logLevel: props.logLevel,
      version: props.version,
      commitId: props.commitId,
      projectBaseDir: resolve(__dirname, "../../.."),
      runtime: Runtime.NODEJS_24_X,
      cloudWatchLogsKmsKey: props.cloudWatchLogsKmsKey,
      lambdaInsightsLogGroupPolicy: props.lambdaInsightsLogGroupPolicy,
      cloudwatchEncryptionKMSPolicy: props.cloudwatchEncryptionKMSPolicy,
      addSplunkSubscriptionFilter: false
    })

    const proxygenProdMTLSSecretPutFunction = new TypescriptLambdaFunction(this, "ProxygenProdMTLSSecretPutFunction", {
      functionName: `${props.stackName}-ProxygenProdMTLSSecretPut`,
      packageBasePath: "packages/proxygen",
      entryPoint: "src/proxygenMTLSSecretPut.ts",
      environmentVariables: {
        ALLOWED_ENVIRONMENTS: "int,sandbox,prod"
      },
      additionalPolicies: [props.proxygenManagedPolicy],
      logRetentionInDays: props.logRetentionInDays,
      logLevel: props.logLevel,
      version: props.version,
      commitId: props.commitId,
      projectBaseDir: resolve(__dirname, "../../.."),
      runtime: Runtime.NODEJS_24_X,
      cloudWatchLogsKmsKey: props.cloudWatchLogsKmsKey,
      lambdaInsightsLogGroupPolicy: props.lambdaInsightsLogGroupPolicy,
      cloudwatchEncryptionKMSPolicy: props.cloudwatchEncryptionKMSPolicy,
      addSplunkSubscriptionFilter: false
    })

    const proxygenPTLSpecPublishFunction = new TypescriptLambdaFunction(this, "ProxygenPTLSpecPublishFunction", {
      functionName: `${props.stackName}-ProxygenPTLSpecPublish`,
      packageBasePath: "packages/proxygen",
      entryPoint: "src/proxygenSpecPublish.ts",
      environmentVariables: {
        ALLOWED_ENVIRONMENTS: "uat"
      },
      additionalPolicies: [props.proxygenManagedPolicy],
      logRetentionInDays: props.logRetentionInDays,
      logLevel: props.logLevel,
      version: props.version,
      commitId: props.commitId,
      projectBaseDir: resolve(__dirname, "../../.."),
      runtime: Runtime.NODEJS_24_X,
      cloudWatchLogsKmsKey: props.cloudWatchLogsKmsKey,
      lambdaInsightsLogGroupPolicy: props.lambdaInsightsLogGroupPolicy,
      cloudwatchEncryptionKMSPolicy: props.cloudwatchEncryptionKMSPolicy,
      addSplunkSubscriptionFilter: false
    })

    const proxygenProdSpecPublishFunction = new TypescriptLambdaFunction(this, "ProxygenProdSpecPublishFunction", {
      functionName: `${props.stackName}-ProxygenProdSpecPublish`,
      packageBasePath: "packages/proxygen",
      entryPoint: "src/proxygenSpecPublish.ts",
      environmentVariables: {
        ALLOWED_ENVIRONMENTS: "prod"
      },
      additionalPolicies: [props.proxygenManagedPolicy],
      logRetentionInDays: props.logRetentionInDays,
      logLevel: props.logLevel,
      version: props.version,
      commitId: props.commitId,
      projectBaseDir: resolve(__dirname, "../../.."),
      runtime: Runtime.NODEJS_24_X,
      cloudWatchLogsKmsKey: props.cloudWatchLogsKmsKey,
      lambdaInsightsLogGroupPolicy: props.lambdaInsightsLogGroupPolicy,
      cloudwatchEncryptionKMSPolicy: props.cloudwatchEncryptionKMSPolicy,
      addSplunkSubscriptionFilter: false
    })

    const proxygenPTLInstanceGetFunction = new TypescriptLambdaFunction(this, "ProxygenPTLInstanceGetFunction", {
      functionName: `${props.stackName}-ProxygenPTLInstanceGetFunction`,
      packageBasePath: "packages/proxygen",
      entryPoint: "src/proxygenInstanceGet.ts",
      environmentVariables: {
        ALLOWED_ENVIRONMENTS: "internal-dev,internal-dev-sandbox"
      },
      additionalPolicies: [props.proxygenManagedPolicy],
      logRetentionInDays: props.logRetentionInDays,
      logLevel: props.logLevel,
      version: props.version,
      commitId: props.commitId,
      projectBaseDir: resolve(__dirname, "../../.."),
      runtime: Runtime.NODEJS_24_X,
      cloudWatchLogsKmsKey: props.cloudWatchLogsKmsKey,
      lambdaInsightsLogGroupPolicy: props.lambdaInsightsLogGroupPolicy,
      cloudwatchEncryptionKMSPolicy: props.cloudwatchEncryptionKMSPolicy,
      addSplunkSubscriptionFilter: false
    })

    const proxygenPTLInstanceDeleteFunction = new TypescriptLambdaFunction(this, "ProxygenPTLInstanceDeleteFunction", {
      functionName: `${props.stackName}-ProxygenPTLInstanceDeleteFunction`,
      packageBasePath: "packages/proxygen",
      entryPoint: "src/proxygenInstanceDelete.ts",
      environmentVariables: {
        ALLOWED_ENVIRONMENTS: "internal-dev,internal-dev-sandbox"
      },
      additionalPolicies: [props.proxygenManagedPolicy],
      logRetentionInDays: props.logRetentionInDays,
      logLevel: props.logLevel,
      version: props.version,
      commitId: props.commitId,
      projectBaseDir: resolve(__dirname, "../../.."),
      runtime: Runtime.NODEJS_24_X,
      cloudWatchLogsKmsKey: props.cloudWatchLogsKmsKey,
      lambdaInsightsLogGroupPolicy: props.lambdaInsightsLogGroupPolicy,
      cloudwatchEncryptionKMSPolicy: props.cloudwatchEncryptionKMSPolicy,
      addSplunkSubscriptionFilter: false
    })

    new ManagedPolicy(this, "ExecuteProxygenPTLManagedPolicy", {
      statements: [
        new PolicyStatement({
          actions: [
            "lambda:InvokeFunction"
          ],
          effect: Effect.ALLOW,
          resources: [
            proxygenPTLInstancePutFunction.function.functionArn,
            proxygenPTLMTLSSecretPutFunction.function.functionArn,
            proxygenPTLSpecPublishFunction.function.functionArn,
            proxygenPTLInstanceGetFunction.function.functionArn,
            proxygenPTLInstanceDeleteFunction.function.functionArn
          ]
        })
      ],
      roles: [props.proxygenPTLRole]
    })
    new ManagedPolicy(this, "ExecuteProxygenProdManagedPolicy", {
      statements: [
        new PolicyStatement({
          actions: [
            "lambda:InvokeFunction"
          ],
          effect: Effect.ALLOW,
          resources: [
            proxygenProdInstancePutFunction.function.functionArn,
            proxygenProdMTLSSecretPutFunction.function.functionArn,
            proxygenProdSpecPublishFunction.function.functionArn
          ]
        })
      ],
      roles: [props.proxygenProdRole]
    })
  }
}

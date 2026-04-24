import {
  StackProps,
  Stack,
  App,
  Tags
} from "aws-cdk-lib"
import {RegressionTestSecrets} from "../resources/RegressionTestSecrets"
import {IRole, ManagedPolicy} from "aws-cdk-lib/aws-iam"
import {CfnBucket} from "aws-cdk-lib/aws-s3"
import {nagSuppressions} from "../nagSuppressions"
import {Secret} from "aws-cdk-lib/aws-secretsmanager"

export interface SecretsStackProps extends StackProps {
  readonly stackName: string
  readonly version: string
  readonly commitId: string
  readonly cloudFormationExecutionRole: IRole
  readonly cloudFormationDeployRole: IRole
}

export class SecretsStack extends Stack {
  public readonly auditLoggingBucket: CfnBucket
  public readonly lambdaDecryptSecretsKmsPolicy: ManagedPolicy
  public readonly clinicalTrackerCACertSecret: Secret
  public readonly clinicalTrackerClientCertSecret: Secret
  public readonly clinicalTrackerClientSandboxCertSecret: Secret
  public readonly pfpCACertSecret: Secret
  public readonly pfpClientCertSecret: Secret
  public readonly pfpClientSandboxCertSecret: Secret
  public readonly psuCACertSecret: Secret
  public readonly psuClientCertSecret: Secret
  public readonly psuClientSandboxCertSecret: Secret
  public readonly fhirFacadeCACertSecret: Secret
  public readonly fhirFacadeClientCertSecret: Secret
  public readonly fhirFacadeClientSandboxCertSecret: Secret
  public readonly spinePublicCertificate: Secret
  public readonly ptlPrescriptionSigningPublicKey: Secret
  public readonly accessSlackSecretsManagedPolicy: ManagedPolicy
  public readonly proxygenManagedPolicy: ManagedPolicy

  public constructor(scope: App, id: string, props: SecretsStackProps){
    super(scope, id, props)

    Tags.of(this).add("stackName", props.stackName)
    new RegressionTestSecrets(this, "RegressionTestSecrets", {stackName: props.stackName})

    nagSuppressions(this, "Secrets")
  }
}

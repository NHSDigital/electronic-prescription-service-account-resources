import {
  StackProps,
  Stack,
  App,
  Tags
} from "aws-cdk-lib"
import {RegressionTestSecrets} from "../resources/RegressionTestSecrets"
import {MTLSSecrets} from "../resources/MTLSSecrets"
import {ProxygenSecrets} from "../resources/ProxygenSecrets"
import {AtlassianSecrets} from "../resources/AtlassianSecrets"
import {ConfigSecrets} from "../resources/ConfigSecrets"
import {IRole, ManagedPolicy} from "aws-cdk-lib/aws-iam"
import {SecretPolicies} from "../resources/SecretPolicies"
import {CfnBucket} from "aws-cdk-lib/aws-s3"
import {nagSuppressions} from "../nagSuppressions"
import {SecretsEncryption} from "../resources/SecretsEncryption"
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
    const encryption =new SecretsEncryption(this, "SecretsEncryption", {
      accountId: this.account,
      region: this.region,
      cloudFormationExecutionRole: props.cloudFormationExecutionRole
    })
    const mtlsSecrets = new MTLSSecrets(this, "MTLSSecrets", {
      stackName: props.stackName,
      MTLSSecretsKmsKey: encryption.secretsKmsKey
    })
    const proxygenSecrets = new ProxygenSecrets(this, "ProxygenSecrets", {
      stackName: props.stackName,
      proxygenSecretsKmsKey: encryption.secretsKmsKey
    })
    new AtlassianSecrets(this, "AtlassianSecrets", {
      stackName: props.stackName,
      atlassianSecretsKmsKey: encryption.secretsKmsKey
    })
    const configSecrets = new ConfigSecrets(this, "ConfigSecrets", {
      stackName: props.stackName,
      configSecretsKmsKey: encryption.secretsKmsKey
    })
    const secretPolicies = new SecretPolicies(this, "SecretPolicies", {
      region: this.region,
      accountId: this.account,
      cloudFormationDeployRole: props.cloudFormationDeployRole,
      pfpCAKey: mtlsSecrets.pfpCAKey,
      pfpCACert: mtlsSecrets.pfpCACert,
      pfpClientKey: mtlsSecrets.pfpClientKey,
      pfpClientCert: mtlsSecrets.pfpClientCert,
      pfpClientSandboxKey: mtlsSecrets.pfpClientSandboxKey,
      pfpClientSandboxCert: mtlsSecrets.pfpClientSandboxCert,
      pfpProxygenPrivateKey: proxygenSecrets.psuProxygenPrivateKey,
      pfpProxygenPublicKey: proxygenSecrets.psuProxygenPublicKey,
      psuCAKey: mtlsSecrets.psuCAKey,
      psuCACert: mtlsSecrets.psuCACert,
      psuClientKey: mtlsSecrets.psuClientKey,
      psuClientCert: mtlsSecrets.psuClientCert,
      psuClientSandboxKey: mtlsSecrets.psuClientSandboxKey,
      psuClientSandboxCert: mtlsSecrets.psuClientSandboxCert,
      psuProxygenPrivateKey: proxygenSecrets.psuProxygenPrivateKey,
      psuProxygenPublicKey: proxygenSecrets.psuProxygenPublicKey,
      cpsuProxygenPrivateKey: proxygenSecrets.cpsuProxygenPrivateKey,
      cpsuProxygenPublicKey: proxygenSecrets.cpsuProxygenPublicKey,
      clinicalTrackerCAKey: mtlsSecrets.clinicalTrackerCAKey,
      clinicalTrackerCACert: mtlsSecrets.clinicalTrackerCACert,
      clinicalTrackerClientKey: mtlsSecrets.clinicalTrackerClientKey,
      clinicalTrackerClientCert: mtlsSecrets.clinicalTrackerClientCert,
      clinicalTrackerClientSandboxKey: mtlsSecrets.clinicalTrackerClientSandboxKey,
      clinicalTrackerClientSandboxCert: mtlsSecrets.clinicalTrackerClientSandboxCert,
      clinicalTrackerProxygenPrivateKey: proxygenSecrets.clinicalTrackerProxygenPrivateKey,
      clinicalTrackerProxygenPublicKey: proxygenSecrets.clinicalTrackerProxygenPublicKey,
      fhirFacadeCAKey: mtlsSecrets.fhirFacadeCAKey,
      fhirFacadeCACert: mtlsSecrets.fhirFacadeCACert,
      fhirFacadeClientKey: mtlsSecrets.fhirFacadeClientKey,
      fhirFacadeClientCert: mtlsSecrets.fhirFacadeClientCert,
      fhirFacadeClientSandboxKey: mtlsSecrets.fhirFacadeClientSandboxKey,
      fhirFacadeClientSandboxCert: mtlsSecrets.fhirFacadeClientSandboxCert,
      prescribingProxygenPrivateKey: proxygenSecrets.prescribingProxygenPrivateKey,
      prescribingProxygenPublicKey: proxygenSecrets.prescribingProxygenPublicKey,
      dispensingProxygenPrivateKey: proxygenSecrets.dispensingProxygenPrivateKey,
      dispensingProxygenPublicKey: proxygenSecrets.dispensingProxygenPublicKey,
      secretKMSKey: encryption.secretsKmsKey
    })
    this.lambdaDecryptSecretsKmsPolicy = encryption.lambdaDecryptSecretsKmsPolicy
    this.clinicalTrackerCACertSecret = mtlsSecrets.clinicalTrackerCACert
    this.clinicalTrackerClientCertSecret = mtlsSecrets.clinicalTrackerClientCert
    this.clinicalTrackerClientSandboxCertSecret = mtlsSecrets.clinicalTrackerClientSandboxCert
    this.pfpCACertSecret = mtlsSecrets.pfpCACert
    this.pfpClientCertSecret = mtlsSecrets.pfpClientCert
    this.pfpClientSandboxCertSecret = mtlsSecrets.pfpClientSandboxCert
    this.psuCACertSecret = mtlsSecrets.psuCACert
    this.psuClientCertSecret = mtlsSecrets.psuClientCert
    this.psuClientSandboxCertSecret = mtlsSecrets.psuClientSandboxCert
    this.fhirFacadeCACertSecret = mtlsSecrets.fhirFacadeCACert
    this.fhirFacadeClientCertSecret = mtlsSecrets.fhirFacadeClientCert
    this.fhirFacadeClientSandboxCertSecret = mtlsSecrets.fhirFacadeClientSandboxCert
    this.spinePublicCertificate = configSecrets.spinePublicCertificate
    this.ptlPrescriptionSigningPublicKey = configSecrets.ptlPrescriptionSigningPublicKey
    this.accessSlackSecretsManagedPolicy = configSecrets.accessSlackSecretsManagedPolicy
    this.proxygenManagedPolicy = secretPolicies.proxygenManagedPolicy
    nagSuppressions(this, "Secrets")
  }
}

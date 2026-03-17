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
  readonly CloudFormationDeployRole: IRole
}

export class SecretsStack extends Stack {
  readonly auditLoggingBucket: CfnBucket
  readonly lambdaDecryptSecretsKmsPolicy: ManagedPolicy
  readonly clinicalTrackerCACertSecret: Secret
  readonly clinicalTrackerClientCertSecret: Secret
  readonly clinicalTrackerClientSandboxCertSecret: Secret
  readonly pfpCACertSecret: Secret
  readonly pfpClientCertSecret: Secret
  readonly pfpClientSandboxCertSecret: Secret
  readonly psuCACertSecret: Secret
  readonly psuClientCertSecret: Secret
  readonly psuClientSandboxCertSecret: Secret
  readonly fhirFacadeCACertSecret: Secret
  readonly fhirFacadeClientCertSecret: Secret
  readonly fhirFacadeClientSandboxCertSecret: Secret
  readonly spinePublicCertificate: Secret
  readonly ptlPrescriptionSigningPublicKey: Secret
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
    new SecretPolicies(this, "SecretPolicies", {
      region: this.region,
      accountId: this.account,
      cloudFormationDeployRole: props.CloudFormationDeployRole,
      PfpCAKey: mtlsSecrets.PfpCAKey,
      PfpCACert: mtlsSecrets.PfpCACert,
      PfpClientKey: mtlsSecrets.PfpClientKey,
      PfpClientCert: mtlsSecrets.PfpClientCert,
      PfpClientSandboxKey: mtlsSecrets.PfpClientSandboxKey,
      PfpClientSandboxCert: mtlsSecrets.PfpClientSandboxCert,
      PfpProxygenPrivateKey: proxygenSecrets.PSUProxygenPrivateKey,
      PfpProxygenPublicKey: proxygenSecrets.PSUProxygenPublicKey,
      PSUCAKey: mtlsSecrets.PSUCAKey,
      PSUCACert: mtlsSecrets.PSUCACert,
      PSUClientKey: mtlsSecrets.PSUClientKey,
      PSUClientCert: mtlsSecrets.PSUClientCert,
      PSUClientSandboxKey: mtlsSecrets.PSUClientSandboxKey,
      PSUClientSandboxCert: mtlsSecrets.PSUClientSandboxCert,
      PSUProxygenPrivateKey: proxygenSecrets.PSUProxygenPrivateKey,
      PSUProxygenPublicKey: proxygenSecrets.PSUProxygenPublicKey,
      ClinicalTrackerCAKey: mtlsSecrets.ClinicalTrackerCAKey,
      ClinicalTrackerCACert: mtlsSecrets.ClinicalTrackerCACert,
      ClinicalTrackerClientKey: mtlsSecrets.ClinicalTrackerClientKey,
      ClinicalTrackerClientCert: mtlsSecrets.ClinicalTrackerClientCert,
      ClinicalTrackerClientSandboxKey: mtlsSecrets.ClinicalTrackerClientSandboxKey,
      ClinicalTrackerClientSandboxCert: mtlsSecrets.ClinicalTrackerClientSandboxCert,
      ClinicalTrackerProxygenPrivateKey: proxygenSecrets.ClinicalTrackerProxygenPrivateKey,
      ClinicalTrackerProxygenPublicKey: proxygenSecrets.ClinicalTrackerProxygenPublicKey,
      FhirFacadeCAKey: mtlsSecrets.FhirFacadeCAKey,
      FhirFacadeCACert: mtlsSecrets.FhirFacadeCACert,
      FhirFacadeClientKey: mtlsSecrets.FhirFacadeClientKey,
      FhirFacadeClientCert: mtlsSecrets.FhirFacadeClientCert,
      FhirFacadeClientSandboxKey: mtlsSecrets.FhirFacadeClientSandboxKey,
      FhirFacadeClientSandboxCert: mtlsSecrets.FhirFacadeClientSandboxCert,
      FhirFacadeProxygenPrivateKey: proxygenSecrets.PSUProxygenPrivateKey,
      FhirFacadeProxygenPublicKey: proxygenSecrets.PSUProxygenPublicKey,
      secretKMSKey: encryption.secretsKmsKey
    })
    this.lambdaDecryptSecretsKmsPolicy = encryption.lambdaDecryptSecretsKmsPolicy
    this.clinicalTrackerCACertSecret = mtlsSecrets.ClinicalTrackerCACert
    this.clinicalTrackerClientCertSecret = mtlsSecrets.ClinicalTrackerClientCert
    this.clinicalTrackerClientSandboxCertSecret = mtlsSecrets.ClinicalTrackerClientSandboxCert
    this.pfpCACertSecret = mtlsSecrets.PfpCACert
    this.pfpClientCertSecret = mtlsSecrets.PfpClientCert
    this.pfpClientSandboxCertSecret = mtlsSecrets.PfpClientSandboxCert
    this.psuCACertSecret = mtlsSecrets.PSUCACert
    this.psuClientCertSecret = mtlsSecrets.PSUClientCert
    this.psuClientSandboxCertSecret = mtlsSecrets.PSUClientSandboxCert
    this.fhirFacadeCACertSecret = mtlsSecrets.FhirFacadeCACert
    this.fhirFacadeClientCertSecret = mtlsSecrets.FhirFacadeClientCert
    this.fhirFacadeClientSandboxCertSecret = mtlsSecrets.FhirFacadeClientSandboxCert
    this.spinePublicCertificate = configSecrets.spinePublicCertificate
    this.ptlPrescriptionSigningPublicKey = configSecrets.ptlPrescriptionSigningPublicKey
    nagSuppressions(this, "Secrets")
  }
}

import {
  StackProps,
  Stack,
  App,
  Tags
} from "aws-cdk-lib"
import {ECRRepositories} from "../resources/ECRRepositories"
import {RegressionTestSecrets} from "../resources/RegressionTestSecrets"
import {Storage} from "../resources/Storage"
import {Encryption} from "../resources/Encryption"
import {MTLSSecrets} from "../resources/MTLSSecrets"
import {ProxygenSecrets} from "../resources/ProxygenSecrets"
import {AtlassianSecrets} from "../resources/AtlassianSecrets"
import {ConfigSecrets} from "../resources/ConfigSecrets"
import {Role} from "aws-cdk-lib/aws-iam"
import {SecretPolicies} from "../resources/secretPolicies"
import {CfnBucket} from "aws-cdk-lib/aws-s3"

export interface AccountResourcesStackProps_UK extends StackProps {
  readonly stackName: string
  readonly version: string
  readonly commitId: string
  readonly cloudFormationExecutionRole: Role
  readonly cloudFormationPrepareChangesetRole: Role
  readonly CloudFormationDeployRole: Role
  readonly apiGwCloudWatchRole: Role
}

export class AccountResourcesStack_UK extends Stack {
  readonly auditLoggingBucket: CfnBucket
  public constructor(scope: App, id: string, props: AccountResourcesStackProps_UK){
    super(scope, id, props)

    Tags.of(this).add("stackName", props.stackName)
    new ECRRepositories(this, "ECRRepositories")
    new RegressionTestSecrets(this, "RegressionTestSecrets", {stackName: props.stackName})
    const storage = new Storage(this, "Storage", {
      logRetentionDays: 30,
      accountId: this.account,
      region: this.region,
      cloudFormationExecutionRole: props.cloudFormationExecutionRole,
      cloudFormationPrepareChangesetRole: props.cloudFormationPrepareChangesetRole,
      CloudFormationDeployRole: props.CloudFormationDeployRole
      // need a way to pass these in
      // artifactsBucketArn
      // trustStoreBucketArn
      // trustStoreDeploymentBucketArn
      // cptUIStatefulResourcesStaticContentBucketArn
      // epsamKbDocsBucketArn
    })
    const encryption =new Encryption(this, "Encryption", {
      accountId: this.account,
      region: this.region,
      apiGwCloudWatchRole: props.apiGwCloudWatchRole,
      cloudFormationExecutionRole: props.cloudFormationExecutionRole,
      cloudFormationPrepareChangesetRole: props.cloudFormationPrepareChangesetRole,
      CloudFormationDeployRole: props.CloudFormationDeployRole
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
    new ConfigSecrets(this, "ConfigSecrets", {
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
    this.auditLoggingBucket = storage.auditLoggingBucket
  }
}

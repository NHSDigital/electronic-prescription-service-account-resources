import {
  StackProps,
  Stack,
  App,
  Tags,
  CfnOutput
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
      pfpProxygenKeys: proxygenSecrets.pfpProxygenKeys,

      psuCAKey: mtlsSecrets.psuCAKey,
      psuCACert: mtlsSecrets.psuCACert,
      psuClientKey: mtlsSecrets.psuClientKey,
      psuClientCert: mtlsSecrets.psuClientCert,
      psuClientSandboxKey: mtlsSecrets.psuClientSandboxKey,
      psuClientSandboxCert: mtlsSecrets.psuClientSandboxCert,
      psuProxygenKeys: proxygenSecrets.psuProxygenKeys,
      cpsuProxygenKeys: proxygenSecrets.cpsuProxygenKeys,

      clinicalTrackerCAKey: mtlsSecrets.clinicalTrackerCAKey,
      clinicalTrackerCACert: mtlsSecrets.clinicalTrackerCACert,
      clinicalTrackerClientKey: mtlsSecrets.clinicalTrackerClientKey,
      clinicalTrackerClientCert: mtlsSecrets.clinicalTrackerClientCert,
      clinicalTrackerClientSandboxKey: mtlsSecrets.clinicalTrackerClientSandboxKey,
      clinicalTrackerClientSandboxCert: mtlsSecrets.clinicalTrackerClientSandboxCert,
      clinicalTrackerProxygenKeys: proxygenSecrets.clinicalTrackerProxygenKeys,

      fhirFacadeCAKey: mtlsSecrets.fhirFacadeCAKey,
      fhirFacadeCACert: mtlsSecrets.fhirFacadeCACert,
      fhirFacadeClientKey: mtlsSecrets.fhirFacadeClientKey,
      fhirFacadeClientCert: mtlsSecrets.fhirFacadeClientCert,
      fhirFacadeClientSandboxKey: mtlsSecrets.fhirFacadeClientSandboxKey,
      fhirFacadeClientSandboxCert: mtlsSecrets.fhirFacadeClientSandboxCert,
      prescribingProxygenKeys: proxygenSecrets.prescribingProxygenKeys,
      dispensingProxygenKeys: proxygenSecrets.dispensingProxygenKeys,

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

    // account-resources:ClinicalTrackerCACertSecret
    // used by lambda-resources and ci-resources
    new CfnOutput(this, "ClinicalTrackerCACertArn", {
      value: mtlsSecrets.clinicalTrackerCACert.secretArn,
      exportName: `${props.stackName}:Secret:ClinicalTrackerCACert:Arn`
    })
    // account-resources:ClinicalTrackerCAKeySecret
    // used by lambda-resources and ci-resources
    new CfnOutput(this, "ClinicalTrackerCAKeyArn", {
      value: mtlsSecrets.clinicalTrackerCAKey.secretArn,
      exportName: `${props.stackName}:Secret:ClinicalTrackerCAKey:Value`
    })
    // account-resources:ClinicalTrackerClientCertSecret
    // used by lambda-resources and ci-resources
    new CfnOutput(this, "ClinicalTrackerClientCertArn", {
      value: mtlsSecrets.clinicalTrackerClientCert.secretArn,
      exportName: `${props.stackName}:Secret:ClinicalTrackerClientCert:Arn`
    })
    // account-resources:ClinicalTrackerClientKeySecret
    // used by lambda-resources and ci-resources
    new CfnOutput(this, "ClinicalTrackerClientKey", {
      value: mtlsSecrets.clinicalTrackerClientKey.secretArn,
      exportName: `${props.stackName}:Secret:ClinicalTrackerClientKey:Arn`
    })

    // account-resources:ClinicalTrackerClientSandboxCertSecret
    // used by lambda-resources and ci-resources
    new CfnOutput(this, "ClinicalTrackerClientSandboxCert", {
      value: mtlsSecrets.clinicalTrackerClientSandboxCert.secretArn,
      exportName: `${props.stackName}:Secret:ClinicalTrackerClientSandboxCert:Arn`
    })

    // account-resources:ClinicalTrackerClientSandboxKeySecret
    // used by lambda-resources and ci-resources
    new CfnOutput(this, "ClinicalTrackerClientSandboxKey", {
      value: mtlsSecrets.clinicalTrackerClientSandboxKey.secretArn,
      exportName: `${props.stackName}:Secret:ClinicalTrackerClientSandboxKey:Arn`
    })

    // account-resources:ClinicalTrackerProxygenPrivateKey
    // used by lambda-resources and ci-resources
    new CfnOutput(this, "ClinicalTrackerProxygenPrivateKey", {
      value: proxygenSecrets.clinicalTrackerProxygenKeys.proxygenPrivateKey.secretArn,
      exportName: `${props.stackName}:Secret:ClinicalTrackerProxygenPrivateKey:Arn`
    })

    // account-resources:ClinicalTrackerProxygenPublicKey
    // used by lambda-resources and ci-resources
    new CfnOutput(this, "ClinicalTrackerProxygenPublicKey", {
      value: proxygenSecrets.clinicalTrackerProxygenKeys.proxygenPublicKey.secretArn,
      exportName: `${props.stackName}:Secret:ClinicalTrackerProxygenPublicKey:Arn`
    })

    // account-resources:CPSUProxygenPrivateKey
    // used by lambda-resources and ci-resources
    new CfnOutput(this, "CPSUProxygenPrivateKey", {
      value: proxygenSecrets.cpsuProxygenKeys.proxygenPrivateKey.secretArn,
      exportName: `${props.stackName}:Secret:CPSUProxygenPrivateKey:Arn`
    })

    // account-resources:CPSUProxygenPublicKey
    // used by ci-resources
    new CfnOutput(this, "CPSUProxygenPublicKey", {
      value: proxygenSecrets.cpsuProxygenKeys.proxygenPublicKey.secretArn,
      exportName: `${props.stackName}:Secret:CPSUProxygenPublicKey:Arn`
    })

    // account-resources:FhirFacadeCACertSecret
    // used by lambda-resources and ci-resources
    new CfnOutput(this, "FhirFacadeCACert", {
      value: mtlsSecrets.fhirFacadeCACert.secretArn,
      exportName: `${props.stackName}:Secret:FhirFacadeCACert:Arn`
    })

    // account-resources:FhirFacadeCAKeySecret
    // used by ci-resources
    new CfnOutput(this, "FhirFacadeCAKey", {
      value: mtlsSecrets.fhirFacadeCAKey.secretArn,
      exportName: `${props.stackName}:Secret:FhirFacadeCAKey:Arn`
    })

    // account-resources:FhirFacadeClientCertSecret
    // used by lambda-resources and ci-resources
    new CfnOutput(this, "FhirFacadeClientCert", {
      value: mtlsSecrets.fhirFacadeClientCert.secretArn,
      exportName: `${props.stackName}:Secret:FhirFacadeClientCert:Arn`
    })

    // account-resources:FhirFacadeClientKeySecret
    // used by lambda-resources and ci-resources
    new CfnOutput(this, "FhirFacadeClientKey", {
      value: mtlsSecrets.fhirFacadeClientKey.secretArn,
      exportName: `${props.stackName}:Secret:FhirFacadeClientKey:Arn`
    })

    // account-resources:FhirFacadeClientSandboxCertSecret
    // used by lambda-resources and ci-resources
    new CfnOutput(this, "FhirFacadeClientSandboxCert", {
      value: mtlsSecrets.fhirFacadeClientSandboxCert.secretArn,
      exportName: `${props.stackName}:Secret:FhirFacadeClientSandboxCert:Arn`
    })

    // account-resources:FhirFacadeClientSandboxKeySecret
    // used by lambda-resources and ci-resources
    new CfnOutput(this, "FhirFacadeClientSandboxKey", {
      value: mtlsSecrets.fhirFacadeClientSandboxKey.secretArn,
      exportName: `${props.stackName}:Secret:FhirFacadeClientSandboxKey:Arn`
    })

    // account-resources:LambdaAccessSecretsPolicy
    // used by
    // pfp
    // psu
    // cpt-api
    // cpt
    // prescribe-dispense
    new CfnOutput(this, "LambdaAccessSecretsPolicy", {
      value: configSecrets.lambdaAccessSecretsPolicy.managedPolicyArn,
      exportName: `${props.stackName}:Policy:LambdaAccessSecrets:Arn`
    })

    // account-resources:LambdaDecryptSecretsKMSPolicy
    // used by
    // pfp
    // psu
    // cpt-api
    // lambda-resources
    // monitoring
    // cpt-ui
    // prescribe-dispense
    // fhir-validator
    new CfnOutput(this, "LambdaDecryptSecretsKMSPolicy", {
      value: encryption.lambdaDecryptSecretsKmsPolicy.managedPolicyArn,
      exportName: `${props.stackName}:Policy:LambdaDecryptSecretsKMS:Arn`
    })

    // account-resources:PfpCACertSecret
    // used by lambda-resources
    new CfnOutput(this, "PfpCACertSecret", {
      value: mtlsSecrets.pfpCACert.secretArn,
      exportName: `${props.stackName}:Secret:PfpCACert:Arn`
    })
    nagSuppressions(this, "Secrets")
  }
}

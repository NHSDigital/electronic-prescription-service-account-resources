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
      exportName: `${props.stackName}:Secret:ClinicalTrackerCAKey:Arn`
    })
    // account-resources:ClinicalTrackerClientCertSecret
    // used by lambda-resources and ci-resources
    // also used by cpt api .github/workflows/cdk_release_code.yml
    new CfnOutput(this, "ClinicalTrackerClientCertArn", {
      value: mtlsSecrets.clinicalTrackerClientCert.secretArn,
      exportName: `${props.stackName}:Secret:ClinicalTrackerClientCert:Arn`
    })
    // account-resources:ClinicalTrackerClientKeySecret
    // used by lambda-resources and ci-resources
    // also used by cpt api .github/workflows/cdk_release_code.yml
    new CfnOutput(this, "ClinicalTrackerClientKeyArn", {
      value: mtlsSecrets.clinicalTrackerClientKey.secretArn,
      exportName: `${props.stackName}:Secret:ClinicalTrackerClientKey:Arn`
    })

    // account-resources:ClinicalTrackerClientSandboxCertSecret
    // used by lambda-resources and ci-resources
    new CfnOutput(this, "ClinicalTrackerClientSandboxCertArn", {
      value: mtlsSecrets.clinicalTrackerClientSandboxCert.secretArn,
      exportName: `${props.stackName}:Secret:ClinicalTrackerClientSandboxCert:Arn`
    })

    // account-resources:ClinicalTrackerClientSandboxKeySecret
    // used by lambda-resources and ci-resources
    new CfnOutput(this, "ClinicalTrackerClientSandboxKeyArn", {
      value: mtlsSecrets.clinicalTrackerClientSandboxKey.secretArn,
      exportName: `${props.stackName}:Secret:ClinicalTrackerClientSandboxKey:Arn`
    })

    // account-resources:ClinicalTrackerProxygenPrivateKey
    // used by lambda-resources and ci-resources
    new CfnOutput(this, "ClinicalTrackerProxygenPrivateKeyArn", {
      value: proxygenSecrets.clinicalTrackerProxygenKeys.proxygenPrivateKey.secretArn,
      exportName: `${props.stackName}:Secret:ClinicalTrackerProxygenPrivateKey:Arn`
    })

    // account-resources:ClinicalTrackerProxygenPublicKey
    // used by lambda-resources and ci-resources
    new CfnOutput(this, "ClinicalTrackerProxygenPublicKeyArn", {
      value: proxygenSecrets.clinicalTrackerProxygenKeys.proxygenPublicKey.secretArn,
      exportName: `${props.stackName}:Secret:ClinicalTrackerProxygenPublicKey:Arn`
    })

    // account-resources:CPSUProxygenPrivateKey
    // used by lambda-resources and ci-resources
    new CfnOutput(this, "CPSUProxygenPrivateKeyArn", {
      value: proxygenSecrets.cpsuProxygenKeys.proxygenPrivateKey.secretArn,
      exportName: `${props.stackName}:Secret:CPSUProxygenPrivateKey:Arn`
    })

    // account-resources:CPSUProxygenPublicKey
    // used by ci-resources
    new CfnOutput(this, "CPSUProxygenPublicKeyArn", {
      value: proxygenSecrets.cpsuProxygenKeys.proxygenPublicKey.secretArn,
      exportName: `${props.stackName}:Secret:CPSUProxygenPublicKey:Arn`
    })

    // account-resources:FhirFacadeCACertSecret
    // used by lambda-resources and ci-resources
    new CfnOutput(this, "FhirFacadeCACertArn", {
      value: mtlsSecrets.fhirFacadeCACert.secretArn,
      exportName: `${props.stackName}:Secret:FhirFacadeCACert:Arn`
    })

    // account-resources:FhirFacadeCAKeySecret
    // used by ci-resources
    new CfnOutput(this, "FhirFacadeCAKeyArn", {
      value: mtlsSecrets.fhirFacadeCAKey.secretArn,
      exportName: `${props.stackName}:Secret:FhirFacadeCAKey:Arn`
    })

    // account-resources:FhirFacadeClientCertSecret
    // used by lambda-resources and ci-resources
    // and fhir-api cdk_release_code.yml
    new CfnOutput(this, "FhirFacadeClientCertArn", {
      value: mtlsSecrets.fhirFacadeClientCert.secretArn,
      exportName: `${props.stackName}:Secret:FhirFacadeClientCert:Arn`
    })

    // account-resources:FhirFacadeClientKeySecret
    // used by lambda-resources and ci-resources
    // and fhir-api cdk_release_code.yml
    new CfnOutput(this, "FhirFacadeClientKeyArn", {
      value: mtlsSecrets.fhirFacadeClientKey.secretArn,
      exportName: `${props.stackName}:Secret:FhirFacadeClientKey:Arn`
    })

    // account-resources:FhirFacadeClientSandboxCertSecret
    // used by lambda-resources and ci-resources
    new CfnOutput(this, "FhirFacadeClientSandboxCertArn", {
      value: mtlsSecrets.fhirFacadeClientSandboxCert.secretArn,
      exportName: `${props.stackName}:Secret:FhirFacadeClientSandboxCert:Arn`
    })

    // account-resources:FhirFacadeClientSandboxKeySecret
    // used by lambda-resources and ci-resources
    new CfnOutput(this, "FhirFacadeClientSandboxKeyArn", {
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
    new CfnOutput(this, "LambdaAccessSecretsPolicyArn", {
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
    new CfnOutput(this, "LambdaDecryptSecretsKMSPolicyArn", {
      value: encryption.lambdaDecryptSecretsKmsPolicy.managedPolicyArn,
      exportName: `${props.stackName}:Policy:LambdaDecryptSecretsKMS:Arn`
    })

    // account-resources:PfpCACertSecret
    // used by lambda-resources
    new CfnOutput(this, "PfpCACertArn", {
      value: mtlsSecrets.pfpCACert.secretArn,
      exportName: `${props.stackName}:Secret:PfpCACert:Arn`
    })

    // account-resources:ClinicalTrackerProxygenKid
    // used by lambda-resources
    new CfnOutput(this, "ClinicalTrackerProxygenKidArn", {
      value: proxygenSecrets.clinicalTrackerProxygenKeys.proxygenKid.secretArn,
      exportName: `${props.stackName}:Secret:ClinicalTrackerProxygenKid:Arn`
    })

    // account-resources:ClinicalTrackerProxygenProdKid
    // used by lambda-resources
    new CfnOutput(this, "ClinicalTrackerProxygenProdKidArn", {
      value: proxygenSecrets.clinicalTrackerProxygenKeys.proxygenProdKid.secretArn,
      exportName: `${props.stackName}:Secret:ClinicalTrackerProxygenProdKid:Arn`
    })

    // account-resources:ClinicalTrackerProxygenProdPrivateKey
    // used by lambda-resources
    new CfnOutput(this, "ClinicalTrackerProxygenProdPrivateKeyArn", {
      value: proxygenSecrets.clinicalTrackerProxygenKeys.proxygenProdPrivateKey.secretArn,
      exportName: `${props.stackName}:Secret:ClinicalTrackerProxygenProdPrivateKey:Arn`
    })

    // account-resources:ClinicalTrackerProxygenProdPublicKey
    // used by lambda-resources
    new CfnOutput(this, "ClinicalTrackerProxygenProdPublicKeyArn", {
      value: proxygenSecrets.clinicalTrackerProxygenKeys.proxygenProdPublicKey.secretArn,
      exportName: `${props.stackName}:Secret:ClinicalTrackerProxygenProdPublicKey:Arn`
    })

    // account-resources:ClinicalTrackerProxygenTLKid
    // used by lambda-resources
    new CfnOutput(this, "ClinicalTrackerProxygenPTLKidArn", {
      value: proxygenSecrets.prescribingProxygenKeys.proxygenKid.secretArn,
      exportName: `${props.stackName}:Secret:ClinicalTrackerProxygenPTLKid:Arn`
    })

    // account-resources:ClinicalTrackerProxygenPTLPrivateKey
    // used by lambda-resources
    new CfnOutput(this, "ClinicalTrackerProxygenPTLPrivateKeyArn", {
      value: proxygenSecrets.prescribingProxygenKeys.proxygenPrivateKey.secretArn,
      exportName: `${props.stackName}:Secret:ClinicalTrackerProxygenPTLPrivateKey:Arn`
    })

    // account-resources:CPSUProxygenKid
    // used by lambda-resources
    new CfnOutput(this, "CPSUProxygenKidArn", {
      value: proxygenSecrets.cpsuProxygenKeys.proxygenKid.secretArn,
      exportName: `${props.stackName}:Secret:CPSUProxygenKid:Arn`
    })

    // account-resources:CPSUProxygenProdKid
    // used by lambda-resources
    new CfnOutput(this, "CPSUProxygenProdKidArn", {
      value: proxygenSecrets.cpsuProxygenKeys.proxygenProdKid.secretArn,
      exportName: `${props.stackName}:Secret:CPSUProxygenProdKid:Arn`
    })

    // account-resources:CPSUProxygenProdPrivateKey
    // used by lambda-resources
    new CfnOutput(this, "CPSUProxygenProdPrivateKeyArn", {
      value: proxygenSecrets.cpsuProxygenKeys.proxygenProdPrivateKey.secretArn,
      exportName: `${props.stackName}:Secret:CPSUProxygenProdPrivateKey:Arn`
    })

    // account-resources:CPSUProxygenPTLKid
    // used by lambda-resources
    new CfnOutput(this, "CPSUProxygenPTLKidArn", {
      value: proxygenSecrets.dispensingProxygenKeys.proxygenKid.secretArn,
      exportName: `${props.stackName}:Secret:CPSUProxygenPTLKid:Arn`
    })

    // account-resources:CPSUProxygenPTLPrivateKey
    // used by lambda-resources
    new CfnOutput(this, "CPSUProxygenPTLPrivateKeyArn", {
      value: proxygenSecrets.dispensingProxygenKeys.proxygenPrivateKey.secretArn,
      exportName: `${props.stackName}:Secret:CPSUProxygenPTLPrivateKey:Arn`
    })

    // account-resources:PfpClientCertSecret
    // used by lambda-resources, ci-resources
    // and pfp sam_release_code.yml
    new CfnOutput(this, "PfpClientCertArn", {
      value: mtlsSecrets.pfpClientCert.secretArn,
      exportName: `${props.stackName}:Secret:PfpClientCert:Arn`
    })

    // account-resources:PfpClientKeySecret
    // used by lambda-resources, ci-resources
    // and pfp sam_release_code.yml
    new CfnOutput(this, "PfpClientKeyArn", {
      value: mtlsSecrets.pfpClientKey.secretArn,
      exportName: `${props.stackName}:Secret:PfpClientKey:Arn`
    })

    // account-resources:PfpClientSandboxCertSecret
    // used by lambda-resources, ci-resources
    new CfnOutput(this, "PfpClientSandboxCertArn", {
      value: mtlsSecrets.pfpClientSandboxCert.secretArn,
      exportName: `${props.stackName}:Secret:PfpClientSandboxCert:Arn`
    })

    // account-resources:PfpClientSandboxKeySecret
    // used by lambda-resources, ci-resources
    new CfnOutput(this, "PfpClientSandboxKeyArn", {
      value: mtlsSecrets.pfpClientSandboxKey.secretArn,
      exportName: `${props.stackName}:Secret:PfpClientSandboxKey:Arn`
    })

    // account-resources:PsuCACertSecret
    // used by lambda-resources, ci-resources
    new CfnOutput(this, "PsuCACertArn", {
      value: mtlsSecrets.psuCACert.secretArn,
      exportName: `${props.stackName}:Secret:PsuCACert:Arn`
    })

    // account-resources:PsuCAKeySecret
    // used by lambda-resources, ci-resources
    new CfnOutput(this, "PsuCAKeyArn", {
      value: mtlsSecrets.psuCAKey.secretArn,
      exportName: `${props.stackName}:Secret:PsuCAKey:Arn`
    })

    // account-resources:PsuClientCertSecret
    // used by lambda-resources, ci-resources
    // and psu run_release_code_and_api
    new CfnOutput(this, "PsuClientCertArn", {
      value: mtlsSecrets.psuClientCert.secretArn,
      exportName: `${props.stackName}:Secret:PsuClientCert:Arn`
    })

    // account-resources:PsuClientKeySecret
    // used by lambda-resources, ci-resources
    // and psu run_release_code_and_api.yml
    new CfnOutput(this, "PsuClientKeyArn", {
      value: mtlsSecrets.psuClientKey.secretArn,
      exportName: `${props.stackName}:Secret:PsuClientKey:Arn`
    })

    // account-resources:PsuClientSandboxCertSecret
    // used by lambda-resources, ci-resources
    new CfnOutput(this, "PsuClientSandboxCertArn", {
      value: mtlsSecrets.psuClientSandboxCert.secretArn,
      exportName: `${props.stackName}:Secret:PsuClientSandboxCert:Arn`
    })

    // account-resources:PsuClientSandboxKeySecret
    // used by lambda-resources, ci-resources
    new CfnOutput(this, "PsuClientSandboxKeyArn", {
      value: mtlsSecrets.psuClientSandboxKey.secretArn,
      exportName: `${props.stackName}:Secret:PsuClientSandboxKey:Arn`
    })

    // account-resources:PSUProxygenKid
    // used by lambda-resources
    new CfnOutput(this, "PSUProxygenKidArn", {
      value: proxygenSecrets.psuProxygenKeys.proxygenKid.secretArn,
      exportName: `${props.stackName}:Secret:PSUProxygenKid:Arn`
    })

    // account-resources:PSUProxygenPrivateKey
    // used by lambda-resources
    new CfnOutput(this, "PSUProxygenPrivateKeyArn", {
      value: proxygenSecrets.psuProxygenKeys.proxygenPrivateKey.secretArn,
      exportName: `${props.stackName}:Secret:PSUProxygenPrivateKey:Arn`
    })

    // account-resources:PSUProxygenProdKid
    // used by lambda-resources
    new CfnOutput(this, "PSUProxygenProdKidArn", {
      value: proxygenSecrets.psuProxygenKeys.proxygenProdKid.secretArn,
      exportName: `${props.stackName}:Secret:PSUProxygenProdKid:Arn`
    })

    // account-resources:PSUProxygenProdPrivateKey
    // used by lambda-resources
    new CfnOutput(this, "PSUProxygenProdPrivateKeyArn", {
      value: proxygenSecrets.psuProxygenKeys.proxygenProdPrivateKey.secretArn,
      exportName: `${props.stackName}:Secret:PSUProxygenProdPrivateKey:Arn`
    })

    // account-resources:PSUProxygenPTLKid
    // used by lambda-resources
    new CfnOutput(this, "PSUProxygenPTLKidArn", {
      value: proxygenSecrets.dispensingProxygenKeys.proxygenKid.secretArn,
      exportName: `${props.stackName}:Secret:PSUProxygenPTLKid:Arn`
    })

    // account-resources:PSUProxygenPTLPrivateKey
    // used by lambda-resources
    new CfnOutput(this, "PSUProxygenPTLPrivateKeyArn", {
      value: proxygenSecrets.dispensingProxygenKeys.proxygenPrivateKey.secretArn,
      exportName: `${props.stackName}:Secret:PSUProxygenPTLPrivateKey:Arn`
    })

    // account-resources:PSUProxygenPublicKey
    // used by lambda-resources
    new CfnOutput(this, "PSUProxygenPublicKeyArn", {
      value: proxygenSecrets.dispensingProxygenKeys.proxygenPublicKey.secretArn,
      exportName: `${props.stackName}:Secret:PSUProxygenPublicKey:Arn`
    })

    // account-resources:SecretsKMSKeyAlias
    // used by secrets
    new CfnOutput(this, "SecretsKMSKeyAlias", {
      value: encryption.secretsKmsKeyAlias.aliasName,
      exportName: `${props.stackName}:SecretsKMSKey:Alias`
    })

    // account-resources:SpineASID
    // used by
    // cpt-api
    // pfp
    new CfnOutput(this, "SpineASIDArn", {
      value: configSecrets.spineASID.secretArn,
      exportName: `${props.stackName}:Secret:SpineASID:Arn`
    })

    // account-resources:SpineCAChain
    // used by
    // cpt-api
    // pfp
    // prescribe-dispense
    new CfnOutput(this, "SpineCAChainArn", {
      value: configSecrets.spineCAChain.secretArn,
      exportName: `${props.stackName}:Secret:SpineCAChain:Arn`
    })

    // account-resources:SpinePartyKey
    // used by
    // cpt-api
    // pfp
    new CfnOutput(this, "SpinePartyKeyArn", {
      value: configSecrets.spinePartyKey.secretArn,
      exportName: `${props.stackName}:Secret:SpinePartyKey:Arn`
    })

    // account-resources:SpinePrivateKey
    // used by
    // cpt-api
    // pfp
    // prescribe-dispense
    new CfnOutput(this, "SpinePrivateKeyArn", {
      value: configSecrets.spinePrivateKey.secretArn,
      exportName: `${props.stackName}:Secret:SpinePrivateKey:Arn`
    })

    // account-resources:SpinePublicCertificate
    // used by
    // cpt-api
    // pfp
    // lambda-resources
    // prescribe-dispense
    new CfnOutput(this, "SpinePublicCertificateArn", {
      value: configSecrets.spinePublicCertificate.secretArn,
      exportName: `${props.stackName}:Secret:SpinePublicCertificate:Arn`
    })

    // secrets:DispensingProxygenProdKid
    // used by lambda-resources
    new CfnOutput(this, "DispensingProxygenProdKidArn", {
      value: proxygenSecrets.dispensingProxygenKeys.proxygenProdKid.secretArn,
      exportName: `${props.stackName}:Secret:DispensingProxygenProdKid:Arn`
    })

    // secrets:DispensingProxygenProdPrivateKey
    // used by lambda-resources
    new CfnOutput(this, "DispensingProxygenProdPrivateKeyArn", {
      value: proxygenSecrets.dispensingProxygenKeys.proxygenProdPrivateKey.secretArn,
      exportName: `${props.stackName}:Secret:DispensingProxygenProdPrivateKey:Arn`
    })

    // secrets:DispensingProxygenPtlKid
    // used by lambda-resources
    new CfnOutput(this, "DispensingProxygenPtlKidArn", {
      value: proxygenSecrets.dispensingProxygenKeys.proxygenKid.secretArn,
      exportName: `${props.stackName}:Secret:DispensingProxygenPtlKid:Arn`
    })

    // secrets:DispensingProxygenPtlPrivateKey
    // used by lambda-resources
    new CfnOutput(this, "DispensingProxygenPtlPrivateKeyArn", {
      value: proxygenSecrets.dispensingProxygenKeys.proxygenPrivateKey.secretArn,
      exportName: `${props.stackName}:Secret:DispensingProxygenPtlPrivateKey:Arn`
    })

    // secrets:epsSigningCertChain
    // used by prescribe-dispense
    new CfnOutput(this, "epsSigningCertChainArn", {
      value: configSecrets.epsSigningCertChain.secretArn,
      exportName: `${props.stackName}:Secret:EpsSigningCertChain:Arn`
    })

    // secrets:epsSigningCertChainManagedPolicy
    // used by prescribe-dispense
    new CfnOutput(this, "epsSigningCertChainManagedPolicyArn", {
      value: configSecrets.epsSigningCertChainManagedPolicy.managedPolicyArn,
      exportName: `${props.stackName}:Policy:EpsSigningCertChainAccess:Arn`
    })

    // secrets:FhirDispensingProxygenKid
    // used by lambda-resources
    new CfnOutput(this, "FhirDispensingProxygenKidArn", {
      value: proxygenSecrets.dispensingProxygenKeys.proxygenKid.secretArn,
      exportName: `${props.stackName}:Secret:FhirDispensingProxygenKid:Arn`
    })

    // secrets:FhirDispensingProxygenPrivateKey
    // used by lambda-resources
    new CfnOutput(this, "FhirDispensingProxygenPrivateKeyArn", {
      value: proxygenSecrets.dispensingProxygenKeys.proxygenPrivateKey.secretArn,
      exportName: `${props.stackName}:Secret:FhirDispensingProxygenPrivateKey:Arn`
    })

    // secrets:PrescribingProxygenProdKid
    // used by lambda-resources
    new CfnOutput(this, "PrescribingProxygenProdKidArn", {
      value: proxygenSecrets.prescribingProxygenKeys.proxygenProdKid.secretArn,
      exportName: `${props.stackName}:Secret:PrescribingProxygenProdKid:Arn`
    })

    // secrets:PrescribingProxygenProdPrivateKey
    // used by lambda-resources
    new CfnOutput(this, "PrescribingProxygenProdPrivateKeyArn", {
      value: proxygenSecrets.prescribingProxygenKeys.proxygenProdPrivateKey.secretArn,
      exportName: `${props.stackName}:Secret:PrescribingProxygenProdPrivateKey:Arn`
    })

    // secrets:PrescribingProxygenPtlKid
    // used by lambda-resources
    new CfnOutput(this, "PrescribingProxygenPtlKidArn", {
      value: proxygenSecrets.prescribingProxygenKeys.proxygenKid.secretArn,
      exportName: `${props.stackName}:Secret:PrescribingProxygenPtlKid:Arn`
    })

    // secrets:PrescribingProxygenPtlPrivateKey
    // used by lambda-resources
    new CfnOutput(this, "PrescribingProxygenPtlPrivateKeyArn", {
      value: proxygenSecrets.prescribingProxygenKeys.proxygenPrivateKey.secretArn,
      exportName: `${props.stackName}:Secret:PrescribingProxygenPtlPrivateKey:Arn`
    })

    // secrets:PrescriptionsForPatientsProxygenKid
    // used by lambda-resources
    new CfnOutput(this, "PrescriptionsForPatientsProxygenKidArn", {
      value: proxygenSecrets.prescribingProxygenKeys.proxygenKid.secretArn,
      exportName: `${props.stackName}:Secret:PrescriptionsForPatientsProxygenKid:Arn`
    })

    // secrets:PrescriptionsForPatientsProxygenPrivateKey
    // used by lambda-resources
    new CfnOutput(this, "PrescriptionsForPatientsProxygenPrivateKeyArn", {
      value: proxygenSecrets.prescribingProxygenKeys.proxygenPrivateKey.secretArn,
      exportName: `${props.stackName}:Secret:PrescriptionsForPatientsProxygenPrivateKey:Arn`
    })

    // secrets:PrescriptionsForPatientsProxygenProdKid
    // used by lambda-resources
    new CfnOutput(this, "PrescriptionsForPatientsProxygenProdKidArn", {
      value: proxygenSecrets.prescribingProxygenKeys.proxygenProdKid.secretArn,
      exportName: `${props.stackName}:Secret:PrescriptionsForPatientsProxygenProdKid:Arn`
    })

    // secrets:PrescriptionsForPatientsProxygenProdPrivateKey
    // used by lambda-resources
    new CfnOutput(this, "PrescriptionsForPatientsProxygenProdPrivateKeyArn", {
      value: proxygenSecrets.prescribingProxygenKeys.proxygenProdPrivateKey.secretArn,
      exportName: `${props.stackName}:Secret:PrescriptionsForPatientsProxygenProdPrivateKey:Arn`
    })

    // secrets:PrescriptionsForPatientsProxygenPtlKid
    // used by lambda-resources
    new CfnOutput(this, "PrescriptionsForPatientsProxygenPtlKidArn", {
      value: proxygenSecrets.prescribingProxygenKeys.proxygenKid.secretArn,
      exportName: `${props.stackName}:Secret:PrescriptionsForPatientsProxygenPtlKid:Arn`
    })

    // secrets:PrescriptionsForPatientsProxygenPtlPrivateKey
    // used by lambda-resources
    new CfnOutput(this, "PrescriptionsForPatientsProxygenPtlPrivateKeyArn", {
      value: proxygenSecrets.prescribingProxygenKeys.proxygenPrivateKey.secretArn,
      exportName: `${props.stackName}:Secret:PrescriptionsForPatientsProxygenPtlPrivateKey:Arn`
    })

    // secrets:PTLPrescriptionSigningPublicKey
    // used by lambda-resources
    new CfnOutput(this, "PTLPrescriptionSigningPublicKeyArn", {
      value: configSecrets.ptlPrescriptionSigningPublicKey.secretArn,
      exportName: `${props.stackName}:Secret:PTLPrescriptionSigningPublicKey:Arn`
    })
    nagSuppressions(this, "Secrets")
  }
}

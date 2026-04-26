import {
  StackProps,
  Stack,
  App,
  Tags,
  CfnOutput
} from "aws-cdk-lib"
import {nagSuppressions} from "../nagSuppressions"
import {getExportValue} from "../resources/ExportMigrations"

export interface SecretsStackProps extends StackProps {
  readonly stackName: string
  readonly version: string
  readonly commitId: string
  readonly environment: string
}

export class SecretsStack extends Stack {

  public constructor(scope: App, id: string, props: SecretsStackProps){
    super(scope, id, props)

    Tags.of(this).add("stackName", props.stackName)
    // this will be imported into here
    // const regressionTestSecrets =
    // new RegressionTestSecrets(this, "RegressionTestSecrets", {stackName: props.stackName})

    // policy exports
    new CfnOutput(this, "AccessSlackSecretsManagedPolicyArn", {
      value: getExportValue("account-resources:AccessSlackSecretsManagedPolicy", props.environment),
      exportName: `${props.stackName}:IAM:AccessSlackSecretsManagedPolicy:Arn`
    })
    new CfnOutput(this, "LambdaAccessSecretsPolicyArn", {
      value: getExportValue("account-resources:LambdaAccessSecretsPolicy", props.environment),
      exportName: `${props.stackName}:IAM:LambdaAccessSecretsPolicy:Arn`
    })
    new CfnOutput(this, "LambdaDecryptSecretsKMSPolicyArn", {
      value: getExportValue("account-resources:LambdaDecryptSecretsKMSPolicy", props.environment),
      exportName: `${props.stackName}:IAM:LambdaDecryptSecretsKMSPolicy:Arn`
    })

    // kms exports
    new CfnOutput(this, "SecretsKMSKeyAliasArn", {
      value: getExportValue("account-resources:SecretsKMSKeyAlias", props.environment),
      exportName: `${props.stackName}:KMS:SecretsKMSKeyAlias:Arn`
    })

    // secrets exports
    new CfnOutput(this, "ClinicalTrackerCACertSecretArn", {
      value: getExportValue("account-resources:ClinicalTrackerCACertSecret", props.environment),
      exportName: `${props.stackName}:Secrets:ClinicalTrackerCACertSecret:Arn`
    })
    new CfnOutput(this, "ClinicalTrackerCAKeySecretArn", {
      value: getExportValue("account-resources:ClinicalTrackerCAKeySecret", props.environment),
      exportName: `${props.stackName}:Secrets:ClinicalTrackerCAKeySecret:Arn`
    })
    new CfnOutput(this, "ClinicalTrackerClientCertSecretArn", {
      value: getExportValue("account-resources:ClinicalTrackerClientCertSecret", props.environment),
      exportName: `${props.stackName}:Secrets:ClinicalTrackerClientCertSecret:Arn`
    })
    new CfnOutput(this, "ClinicalTrackerClientKeySecretArn", {
      value: getExportValue("account-resources:ClinicalTrackerClientKeySecret", props.environment),
      exportName: `${props.stackName}:Secrets:ClinicalTrackerClientKeySecret:Arn`
    })
    new CfnOutput(this, "ClinicalTrackerClientSandboxCertSecretArn", {
      value: getExportValue("account-resources:ClinicalTrackerClientSandboxCertSecret", props.environment),
      exportName: `${props.stackName}:Secrets:ClinicalTrackerClientSandboxCertSecret:Arn`
    })
    new CfnOutput(this, "ClinicalTrackerClientSandboxKeySecretArn", {
      value: getExportValue("account-resources:ClinicalTrackerClientSandboxKeySecret", props.environment),
      exportName: `${props.stackName}:Secrets:ClinicalTrackerClientSandboxKeySecret:Arn`
    })
    new CfnOutput(this, "ClinicalTrackerProxygenKidArn", {
      value: getExportValue("account-resources:ClinicalTrackerProxygenKid", props.environment),
      exportName: `${props.stackName}:Secrets:ClinicalTrackerProxygenKid:Arn`
    })
    new CfnOutput(this, "ClinicalTrackerProxygenPrivateKeyArn", {
      value: getExportValue("account-resources:ClinicalTrackerProxygenPrivateKey", props.environment),
      exportName: `${props.stackName}:Secrets:ClinicalTrackerProxygenPrivateKey:Arn`
    })
    new CfnOutput(this, "ClinicalTrackerProxygenProdKidArn", {
      value: getExportValue("account-resources:ClinicalTrackerProxygenProdKid", props.environment),
      exportName: `${props.stackName}:Secrets:ClinicalTrackerProxygenProdKid:Arn`
    })
    new CfnOutput(this, "ClinicalTrackerProxygenProdPrivateKeyArn", {
      value: getExportValue("account-resources:ClinicalTrackerProxygenProdPrivateKey", props.environment),
      exportName: `${props.stackName}:Secrets:ClinicalTrackerProxygenProdPrivateKey:Arn`
    })
    new CfnOutput(this, "ClinicalTrackerProxygenPTLKidArn", {
      value: getExportValue("account-resources:ClinicalTrackerProxygenPTLKid", props.environment),
      exportName: `${props.stackName}:Secrets:ClinicalTrackerProxygenPTLKid:Arn`
    })
    new CfnOutput(this, "ClinicalTrackerProxygenPTLPrivateKeyArn", {
      value: getExportValue("account-resources:ClinicalTrackerProxygenPTLPrivateKey", props.environment),
      exportName: `${props.stackName}:Secrets:ClinicalTrackerProxygenPTLPrivateKey:Arn`
    })
    new CfnOutput(this, "ClinicalTrackerProxygenPublicKeyArn", {
      value: getExportValue("account-resources:ClinicalTrackerProxygenPublicKey", props.environment),
      exportName: `${props.stackName}:Secrets:ClinicalTrackerProxygenPublicKey:Arn`
    })
    new CfnOutput(this, "CPSUProxygenKidArn", {
      value: getExportValue("account-resources:CPSUProxygenKid", props.environment),
      exportName: `${props.stackName}:Secrets:CPSUProxygenKid:Arn`
    })
    new CfnOutput(this, "CPSUProxygenPrivateKeyArn", {
      value: getExportValue("account-resources:CPSUProxygenPrivateKey", props.environment),
      exportName: `${props.stackName}:Secrets:CPSUProxygenPrivateKey:Arn`
    })
    new CfnOutput(this, "CPSUProxygenProdKidArn", {
      value: getExportValue("account-resources:CPSUProxygenProdKid", props.environment),
      exportName: `${props.stackName}:Secrets:CPSUProxygenProdKid:Arn`
    })
    new CfnOutput(this, "CPSUProxygenProdPrivateKeyArn", {
      value: getExportValue("account-resources:CPSUProxygenProdPrivateKey", props.environment),
      exportName: `${props.stackName}:Secrets:CPSUProxygenProdPrivateKey:Arn`
    })
    new CfnOutput(this, "CPSUProxygenPTLKidArn", {
      value: getExportValue("account-resources:CPSUProxygenPTLKid", props.environment),
      exportName: `${props.stackName}:Secrets:CPSUProxygenPTLKid:Arn`
    })
    new CfnOutput(this, "CPSUProxygenPTLPrivateKeyArn", {
      value: getExportValue("account-resources:CPSUProxygenPTLPrivateKey", props.environment),
      exportName: `${props.stackName}:Secrets:CPSUProxygenPTLPrivateKey:Arn`
    })
    new CfnOutput(this, "CPSUProxygenPublicKeyArn", {
      value: getExportValue("account-resources:CPSUProxygenPublicKey", props.environment),
      exportName: `${props.stackName}:Secrets:CPSUProxygenPublicKey:Arn`
    })
    new CfnOutput(this, "FhirFacadeCACertSecretArn", {
      value: getExportValue("account-resources:FhirFacadeCACertSecret", props.environment),
      exportName: `${props.stackName}:Secrets:FhirFacadeCACertSecret:Arn`
    })
    new CfnOutput(this, "FhirFacadeCAKeySecretArn", {
      value: getExportValue("account-resources:FhirFacadeCAKeySecret", props.environment),
      exportName: `${props.stackName}:Secrets:FhirFacadeCAKeySecret:Arn`
    })
    new CfnOutput(this, "FhirFacadeClientCertSecretArn", {
      value: getExportValue("account-resources:FhirFacadeClientCertSecret", props.environment),
      exportName: `${props.stackName}:Secrets:FhirFacadeClientCertSecret:Arn`
    })
    new CfnOutput(this, "FhirFacadeClientKeySecretArn", {
      value: getExportValue("account-resources:FhirFacadeClientKeySecret", props.environment),
      exportName: `${props.stackName}:Secrets:FhirFacadeClientKeySecret:Arn`
    })
    new CfnOutput(this, "FhirFacadeClientSandboxCertSecretArn", {
      value: getExportValue("account-resources:FhirFacadeClientSandboxCertSecret", props.environment),
      exportName: `${props.stackName}:Secrets:FhirFacadeClientSandboxCertSecret:Arn`
    })
    new CfnOutput(this, "FhirFacadeClientSandboxKeySecretArn", {
      value: getExportValue("account-resources:FhirFacadeClientSandboxKeySecret", props.environment),
      exportName: `${props.stackName}:Secrets:FhirFacadeClientSandboxKeySecret:Arn`
    })
    new CfnOutput(this, "PfpCACertSecretArn", {
      value: getExportValue("account-resources:PfpCACertSecret", props.environment),
      exportName: `${props.stackName}:Secrets:PfpCACertSecret:Arn`
    })
    new CfnOutput(this, "PfpClientCertSecretArn", {
      value: getExportValue("account-resources:PfpClientCertSecret", props.environment),
      exportName: `${props.stackName}:Secrets:PfpClientCertSecret:Arn`
    })
    new CfnOutput(this, "PfpClientKeySecretArn", {
      value: getExportValue("account-resources:PfpClientKeySecret", props.environment),
      exportName: `${props.stackName}:Secrets:PfpClientKeySecret:Arn`
    })
    new CfnOutput(this, "PfpClientSandboxCertSecretArn", {
      value: getExportValue("account-resources:PfpClientSandboxCertSecret", props.environment),
      exportName: `${props.stackName}:Secrets:PfpClientSandboxCertSecret:Arn`
    })
    new CfnOutput(this, "PfpClientSandboxKeySecretArn", {
      value: getExportValue("account-resources:PfpClientSandboxKeySecret", props.environment),
      exportName: `${props.stackName}:Secrets:PfpClientSandboxKeySecret:Arn`
    })
    new CfnOutput(this, "PsuCACertSecretArn", {
      value: getExportValue("account-resources:PsuCACertSecret", props.environment),
      exportName: `${props.stackName}:Secrets:PsuCACertSecret:Arn`
    })
    new CfnOutput(this, "PsuCAKeySecretArn", {
      value: getExportValue("account-resources:PsuCAKeySecret", props.environment),
      exportName: `${props.stackName}:Secrets:PsuCAKeySecret:Arn`
    })
    new CfnOutput(this, "PsuClientCertSecretArn", {
      value: getExportValue("account-resources:PsuClientCertSecret", props.environment),
      exportName: `${props.stackName}:Secrets:PsuClientCertSecret:Arn`
    })
    new CfnOutput(this, "PsuClientKeySecretArn", {
      value: getExportValue("account-resources:PsuClientKeySecret", props.environment),
      exportName: `${props.stackName}:Secrets:PsuClientKeySecret:Arn`
    })
    new CfnOutput(this, "PsuClientSandboxCertSecretArn", {
      value: getExportValue("account-resources:PsuClientSandboxCertSecret", props.environment),
      exportName: `${props.stackName}:Secrets:PsuClientSandboxCertSecret:Arn`
    })
    new CfnOutput(this, "PsuClientSandboxKeySecretArn", {
      value: getExportValue("account-resources:PsuClientSandboxKeySecret", props.environment),
      exportName: `${props.stackName}:Secrets:PsuClientSandboxKeySecret:Arn`
    })
    new CfnOutput(this, "PSUProxygenKidArn", {
      value: getExportValue("account-resources:PSUProxygenKid", props.environment),
      exportName: `${props.stackName}:Secrets:PSUProxygenKid:Arn`
    })
    new CfnOutput(this, "PSUProxygenPrivateKeyArn", {
      value: getExportValue("account-resources:PSUProxygenPrivateKey", props.environment),
      exportName: `${props.stackName}:Secrets:PSUProxygenPrivateKey:Arn`
    })
    new CfnOutput(this, "PSUProxygenProdKidArn", {
      value: getExportValue("account-resources:PSUProxygenProdKid", props.environment),
      exportName: `${props.stackName}:Secrets:PSUProxygenProdKid:Arn`
    })
    new CfnOutput(this, "PSUProxygenProdPrivateKeyArn", {
      value: getExportValue("account-resources:PSUProxygenProdPrivateKey", props.environment),
      exportName: `${props.stackName}:Secrets:PSUProxygenProdPrivateKey:Arn`
    })
    new CfnOutput(this, "PSUProxygenPTLKidArn", {
      value: getExportValue("account-resources:PSUProxygenPTLKid", props.environment),
      exportName: `${props.stackName}:Secrets:PSUProxygenPTLKid:Arn`
    })
    new CfnOutput(this, "PSUProxygenPTLPrivateKeyArn", {
      value: getExportValue("account-resources:PSUProxygenPTLPrivateKey", props.environment),
      exportName: `${props.stackName}:Secrets:PSUProxygenPTLPrivateKey:Arn`
    })
    new CfnOutput(this, "PSUProxygenPublicKeyArn", {
      value: getExportValue("account-resources:PSUProxygenPublicKey", props.environment),
      exportName: `${props.stackName}:Secrets:PSUProxygenPublicKey:Arn`
    })
    new CfnOutput(this, "ServiceSearchApiKeyArn", {
      value: getExportValue("account-resources:ServiceSearchApiKey", props.environment),
      exportName: `${props.stackName}:Secrets:ServiceSearchApiKey:Arn`
    })
    new CfnOutput(this, "SpineASIDArn", {
      value: getExportValue("account-resources:SpineASID", props.environment),
      exportName: `${props.stackName}:Secrets:SpineASID:Arn`
    })
    new CfnOutput(this, "SpineCAChainArn", {
      value: getExportValue("account-resources:SpineCAChain", props.environment),
      exportName: `${props.stackName}:Secrets:SpineCAChain:Arn`
    })
    new CfnOutput(this, "SpinePartyKeyArn", {
      value: getExportValue("account-resources:SpinePartyKey", props.environment),
      exportName: `${props.stackName}:Secrets:SpinePartyKey:Arn`
    })
    new CfnOutput(this, "SpinePrivateKeyArn", {
      value: getExportValue("account-resources:SpinePrivateKey", props.environment),
      exportName: `${props.stackName}:Secrets:SpinePrivateKey:Arn`
    })
    new CfnOutput(this, "SpinePublicCertificateArn", {
      value: getExportValue("account-resources:SpinePublicCertificate", props.environment),
      exportName: `${props.stackName}:Secrets:SpinePublicCertificate:Arn`
    })
    new CfnOutput(this, "DispensingProxygenProdKidArn", {
      value: getExportValue("secrets:DispensingProxygenProdKid", props.environment),
      exportName: `${props.stackName}:Secrets:DispensingProxygenProdKid:Arn`
    })
    new CfnOutput(this, "DispensingProxygenProdPrivateKeyArn", {
      value: getExportValue("secrets:DispensingProxygenProdPrivateKey", props.environment),
      exportName: `${props.stackName}:Secrets:DispensingProxygenProdPrivateKey:Arn`
    })
    new CfnOutput(this, "DispensingProxygenPtlKidArn", {
      value: getExportValue("secrets:DispensingProxygenPtlKid", props.environment),
      exportName: `${props.stackName}:Secrets:DispensingProxygenPtlKid:Arn`
    })
    new CfnOutput(this, "DispensingProxygenPtlPrivateKeyArn", {
      value: getExportValue("secrets:DispensingProxygenPtlPrivateKey", props.environment),
      exportName: `${props.stackName}:Secrets:DispensingProxygenPtlPrivateKey:Arn`
    })
    new CfnOutput(this, "epsSigningCertChainArn", {
      value: getExportValue("secrets:epsSigningCertChain", props.environment),
      exportName: `${props.stackName}:Secrets:epsSigningCertChain:Arn`
    })
    new CfnOutput(this, "epsSigningCertChainManagedPolicyArn", {
      value: getExportValue("secrets:epsSigningCertChainManagedPolicy", props.environment),
      exportName: `${props.stackName}:Secrets:epsSigningCertChainManagedPolicy:Arn`
    })
    new CfnOutput(this, "FhirDispensingProxygenKidArn", {
      value: getExportValue("secrets:FhirDispensingProxygenKid", props.environment),
      exportName: `${props.stackName}:Secrets:FhirDispensingProxygenKid:Arn`
    })
    new CfnOutput(this, "FhirDispensingProxygenPrivateKeyArn", {
      value: getExportValue("secrets:FhirDispensingProxygenPrivateKey", props.environment),
      exportName: `${props.stackName}:Secrets:FhirDispensingProxygenPrivateKey:Arn`
    })
    new CfnOutput(this, "FhirPrescribingProxygenKidArn", {
      value: getExportValue("secrets:FhirPrescribingProxygenKid", props.environment),
      exportName: `${props.stackName}:Secrets:FhirPrescribingProxygenKid:Arn`
    })
    new CfnOutput(this, "FhirPrescribingProxygenPrivateKeyArn", {
      value: getExportValue("secrets:FhirPrescribingProxygenPrivateKey", props.environment),
      exportName: `${props.stackName}:Secrets:FhirPrescribingProxygenPrivateKey:Arn`
    })
    new CfnOutput(this, "PrescribingProxygenProdKidArn", {
      value: getExportValue("secrets:PrescribingProxygenProdKid", props.environment),
      exportName: `${props.stackName}:Secrets:PrescribingProxygenProdKid:Arn`
    })
    new CfnOutput(this, "PrescribingProxygenProdPrivateKeyArn", {
      value: getExportValue("secrets:PrescribingProxygenProdPrivateKey", props.environment),
      exportName: `${props.stackName}:Secrets:PrescribingProxygenProdPrivateKey:Arn`
    })
    new CfnOutput(this, "PrescribingProxygenPtlKidArn", {
      value: getExportValue("secrets:PrescribingProxygenPtlKid", props.environment),
      exportName: `${props.stackName}:Secrets:PrescribingProxygenPtlKid:Arn`
    })
    new CfnOutput(this, "PrescribingProxygenPtlPrivateKeyArn", {
      value: getExportValue("secrets:PrescribingProxygenPtlPrivateKey", props.environment),
      exportName: `${props.stackName}:Secrets:PrescribingProxygenPtlPrivateKey:Arn`
    })
    new CfnOutput(this, "PrescriptionsForPatientsProxygenKidArn", {
      value: getExportValue("secrets:PrescriptionsForPatientsProxygenKid", props.environment),
      exportName: `${props.stackName}:Secrets:PrescriptionsForPatientsProxygenKid:Arn`
    })
    new CfnOutput(this, "PrescriptionsForPatientsProxygenPrivateKeyArn", {
      value: getExportValue("secrets:PrescriptionsForPatientsProxygenPrivateKey", props.environment),
      exportName: `${props.stackName}:Secrets:PrescriptionsForPatientsProxygenPrivateKey:Arn`
    })
    new CfnOutput(this, "PrescriptionsForPatientsProxygenProdKidArn", {
      value: getExportValue("secrets:PrescriptionsForPatientsProxygenProdKid", props.environment),
      exportName: `${props.stackName}:Secrets:PrescriptionsForPatientsProxygenProdKid:Arn`
    })
    new CfnOutput(this, "PrescriptionsForPatientsProxygenProdPrivateKeyArn", {
      value: getExportValue("secrets:PrescriptionsForPatientsProxygenProdPrivateKey", props.environment),
      exportName: `${props.stackName}:Secrets:PrescriptionsForPatientsProxygenProdPrivateKey:Arn`
    })
    new CfnOutput(this, "PrescriptionsForPatientsProxygenPtlKidArn", {
      value: getExportValue("secrets:PrescriptionsForPatientsProxygenPtlKid", props.environment),
      exportName: `${props.stackName}:Secrets:PrescriptionsForPatientsProxygenPtlKid:Arn`
    })
    new CfnOutput(this, "PrescriptionsForPatientsProxygenPtlPrivateKeyArn", {
      value: getExportValue("secrets:PrescriptionsForPatientsProxygenPtlPrivateKey", props.environment),
      exportName: `${props.stackName}:Secrets:PrescriptionsForPatientsProxygenPtlPrivateKey:Arn`
    })
    new CfnOutput(this, "ptlPrescriptionSigningPublicKeyArn", {
      value: getExportValue("secrets:ptlPrescriptionSigningPublicKey", props.environment),
      exportName: `${props.stackName}:Secrets:ptlPrescriptionSigningPublicKey:Arn`
    })
    new CfnOutput(this, "ptlPrescriptionSigningPrivateKeyArn", {
      value: getExportValue("secrets:ptlPrescriptionSigningPrivateKey", props.environment),
      exportName: `${props.stackName}:Secrets:ptlPrescriptionSigningPrivateKey:Arn`
    })

    new CfnOutput(this, "AllowCloudFormationSecretsAccessManagedPolicyArn", {
      value: getExportValue("ci-resources:AllowCloudFormationSecretsAccessManagedPolicy", props.environment),
      exportName: `${props.stackName}:Secrets:AllowCloudFormationSecretsAccessManagedPolicy:Arn`
    })
    nagSuppressions(this, "Secrets")
  }
}

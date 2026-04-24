import {
  StackProps,
  Stack,
  App,
  Tags,
  CfnOutput
} from "aws-cdk-lib"
import {RegressionTestSecrets} from "../resources/RegressionTestSecrets"
import {IRole, ManagedPolicy} from "aws-cdk-lib/aws-iam"
import {CfnBucket} from "aws-cdk-lib/aws-s3"
import {nagSuppressions} from "../nagSuppressions"
import {Secret} from "aws-cdk-lib/aws-secretsmanager"
import {getExportValue} from "../resources/ExportMigrations"

export interface SecretsStackProps extends StackProps {
  readonly stackName: string
  readonly version: string
  readonly commitId: string
  readonly environment: string
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

    new CfnOutput(this, "AccessSlackSecretsManagedPolicyArn", {
      value: getExportValue("account-resources:AccessSlackSecretsManagedPolicy", props.environment),
      exportName: `${props.stackName}:IAM:AccessSlackSecretsManagedPolicy:Arn`
    })
    new CfnOutput(this, "AccountResourcesClinicalTrackerCACertSecretMigrationExport", {
      value: getExportValue("account-resources:ClinicalTrackerCACertSecret", props.environment),
      exportName: `${props.stackName}:Secrets:ClinicalTrackerCACertSecret:Arn`
    })
    new CfnOutput(this, "AccountResourcesClinicalTrackerCAKeySecretMigrationExport", {
      value: getExportValue("account-resources:ClinicalTrackerCAKeySecret", props.environment),
      exportName: `${props.stackName}:Secrets:ClinicalTrackerCAKeySecret:Arn`
    })
    new CfnOutput(this, "AccountResourcesClinicalTrackerClientCertSecretMigrationExport", {
      value: getExportValue("account-resources:ClinicalTrackerClientCertSecret", props.environment),
      exportName: `${props.stackName}:Secrets:ClinicalTrackerClientCertSecret:Arn`
    })
    new CfnOutput(this, "AccountResourcesClinicalTrackerClientKeySecretMigrationExport", {
      value: getExportValue("account-resources:ClinicalTrackerClientKeySecret", props.environment),
      exportName: `${props.stackName}:Secrets:ClinicalTrackerClientKeySecret:Arn`
    })

    new CfnOutput(this, "AccountResourcesClinicalTrackerClientSandboxCertSecretMigrationExport", {
      value: getExportValue("account-resources:ClinicalTrackerClientSandboxCertSecret", props.environment),
      exportName: `${props.stackName}:Secrets:ClinicalTrackerClientSandboxCertSecret:Arn`
    })

    new CfnOutput(this, "AccountResourcesClinicalTrackerClientSandboxKeySecretMigrationExport", {
      value: getExportValue("account-resources:ClinicalTrackerClientSandboxKeySecret", props.environment),
      exportName: `${props.stackName}:Secrets:ClinicalTrackerClientSandboxKeySecret:Arn`
    })

    new CfnOutput(this, "AccountResourcesClinicalTrackerProxygenKidMigrationExport", {
      value: getExportValue("account-resources:ClinicalTrackerProxygenKid", props.environment),
      exportName: `${props.stackName}:Secrets:ClinicalTrackerProxygenKid:Arn`
    })

    new CfnOutput(this, "AccountResourcesClinicalTrackerProxygenPrivateKeyMigrationExport", {
      value: getExportValue("account-resources:ClinicalTrackerProxygenPrivateKey", props.environment),
      exportName: `${props.stackName}:Secrets:ClinicalTrackerProxygenPrivateKey:Arn`
    })

    new CfnOutput(this, "AccountResourcesClinicalTrackerProxygenProdKidMigrationExport", {
      value: getExportValue("account-resources:ClinicalTrackerProxygenProdKid", props.environment),
      exportName: `${props.stackName}:Secrets:ClinicalTrackerProxygenProdKid:Arn`
    })

    new CfnOutput(this, "AccountResourcesClinicalTrackerProxygenProdPrivateKeyMigrationExport", {
      value: getExportValue("account-resources:ClinicalTrackerProxygenProdPrivateKey", props.environment),
      exportName: `${props.stackName}:Secrets:ClinicalTrackerProxygenProdPrivateKey:Arn`
    })

    new CfnOutput(this, "AccountResourcesClinicalTrackerProxygenPTLKidMigrationExport", {
      value: getExportValue("account-resources:ClinicalTrackerProxygenPTLKid", props.environment),
      exportName: `${props.stackName}:Secrets:ClinicalTrackerProxygenPTLKid:Arn`
    })

    new CfnOutput(this, "AccountResourcesClinicalTrackerProxygenPTLPrivateKeyMigrationExport", {
      value: getExportValue("account-resources:ClinicalTrackerProxygenPTLPrivateKey", props.environment),
      exportName: `${props.stackName}:Secrets:ClinicalTrackerProxygenPTLPrivateKey:Arn`
    })

    new CfnOutput(this, "AccountResourcesClinicalTrackerProxygenPublicKeyMigrationExport", {
      value: getExportValue("account-resources:ClinicalTrackerProxygenPublicKey", props.environment),
      exportName: `${props.stackName}:Secrets:ClinicalTrackerProxygenPublicKey:Arn`
    })

    new CfnOutput(this, "AccountResourcesCPSUProxygenKidMigrationExport", {
      value: getExportValue("account-resources:CPSUProxygenKid", props.environment),
      exportName: `${props.stackName}:Secrets:CPSUProxygenKid:Arn`
    })

    new CfnOutput(this, "AccountResourcesCPSUProxygenPrivateKeyMigrationExport", {
      value: getExportValue("account-resources:CPSUProxygenPrivateKey", props.environment),
      exportName: `${props.stackName}:Secrets:CPSUProxygenPrivateKey:Arn`
    })

    new CfnOutput(this, "AccountResourcesCPSUProxygenProdKidMigrationExport", {
      value: getExportValue("account-resources:CPSUProxygenProdKid", props.environment),
      exportName: `${props.stackName}:Secrets:CPSUProxygenProdKid:Arn`
    })

    new CfnOutput(this, "AccountResourcesCPSUProxygenProdPrivateKeyMigrationExport", {
      value: getExportValue("account-resources:CPSUProxygenProdPrivateKey", props.environment),
      exportName: `${props.stackName}:Secrets:CPSUProxygenProdPrivateKey:Arn`
    })

    new CfnOutput(this, "AccountResourcesCPSUProxygenPTLKidMigrationExport", {
      value: getExportValue("account-resources:CPSUProxygenPTLKid", props.environment),
      exportName: `${props.stackName}:Secrets:CPSUProxygenPTLKid:Arn`
    })

    new CfnOutput(this, "AccountResourcesCPSUProxygenPTLPrivateKeyMigrationExport", {
      value: getExportValue("account-resources:CPSUProxygenPTLPrivateKey", props.environment),
      exportName: `${props.stackName}:Secrets:CPSUProxygenPTLPrivateKey:Arn`
    })

    new CfnOutput(this, "AccountResourcesCPSUProxygenPublicKeyMigrationExport", {
      value: getExportValue("account-resources:CPSUProxygenPublicKey", props.environment),
      exportName: `${props.stackName}:Secrets:CPSUProxygenPublicKey:Arn`
    })

    new CfnOutput(this, "AccountResourcesFhirFacadeCACertSecretMigrationExport", {
      value: getExportValue("account-resources:FhirFacadeCACertSecret", props.environment),
      exportName: `${props.stackName}:Secrets:FhirFacadeCACertSecret:Arn`
    })

    new CfnOutput(this, "AccountResourcesFhirFacadeCAKeySecretMigrationExport", {
      value: getExportValue("account-resources:FhirFacadeCAKeySecret", props.environment),
      exportName: `${props.stackName}:Secrets:FhirFacadeCAKeySecret:Arn`
    })

    new CfnOutput(this, "AccountResourcesFhirFacadeClientCertSecretMigrationExport", {
      value: getExportValue("account-resources:FhirFacadeClientCertSecret", props.environment),
      exportName: `${props.stackName}:Secrets:FhirFacadeClientCertSecret:Arn`
    })

    new CfnOutput(this, "AccountResourcesFhirFacadeClientKeySecretMigrationExport", {
      value: getExportValue("account-resources:FhirFacadeClientKeySecret", props.environment),
      exportName: `${props.stackName}:Secrets:FhirFacadeClientKeySecret:Arn`
    })

    new CfnOutput(this, "AccountResourcesFhirFacadeClientSandboxCertSecretMigrationExport", {
      value: getExportValue("account-resources:FhirFacadeClientSandboxCertSecret", props.environment),
      exportName: `${props.stackName}:Secrets:FhirFacadeClientSandboxCertSecret:Arn`
    })

    new CfnOutput(this, "AccountResourcesFhirFacadeClientSandboxKeySecretMigrationExport", {
      value: getExportValue("account-resources:FhirFacadeClientSandboxKeySecret", props.environment),
      exportName: `${props.stackName}:Secrets:FhirFacadeClientSandboxKeySecret:Arn`
    })
    new CfnOutput(this, "AccountResourcesLambdaAccessSecretsPolicyMigrationExport", {
      value: getExportValue("account-resources:LambdaAccessSecretsPolicy", props.environment),
      exportName: `${props.stackName}:Secrets:LambdaAccessSecretsPolicy:Arn`
    })
    new CfnOutput(this, "AccountResourcesLambdaDecryptSecretsKMSPolicyMigrationExport", {
      value: getExportValue("account-resources:LambdaDecryptSecretsKMSPolicy", props.environment),
      exportName: `${props.stackName}:Secrets:LambdaDecryptSecretsKMSPolicy:Arn`
    })
    new CfnOutput(this, "AccountResourcesPfpCACertSecretMigrationExport", {
      value: getExportValue("account-resources:PfpCACertSecret", props.environment),
      exportName: `${props.stackName}:Secrets:PfpCACertSecret:Arn`
    })

    new CfnOutput(this, "AccountResourcesPfpClientCertSecretMigrationExport", {
      value: getExportValue("account-resources:PfpClientCertSecret", props.environment),
      exportName: `${props.stackName}:Secrets:PfpClientCertSecret:Arn`
    })

    new CfnOutput(this, "AccountResourcesPfpClientKeySecretMigrationExport", {
      value: getExportValue("account-resources:PfpClientKeySecret", props.environment),
      exportName: `${props.stackName}:Secrets:PfpClientKeySecret:Arn`
    })

    new CfnOutput(this, "AccountResourcesPfpClientSandboxCertSecretMigrationExport", {
      value: getExportValue("account-resources:PfpClientSandboxCertSecret", props.environment),
      exportName: `${props.stackName}:Secrets:PfpClientSandboxCertSecret:Arn`
    })

    new CfnOutput(this, "AccountResourcesPfpClientSandboxKeySecretMigrationExport", {
      value: getExportValue("account-resources:PfpClientSandboxKeySecret", props.environment),
      exportName: `${props.stackName}:Secrets:PfpClientSandboxKeySecret:Arn`
    })

    new CfnOutput(this, "AccountResourcesPsuCACertSecretMigrationExport", {
      value: getExportValue("account-resources:PsuCACertSecret", props.environment),
      exportName: `${props.stackName}:Secrets:PsuCACertSecret:Arn`
    })

    new CfnOutput(this, "AccountResourcesPsuCAKeySecretMigrationExport", {
      value: getExportValue("account-resources:PsuCAKeySecret", props.environment),
      exportName: `${props.stackName}:Secrets:PsuCAKeySecret:Arn`
    })

    new CfnOutput(this, "AccountResourcesPsuClientCertSecretMigrationExport", {
      value: getExportValue("account-resources:PsuClientCertSecret", props.environment),
      exportName: `${props.stackName}:Secrets:PsuClientCertSecret:Arn`
    })

    new CfnOutput(this, "AccountResourcesPsuClientKeySecretMigrationExport", {
      value: getExportValue("account-resources:PsuClientKeySecret", props.environment),
      exportName: `${props.stackName}:Secrets:PsuClientKeySecret:Arn`
    })

    new CfnOutput(this, "AccountResourcesPsuClientSandboxCertSecretMigrationExport", {
      value: getExportValue("account-resources:PsuClientSandboxCertSecret", props.environment),
      exportName: `${props.stackName}:Secrets:PsuClientSandboxCertSecret:Arn`
    })

    new CfnOutput(this, "AccountResourcesPsuClientSandboxKeySecretMigrationExport", {
      value: getExportValue("account-resources:PsuClientSandboxKeySecret", props.environment),
      exportName: `${props.stackName}:Secrets:PsuClientSandboxKeySecret:Arn`
    })

    new CfnOutput(this, "AccountResourcesPSUProxygenKidMigrationExport", {
      value: getExportValue("account-resources:PSUProxygenKid", props.environment),
      exportName: `${props.stackName}:Secrets:PSUProxygenKid:Arn`
    })

    new CfnOutput(this, "AccountResourcesPSUProxygenPrivateKeyMigrationExport", {
      value: getExportValue("account-resources:PSUProxygenPrivateKey", props.environment),
      exportName: `${props.stackName}:Secrets:PSUProxygenPrivateKey:Arn`
    })
    new CfnOutput(this, "AccountResourcesPSUProxygenProdKidMigrationExport", {
      value: getExportValue("account-resources:PSUProxygenProdKid", props.environment),
      exportName: `${props.stackName}:Secrets:PSUProxygenProdKid:Arn`
    })

    new CfnOutput(this, "AccountResourcesPSUProxygenProdPrivateKeyMigrationExport", {
      value: getExportValue("account-resources:PSUProxygenProdPrivateKey", props.environment),
      exportName: `${props.stackName}:Secrets:PSUProxygenProdPrivateKey:Arn`
    })

    new CfnOutput(this, "AccountResourcesPSUProxygenPTLKidMigrationExport", {
      value: getExportValue("account-resources:PSUProxygenPTLKid", props.environment),
      exportName: `${props.stackName}:Secrets:PSUProxygenPTLKid:Arn`
    })

    new CfnOutput(this, "AccountResourcesPSUProxygenPTLPrivateKeyMigrationExport", {
      value: getExportValue("account-resources:PSUProxygenPTLPrivateKey", props.environment),
      exportName: `${props.stackName}:Secrets:PSUProxygenPTLPrivateKey:Arn`
    })

    new CfnOutput(this, "AccountResourcesPSUProxygenPublicKeyMigrationExport", {
      value: getExportValue("account-resources:PSUProxygenPublicKey", props.environment),
      exportName: `${props.stackName}:Secrets:PSUProxygenPublicKey:Arn`
    })
    new CfnOutput(this, "AccountResourcesSecretsKMSKeyAliasMigrationExport", {
      value: getExportValue("account-resources:SecretsKMSKeyAlias", props.environment),
      exportName: `${props.stackName}:Secrets:SecretsKMSKeyAlias:Arn`
    })
    new CfnOutput(this, "AccountResourcesServiceSearchApiKeyMigrationExport", {
      value: getExportValue("account-resources:ServiceSearchApiKey", props.environment),
      exportName: `${props.stackName}:Secrets:ServiceSearchApiKey:Arn`
    })
    new CfnOutput(this, "AccountResourcesSpineASIDMigrationExport", {
      value: getExportValue("account-resources:SpineASID", props.environment),
      exportName: `${props.stackName}:Secrets:SpineASID:Arn`
    })

    new CfnOutput(this, "AccountResourcesSpineCAChainMigrationExport", {
      value: getExportValue("account-resources:SpineCAChain", props.environment),
      exportName: `${props.stackName}:Secrets:SpineCAChain:Arn`
    })

    new CfnOutput(this, "AccountResourcesSpinePartyKeyMigrationExport", {
      value: getExportValue("account-resources:SpinePartyKey", props.environment),
      exportName: `${props.stackName}:Secrets:SpinePartyKey:Arn`
    })

    new CfnOutput(this, "AccountResourcesSpinePrivateKeyMigrationExport", {
      value: getExportValue("account-resources:SpinePrivateKey", props.environment),
      exportName: `${props.stackName}:Secrets:SpinePrivateKey:Arn`
    })

    new CfnOutput(this, "AccountResourcesSpinePublicCertificateMigrationExport", {
      value: getExportValue("account-resources:SpinePublicCertificate", props.environment),
      exportName: `${props.stackName}:Secrets:SpinePublicCertificate:Arn`
    })
    new CfnOutput(this, "SecretsDispensingProxygenProdKidMigrationExport", {
      value: getExportValue("secrets:DispensingProxygenProdKid", props.environment),
      exportName: `${props.stackName}:Secrets:DispensingProxygenProdKid:Arn`
    })

    new CfnOutput(this, "SecretsDispensingProxygenProdPrivateKeyMigrationExport", {
      value: getExportValue("secrets:DispensingProxygenProdPrivateKey", props.environment),
      exportName: `${props.stackName}:Secrets:DispensingProxygenProdPrivateKey:Arn`
    })

    new CfnOutput(this, "SecretsDispensingProxygenPtlKidMigrationExport", {
      value: getExportValue("secrets:DispensingProxygenPtlKid", props.environment),
      exportName: `${props.stackName}:Secrets:DispensingProxygenPtlKid:Arn`
    })

    new CfnOutput(this, "SecretsDispensingProxygenPtlPrivateKeyMigrationExport", {
      value: getExportValue("secrets:DispensingProxygenPtlPrivateKey", props.environment),
      exportName: `${props.stackName}:Secrets:DispensingProxygenPtlPrivateKey:Arn`
    })

    new CfnOutput(this, "SecretsEpsSigningCertChainMigrationExport", {
      value: getExportValue("secrets:epsSigningCertChain", props.environment),
      exportName: `${props.stackName}:Secrets:epsSigningCertChain:Arn`
    })

    new CfnOutput(this, "SecretsEpsSigningCertChainManagedPolicyMigrationExport", {
      value: getExportValue("secrets:epsSigningCertChainManagedPolicy", props.environment),
      exportName: `${props.stackName}:Secrets:epsSigningCertChainManagedPolicy:Arn`
    })

    new CfnOutput(this, "SecretsFhirDispensingProxygenKidMigrationExport", {
      value: getExportValue("secrets:FhirDispensingProxygenKid", props.environment),
      exportName: `${props.stackName}:Secrets:FhirDispensingProxygenKid:Arn`
    })

    new CfnOutput(this, "SecretsFhirDispensingProxygenPrivateKeyMigrationExport", {
      value: getExportValue("secrets:FhirDispensingProxygenPrivateKey", props.environment),
      exportName: `${props.stackName}:Secrets:FhirDispensingProxygenPrivateKey:Arn`
    })

    new CfnOutput(this, "SecretsFhirPrescribingProxygenKidMigrationExport", {
      value: getExportValue("secrets:FhirPrescribingProxygenKid", props.environment),
      exportName: `${props.stackName}:Secrets:FhirPrescribingProxygenKid:Arn`
    })
    new CfnOutput(this, "SecretsFhirPrescribingProxygenPrivateKeyMigrationExport", {
      value: getExportValue("secrets:FhirPrescribingProxygenPrivateKey", props.environment),
      exportName: `${props.stackName}:Secrets:FhirPrescribingProxygenPrivateKey:Arn`
    })

    new CfnOutput(this, "SecretsPrescribingProxygenProdKidMigrationExport", {
      value: getExportValue("secrets:PrescribingProxygenProdKid", props.environment),
      exportName: `${props.stackName}:Secrets:PrescribingProxygenProdKid:Arn`
    })

    new CfnOutput(this, "SecretsPrescribingProxygenProdPrivateKeyMigrationExport", {
      value: getExportValue("secrets:PrescribingProxygenProdPrivateKey", props.environment),
      exportName: `${props.stackName}:Secrets:PrescribingProxygenProdPrivateKey:Arn`
    })

    new CfnOutput(this, "SecretsPrescribingProxygenPtlKidMigrationExport", {
      value: getExportValue("secrets:PrescribingProxygenPtlKid", props.environment),
      exportName: `${props.stackName}:Secrets:PrescribingProxygenPtlKid:Arn`
    })

    new CfnOutput(this, "SecretsPrescribingProxygenPtlPrivateKeyMigrationExport", {
      value: getExportValue("secrets:PrescribingProxygenPtlPrivateKey", props.environment),
      exportName: `${props.stackName}:Secrets:PrescribingProxygenPtlPrivateKey:Arn`
    })
    new CfnOutput(this, "SecretsPrescriptionsForPatientsProxygenKidMigrationExport", {
      value: getExportValue("secrets:PrescriptionsForPatientsProxygenKid", props.environment),
      exportName: `${props.stackName}:Secrets:PrescriptionsForPatientsProxygenKid:Arn`
    })

    new CfnOutput(this, "SecretsPrescriptionsForPatientsProxygenPrivateKeyMigrationExport", {
      value: getExportValue("secrets:PrescriptionsForPatientsProxygenPrivateKey", props.environment),
      exportName: `${props.stackName}:Secrets:PrescriptionsForPatientsProxygenPrivateKey:Arn`
    })

    new CfnOutput(this, "SecretsPrescriptionsForPatientsProxygenProdKidMigrationExport", {
      value: getExportValue("secrets:PrescriptionsForPatientsProxygenProdKid", props.environment),
      exportName: `${props.stackName}:Secrets:PrescriptionsForPatientsProxygenProdKid:Arn`
    })

    new CfnOutput(this, "SecretsPrescriptionsForPatientsProxygenProdPrivateKeyMigrationExport", {
      value: getExportValue("secrets:PrescriptionsForPatientsProxygenProdPrivateKey", props.environment),
      exportName: `${props.stackName}:Secrets:PrescriptionsForPatientsProxygenProdPrivateKey:Arn`
    })

    new CfnOutput(this, "SecretsPrescriptionsForPatientsProxygenPtlKidMigrationExport", {
      value: getExportValue("secrets:PrescriptionsForPatientsProxygenPtlKid", props.environment),
      exportName: `${props.stackName}:Secrets:PrescriptionsForPatientsProxygenPtlKid:Arn`
    })

    new CfnOutput(this, "SecretsPrescriptionsForPatientsProxygenPtlPrivateKeyMigrationExport", {
      value: getExportValue("secrets:PrescriptionsForPatientsProxygenPtlPrivateKey", props.environment),
      exportName: `${props.stackName}:Secrets:PrescriptionsForPatientsProxygenPtlPrivateKey:Arn`
    })

    new CfnOutput(this, "SecretsPtlPrescriptionSigningPublicKeyMigrationExport", {
      value: getExportValue("secrets:ptlPrescriptionSigningPublicKey", props.environment),
      exportName: `${props.stackName}:Secrets:ptlPrescriptionSigningPublicKey:Arn`
    })

    nagSuppressions(this, "Secrets")
  }
}

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
      exportName: `${props.stackName}:ManagedPolicy:AccessSlackSecretsManagedPolicy:Arn`
    })
    new CfnOutput(this, "AccountResourcesClinicalTrackerCACertSecretMigrationExport", {
      value: getExportValue("account-resources:ClinicalTrackerCACertSecret", props.environment),
      exportName: "account-resources:ClinicalTrackerCACertSecret"
    })
    new CfnOutput(this, "AccountResourcesClinicalTrackerCAKeySecretMigrationExport", {
      value: getExportValue("account-resources:ClinicalTrackerCAKeySecret", props.environment),
      exportName: "account-resources:ClinicalTrackerCAKeySecret"
    })
    new CfnOutput(this, "AccountResourcesClinicalTrackerClientCertSecretMigrationExport", {
      value: getExportValue("account-resources:ClinicalTrackerClientCertSecret", props.environment),
      exportName: "account-resources:ClinicalTrackerClientCertSecret"
    })
    new CfnOutput(this, "AccountResourcesClinicalTrackerClientKeySecretMigrationExport", {
      value: getExportValue("account-resources:ClinicalTrackerClientKeySecret", props.environment),
      exportName: "account-resources:ClinicalTrackerClientKeySecret"
    })

    new CfnOutput(this, "AccountResourcesClinicalTrackerClientSandboxCertSecretMigrationExport", {
      value: getExportValue("account-resources:ClinicalTrackerClientSandboxCertSecret", props.environment),
      exportName: "account-resources:ClinicalTrackerClientSandboxCertSecret"
    })

    new CfnOutput(this, "AccountResourcesClinicalTrackerClientSandboxKeySecretMigrationExport", {
      value: getExportValue("account-resources:ClinicalTrackerClientSandboxKeySecret", props.environment),
      exportName: "account-resources:ClinicalTrackerClientSandboxKeySecret"
    })

    new CfnOutput(this, "AccountResourcesClinicalTrackerProxygenKidMigrationExport", {
      value: getExportValue("account-resources:ClinicalTrackerProxygenKid", props.environment),
      exportName: "account-resources:ClinicalTrackerProxygenKid"
    })

    new CfnOutput(this, "AccountResourcesClinicalTrackerProxygenPrivateKeyMigrationExport", {
      value: getExportValue("account-resources:ClinicalTrackerProxygenPrivateKey", props.environment),
      exportName: "account-resources:ClinicalTrackerProxygenPrivateKey"
    })

    new CfnOutput(this, "AccountResourcesClinicalTrackerProxygenProdKidMigrationExport", {
      value: getExportValue("account-resources:ClinicalTrackerProxygenProdKid", props.environment),
      exportName: "account-resources:ClinicalTrackerProxygenProdKid"
    })

    new CfnOutput(this, "AccountResourcesClinicalTrackerProxygenProdPrivateKeyMigrationExport", {
      value: getExportValue("account-resources:ClinicalTrackerProxygenProdPrivateKey", props.environment),
      exportName: "account-resources:ClinicalTrackerProxygenProdPrivateKey"
    })

    new CfnOutput(this, "AccountResourcesClinicalTrackerProxygenPTLKidMigrationExport", {
      value: getExportValue("account-resources:ClinicalTrackerProxygenPTLKid", props.environment),
      exportName: "account-resources:ClinicalTrackerProxygenPTLKid"
    })

    new CfnOutput(this, "AccountResourcesClinicalTrackerProxygenPTLPrivateKeyMigrationExport", {
      value: getExportValue("account-resources:ClinicalTrackerProxygenPTLPrivateKey", props.environment),
      exportName: "account-resources:ClinicalTrackerProxygenPTLPrivateKey"
    })

    new CfnOutput(this, "AccountResourcesClinicalTrackerProxygenPublicKeyMigrationExport", {
      value: getExportValue("account-resources:ClinicalTrackerProxygenPublicKey", props.environment),
      exportName: "account-resources:ClinicalTrackerProxygenPublicKey"
    })

    new CfnOutput(this, "AccountResourcesCPSUProxygenKidMigrationExport", {
      value: getExportValue("account-resources:CPSUProxygenKid", props.environment),
      exportName: "account-resources:CPSUProxygenKid"
    })

    new CfnOutput(this, "AccountResourcesCPSUProxygenPrivateKeyMigrationExport", {
      value: getExportValue("account-resources:CPSUProxygenPrivateKey", props.environment),
      exportName: "account-resources:CPSUProxygenPrivateKey"
    })

    new CfnOutput(this, "AccountResourcesCPSUProxygenProdKidMigrationExport", {
      value: getExportValue("account-resources:CPSUProxygenProdKid", props.environment),
      exportName: "account-resources:CPSUProxygenProdKid"
    })

    new CfnOutput(this, "AccountResourcesCPSUProxygenProdPrivateKeyMigrationExport", {
      value: getExportValue("account-resources:CPSUProxygenProdPrivateKey", props.environment),
      exportName: "account-resources:CPSUProxygenProdPrivateKey"
    })

    new CfnOutput(this, "AccountResourcesCPSUProxygenPTLKidMigrationExport", {
      value: getExportValue("account-resources:CPSUProxygenPTLKid", props.environment),
      exportName: "account-resources:CPSUProxygenPTLKid"
    })

    new CfnOutput(this, "AccountResourcesCPSUProxygenPTLPrivateKeyMigrationExport", {
      value: getExportValue("account-resources:CPSUProxygenPTLPrivateKey", props.environment),
      exportName: "account-resources:CPSUProxygenPTLPrivateKey"
    })

    new CfnOutput(this, "AccountResourcesCPSUProxygenPublicKeyMigrationExport", {
      value: getExportValue("account-resources:CPSUProxygenPublicKey", props.environment),
      exportName: "account-resources:CPSUProxygenPublicKey"
    })

    new CfnOutput(this, "AccountResourcesFhirFacadeCACertSecretMigrationExport", {
      value: getExportValue("account-resources:FhirFacadeCACertSecret", props.environment),
      exportName: "account-resources:FhirFacadeCACertSecret"
    })

    new CfnOutput(this, "AccountResourcesFhirFacadeCAKeySecretMigrationExport", {
      value: getExportValue("account-resources:FhirFacadeCAKeySecret", props.environment),
      exportName: "account-resources:FhirFacadeCAKeySecret"
    })

    new CfnOutput(this, "AccountResourcesFhirFacadeClientCertSecretMigrationExport", {
      value: getExportValue("account-resources:FhirFacadeClientCertSecret", props.environment),
      exportName: "account-resources:FhirFacadeClientCertSecret"
    })

    new CfnOutput(this, "AccountResourcesFhirFacadeClientKeySecretMigrationExport", {
      value: getExportValue("account-resources:FhirFacadeClientKeySecret", props.environment),
      exportName: "account-resources:FhirFacadeClientKeySecret"
    })

    new CfnOutput(this, "AccountResourcesFhirFacadeClientSandboxCertSecretMigrationExport", {
      value: getExportValue("account-resources:FhirFacadeClientSandboxCertSecret", props.environment),
      exportName: "account-resources:FhirFacadeClientSandboxCertSecret"
    })

    new CfnOutput(this, "AccountResourcesFhirFacadeClientSandboxKeySecretMigrationExport", {
      value: getExportValue("account-resources:FhirFacadeClientSandboxKeySecret", props.environment),
      exportName: "account-resources:FhirFacadeClientSandboxKeySecret"
    })
    new CfnOutput(this, "AccountResourcesLambdaAccessSecretsPolicyMigrationExport", {
      value: getExportValue("account-resources:LambdaAccessSecretsPolicy", props.environment),
      exportName: "account-resources:LambdaAccessSecretsPolicy"
    })
    new CfnOutput(this, "AccountResourcesLambdaDecryptSecretsKMSPolicyMigrationExport", {
      value: getExportValue("account-resources:LambdaDecryptSecretsKMSPolicy", props.environment),
      exportName: "account-resources:LambdaDecryptSecretsKMSPolicy"
    })
    new CfnOutput(this, "AccountResourcesPfpCACertSecretMigrationExport", {
      value: getExportValue("account-resources:PfpCACertSecret", props.environment),
      exportName: "account-resources:PfpCACertSecret"
    })

    new CfnOutput(this, "AccountResourcesPfpClientCertSecretMigrationExport", {
      value: getExportValue("account-resources:PfpClientCertSecret", props.environment),
      exportName: "account-resources:PfpClientCertSecret"
    })

    new CfnOutput(this, "AccountResourcesPfpClientKeySecretMigrationExport", {
      value: getExportValue("account-resources:PfpClientKeySecret", props.environment),
      exportName: "account-resources:PfpClientKeySecret"
    })

    new CfnOutput(this, "AccountResourcesPfpClientSandboxCertSecretMigrationExport", {
      value: getExportValue("account-resources:PfpClientSandboxCertSecret", props.environment),
      exportName: "account-resources:PfpClientSandboxCertSecret"
    })

    new CfnOutput(this, "AccountResourcesPfpClientSandboxKeySecretMigrationExport", {
      value: getExportValue("account-resources:PfpClientSandboxKeySecret", props.environment),
      exportName: "account-resources:PfpClientSandboxKeySecret"
    })

    new CfnOutput(this, "AccountResourcesPsuCACertSecretMigrationExport", {
      value: getExportValue("account-resources:PsuCACertSecret", props.environment),
      exportName: "account-resources:PsuCACertSecret"
    })

    new CfnOutput(this, "AccountResourcesPsuCAKeySecretMigrationExport", {
      value: getExportValue("account-resources:PsuCAKeySecret", props.environment),
      exportName: "account-resources:PsuCAKeySecret"
    })

    new CfnOutput(this, "AccountResourcesPsuClientCertSecretMigrationExport", {
      value: getExportValue("account-resources:PsuClientCertSecret", props.environment),
      exportName: "account-resources:PsuClientCertSecret"
    })

    new CfnOutput(this, "AccountResourcesPsuClientKeySecretMigrationExport", {
      value: getExportValue("account-resources:PsuClientKeySecret", props.environment),
      exportName: "account-resources:PsuClientKeySecret"
    })

    new CfnOutput(this, "AccountResourcesPsuClientSandboxCertSecretMigrationExport", {
      value: getExportValue("account-resources:PsuClientSandboxCertSecret", props.environment),
      exportName: "account-resources:PsuClientSandboxCertSecret"
    })

    new CfnOutput(this, "AccountResourcesPsuClientSandboxKeySecretMigrationExport", {
      value: getExportValue("account-resources:PsuClientSandboxKeySecret", props.environment),
      exportName: "account-resources:PsuClientSandboxKeySecret"
    })

    new CfnOutput(this, "AccountResourcesPSUProxygenKidMigrationExport", {
      value: getExportValue("account-resources:PSUProxygenKid", props.environment),
      exportName: "account-resources:PSUProxygenKid"
    })

    new CfnOutput(this, "AccountResourcesPSUProxygenPrivateKeyMigrationExport", {
      value: getExportValue("account-resources:PSUProxygenPrivateKey", props.environment),
      exportName: "account-resources:PSUProxygenPrivateKey"
    })
    new CfnOutput(this, "AccountResourcesPSUProxygenProdKidMigrationExport", {
      value: getExportValue("account-resources:PSUProxygenProdKid", props.environment),
      exportName: "account-resources:PSUProxygenProdKid"
    })

    new CfnOutput(this, "AccountResourcesPSUProxygenProdPrivateKeyMigrationExport", {
      value: getExportValue("account-resources:PSUProxygenProdPrivateKey", props.environment),
      exportName: "account-resources:PSUProxygenProdPrivateKey"
    })

    new CfnOutput(this, "AccountResourcesPSUProxygenPTLKidMigrationExport", {
      value: getExportValue("account-resources:PSUProxygenPTLKid", props.environment),
      exportName: "account-resources:PSUProxygenPTLKid"
    })

    new CfnOutput(this, "AccountResourcesPSUProxygenPTLPrivateKeyMigrationExport", {
      value: getExportValue("account-resources:PSUProxygenPTLPrivateKey", props.environment),
      exportName: "account-resources:PSUProxygenPTLPrivateKey"
    })

    new CfnOutput(this, "AccountResourcesPSUProxygenPublicKeyMigrationExport", {
      value: getExportValue("account-resources:PSUProxygenPublicKey", props.environment),
      exportName: "account-resources:PSUProxygenPublicKey"
    })
    new CfnOutput(this, "AccountResourcesSecretsKMSKeyAliasMigrationExport", {
      value: getExportValue("account-resources:SecretsKMSKeyAlias", props.environment),
      exportName: "account-resources:SecretsKMSKeyAlias"
    })
    new CfnOutput(this, "AccountResourcesServiceSearchApiKeyMigrationExport", {
      value: getExportValue("account-resources:ServiceSearchApiKey", props.environment),
      exportName: "account-resources:ServiceSearchApiKey"
    })
    new CfnOutput(this, "AccountResourcesSpineASIDMigrationExport", {
      value: getExportValue("account-resources:SpineASID", props.environment),
      exportName: "account-resources:SpineASID"
    })

    new CfnOutput(this, "AccountResourcesSpineCAChainMigrationExport", {
      value: getExportValue("account-resources:SpineCAChain", props.environment),
      exportName: "account-resources:SpineCAChain"
    })

    new CfnOutput(this, "AccountResourcesSpinePartyKeyMigrationExport", {
      value: getExportValue("account-resources:SpinePartyKey", props.environment),
      exportName: "account-resources:SpinePartyKey"
    })

    new CfnOutput(this, "AccountResourcesSpinePrivateKeyMigrationExport", {
      value: getExportValue("account-resources:SpinePrivateKey", props.environment),
      exportName: "account-resources:SpinePrivateKey"
    })

    new CfnOutput(this, "AccountResourcesSpinePublicCertificateMigrationExport", {
      value: getExportValue("account-resources:SpinePublicCertificate", props.environment),
      exportName: "account-resources:SpinePublicCertificate"
    })
    new CfnOutput(this, "SecretsDispensingProxygenProdKidMigrationExport", {
      value: getExportValue("secrets:DispensingProxygenProdKid", props.environment),
      exportName: "secrets:DispensingProxygenProdKid"
    })

    new CfnOutput(this, "SecretsDispensingProxygenProdPrivateKeyMigrationExport", {
      value: getExportValue("secrets:DispensingProxygenProdPrivateKey", props.environment),
      exportName: "secrets:DispensingProxygenProdPrivateKey"
    })

    new CfnOutput(this, "SecretsDispensingProxygenPtlKidMigrationExport", {
      value: getExportValue("secrets:DispensingProxygenPtlKid", props.environment),
      exportName: "secrets:DispensingProxygenPtlKid"
    })

    new CfnOutput(this, "SecretsDispensingProxygenPtlPrivateKeyMigrationExport", {
      value: getExportValue("secrets:DispensingProxygenPtlPrivateKey", props.environment),
      exportName: "secrets:DispensingProxygenPtlPrivateKey"
    })

    new CfnOutput(this, "SecretsEpsSigningCertChainMigrationExport", {
      value: getExportValue("secrets:epsSigningCertChain", props.environment),
      exportName: "secrets:epsSigningCertChain"
    })

    new CfnOutput(this, "SecretsEpsSigningCertChainManagedPolicyMigrationExport", {
      value: getExportValue("secrets:epsSigningCertChainManagedPolicy", props.environment),
      exportName: "secrets:epsSigningCertChainManagedPolicy"
    })

    new CfnOutput(this, "SecretsFhirDispensingProxygenKidMigrationExport", {
      value: getExportValue("secrets:FhirDispensingProxygenKid", props.environment),
      exportName: "secrets:FhirDispensingProxygenKid"
    })

    new CfnOutput(this, "SecretsFhirDispensingProxygenPrivateKeyMigrationExport", {
      value: getExportValue("secrets:FhirDispensingProxygenPrivateKey", props.environment),
      exportName: "secrets:FhirDispensingProxygenPrivateKey"
    })

    new CfnOutput(this, "SecretsFhirPrescribingProxygenKidMigrationExport", {
      value: getExportValue("secrets:FhirPrescribingProxygenKid", props.environment),
      exportName: "secrets:FhirPrescribingProxygenKid"
    })
    new CfnOutput(this, "SecretsFhirPrescribingProxygenPrivateKeyMigrationExport", {
      value: getExportValue("secrets:FhirPrescribingProxygenPrivateKey", props.environment),
      exportName: "secrets:FhirPrescribingProxygenPrivateKey"
    })

    new CfnOutput(this, "SecretsPrescribingProxygenProdKidMigrationExport", {
      value: getExportValue("secrets:PrescribingProxygenProdKid", props.environment),
      exportName: "secrets:PrescribingProxygenProdKid"
    })

    new CfnOutput(this, "SecretsPrescribingProxygenProdPrivateKeyMigrationExport", {
      value: getExportValue("secrets:PrescribingProxygenProdPrivateKey", props.environment),
      exportName: "secrets:PrescribingProxygenProdPrivateKey"
    })

    new CfnOutput(this, "SecretsPrescribingProxygenPtlKidMigrationExport", {
      value: getExportValue("secrets:PrescribingProxygenPtlKid", props.environment),
      exportName: "secrets:PrescribingProxygenPtlKid"
    })

    new CfnOutput(this, "SecretsPrescribingProxygenPtlPrivateKeyMigrationExport", {
      value: getExportValue("secrets:PrescribingProxygenPtlPrivateKey", props.environment),
      exportName: "secrets:PrescribingProxygenPtlPrivateKey"
    })
    new CfnOutput(this, "SecretsPrescriptionsForPatientsProxygenKidMigrationExport", {
      value: getExportValue("secrets:PrescriptionsForPatientsProxygenKid", props.environment),
      exportName: "secrets:PrescriptionsForPatientsProxygenKid"
    })

    new CfnOutput(this, "SecretsPrescriptionsForPatientsProxygenPrivateKeyMigrationExport", {
      value: getExportValue("secrets:PrescriptionsForPatientsProxygenPrivateKey", props.environment),
      exportName: "secrets:PrescriptionsForPatientsProxygenPrivateKey"
    })

    new CfnOutput(this, "SecretsPrescriptionsForPatientsProxygenProdKidMigrationExport", {
      value: getExportValue("secrets:PrescriptionsForPatientsProxygenProdKid", props.environment),
      exportName: "secrets:PrescriptionsForPatientsProxygenProdKid"
    })

    new CfnOutput(this, "SecretsPrescriptionsForPatientsProxygenProdPrivateKeyMigrationExport", {
      value: getExportValue("secrets:PrescriptionsForPatientsProxygenProdPrivateKey", props.environment),
      exportName: "secrets:PrescriptionsForPatientsProxygenProdPrivateKey"
    })

    new CfnOutput(this, "SecretsPrescriptionsForPatientsProxygenPtlKidMigrationExport", {
      value: getExportValue("secrets:PrescriptionsForPatientsProxygenPtlKid", props.environment),
      exportName: "secrets:PrescriptionsForPatientsProxygenPtlKid"
    })

    new CfnOutput(this, "SecretsPrescriptionsForPatientsProxygenPtlPrivateKeyMigrationExport", {
      value: getExportValue("secrets:PrescriptionsForPatientsProxygenPtlPrivateKey", props.environment),
      exportName: "secrets:PrescriptionsForPatientsProxygenPtlPrivateKey"
    })

    new CfnOutput(this, "SecretsPtlPrescriptionSigningPublicKeyMigrationExport", {
      value: getExportValue("secrets:ptlPrescriptionSigningPublicKey", props.environment),
      exportName: "secrets:ptlPrescriptionSigningPublicKey"
    })

    nagSuppressions(this, "Secrets")
  }
}

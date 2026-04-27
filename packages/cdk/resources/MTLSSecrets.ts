
import {IKey} from "aws-cdk-lib/aws-kms"
import {Construct} from "constructs"
import {StaticSecret} from "../constructs/StaticSecret"
import {Secret} from "aws-cdk-lib/aws-secretsmanager"

export interface MTLSSecretsProps {
  readonly stackName: string
  readonly MTLSSecretsKmsKey: IKey
}
export class MTLSSecrets extends Construct {
  public readonly pfpCAKey: Secret
  public readonly pfpCACert: Secret
  public readonly pfpClientKey: Secret
  public readonly pfpClientCert: Secret
  public readonly pfpClientSandboxKey: Secret
  public readonly pfpClientSandboxCert: Secret

  public readonly psuCAKey: Secret
  public readonly psuCACert: Secret
  public readonly psuClientKey: Secret
  public readonly psuClientCert: Secret
  public readonly psuClientSandboxKey: Secret
  public readonly psuClientSandboxCert: Secret

  public readonly clinicalTrackerCAKey: Secret
  public readonly clinicalTrackerCACert: Secret
  public readonly clinicalTrackerClientKey: Secret
  public readonly clinicalTrackerClientCert: Secret
  public readonly clinicalTrackerClientSandboxKey: Secret
  public readonly clinicalTrackerClientSandboxCert: Secret

  public readonly fhirFacadeCAKey: Secret
  public readonly fhirFacadeCACert: Secret
  public readonly fhirFacadeClientKey: Secret
  public readonly fhirFacadeClientCert: Secret
  public readonly fhirFacadeClientSandboxKey: Secret
  public readonly fhirFacadeClientSandboxCert: Secret

  public constructor(scope: Construct, id: string, props: MTLSSecretsProps){
    super(scope, id)

    const clinicalTrackerCACert = new StaticSecret(this, "ClinicalTrackerCACert", {
      secretName:  `${props.stackName}-ClinicalTrackerCACert`,
      description: "Clinical tracker CA certificate",
      encryptionKey: props.MTLSSecretsKmsKey
    })
    const clinicalTrackerCAKey = new StaticSecret(this, "ClinicalTrackerCAKey", {
      secretName:  `${props.stackName}-ClinicalTrackerCAKey`,
      description: "Clinical tracker CA key",
      encryptionKey: props.MTLSSecretsKmsKey
    })
    const clinicalTrackerClientCert = new StaticSecret(this, "ClinicalTrackerClientCert", {
      secretName:  `${props.stackName}-ClinicalTrackerClientCert`,
      description: "Clinical tracker client certificate",
      encryptionKey: props.MTLSSecretsKmsKey
    })
    const clinicalTrackerClientKey = new StaticSecret(this, "ClinicalTrackerClientKey", {
      secretName:  `${props.stackName}-ClinicalTrackerClientKey`,
      description: "Clinical tracker client key",
      encryptionKey: props.MTLSSecretsKmsKey
    })
    const clinicalTrackerClientSandboxCert = new StaticSecret(this, "ClinicalTrackerClientSandboxCert", {
      secretName:  `${props.stackName}-ClinicalTrackerClientSandboxCert`,
      description: "Clinical tracker sandbox client certificate",
      encryptionKey: props.MTLSSecretsKmsKey
    })
    const clinicalTrackerClientSandboxKey = new StaticSecret(this, "ClinicalTrackerClientSandboxKey", {
      secretName:  `${props.stackName}-ClinicalTrackerClientSandboxKey`,
      description: "Clinical tracker sandbox client key",
      encryptionKey: props.MTLSSecretsKmsKey
    })
    const fhirFacadeCACert = new StaticSecret(this, "FhirFacadeCACert", {
      secretName:  `${props.stackName}-FhirFacadeCACert`,
      description: "FHIR facade CA certificate",
      encryptionKey: props.MTLSSecretsKmsKey
    })
    const fhirFacadeCAKey = new StaticSecret(this, "FhirFacadeCAKey", {
      secretName:  `${props.stackName}-FhirFacadeCAKey`,
      description: "FHIR facade CA key",
      encryptionKey: props.MTLSSecretsKmsKey
    })
    const fhirFacadeClientCert = new StaticSecret(this, "FhirFacadeClientCert", {
      secretName:  `${props.stackName}-FhirFacadeClientCert`,
      description: "FHIR facade client certificate",
      encryptionKey: props.MTLSSecretsKmsKey
    })
    const fhirFacadeClientKey = new StaticSecret(this, "FhirFacadeClientKey", {
      secretName:  `${props.stackName}-FhirFacadeClientKey`,
      description: "FHIR facade client key",
      encryptionKey: props.MTLSSecretsKmsKey
    })
    const fhirFacadeClientSandboxCert = new StaticSecret(this, "FhirFacadeClientSandboxCert", {
      secretName:  `${props.stackName}-FhirFacadeClientSandboxCert`,
      description: "FHIR facade sandbox client certificate",
      encryptionKey: props.MTLSSecretsKmsKey
    })
    const fhirFacadeClientSandboxKey = new StaticSecret(this, "FhirFacadeClientSandboxKey", {
      secretName:  `${props.stackName}-FhirFacadeClientSandboxKey`,
      description: "FHIR facade sandbox client key",
      encryptionKey: props.MTLSSecretsKmsKey
    })

    const pfpCACert = new StaticSecret(this, "PfpCACert", {
      secretName:  `${props.stackName}-PfpCACert`,
      description: "PFP CA certificate",
      encryptionKey: props.MTLSSecretsKmsKey
    })
    const pfpCAKey = new StaticSecret(this, "PfpCAKey", {
      secretName:  `${props.stackName}-PfpCAKey`,
      description: "PFP CA key",
      encryptionKey: props.MTLSSecretsKmsKey
    })
    const pfpClientCert = new StaticSecret(this, "PfpClientCert", {
      secretName:  `${props.stackName}-PfpClientCert`,
      description: "PFP client certificate",
      encryptionKey: props.MTLSSecretsKmsKey
    })
    const pfpClientKey = new StaticSecret(this, "PfpClientKey", {
      secretName:  `${props.stackName}-PfpClientKey`,
      description: "PFP client key",
      encryptionKey: props.MTLSSecretsKmsKey
    })
    const pfpClientSandboxCert = new StaticSecret(this, "PfpClientSandboxCert", {
      secretName:  `${props.stackName}-PfpClientSandboxCert`,
      description: "PFP sandbox client certificate",
      encryptionKey: props.MTLSSecretsKmsKey
    })
    const pfpClientSandboxKey = new StaticSecret(this, "PfpClientSandboxKey", {
      secretName:  `${props.stackName}-PfpClientSandboxKey`,
      description: "PFP sandbox client key",
      encryptionKey: props.MTLSSecretsKmsKey
    })

    const psuCACert = new StaticSecret(this, "PSUCACert", {
      secretName:  `${props.stackName}-PSUCACert`,
      description: "PSU CA certificate",
      encryptionKey: props.MTLSSecretsKmsKey
    })
    const psuCAKey = new StaticSecret(this, "PSUCAKey", {
      secretName:  `${props.stackName}-PSUCAKey`,
      description: "PSU CA key",
      encryptionKey: props.MTLSSecretsKmsKey
    })
    const psuClientCert = new StaticSecret(this, "PSUClientCert", {
      secretName:  `${props.stackName}-PSUClientCert`,
      description: "PSU client certificate",
      encryptionKey: props.MTLSSecretsKmsKey
    })
    const psuClientKey = new StaticSecret(this, "PSUClientKey", {
      secretName:  `${props.stackName}-PSUClientKey`,
      description: "PSU client key",
      encryptionKey: props.MTLSSecretsKmsKey
    })
    const psuClientSandboxCert = new StaticSecret(this, "PSUClientSandboxCert", {
      secretName:  `${props.stackName}-PSUClientSandboxCert`,
      description: "PSU sandbox client certificate",
      encryptionKey: props.MTLSSecretsKmsKey
    })
    const psuClientSandboxKey = new StaticSecret(this, "PSUClientSandboxKey", {
      secretName:  `${props.stackName}-PSUClientSandboxKey`,
      description: "PSU sandbox client key",
      encryptionKey: props.MTLSSecretsKmsKey
    })

    this.clinicalTrackerCACert = clinicalTrackerCACert.secret
    this.clinicalTrackerCAKey = clinicalTrackerCAKey.secret
    this.clinicalTrackerClientCert = clinicalTrackerClientCert.secret
    this.clinicalTrackerClientKey = clinicalTrackerClientKey.secret
    this.clinicalTrackerClientSandboxCert = clinicalTrackerClientSandboxCert.secret
    this.clinicalTrackerClientSandboxKey = clinicalTrackerClientSandboxKey.secret

    this.fhirFacadeCACert = fhirFacadeCACert.secret
    this.fhirFacadeCAKey = fhirFacadeCAKey.secret
    this.fhirFacadeClientCert = fhirFacadeClientCert.secret
    this.fhirFacadeClientKey = fhirFacadeClientKey.secret
    this.fhirFacadeClientSandboxCert = fhirFacadeClientSandboxCert.secret
    this.fhirFacadeClientSandboxKey = fhirFacadeClientSandboxKey.secret

    this.pfpCACert = pfpCACert.secret
    this.pfpCAKey = pfpCAKey.secret
    this.pfpClientCert = pfpClientCert.secret
    this.pfpClientKey = pfpClientKey.secret
    this.pfpClientSandboxCert = pfpClientSandboxCert.secret
    this.pfpClientSandboxKey = pfpClientSandboxKey.secret

    this.psuCACert = psuCACert.secret
    this.psuCAKey = psuCAKey.secret
    this.psuClientCert = psuClientCert.secret
    this.psuClientKey = psuClientKey.secret
    this.psuClientSandboxCert = psuClientSandboxCert.secret
    this.psuClientSandboxKey = psuClientSandboxKey.secret
  }
}


import {IKey} from "aws-cdk-lib/aws-kms"
import {Construct} from "constructs"
import {StaticSecret} from "../constructs/StaticSecret"
import {Secret} from "aws-cdk-lib/aws-secretsmanager"

export interface MTLSSecretsProps {
  readonly stackName: string
  readonly MTLSSecretsKmsKey: IKey
}
export class MTLSSecrets extends Construct {
  readonly PfpCAKey: Secret
  readonly PfpCACert: Secret
  readonly PfpClientKey: Secret
  readonly PfpClientCert: Secret
  readonly PfpClientSandboxKey: Secret
  readonly PfpClientSandboxCert: Secret

  readonly PSUCAKey: Secret
  readonly PSUCACert: Secret
  readonly PSUClientKey: Secret
  readonly PSUClientCert: Secret
  readonly PSUClientSandboxKey: Secret
  readonly PSUClientSandboxCert: Secret

  readonly ClinicalTrackerCAKey: Secret
  readonly ClinicalTrackerCACert: Secret
  readonly ClinicalTrackerClientKey: Secret
  readonly ClinicalTrackerClientCert: Secret
  readonly ClinicalTrackerClientSandboxKey: Secret
  readonly ClinicalTrackerClientSandboxCert: Secret

  readonly FhirFacadeCAKey: Secret
  readonly FhirFacadeCACert: Secret
  readonly FhirFacadeClientKey: Secret
  readonly FhirFacadeClientCert: Secret
  readonly FhirFacadeClientSandboxKey: Secret
  readonly FhirFacadeClientSandboxCert: Secret

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

    this.ClinicalTrackerCACert = clinicalTrackerCACert.secret
    this.ClinicalTrackerCAKey = clinicalTrackerCAKey.secret
    this.ClinicalTrackerClientCert = clinicalTrackerClientCert.secret
    this.ClinicalTrackerClientKey = clinicalTrackerClientKey.secret
    this.ClinicalTrackerClientSandboxCert = clinicalTrackerClientSandboxCert.secret
    this.ClinicalTrackerClientSandboxKey = clinicalTrackerClientSandboxKey.secret

    this.FhirFacadeCACert = fhirFacadeCACert.secret
    this.FhirFacadeCAKey = fhirFacadeCAKey.secret
    this.FhirFacadeClientCert = fhirFacadeClientCert.secret
    this.FhirFacadeClientKey = fhirFacadeClientKey.secret
    this.FhirFacadeClientSandboxCert = fhirFacadeClientSandboxCert.secret
    this.FhirFacadeClientSandboxKey = fhirFacadeClientSandboxKey.secret

    this.PfpCACert = pfpCACert.secret
    this.PfpCAKey = pfpCAKey.secret
    this.PfpClientCert = pfpClientCert.secret
    this.PfpClientKey = pfpClientKey.secret
    this.PfpClientSandboxCert = pfpClientSandboxCert.secret
    this.PfpClientSandboxKey = pfpClientSandboxKey.secret

    this.PSUCACert = psuCACert.secret
    this.PSUCAKey = psuCAKey.secret
    this.PSUClientCert = psuClientCert.secret
    this.PSUClientKey = psuClientKey.secret
    this.PSUClientSandboxCert = psuClientSandboxCert.secret
    this.PSUClientSandboxKey = psuClientSandboxKey.secret
  }
}

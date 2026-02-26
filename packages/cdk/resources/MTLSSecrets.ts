
import {IKey} from "aws-cdk-lib/aws-kms"
import {Construct} from "constructs"
import {StaticSecret} from "../constructs/StaticSecret"

export interface MTLSSecretsProps {
  readonly stackName: string
  readonly MTLSSecretsKmsKey: IKey
}
export class MTLSSecrets extends Construct {

  public constructor(scope: Construct, id: string, props: MTLSSecretsProps){
    super(scope, id)

    new StaticSecret(this, "ClinicalTrackerCACert", {
      secretName:  `${props.stackName}-ClinicalTrackerCACert`,
      description: "Clinical tracker CA certificate",
      encryptionKey: props.MTLSSecretsKmsKey
    })
    new StaticSecret(this, "ClinicalTrackerCAKey", {
      secretName:  `${props.stackName}-ClinicalTrackerCAKey`,
      description: "Clinical tracker CA key",
      encryptionKey: props.MTLSSecretsKmsKey
    })
    new StaticSecret(this, "ClinicalTrackerClientCert", {
      secretName:  `${props.stackName}-ClinicalTrackerClientCert`,
      description: "Clinical tracker client certificate",
      encryptionKey: props.MTLSSecretsKmsKey
    })
    new StaticSecret(this, "ClinicalTrackerClientKey", {
      secretName:  `${props.stackName}-ClinicalTrackerClientKey`,
      description: "Clinical tracker client key",
      encryptionKey: props.MTLSSecretsKmsKey
    })
    new StaticSecret(this, "ClinicalTrackerClientSandboxCert", {
      secretName:  `${props.stackName}-ClinicalTrackerClientSandboxCert`,
      description: "Clinical tracker sandbox client certificate",
      encryptionKey: props.MTLSSecretsKmsKey
    })
    new StaticSecret(this, "ClinicalTrackerClientSandboxKey", {
      secretName:  `${props.stackName}-ClinicalTrackerClientSandboxKey`,
      description: "Clinical tracker sandbox client key",
      encryptionKey: props.MTLSSecretsKmsKey
    })
    new StaticSecret(this, "FhirFacadeCACert", {
      secretName:  `${props.stackName}-FhirFacadeCACert`,
      description: "FHIR facade CA certificate",
      encryptionKey: props.MTLSSecretsKmsKey
    })
    new StaticSecret(this, "FhirFacadeCAKey", {
      secretName:  `${props.stackName}-FhirFacadeCAKey`,
      description: "FHIR facade CA key",
      encryptionKey: props.MTLSSecretsKmsKey
    })
    new StaticSecret(this, "FhirFacadeClientCert", {
      secretName:  `${props.stackName}-FhirFacadeClientCert`,
      description: "FHIR facade client certificate",
      encryptionKey: props.MTLSSecretsKmsKey
    })
    new StaticSecret(this, "FhirFacadeClientKey", {
      secretName:  `${props.stackName}-FhirFacadeClientKey`,
      description: "FHIR facade client key",
      encryptionKey: props.MTLSSecretsKmsKey
    })
    new StaticSecret(this, "FhirFacadeClientSandboxCert", {
      secretName:  `${props.stackName}-FhirFacadeClientSandboxCert`,
      description: "FHIR facade sandbox client certificate",
      encryptionKey: props.MTLSSecretsKmsKey
    })
    new StaticSecret(this, "FhirFacadeClientSandboxKey", {
      secretName:  `${props.stackName}-FhirFacadeClientSandboxKey`,
      description: "FHIR facade sandbox client key",
      encryptionKey: props.MTLSSecretsKmsKey
    })

    new StaticSecret(this, "PfpCACert", {
      secretName:  `${props.stackName}-PfpCACert`,
      description: "PFP CA certificate",
      encryptionKey: props.MTLSSecretsKmsKey
    })
    new StaticSecret(this, "PfpCAKey", {
      secretName:  `${props.stackName}-PfpCAKey`,
      description: "PFP CA key",
      encryptionKey: props.MTLSSecretsKmsKey
    })
    new StaticSecret(this, "PfpClientCert", {
      secretName:  `${props.stackName}-PfpClientCert`,
      description: "PFP client certificate",
      encryptionKey: props.MTLSSecretsKmsKey
    })
    new StaticSecret(this, "PfpClientKey", {
      secretName:  `${props.stackName}-PfpClientKey`,
      description: "PFP client key",
      encryptionKey: props.MTLSSecretsKmsKey
    })
    new StaticSecret(this, "PfpClientSandboxCert", {
      secretName:  `${props.stackName}-PfpClientSandboxCert`,
      description: "PFP sandbox client certificate",
      encryptionKey: props.MTLSSecretsKmsKey
    })
    new StaticSecret(this, "PfpClientSandboxKey", {
      secretName:  `${props.stackName}-PfpClientSandboxKey`,
      description: "PFP sandbox client key",
      encryptionKey: props.MTLSSecretsKmsKey
    })

    new StaticSecret(this, "PSUCACert", {
      secretName:  `${props.stackName}-PSUCACert`,
      description: "PSU CA certificate",
      encryptionKey: props.MTLSSecretsKmsKey
    })
    new StaticSecret(this, "PSUCAKey", {
      secretName:  `${props.stackName}-PSUCAKey`,
      description: "PSU CA key",
      encryptionKey: props.MTLSSecretsKmsKey
    })
    new StaticSecret(this, "PSUClientCert", {
      secretName:  `${props.stackName}-PSUClientCert`,
      description: "PSU client certificate",
      encryptionKey: props.MTLSSecretsKmsKey
    })
    new StaticSecret(this, "PSUClientKey", {
      secretName:  `${props.stackName}-PSUClientKey`,
      description: "PSU client key",
      encryptionKey: props.MTLSSecretsKmsKey
    })
    new StaticSecret(this, "PSUClientSandboxCert", {
      secretName:  `${props.stackName}-PSUClientSandboxCert`,
      description: "PSU sandbox client certificate",
      encryptionKey: props.MTLSSecretsKmsKey
    })
    new StaticSecret(this, "PSUClientSandboxKey", {
      secretName:  `${props.stackName}-PSUClientSandboxKey`,
      description: "PSU sandbox client key",
      encryptionKey: props.MTLSSecretsKmsKey
    })

  }
}


import {IKey} from "aws-cdk-lib/aws-kms"
import {Construct} from "constructs"
import {StaticSecret} from "../constructs/StaticSecret"
import {Secret} from "aws-cdk-lib/aws-secretsmanager"

export interface ProxygenSecretsProps {
  readonly stackName: string
  readonly proxygenSecretsKmsKey: IKey
}
export class ProxygenSecrets extends Construct {
  public readonly cpsuProxygenPrivateKey: Secret
  public readonly cpsuProxygenPublicKey: Secret
  public readonly clinicalTrackerProxygenPrivateKey: Secret
  public readonly clinicalTrackerProxygenPublicKey: Secret
  public readonly psuProxygenPrivateKey: Secret
  public readonly psuProxygenPublicKey: Secret
  public readonly prescribingProxygenPrivateKey: Secret
  public readonly prescribingProxygenPublicKey: Secret
  public readonly dispensingProxygenPrivateKey: Secret
  public readonly dispensingProxygenPublicKey: Secret
  public readonly prescriptionsForPatientsProxygenPrivateKey: Secret
  public readonly prescriptionsForPatientsProxygenPublicKey: Secret

  public constructor(scope: Construct, id: string, props: ProxygenSecretsProps){
    super(scope, id)

    const cpsuProxygenPrivateKey = new StaticSecret(this, "CPSUProxygenPrivateKey", {
      secretName:  `${props.stackName}-CPSU-ProxygenPrivateKey`,
      description: "Private key for cpsu proxygen",
      encryptionKey: props.proxygenSecretsKmsKey
    })
    const cpsuProxygenPublicKey = new StaticSecret(this, "CPSUProxygenPublicKey", {
      secretName:  `${props.stackName}-CPSU-ProxygenPublicKey`,
      description: "Public key for cpsu proxygen",
      encryptionKey: props.proxygenSecretsKmsKey
    })
    const clinicalTrackerProxygenPrivateKey = new StaticSecret(this, "ClinicalTrackerProxygenPrivateKey", {
      secretName:  `${props.stackName}-ClinicalTracker-ProxygenPrivateKey`,
      description: "Private key for clinical tracker proxygen",
      encryptionKey: props.proxygenSecretsKmsKey
    })
    const clinicalTrackerProxygenPublicKey = new StaticSecret(this, "ClinicalTrackerProxygenPublicKey", {
      secretName:  `${props.stackName}-ClinicalTracker-ProxygenPublicKey`,
      description: "Public key for clinical tracker proxygen",
      encryptionKey: props.proxygenSecretsKmsKey
    })
    const psuProxygenPrivateKey = new StaticSecret(this, "PSUProxygenPrivateKey", {
      secretName:  `${props.stackName}-PSU-ProxygenPrivateKey`,
      description: "Private key for PSU proxygen",
      encryptionKey: props.proxygenSecretsKmsKey
    })
    const psuProxygenPublicKey = new StaticSecret(this, "PSUProxygenPublicKey", {
      secretName:  `${props.stackName}-PSU-ProxygenPublicKey`,
      description: "Public key for PSU proxygen",
      encryptionKey: props.proxygenSecretsKmsKey
    })
    const prescribingProxygenPrivateKey = new StaticSecret(this, "PrescribingProxygenPrivateKey", {
      secretName:  `${props.stackName}-Prescribing-ProxygenPrivateKey`,
      description: "Private key for prescribing proxygen",
      encryptionKey: props.proxygenSecretsKmsKey
    })
    const prescribingProxygenPublicKey = new StaticSecret(this, "PrescribingProxygenPublicKey", {
      secretName:  `${props.stackName}-Prescribing-ProxygenPublicKey`,
      description: "Public key for prescribing proxygen",
      encryptionKey: props.proxygenSecretsKmsKey
    })
    const dispensingProxygenPrivateKey = new StaticSecret(this, "DispensingProxygenPrivateKey", {
      secretName:  `${props.stackName}-Dispensing-ProxygenPrivateKey`,
      description: "Private key for dispensing proxygen",
      encryptionKey: props.proxygenSecretsKmsKey
    })
    const dispensingProxygenPublicKey = new StaticSecret(this, "DispensingProxygenPublicKey", {
      secretName:  `${props.stackName}-Dispensing-ProxygenPublicKey`,
      description: "Public key for dispensing proxygen",
      encryptionKey: props.proxygenSecretsKmsKey
    })
    const prescriptionsForPatientsProxygenPrivateKey =
      new StaticSecret(this, "PrescriptionsForPatientsProxygenPrivateKey", {
        secretName:  `${props.stackName}-PrescriptionsForPatients-ProxygenPrivateKey`,
        description: "Private key for prescriptions for patients proxygen",
        encryptionKey: props.proxygenSecretsKmsKey
      })
    const prescriptionsForPatientsProxygenPublicKey =
      new StaticSecret(this, "PrescriptionsForPatientsProxygenPublicKey", {
        secretName:  `${props.stackName}-PrescriptionsForPatients-ProxygenPublicKey`,
        description: "Public key for prescriptions for patients proxygen",
        encryptionKey: props.proxygenSecretsKmsKey
      })

    this.cpsuProxygenPrivateKey = cpsuProxygenPrivateKey.secret
    this.cpsuProxygenPublicKey = cpsuProxygenPublicKey.secret
    this.clinicalTrackerProxygenPrivateKey = clinicalTrackerProxygenPrivateKey.secret
    this.clinicalTrackerProxygenPublicKey = clinicalTrackerProxygenPublicKey.secret
    this.psuProxygenPrivateKey = psuProxygenPrivateKey.secret
    this.psuProxygenPublicKey = psuProxygenPublicKey.secret
    this.prescribingProxygenPrivateKey = prescribingProxygenPrivateKey.secret
    this.prescribingProxygenPublicKey = prescribingProxygenPublicKey.secret
    this.dispensingProxygenPrivateKey = dispensingProxygenPrivateKey.secret
    this.dispensingProxygenPublicKey = dispensingProxygenPublicKey.secret
    this.prescriptionsForPatientsProxygenPrivateKey = prescriptionsForPatientsProxygenPrivateKey.secret
    this.prescriptionsForPatientsProxygenPublicKey = prescriptionsForPatientsProxygenPublicKey.secret
  }
}

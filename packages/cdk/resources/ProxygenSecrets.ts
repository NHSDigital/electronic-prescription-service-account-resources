
import {IKey} from "aws-cdk-lib/aws-kms"
import {Construct} from "constructs"
import {StaticSecret} from "../constructs/StaticSecret"
import {Secret} from "aws-cdk-lib/aws-secretsmanager"

export interface ProxygenSecretsProps {
  readonly stackName: string
  readonly proxygenSecretsKmsKey: IKey
}

export interface ProxygenSecretKeys {
  readonly proxygenPrivateKey: Secret
  readonly proxygenPublicKey: Secret
  readonly proxygenKid: Secret
  readonly proxygenProdPrivateKey: Secret
  readonly proxygenProdPublicKey: Secret
  readonly proxygenProdKid: Secret
  readonly proxygenPTLPrivateKey: Secret
  readonly proxygenPTLPublicKey: Secret
  readonly proxygenPTLKid: Secret
}

export class ProxygenSecrets extends Construct {
  public readonly cpsuProxygenKeys: ProxygenSecretKeys
  public readonly clinicalTrackerProxygenKeys: ProxygenSecretKeys
  public readonly psuProxygenKeys: ProxygenSecretKeys
  public readonly prescribingProxygenKeys: ProxygenSecretKeys
  public readonly dispensingProxygenKeys: ProxygenSecretKeys
  public readonly pfpProxygenKeys: ProxygenSecretKeys

  public constructor(scope: Construct, id: string, props: ProxygenSecretsProps){
    super(scope, id)

    const createProxygenKeys = (product: string, environment: string):
    {privateKey: StaticSecret, publicKey: StaticSecret, kid: StaticSecret} => {
      const privateKey = new StaticSecret(this, `${product}Proxygen${environment}PrivateKey`, {
        secretName:  `${product}Proxygen-PrivateKey-${environment}`,
        description: `Private key for ${environment} ${product} proxygen`,
        encryptionKey: props.proxygenSecretsKmsKey
      })
      const publicKey = new StaticSecret(this, `${product}Proxygen${environment}PublicKey`, {
        secretName:  `${product}Proxygen-PublicKey-${environment}`,
        description: `Public key for ${environment} ${product} proxygen`,
        encryptionKey: props.proxygenSecretsKmsKey
      })
      const kid = new StaticSecret(this, `${product}Proxygen${environment}Kid`, {
        secretName:  `${product}Proxygen-Kid-${environment}`,
        description: `Kid for ${environment} ${product} proxygen`,
        encryptionKey: props.proxygenSecretsKmsKey
      })
      return {privateKey, publicKey, kid}
    }

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
    const cpsuProxygenKid = new StaticSecret(this, "CPSUProxygenKid", {
      secretName:  `${props.stackName}-CPSU-ProxygenKid`,
      description: "Key ID for cpsu proxygen",
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
    const clinicalTrackerProxygenKid = new StaticSecret(this, "ClinicalTrackerProxygenKid", {
      secretName:  `${props.stackName}-ClinicalTracker-ProxygenKid`,
      description: "Key ID for clinical tracker proxygen",
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
    const psuProxygenKid = new StaticSecret(this, "PSUProxygenKid", {
      secretName:  `${props.stackName}-PSU-ProxygenKid`,
      description: "Key ID for PSU proxygen",
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
    const prescribingProxygenKid = new StaticSecret(this, "PrescribingProxygenKid", {
      secretName:  `${props.stackName}-Prescribing-ProxygenKid`,
      description: "Key ID for prescribing proxygen",
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
    const dispensingProxygenKid = new StaticSecret(this, "DispensingProxygenKid", {
      secretName:  `${props.stackName}-Dispensing-ProxygenKid`,
      description: "Key ID for dispensing proxygen",
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
    const prescriptionsForPatientsProxygenKid =
      new StaticSecret(this, "PrescriptionsForPatientsProxygenKid", {
        secretName:  `${props.stackName}-PrescriptionsForPatients-ProxygenKid`,
        description: "Key ID for prescriptions for patients proxygen",
        encryptionKey: props.proxygenSecretsKmsKey
      })

    const {
      privateKey: psuProxygenProdPrivateKey,
      publicKey: psuProxygenProdPublicKey,
      kid: psuProxygenProdKid} = createProxygenKeys("PSU", "prod")
    const {
      privateKey: psuProxygenPTLPrivateKey,
      publicKey: psuProxygenPTLPublicKey,
      kid: psuProxygenPTLKid} = createProxygenKeys("PSU", "ptl")
    const {
      privateKey: cpsuProxygenProdPrivateKey,
      publicKey: cpsuProxygenProdPublicKey,
      kid: cpsuProxygenProdKid} = createProxygenKeys("CPSU", "prod")
    const {
      privateKey: cpsuProxygenPTLPrivateKey,
      publicKey: cpsuProxygenPTLPublicKey,
      kid: cpsuProxygenPTLKid} = createProxygenKeys("CPSU", "ptl")
    const {
      privateKey: clinicalTrackerProxygenProdPrivateKey,
      publicKey: clinicalTrackerProxygenProdPublicKey,
      kid: clinicalTrackerProxygenProdKid} = createProxygenKeys("ClinicalTracker", "prod")
    const {
      privateKey: clinicalTrackerProxygenPTLPrivateKey,
      publicKey: clinicalTrackerProxygenPTLPublicKey,
      kid: clinicalTrackerProxygenPTLKid} = createProxygenKeys("ClinicalTracker", "ptl")
    const {
      privateKey: prescribingProxygenProdPrivateKey,
      publicKey: prescribingProxygenProdPublicKey,
      kid: prescribingProxygenProdKid} = createProxygenKeys("FhirPrescribing", "prod")
    const {
      privateKey: prescribingProxygenPTLPrivateKey,
      publicKey: prescribingProxygenPTLPublicKey,
      kid: prescribingProxygenPTLKid} = createProxygenKeys("FhirPrescribing", "ptl")
    const {
      privateKey: dispensingProxygenProdPrivateKey,
      publicKey: dispensingProxygenProdPublicKey,
      kid: dispensingProxygenProdKid} = createProxygenKeys("FhirDispensing", "prod")
    const {
      privateKey: dispensingProxygenPTLPrivateKey,
      publicKey: dispensingProxygenPTLPublicKey,
      kid: dispensingProxygenPTLKid} = createProxygenKeys("FhirDispensing", "ptl")
    const {
      privateKey: prescriptionsForPatientsProxygenProdPrivateKey,
      publicKey: prescriptionsForPatientsProxygenProdPublicKey,
      kid: prescriptionsForPatientsProxygenProdKid} = createProxygenKeys("PrescriptionsForPatients", "prod")
    const {
      privateKey: prescriptionsForPatientsProxygenPTLPrivateKey,
      publicKey: prescriptionsForPatientsProxygenPTLPublicKey,
      kid: prescriptionsForPatientsProxygenPTLKid} = createProxygenKeys("PrescriptionsForPatients", "ptl")

    this.cpsuProxygenKeys = {
      proxygenPrivateKey: cpsuProxygenPrivateKey.secret,
      proxygenPublicKey: cpsuProxygenPublicKey.secret,
      proxygenKid: cpsuProxygenKid.secret,
      proxygenProdPrivateKey: cpsuProxygenProdPrivateKey.secret,
      proxygenProdPublicKey: cpsuProxygenProdPublicKey.secret,
      proxygenProdKid: cpsuProxygenProdKid.secret,
      proxygenPTLPrivateKey: cpsuProxygenPTLPrivateKey.secret,
      proxygenPTLPublicKey: cpsuProxygenPTLPublicKey.secret,
      proxygenPTLKid: cpsuProxygenPTLKid.secret
    }
    this.clinicalTrackerProxygenKeys = {
      proxygenPrivateKey: clinicalTrackerProxygenPrivateKey.secret,
      proxygenPublicKey: clinicalTrackerProxygenPublicKey.secret,
      proxygenKid: clinicalTrackerProxygenKid.secret,
      proxygenProdPrivateKey: clinicalTrackerProxygenProdPrivateKey.secret,
      proxygenProdPublicKey: clinicalTrackerProxygenProdPublicKey.secret,
      proxygenProdKid: clinicalTrackerProxygenProdKid.secret,
      proxygenPTLPrivateKey: clinicalTrackerProxygenPTLPrivateKey.secret,
      proxygenPTLPublicKey: clinicalTrackerProxygenPTLPublicKey.secret,
      proxygenPTLKid: clinicalTrackerProxygenPTLKid.secret
    }
    this.psuProxygenKeys = {
      proxygenPrivateKey: psuProxygenPrivateKey.secret,
      proxygenPublicKey: psuProxygenPublicKey.secret,
      proxygenKid: psuProxygenKid.secret,
      proxygenProdPrivateKey: psuProxygenProdPrivateKey.secret,
      proxygenProdPublicKey: psuProxygenProdPublicKey.secret,
      proxygenProdKid: psuProxygenProdKid.secret,
      proxygenPTLPrivateKey: psuProxygenPTLPrivateKey.secret,
      proxygenPTLPublicKey: psuProxygenPTLPublicKey.secret,
      proxygenPTLKid: psuProxygenPTLKid.secret
    }
    this.prescribingProxygenKeys = {
      proxygenPrivateKey: prescribingProxygenPrivateKey.secret,
      proxygenPublicKey: prescribingProxygenPublicKey.secret,
      proxygenKid: prescribingProxygenKid.secret,
      proxygenProdPrivateKey: prescribingProxygenProdPrivateKey.secret,
      proxygenProdPublicKey: prescribingProxygenProdPublicKey.secret,
      proxygenProdKid: prescribingProxygenProdKid.secret,
      proxygenPTLPrivateKey: prescribingProxygenPTLPrivateKey.secret,
      proxygenPTLPublicKey: prescribingProxygenPTLPublicKey.secret,
      proxygenPTLKid: prescribingProxygenPTLKid.secret
    }
    this.dispensingProxygenKeys = {
      proxygenPrivateKey: dispensingProxygenPrivateKey.secret,
      proxygenPublicKey: dispensingProxygenPublicKey.secret,
      proxygenKid: dispensingProxygenKid.secret,
      proxygenProdPrivateKey: dispensingProxygenProdPrivateKey.secret,
      proxygenProdPublicKey: dispensingProxygenProdPublicKey.secret,
      proxygenProdKid: dispensingProxygenProdKid.secret,
      proxygenPTLPrivateKey: dispensingProxygenPTLPrivateKey.secret,
      proxygenPTLPublicKey: dispensingProxygenPTLPublicKey.secret,
      proxygenPTLKid: dispensingProxygenPTLKid.secret
    }
    this.pfpProxygenKeys = {
      proxygenPrivateKey: prescriptionsForPatientsProxygenPrivateKey.secret,
      proxygenPublicKey: prescriptionsForPatientsProxygenPublicKey.secret,
      proxygenKid: prescriptionsForPatientsProxygenKid.secret,
      proxygenProdPrivateKey: prescriptionsForPatientsProxygenProdPrivateKey.secret,
      proxygenProdPublicKey: prescriptionsForPatientsProxygenProdPublicKey.secret,
      proxygenProdKid: prescriptionsForPatientsProxygenProdKid.secret,
      proxygenPTLPrivateKey: prescriptionsForPatientsProxygenPTLPrivateKey.secret,
      proxygenPTLPublicKey: prescriptionsForPatientsProxygenPTLPublicKey.secret,
      proxygenPTLKid: prescriptionsForPatientsProxygenPTLKid.secret
    }
  }
}

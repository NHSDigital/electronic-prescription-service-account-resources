import * as crypto from "crypto"
import {Logger} from "@aws-lambda-powertools/logger"

export interface Secret {
  ARN: string
  CreatedDate?: Date
  Name: string
  SecretString: string
  VersionId: string
  VersionStages: Array<string>
}

export function checkCertificateExpiry(secret: Secret, logger: Logger): void {
  try {
    if (secret.SecretString) {
      if (secret.SecretString === "ChangeMe") {
        logger.warn(`Secret ${secret.Name} is still set to ChangeMe`, {
          secret: {
            Name: secret.Name,
            Arn: secret.ARN
          }}
        )
        return
      }
      const certificate = new crypto.X509Certificate(secret.SecretString)

      const today = new Date()
      const certificateEndDate = new Date(certificate.validTo)
      const timeToExpiry = certificateEndDate.getTime() - today.getTime()
      const daysToExpiry = Math.ceil(timeToExpiry / (1000 * 3600 * 24))

      const formattedEndDate = certificateEndDate.toDateString()

      if (daysToExpiry < 0) {
        logger.critical(`Certificate ${secret.Name} has expired`, {
          secret: {
            Name: secret.Name,
            Arn: secret.ARN,
            formattedEndDate: formattedEndDate
          }}
        )
      } else if (daysToExpiry < 30) {
        logger.error(`Certificate ${secret.Name} expires in ${daysToExpiry} days`, {
          secret: {
            Name: secret.Name,
            Arn: secret.ARN,
            daysToExpiry: daysToExpiry,
            formattedEndDate: formattedEndDate
          }}
        )
      } else {
        logger.info(`Certificate ${secret.Name} is valid. Expiry date: ${formattedEndDate}`, {
          secret: {
            Name: secret.Name,
            Arn: secret.ARN,
            formattedEndDate: formattedEndDate
          }}
        )
      }
    }
  } catch (error) {
    logger.error(`Error processing secret ${secret.Name}`, {
      secret: {
        Name: secret.Name,
        Arn: secret.ARN
      },
      error
    })
    throw error
  }
}

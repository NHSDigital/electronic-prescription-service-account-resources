import crypto from 'crypto';
import { Logger } from "@aws-lambda-powertools/logger";

const logger = new Logger({ serviceName: "splunkProcessor" });

export interface Secret {
  ARN: string;
  CreatedDate: number;
  Name: string;
  SecretString: string;
  VersionId: string;
  VersionStages: string[];
}

export function checkCertificateExpiry(secret: Secret): void {
  try {
    if (secret.SecretString) {
      const certificate = new crypto.X509Certificate(`-----BEGIN CERTIFICATE-----\n${JSON.parse(secret.SecretString)?.x509Certificate || ''}\n-----END CERTIFICATE-----`);

      // Logging details for each check
      logger.info(`Checking certificate ${secret.Name}, expiry date: ${certificate.validTo}`);

      const today = new Date();
      const certificateEndDate = new Date(certificate.validTo);
      const timeToExpiry = certificateEndDate.getTime() - today.getTime();
      const daysToExpiry = Math.ceil(timeToExpiry / (1000 * 3600 * 24));

      if (daysToExpiry < 0) {
        logger.critical(`Certificate ${secret.Name} has expired`);
      } else if (daysToExpiry < 30) {
        logger.error(`Certificate ${secret.Name} expires in ${daysToExpiry} days`);
      }
    }
  } catch (error) {
    logger.error(`Error processing secret ${secret.Name}: ${error}`);
  }
}

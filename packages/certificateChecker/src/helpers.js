"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkCertificateExpiry = void 0;
const crypto_1 = __importDefault(require("crypto"));
const logger_1 = require("@aws-lambda-powertools/logger");
const logger = new logger_1.Logger({ serviceName: "splunkProcessor" });
function checkCertificateExpiry(secret) {
    try {
        if (secret.SecretString) {
            const certificate = new crypto_1.default.X509Certificate(`-----BEGIN CERTIFICATE-----\n${JSON.parse(secret.SecretString)?.x509Certificate || ''}\n-----END CERTIFICATE-----`);
            // Logging details for each check
            logger.info(`Checking certificate ${secret.Name}, expiry date: ${certificate.validTo}`);
            const today = new Date();
            const certificateEndDate = new Date(certificate.validTo);
            const timeToExpiry = certificateEndDate.getTime() - today.getTime();
            const daysToExpiry = Math.ceil(timeToExpiry / (1000 * 3600 * 24));
            if (daysToExpiry < 0) {
                logger.critical(`Certificate ${secret.Name} has expired`);
            }
            else if (daysToExpiry < 30) {
                logger.error(`Certificate ${secret.Name} expires in ${daysToExpiry} days`);
            }
        }
    }
    catch (error) {
        logger.error(`Error processing secret ${secret.Name}: ${error}`);
    }
}
exports.checkCertificateExpiry = checkCertificateExpiry;

import { SecretsManagerClient, ListSecretsCommand, BatchGetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import { Logger } from "@aws-lambda-powertools/logger";
import { checkCertificateExpiry } from "./helpers";

const secretsClient = new SecretsManagerClient({});

const logger = new Logger({serviceName: "splunkProcessor"})



const getCertificates = async (): Promise<{ [key: string]: boolean }> => {
  const listSecretsCommand = new ListSecretsCommand({});
  const listSecretsResponse = await secretsClient.send(listSecretsCommand);

  const secretList = listSecretsResponse.SecretList || [];
  const secretIds = secretList.map(secret => secret && secret.ARN).filter(Boolean) as string[];

  if (secretIds.length === 0) {
    console.log("No 'cert' secrets found.");
    return {};
  }

  const batchGetSecretValueCommand = new BatchGetSecretValueCommand({
    SecretIdList: secretIds,
  });

  const batchGetSecretValueResponse = await secretsClient.send(batchGetSecretValueCommand);

  const result: { [key: string]: boolean } = {};

  if(batchGetSecretValueResponse.SecretValues){


  for (const secret of batchGetSecretValueResponse.SecretValues) {
    try {
      logger.info("Lambda execution started.");

      const certificates = await getCertificates();
  
      for (const [certName, isExpired] of Object.entries(certificates)) {
        // Assuming the certificate name is the property name and isExpired is a boolean value
        // Modify this loop based on the actual structure of your certificates object
  
        if (isExpired) {
          logger.critical(`Certificate ${certName} has expired`);
        } else {
          logger.info(`Checked certificate ${certName}`);
        }
      }
  
      logger.info("Lambda execution completed.");
    } catch (error) {
      logger.error(`Error processing secret ${secret.Name}: ${error}`)}
  }}

  return result;
};

export const handler = async function (event) {
  try {
    logger.info("Lambda execution started.");

    await getCertificates();

    logger.info("Lambda execution completed.");
  } catch (error) {
    logger.error("Lambda execution failed:", { error });
    throw error;
  }
};

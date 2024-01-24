// import { checkCertificateExpiry } from '../src/helpers';
// import { Logger } from "@aws-lambda-powertools/logger";
// import crypto from 'crypto';
// const {expect, describe, it, jest} = require("@jest/globals")
// import { Secret } from '../src/helpers'


// jest.mock('@aws-sdk/client-secrets-manager', () => ({
//   SecretsManagerClient: jest.fn(() => ({
//     send: jest.fn().mockResolvedValue({ SecretValues: [] }),
//   })),
//   ListSecretsCommand: jest.fn(),
//   BatchGetSecretValueCommand: jest.fn(),
// }));

// const logger = new Logger({ serviceName: "splunkProcessor" });

// // interface Secret {
// //   ARN: string;
// //   CreatedDate: number;
// //   Name: string;
// //   SecretString: string;
// //   VersionId: string;
// //   VersionStages: string[];
// // }

// describe('checkCertificateExpiry', () => {
//   it('should log info for valid certificate', () => {
//     const validCertificate: Secret = {
//       ARN: 'valid-arn',
//       CreatedDate: Date.now(),
//       Name: 'valid-certificate',
//       SecretString: '{"x509Certificate": "valid-certificate-pem"}',
//       VersionId: 'valid-version-id',
//       VersionStages: ['AWSCURRENT'],
//     };

//     const loggerInfoSpy = jest.spyOn(logger, 'info');

//     checkCertificateExpiry(validCertificate);

//     expect(loggerInfoSpy).toHaveBeenCalledWith(`Checking certificate ${validCertificate.Name}, expiry date: ${expect.any(String)}`);
//   });

//   it('should log critical for expired certificate', () => {
//     const expiredCertificate: Secret = {
//       ARN: 'expired-arn',
//       CreatedDate: Date.now(),
//       Name: 'expired-certificate',
//       SecretString: '{"x509Certificate": "expired-certificate-pem"}',
//       VersionId: 'expired-version-id',
//       VersionStages: ['AWSCURRENT'],
//     };

//     const loggerCriticalSpy = jest.spyOn(logger, 'critical');

//     checkCertificateExpiry(expiredCertificate);

//     expect(loggerCriticalSpy).toHaveBeenCalledWith(`Certificate ${expiredCertificate.Name} has expired`);
//   });

//   it('should log error for certificate expiring in less than 30 days', () => {
//     const expiringSoonCertificate: Secret = {
//       ARN: 'expiring-soon-arn',
//       CreatedDate: Date.now(),
//       Name: 'expiring-soon-certificate',
//       SecretString: '{"x509Certificate": "expiring-soon-certificate-pem"}',
//       VersionId: 'expiring-soon-version-id',
//       VersionStages: ['AWSCURRENT'],
//     };

//     const loggerErrorSpy = jest.spyOn(logger, 'error');

//     checkCertificateExpiry(expiringSoonCertificate);

//     expect(loggerErrorSpy).toHaveBeenCalledWith(`Certificate ${expiringSoonCertificate.Name} expires in ${expect.any(Number)} days`);
//   });
// });
import fs from 'fs';
import path from 'path';
import { checkCertificateExpiry } from '../src/helpers';
import { Secret } from '../src/helpers';

describe('checkCertificateExpiry', () => {
  it('should log info for valid certificate', () => {
    const validCertificateContents = fs.readFileSync(path.resolve(__dirname, 'path/to/valid-csr.pem'), 'utf-8');
    const validCertificate: Secret = {
      ARN: 'valid-arn',
      CreatedDate: Date.now(),
      Name: 'valid-certificate',
      SecretString: validCertificateContents,
      VersionId: 'valid-version-id',
      VersionStages: ['valid-stage'],
    };

    checkCertificateExpiry(validCertificate);
  });
});

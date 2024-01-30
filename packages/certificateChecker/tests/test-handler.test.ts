import * as fs from 'fs';
import * as path from 'path';
import { checkCertificateExpiry } from '../src/helpers';
import { Secret } from '../src/helpers';
import { Logger } from '@aws-lambda-powertools/logger';



const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  critical: jest.fn(),
};



describe('checkCertificateExpiry', () => {
  const logger = new Logger({ serviceName: 'test' })

  it('should log error for expiring certificate', () => {
    const mockLoggerInfo = jest.spyOn(Logger.prototype, "error")
    const expiringCertificateContents = fs.readFileSync(
      path.resolve(__dirname, './expiring-cert.pem'),
      'utf-8'
    );
    const expiringSecret: Secret = {
      ARN: 'expiring-arn',
      CreatedDate: new Date(),
      Name: 'expiring-certificate',
      SecretString: expiringCertificateContents,
      VersionId: 'expiring-version-id',
      VersionStages: ['expiring-stage'],
    };
    checkCertificateExpiry(expiringSecret, logger);


    expect(mockLoggerInfo).toHaveBeenCalled()
    expect(mockLoggerInfo).toHaveBeenCalledWith("Certificate expiring-certificate expires in 23 days")

  });
});




// openssl genpkey -algorithm RSA -out ca-key.pem
// openssl req -new -x509 -key ca-key.pem -out ca-cert.pem

// openssl genpkey -algorithm RSA -out valid-key.pem
// openssl req -new -key valid-key.pem -out valid-csr.pem
// openssl x509 -req -in valid-csr.pem -CA ca-cert.pem -CAkey ca-key.pem -out valid-cert.pem

// openssl genpkey -algorithm RSA -out expired-key.pem
// openssl req -new -key expired-key.pem -out expired-csr.pem
// openssl x509 -req -in expired-csr.pem -CA ca-cert.pem -CAkey ca-key.pem -out expired-cert.pem -days -30

// openssl genpkey -algorithm RSA -out expiring-key.pem
// openssl req -new -key expiring-key.pem -out expiring-csr.pem
// openssl x509 -req -in expiring-csr.pem -CA ca-cert.pem -CAkey ca-key.pem -out expiring-cert.pem -days 30

//shell script that creates these certs every time a test is run
//modify makefile so that it calls the shell script
//change in the test: target line 38 to do the bash command to run shell scripts


//examples below:
// generate-mock-certs:
// 	cd packages/coordinator/tests/resources/certificates && bash ./generate_mock_certs.sh

//   test-api: check-licenses-api generate-mock-certs test-coordinator
// 	cd packages/e2e-tests && $(MAKE) test

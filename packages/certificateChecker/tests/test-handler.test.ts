import * as fs from "fs"
import * as path from "path"
import {
  afterEach,
  describe,
  expect,
  it,
  vi
} from "vitest"
import {X509Certificate} from "crypto"
import {mockClient} from "aws-sdk-vitest-mock"
import {BatchGetSecretValueCommand, SecretsManagerClient} from "@aws-sdk/client-secrets-manager"
import {fileURLToPath} from "url"
import {dirname} from "path"
import {handler} from "../src/certificateChecker"

import {helloworldContext} from "./helloWorldContext"
import {Logger} from "@aws-lambda-powertools/logger"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const dummyContext = helloworldContext
const mockEvent = {
  secretARNs: ["foo"]
}

describe("Unit test for app handler", function () {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("Runs successfully with a valid certificate", async () => {
    const smMock = mockClient(SecretsManagerClient)
    const validCertificateContents = fs.readFileSync(path.resolve(__dirname, "./mock-certs/valid-cert.pem"), "utf-8")

    smMock.on(BatchGetSecretValueCommand).resolves({
      SecretValues: [
        {
          ARN: "valid-arn",
          CreatedDate: new Date(),
          Name: "valid-certificate",
          SecretString: validCertificateContents,
          VersionId: "valid-version-id",
          VersionStages: ["valid-stage"]
        }
      ]
    })
    const mockLoggerInfo = vi.spyOn(Logger.prototype, "info")
    const mockLoggerError = vi.spyOn(Logger.prototype, "error")
    await handler(mockEvent, dummyContext)

    expect(mockLoggerInfo).toHaveBeenCalled()
    expect(mockLoggerError).not.toHaveBeenCalled()
    expect(mockLoggerInfo).toHaveBeenCalledWith("Lambda execution started.")
    expect(mockLoggerInfo).toHaveBeenCalledWith("Lambda execution completed.")

    const certificate = new X509Certificate(validCertificateContents)
    const formattedDateWithoutComma = new Date(certificate.validTo).toDateString()

    const testString = `Certificate valid-certificate is valid. Expiry date: ${formattedDateWithoutComma}`
    const contextInfo = {
      "secret": {
        "Arn": "valid-arn",
        "Name": "valid-certificate",
        "formattedEndDate": formattedDateWithoutComma
      }
    }
    expect(mockLoggerInfo).toHaveBeenCalledWith(testString, contextInfo)
  })

  it("Log an error when something is wrong", async () => {
    const smMock = mockClient(SecretsManagerClient)
    const validCertificateContents = fs.readFileSync(path.resolve(__dirname, "./mock-certs/valid-cert.pem"), "utf-8")

    smMock.on(BatchGetSecretValueCommand).resolves({
      SecretValues: [
        {
          ARN: "valid-arn",
          CreatedDate: new Date(),
          Name: "valid-certificate",
          SecretString: `aaa_${validCertificateContents}`,
          VersionId: "valid-version-id",
          VersionStages: ["valid-stage"]
        }
      ]
    })
    const mockLoggerInfo = vi.spyOn(Logger.prototype, "info")
    const mockLoggerError = vi.spyOn(Logger.prototype, "error")
    await handler(mockEvent, dummyContext)

    expect(mockLoggerInfo).toHaveBeenCalled()
    expect(mockLoggerError).toHaveBeenCalled()
  })
})

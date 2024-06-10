import * as fs from "fs"
import * as path from "path"
import {mockClient} from "aws-sdk-client-mock"
import {BatchGetSecretValueCommand, SecretsManagerClient} from "@aws-sdk/client-secrets-manager"
import {fileURLToPath} from "url"
import {dirname} from "path"
import {handler} from "../src/certificateChecker"

import {helloworldContext} from "./helloWorldContext"
import {Logger} from "@aws-lambda-powertools/logger"
import {jest} from "@jest/globals"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const dummyContext = helloworldContext
const mockEvent = {
  secretARNs: ["foo"]
}

describe("Unit test for app handler", function () {
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
    const mockLoggerInfo = jest.spyOn(Logger.prototype, "info")
    const mockLoggerError = jest.spyOn(Logger.prototype, "error")
    await handler(mockEvent, dummyContext)

    expect(mockLoggerInfo).toHaveBeenCalled()
    expect(mockLoggerError).not.toHaveBeenCalled()
    expect(mockLoggerInfo).toHaveBeenCalledWith("Lambda execution started.")
    expect(mockLoggerInfo).toHaveBeenCalledWith("Lambda execution completed.")

    const today = new Date()

    const futureDate = new Date(today)
    futureDate.setDate(today.getDate() + 60)
    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      month: "short",
      day: "2-digit",
      year: "numeric"
    }
    const formattedDate = futureDate.toLocaleDateString("en-US", options)
    const formattedDateWithoutComma = formattedDate.replace(/,/g, "")

    const testString = `Certificate valid-certificate is valid. Expiry date: ${formattedDateWithoutComma}`
    expect(mockLoggerInfo).toHaveBeenCalledWith(testString)
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
    const mockLoggerInfo = jest.spyOn(Logger.prototype, "info")
    const mockLoggerError = jest.spyOn(Logger.prototype, "error")
    await handler(mockEvent, dummyContext)

    expect(mockLoggerInfo).toHaveBeenCalled()
    expect(mockLoggerError).toHaveBeenCalled()
  })
})

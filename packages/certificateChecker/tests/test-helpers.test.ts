import * as fs from "fs"
import * as path from "path"
import {checkCertificateExpiry, Secret} from "../src/helpers"
import {Logger} from "@aws-lambda-powertools/logger"
import {jest} from "@jest/globals"
import {fileURLToPath} from "url"
import {dirname} from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

describe("checkCertificateExpiry", () => {
  const logger = new Logger({serviceName: "test"})

  it("should log an info if a certificate has over 30 days left before expiry", () => {
    const mockLoggerInfo = jest.spyOn(Logger.prototype, "info")
    const validCertificateContents = fs.readFileSync(path.resolve(__dirname, "./mock-certs/valid-cert.pem"), "utf-8")

    const validSecret: Secret = {
      ARN: "valid-arn",
      CreatedDate: new Date(),
      Name: "valid-certificate",
      SecretString: validCertificateContents,
      VersionId: "valid-version-id",
      VersionStages: ["valid-stage"]
    }
    checkCertificateExpiry(validSecret, logger)

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
    const contextInfo = {
      "secret": {
        "Arn": "valid-arn",
        "Name": "valid-certificate",
        "formattedEndDate": formattedDateWithoutComma
      }
    }
    expect(mockLoggerInfo).toHaveBeenCalledWith(testString, contextInfo)
  })

  it("should log error for expiring certificate", () => {
    const mockLoggerInfo = jest.spyOn(Logger.prototype, "error")
    const expiringCertificateContents = fs.readFileSync(
      path.resolve(__dirname, "./mock-certs/expiring-cert.pem"),
      "utf-8"
    )
    const expiringSecret: Secret = {
      ARN: "expiring-arn",
      CreatedDate: new Date(),
      Name: "expiring-certificate",
      SecretString: expiringCertificateContents,
      VersionId: "expiring-version-id",
      VersionStages: ["expiring-stage"]
    }
    const today = new Date()

    const futureDate = new Date(today)
    futureDate.setDate(today.getDate() + 23)

    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      month: "short",
      day: "2-digit",
      year: "numeric"
    }

    const formattedDate = futureDate.toLocaleDateString("en-US", options)

    const formattedDateWithoutComma = formattedDate.replace(/,/g, "")

    checkCertificateExpiry(expiringSecret, logger)
    const contextInfo = {
      "secret": {
        "Arn": "expiring-arn",
        "Name": "expiring-certificate",
        "daysToExpiry": 23,
        "formattedEndDate": formattedDateWithoutComma
      }
    }

    expect(mockLoggerInfo).toHaveBeenCalled()
    expect(mockLoggerInfo).toHaveBeenCalledWith(
      "Certificate expiring-certificate expires in 23 days",
      contextInfo
    )
  })

  it("should log a critical warning if a certificate is checked and has expired", () => {
    const mockLoggerInfo = jest.spyOn(Logger.prototype, "critical")
    const expiredCertificateInfo = fs.readFileSync(path.resolve(__dirname, "./mock-certs/expired-cert.pem"), "utf-8")

    const expiredSecret: Secret = {
      ARN: "expired-arn",
      CreatedDate: new Date(),
      Name: "expired-certificate",
      SecretString: expiredCertificateInfo,
      VersionId: "expired-version-id",
      VersionStages: ["expired-stage"]
    }
    checkCertificateExpiry(expiredSecret, logger)

    const today = new Date()

    const pastDate = new Date(today)
    pastDate.setDate(today.getDate() - 2)

    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      month: "short",
      day: "2-digit",
      year: "numeric"
    }

    const formattedDate = pastDate.toLocaleDateString("en-US", options)

    const formattedDateWithoutComma = formattedDate.replace(/,/g, "")

    const contextInfo = {
      "secret": {
        "Arn": "expired-arn",
        "Name": "expired-certificate",
        "formattedEndDate": formattedDateWithoutComma
      }
    }

    expect(mockLoggerInfo).toHaveBeenCalledWith(
      "Certificate expired-certificate has expired",
      contextInfo
    )

  })
})

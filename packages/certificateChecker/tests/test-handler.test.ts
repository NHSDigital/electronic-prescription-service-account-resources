import * as fs from "fs"
import * as path from "path"
import {checkCertificateExpiry} from "../src/helpers"
import {Secret} from "../src/helpers"
import {Logger} from "@aws-lambda-powertools/logger"

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
    expect(mockLoggerInfo).toHaveBeenCalledWith(testString)
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
    checkCertificateExpiry(expiringSecret, logger)

    expect(mockLoggerInfo).toHaveBeenCalled()
    expect(mockLoggerInfo).toHaveBeenCalledWith("Certificate expiring-certificate expires in 23 days")
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

    expect(mockLoggerInfo).toHaveBeenCalledWith("Certificate expired-certificate has expired")

  })
})

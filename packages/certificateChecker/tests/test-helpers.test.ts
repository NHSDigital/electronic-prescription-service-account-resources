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
import {checkCertificateExpiry, Secret} from "../src/helpers"
import {Logger} from "@aws-lambda-powertools/logger"
import {fileURLToPath} from "url"
import {dirname} from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const getCertificateMetadata = (certificateContents: string): {formattedEndDate: string, daysToExpiry: number} => {
  const certificate = new X509Certificate(certificateContents)
  const certificateEndDate = new Date(certificate.validTo)
  const daysToExpiry = Math.ceil((certificateEndDate.getTime() - Date.now()) / (1000 * 3600 * 24))

  return {
    formattedEndDate: certificateEndDate.toDateString(),
    daysToExpiry
  }
}

describe("checkCertificateExpiry", () => {
  const logger = new Logger({serviceName: "test"})

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("should log an info if a certificate has over 30 days left before expiry", () => {
    const mockLoggerInfo = vi.spyOn(Logger.prototype, "info")
    const validCertificateContents = fs.readFileSync(path.resolve(__dirname, "./mock-certs/valid-cert.pem"), "utf-8")
    const {formattedEndDate} = getCertificateMetadata(validCertificateContents)

    const validSecret: Secret = {
      ARN: "valid-arn",
      CreatedDate: new Date(),
      Name: "valid-certificate",
      SecretString: validCertificateContents,
      VersionId: "valid-version-id",
      VersionStages: ["valid-stage"]
    }
    checkCertificateExpiry(validSecret, logger)

    const testString = `Certificate valid-certificate is valid. Expiry date: ${formattedEndDate}`
    const contextInfo = {
      "secret": {
        "Arn": "valid-arn",
        "Name": "valid-certificate",
        "formattedEndDate": formattedEndDate
      }
    }
    expect(mockLoggerInfo).toHaveBeenCalledWith(testString, contextInfo)
  })

  it("should log error for expiring certificate", () => {
    const mockLoggerInfo = vi.spyOn(Logger.prototype, "error")
    const expiringCertificateContents = fs.readFileSync(
      path.resolve(__dirname, "./mock-certs/expiring-cert.pem"),
      "utf-8"
    )
    const {formattedEndDate, daysToExpiry} = getCertificateMetadata(expiringCertificateContents)
    const expiringSecret: Secret = {
      ARN: "expiring-arn",
      CreatedDate: new Date(),
      Name: "expiring-certificate",
      SecretString: expiringCertificateContents,
      VersionId: "expiring-version-id",
      VersionStages: ["expiring-stage"]
    }
    checkCertificateExpiry(expiringSecret, logger)
    const contextInfo = {
      "secret": {
        "Arn": "expiring-arn",
        "Name": "expiring-certificate",
        "daysToExpiry": daysToExpiry,
        "formattedEndDate": formattedEndDate
      }
    }

    expect(mockLoggerInfo).toHaveBeenCalled()
    expect(mockLoggerInfo).toHaveBeenCalledWith(
      `Certificate expiring-certificate expires in ${daysToExpiry} days`,
      contextInfo
    )
  })

  it("should log a critical warning if a certificate is checked and has expired", () => {
    const mockLoggerInfo = vi.spyOn(Logger.prototype, "critical")
    const expiredCertificateInfo = fs.readFileSync(path.resolve(__dirname, "./mock-certs/expired-cert.pem"), "utf-8")
    const {formattedEndDate} = getCertificateMetadata(expiredCertificateInfo)

    const expiredSecret: Secret = {
      ARN: "expired-arn",
      CreatedDate: new Date(),
      Name: "expired-certificate",
      SecretString: expiredCertificateInfo,
      VersionId: "expired-version-id",
      VersionStages: ["expired-stage"]
    }
    checkCertificateExpiry(expiredSecret, logger)
    const contextInfo = {
      "secret": {
        "Arn": "expired-arn",
        "Name": "expired-certificate",
        "formattedEndDate": formattedEndDate
      }
    }

    expect(mockLoggerInfo).toHaveBeenCalledWith(
      "Certificate expired-certificate has expired",
      contextInfo
    )

  })

  it("should log a warning if secret is set to ChangeMe", () => {
    const mockLoggerWarn = vi.spyOn(Logger.prototype, "warn")

    const validSecret: Secret = {
      ARN: "change-me-arn",
      CreatedDate: new Date(),
      Name: "change-me-secret",
      SecretString: "ChangeMe",
      VersionId: "valid-version-id",
      VersionStages: ["valid-stage"]
    }
    checkCertificateExpiry(validSecret, logger)

    const testString = `Secret change-me-secret is still set to ChangeMe`
    const contextInfo = {
      "secret": {
        "Arn": "change-me-arn",
        "Name": "change-me-secret"
      }
    }
    expect(mockLoggerWarn).toHaveBeenCalledWith(testString, contextInfo)
  })
})

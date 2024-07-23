// getSecret.test.ts

import {getSecret} from "../src/helpers"
import {mockClient} from "aws-sdk-client-mock"
import "aws-sdk-client-mock-jest"
import {jest} from "@jest/globals"

import {GetSecretValueCommand, SecretsManagerClient} from "@aws-sdk/client-secrets-manager"

describe("getSecret", () => {
  beforeEach(() => {})

  afterEach(() => {
    jest.clearAllMocks()
  })

  it("should return the correct secret for prescription-status-update-api", async () => {
    const smMock = mockClient(SecretsManagerClient)
    smMock.on(GetSecretValueCommand).resolves({
      ARN: "valid-arn",
      CreatedDate: new Date(),
      Name: "valid-certificate",
      SecretString: "mockPrivateKeyPSU",
      VersionId: "valid-version-id",
      VersionStages: ["valid-stage"]
    })

    const result = await getSecret("prescription-status-update-api")
    expect(result).toBe("mockPrivateKeyPSU")
    expect(smMock).toHaveReceivedCommand(GetSecretValueCommand)
    expect(smMock).toHaveReceivedCommandWith(GetSecretValueCommand, {
      SecretId: "account-resources-PSU-ProxygenPrivateKey"
    })
  })

  it("should return the correct secret for custom-prescription-status-update-api", async () => {
    const smMock = mockClient(SecretsManagerClient)
    smMock.on(GetSecretValueCommand).resolves({
      ARN: "valid-arn",
      CreatedDate: new Date(),
      Name: "valid-certificate",
      SecretString: "mockPrivateKeyCPSU",
      VersionId: "valid-version-id",
      VersionStages: ["valid-stage"]
    })

    const result = await getSecret("custom-prescription-status-update-api")
    expect(result).toBe("mockPrivateKeyCPSU")
    expect(smMock).toHaveReceivedCommand(GetSecretValueCommand)
    expect(smMock).toHaveReceivedCommandWith(GetSecretValueCommand, {
      SecretId: "account-resources-CPSU-ProxygenPrivateKey"
    })
  })

  it("should handle missing secret names gracefully", async () => {
    const smMock = mockClient(SecretsManagerClient)
    await expect(getSecret("unknown-api")).rejects.toThrow()
    expect(smMock).not.toHaveReceivedAnyCommand()
  })
})

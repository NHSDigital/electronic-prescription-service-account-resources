// getSecret.test.ts

import {
  afterEach,
  describe,
  expect,
  it,
  vi
} from "vitest"

import {GetSecretValueCommand, SecretsManagerClient} from "@aws-sdk/client-secrets-manager"
import {mockClient} from "aws-sdk-vitest-mock"

import {getSecret} from "../src/signingHelpers"

describe("getSecret", () => {
  afterEach(() => {
    vi.clearAllMocks()
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

    const result = await getSecret("proxygen-secret-name")
    expect(result).toBe("mockPrivateKeyPSU")
    expect(smMock).toHaveReceivedCommand(GetSecretValueCommand)
    expect(smMock).toHaveReceivedCommandWith(GetSecretValueCommand, {
      SecretId: "proxygen-secret-name"
    })
  })

  it("should handle missing secret names gracefully", async () => {
    const smMock = mockClient(SecretsManagerClient)
    await expect(getSecret("unknown-api")).rejects.toThrow()
    expect(smMock).toHaveReceivedCommandWith(GetSecretValueCommand, {
      SecretId: "unknown-api"
    })
  })
})

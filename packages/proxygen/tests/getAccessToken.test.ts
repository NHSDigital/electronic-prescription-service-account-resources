// getAccessToken.test.ts

import nock from "nock"
import {jest} from "@jest/globals"
import {mockClient} from "aws-sdk-client-mock"
import "aws-sdk-client-mock-jest"
import {GetSecretValueCommand, SecretsManagerClient} from "@aws-sdk/client-secrets-manager"
import jwt from "jsonwebtoken"
import {Proxygen} from "../src/helpers"

jest.unstable_mockModule("../src/uuidHelper", () => ({
  returnUuid: jest.fn().mockReturnValue("mockUuid")
}))
jest.unstable_mockModule("../src/signingHelpers", () => ({
  getSecret: jest.fn().mockReturnValue("mockPrivateKey"),
  createSignedJWT: jest.fn().mockReturnValue("signedJWT")
}))

// import using await to ensure uuidHelper and signingHelpers are mocked properly
const helpers = await import("../src/helpers")
const signingHelpers = await import("../src/signingHelpers")

const realm_url = "https://mock-realm-url"

describe("getAccessToken", () => {
  const mockEvent: Proxygen = {
    apiName: "prescription-status-update-api",
    kid: "mockKid",
    proxygenSecretName: "proxygen-secret-name"
  }
  const mockPrivateKey = "mockPrivateKey"
  const mockAccessToken = "mockAccessToken"

  beforeEach(() => {
    const smMock = mockClient(SecretsManagerClient)
    smMock.on(GetSecretValueCommand).resolves({
      ARN: "valid-arn",
      CreatedDate: new Date(),
      Name: "valid-certificate",
      SecretString: mockPrivateKey,
      VersionId: "valid-version-id",
      VersionStages: ["valid-stage"]
    })
    jest.spyOn(jwt, "sign").mockImplementation(jest.fn(() => "mockSignedJWT"))
  })

  afterEach(() => {
    jest.clearAllMocks()
    nock.cleanAll()
  })

  it("should get the access token successfully", async () => {
    nock(realm_url).post("/protocol/openid-connect/token").reply(200, {access_token: mockAccessToken})

    const result = await helpers.getAccessToken(mockEvent, realm_url)

    expect(signingHelpers.getSecret).toHaveBeenCalledWith(mockEvent.proxygenSecretName)
    expect(signingHelpers.createSignedJWT).toHaveBeenCalledWith(
      mockPrivateKey,
      mockEvent.kid,
      mockEvent.apiName,
      realm_url
    )
    expect(result).toBe(mockAccessToken)
  })
  it("should throw an error if the API call fails", async () => {
    nock(realm_url).post("/protocol/openid-connect/token").reply(500, {error: "Internal Server Error"})

    await expect(helpers.getAccessToken(mockEvent, realm_url)).rejects.toThrow("Request failed with status code 500")

    expect(signingHelpers.getSecret).toHaveBeenCalledWith(mockEvent.proxygenSecretName)
    expect(signingHelpers.createSignedJWT).toHaveBeenCalledWith(
      mockPrivateKey,
      mockEvent.kid,
      mockEvent.apiName,
      realm_url
    )
  })
})

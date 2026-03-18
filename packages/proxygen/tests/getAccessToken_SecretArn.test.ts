// getAccessToken.test.ts

import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi
} from "vitest"
import nock from "nock"
import {mockClient} from "aws-sdk-vitest-mock"
import {GetSecretValueCommand, SecretsManagerClient} from "@aws-sdk/client-secrets-manager"
import jwt from "jsonwebtoken"
import {Proxygen} from "../src/helpers"
import * as helpers from "../src/helpers"
import * as signingHelpers from "../src/signingHelpers"

vi.mock("../src/uuidHelper", () => ({
  returnUuid: vi.fn().mockReturnValue("mockUuid")
}))
const mockPrivateKey = "mockPrivateKey"
const mockKid = "mockKid"

const {getSecretMock, createSignedJWTMock} = vi.hoisted(() => ({
  getSecretMock: vi.fn(async (secretName: string) => {
    if (secretName === "proxygen-secret-name-PrivateKey-ptl") {
      return mockPrivateKey
    }
    if (secretName === "proxygen-secret-name-kid-ptl") {
      return mockKid
    }
    if (secretName === "proxygen-secret-name-PrivateKey-prod") {
      return `${mockPrivateKey}-prod`
    }
    if (secretName === "proxygen-secret-name-kid-prod") {
      return `${mockKid}-prod`
    }
    throw new Error("Unexpected secret name: " + secretName)
  }),
  createSignedJWTMock: vi.fn().mockReturnValue("signedJWT")
}))

vi.mock("../src/signingHelpers", () => ({
  getSecret: getSecretMock,
  createSignedJWT: createSignedJWTMock
}))

const realm_url = "https://mock-realm-url"

describe("getAccessToken - proxygen secret name passed in", () => {
  const mockEvent: Proxygen = {
    apiName: "prescription-status-update-api",
    kid: "mockKid",
    proxygenSecretName: "proxygen-secret-name",
    environment: "dev"
  }
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
    vi.spyOn(jwt, "sign").mockImplementation(() => "mockSignedJWT")
  })

  afterEach(() => {
    vi.clearAllMocks()
    nock.cleanAll()
  })

  it("should get the access token successfully when apiClient is not provided", async () => {
    nock(realm_url).post("/protocol/openid-connect/token").reply(200, {access_token: mockAccessToken})

    const result = await helpers.getAccessToken(mockEvent, realm_url)

    expect(signingHelpers.getSecret).toHaveBeenCalledWith(`${mockEvent.proxygenSecretName}-PrivateKey-ptl`)
    expect(signingHelpers.getSecret).toHaveBeenCalledWith(`${mockEvent.proxygenSecretName}-kid-ptl`)
    expect(signingHelpers.createSignedJWT).toHaveBeenCalledWith(
      mockPrivateKey,
      mockKid,
      mockEvent.apiName,
      realm_url,
      undefined
    )
    expect(result).toBe(mockAccessToken)
  })

  it("should get the access token successfully when apiClient is provided", async () => {
    const mockEventWithApiClient: Proxygen = {
      ...mockEvent,
      apiClient: "custom-api-client"
    }
    nock(realm_url).post("/protocol/openid-connect/token").reply(200, {access_token: mockAccessToken})

    const result = await helpers.getAccessToken(mockEventWithApiClient, realm_url)

    expect(signingHelpers.getSecret)
      .toHaveBeenCalledWith(`${mockEventWithApiClient.proxygenSecretName}-PrivateKey-ptl` )
    expect(signingHelpers.getSecret)
      .toHaveBeenCalledWith(`${mockEventWithApiClient.proxygenSecretName}-kid-ptl`)
    expect(signingHelpers.createSignedJWT).toHaveBeenCalledWith(
      mockPrivateKey,
      mockKid,
      mockEventWithApiClient.apiName,
      realm_url,
      mockEventWithApiClient.apiClient
    )
    expect(result).toBe(mockAccessToken)
  })

  it("should throw an error if the API call fails", async () => {
    nock(realm_url).post("/protocol/openid-connect/token").reply(500, {error: "Internal Server Error"})

    await expect(helpers.getAccessToken(mockEvent, realm_url)).rejects.toThrow("Request failed with status code 500")

    expect(signingHelpers.getSecret).toHaveBeenCalledWith(`${mockEvent.proxygenSecretName}-PrivateKey-ptl`)
    expect(signingHelpers.getSecret).toHaveBeenCalledWith(`${mockEvent.proxygenSecretName}-kid-ptl`)
    expect(signingHelpers.createSignedJWT).toHaveBeenCalledWith(
      mockPrivateKey,
      mockKid,
      mockEvent.apiName,
      realm_url,
      undefined
    )
  })

  it("should get the prod credentials when environment is prod", async () => {
    const mockEvent: Proxygen = {
      apiName: "prescription-status-update-api",
      kid: "mockKid",
      proxygenSecretName: "proxygen-secret-name",
      environment: "prod"
    }

    nock(realm_url).post("/protocol/openid-connect/token").reply(200, {access_token: mockAccessToken})

    const result = await helpers.getAccessToken(mockEvent, realm_url)

    expect(signingHelpers.getSecret).toHaveBeenCalledWith(`${mockEvent.proxygenSecretName}-PrivateKey-prod`)
    expect(signingHelpers.getSecret).toHaveBeenCalledWith(`${mockEvent.proxygenSecretName}-kid-prod`)
    expect(signingHelpers.createSignedJWT).toHaveBeenCalledWith(
      `${mockPrivateKey}-prod`,
      `${mockKid}-prod`,
      mockEvent.apiName,
      realm_url,
      undefined
    )
    expect(result).toBe(mockAccessToken)
  })

})

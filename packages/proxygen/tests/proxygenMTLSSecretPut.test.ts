/* eslint-disable @typescript-eslint/consistent-type-assertions */

import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi
} from "vitest"
import nock from "nock"
import jwt from "jsonwebtoken"

import {Proxygen} from "../src/helpers"
import {GetSecretValueCommand, SecretsManagerClient} from "@aws-sdk/client-secrets-manager"
import {mockClient} from "aws-sdk-vitest-mock"
import {Context} from "aws-lambda"
import {Logger} from "@aws-lambda-powertools/logger"

let getSecretMock = vi.fn(async (secretName: string) => {
  if (secretName === "testSecretKeyName") {
    return "mockSecretKey"
  } else if (secretName === "testSecretCertName") {
    return "mockSecretCert"
  } else if (secretName === "testProxygenSecret") {
    return "mockProxygenSecret"
  }
  throw new Error("Unexpected secret name: " + secretName)
})
vi.mock("../src/signingHelpers", () => ({
  getSecret: getSecretMock,
  createSignedJWT: vi.fn().mockReturnValue("signedJWT")
}))

// import using await to ensure uuidHelper and signingHelpers are mocked properly
await import("../src/helpers")
await import("../src/signingHelpers")
const handler = await import("../src/proxygenMTLSSecretPut")

const validProxygen: Proxygen = {
  apiName: "testApi",
  proxygenSecretName: "testProxygenSecret",
  kid: "testKid",
  environment: "dev",
  secretName: "testSecretName",
  secretKey: "testSecretKey",
  secretCert: "testSecretCert"
}
const realm_url = "https://identity.prod.api.platform.nhs.uk/realms/api-producers"

describe("Unit test for proxygenMTLSSecretPut", function () {
  let _SAVED_ALLOWED_ENVIRONMENTS: string | undefined
  const mockPrivateKey = "mockPrivateKey"
  const mockAccessToken = "mockAccessToken"

  beforeEach(() => {
    vi.resetModules()
    _SAVED_ALLOWED_ENVIRONMENTS = process.env.ALLOWED_ENVIRONMENTS

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
    process.env.ALLOWED_ENVIRONMENTS = _SAVED_ALLOWED_ENVIRONMENTS
    vi.clearAllMocks()
    nock.cleanAll()
  })

  it("throws error if missing required property on input", async () => {
    await expect(handler.handler({} as Proxygen, {} as Context)).rejects.toThrow(
      "Input is one of missing required keys: apiName,proxygenSecretName,kid,environment,secretName. Input keys: "
    )
  })

  it("throws error if neither secret option is provided", async () => {
    process.env.ALLOWED_ENVIRONMENTS = "dev"
    await expect(handler.handler({
      apiName: "testApi",
      proxygenSecretName: "testProxygenSecret",
      kid: "testKid",
      environment: "dev",
      secretName: "testSecretName"
    } as Proxygen, {} as Context)).rejects.toThrow(
      "Either secretCert and secretKey or secretCertName and secretKeyName must be provided"
    )
  })

  it("throws error if environment is not allowed", async () => {
    process.env.ALLOWED_ENVIRONMENTS = "int,sandbox,prod"

    await expect(handler.handler(validProxygen, {} as Context)).rejects.toThrow(
      "environment dev is invalid. Allowed environments: int,sandbox,prod"
    )
  })

  it("throws error if proxygen responds with error", async () => {
    nock(realm_url).post("/protocol/openid-connect/token").reply(200, {access_token: mockAccessToken})
    nock("https://proxygen.prod.api.platform.nhs.uk")
      .put("/apis/testApi/environments/dev/secrets/mtls/testSecretName")
      .reply(500, {foo_error: "bar_error"})

    process.env.ALLOWED_ENVIRONMENTS = "dev"
    const mockLoggerError = vi.spyOn(Logger.prototype, "error")

    await expect(handler.handler(validProxygen, {} as Context)).rejects.toThrow("Axios error")
    expect(mockLoggerError).toHaveBeenCalledTimes(1)

    const loggerCallParams = mockLoggerError.mock.calls[0]
    expect(loggerCallParams[0]).toEqual("Error in response to call to proxygen")
    expect(loggerCallParams[1]).toEqual({
      axiosError: expect.objectContaining({
        code: "ERR_BAD_RESPONSE",
        status: 500,
        message: "Request failed with status code 500",
        config: expect.objectContaining({
          headers: expect.objectContaining({
            Accept: "application/json, text/plain, */*",
            Authorization: "Bearer mockAccessToken",
            "Accept-Encoding": "gzip, compress, deflate, br"
          }),
          method: "put",
          url: "https://proxygen.prod.api.platform.nhs.uk/apis/testApi/environments/dev/secrets/mtls/testSecretName"
        }),
        request: {
          headers: undefined,
          method: "PUT",
          path: "/apis/testApi/environments/dev/secrets/mtls/testSecretName"
        },
        response: {
          data: {
            foo_error: "bar_error"
          },
          headers: expect.objectContaining({
            "content-type": "application/json"
          }),
          status: 500,
          statusText: "Internal Server Error"
        }
      })
    })
  })

  it("throws error if proxygen request fails", async () => {
    nock(realm_url).post("/protocol/openid-connect/token").reply(200, {access_token: mockAccessToken})
    nock("https://proxygen.prod.api.platform.nhs.uk")
      .put("/apis/testApi/environments/dev/secrets/mtls/testSecretName")
      .replyWithError("Something awful happened")

    process.env.ALLOWED_ENVIRONMENTS = "dev"
    const mockLoggerError = vi.spyOn(Logger.prototype, "error")

    await expect(handler.handler(validProxygen, {} as Context)).rejects.toThrow("Axios error")
    expect(mockLoggerError).toHaveBeenCalledTimes(1)

    const loggerCallParams = mockLoggerError.mock.calls[0]
    expect(loggerCallParams[0]).toEqual("Error in request to call to proxygen")
    expect(loggerCallParams[1]).toEqual({
      axiosError: expect.objectContaining({
        message: "Something awful happened",
        config: expect.objectContaining({
          headers: expect.objectContaining({
            Accept: "application/json, text/plain, */*",
            Authorization: "Bearer mockAccessToken",
            "Accept-Encoding": "gzip, compress, deflate, br"
          }),
          method: "put",
          url: "https://proxygen.prod.api.platform.nhs.uk/apis/testApi/environments/dev/secrets/mtls/testSecretName"
        })
      })
    })
  })

  it("should work with secretCert and secretKey", async () => {
    nock(realm_url).post("/protocol/openid-connect/token").reply(200, {access_token: mockAccessToken})
    nock("https://proxygen.prod.api.platform.nhs.uk")
      .put("/apis/testApi/environments/dev/secrets/mtls/testSecretName")
      .reply(200, {foo: "bar"})

    process.env.ALLOWED_ENVIRONMENTS = "dev"

    const res = await handler.handler(validProxygen, {} as Context)
    expect(res).toMatchObject({foo: "bar"})
  })

  it("should work with secretCertName and secretKeyName", async () => {
    nock(realm_url).post("/protocol/openid-connect/token").reply(200, {access_token: mockAccessToken})
    nock("https://proxygen.prod.api.platform.nhs.uk")
      .put("/apis/testApi/environments/dev/secrets/mtls/testSecretName")
      .reply(200, {foo: "bar"})

    process.env.ALLOWED_ENVIRONMENTS = "dev"

    const proxygenWithSecretNames: Proxygen = {
      apiName: "testApi",
      proxygenSecretName: "testProxygenSecret",
      kid: "testKid",
      environment: "dev",
      secretName: "testSecretName",
      secretKeyName: "testSecretKeyName",
      secretCertName: "testSecretCertName"
    }

    const res = await handler.handler(proxygenWithSecretNames, {} as Context)
    expect(res).toMatchObject({foo: "bar"})
  })
})

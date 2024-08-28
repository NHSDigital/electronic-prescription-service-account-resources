/* eslint-disable @typescript-eslint/consistent-type-assertions */
/* eslint-disable  max-len */
import nock from "nock"

import {
  jest,
  expect,
  describe,
  it
} from "@jest/globals"
import jwt from "jsonwebtoken"

import {Proxygen} from "../src/helpers"
import {GetSecretValueCommand, SecretsManagerClient} from "@aws-sdk/client-secrets-manager"
import {mockClient} from "aws-sdk-client-mock"
import {Context} from "aws-lambda"
import {Logger} from "@aws-lambda-powertools/logger"

jest.unstable_mockModule("../src/signingHelpers", () => ({
  getSecret: jest.fn().mockReturnValue("mockPrivateKey"),
  createSignedJWT: jest.fn().mockReturnValue("signedJWT")
}))

// import using await to ensure uuidHelper and signingHelpers are mocked properly
await import("../src/helpers")
await import("../src/signingHelpers")
const handler = await import("../src/proxygenMTLSSecretPut")

const validProxygen: Proxygen = {
  apiName: "testApi",
  proxygenSecretName: "testSecret",
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
    jest.resetModules()
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
    jest.spyOn(jwt, "sign").mockImplementation(jest.fn(() => "mockSignedJWT"))
  })

  afterEach(() => {
    process.env.ALLOWED_ENVIRONMENTS = _SAVED_ALLOWED_ENVIRONMENTS
    jest.clearAllMocks()
    nock.cleanAll()
  })

  it("throws error if missing required property on input", async () => {
    await expect(handler.handler({} as Proxygen, {} as Context)).rejects.toThrow(
      "Input is one of missing required keys: apiName,proxygenSecretName,kid,environment,secretName,secretKey,secretCert. Input keys: "
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
    const mockLoggerError = jest.spyOn(Logger.prototype, "error")

    await expect(handler.handler(validProxygen, {} as Context)).rejects.toThrow("Axios error")
    expect(mockLoggerError).toBeCalledTimes(1)

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
          headers: expect.objectContaining({
            accept: "application/json, text/plain, */*",
            authorization: "Bearer mockAccessToken",
            "accept-encoding": "gzip, compress, deflate, br",
            host: "proxygen.prod.api.platform.nhs.uk"
          }),
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
          statusText: null
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
    const mockLoggerError = jest.spyOn(Logger.prototype, "error")

    await expect(handler.handler(validProxygen, {} as Context)).rejects.toThrow("Axios error")
    expect(mockLoggerError).toBeCalledTimes(1)

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

  it("should work if everything is OK", async () => {
    nock(realm_url).post("/protocol/openid-connect/token").reply(200, {access_token: mockAccessToken})
    nock("https://proxygen.prod.api.platform.nhs.uk")
      .put("/apis/testApi/environments/dev/secrets/mtls/testSecretName")
      .reply(200, {foo: "bar"})

    process.env.ALLOWED_ENVIRONMENTS = "dev"

    const res = await handler.handler(validProxygen, {} as Context)
    expect(res).toMatchObject({foo: "bar"})
  })
})

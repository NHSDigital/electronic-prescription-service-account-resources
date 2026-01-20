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

import type {Proxygen} from "../src/helpers"
import {GetSecretValueCommand, SecretsManagerClient} from "@aws-sdk/client-secrets-manager"
import {mockClient} from "aws-sdk-vitest-mock"
import {Context} from "aws-lambda"
import {Logger} from "@aws-lambda-powertools/logger"
import {handler as proxygenSpecPublishHandler} from "../src/proxygenSpecPublish"

const mockedSigningHelpers = vi.hoisted(() => ({
  getSecret: vi.fn().mockReturnValue("mockPrivateKey"),
  createSignedJWT: vi.fn().mockReturnValue("signedJWT")
}))

vi.mock("../src/signingHelpers", () => mockedSigningHelpers)

const validProxygen: Proxygen = {
  apiName: "testApi",
  proxygenSecretName: "testSecret",
  kid: "testKid",
  environment: "dev",
  specDefinition: {foo: "bar"}
}
const realm_url = "https://identity.prod.api.platform.nhs.uk/realms/api-producers"

describe("Unit test for proxygenSpecPublish", function () {
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
    await expect(proxygenSpecPublishHandler({} as Proxygen, {} as Context)).rejects.toThrow(
      "Input is one of missing required keys: apiName,proxygenSecretName,kid,environment,specDefinition. Input keys: "
    )
  })

  it("throws error if environment is not allowed", async () => {
    process.env.ALLOWED_ENVIRONMENTS = "int,sandbox,prod"

    await expect(proxygenSpecPublishHandler(validProxygen, {} as Context)).rejects.toThrow(
      "environment dev is invalid. Allowed environments: int,sandbox,prod"
    )
  })

  it("throws error if environment is not uat or prod", async () => {
    process.env.ALLOWED_ENVIRONMENTS = "dev,uat"
    nock(realm_url).post("/protocol/openid-connect/token").reply(200, {access_token: mockAccessToken})

    // eslint-disable-next-line max-len
    await expect(proxygenSpecPublishHandler(validProxygen, {} as Context)).rejects.toThrow("Environment is not uat or prod")
  })

  it("throws error if proxygen responds with error", async () => {
    nock(realm_url).post("/protocol/openid-connect/token").reply(200, {access_token: mockAccessToken})
    nock("https://proxygen.prod.api.platform.nhs.uk")
      .put("/apis/testApi/spec/uat")
      .reply(500, {foo_error: "bar_error"})

    process.env.ALLOWED_ENVIRONMENTS = "uat"
    validProxygen.environment = "uat"
    const mockLoggerError = vi.spyOn(Logger.prototype, "error")

    // eslint-disable-next-line max-len
    await expect(proxygenSpecPublishHandler(validProxygen, {} as Context)).rejects.toThrow("Axios error. Status code: 500")
    expect(mockLoggerError).toHaveBeenCalledTimes(1)

    const loggerCallParams = mockLoggerError.mock.calls[0]
    expect(loggerCallParams[0]).toEqual("Error in response to call to proxygen")
    expect(loggerCallParams[1]).toEqual({
      axiosError: expect.objectContaining({
        code: "ERR_BAD_RESPONSE",
        status: 500,
        message: "Request failed with status code 500",
        config: {
          data: "{\"foo\":\"bar\"}",
          headers: expect.objectContaining({
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json",
            Authorization: "Bearer mockAccessToken",
            "Accept-Encoding": "gzip, compress, deflate, br"
          }),
          method: "put",
          url: "https://proxygen.prod.api.platform.nhs.uk/apis/testApi/spec/uat"
        },
        request: {
          headers: undefined,
          method: "PUT",
          path: "/apis/testApi/spec/uat"
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
      .put("/apis/testApi/spec/uat")
      .replyWithError("Something awful happened")

    process.env.ALLOWED_ENVIRONMENTS = "uat"
    validProxygen.environment = "uat"
    const mockLoggerError = vi.spyOn(Logger.prototype, "error")

    await expect(proxygenSpecPublishHandler(validProxygen, {} as Context)).rejects.toThrow("Axios error")
    expect(mockLoggerError).toHaveBeenCalledTimes(1)

    const loggerCallParams = mockLoggerError.mock.calls[0]
    expect(loggerCallParams[0]).toEqual("Error in request to call to proxygen")
    expect(loggerCallParams[1]).toEqual({
      axiosError: expect.objectContaining({
        message: "Something awful happened",
        config: {
          data: "{\"foo\":\"bar\"}",
          headers: expect.objectContaining({
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json",
            Authorization: "Bearer mockAccessToken",
            "Accept-Encoding": "gzip, compress, deflate, br"
          }),
          method: "put",
          url: "https://proxygen.prod.api.platform.nhs.uk/apis/testApi/spec/uat"
        }
      })
    })
  })

  it("should work if everything is OK for uat", async () => {
    nock(realm_url).post("/protocol/openid-connect/token").reply(200, {access_token: mockAccessToken})
    nock("https://proxygen.prod.api.platform.nhs.uk").put("/apis/testApi/spec/uat").reply(200, {foo: "bar"})

    process.env.ALLOWED_ENVIRONMENTS = "uat"
    validProxygen.environment = "uat"

    const res = await proxygenSpecPublishHandler(validProxygen, {} as Context)
    expect(res).toMatchObject({foo: "bar"})
  })

  it("should work if everything is OK for prod", async () => {
    nock(realm_url).post("/protocol/openid-connect/token").reply(200, {access_token: mockAccessToken})
    nock("https://proxygen.prod.api.platform.nhs.uk").put("/apis/testApi/spec").reply(200, {foo: "bar"})

    process.env.ALLOWED_ENVIRONMENTS = "prod"
    validProxygen.environment = "prod"

    const res = await proxygenSpecPublishHandler(validProxygen, {} as Context)
    expect(res).toMatchObject({foo: "bar"})
  })
})

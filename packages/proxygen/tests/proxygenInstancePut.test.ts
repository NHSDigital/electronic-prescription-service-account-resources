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
const handler = await import("../src/proxygenInstancePut")

const validProxygen: Proxygen = {
  apiName: "testApi",
  proxygenSecretName: "testSecret",
  kid: "testKid",
  environment: "dev",
  instance: "testInstance",
  specDefinition: {foo: "bar"}
}
const realm_url = "https://identity.prod.api.platform.nhs.uk/realms/api-producers"

describe("Unit test for proxygenInstancePut", function () {
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
      "Input is one of missing required keys: apiName,proxygenSecretName,kid,environment,instance,specDefinition. Input keys: "
    )
  })

  it("throws error if environment is not allowed", async () => {
    process.env.ALLOWED_ENVIRONMENTS = "int,sandbox,prod"

    await expect(handler.handler(validProxygen, {} as Context)).rejects.toThrow(
      "environment dev is invalid. Allowed environments: int,sandbox,prod"
    )
  })

  it("throws error if proxygen call fails", async () => {

    nock(realm_url).post("/protocol/openid-connect/token").reply(200, {access_token: mockAccessToken})
    nock("https://proxygen.prod.api.platform.nhs.uk")
      .put("/apis/testApi/environments/dev/instances/testInstance")
      .reply(500, {foo_error: "bar"})

    process.env.ALLOWED_ENVIRONMENTS = "dev"
    const mockLoggerError = jest.spyOn(Logger.prototype, "error")

    await expect(handler.handler(validProxygen, {} as Context)).rejects.toThrow("Axios error")
    expect(mockLoggerError).toBeCalledTimes(1)

    const loggerCallParams = mockLoggerError.mock.calls[0]
    expect(loggerCallParams[0]).toEqual("Error in response to call to proxygen")
    expect(loggerCallParams[1]).toEqual(expect.objectContaining(
      {
        "errorMessage": "Request failed with status code 500",
        "request": expect.objectContaining({
          "headers": expect.objectContaining({
            "accept": "application/json, text/plain, */*",
            "accept-encoding": "gzip, compress, deflate, br",
            "authorization": "Bearer mockAccessToken",
            "content-type": "application/json",
            "host": "proxygen.prod.api.platform.nhs.uk"
          }),
          "method": "PUT",
          body: "{\"foo\":\"bar\"}",
          "path": "/apis/testApi/environments/dev/instances/testInstance"
        }),
        response: expect.objectContaining({
          status: 500,
          data: expect.objectContaining({foo_error: "bar"}),
          "headers": expect.objectContaining({
            "content-type": "application/json"
          })
        })
      }
    ))
  })

  it("should work if everything is OK", async () => {
    let actualBody
    nock(realm_url).post("/protocol/openid-connect/token").reply(200, {access_token: mockAccessToken})
    nock("https://proxygen.prod.api.platform.nhs.uk")
      .put("/apis/testApi/environments/dev/instances/testInstance", (body) => {
        actualBody = body
        return body
      })
      .reply(200, {foo: "bar"})

    process.env.ALLOWED_ENVIRONMENTS = "dev"

    const res = await handler.handler(validProxygen, {} as Context)
    expect(res).toMatchObject({foo: "bar"})
    expect(actualBody).toMatchObject({foo: "bar"})
  })
})

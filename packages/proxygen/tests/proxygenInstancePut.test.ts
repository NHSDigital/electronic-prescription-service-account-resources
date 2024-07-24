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

  beforeEach(() => {
    process.env.ALLOWED_ENVIRONMENTS = _SAVED_ALLOWED_ENVIRONMENTS
    jest.clearAllMocks()
    nock.cleanAll()
  })

  it("throws error if missing required property on input", async () => {
    await expect(handler.handler({}, {})).rejects.toThrow("input is missing required keys")
  })

  it("throws error if environment is not allowed", async () => {
    process.env.ALLOWED_ENVIRONMENTS = "int,sandbox,prod"

    await expect(handler.handler(validProxygen, {})).rejects.toThrow(
      "environment dev is invalid. Allowed environments: int,sandbox,prod"
    )
  })

  it("throws error if proxygen call fails", async () => {
    nock(realm_url).post("/protocol/openid-connect/token").reply(200, {access_token: mockAccessToken})
    nock("https://proxygen.prod.api.platform.nhs.uk")
      .put("/apis/testApi/environments/dev/instances/testInstance")
      .reply(500, {foo: "bar"})

    process.env.ALLOWED_ENVIRONMENTS = "dev"

    await expect(handler.handler(validProxygen, {})).rejects.toThrow("Request failed with status code 500")
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

    const res = await handler.handler(validProxygen, {})
    expect(res).toMatchObject({foo: "bar"})
    expect(actualBody).toMatchObject({foo: "bar"})
  })
})

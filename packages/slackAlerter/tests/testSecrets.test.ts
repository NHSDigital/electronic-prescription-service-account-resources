import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi
} from "vitest"

import {getSecrets} from "../src/secrets"
import {SecretsStore} from "../src/types"

const originalEnv = process.env
const fetchMock = vi.fn()

const mockJsonResponse = (body: unknown, init?: {status?: number}) => {
  const status = init?.status ?? 200
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body
  }
}

beforeAll(() => {
  vi.stubGlobal("fetch", fetchMock)
})

afterAll(() => {
  vi.unstubAllGlobals()
})

describe("Secrets", () => {
  beforeEach(() => {
    fetchMock.mockReset()
  })

  afterEach(() => {
    process.env = {...originalEnv}
  })

  //Happy Path
  it("returns secret value when called with parameterStore store secret", async () => {
    fetchMock.mockResolvedValueOnce(mockJsonResponse({
      Parameter: {
        Name: "someParameterSecret",
        Value: "some value"
      }
    }))

    const actual = await getSecrets(["someParameterSecret"], "parameterStore")
    expect(actual).toEqual({someParameterSecret: "some value"})
  })

  it("requests the secrets extension with the correct url when called with a parameterStore store secret", async () => {
    fetchMock.mockResolvedValueOnce(mockJsonResponse({
      Parameter: {
        Name: "someParameterSecret",
        Type: "SecureString",
        Value: "some value"
      }
    }))

    await getSecrets(["someParameterSecret"], "parameterStore")
    const expectedRequest = [
      "http://localhost:2773/systemsmanager/parameters/get?name=someParameterSecret&withDecryption=true",
      {
        headers: {
          "X-Aws-Parameters-Secrets-Token": "76b6033a-232c-4b5c-8d92-39760202b2d8"
        },
        method: "GET"
      }
    ]
    expect(fetchMock.mock.calls[0]).toEqual(expectedRequest)
  })

  it("returns secret value when called with secretsManager store secret", async () => {
    fetchMock.mockResolvedValueOnce(mockJsonResponse({
      Name: "someSecretsManagerSecret",
      SecretString: "some value"
    }))

    const actual = await getSecrets(["someSecretsManagerSecret"], "secretsManager")
    expect(actual).toEqual({someSecretsManagerSecret: "some value"})
  })

  it("requests the secrets extension with the correct url when called with a secretsManager store secret", async () => {
    fetchMock.mockResolvedValueOnce(mockJsonResponse({
      Name: "someSecretsManagerSecret",
      SecretString: "some value"
    }))

    await getSecrets(["someSecretsManagerSecret"], "secretsManager")
    const expectedRequest = [
      "http://localhost:2773/secretsmanager/get?secretId=someSecretsManagerSecret",
      {
        headers: {
          "X-Aws-Parameters-Secrets-Token": "76b6033a-232c-4b5c-8d92-39760202b2d8"
        },
        method: "GET"
      }
    ]
    expect(fetchMock.mock.calls[0]).toEqual(expectedRequest)
  })

  it("throws Error when AWS_SESSION_TOKEN is not set", async () => {
    process.env.AWS_SESSION_TOKEN = undefined

    await expect(getSecrets(["someParameterSecret"], "parameterStore"))
      .rejects.toThrow("AWS_SESSION_TOKEN not set")
  })

  it("throws Error when EXTENSION_HTTP_PORT is not set", async () => {
    process.env.PARAMETERS_SECRETS_EXTENSION_HTTP_PORT = undefined

    await expect(getSecrets(["someParameterSecret"], "parameterStore"))
      .rejects.toThrow("EXTENSION_HTTP_PORT not set")
  })

  it("throws Error when secretStore is not a valid option", async () => {
    const store = "someOtherStore" as SecretsStore

    await expect(getSecrets(["someSecret"], store)).rejects.toThrow("Invalid secrets store")
  })

  it("throws Error when an error response is received from the secrets extension", async () => {
    fetchMock.mockResolvedValueOnce(mockJsonResponse({}, {status: 400}))

    await expect(getSecrets(["someParameterSecret"], "parameterStore"))
      .rejects.toThrow("Error response received from secrets extension")
  })

  it("throws Error when an error occurs requesting the secrets extension", async () => {
    fetchMock.mockRejectedValueOnce(new Error("Mock fetch error"))

    await expect(getSecrets(["someParameterSecret"], "parameterStore"))
      .rejects.toThrow("Mock fetch error")
  })
})

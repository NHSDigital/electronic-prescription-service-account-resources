// createSignedJWT.test.ts

import {
  afterEach,
  describe,
  expect,
  it,
  vi
} from "vitest"
import jwt from "jsonwebtoken"

vi.mock("../src/uuidHelper", () => ({
  returnUuid: vi.fn().mockReturnValue("mockUuid")
}))

// import using await to ensure uuidHelper is mocked properly
const helpers = await import("../src/signingHelpers")

describe("createSignedJWT", () => {
  const mockPrivateKey = "mockPrivateKey"
  const mockKid = "mockKid"
  const mockApiName = "mockApiName"
  const mockUuid = "mockUuid"
  const mockRealmUrl = "https://identity.prod.api.platform.nhs.uk/realms/api-producers"

  afterEach(() => {
    vi.clearAllMocks()
  })

  it("should create a signed JWT with the correct payload and header", () => {
    vi.spyOn(jwt, "sign").mockImplementation(() => "mockSignedJWT")
    const result = helpers.createSignedJWT(mockPrivateKey, mockKid, mockApiName, mockRealmUrl)
    const currentTimestamp = Math.floor(Date.now() / 1000)

    const expectedPayload = {
      sub: `${mockApiName}-client`,
      iss: `${mockApiName}-client`,
      jti: mockUuid,
      aud: mockRealmUrl,
      exp: currentTimestamp + 180
    }

    const expectedHeader = {
      typ: "JWT",
      alg: "RS512",
      kid: mockKid
    }

    expect(result).toBe("mockSignedJWT")
    expect(jwt.sign).toHaveBeenCalledWith(JSON.stringify(expectedPayload), mockPrivateKey, {
      algorithm: "RS512",
      header: expectedHeader
    })
  })

  it("should handle different input values correctly", () => {
    vi.spyOn(jwt, "sign").mockImplementation(() => "mockSignedJWT")
    const newPrivateKey = "newMockPrivateKey"
    const newKid = "newMockKid"
    const newApiName = "newMockApiName"

    const result = helpers.createSignedJWT(newPrivateKey, newKid, newApiName, mockRealmUrl)
    const currentTimestamp = Math.floor(Date.now() / 1000)

    const expectedPayload = {
      sub: `${newApiName}-client`,
      iss: `${newApiName}-client`,
      jti: mockUuid,
      aud: mockRealmUrl,
      exp: currentTimestamp + 180
    }

    const expectedHeader = {
      typ: "JWT",
      alg: "RS512",
      kid: newKid
    }

    expect(jwt.sign).toHaveBeenCalledWith(JSON.stringify(expectedPayload), newPrivateKey, {
      algorithm: "RS512",
      header: expectedHeader
    })
    expect(result).toBe("mockSignedJWT")
  })

  it("should use apiClient-client in sub and iss when apiClient is provided", () => {
    vi.spyOn(jwt, "sign").mockImplementation(() => "mockSignedJWT")
    const mockApiClient = "custom-api-client"
    const result = helpers.createSignedJWT(mockPrivateKey, mockKid, mockApiName, mockRealmUrl, mockApiClient)
    const currentTimestamp = Math.floor(Date.now() / 1000)

    const expectedPayload = {
      sub: `${mockApiClient}-client`,
      iss: `${mockApiClient}-client`,
      jti: mockUuid,
      aud: mockRealmUrl,
      exp: currentTimestamp + 180
    }

    const expectedHeader = {
      typ: "JWT",
      alg: "RS512",
      kid: mockKid
    }

    expect(result).toBe("mockSignedJWT")
    expect(jwt.sign).toHaveBeenCalledWith(JSON.stringify(expectedPayload), mockPrivateKey, {
      algorithm: "RS512",
      header: expectedHeader
    })
  })
})

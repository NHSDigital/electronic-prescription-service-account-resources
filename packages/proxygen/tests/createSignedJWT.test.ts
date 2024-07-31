// createSignedJWT.test.ts

import jwt from "jsonwebtoken"
import {jest} from "@jest/globals"

jest.unstable_mockModule("../src/uuidHelper", () => ({
  returnUuid: jest.fn().mockReturnValue("mockUuid")
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
    jest.clearAllMocks()
  })

  it("should create a signed JWT with the correct payload and header", () => {
    jest.spyOn(jwt, "sign").mockImplementation(jest.fn(() => "mockSignedJWT"))
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
    jest.spyOn(jwt, "sign").mockImplementation(jest.fn(() => "mockSignedJWT"))
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
})

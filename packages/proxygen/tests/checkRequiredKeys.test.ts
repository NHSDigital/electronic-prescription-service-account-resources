/* eslint-disable  max-len */

import {checkRequiredKeys, Proxygen} from "../src/helpers"

// Mock data
const validProxygen: Proxygen = {
  apiName: "testApi",
  proxygenSecretName: "testSecret",
  kid: "testKid"
}

describe("checkRequiredKeys", () => {
  it("should not throw an error if all default required keys are present", () => {
    expect(() => checkRequiredKeys(validProxygen, [])).not.toThrow()
  })

  it("should throw an error if a required key is missing", () => {
    const requiredKeys = ["missingKey"]
    expect(() => checkRequiredKeys(validProxygen, requiredKeys)).toThrow(
      "Input is one of missing required keys: apiName,proxygenSecretName,kid,missingKey. Input keys: apiName,proxygenSecretName,kid"
    )
  })

  it("should throw an error if obj is empty", () => {
    expect(() => checkRequiredKeys({} as Proxygen, [])).toThrow(
      "Input is one of missing required keys: apiName,proxygenSecretName,kid. Input keys: "
    )
  })

  it("should not throw an error if obj has extra non required keys", () => {
    const objWithExtraKeys = {
      ...validProxygen,
      extraKey: "extraValue"
    }
    expect(() => checkRequiredKeys(objWithExtraKeys, [])).not.toThrow()
  })

  it("should not throw an error if obj has extra required keys", () => {
    const requiredKeys = ["environment"]
    const objWithExtraKeys = {
      ...validProxygen,
      environment: "extraValue"
    }
    expect(() => checkRequiredKeys(objWithExtraKeys, requiredKeys)).not.toThrow()
  })

  it("should throw an error if obj has missing required default keys", () => {
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    const objWithMissingKeys: any = {
      ...validProxygen,
      environment: "extraValue"
    }

    delete objWithMissingKeys.apiName
    expect(() => checkRequiredKeys(objWithMissingKeys, [])).toThrow(
      "Input is one of missing required keys: apiName,proxygenSecretName,kid. Input keys: proxygenSecretName,kid,environment"
    )
  })
})

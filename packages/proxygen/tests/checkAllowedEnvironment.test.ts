// checkAllowedEnvironment.test.ts

import {checkAllowedEnvironment} from "../src/helpers"

import {jest} from "@jest/globals"

describe("checkAllowedEnvironment", () => {
  let _SAVED_ALLOWED_ENVIRONMENTS: string | undefined
  beforeEach(() => {
    jest.resetModules()
    _SAVED_ALLOWED_ENVIRONMENTS = process.env.ALLOWED_ENVIRONMENTS
  })

  afterEach(() => {
    process.env.ALLOWED_ENVIRONMENTS = _SAVED_ALLOWED_ENVIRONMENTS
  })
  it("should not throw an error if the environment is allowed", () => {
    process.env.ALLOWED_ENVIRONMENTS = "int,sandbox,prod"
    expect(() => checkAllowedEnvironment("int")).not.toThrow()
    expect(() => checkAllowedEnvironment("sandbox")).not.toThrow()
    expect(() => checkAllowedEnvironment("prod")).not.toThrow()
  })

  it("should throw an error if the environment is not allowed", () => {
    process.env.ALLOWED_ENVIRONMENTS = "int,sandbox,prod"
    expect(() => checkAllowedEnvironment("dev")).toThrow(
      "environment dev is invalid. Allowed environments: int,sandbox,prod"
    )
  })
})

import type {JestConfigWithTsJest} from "ts-jest"
import defaultConfig from "../../jest.default.config.ts"

const jestConfig: JestConfigWithTsJest = {
  ...defaultConfig,
  rootDir: "./",
  moduleNameMapper: {
    ...defaultConfig.moduleNameMapper,
    "^aws-sdk-client-mock-jest$": "<rootDir>/../../node_modules/aws-sdk-client-mock-jest/dist/cjs/jest.js"
  }
}

export default jestConfig

import type {JestConfigWithTsJest} from "ts-jest"

const esModules = ["@middy"].join("|")
const jestConfig: JestConfigWithTsJest = {
  preset: "ts-jest/presets/default-esm",
  moduleFileExtensions: ["js", "json", "ts", "d.ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
    "^aws-sdk-client-mock-jest$": "<rootDir>/../../node_modules/aws-sdk-client-mock-jest/dist/cjs/jest.js"
  },
  transform: {
    "^.+\\.ts?$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: "./tsconfig.json"
      }
    ]
  },
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  testMatch: ["**/tests/**/*.test.ts"],
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  verbose: true,
  transformIgnorePatterns: [`node_modules/(?!${esModules})`]
}

export default jestConfig

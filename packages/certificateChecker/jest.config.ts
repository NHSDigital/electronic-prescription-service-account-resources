// const { defaults } = require("ts-jest/presets")

// const esModules = ["@middy"].join("|")
// const jestConfig = {
//   ...defaults,
//   moduleNameMapper: {
//     "^(\\.{1,2}/.*)\\.js$": "$1"
//   },
//   transformIgnorePatterns: [`node_modules/(?!${esModules})`],
//   rootDir: "./",
//   testMatch: ["**/tests/*.test.ts"],
//   verbose: true
// }

// module.exports = jestConfig
import type {JestConfigWithTsJest} from "ts-jest"

const esModules = ["@middy"].join("|")
const jestConfig: JestConfigWithTsJest = {
  preset: "ts-jest/presets/default-esm",
  moduleFileExtensions: ["js", "json", "ts", "d.ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1"
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
  testMatch: ["**/tests/*.test.ts"],
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  verbose: true,
  transformIgnorePatterns: [`node_modules/(?!${esModules})`],
  rootDir: "./"
}

export default jestConfig

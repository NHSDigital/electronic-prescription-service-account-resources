// import type { Config } from '@jest/types';

// const config: Config.InitialOptions = {
//   preset: 'ts-jest',
//   testEnvironment: 'node',
//   roots: ['<rootDir>/src', '<rootDir>/tests'],
//   transform: {
//     '^.+\\.tsx?$': 'ts-jest',
//   },
//   testRegex: '(/tests/.*\\.(test|spec))\\.tsx?$',
//   moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
//   testMatch: ["**/tests/*.test.js"]
// };

// export default config;
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
  rootDir: './'
}

export default jestConfig

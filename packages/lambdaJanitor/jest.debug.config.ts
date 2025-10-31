import config from "./jest.config"
import type {JestConfigWithTsJest} from "ts-jest.ts"

const debugConfig: JestConfigWithTsJest = {
  ...config,
  "preset": "ts-jest"
}

export default debugConfig

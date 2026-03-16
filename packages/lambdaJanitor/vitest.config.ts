import {defineConfig, mergeConfig} from "vitest/config"
import sharedVitestConfig from "../../vitest.shared.config"

export default mergeConfig(sharedVitestConfig, defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    exclude: ["**/lib/**", "**/node_modules/**"]
  }
}))

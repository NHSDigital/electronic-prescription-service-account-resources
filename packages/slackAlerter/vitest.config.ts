import {defineConfig, mergeConfig} from "vitest/config"
import sharedVitestConfig from "../../vitest.shared.config"

export default mergeConfig(sharedVitestConfig, defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    exclude: ["**/lib/**", "**/node_modules/**"],
    env: {
      "ENV": "dev",
      "AWS_SESSION_TOKEN": "76b6033a-232c-4b5c-8d92-39760202b2d8",
      "PARAMETERS_SECRETS_EXTENSION_HTTP_PORT":  "2773"
    }
  }
}))

import {defineWorkspace} from "vitest/config"

export default defineWorkspace([
  {
    extends: "./packages/certificateChecker/vitest.config.ts",
    test: {name: "certificateChecker"}
  },
  {
    extends: "./packages/lambdaJanitor/vitest.config.ts",
    test: {name: "lambdaJanitor"}
  },
  {
    extends: "./packages/proxygen/vitest.config.ts",
    test: {name: "proxygen"}
  },
  {
    extends: "./packages/slackAlerter/vitest.config.ts",
    test: {name: "slackAlerter"}
  },
  {
    extends: "./packages/splunkProcessor/vitest.config.ts",
    test: {name: "splunkProcessor"}
  }
])

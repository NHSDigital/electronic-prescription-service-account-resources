import {readFileSync} from "node:fs"
import {resolve} from "node:path"

export type AssignedVariables = Record<string, string>;

type EnvironmentFile = {
  parameters?: Record<string, Record<string, unknown>>;
};

export function assignCdkConfigVariables(
  envArg: string, baseDir = process.cwd()
): AssignedVariables {
  const environment = normaliseEnvironment(envArg)
  const configPath = resolve(baseDir, "environmentSettings", `${environment}.json`)

  const fileContents = readFileSync(configPath, "utf8")
  const parsedFile = safeParseEnvironmentFile(fileContents, configPath)
  const stacks = parsedFile.parameters ?? {}

  if (!Object.keys(stacks).length) {
    throw new Error(`No stack parameters found in ${configPath}`)
  }

  const assigned: AssignedVariables = {}

  Object.values(stacks).forEach((stackParameters) => {
    Object.entries(stackParameters ?? {}).forEach(([key, rawValue]) => {
      if (rawValue === undefined) {
        return
      }

      const envKey = `CDK_CONFIG_${key}`
      const envValue = serialiseValue(rawValue)
      process.env[envKey] = envValue
      assigned[envKey] = envValue
    })
  })

  return assigned
}

function safeParseEnvironmentFile(contents: string, path: string): EnvironmentFile {
  try {
    return JSON.parse(contents)
  } catch (error) {
    throw new Error(`Unable to parse ${path}: ${(error as Error).message}`)
  }
}

function serialiseValue(value: unknown): string {
  if (value === null || value === undefined) {
    throw new Error("Encountered null or undefined stack parameter value")
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value)
  }

  return JSON.stringify(value)
}

function normaliseEnvironment(input: string): string {
  const [env] = input.split("-")
  return env
}

if (require.main === module) {
  const envArg = process.env["CDK_CONFIG_environment"]

  if (!envArg) {
    console.error("CDK_CONFIG_environment is not set")
    process.exit(1)
  }

  try {
    const assigned = assignCdkConfigVariables(envArg)
    Object.entries(assigned).forEach(([key, value]) => {
      console.log(`export ${key}=${shellQuote(value)}`)
    })
  } catch (error) {
    console.error((error as Error).message)
    process.exit(1)
  }
}

function shellQuote(value: string): string {
  return `'${value.replace(/'/g, "'\\''")}'`
}

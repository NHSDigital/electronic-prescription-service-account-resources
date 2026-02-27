import {readFile} from "node:fs/promises"

import {AllowedDestructiveChange, checkDestructiveChangeSet} from "@nhsdigital/eps-cdk-constructs"

const requireEnv = (name: string): string => {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Environment variable ${name} is required`)
  }

  return value
}

const parseAllowedChanges = (content: string, source: string): Array<AllowedDestructiveChange> => {
  let parsed: unknown

  try {
    parsed = JSON.parse(content)
  } catch (error) {
    throw new Error(`Unable to parse allowed changes file ${source}: ${(error as Error).message}`)
  }

  if (!Array.isArray(parsed)) {
    throw new Error(`Allowed changes file ${source} must contain a JSON array`)
  }

  return parsed as Array<AllowedDestructiveChange>
}

const loadAllowedChanges = async (filename: string): Promise<Array<AllowedDestructiveChange>> => {
  try {
    const fileContent = await readFile(filename, "utf8")
    return parseAllowedChanges(fileContent, filename)
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (error instanceof Error && "code" in error && (error as any).code === "ENOENT") {
      throw new Error(`Allowed changes file not found at ${filename}`)
    }

    throw error
  }
}

const main = async (): Promise<void> => {
  const changeSetName = requireEnv("CDK_CHANGE_SET_NAME")
  const stackName = requireEnv("STACK_NAME")
  const region = requireEnv("AWS_REGION")
  const allowedChangesFilename = requireEnv("ALLOWED_CHANGES_FILENAME")

  const allowedChanges = await loadAllowedChanges(allowedChangesFilename)

  await checkDestructiveChangeSet(
    changeSetName,
    stackName,
    region,
    allowedChanges
  )

  console.log("Destructive change check completed successfully.")
  console.log("No issues found, or destructive changes are in allowed changes file.")
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})

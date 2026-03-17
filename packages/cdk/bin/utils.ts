export function tryGetConfigFromEnvVar(varName: string, prefix: string = "CDK_CONFIG_"): string | undefined {
  const value = process.env[prefix + varName]
  if (!value) {
    return undefined
  }
  return value
}

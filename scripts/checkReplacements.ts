import {readFileSync} from "node:fs"

const filePath = process.argv[2]

try {
  const raw = readFileSync(filePath, "utf-8")
  const data = JSON.parse(raw)
  const changes = Array.isArray(data?.Changes) ? data.Changes : []

  const replacements = changes
    .map((change: any) => {
      const resourceChange = change?.ResourceChange
      if (!resourceChange) {
        return undefined
      }
      const replacement = resourceChange.Replacement
      const action = resourceChange.Action
      const replacementString = typeof replacement === "string" ? replacement : String(replacement ?? "")
      const needsReplacement = replacementString === "True" || replacementString === "Conditional"
      const isRemoval = action === "Remove"
      if (!needsReplacement && !isRemoval) {
        return undefined
      }
      return {
        logicalId: resourceChange.LogicalResourceId ?? "<unknown logical id>",
        physicalId: resourceChange.PhysicalResourceId ?? "<unknown physical id>",
        resourceType: resourceChange.ResourceType ?? "<unknown type>",
        reason: needsReplacement ? `Replacement: ${replacementString}` : `Action: ${action}`
      }
    })
    .filter(Boolean) as Array<{
      logicalId: string;
      physicalId: string;
      resourceType: string;
      reason: string;
    }>

  if (replacements.length === 0) {
    console.log("No resources require replacement.")
    process.exit(0)
  }

  console.error("Resources that require attention:")
  replacements.forEach(({logicalId, physicalId, resourceType, reason}) => {
    console.error(`- LogicalId: ${logicalId}, PhysicalId: ${physicalId}, Type: ${resourceType}, Reason: ${reason}`)
  })
  process.exit(1)
} catch (error) {
  console.error(`Failed to process ${filePath}:`, error instanceof Error ? error.message : error)
  process.exit(2)
}

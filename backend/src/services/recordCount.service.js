export async function countRecords(sandboxId, objectName) {
  const result = await runSoqlQuery(
    sandboxId,
    `SELECT COUNT() FROM ${objectName}`
  )
  return result.totalSize || 0
}

/**
 * Transform a source record into a target-safe record
 * - Rewrites lookup IDs using idMap
 * - Removes Salesforce system fields
 */
export function transformRecord({ record, idMap }) {
  const transformed = {}

  for (const [field, value] of Object.entries(record)) {
    // Skip Salesforce metadata
    if (field === 'attributes') continue

    // Never insert Id
    if (field === 'Id') continue

    // Rewrite lookup fields
    if (field.endsWith('Id') && value && idMap[value]) {
      transformed[field] = idMap[value]
    } else {
      transformed[field] = value
    }
  }

  return transformed
}

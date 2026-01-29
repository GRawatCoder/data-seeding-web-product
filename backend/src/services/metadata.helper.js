import axios from 'axios'
import { getSandboxAuth } from './auth.store.js'

/**
 * Cache metadata per sandbox + object
 * Key format: `${sandboxId}:${objectName}`
 */
const metadataCache = new Map()

/**
 * Fetches and normalizes Salesforce object metadata.
 *
 * @param {string} sandboxId
 * @param {string} objectName
 * @returns {{
 *   lookupFields: Array<{ field: string, targets: string[], nillable: boolean }>,
 *   childRelationships: Array<{ object: string, field: string }>,
 *   insertableFields: string[]
 * }}
 */
export async function getObjectMetadata(sandboxId, objectName) {
  const cacheKey = `${sandboxId}:${objectName}`

  if (metadataCache.has(cacheKey)) {
    return metadataCache.get(cacheKey)
  }

  const auth = getSandboxAuth(sandboxId)
  if (!auth) {
    throw new Error(`Sandbox not connected: ${sandboxId}`)
  }

  const url = `${auth.instanceUrl}/services/data/${process.env.SALESFORCE_API_VERSION}/sobjects/${objectName}/describe`

  const res = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${auth.accessToken}`,
    },
  })

  const describe = res.data
  //console.log('describe inside metadata helper', describe);
  // -------------------------
  // 1️⃣ Lookup fields (parents)
  // -------------------------
  const lookupFields = describe.fields
    .filter(
      (f) =>
        f.type === 'reference' &&
        Array.isArray(f.referenceTo) &&
        f.referenceTo.length > 0 &&
        f.name !== 'OwnerId' &&
        f.name !== 'CreatedById' &&
        f.name !== 'LastModifiedById'
    )
    .map((f) => ({
      field: f.name,
      targets: f.referenceTo, // polymorphic-safe
      nillable: f.nillable,
    }))

  // --------------------------------
  // 2️⃣ Child relationships (children)
  // --------------------------------
  const childRelationships = describe.childRelationships
    .filter(
      (rel) =>
        rel.childSObject &&
        rel.field &&
        !rel.deprecatedAndHidden
    )
    .map((rel) => ({
      object: rel.childSObject,
      field: rel.field, // FK field on child object
    }))

  // --------------------------------
  // 3️⃣ Insertable fields (full copy)
  // --------------------------------
  const insertableFields = describe.fields
    .filter(
      (f) =>
        f.createable &&
        !f.calculated &&
        !f.autoNumber &&
        f.name !== 'Id'
    )
    .map((f) => f.name)

  const metadata = {
    lookupFields,
    childRelationships,
    insertableFields,
  }
  //console.log(`Fetched metadata for ${objectName} in sandbox ${sandboxId}`, metadata);

  metadataCache.set(cacheKey, metadata)
  return metadata
}

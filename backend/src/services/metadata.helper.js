import axios from 'axios'
import { getSandboxAuth } from './auth.store.js'

const metadataCache = new Map()

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
    headers: { Authorization: `Bearer ${auth.accessToken}` },
  })

  const describe = res.data

  const lookupFields = describe.fields
    .filter(
      f =>
        f.type === 'reference' &&
        f.referenceTo?.length &&
        !['OwnerId', 'CreatedById', 'LastModifiedById'].includes(f.name)
    )
    .map(f => ({
      field: f.name,
      targets: f.referenceTo,
      nillable: f.nillable,
    }))

  const childRelationships = describe.childRelationships
    .filter(r => r.childSObject && r.field && !r.deprecatedAndHidden)
    .map(r => ({
      object: r.childSObject,
      field: r.field,
    }))

  const insertableFields = describe.fields
    .filter(
      f =>
        f.createable &&
        !f.calculated &&
        !f.autoNumber &&
        f.name !== 'Id'
    )
    .map(f => f.name)

  const recordTypeInfos = describe.recordTypeInfos || []

  const metadata = {
    lookupFields,
    childRelationships,
    insertableFields,
    recordTypeInfos,
  }

  metadataCache.set(cacheKey, metadata)
  return metadata
}

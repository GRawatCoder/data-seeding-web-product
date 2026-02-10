import { getInsertableFields } from './field.resolver.js'
import { getObjectMetadata } from './metadata.helper.js'
import { queryByIds } from './source.query.js'
import { insertTarget } from './target.insert.js'
import { transformRecord } from './transform.service.js'

// ❌ Never insert these
const NON_INSERTABLE_OBJECTS = new Set([
  'RecordType',
  'Profile',
  'UserLicense',
  'UserRole',
  'CallCenter',
  'DNBConnect__D_B_Connect_Company_Profile__c',
  'User',
])

function isSalesforceId(value) {
  return typeof value === 'string' && /^[a-zA-Z0-9]{15,18}$/.test(value)
}

/**
 * Resolve RecordTypeId using DeveloperName
 */
async function resolveRecordTypeId({
  sourceSandboxId,
  targetSandboxId,
  objectName,
  sourceRecordTypeId,
}) {
  const sourceMeta = await getObjectMetadata(sourceSandboxId, objectName)
  const targetMeta = await getObjectMetadata(targetSandboxId, objectName)

  const sourceRT = sourceMeta.recordTypeInfos.find(
    rt => rt.recordTypeId === sourceRecordTypeId
  )

  if (!sourceRT) return null

  const targetRT =
    targetMeta.recordTypeInfos.find(
      rt => rt.developerName === sourceRT.developerName
    ) ||
    targetMeta.recordTypeInfos.find(rt => rt.defaultRecordTypeMapping)

  return targetRT?.recordTypeId || null
}

export async function insertRecordsForObject({
  objectName,
  records,
  sourceSandboxId,
  targetSandboxId,
  idMap,
  emitProgress,
}) {
  if (NON_INSERTABLE_OBJECTS.has(objectName)) {
  console.log(`⏭️ [SKIP] ${objectName} is non-insertable system object`)
  return {
    attempted: records.length,
    inserted: 0,
    failed: 0,
    skipped: true,
    resolved: true, 
    reason: 'SYSTEM_OBJECT',
  }
}


  const ids = records.map(r => r.Id)

  const fields = await getInsertableFields({
    sandboxId: sourceSandboxId,
    objectName,
  })

  console.log(`🧩 [FIELDS] ${objectName} insertable fields (${fields.length})`)

  const sourceRecords = await queryByIds({
    sandboxId: sourceSandboxId,
    objectName,
    fields,
    ids,
  })
/*
  const transformed = []

  for (const src of sourceRecords) {
    const rec = transformRecord({ record: src, idMap })

    // ✅ RecordTypeId mapping (Prodly-style)
    if (rec.RecordTypeId) {
      const mapped = await resolveRecordTypeId({
        sourceSandboxId,
        targetSandboxId,
        objectName,
        sourceRecordTypeId: rec.RecordTypeId,
      })

      if (mapped) {
        rec.RecordTypeId = mapped
      }
    }

    transformed.push(rec)
  }
    */

  const transformed = []
for (const r of sourceRecords) {
  transformed.push(
    await transformRecord({
      record: r,
      idMap,
      sourceSandboxId,
      targetSandboxId,
    })
  )
}


  // ❌ Block only REAL unresolved lookups
  const hasBrokenLookups = transformed.some(rec =>
    Object.entries(rec).some(([field, value]) => {
      if (!field.endsWith('Id') || !value) return false

      // already rewritten
      if (idMap[value]) return false

      // system-managed IDs are allowed
      if (
        ['OwnerId', 'RecordTypeId', 'CreatedById', 'LastModifiedById'].includes(
          field
        )
      )
        return false

      // valid Salesforce ID assumed to exist
      if (isSalesforceId(value)) return false

      return true
    })
  )

  if (hasBrokenLookups) {
    console.warn(`❌ [FK] ${objectName} skipped due to unresolved dependencies`)
    return {
      attempted: sourceRecords.length,
      inserted: 0,
      failed: sourceRecords.length,
      reason: 'UNRESOLVED_LOOKUPS',
    }
  }

  const results = await insertTarget({
    sandboxId: targetSandboxId,
    objectName,
    records: transformed,
  })

  results.forEach((res, idx) => {
    if (res.success) {
      idMap[sourceRecords[idx].Id] = res.id
    }
  })

  const insertedCount = results.filter(r => r.success).length

  emitProgress?.({ object: objectName, inserted: insertedCount })

  return {
    attempted: sourceRecords.length,
    inserted: insertedCount,
    failed: results.length - insertedCount,
    errors: results
      .map((r, i) =>
        !r.success
          ? { sourceId: sourceRecords[i].Id, error: r.errors }
          : null
      )
      .filter(Boolean),
  }
}

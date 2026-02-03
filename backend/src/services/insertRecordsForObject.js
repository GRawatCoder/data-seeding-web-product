import { getInsertableFields } from './field.resolver.js'
import { queryByIds } from './source.query.js'
import { insertTarget } from './target.insert.js'
import { transformRecord } from './transform.service.js'

export async function insertRecordsForObject({
  objectName,
  records,
  sourceSandboxId,
  targetSandboxId,
  idMap,
  emitProgress,
})
 {
  const ids = records.map(r => r.Id)

  const fields = await getInsertableFields({
    sandboxId: sourceSandboxId,
    objectName,
  })

  const sourceRecords = await queryByIds({
    sandboxId: sourceSandboxId,
    objectName,
    fields,
    ids,
  })
  
  const transformed = sourceRecords.map(r =>
    transformRecord({ record: r, idMap })
  )

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

  emitProgress?.({
    object: objectName,
    inserted: results.filter(r => r.success).length,
  })

  return {
    attempted: sourceRecords.length,
    inserted: results.filter((r) => r.success).length,
    failed: results.filter((r) => !r.success).length,
    errors: results
      .map((r, i) =>
        !r.success
          ? {
              sourceId: sourceRecords[i].Id,
              error: r.errors,
            }
          : null
      )
      .filter(Boolean),
  };

}

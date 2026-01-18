import { querySource } from './source.query.js'
import { insertTarget } from './target.insert.js'
import { transformRecord } from './transform.service.js'

export async function seedObject({
  objectName,
  sourceSandboxId,
  targetSandboxId,
  fields,
  batchSize,
  idMap,
  emitProgress,
}) {
  let lastSeenId = null
  let done = false
  let total = 0

  while (!done) {
    const result = await querySource({
      sandboxId: sourceSandboxId,
      objectName,
      fields,
      batchSize,
      lastSeenId,
    })

    lastSeenId = result.lastSeenId
    done = result.done

    if (!result.records.length) break

    const transformed = result.records.map(r =>
      transformRecord({ record: r, idMap })
    )

    const insertResults = await insertTarget({
      sandboxId: targetSandboxId,
      objectName,
      records: transformed,
    })

    insertResults.forEach((res, idx) => {
      if (res.success) {
        idMap[result.records[idx].Id] = res.id
      }
    })

    total += result.records.length
    emitProgress?.({ objectName, total })
  }
}

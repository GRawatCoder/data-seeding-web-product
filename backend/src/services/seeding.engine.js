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
  maxRecords = 10,
  emitProgress,
}) {
  let lastSeenId = null
  let done = false
  let totalInserted = 0

  while (!done && totalInserted < maxRecords) {
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

    const remaining = maxRecords - totalInserted;
    const recordsToInsert = result.records.slice(0, remaining);

    const transformed = recordsToInsert.map((r) =>
      transformRecord({ record: r, idMap })
    );


    insertResults.forEach((res, idx) => {
      if (res.success) {
        idMap[recordsToInsert[idx].Id] = res.id;
        totalInserted++;
      } else {
        console.error(
          `[INSERT FAILED] ${objectName}`,
          recordsToInsert[idx],
          res.errors
        );
      }
    });

    emitProgress?.({ objectName, totalInserted });

  }
  console.log(
    `[SEEDING COMPLETE] ${objectName}: inserted ${totalInserted} records`
  )
}

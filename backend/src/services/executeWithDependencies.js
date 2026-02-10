import { insertRecordsForObject } from './insertRecordsForObject.js'

export async function executeWithDependencies({
  recordGraph,
  executionOrder,
  sourceSandboxId,
  targetSandboxId,
  emitProgress,
}) {
  const idMap = {}
  const summary = {}

  const pending = new Set(executionOrder)
  let pass = 0
  let progressMade = true

  while (pending.size > 0 && progressMade) {
    pass++
    progressMade = false

    console.log(`\n🔁 [EXECUTION PASS ${pass}] Pending objects:`)
    console.log([...pending].join(', '))

    for (const objectName of [...pending]) {
      const records = recordGraph[objectName]
      if (!records || records.length === 0) {
        pending.delete(objectName)
        continue
      }

      console.log(`➡️ [TRY] ${objectName}`)

      const result = await insertRecordsForObject({
        objectName,
        records,
        sourceSandboxId,
        targetSandboxId,
        idMap,
        emitProgress,
      })

      summary[objectName] = result

        if (result.resolved === true) {
            console.log(`✅ [RESOLVED] ${objectName} resolved (no insert needed)`)
            pending.delete(objectName)
            progressMade = true
            continue
        }

        if (result.inserted > 0) {
            console.log(`✅ [SUCCESS] ${objectName} inserted ${result.inserted}`)
            pending.delete(objectName)
            progressMade = true
        } else {
            console.log(`⏸️ [WAIT] ${objectName} still has unresolved dependencies`)
        }

    }
  }

  if (pending.size > 0) {
    console.error('\n❌ [DEADLOCK] Could not resolve dependencies for:')
    for (const obj of pending) {
      console.error(`   - ${obj}`)
    }
  }

  return {
    summary,
    unresolvedObjects: [...pending],
    idMap,
  }
}

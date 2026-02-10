import { resolveField } from './resolver.registry.js'

export async function transformRecord({
  record,
  idMap,
  sourceSandboxId,
  targetSandboxId,
  objectName,
}) {
  const output = {}

  for (const [field, value] of Object.entries(record)) {
    if (!value) continue

    // 1️⃣ Normal ID rewrite
    if (field.endsWith('Id') && idMap[value]) {
      output[field] = idMap[value]
      continue
    }

    // 2️⃣ Resolver-based mapping (RecordTypeId etc.)
    if (field.endsWith('Id')) {
      const resolved = await resolveField({
        field,
        value,
        record,
        objectName,
        sourceSandboxId,
        targetSandboxId,
        idMap,
      })

      if (resolved) {
        output[field] = resolved
        continue
      }
    }

    // 3️⃣ Passthrough
    output[field] = value
  }

  return output
}

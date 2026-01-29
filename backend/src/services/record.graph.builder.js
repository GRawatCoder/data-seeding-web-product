import { querySource } from './source.query.js'
import { getObjectMetadata } from './metadata.helper.js'

/**
 * Build a full record graph starting from multiple root objects.
 */
export async function buildRecordGraph({
  sandboxId,
  rootObjects,
  maxRecordsPerRoot = 10,
  maxDepth = 5,
}) {
  // --------------------------------
  // Internal record set (dedupe core)
  // --------------------------------
  const recordSet = new Map() // key = Object:Id → { object, record }

  // --------------------------------
  // Track which objects were auto-added
  // --------------------------------
  const autoIncludedObjects = new Set()

  // --------------------------------
  // BFS queue
  // --------------------------------
  const queue = []

  // --------------------------------
  // Seed roots (FIXED)
  // --------------------------------
  for (const objectName of rootObjects) {
    const metadata = await getObjectMetadata(sandboxId, objectName)

    // ✅ FIX: pull lookup fields for traversal
    const traversalFields = [
      'Id',
      ...metadata.lookupFields.map(l => l.field),
    ]

    const rootResult = await querySource({
      sandboxId,
      objectName,
      fields: traversalFields,
      batchSize: maxRecordsPerRoot,
    })

    rootResult.records.forEach((record) => {
      queue.push({
        object: objectName,
        record,
        depth: 0,
        isRoot: true,
      })
    })
  }

  // --------------------------------
  // BFS traversal
  // --------------------------------
  while (queue.length) {
    const { object, record, depth, isRoot } = queue.shift()

    const recordKey = `${object}:${record.Id}`
    if (recordSet.has(recordKey)) continue

    recordSet.set(recordKey, { object, record })

    if (!isRoot) {
      autoIncludedObjects.add(object)
    }

    if (depth >= maxDepth) continue

    const metadata = await getObjectMetadata(sandboxId, object)

    // --------------------------------
    // 🔹 Traverse parent lookups (FIXED)
    // --------------------------------
    for (const lookup of metadata.lookupFields) {
      const parentId = record[lookup.field]
      if (!parentId) continue

      const parentObject = lookup.targets[0]
      if (!parentObject) continue

      const parentMetadata = await getObjectMetadata(
        sandboxId,
        parentObject
      )

      const parentTraversalFields = [
        'Id',
        ...parentMetadata.lookupFields.map(l => l.field),
      ]

      const parentResult = await querySource({
        sandboxId,
        objectName: parentObject,
        fields: parentTraversalFields,
        where: `Id = '${parentId}'`,
      })

      parentResult.records.forEach((parent) => {
        queue.push({
          object: parentObject,
          record: parent,
          depth: depth + 1,
          isRoot: false,
        })
      })
    }

    // --------------------------------
    // 🔹 Traverse child relationships (FIXED)
    // --------------------------------
    for (const child of metadata.childRelationships) {
      if (
        !child.childSObject ||
        !child.field ||
        child.deprecatedAndHidden === true
      ) {
        continue
      }

      const childMetadata = await getObjectMetadata(
        sandboxId,
        child.childSObject
      )

      const childTraversalFields = [
        'Id',
        ...childMetadata.lookupFields.map(l => l.field),
      ]

      const childResult = await querySource({
        sandboxId,
        objectName: child.childSObject,
        fields: childTraversalFields,
        where: `${child.field} = '${record.Id}'`,
      })

      childResult.records.forEach((childRecord) => {
        queue.push({
          object: child.childSObject,
          record: childRecord,
          depth: depth + 1,
          isRoot: false,
        })
      })
    }
  }

  // --------------------------------
  // Group records by object
  // --------------------------------
  const recordsByObject = {}
  for (const { object, record } of recordSet.values()) {
    recordsByObject[object] ||= []
    recordsByObject[object].push(record)
  }

  return {
    recordsByObject,
    autoIncludedObjects: Array.from(autoIncludedObjects),
  }
}

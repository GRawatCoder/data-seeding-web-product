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

  const inclusionMap = {};

  const metadataCache = {}
    const enqueued = new Set()

  // --------------------------------
  // Track which objects were auto-added
  // --------------------------------
  const autoIncludedObjects = {}


  // --------------------------------
  // BFS queue
  // --------------------------------
  const queue = []

  // --------------------------------
  // Seed roots (FIXED)
  // --------------------------------
  for (const objectName of rootObjects) {
    const metadata =
      metadataCache[objectName] ||
      (metadataCache[objectName] = await getObjectMetadata(sandboxId, objectName));


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

    console.log(
      `🟨 [GRAPH] Root fetch`,
      objectName,
      `records=${rootResult.records.length}`
    );


    rootResult.records.forEach((record) => {
      queue.push({
        object: objectName,
        record,
        depth: 0,
        isRoot: true,
        rootObject: objectName, 
      });
    });

  }

  // --------------------------------
  // BFS traversal
  // --------------------------------
  while (queue.length) {
    const { object, record, depth, isRoot, rootObject } = queue.shift();

    const recordKey = `${object}:${record.Id}`;

    let entry = recordSet.get(recordKey);

    console.log(
      `🟧 [GRAPH] Visiting`,
      object,
      `Id=${record.Id}`,
      `depth=${depth}`,
      `root=${rootObject}`
    );


    if (!entry) {
      entry = {
        object,
        record,
        roots: new Set(),
        discoveredVia: [],
      };
      recordSet.set(recordKey, entry);
    }

    entry.roots.add(rootObject);


/*
    if (!isRoot) {
      autoIncludedObjects[object] ||= new Set();
      autoIncludedObjects[object].add(rootObject);


      entry.discoveredVia.push({
        via: object,
        reason: "lookup",
      });

      if (!inclusionMap[object]) {
        inclusionMap[object] = {
          via: rootObject,
          reason: "lookup",
        };
      }
    }
      */


    if (depth >= maxDepth) continue

    const metadata =
      metadataCache[object] ||
      (metadataCache[object] = await getObjectMetadata(sandboxId, object));


    // --------------------------------
    // 🔹 Traverse parent lookups (FIXED)
    // --------------------------------
    for (const lookup of metadata.lookupFields) {
      const parentId = record[lookup.field]
      if (!parentId) continue

      const parentObject = lookup.targets[0]
      if (!parentObject) continue

      /*
      const parentMetadata = await getObjectMetadata(
        sandboxId,
        parentObject
      )
        */

      if (!rootObjects.includes(parentObject)) {
        autoIncludedObjects[parentObject] ||= new Set();
        autoIncludedObjects[parentObject].add(rootObject);
      }



      const parentMetadata =
        metadataCache[parentObject] ||
        (metadataCache[parentObject] = await getObjectMetadata(
          sandboxId,
          parentObject
        ));


      const parentTraversalFields = [
        'Id',
        ...parentMetadata.lookupFields.map(l => l.field),
      ]

      if (!entry.discoveredVia.some((d) => d.via === parentObject && d.reason === "lookup")) {
        entry.discoveredVia.push({
          via: parentObject,
          reason: "lookup",
        });
      }

      console.log(
        `🟩 [GRAPH] Parent lookup`,
        `${object}.${lookup.field} → ${parentObject}`,
        `root=${rootObject}`
      );


      const parentResult = await querySource({
        sandboxId,
        objectName: parentObject,
        fields: parentTraversalFields,
        where: `Id = '${parentId}'`,
      })

      parentResult.records.forEach((parent) => {
        const parentKey = `${parentObject}:${parent.Id}`;

        if (!recordSet.has(parentKey) && !enqueued.has(parentKey)) {
          enqueued.add(parentKey);
          queue.push({
            object: parentObject,
            record: parent,
            depth: depth + 1,
            isRoot: false,
            rootObject,
          });
        }

      });

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
      /*
      const childMetadata = await getObjectMetadata(
        sandboxId,
        child.childSObject
      )
        */

      const childMetadata =
        metadataCache[child.childSObject] ||
        (metadataCache[child.childSObject] = await getObjectMetadata(
          sandboxId,
          child.childSObject
        ));

        if (!rootObjects.includes(child.childSObject)) {
          autoIncludedObjects[child.childSObject] ||= new Set();
          autoIncludedObjects[child.childSObject].add(rootObject);
        }


      const childTraversalFields = [
        'Id',
        ...childMetadata.lookupFields.map(l => l.field),
      ]

      if (!entry.discoveredVia.some((d) => d.via === child.childSObject && d.reason === "child")) {
        entry.discoveredVia.push({
          via: child.childSObject,
          reason: "child",
        });
      }


      if (!inclusionMap[child.childSObject]) {
        inclusionMap[child.childSObject] = {
          via: rootObject,
          reason: "child",
        };
      }

      console.log(
        `🟪 [GRAPH] Child lookup`,
        `${object} → ${child.childSObject} via ${child.field}`,
        `root=${rootObject}`
      );



      const childResult = await querySource({
        sandboxId,
        objectName: child.childSObject,
        fields: childTraversalFields,
        where: `${child.field} = '${record.Id}'`,
      })

      childResult.records.forEach((childRecord) => {
        const childKey = `${child.childSObject}:${childRecord.Id}`;

        if (!recordSet.has(childKey) && !enqueued.has(childKey)) {
          enqueued.add(childKey);
          queue.push({
            object: child.childSObject,
            record: childRecord,
            depth: depth + 1,
            isRoot: false,
            rootObject,
          });
        }

      });

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

  console.log("🧠 [GRAPH] Auto-included objects summary:");

    Object.entries(autoIncludedObjects).forEach(([obj, roots]) => {
    console.log(`   ↳ ${obj} via [${Array.from(roots).join(", ")}]`);
    });

  return {
    recordsByObject,
    autoIncludedObjects: Object.entries(autoIncludedObjects).map(
      ([object, roots]) => ({
        object,
        includedVia: Array.from(roots),
      })
    ),
    inclusionMap,
  };


}

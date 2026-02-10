import axios from "axios";
import { getSandboxAuth } from "../services/auth.store.js";
import { resolveExecutionOrder } from "../services/executionOrder.service.js";
import { resolveDependencies } from "../services/sfDependency.service.js";
import { validateTargetSandbox } from "../services/targetValidation.service.js";
import { runSoqlQuery } from "../services/soql.service.js";
import { countRecords } from "../services/recordCount.service.js";
import { seedObject } from "../services/seeding.engine.js";
import { sendProgress } from "../routes/progress.routes.js";
import { buildRecordGraph } from '../services/record.graph.builder.js'
import { insertRecordsForObject } from '../services/insertRecordsForObject.js'
import { executeWithDependencies } from '../services/executeWithDependencies.js'

export async function listObjects(req, res) {
  const { sandboxId } = req.params;

  const auth = getSandboxAuth(sandboxId);
  if (!auth) {
    return res.status(400).json({ error: "Sandbox not connected" });
  }

  const response = await axios.get(
    `${auth.instanceUrl}/services/data/v58.0/sobjects`,
    {
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
      },
    }
  );

  // Return only objects that are queryable + creatable
  const objects = response.data.sobjects.filter(
    (o) => o.queryable && o.createable
  );

  res.json(objects);
}

export async function previewData(req, res) {
  const { sandboxId } = req.params;
  const { objectName, limit = 5 } = req.query;

  const soql = `SELECT FIELDS(ALL) FROM ${objectName} LIMIT ${limit}`;
  const result = await runSoqlQuery(sandboxId, soql);

  const records = result.records || [];

  const columns =
    records.length > 0
      ? Object.keys(records[0]).filter((k) => !["attributes"].includes(k))
      : [];

  res.json({
    totalSize: result.totalSize,
    records,
    columns,
  });
}

export async function getExecutionOrder(req, res) {
  const { sandboxId } = req.params;
  const { objects } = req.body;

  if (!Array.isArray(objects) || !objects.length) {
    return res.status(400).json({ error: "objects array required" });
  }

  // reuse dependency resolver
  const graph = await resolveDependencies(sandboxId, objects);
  const order = resolveExecutionOrder(graph);

  res.json({ order });
}

export async function validateTarget(req, res) {
  const { sandboxId } = req.params;
  const { objects } = req.body;

  if (!Array.isArray(objects) || !objects.length) {
    return res.status(400).json({ error: "objects array required" });
  }

  const result = await validateTargetSandbox(objects, sandboxId);
  res.json({ result });
}
/* Deprecated
export async function dryRun(req, res) {
  const { sourceSandboxId, targetSandboxId, objects } = req.body;

  if (!sourceSandboxId || !targetSandboxId || !objects?.length) {
    return res.status(400).json({ error: "Invalid dry-run request" });
  }

  // 1. Resolve dependencies
  const dependencyGraph = await resolveDependencies(sourceSandboxId, objects);

  // 2. Resolve execution order
  const executionOrder = resolveExecutionOrder(dependencyGraph);

  // 3. Count records per object
  const recordCounts = {};
  for (const obj of executionOrder) {
    recordCounts[obj] = await countRecords(sourceSandboxId, obj);
  }

  // 4. Validate target compatibility
  const validation = await validateTargetSandbox(
    executionOrder,
    targetSandboxId
  );

  res.json({
    sourceSandboxId,
    targetSandboxId,
    executionOrder,
    recordCounts,
    validation,
    summary: {
      totalObjects: executionOrder.length,
      totalRecords: Object.values(recordCounts).reduce((a, b) => a + b, 0),
    },
  });
}
  */

export async function dryRun(req, res) {
  const {
    sourceSandboxId,
    targetSandboxId,
    objects: rootObjects,
    maxRecordsPerObject = 10,
  } = req.body;

  console.log("🟦 [DRY-RUN] Request received", {
    sourceSandboxId,
    targetSandboxId,
    rootObjects,
    maxRecordsPerObject,
  });


  if (!sourceSandboxId || !targetSandboxId || !rootObjects?.length) {
    return res.status(400).json({ error: "Invalid dry-run request" });
  }

  // 1️⃣ Build FULL record graph (records + inclusion metadata)
  const graphResult = await buildRecordGraph({
    sandboxId: sourceSandboxId,
    rootObjects,
    maxRecordsPerRoot: maxRecordsPerObject,
  });

  const {
    recordsByObject,
    autoIncludedObjects, // array of object names
    inclusionMap,        // { ObjectName: { via, reason } }
  } = graphResult;

  // 2️⃣ Count records
  const recordCounts = {};
  let totalRecords = 0;

  for (const objectName of Object.keys(recordsByObject)) {
    const count = recordsByObject[objectName].length;
    recordCounts[objectName] = count;
    totalRecords += count;
  }

  // 3️⃣ Object-level execution order (simple, deterministic)
  // (True dependency order comes in Task B)
  const executionOrder = Object.keys(recordsByObject);

  // 4️⃣ Build auto-included explanation list
  /*
  const autoIncludedDetails = autoIncludedObjects.map((obj) => ({
    object: obj,
    includedVia: Array.isArray(inclusionMap[obj]?.via)
      ? inclusionMap[obj].via
      : inclusionMap[obj]?.via
        ? [inclusionMap[obj].via]
        : [],
    reason: inclusionMap[obj]?.reason || "unknown",
  }));
  */
 const autoIncludedDetails = autoIncludedObjects.map(item => ({
  object: item.object,                 // string
  includedVia: item.includedVia,        // array
  reason: "lookup",
  }));

  console.log("🟦 [DRY-RUN] Response summary", {
  totalObjects: executionOrder.length,
  totalRecords,
  autoIncludedObjects: autoIncludedDetails,
});

  console.log(
  "🧪 [DRY-RUN] autoIncludedObjects payload",
  JSON.stringify(autoIncludedDetails, null, 2)
);



  res.json({
    roots: rootObjects,
    executionOrder,
    recordsByObject,
    autoIncludedObjects: autoIncludedDetails,
    summary: {
      totalObjects: executionOrder.length,
      totalRecords,
    },
  });
}



/*
export async function executeSeeding(req, res) {
  const {
    sourceSandboxId,
    targetSandboxId,
    objects,
    maxRecordsPerObject = 10,
  } = req.body;

  if (!getSandboxAuth(sourceSandboxId)) {
    return res.status(400).json({
      error: "Source sandbox is not connected",
    });
  }

  if (!getSandboxAuth(targetSandboxId)) {
    return res.status(400).json({
      error: "Target sandbox is not connected",
    });
  }

  if (!sourceSandboxId || !targetSandboxId || !objects?.length) {
    return res.status(400).json({ error: "Invalid request" });
  }

  const dependencyGraph = await resolveDependencies(sourceSandboxId, objects);

  const executionOrder = resolveExecutionOrder(dependencyGraph);

  const idMap = {};

  for (const objectName of executionOrder) {
    await seedObject({
      objectName,
      sourceSandboxId,
      targetSandboxId,
      fields: ["Name"], // expand later
      batchSize: 200,
      idMap,
      maxRecords: maxRecordsPerObject,
      emitProgress: (data) =>
        sendProgress({
          object: objectName,
          inserted: data.totalInserted,
        })
    });
  }

  res.json({ status: "SUCCESS", executionOrder });
}
  */

export async function executeSeeding(req, res) {
  const {
    sourceSandboxId,
    targetSandboxId,
    recordGraph,
    executionOrder,
  } = req.body

  if (!recordGraph || !executionOrder) {
    return res.status(400).json({ error: "Missing record graph" });
  }
  if (!getSandboxAuth(sourceSandboxId)) {
    return res.status(400).json({ error: "Source sandbox not connected" });
  }

  if (!getSandboxAuth(targetSandboxId)) {
    return res.status(400).json({ error: "Target sandbox not connected" });
  }

  console.log('🚀 [EXECUTE] Starting dependency-aware execution')

  const result = await executeWithDependencies({
    recordGraph,
    executionOrder,
    sourceSandboxId,
    targetSandboxId,
    emitProgress: req.emitProgress, // SSE hook
  })

  res.json(result)
}


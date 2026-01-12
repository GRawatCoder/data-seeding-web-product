import axios from 'axios'
import { getSandboxAuth } from '../services/auth.store.js'
import { resolveExecutionOrder } from '../services/executionOrder.service.js'
import { resolveDependencies } from '../services/sfDependency.service.js'


export async function listObjects(req, res) {
  const { sandboxId } = req.params

  const auth = getSandboxAuth(sandboxId)
  if (!auth) {
    return res.status(400).json({ error: 'Sandbox not connected' })
  }

  const response = await axios.get(
    `${auth.instanceUrl}/services/data/v58.0/sobjects`,
    {
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
      },
    }
  )

  // Return only objects that are queryable + creatable
  const objects = response.data.sobjects.filter(
    (o) => o.queryable && o.createable
  )

  res.json(objects)
}

export async function previewData(req, res) {
  const { sandboxId } = req.params
  const { objectName, limit = 5 } = req.query

  const soql = `SELECT FIELDS(ALL) FROM ${objectName} LIMIT ${limit}`
  const result = await runSoqlQuery(sandboxId, soql)

  const records = result.records || []

  const columns =
    records.length > 0
      ? Object.keys(records[0]).filter(
          (k) => !['attributes'].includes(k)
        )
      : []

  res.json({
    totalSize: result.totalSize,
    records,
    columns,
  })
}

export async function getExecutionOrder(req, res) {
  const { sandboxId } = req.params
  const { objects } = req.body

  if (!Array.isArray(objects) || !objects.length) {
    return res.status(400).json({ error: 'objects array required' })
  }

  // reuse dependency resolver
  const graph = await resolveDependencies(sandboxId, objects)
  const order = resolveExecutionOrder(graph)

  res.json({ order })
}

import { runSoqlQuery } from './soql.service.js'
import { getSandboxAuth } from './auth.store.js'

const SYSTEM_FIELDS = ['Id']

export async function querySource({
  sandboxId,
  objectName,
  fields,
  batchSize = 200,
  lastSeenId = null,
}) {
  const auth = getSandboxAuth(sandboxId)
  if (!auth) throw new Error('Missing auth')

  const selectFields = [...new Set([...SYSTEM_FIELDS, ...fields])].join(',')

  let soql = `SELECT ${selectFields} FROM ${objectName}`

  if (lastSeenId) {
    soql += ` WHERE Id > '${lastSeenId}'`
  }

  soql += ` ORDER BY Id ASC LIMIT ${batchSize}`

  const result = await runSoqlQuery(sandboxId, soql)

  const records = result.records || []

  return {
    records,
    lastSeenId: records.length ? records.at(-1).Id : lastSeenId,
    done: records.length < batchSize,
  }
}

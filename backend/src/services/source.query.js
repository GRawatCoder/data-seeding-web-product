import { runSoqlQuery } from './soql.service.js'
import { getSandboxAuth } from './auth.store.js'

const SYSTEM_FIELDS = ['Id']

export async function querySource({
  sandboxId,
  objectName,
  fields=[],
  batchSize = 200,
  lastSeenId = null,
  where = null,
}) {
  const auth = getSandboxAuth(sandboxId)
  if (!auth) throw new Error('Missing auth')

    //console.log('[Query Source fields] ', fields)

  const selectFields = [...new Set(['Id', ...fields])].join(',')

  let soql = `SELECT ${selectFields} FROM ${objectName}`

  const whereClauses = []

  if (where) {
    whereClauses.push(where)
  }

  if (lastSeenId) {
    whereClauses.push(`Id > '${lastSeenId}'`)
  }

  if (whereClauses.length) {
    soql += ` WHERE ${whereClauses.join(' AND ')}`
  }

  soql += ` ORDER BY Id ASC LIMIT ${batchSize}`

 // console.log('[SOQL Query going to execute]', soql)

  const result = await runSoqlQuery(sandboxId, soql)

  const records = result.records || []

  return {
    records,
    lastSeenId: records.length ? records.at(-1).Id : lastSeenId,
    done: records.length < batchSize,
  }
}

export async function queryByIds({
  sandboxId,
  objectName,
  fields = [],
  ids = [],
}) {
  if (!ids.length) return []

  const auth = getSandboxAuth(sandboxId)
  if (!auth) throw new Error('Missing auth')

  const selectFields = [...new Set(['Id', ...fields])].join(',')

  const soql = `
    SELECT ${selectFields}
    FROM ${objectName}
    WHERE Id IN (${ids.map(id => `'${id}'`).join(',')})
  `

 // console.log('[SOQL Query by Ids]', soql.trim())

  const result = await runSoqlQuery(sandboxId, soql)

  return result.records || []
}



import axios from 'axios'
import { getSandboxAuth } from './auth.store.js'

const recordTypeCache = new Map()

export async function resolveRecordTypeId({
  value: sourceRecordTypeId,
  objectName,
  sourceSandboxId,
  targetSandboxId,
}) {
  const cacheKey = `${targetSandboxId}:${objectName}:${sourceRecordTypeId}`
  if (recordTypeCache.has(cacheKey)) {
    return recordTypeCache.get(cacheKey)
  }

  const sourceAuth = getSandboxAuth(sourceSandboxId)
  const targetAuth = getSandboxAuth(targetSandboxId)

  if (!sourceAuth || !targetAuth) return null

  // 1️⃣ Fetch source RecordType
  const srcUrl = `${sourceAuth.instanceUrl}/services/data/v58.0/sobjects/RecordType/${sourceRecordTypeId}`

  const srcRes = await axios.get(srcUrl, {
    headers: { Authorization: `Bearer ${sourceAuth.accessToken}` },
  })

  const { DeveloperName, SobjectType } = srcRes.data

  // 2️⃣ Find matching RecordType in target
  const soql = `
    SELECT Id 
    FROM RecordType 
    WHERE DeveloperName='${DeveloperName}'
    AND SobjectType='${SobjectType}'
    LIMIT 1
  `

  const tgtUrl = `${targetAuth.instanceUrl}/services/data/v58.0/query`
  const tgtRes = await axios.get(tgtUrl, {
    headers: { Authorization: `Bearer ${targetAuth.accessToken}` },
    params: { q: soql },
  })

  const targetId = tgtRes.data.records?.[0]?.Id || null

  recordTypeCache.set(cacheKey, targetId)
  return targetId
}

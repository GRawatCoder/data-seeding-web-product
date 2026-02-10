import axios from 'axios'
import { getSandboxAuth } from './auth.store.js'

const userCache = new Map()

export async function resolveUserId({
  value: sourceUserId,
  sourceSandboxId,
  targetSandboxId,
}) {
  const cacheKey = `${targetSandboxId}:${sourceUserId}`
  if (userCache.has(cacheKey)) {
    return userCache.get(cacheKey)
  }

  const sourceAuth = getSandboxAuth(sourceSandboxId)
  const targetAuth = getSandboxAuth(targetSandboxId)

  if (!sourceAuth || !targetAuth) return null

  // 1️⃣ Fetch source user (Username is globally unique)
  const srcUrl = `${sourceAuth.instanceUrl}/services/data/v58.0/sobjects/User/${sourceUserId}`

  let username
  try {
    const srcRes = await axios.get(srcUrl, {
      headers: { Authorization: `Bearer ${sourceAuth.accessToken}` },
    })
    username = srcRes.data.Username
  } catch {
    return null
  }

  // 2️⃣ Find user in target by Username
  const soql = `
    SELECT Id 
    FROM User 
    WHERE Username='${username}'
    AND IsActive=true
    LIMIT 1
  `

  const tgtUrl = `${targetAuth.instanceUrl}/services/data/v58.0/query`
  const tgtRes = await axios.get(tgtUrl, {
    headers: { Authorization: `Bearer ${targetAuth.accessToken}` },
    params: { q: soql },
  })

  let resolvedId = tgtRes.data.records?.[0]?.Id

  // 3️⃣ Fallback to default user
  if (!resolvedId) {
    resolvedId = await resolveDefaultUser(targetAuth)
  }

  userCache.set(cacheKey, resolvedId)
  return resolvedId
}

async function resolveDefaultUser(auth) {
  const soql = `
    SELECT Id 
    FROM User 
    WHERE Profile.Name='System Administrator'
    AND IsActive=true
    ORDER BY LastLoginDate DESC
    LIMIT 1
  `

  const url = `${auth.instanceUrl}/services/data/v58.0/query`
  const res = await axios.get(url, {
    headers: { Authorization: `Bearer ${auth.accessToken}` },
    params: { q: soql },
  })

  return res.data.records?.[0]?.Id || null
}

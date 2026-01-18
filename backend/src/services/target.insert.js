import axios from 'axios'
import { getSandboxAuth } from './auth.store.js'

export async function insertTarget({
  sandboxId,
  objectName,
  records,
}) {
  const auth = getSandboxAuth(sandboxId)
  if (!auth) throw new Error('Missing target auth')

  const url = `${auth.instanceUrl}/services/data/v58.0/composite/sobjects`

  const payload = {
    allOrNone: false,
    records: records.map(r => ({
      attributes: { type: objectName },
      ...r,
    })),
  }

  const res = await axios.post(url, payload, {
    headers: {
      Authorization: `Bearer ${auth.accessToken}`,
      'Content-Type': 'application/json',
    },
  })

  return res.data
}

import axios from 'axios'
import { getSandboxAuth } from './auth.store.js'

export async function validateTargetSandbox(
  sourceObjects,
  targetSandboxId
) {
  const auth = getSandboxAuth(targetSandboxId)
  if (!auth) throw new Error('Target sandbox not connected')

  const res = await axios.get(
    `${auth.instanceUrl}/services/data/v58.0/sobjects`,
    {
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
      },
    }
  )

  const targetObjects = new Map(
    res.data.sobjects.map((o) => [o.name, o])
  )

  const results = sourceObjects.map((obj) => {
    const targetObj = targetObjects.get(obj)

    if (!targetObj) {
      return {
        object: obj,
        status: 'ERROR',
        message: 'Object does not exist in target org',
      }
    }

    if (!targetObj.createable) {
      return {
        object: obj,
        status: 'ERROR',
        message: 'Object not createable in target org',
      }
    }

    return {
      object: obj,
      status: 'OK',
    }
  })

  return results
}

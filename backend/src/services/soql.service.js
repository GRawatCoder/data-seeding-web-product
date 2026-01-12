import axios from 'axios'
import { getSandboxAuth } from './auth.store.js'
import { refreshAccessToken } from './sfToken.service.js'

export async function runSoqlQuery(sandboxId, soql) {
  const auth = getSandboxAuth(sandboxId)

  if (!auth) {
    throw new Error('Sandbox not connected')
  }

  try {
    const response = await axios.get(
      `${auth.instanceUrl}/services/data/v58.0/query`,
      {
        params: { q: soql },
        headers: {
          Authorization: `Bearer ${auth.accessToken}`,
        },
      }
    )

    return response.data
  } catch (err) {
    if (err.response?.status === 401) {
      try {
        const newToken = await refreshAccessToken(sandboxId, auth)

        const response = await axios.get(
          `${auth.instanceUrl}/services/data/v58.0/query`,
          {
            params: { q: soql },
            headers: {
              Authorization: `Bearer ${newToken}`,
            },
          }
        )

        return response.data
      } catch (refreshErr) {
        throw new Error('Token refresh failed: ' + refreshErr.message)
      }
    }

    throw err
  }
}

import axios from 'axios'
import { getSandboxAuth } from './auth.store.js'
import { refreshAccessToken } from './sfToken.service.js'

export async function checkSandboxHealth(sandboxId) {
  const auth = getSandboxAuth(sandboxId)

  if (!auth) {
    return { status: 'DISCONNECTED' }
  }

  try {
    await axios.get(
      `${auth.instanceUrl}/services/data/v58.0/`,
      {
        headers: {
          Authorization: `Bearer ${auth.accessToken}`,
        },
      }
    )

    return { status: 'HEALTHY' }
  } catch (err) {
    if (err.response?.status === 401) {
      try {
        const newToken = await refreshAccessToken(sandboxId, auth)

        await axios.get(
          `${auth.instanceUrl}/services/data/v58.0/`,
          {
            headers: {
              Authorization: `Bearer ${newToken}`,
            },
          }
        )

        return { status: 'HEALTHY' }
      } catch {
        return { status: 'EXPIRED' }
      }
    }

    return { status: 'ERROR' }
  }
}

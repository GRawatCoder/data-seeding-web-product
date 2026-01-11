import axios from 'axios'
import { decrypt } from '../utils/crypto.util.js'
import { saveSandboxAuth } from './auth.store.js'

export async function refreshAccessToken(sandboxId, auth) {
  const refreshToken = decrypt(auth.refreshToken)

  const response = await axios.post(
    `${process.env.SF_LOGIN_URL}/services/oauth2/token`,
    new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: process.env.SF_CLIENT_ID,
      client_secret: process.env.SF_CLIENT_SECRET,
      refresh_token: refreshToken,
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  )

  saveSandboxAuth(sandboxId, {
    ...auth,
    accessToken: response.data.access_token,
    issuedAt: new Date().toISOString(),
  })

  return response.data.access_token
}

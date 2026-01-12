import axios from 'axios'
import crypto from 'crypto'

import { encrypt, decrypt } from '../utils/crypto.util.js'
import { saveSandboxAuth } from '../services/auth.store.js'
import {
  getSandbox,
  markSandboxConnected,
} from '../services/sandbox.store.js'

/**
 * STEP 5A — OAuth Login (Per-Sandbox Client)
 */
export function oauthLogin(req, res) {
  const { sandboxId } = req.query

  if (!sandboxId) {
    return res.status(400).send('Missing sandboxId')
  }

  const sandbox = getSandbox(sandboxId)
  if (!sandbox) {
    return res.status(404).send('Sandbox not found')
  }

  // Encode sandboxId into OAuth state
  const statePayload = {
    sandboxId,
    nonce: crypto.randomUUID(),
  }

  const state = Buffer
    .from(JSON.stringify(statePayload))
    .toString('base64')

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: sandbox.clientId, // ✅ per sandbox
    redirect_uri: process.env.SF_REDIRECT_URI,
    scope: 'api refresh_token',
    state,
  })

  const loginUrl =
    `${sandbox.loginUrl}/services/oauth2/authorize?${params}`

  res.redirect(loginUrl)
}

/**
 * STEP 5B — OAuth Callback (Per-Sandbox Token Exchange)
 */
export async function oauthCallback(req, res) {
  const { code, state } = req.query

  if (!code || !state) {
    return res.status(400).send('Missing authorization code or state')
  }

  let sandboxId

  try {
    const decoded = JSON.parse(
      Buffer.from(state, 'base64').toString('utf8')
    )
    sandboxId = decoded.sandboxId
  } catch {
    return res.status(400).send('Invalid OAuth state')
  }

  const sandbox = getSandboxById(sandboxId)
  if (!sandbox) {
    return res.status(404).send('Sandbox not found')
  }

  try {
    const tokenResponse = await axios.post(
      `${sandbox.loginUrl}/services/oauth2/token`,
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: sandbox.clientId,                 // ✅ per sandbox
        client_secret: decrypt(sandbox.clientSecret), // ✅ per sandbox
        redirect_uri: process.env.SF_REDIRECT_URI,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    )

    // Encrypt refresh token before storing
    const encryptedRefreshToken =
      encrypt(tokenResponse.data.refresh_token)

    saveSandboxAuth(sandboxId, {
      accessToken: tokenResponse.data.access_token,
      refreshToken: encryptedRefreshToken,
      instanceUrl: tokenResponse.data.instance_url,
      issuedAt: new Date().toISOString(),
    })

    // Mark correct sandbox as connected
    markSandboxConnected(sandboxId)

    res.redirect('http://localhost:5173/')
  } catch (err) {
    console.error(err.response?.data || err.message)
    res.status(500).send('OAuth token exchange failed')
  }
}

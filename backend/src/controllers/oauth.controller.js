import { markSandboxConnected } from '../services/sandbox.store.js'
import axios from 'axios'
import crypto from 'crypto'
import { encrypt } from '../utils/crypto.util.js'
import { saveSandboxAuth } from '../services/auth.store.js'


export function oauthLogin(req, res) {
  const { sandboxId } = req.query

  if (!sandboxId) {
    return res.status(400).send('Missing sandboxId')
  }

  // Encode sandboxId into state
  const statePayload = {
    sandboxId,
    nonce: crypto.randomUUID(),
  }

  const state = Buffer
    .from(JSON.stringify(statePayload))
    .toString('base64')

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.SF_CLIENT_ID,
    redirect_uri: process.env.SF_REDIRECT_URI,
    scope: 'api refresh_token',
    state,
  })

  const loginUrl =
    `${process.env.SF_LOGIN_URL}/services/oauth2/authorize?${params}`

  res.redirect(loginUrl)
}


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

  try {
    const tokenResponse = await axios.post(
      `${process.env.SF_LOGIN_URL}/services/oauth2/token`,
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: process.env.SF_CLIENT_ID,
        client_secret: process.env.SF_CLIENT_SECRET,
        redirect_uri: process.env.SF_REDIRECT_URI,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    )

    const encryptedRefreshToken = encrypt(tokenResponse.data.refresh_token);

    saveSandboxAuth(sandboxId, {
      accessToken: tokenResponse.data.access_token,
      refreshToken: encryptedRefreshToken,
      instanceUrl: tokenResponse.data.instance_url,
      issuedAt: new Date().toISOString(),
    });


    // TEMP – still global, will be per-sandbox in Step 2.2
    global.sfAuth = tokenResponse.data

    // ✅ Update correct sandbox
    markSandboxConnected(sandboxId)

    res.redirect('http://localhost:5173/')
  } catch (err) {
    console.error(err.response?.data || err.message)
    res.status(500).send('OAuth token exchange failed')
  }
}

import axios from 'axios'
import crypto from 'crypto'

export function oauthLogin(req, res) {
  const state = crypto.randomUUID()

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.SF_CLIENT_ID,
    redirect_uri: process.env.SF_REDIRECT_URI,
    scope: 'api refresh_token',
    state,
  })

  const loginUrl = `${process.env.SF_LOGIN_URL}/services/oauth2/authorize?${params}`
  res.redirect(loginUrl)
}

export async function oauthCallback(req, res) {
  const { code } = req.query

  if (!code) {
    return res.status(400).send('Missing authorization code')
  }

  try {
    const tokenRes = await axios.post(
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

    /**
     * TEMP (Phase 1)
     * - Store tokens in memory
     * - Encrypt refresh token later
     */
    global.sfAuth = {
      accessToken: tokenRes.data.access_token,
      refreshToken: tokenRes.data.refresh_token,
      instanceUrl: tokenRes.data.instance_url,
      issuedAt: new Date().toISOString(),
    }

    res.redirect('http://localhost:5173/?connected=true')
  } catch (err) {
    console.error(err.response?.data || err.message)
    res.status(500).send('OAuth token exchange failed')
  }
}

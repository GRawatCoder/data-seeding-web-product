import { markSandboxConnected } from '../services/sandbox.store.js'

export async function oauthCallback(req, res) {
  const { code, state, sandboxId } = req.query

  if (!code || !sandboxId) {
    return res.status(400).send('Missing authorization code or sandboxId')
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

    // TEMP: still global, will be per-sandbox in Step 2.2
    global.sfAuth = tokenResponse.data

    // ✅ THIS IS THE IMPORTANT PART
    markSandboxConnected(sandboxId)

    res.redirect('http://localhost:5173/')
  } catch (err) {
    console.error(err.response?.data || err.message)
    res.status(500).send('OAuth token exchange failed')
  }
}

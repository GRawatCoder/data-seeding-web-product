import { getSandboxes, addSandbox } from '../services/sandbox.store.js'
import { deleteSandbox } from '../services/sandbox.store.js'
import { removeSandboxAuth } from '../services/auth.store.js'
import { encrypt } from '../utils/crypto.util.js'
import { saveSandbox } from '../services/sandbox.store.js'
import { v4 as uuid } from 'uuid'

export function listSandboxes(req, res) {
  res.json(getSandboxes())
}

export function createSandbox(req, res) {
  const {
    name,
    type,
    loginUrl,
    clientId,
    clientSecret,
  } = req.body

  if (!name || !loginUrl || !clientId || !clientSecret) {
    return res.status(400).json({
      error: 'Missing required sandbox fields',
    })
  }

  const sandbox = {
    id: uuid(),
    name,
    loginUrl,
    type,
    clientId,
    clientSecret: encrypt(clientSecret),
    status: 'DISCONNECTED',
    createdAt: new Date().toISOString(),
  }

  saveSandbox(sandbox)
  res.json(sandbox)
}

export function removeSandbox(req, res) {
  const { id } = req.params

  deleteSandbox(id)
  removeSandboxAuth(id)

  res.json({ message: 'Sandbox deleted' })
}

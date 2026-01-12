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
    loginUrl,
    clientId,
    clientSecret,
  } = req.body

  const sandbox = {
    id: uuid(),
    name,
    loginUrl,
    clientId,
    clientSecret: encrypt(clientSecret),
    status: 'DISCONNECTED',
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

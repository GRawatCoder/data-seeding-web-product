import { getSandboxes, addSandbox } from '../services/sandbox.store.js'
import { deleteSandbox } from '../services/sandbox.store.js'

export function listSandboxes(req, res) {
  res.json(getSandboxes())
}

export function removeSandbox(req, res) {
  deleteSandbox(req.params.id)
  res.json({ message: 'Sandbox deleted' })
}

export function createSandbox(req, res) {
  const { name, type, loginUrl } = req.body

  if (!name || !type || !loginUrl) {
    return res.status(400).json({ message: 'Missing required fields' })
  }

  addSandbox({ name, type, loginUrl })
  res.status(201).json({ message: 'Sandbox added successfully' })
}

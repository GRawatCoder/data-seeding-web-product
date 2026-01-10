import crypto from 'crypto'

const sandboxes = []

export function getSandboxes() {
  return sandboxes
}

export function addSandbox(sandbox) {
  sandboxes.push({
    id: crypto.randomUUID(),
    name: sandbox.name,
    type: sandbox.type,
    loginUrl: sandbox.loginUrl,
    status: 'DISCONNECTED',
    createdAt: new Date().toISOString(),
  })
}

export function markSandboxConnected(sandboxId) {
  const sb = sandboxes.find(s => s.id === sandboxId)
  if (sb) {
    sb.status = 'CONNECTED'
    sb.connectedAt = new Date().toISOString()
  }
}

export function deleteSandbox(sandboxId) {
  const index = sandboxes.findIndex(s => s.id === sandboxId)
  if (index !== -1) {
    sandboxes.splice(index, 1)
  }
}

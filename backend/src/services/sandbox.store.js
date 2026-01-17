import crypto from 'crypto'

const sandboxes = []

export const sandboxStore = new Map()

export function getSandbox(id) {
  return sandboxStore.get(id)
}

export function saveSandbox(sandbox) {
  sandboxStore.set(sandbox.id, sandbox)
}


export function getSandboxes() {
  return Array.from(sandboxStore.values())
}

export function addSandbox(data) {
  const sandbox = {
    id: crypto.randomUUID(),
    name: data.name,
    type: data.type,
    loginUrl: data.loginUrl,
    clientId: data.clientId,
    clientSecret: data.clientSecret,
    status: 'DISCONNECTED',
    createdAt: new Date().toISOString(),
  }

  sandboxStore.set(sandbox.id, sandbox)
  return sandbox
}

export function markSandboxConnected(id) {
  const sb = sandboxStore.get(id)
  if (!sb) return

  sb.status = 'CONNECTED'
  sb.connectedAt = new Date().toISOString()
}

export function deleteSandbox(id) {
  sandboxStore.delete(id)
}

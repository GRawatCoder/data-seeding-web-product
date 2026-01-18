const sandboxAuthStore = {}

export function saveSandboxAuth(sandboxId, auth) {
  sandboxAuthStore[sandboxId] = auth
  console.log(sandboxAuthStore[sandboxId])
}

export function getSandboxAuth(sandboxId) {
  const auth = sandboxAuthStore[sandboxId]
  console.log('[AUTH]', sandboxId, auth ? 'FOUND' : 'MISSING')
  return sandboxAuthStore[sandboxId]
}

export function removeSandboxAuth(sandboxId) {
  delete sandboxAuthStore[sandboxId]
}

export function listSandboxAuth() {
  return sandboxAuthStore
}

const sandboxAuthStore = {}

export function saveSandboxAuth(sandboxId, auth) {
  sandboxAuthStore[sandboxId] = auth
  console.log(sandboxAuthStore[sandboxId])
}

export function getSandboxAuth(sandboxId) {
  return sandboxAuthStore[sandboxId]
}

export function removeSandboxAuth(sandboxId) {
  delete sandboxAuthStore[sandboxId]
}

export function listSandboxAuth() {
  return sandboxAuthStore
}

const sandboxes = []

export function getSandboxes() {
  return sandboxes
}

export function addSandbox(sandbox) {
  sandboxes.push({
    id: crypto.randomUUID(),
    status: 'DISCONNECTED',
    createdAt: new Date().toISOString(),
    ...sandbox,
  })
}

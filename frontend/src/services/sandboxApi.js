const API_BASE = 'http://localhost:4000/api'

export async function fetchSandboxes() {
  const res = await fetch(`${API_BASE}/sandboxes`)
  if (!res.ok) throw new Error('Failed to fetch sandboxes')
  return res.json()
}

export async function deleteSandbox(id) {
  const res = await fetch(`${API_BASE}/sandboxes/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error('Failed to delete sandbox')
}

export async function createSandbox(payload) {
  const res = await fetch(`${API_BASE}/sandboxes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || 'Failed to create sandbox')
  }
}

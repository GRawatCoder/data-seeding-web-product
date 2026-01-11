export async function fetchObjects(sandboxId) {
  const res = await fetch(
    `http://localhost:4000/seeding/objects/${sandboxId}`,
    { credentials: 'include' }
  )

  if (!res.ok) throw new Error('Failed to fetch objects')
  return res.json()
}

export async function fetchDependencies(sandboxId, objects) {
  const res = await fetch(
    `http://localhost:4000/seeding/dependencies/${sandboxId}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ objects }),
    }
  )

  if (!res.ok) throw new Error('Failed to fetch dependencies')
  return res.json()
}

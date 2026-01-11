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

  if (!res.ok) {
    throw new Error('Failed to fetch dependencies')
  }

  return res.json()
}

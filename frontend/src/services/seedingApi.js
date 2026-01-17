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

export async function fetchPreview(sandboxId, objectName) {
  const res = await fetch(
    `http://localhost:4000/seeding/preview/${sandboxId}?objectName=${objectName}&limit=5`,
    { credentials: 'include' }
  )

  if (!res.ok) throw new Error('Failed to fetch preview')
  return res.json()
}

export async function fetchExecutionOrder(sandboxId, objects) {
  const res = await fetch(
    `http://localhost:4000/seeding/execution-order/${sandboxId}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ objects }),
    }
  )

  if (!res.ok) throw new Error('Failed to fetch execution order')
  return res.json()
}

export async function validateTargetSandbox(
  targetSandboxId,
  objects
) {
  const res = await fetch(
    `http://localhost:4000/seeding/validate-target/${targetSandboxId}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ objects }),
    }
  )

  if (!res.ok) throw new Error('Target validation failed')
  return res.json()
}

export async function runDryRun(payload) {
  const res = await fetch(
    'http://localhost:4000/seeding/dry-run',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    }
  )

  if (!res.ok) throw new Error('Dry-run failed')
  return res.json()
}


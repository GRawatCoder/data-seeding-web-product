import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { fetchSandboxes } from '../services/sandboxApi'
import { fetchDependencies } from '../services/seedingApi'

export default function DataSeeding() {
  const [sourceSandboxId, setSourceSandboxId] = useState('')
  const [selectedObjects, setSelectedObjects] = useState([])

  const { data: sandboxes = [] } = useQuery({
    queryKey: ['sandboxes'],
    queryFn: fetchSandboxes,
  })

  const dependencyMutation = useMutation({
    mutationFn: ({ sandboxId, objects }) =>
      fetchDependencies(sandboxId, objects),
  })

  function handleObjectSelect(objects) {
    setSelectedObjects(objects)
    dependencyMutation.mutate({
      sandboxId: sourceSandboxId,
      objects,
    })
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h2 className="text-xl font-semibold">Data Seeding (Preview)</h2>

      {/* Source Sandbox */}
      <select
        value={sourceSandboxId}
        onChange={(e) => setSourceSandboxId(e.target.value)}
        className="px-3 py-2 rounded bg-gray-100"
      >
        <option value="">Select source sandbox</option>
        {sandboxes
          .filter((s) => s.status === 'CONNECTED')
          .map((sb) => (
            <option key={sb.id} value={sb.id}>
              {sb.name}
            </option>
          ))}
      </select>

      {/* Object Picker (next step) */}

      {/* Dependency Preview (next step) */}
    </div>
  )
}

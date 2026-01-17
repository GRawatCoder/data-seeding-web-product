import { useMutation } from '@tanstack/react-query'
import { validateTargetSandbox } from '../services/seedingApi'
import { CheckCircle2, XCircle } from 'lucide-react'

export default function TargetSandboxSelector({
  sandboxes,
  selectedObjects,
  onTargetSelected
}) {
  const mutation = useMutation({
    mutationFn: ({ sandboxId, objects }) =>
      validateTargetSandbox(sandboxId, objects),
  })

  function handleSelect(e) {
    const sandboxId = e.target.value
    if (!sandboxId) return
    onTargetSelected(sandboxId)
    mutation.mutate({
      sandboxId,
      objects: selectedObjects,
    })
  }

  return (
    <div className="border rounded p-4 bg-white mt-6">
      <h3 className="font-medium mb-2">Target Sandbox</h3>

      <select
        onChange={handleSelect}
        className="px-3 py-2 rounded bg-gray-100 w-full"
      >
        <option value="">Select target sandbox</option>
        {sandboxes
          .filter((s) => s.status === 'CONNECTED')
          .map((sb) => (
            <option key={sb.id} value={sb.id}>
              {sb.name}
            </option>
          ))}
      </select>

      {mutation.data && (
        <div className="mt-4 space-y-1">
          {mutation.data.result.map((r) => (
            <div
              key={r.object}
              className="flex items-center gap-2 text-sm"
            >
              {r.status === 'OK' ? (
                <CheckCircle2
                  size={14}
                  className="text-green-600"
                />
              ) : (
                <XCircle size={14} className="text-red-600" />
              )}
              {r.object} — {r.status}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

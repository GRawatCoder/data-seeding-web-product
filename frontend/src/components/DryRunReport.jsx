import { useMutation } from '@tanstack/react-query'
import { runDryRun } from '../services/seedingApi'
import { CheckCircle2, XCircle } from 'lucide-react'

export default function DryRunReport({
  sourceSandboxId,
  targetSandboxId,
  selectedObjects,
}) {
  const mutation = useMutation({
    mutationFn: runDryRun,
  })

  function handleRun() {
    mutation.mutate({
      sourceSandboxId,
      targetSandboxId,
      objects: selectedObjects,
    })
  }

  return (
    <div className="border rounded p-4 bg-white mt-6">
      <button
        onClick={handleRun}
        className="bg-black text-white px-4 py-2 rounded"
      >
        Run Dry-Run
      </button>

      {mutation.data && (
        <div className="mt-4 space-y-3 text-sm">
          <h3 className="font-semibold">Dry-Run Summary</h3>

          <p>
            Objects: {mutation.data.summary.totalObjects}
          </p>
          <p>
            Records: {mutation.data.summary.totalRecords}
          </p>

          <h4 className="font-medium mt-2">Execution Plan</h4>

          {mutation.data.executionOrder.map((obj) => {
            const validation =
              mutation.data.validation.find(
                (v) => v.object === obj
              )

            return (
              <div
                key={obj}
                className="flex justify-between items-center"
              >
                <span>{obj}</span>
                <span>
                  {mutation.data.recordCounts[obj]} records
                </span>
                {validation?.status === 'OK' ? (
                  <CheckCircle2
                    size={14}
                    className="text-green-600"
                  />
                ) : (
                  <XCircle
                    size={14}
                    className="text-red-600"
                  />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

import { useQuery } from '@tanstack/react-query'
import { fetchExecutionOrder } from '../services/seedingApi'

export default function ExecutionOrderPreview({
  sandboxId,
  selectedObjects,
}) {
  const { data, isLoading } = useQuery({
    queryKey: ['execution-order', sandboxId, selectedObjects],
    queryFn: () =>
      fetchExecutionOrder(sandboxId, selectedObjects),
    enabled: selectedObjects.length > 0,
  })

  if (isLoading) return <p className="text-sm">Calculating order…</p>
  if (!data) return null

  return (
    <div className="mt-6 border rounded bg-gray-50 p-4">
      <h3 className="font-medium mb-2">Execution Order</h3>

      <ol className="list-decimal ml-5 space-y-1 text-sm">
        {data.order.map((obj) => (
          <li key={obj}>{obj}</li>
        ))}
      </ol>
    </div>
  )
}

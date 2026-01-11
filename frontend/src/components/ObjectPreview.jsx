import { useQuery } from '@tanstack/react-query'
import { fetchPreview } from '../services/seedingApi'

export default function ObjectPreview({ sandboxId, objectName }) {
  const { data, isLoading } = useQuery({
    queryKey: ['preview', sandboxId, objectName],
    queryFn: () => fetchPreview(sandboxId, objectName),
    enabled: !!sandboxId && !!objectName,
  })

  if (isLoading) return <p className="text-sm">Loading preview…</p>
  if (!data) return null

  return (
    <div className="mt-2 border rounded bg-white p-2">
      <p className="text-sm font-medium mb-1">
        Records: {data.totalSize}
      </p>

      {data.records.length > 0 ? (
        <div className="overflow-auto">
          <table className="text-xs border-collapse">
            <thead>
              <tr>
                {data.columns.map((col) => (
                  <th
                    key={col}
                    className="border px-2 py-1 text-left bg-gray-100"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.records.map((row) => (
                <tr key={row.Id}>
                  {data.columns.map((col) => (
                    <td
                      key={col}
                      className="border px-2 py-1"
                    >
                      {String(row[col] ?? '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-xs text-gray-500">No records found</p>
      )}
    </div>
  )
}

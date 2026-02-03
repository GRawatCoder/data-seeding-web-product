import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchSandboxes } from "../services/sandboxApi";
import { fetchObjects, fetchDependencies } from "../services/seedingApi";
import ObjectPreview from "../components/ObjectPreview";
import ExecutionOrderPreview from "../components/ExecutionOrderPreview";
import TargetSandboxSelector from "../components/TargetSandboxSelector";
import DryRunReport from "../components/DryRunReport";

export default function DataSeeding() {
  const [sourceSandboxId, setSourceSandboxId] = useState("");
  const [targetSandboxId, setTargetSandboxId] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedObjects, setSelectedObjects] = useState([]);
  const [autoIncludedObjects, setAutoIncludedObjects] = useState([]);


  const { data: sandboxes = [] } = useQuery({
    queryKey: ["sandboxes"],
    queryFn: fetchSandboxes,
  });

  const { data: objects = [] } = useQuery({
    queryKey: ["objects", sourceSandboxId],
    queryFn: () => fetchObjects(sourceSandboxId),
    enabled: !!sourceSandboxId,
  });

  const dependencyMutation = useMutation({
    mutationFn: ({ sandboxId, objects }) =>
      fetchDependencies(sandboxId, objects),
  });

  function toggleObject(apiName) {
    setAutoIncludedObjects([]);
    let next;
    if (selectedObjects.includes(apiName)) {
      next = selectedObjects.filter((o) => o !== apiName);
    } else {
      next = [...selectedObjects, apiName];
    }

    setSelectedObjects(next);

    if (next.length) {
      dependencyMutation.mutate({
        sandboxId: sourceSandboxId,
        objects: next,
      });
    }
  }

  const filteredObjects = objects.filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase())
  );  

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h2 className="text-xl font-semibold">Data Seeding (Preview)</h2>

      {/* Source Sandbox */}
      <select
        value={sourceSandboxId}
        onChange={(e) => {
          setSourceSandboxId(e.target.value);
          setSelectedObjects([]);
        }}
        className="px-3 py-2 rounded bg-gray-100"
      >
        <option value="">Select source sandbox</option>
        {sandboxes
          .filter((s) => s.status === "CONNECTED")
          .map((sb) => (
            <option key={sb.id} value={sb.id}>
              {sb.name}
            </option>
          ))}
      </select>

      {/* Object Picker */}
      {sourceSandboxId && (
        <div className="space-y-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search objects…"
            className="px-3 py-2 rounded bg-gray-100 w-full"
          />

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-auto border p-2 rounded">
            {filteredObjects.map((obj) => {
              const isAutoIncluded = autoIncludedObjects.includes(obj.name);
              const isSelected = selectedObjects.includes(obj.name);

              return (
                <button
                  key={obj.name}
                  disabled={isAutoIncluded}
                  onClick={() => toggleObject(obj.name)}
                  className={`text-left px-2 py-1 rounded text-sm
        ${
          isSelected
            ? "bg-blue-600 text-white"
            : isAutoIncluded
              ? "bg-yellow-100 text-gray-500 cursor-not-allowed"
              : "bg-gray-100 hover:bg-gray-200"
        }`}
                >
                  <span className="flex justify-between items-center">
                    {obj.name}

                    {isAutoIncluded && (
                      <span className="text-xs bg-yellow-200 text-yellow-800 px-1 rounded">
                        🧠 auto
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Dependency Preview */}
      {dependencyMutation.data && (
        <div className="border rounded p-4 bg-gray-50">
          <h3 className="font-medium mb-2">Dependencies</h3>

          <div className="space-y-1">
            {Object.entries(dependencyMutation.data).map(([object, info]) => (
              <div key={object} className="mb-3">
                <span
                  className={`font-medium ${
                    selectedObjects.includes(object)
                      ? "text-blue-600"
                      : "text-gray-700"
                  }`}
                >
                  {selectedObjects.includes(object) ? "✓ " : "↳ "}
                  {object}
                </span>

                <ObjectPreview
                  sandboxId={sourceSandboxId}
                  objectName={object}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🔽 EXECUTION ORDER GOES HERE 🔽 */}
      {selectedObjects.length > 0 && (
        <ExecutionOrderPreview
          sandboxId={sourceSandboxId}
          selectedObjects={selectedObjects}
        />
      )}

      {selectedObjects.length > 0 && (
        <TargetSandboxSelector
          sandboxes={sandboxes}
          selectedObjects={selectedObjects}
          onTargetSelected={setTargetSandboxId} // ✅
        />
      )}

      {/* Dry-Run + Execute (FINAL GATE) */}
      {targetSandboxId && (
        <DryRunReport
          sourceSandboxId={sourceSandboxId}
          targetSandboxId={targetSandboxId}
          selectedObjects={selectedObjects}
          onAutoIncludedChange={setAutoIncludedObjects}
        />
      )}
    </div>
  );
}

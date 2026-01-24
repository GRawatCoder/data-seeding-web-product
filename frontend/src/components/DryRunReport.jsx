import { useMutation } from "@tanstack/react-query";
import { runDryRun, executeSeeding } from "../services/seedingApi";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, Play } from "lucide-react";

export default function DryRunReport({
  sourceSandboxId,
  targetSandboxId,
  selectedObjects,
}) {
  const [maxRecords, setMaxRecords] = useState(10);
  const [progress, setProgress] = useState({});

  // -----------------------
  // Dry-Run (read-only)
  // -----------------------
  const dryRunMutation = useMutation({
    mutationFn: runDryRun,
  });

  // -----------------------
  // Execute (WRITE MODE)
  // -----------------------
  const executeMutation = useMutation({
    mutationFn: executeSeeding,
  });

  useEffect(() => {
     console.log("[SSE] executeMutation.isPending =", executeMutation.isPending);
    if (!executeMutation.isPending) return;
    console.log("[SSE] Subscribing to progress");
    const es = new EventSource("http://localhost:4000/progress");

    es.onmessage = (event) => {
        console.log("[SSE MESSAGE]", event.data);
      const data = JSON.parse(event.data);
      setProgress((prev) => ({
        ...prev,
        [data.object]: data.inserted,
      }));
    };

    return () => {
        es.close();
        console.log("[SSE] Unsubscribed/Close from progress");};
  }, [executeMutation.isPending]);

  

  function handleDryRun() {
    dryRunMutation.mutate({
      sourceSandboxId,
      targetSandboxId,
      objects: selectedObjects,
    });
  }

  function handleExecute() {
    if (
      !window.confirm(
        "This will INSERT DATA into the target sandbox. Continue?"
      )
    ) {
      return;
    }
    setProgress({}); // reset progress

    executeMutation.mutate({
      sourceSandboxId,
      targetSandboxId,
      objects: selectedObjects,
      maxRecordsPerObject: maxRecords,
    });
  }

  return (
    <div className="border rounded p-4 bg-white space-y-4">
      <h3 className="font-medium">Dry-Run Validation</h3>

      {/* Dry-Run Button */}
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 300 }}
        onClick={handleDryRun}
        disabled={dryRunMutation.isPending}
        className={`
    flex items-center gap-2
    px-4 py-2 rounded-md font-medium
    text-white
    bg-gradient-to-r from-gray-800 to-gray-900
    hover:from-gray-700 hover:to-gray-800
    disabled:opacity-50 disabled:cursor-not-allowed
    shadow-sm hover:shadow-md
  `}
      >
        {dryRunMutation.isPending ? (
          <>
            <Loader2 className="animate-spin" size={16} />
            Running Dry-Run…
          </>
        ) : (
          <>
            <Play size={16} />
            Run Dry-Run
          </>
        )}
      </motion.button>

      {/* Dry-Run Results */}
      {dryRunMutation.data && (
        <>
          <div className="text-sm space-y-1">
            <p>
              <strong>Total Objects:</strong>{" "}
              {dryRunMutation.data.summary.totalObjects}
            </p>
            <p>
              <strong>Total Records:</strong>{" "}
              {dryRunMutation.data.summary.totalRecords}
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <label className="font-medium">Records per object:</label>

            <select
              value={maxRecords}
              onChange={(e) => setMaxRecords(Number(e.target.value))}
              className="px-2 py-1 rounded bg-gray-100 border"
            >
              <option value={10}>10 (Safe)</option>
              <option value={50}>50</option>
              <option value={100}>100 (Max)</option>
            </select>
          </div>

          {/* ✅ EXECUTE BUTTON — ONLY AFTER DRY-RUN */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300 }}
            onClick={handleExecute}
            disabled={executeMutation.isPending}
            className={`
    flex items-center gap-2
    px-4 py-2 rounded-md font-medium
    text-white
    bg-gradient-to-r from-red-600 to-red-700
    hover:from-red-500 hover:to-red-600
    disabled:opacity-50 disabled:cursor-not-allowed
    shadow-sm hover:shadow-md
  `}
          >
            {executeMutation.isPending ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                Executing…
              </>
            ) : (
              <>🚀 Execute Seeding</>
            )}
          </motion.button>
        </>
      )}

      {executeMutation.isPending && (
        <div className="mt-4 space-y-2">
          {Object.entries(progress).map(([object, count]) => (
            <div key={object} className="text-sm">
              <div className="flex justify-between mb-1">
                <span>{object}</span>
                <span>{count} records</span>
              </div>

              <div className="w-full h-2 bg-gray-200 rounded overflow-hidden">
                <motion.div
                  className="h-2 bg-green-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${(count / maxRecords) * 100}%` }}
                  transition={{ ease: "easeOut", duration: 0.4 }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {executeMutation.isSuccess && (
        <p className="text-green-600 text-sm">Seeding completed successfully</p>
      )}

      {executeMutation.isError && (
        <p className="text-red-600 text-sm">
          Execution failed: {executeMutation.error.message}
        </p>
      )}
    </div>
  );
}

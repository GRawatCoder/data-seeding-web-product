import { useMutation } from "@tanstack/react-query";
import { runDryRun, executeSeeding } from "../services/seedingApi";

export default function DryRunReport({
  sourceSandboxId,
  targetSandboxId,
  selectedObjects,
}) {
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

    executeMutation.mutate({
      sourceSandboxId,
      targetSandboxId,
      objects: selectedObjects,
    });
  }

  return (
    <div className="border rounded p-4 bg-white space-y-4">
      <h3 className="font-medium">Dry-Run Validation</h3>

      {/* Dry-Run Button */}
      <button
        onClick={handleDryRun}
        className="bg-black text-white px-4 py-2 rounded"
        disabled={dryRunMutation.isLoading}
      >
        {dryRunMutation.isLoading ? "Running Dry-Run…" : "Run Dry-Run"}
      </button>

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

          {/* ✅ EXECUTE BUTTON — ONLY AFTER DRY-RUN */}
          <button
            onClick={handleExecute}
            className="bg-red-600 text-white px-4 py-2 rounded"
            disabled={executeMutation.isLoading}
          >
            {executeMutation.isLoading
              ? "Executing…"
              : "Execute Seeding"}
          </button>
        </>
      )}

      {executeMutation.isSuccess && (
        <p className="text-green-600 text-sm">
          Seeding completed successfully
        </p>
      )}

      {executeMutation.isError && (
        <p className="text-red-600 text-sm">
          Execution failed: {executeMutation.error.message}
        </p>
      )}
    </div>
  );
}

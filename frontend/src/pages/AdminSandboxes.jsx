import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchSandboxes,
  createSandbox,
  deleteSandbox,
  fetchSandboxHealth,
} from "../services/sandboxApi";
import { motion } from "framer-motion";
import { Link2, Trash2, Loader2 } from "lucide-react";
import { QUERY_KEYS } from "../constants/queryKeys";

export default function AdminSandboxes() {
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    name: "",
    type: "DEV",
    loginUrl: "",
    clientId: "",
    clientSecret: "",
  });

  const { data: sandboxes = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.SANDBOXES,
    queryFn: fetchSandboxes,
  });
  console.log("Sandboxes from cache:", sandboxes);
  // -----------------------
  // Health state per sandbox
  // -----------------------
  const [healthMap, setHealthMap] = useState({});

  useEffect(() => {
    if (!sandboxes.length) return;

    sandboxes.forEach((sb) => {
      fetchSandboxHealth(sb.id)
        .then((res) => {
          setHealthMap((prev) => ({
            ...prev,
            [sb.id]: res.status,
          }));
        })
        .catch(() => {
          setHealthMap((prev) => ({
            ...prev,
            [sb.id]: "ERROR",
          }));
        });
    });
  }, [sandboxes]);

  // -----------------------
  // Create sandbox
  // -----------------------
  const createMutation = useMutation({
    mutationFn: createSandbox,
    onSuccess: (newSandbox) => {
      queryClient.setQueryData(QUERY_KEYS.SANDBOXES, (old = []) => [
        ...old,
        newSandbox,
      ]);

      setForm({
        name: "",
        type: "DEV",
        loginUrl: "",
        clientId: "",
        clientSecret: "",
      });
    },
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    createMutation.mutate(form);
  }

  // -----------------------
  // Delete sandbox
  // -----------------------
  const deleteMutation = useMutation({
    mutationFn: deleteSandbox,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.SANDBOXES,
      });
    },
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <motion.h2
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xl font-semibold"
      >
        Sandbox Configuration
      </motion.h2>

      {/* Add Sandbox Form */}
      <motion.form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-lg border border-gray-200"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Sandbox Name"
          className="px-3 py-2 rounded-md bg-gray-100"
          required
        />

        <select
          name="type"
          value={form.type}
          onChange={handleChange}
          className="px-3 py-2 rounded-md bg-gray-100"
        >
          <option value="DEV">DEV</option>
          <option value="QA">QA</option>
          <option value="UAT">UAT</option>
        </select>

        <input
          name="loginUrl"
          value={form.loginUrl}
          onChange={handleChange}
          placeholder="Login URL"
          className="px-3 py-2 rounded-md bg-gray-100"
          required
        />

        <input
          name="clientId"
          placeholder="Client ID"
          value={form.clientId}
          onChange={handleChange}
          className="md:col-span-3 px-3 py-2 rounded-md bg-gray-100"
          required
        />

        <input
          name="clientSecret"
          placeholder="Client Secret"
          type="password"
          value={form.clientSecret}
          onChange={handleChange}
          className="md:col-span-3 px-3 py-2 rounded-md bg-gray-100"
          required
        />

        <button
          disabled={createMutation.isLoading}
          className="md:col-span-3 bg-black text-white py-2 rounded-md disabled:opacity-50"
        >
          {createMutation.isLoading ? "Adding…" : "Add Sandbox"}
        </button>

        {createMutation.isError && (
          <p className="md:col-span-3 text-red-500 text-sm">
            {createMutation.error.message}
          </p>
        )}
      </motion.form>

      {/* Sandbox List */}
      <div className="space-y-3">
        {isLoading && <p>Loading sandboxes…</p>}

        {sandboxes.map((sb) => (
          <motion.div
            key={sb.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between items-center bg-white border border-gray-200 p-4 rounded-lg"
          >
            {/* Left: Sandbox Info */}
            <div>
              <p className="font-medium">{sb.name}</p>
              <p className="text-xs text-gray-500">
                {sb.type} • {sb.loginUrl}
              </p>
            </div>

            {/* Right: Status + Health + Actions */}
            <div className="flex items-center gap-3">
              {/* Connection Status */}
              <motion.span
                key={sb.status}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className={`text-xs px-2 py-1 rounded
                  ${
                    sb.status === "CONNECTED"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-700"
                  }`}
              >
                {sb.status}
              </motion.span>

              {/* Health Status */}
              {sb.status === "CONNECTED" && (
                <span
                  className={`text-xs px-2 py-1 rounded
      ${
        healthMap[sb.id] === "HEALTHY"
          ? "bg-green-100 text-green-700"
          : healthMap[sb.id] === "EXPIRED"
          ? "bg-yellow-100 text-yellow-700"
          : healthMap[sb.id] === "ERROR"
          ? "bg-red-100 text-red-700"
          : "bg-gray-200 text-gray-600"
      }`}
                >
                  {healthMap[sb.id] || "UNKNOWN"}
                </span>
              )}

              {/* Connect Action */}
              {sb.status !== "CONNECTED" && (
                <a
                  href={`http://localhost:4000/oauth/login?sandboxId=${sb.id}`}
                  className="px-3 py-1.5 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition flex items-center gap-1"
                >
                  <Link2 size={14} />
                  Connect
                </a>
              )}

              {/* Delete Action */}
              <button
                disabled={deleteMutation.isLoading}
                onClick={() => {
                  const ok = window.confirm(`Delete sandbox "${sb.name}"?`);
                  if (ok) deleteMutation.mutate(sb.id);
                }}
                className={`px-2 py-1 rounded-md text-sm flex items-center gap-1
                  ${
                    deleteMutation.isLoading
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-red-100 text-red-700 hover:bg-red-200"
                  }`}
              >
                {deleteMutation.isLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Trash2 size={14} />
                )}
                Delete
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

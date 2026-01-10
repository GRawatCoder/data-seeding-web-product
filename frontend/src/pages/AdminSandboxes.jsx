import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchSandboxes, createSandbox, deleteSandbox } from '../services/sandboxApi'
import { motion } from 'framer-motion'
import {
  Link2,
  CheckCircle2,
  Trash2,
  Loader2,
} from 'lucide-react'


export default function AdminSandboxes() {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    name: '',
    type: 'DEV',
    loginUrl: '',
  })

  const { data: sandboxes = [], isLoading } = useQuery({
    queryKey: ['sandboxes'],
    queryFn: fetchSandboxes,
  })

  const mutation = useMutation({
    mutationFn: createSandbox,
    onSuccess: () => {
      queryClient.invalidateQueries(['sandboxes'])
      setForm({ name: '', type: 'DEV', loginUrl: '' })
    },
  })

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleSubmit(e) {
    e.preventDefault()
    mutation.mutate(form)
  }

  const deleteMutation = useMutation({
    mutationFn: deleteSandbox,
    onSuccess: () => {
      queryClient.invalidateQueries(["sandboxes"]);
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
        className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Sandbox Name"
          className="px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-800"
          required
        />

        <select
          name="type"
          value={form.type}
          onChange={handleChange}
          className="px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-800"
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
          className="px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-800"
          required
        />

        <button
          disabled={mutation.isLoading}
          className="md:col-span-3 bg-black dark:bg-white text-white dark:text-black py-2 rounded-md disabled:opacity-50"
        >
          {mutation.isLoading ? "Adding..." : "Add Sandbox"}
        </button>

        {mutation.isError && (
          <p className="md:col-span-3 text-red-500 text-sm">
            {mutation.error.message}
          </p>
        )}        
      </motion.form>

      {/* Sandbox List */}
      <div className="space-y-3">
        {isLoading && <p>Loading sandboxes...</p>}

        {sandboxes.map((sb) => (
          <motion.div
            key={sb.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between items-center
               bg-white dark:bg-gray-900
               border border-gray-200 dark:border-gray-800
               p-4 rounded-lg"
          >
            {/* Left: Sandbox Info */}
            <div>
              <p className="font-medium">{sb.name}</p>
              <p className="text-xs text-gray-500">
                {sb.type} • {sb.loginUrl}
              </p>
            </div>

            {/* Right: Status + Action */}
            <div className="flex items-center gap-3">
              <motion.span
                key={sb.status}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className={`text-xs px-2 py-1 rounded
    ${
      sb.status === "CONNECTED"
        ? "bg-green-100 text-green-700"
        : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
    }`}
              >
                {sb.status}
              </motion.span>

              {sb.status !== "CONNECTED" ? (
                <a
                  href={`http://localhost:4000/oauth/login?sandboxId=${sb.id}`}
                  className="px-3 py-1.5 rounded-md text-sm font-medium
               bg-blue-600 text-white
               hover:bg-blue-700 transition
               flex items-center gap-1"
                >
                  <Link2 size={14} />
                  Connect
                </a>
              ) : (
                <button
                  disabled
                  className="px-3 py-1.5 rounded-md text-sm font-medium
               bg-green-100 text-green-700
               cursor-not-allowed
               flex items-center gap-1"
                >
                  <CheckCircle2 size={14} />
                  Connected
                </button>
              )}

              <button
                disabled={deleteMutation.isLoading}
                onClick={() => {
                  const ok = window.confirm(`Delete sandbox "${sb.name}"?`);
                  if (ok) deleteMutation.mutate(sb.id);
                }}
                className={`px-2 py-1 rounded-md text-sm
    flex items-center gap-1
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

import { useEffect, useState } from 'react'
import './App.css'
import AdminSandboxes from './pages/AdminSandboxes'

export default function App() {
  const [theme, setTheme] = useState('light')
  const params = new URLSearchParams(window.location.search)
  const isConnected = params.get('connected') === 'true'


  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <div className="app-shell min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <header className="border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex justify-between items-center">
        <h1 className="text-lg font-semibold">Data Seeding Admin</h1>

        <button
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className="px-3 py-1 rounded-md bg-gray-200 dark:bg-gray-800 text-sm"
        >
          {theme === "light" ? "Dark" : "Light"}
        </button>
      </header>
      {isConnected && (
        <div className="mb-4 p-3 rounded bg-green-100 text-green-800">
          Salesforce connected successfully
        </div>
      )}

      <main className="p-6">
        <AdminSandboxes />
      </main>
    </div>
  );
}

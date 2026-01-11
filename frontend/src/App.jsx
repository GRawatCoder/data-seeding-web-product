import { useEffect, useState } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import './App.css'

import AdminSandboxes from './pages/AdminSandboxes'
import DataSeeding from './pages/DataSeeding'

export default function App() {
  const [theme, setTheme] = useState('light')

  const params = new URLSearchParams(window.location.search)
  const isConnected = params.get('connected') === 'true'

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <div className="app-shell min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex justify-between items-center">
        <h1 className="text-lg font-semibold">Data Seeding Admin</h1>

        <div className="flex items-center gap-4">
          {/* Navigation */}
          <nav className="flex gap-4 text-sm">
            <Link to="/" className="hover:underline">
              Sandboxes
            </Link>
            <Link to="/seeding" className="hover:underline">
              Data Seeding
            </Link>
          </nav>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="px-3 py-1 rounded-md bg-gray-200 dark:bg-gray-800 text-sm"
          >
            {theme === 'light' ? 'Dark' : 'Light'}
          </button>
        </div>
      </header>

      {/* OAuth Success Banner */}
      {isConnected && (
        <div className="m-4 p-3 rounded bg-green-100 text-green-800">
          Salesforce connected successfully
        </div>
      )}

      {/* Pages */}
      <main className="p-6">
        <Routes>
          <Route path="/" element={<AdminSandboxes />} />
          <Route path="/seeding" element={<DataSeeding />} />
        </Routes>
      </main>
    </div>
  )
}

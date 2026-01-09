import { useEffect, useState } from 'react'
import './App.css'

export default function App() {
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <div className="app-shell min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <header className="border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex justify-between items-center">
        <h1 className="text-lg font-semibold">
          Data Seeding Admin
        </h1>

        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="px-3 py-1 rounded-md bg-gray-200 dark:bg-gray-800 text-sm"
        >
          {theme === 'light' ? 'Dark' : 'Light'}
        </button>
      </header>

      <main className="p-6">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Admin Sandbox Setup will appear here.
        </p>
      </main>
    </div>
  )
}

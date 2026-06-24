'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export function AdminLoginForm() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (res.ok) {
        const from = searchParams.get('from') || '/admin'
        router.push(from)
        router.refresh()
      } else {
        setError('Contraseña incorrecta')
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl bg-white/10 border border-white/20 p-8"
      >
        <h1 className="text-xl font-bold mb-6 text-center">Admin Prode 2026</h1>

        <label className="block text-sm text-gray-400 mb-2">Contraseña</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg bg-white/10 border border-white/20 text-white px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        <button
          type="submit"
          disabled={loading || !password}
          className="w-full rounded-lg bg-blue-600 text-white font-medium py-3 disabled:opacity-50 hover:bg-blue-500 transition-colors"
        >
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  )
}

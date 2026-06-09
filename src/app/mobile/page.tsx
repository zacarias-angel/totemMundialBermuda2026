'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createClient } from '@/lib/supabase/client'

async function setSessionCookie(userId: string) {
  await fetch('/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  })
}

export default function MobileLogin() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim() || !email.trim()) {
      setError('Completá todos los campos')
      return
    }

    setLoading(true)

    const supabase = createClient()

    const { data: existing } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('email', email.trim())
      .maybeSingle()

    if (existing) {
      localStorage.setItem('prode_user', JSON.stringify(existing))
      await setSessionCookie(existing.id)
      router.push('/mobile/pronosticos')
      return
    }

    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({ name: name.trim(), email: email.trim() })
      .select('id, name, email')
      .single()

    if (insertError || !newUser) {
      setError('Error al registrar. Intentá de nuevo.')
      setLoading(false)
      return
    }

    localStorage.setItem('prode_user', JSON.stringify(newUser))
    await setSessionCookie(newUser.id)
    router.push('/mobile/pronosticos')
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-2">Prode 2026</h1>
          <p className="text-gray-400">Ingresá para pronosticar</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <Input
            id="name"
            label="Nombre"
            placeholder="Tu nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
          <Input
            id="email"
            label="Email"
            type="text"
            inputMode="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="off"
          />

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <Button type="submit" size="lg" disabled={loading} className="mt-2">
            {loading ? 'Ingresando...' : 'Ingresar'}
          </Button>
        </form>
      </div>
    </div>
  )
}

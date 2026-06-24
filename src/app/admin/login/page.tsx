import { Suspense } from 'react'
import { AdminLoginForm } from './AdminLoginForm'

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <p className="text-white/40">Cargando...</p>
      </div>
    }>
      <AdminLoginForm />
    </Suspense>
  )
}

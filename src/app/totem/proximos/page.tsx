export const dynamic = 'force-dynamic'
import { Suspense } from 'react'
import { InactivityGuard } from '@/components/totem/InactivityGuard'
import { ProximosPartidos } from '@/components/totem/ProximosPartidos'

export default function ProximosPage() {
  return (
    <InactivityGuard>
      <div className="relative min-h-screen p-4 sm:p-8 pt-20">
        <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-center">Próximos Partidos</h1>

        <div className="max-w-4xl mx-auto">
          <Suspense fallback={<p className="text-gray-400 text-center">Cargando partidos...</p>}>
            <ProximosPartidos />
          </Suspense>
        </div>
      </div>
    </InactivityGuard>
  )
}

export const dynamic = 'force-dynamic'
import { Suspense } from 'react'
import { InactivityGuard } from '@/components/totem/InactivityGuard'
import { ProximosPartidos } from '@/components/totem/ProximosPartidos'
import { MatchesSkeleton } from '@/components/totem/Skeletons'

export default function ProximosPage() {
  return (
    <InactivityGuard>
      <div className="mx-auto w-full max-w-2xl px-5 pb-16 pt-20 sm:px-8">
        <header className="animate-rise mb-7">
          <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.18em] text-white/40">Fixture</p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Próximos Partidos</h1>
        </header>

        <Suspense fallback={<MatchesSkeleton />}>
          <ProximosPartidos />
        </Suspense>
      </div>
    </InactivityGuard>
  )
}

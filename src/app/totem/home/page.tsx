import Link from 'next/link'
export const dynamic = 'force-dynamic'
import { Suspense } from 'react'
import { InactivityGuard } from '@/components/totem/InactivityGuard'
import { RankingTable } from '@/components/totem/RankingTable'
import { RankingAutoRefresh } from '@/components/totem/RankingAutoRefresh'
import { QRCode } from '@/components/ui/QRCode'
import { HoyManana } from '@/components/totem/HoyManana'
import { RankingSkeleton, MatchesSkeleton } from '@/components/totem/Skeletons'
import { getMatchesByDate } from '@/services/fixture'

export default async function TotemHome() {
  const url = process.env.NEXT_PUBLIC_APP_URL ?? 'http://192.168.0.127:3000/mobile'

  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split('T')[0]

  const [hoy, manana] = await Promise.all([
    getMatchesByDate(todayStr),
    getMatchesByDate(tomorrowStr),
  ])

  return (
    <InactivityGuard>
      <div className="mx-auto w-full max-w-3xl px-5 pb-16 pt-20 sm:px-8">
        <header className="animate-rise mb-7">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/55">En vivo</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Ranking</h1>
        </header>

        <RankingAutoRefresh />

        {/* Join card */}
        <section
          className="animate-rise mb-7 flex flex-col items-center gap-5 rounded-3xl border border-white/[0.08] bg-white/[0.03] p-5 sm:flex-row"
          style={{ animationDelay: '60ms' }}
        >
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl font-semibold tracking-tight">¿Querés jugar?</h2>
            <p className="mt-1 text-sm text-white/55">
              Escaneá el código o tocá el botón para hacer tus pronósticos.
            </p>
            <Link
              href="/mobile?from=totem"
              className="mt-4 inline-flex items-center justify-center rounded-xl bg-[var(--accent-strong)] px-6 py-3.5 text-base font-medium text-white shadow-lg shadow-[var(--accent-strong)]/25 transition-all hover:bg-[var(--accent)] active:scale-[0.97]"
            >
              Hacé tus pronósticos
            </Link>
          </div>
          <div className="shrink-0 rounded-2xl border border-white/10 bg-white p-3">
            <QRCode url={url} size={140} />
          </div>
        </section>

        {/* Ranking */}
        <section className="mb-7">
          <Suspense fallback={<RankingSkeleton />}>
            <RankingTable />
          </Suspense>
        </section>

        {/* Today / Tomorrow */}
        <section className="animate-rise" style={{ animationDelay: '120ms' }}>
          <Suspense fallback={<MatchesSkeleton />}>
            <HoyManana hoy={hoy} manana={manana} />
          </Suspense>
        </section>
      </div>
    </InactivityGuard>
  )
}

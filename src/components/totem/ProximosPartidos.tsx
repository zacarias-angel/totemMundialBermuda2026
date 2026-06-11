import { getUpcomingMatches } from '@/services/fixture'
import { Flag } from '@/components/ui/Flag'

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
}

export async function ProximosPartidos() {
  const matches = await getUpcomingMatches(20)

  if (matches.length === 0) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] py-16 text-center animate-fade">
        <p className="text-white/40">No hay próximos partidos</p>
      </div>
    )
  }

  const grouped: Record<string, typeof matches> = {}
  for (const m of matches) {
    const key = m.match_date ?? 'sin-fecha'
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(m)
  }

  return (
    <div className="flex flex-col gap-7 animate-rise">
      {Object.entries(grouped).map(([date, dayMatches]) => (
        <div key={date}>
          <h2 className="mb-3 flex items-center gap-2.5 text-sm font-semibold capitalize tracking-tight text-white/70">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
            {formatDate(date)}
          </h2>
          <div className="flex flex-col gap-2.5">
            {dayMatches.map((match) => (
              <div
                key={match.id}
                className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 transition-colors hover:bg-white/[0.05]"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex flex-1 items-center justify-end gap-2 text-right">
                    <span className="font-semibold">{match.home_team?.name}</span>
                    <Flag name={match.home_team?.name} className="text-xl" />
                  </div>

                  <div className="shrink-0">
                    {match.match_time ? (
                      <span className="rounded-lg bg-white/[0.06] px-2.5 py-1 text-sm font-bold tabular-nums text-amber-300">
                        {match.match_time}
                      </span>
                    ) : (
                      <span className="text-sm text-white/30">vs</span>
                    )}
                  </div>

                  <div className="flex flex-1 items-center gap-2 text-left">
                    <Flag name={match.away_team?.name} className="text-xl" />
                    <span className="font-semibold">{match.away_team?.name}</span>
                  </div>
                </div>

                <div className="mt-2 text-center text-xs text-white/30">{match.round}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

import { getUpcomingMatches } from '@/services/fixture'
import { Card } from '@/components/ui/Card'
import { Flag } from '@/components/ui/Flag'

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
}

export async function ProximosPartidos() {
  const matches = await getUpcomingMatches(20)

  if (matches.length === 0) {
    return <p className="text-gray-400 text-center py-8">No hay próximos partidos</p>
  }

  const grouped: Record<string, typeof matches> = {}
  for (const m of matches) {
    const key = m.match_date ?? 'sin-fecha'
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(m)
  }

  return (
    <div className="flex flex-col gap-6">
      {Object.entries(grouped).map(([date, dayMatches]) => (
        <div key={date}>
          <h2 className="text-xl font-bold mb-3 capitalize">{formatDate(date)}</h2>
          <div className="flex flex-col gap-3">
            {dayMatches.map((match) => (
              <Card key={match.id}>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 text-right flex items-center justify-end gap-2">
                    <span className="text-lg font-semibold">{match.home_team?.name}</span>
                    <Flag name={match.home_team?.name} className="text-xl" />
                  </div>

                  <div className="text-center shrink-0 flex flex-col items-center">
                    {match.match_time && (
                      <span className="text-sm font-bold text-yellow-400 tabular-nums">{match.match_time}</span>
                    )}
                  </div>

                  <div className="flex-1 text-left flex items-center gap-2">
                    <Flag name={match.away_team?.name} className="text-xl" />
                    <span className="text-lg font-semibold">{match.away_team?.name}</span>
                  </div>
                </div>

                <div className="text-xs text-gray-500 text-center mt-1">
                  {match.round}
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/supabase/users'

export default async function MisPronosticosPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/mobile')

  const supabase = await createServerSupabaseClient()

  const { data: raw } = await supabase
    .from('predictions')
    .select('home_score, away_score, points, match_id')
    .eq('user_id', user.id)
    .order('match_id')

  if (!raw || raw.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-1">Mis Pronósticos</h1>
        <p className="text-gray-400 text-sm mb-6">Tus pronósticos cargados</p>
        <p className="text-gray-500 text-center py-12">Todavía no pronosticaste ningún partido</p>
      </div>
    )
  }

  const matchIds = raw.map((p) => p.match_id)
  const { data: dbMatches } = await supabase
    .from('matches')
    .select('id, round, home_score, away_score, matchday, status, knockout, home_team_id, away_team_id')
    .in('id', matchIds)

  const teamIds = new Set<string>()
  dbMatches?.forEach((m) => {
    if (m.home_team_id) teamIds.add(m.home_team_id)
    if (m.away_team_id) teamIds.add(m.away_team_id)
  })

  const { data: dbTeams } = await supabase
    .from('teams')
    .select('id, name')
    .in('id', [...teamIds])

  const teamMap = new Map(dbTeams?.map((t) => [t.id, t.name]) ?? [])

  type FlatMatch = { id: string; round: string; home_score: number | null; away_score: number | null; matchday: number | null; status: string; knockout: boolean; home_team: { name: string } | null; away_team: { name: string } | null }

  const flatMatches: FlatMatch[] = (dbMatches ?? []).map((m) => ({
    ...m,
    home_team: m.home_team_id ? { name: teamMap.get(m.home_team_id) ?? '?' } : null,
    away_team: m.away_team_id ? { name: teamMap.get(m.away_team_id) ?? '?' } : null,
  }))

  const matchMap = new Map(flatMatches.map((m) => [m.id, m] as const))

  type PredictionRow = typeof raw[number] & { match: FlatMatch }
  const predictions: PredictionRow[] = raw.map((p) => ({
    ...p,
    match: matchMap.get(p.match_id) as FlatMatch,
  })).filter((p) => p.match)

  const grouped = predictions.reduce<Record<string, PredictionRow[]>>((acc, p) => {
    const round = p.match?.round ?? 'Otros'
    if (!acc[round]) acc[round] = []
    acc[round].push(p)
    return acc
  }, {})

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Mis Pronósticos</h1>
      <p className="text-gray-400 text-sm mb-6">Tus pronósticos cargados</p>

      <div className="flex flex-col gap-6">
        {Object.entries(grouped).map(([round, preds]) => (
          <div key={round}>
            <h2 className="text-sm uppercase tracking-wider text-gray-500 mb-3">{round}</h2>
            <div className="flex flex-col gap-2">
              {preds.map((p) => (
                <div
                  key={p.match.id}
                  className="rounded-2xl bg-white/10 border border-white/20 p-4"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">{p.match.home_team?.name}</span>
                    <span className="text-xl font-bold tabular-nums">
                      {p.home_score} - {p.away_score}
                    </span>
                    <span className="font-semibold">{p.match.away_team?.name}</span>
                  </div>
                  {p.match.status === 'finished' && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">
                        Resultado: {p.match.home_score} - {p.match.away_score}
                      </span>
                      <span
                        className={`font-bold ${
                          p.points === 3
                            ? 'text-green-400'
                            : p.points === 1
                              ? 'text-yellow-400'
                              : 'text-red-400'
                        }`}
                      >
                        {p.points != null ? `${p.points} ptos` : '—'}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

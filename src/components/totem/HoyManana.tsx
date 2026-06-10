import { Flag } from '@/components/ui/Flag'

type Match = {
  id: string
  match_time: string | null
  home_team: { name: string } | null
  away_team: { name: string } | null
  round: string
}

export function HoyManana({ hoy, manana }: { hoy: Match[]; manana: Match[] }) {
  return (
    <div className="w-full flex flex-col gap-4">
      <Section title="Hoy" matches={hoy} />
      <Section title="Mañana" matches={manana} />
    </div>
  )
}

function Section({ title, matches }: { title: string; matches: Match[] }) {
  if (matches.length === 0) return null

  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-wider text-yellow-400 mb-2">{title}</h3>
      <div className="flex flex-col gap-2">
        {matches.map((m) => (
          <div
            key={m.id}
            className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-1.5 min-w-0 flex-1 justify-end">
              <span className="text-xs truncate">{m.home_team?.name}</span>
              <Flag name={m.home_team?.name} className="text-sm shrink-0" />
            </div>

            <span className="text-xs font-bold text-yellow-400 tabular-nums shrink-0">
              {m.match_time ?? '--:--'}
            </span>

            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <Flag name={m.away_team?.name} className="text-sm shrink-0" />
              <span className="text-xs truncate">{m.away_team?.name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

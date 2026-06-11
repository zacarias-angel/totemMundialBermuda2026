import { Flag } from '@/components/ui/Flag'

type Match = {
  id: string
  match_time: string | null
  home_team: { name: string } | null
  away_team: { name: string } | null
  round: string
}

export function HoyManana({ hoy, manana }: { hoy: Match[]; manana: Match[] }) {
  if (hoy.length === 0 && manana.length === 0) return null

  return (
    <div className="flex w-full flex-col gap-5">
      <Section title="Hoy" matches={hoy} />
      <Section title="Mañana" matches={manana} />
    </div>
  )
}

function Section({ title, matches }: { title: string; matches: Match[] }) {
  if (matches.length === 0) return null

  return (
    <div>
      <h3 className="mb-2.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">
        <span className="h-1 w-1 rounded-full bg-amber-400" />
        {title}
      </h3>
      <div className="flex flex-col gap-2">
        {matches.map((m) => (
          <div
            key={m.id}
            className="flex items-center justify-between gap-2 rounded-xl border border-white/[0.06] bg-white/[0.025] px-3.5 py-2.5 transition-colors hover:bg-white/[0.04]"
          >
            <div className="flex min-w-0 flex-1 items-center justify-end gap-1.5">
              <span className="truncate text-sm text-white/85">{m.home_team?.name}</span>
              <Flag name={m.home_team?.name} className="shrink-0 text-sm" />
            </div>

            <span className="shrink-0 rounded-md bg-white/[0.05] px-2 py-0.5 text-xs font-semibold tabular-nums text-amber-300">
              {m.match_time ?? '--:--'}
            </span>

            <div className="flex min-w-0 flex-1 items-center gap-1.5">
              <Flag name={m.away_team?.name} className="shrink-0 text-sm" />
              <span className="truncate text-sm text-white/85">{m.away_team?.name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

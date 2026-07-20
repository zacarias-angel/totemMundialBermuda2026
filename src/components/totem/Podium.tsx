const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

function fotoUrl(filename: string) {
  return `${supabaseUrl}/storage/v1/object/public/fotofigurita/${filename}`
}

const PODIO_DATA = [
  {
    place: 2,
    label: '2°',
    medal: '🥈',
    name: 'Silvia',
    height: 'h-28 sm:h-36',
    color: 'border-zinc-400/40 bg-zinc-400/10',
    textColor: 'text-zinc-300',
    barColor: 'bg-gradient-to-t from-zinc-500/30 to-zinc-400/10',
    foto: fotoUrl('1781108977643_9q5avn.webp'),
  },
  {
    place: 1,
    label: '1°',
    medal: '🥇',
    name: 'Gaston',
    height: 'h-36 sm:h-44',
    color: 'border-yellow-400/50 bg-yellow-400/10',
    textColor: 'text-yellow-300',
    barColor: 'bg-gradient-to-t from-yellow-500/30 to-yellow-400/10',
    foto: fotoUrl('1781303382204_8kn4hb.webp'),
  },
  {
    place: 3,
    label: '3°',
    medal: '🥉',
    name: 'Matias',
    height: 'h-24 sm:h-28',
    color: 'border-amber-600/40 bg-amber-600/10',
    textColor: 'text-amber-400',
    barColor: 'bg-gradient-to-t from-amber-700/30 to-amber-600/10',
    foto: fotoUrl('1781291428688_cwlo4b.webp'),
  },
]

export function Podium() {
  return (
    <section className="animate-rise mb-7 mt-6" style={{ animationDelay: '70ms' }}>
      <h2 className="mb-4 text-center text-xl font-semibold tracking-tight">Podio</h2>

      <div className="flex items-end justify-center gap-3 sm:gap-4">
        {PODIO_DATA.map((entry) => (
          <div key={entry.place} className="flex flex-col items-center gap-2 min-w-0 flex-1 max-w-[140px]">
            <div className="flex flex-col items-center gap-1">
              <span className="text-xl">{entry.medal}</span>
              <span className={`text-xs font-bold ${entry.textColor}`}>{entry.label} puesto</span>
            </div>

            <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-white/20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={entry.foto}
                alt={entry.name}
                className="w-full h-full object-cover"
              />
            </div>

            <span className="text-sm font-semibold text-white/90 truncate w-full text-center">
              {entry.name}
            </span>

            <div
              className={`w-full ${entry.height} rounded-t-xl border ${entry.color} ${entry.barColor} flex items-start justify-center pt-3`}
            >
              <span className="text-2xl">{entry.medal}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

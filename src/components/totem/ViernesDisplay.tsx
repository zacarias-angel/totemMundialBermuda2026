import { getActiveQuestion, getViernesAnswers } from '@/services/viernes'

export async function ViernesDisplay() {
  const [question, answers] = await Promise.all([getActiveQuestion(), getViernesAnswers()])

  if (!question) {
    return (
      <div className="animate-fade py-16 text-center">
        <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.18em] text-white/40">
          Viernes de Qué
        </p>
        <p className="text-xl font-semibold text-white/70">No hay pregunta activa esta semana</p>
      </div>
    )
  }

  const counts = answers.reduce<Record<string, number>>((acc, a) => {
    acc[a.answer] = (acc[a.answer] ?? 0) + 1
    return acc
  }, {})

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
  const total = answers.length

  return (
    <div className="mx-auto w-full max-w-xl animate-rise">
      <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--accent)]">
        Viernes de Qué
      </p>
      <h2 className="mb-8 text-3xl font-bold leading-tight tracking-tight">{question.question}</h2>

      {total === 0 ? (
        <p className="py-10 text-center text-white/40">Todavía no hay respuestas</p>
      ) : (
        <div className="flex flex-col gap-3">
          {sorted.map(([answer, count], i) => {
            const pct = (count / total) * 100
            const leading = i === 0
            return (
              <div
                key={answer}
                className={`rounded-2xl border p-4 transition-colors ${
                  leading
                    ? 'border-[var(--accent)]/30 bg-[var(--accent-soft)]'
                    : 'border-white/[0.07] bg-white/[0.03]'
                }`}
              >
                <div className="mb-2.5 flex items-center justify-between">
                  <span className="text-lg font-semibold capitalize">{answer}</span>
                  <span className="text-sm tabular-nums text-white/45">
                    {count} voto{count !== 1 ? 's' : ''} · {Math.round(pct)}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      leading ? 'bg-[var(--accent)]' : 'bg-white/35'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

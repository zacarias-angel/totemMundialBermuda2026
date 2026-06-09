import { getActiveQuestion, getViernesAnswers } from '@/services/viernes'

export async function ViernesDisplay() {
  const [question, answers] = await Promise.all([getActiveQuestion(), getViernesAnswers()])

  if (!question) {
    return (
      <div className="text-center py-12">
        <p className="text-2xl font-bold mb-2">Viernes de Qué</p>
        <p className="text-gray-400">No hay pregunta activa esta semana</p>
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
    <div className="w-full max-w-xl mx-auto">
      <p className="text-sm text-gray-400 uppercase tracking-wider mb-1">Viernes de Qué</p>
      <h2 className="text-2xl font-bold mb-8">{question.question}</h2>

      {total === 0 ? (
        <p className="text-gray-500 text-center">Todavía no hay respuestas</p>
      ) : (
        <div className="flex flex-col gap-3">
          {sorted.map(([answer, count]) => (
            <div key={answer} className="rounded-xl bg-white/10 border border-white/20 p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-lg capitalize">{answer}</span>
                <span className="text-sm text-gray-400 tabular-nums">
                  {count} voto{count !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all"
                  style={{ width: `${(count / total) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

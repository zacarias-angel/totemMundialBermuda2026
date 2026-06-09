interface MatchCardProps {
  homeTeam: string
  awayTeam: string
  homeScore?: number | null
  awayScore?: number | null
  matchday?: number | null
  status: string
  onPredict?: () => void
  prediction?: { home_score: number; away_score: number } | null
}

export function MatchCard({
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  matchday,
  status,
  onPredict,
  prediction,
}: MatchCardProps) {
  const isFinished = status === 'finished'
  const isLive = status === 'live'
  const hasPrediction = !!prediction

  return (
    <div className="rounded-2xl bg-white/10 border border-white/20 p-4 flex flex-col gap-3">
      {matchday && (
        <span className="text-xs text-gray-400 uppercase tracking-wide">Matchday {matchday}</span>
      )}

      <div className="flex items-center justify-between gap-4">
        <span className="flex-1 text-right text-lg font-semibold truncate">{homeTeam}</span>

        <div className="flex items-center gap-2 shrink-0">
          {isFinished && homeScore != null ? (
            <span className="text-2xl font-bold tabular-nums">
              {homeScore} - {awayScore}
            </span>
          ) : (
            <span className="text-2xl font-bold text-gray-500">vs</span>
          )}
        </div>

        <span className="flex-1 text-left text-lg font-semibold truncate">{awayTeam}</span>
      </div>

      <div className="flex items-center justify-between">
        {isLive && <span className="text-xs text-green-400 font-semibold uppercase">En vivo</span>}
        {isFinished && <span className="text-xs text-gray-400">Finalizado</span>}
        {!isFinished && !isLive && (
          <span className="text-xs text-gray-400">Próximamente</span>
        )}

        {!isFinished && onPredict && (
          <button
            onClick={onPredict}
            className={`text-xs font-semibold uppercase px-4 py-1.5 rounded-full transition-all ${
              hasPrediction
                ? 'bg-green-600/30 text-green-400 border border-green-500/40'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {hasPrediction ? 'Editar' : 'Pronosticar'}
          </button>
        )}
      </div>

      {hasPrediction && !isFinished && (
        <div className="text-xs text-gray-400 text-center">
          Tu pronóstico: {prediction.home_score} - {prediction.away_score}
        </div>
      )}
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'

interface Match {
  id: string
  round: string
  home_team_id: string | null
  away_team_id: string | null
  home_score: number | null
  away_score: number | null
  matchday: number | null
  status: string
  knockout: boolean
  group_id: string | null
  home_team: { id: string; name: string } | null
  away_team: { id: string; name: string } | null
}

interface MatchPredictorProps {
  match: Match
  userId: string
  initialPrediction?: { home_score: number; away_score: number } | null
}

export function MatchPredictor({ match, userId, initialPrediction }: MatchPredictorProps) {
  const [homeScore, setHomeScore] = useState(initialPrediction?.home_score ?? 0)
  const [awayScore, setAwayScore] = useState(initialPrediction?.away_score ?? 0)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  if (match.status === 'finished') {
    return (
      <div className="rounded-2xl bg-white/10 border border-white/20 p-4 opacity-60">
        <div className="flex justify-between items-center">
          <span className="font-semibold">{match.home_team?.name}</span>
          <span className="text-xl font-bold tabular-nums">
            {match.home_score} - {match.away_score}
          </span>
          <span className="font-semibold">{match.away_team?.name}</span>
        </div>
        {initialPrediction && (
          <p className="text-xs text-gray-400 text-center mt-2">
            Tu pronóstico: {initialPrediction.home_score} - {initialPrediction.away_score}
          </p>
        )}
      </div>
    )
  }

  const isKnockoutAvailable = match.knockout
    ? match.home_team_id != null && match.away_team_id != null
    : true

  if (!isKnockoutAvailable) {
    return (
      <div className="rounded-2xl bg-white/10 border border-white/20 p-4 opacity-50">
        <div className="flex justify-between items-center">
          <span className="font-semibold">{match.home_team?.name ?? '?'}</span>
          <span className="text-gray-500">vs</span>
          <span className="font-semibold">{match.away_team?.name ?? '?'}</span>
        </div>
        <p className="text-xs text-gray-500 text-center mt-2">Eliminatoria no disponible aún</p>
      </div>
    )
  }

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()
    await supabase.from('predictions').upsert(
      {
        user_id: userId,
        match_id: match.id,
        home_score: homeScore,
        away_score: awayScore,
      },
      { onConflict: 'user_id,match_id' }
    )
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="rounded-2xl bg-white/10 border border-white/20 p-4">
      <div className="flex items-center justify-between gap-3 mb-4">
        <span className="font-semibold text-lg text-right flex-1 truncate">
          {match.home_team?.name}
        </span>

        <div className="flex items-center gap-2">
          <select
            value={homeScore}
            onChange={(e) => setHomeScore(Number(e.target.value))}
            className="w-14 text-center rounded-lg bg-white/10 border border-white/20 text-white text-lg font-bold py-2 appearance-none"
          >
            {Array.from({ length: 16 }, (_, i) => (
              <option key={i} value={i} className="bg-zinc-900">
                {i}
              </option>
            ))}
          </select>
          <span className="text-gray-500 font-bold">-</span>
          <select
            value={awayScore}
            onChange={(e) => setAwayScore(Number(e.target.value))}
            className="w-14 text-center rounded-lg bg-white/10 border border-white/20 text-white text-lg font-bold py-2 appearance-none"
          >
            {Array.from({ length: 16 }, (_, i) => (
              <option key={i} value={i} className="bg-zinc-900">
                {i}
              </option>
            ))}
          </select>
        </div>

        <span className="font-semibold text-lg text-left flex-1 truncate">
          {match.away_team?.name}
        </span>
      </div>

      <Button
        onClick={handleSave}
        disabled={saving}
        size="md"
        className="w-full"
        variant={saved ? 'secondary' : 'primary'}
      >
        {saving ? 'Guardando...' : saved ? '✓ Guardado' : 'Guardar Pronóstico'}
      </Button>
    </div>
  )
}

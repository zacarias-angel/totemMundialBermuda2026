'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { submitPrediction } from '@/services/predictions'
import { Flag } from '@/components/ui/Flag'
import { isMatchLocked } from '@/lib/utils/match-time'

interface Match {
  id: string
  round: string
  home_team_id: string | null
  away_team_id: string | null
  home_score: number | null
  away_score: number | null
  matchday: number | null
  match_date: string | null
  match_time: string | null
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
          <span className="font-semibold"><Flag name={match.home_team?.name} /> {match.home_team?.name}</span>
          <span className="text-xl font-bold tabular-nums">
            {match.home_score} - {match.away_score}
          </span>
          <span className="font-semibold">{match.away_team?.name} <Flag name={match.away_team?.name} /></span>
        </div>
        {initialPrediction && (
          <p className="text-xs text-gray-400 text-center mt-2">
            Tu pronóstico: {initialPrediction.home_score} - {initialPrediction.away_score}
          </p>
        )}
      </div>
    )
  }

  if (match.status === 'live') {
    return (
      <div className="rounded-2xl bg-white/10 border border-green-500/40 p-4">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center justify-end gap-1.5 flex-1 truncate">
            <span className="font-semibold text-lg truncate">{match.home_team?.name}</span>
            <Flag name={match.home_team?.name} className="text-xl shrink-0" />
          </div>
          <span className="text-green-400 text-sm font-bold animate-pulse">EN VIVO</span>
          <div className="flex items-center gap-1.5 flex-1 truncate">
            <Flag name={match.away_team?.name} className="text-xl shrink-0" />
            <span className="font-semibold text-lg truncate">{match.away_team?.name}</span>
          </div>
        </div>
        {initialPrediction && (
          <p className="text-xs text-gray-400 text-center">
            Tu pronóstico: {initialPrediction.home_score} - {initialPrediction.away_score}
          </p>
        )}
        <p className="text-xs text-yellow-400 text-center mt-2">Partido en vivo — No se permiten pronósticos</p>
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
          <span className="font-semibold"><Flag name={match.home_team?.name} /> {match.home_team?.name ?? '?'}</span>
          <span className="text-gray-500">vs</span>
          <span className="font-semibold">{match.away_team?.name ?? '?'} <Flag name={match.away_team?.name} /></span>
        </div>
        <p className="text-xs text-gray-500 text-center mt-2">Eliminatoria no disponible aún</p>
      </div>
    )
  }

  const locked = isMatchLocked(match.match_date, match.match_time)

  if (locked) {
    return (
      <div className="rounded-2xl bg-white/10 border border-white/20 p-4 opacity-60">
        {(match.match_date || match.match_time) && (
          <div className="text-xs text-gray-500 text-center mb-3">
            {formatDateLabel(match.match_date, match.match_time)}
          </div>
        )}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center justify-end gap-1.5 flex-1 truncate">
            <span className="font-semibold text-lg truncate">{match.home_team?.name}</span>
            <Flag name={match.home_team?.name} className="text-xl shrink-0" />
          </div>
          <span className="text-gray-500 font-bold">vs</span>
          <div className="flex items-center gap-1.5 flex-1 truncate">
            <Flag name={match.away_team?.name} className="text-xl shrink-0" />
            <span className="font-semibold text-lg truncate">{match.away_team?.name}</span>
          </div>
        </div>
        {initialPrediction && (
          <p className="text-xs text-gray-400 text-center mb-2">
            Tu pronóstico: {initialPrediction.home_score} - {initialPrediction.away_score}
          </p>
        )}
        <p className="text-xs text-yellow-400 text-center">Pronósticos cerrados — el partido está por comenzar</p>
      </div>
    )
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await submitPrediction(userId, match.id, homeScore, awayScore)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al guardar el pronóstico')
    } finally {
      setSaving(false)
    }
  }

  function formatDateLabel(date: string | null, time: string | null) {
    if (!date) return null
    const d = new Date(date + 'T12:00:00')
    const day = d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })
    return time ? `${day} ${time}` : day
  }

  return (
    <div className="rounded-2xl bg-white/10 border border-white/20 p-4">
      {(match.match_date || match.match_time) && (
        <div className="text-xs text-gray-500 text-center mb-3">
          {formatDateLabel(match.match_date, match.match_time)}
        </div>
      )}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center justify-end gap-1.5 flex-1 truncate">
          <span className="font-semibold text-lg truncate">{match.home_team?.name}</span>
          <Flag name={match.home_team?.name} className="text-xl shrink-0" />
        </div>

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

        <div className="flex items-center gap-1.5 flex-1 truncate">
          <Flag name={match.away_team?.name} className="text-xl shrink-0" />
          <span className="font-semibold text-lg truncate">{match.away_team?.name}</span>
        </div>
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

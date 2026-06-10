'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import { recalculatePointsForMatch } from '@/services/predictions'
import { Flag } from '@/components/ui/Flag'

interface ResultFormProps {
  match: {
    id: string
    round: string
    home_team: { name: string } | null
    away_team: { name: string } | null
    home_score: number | null
    away_score: number | null
    status: string
  }
}

export function ResultForm({ match }: ResultFormProps) {
  const [homeScore, setHomeScore] = useState(match.home_score ?? 0)
  const [awayScore, setAwayScore] = useState(match.away_score ?? 0)
  const [status, setStatus] = useState(match.status)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()

    await supabase
      .from('matches')
      .update({ home_score: homeScore, away_score: awayScore, status })
      .eq('id', match.id)

    if (status === 'finished') {
      await recalculatePointsForMatch(match.id)
    }

    setSaving(false)
  }

  return (
    <div className="rounded-2xl bg-white/10 border border-white/20 p-4">
      <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">{match.round}</div>

      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-1.5 flex-1 truncate">
          <Flag name={match.home_team?.name} className="text-base shrink-0" />
          <span className="font-semibold truncate">{match.home_team?.name}</span>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={homeScore}
            onChange={(e) => setHomeScore(Number(e.target.value))}
            className="w-14 text-center rounded-lg bg-white/10 border border-white/20 text-white font-bold py-2"
          >
            {Array.from({ length: 16 }, (_, i) => (
              <option key={i} value={i} className="bg-zinc-900">
                {i}
              </option>
            ))}
          </select>
          <span className="text-gray-500">-</span>
          <select
            value={awayScore}
            onChange={(e) => setAwayScore(Number(e.target.value))}
            className="w-14 text-center rounded-lg bg-white/10 border border-white/20 text-white font-bold py-2"
          >
            {Array.from({ length: 16 }, (_, i) => (
              <option key={i} value={i} className="bg-zinc-900">
                {i}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5 flex-1 truncate justify-end">
          <span className="font-semibold truncate">{match.away_team?.name}</span>
          <Flag name={match.away_team?.name} className="text-base shrink-0" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg bg-white/10 border border-white/20 text-white text-sm px-3 py-2"
        >
          <option value="scheduled" className="bg-zinc-900">Programado</option>
          <option value="live" className="bg-zinc-900">En vivo</option>
          <option value="finished" className="bg-zinc-900">Finalizado</option>
        </select>

        <Button onClick={handleSave} disabled={saving} size="sm">
          {saving ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </div>
  )
}

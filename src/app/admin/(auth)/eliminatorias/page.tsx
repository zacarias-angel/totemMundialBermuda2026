'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'

interface Team {
  id: string
  name: string
}

interface KnockoutMatch {
  id: string
  round: string
  home_team_id: string | null
  away_team_id: string | null
  home_team: Team | null
  away_team: Team | null
}

export default function AdminEliminatorias() {
  const [matches, setMatches] = useState<KnockoutMatch[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const [matchRes, teamRes] = await Promise.all([
        supabase
          .from('matches')
          .select('*, home_team:teams!home_team_id(id, name), away_team:teams!away_team_id(id, name)')
          .eq('knockout', true)
          .order('id'),
        supabase.from('teams').select('id, name').order('name'),
      ])
      if (matchRes.data) setMatches(matchRes.data)
      if (teamRes.data) setTeams(teamRes.data)
    }
    load()
  }, [])

  const handleUpdate = async (matchId: string, field: 'home_team_id' | 'away_team_id', value: string) => {
    setSaving(matchId)
    const supabase = createClient()
    const update = field === 'home_team_id' ? { home_team_id: value || null } : { away_team_id: value || null }
    await supabase.from('matches').update(update).eq('id', matchId)
    setSaving(null)
  }

  const grouped = matches.reduce<Record<string, KnockoutMatch[]>>((acc, m) => {
    if (!acc[m.round]) acc[m.round] = []
    acc[m.round].push(m)
    return acc
  }, {})

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Eliminatorias</h1>
      <p className="text-gray-400 text-sm mb-6">Asigná los equipos a cada eliminatoria</p>

      {Object.entries(grouped).map(([round, roundMatches]) => (
        <div key={round} className="mb-8">
          <h2 className="text-sm uppercase tracking-wider text-gray-500 mb-3">{round}</h2>
          <div className="flex flex-col gap-3">
            {roundMatches.map((match) => (
              <div key={match.id} className="rounded-2xl bg-white/10 border border-white/20 p-4">
                <div className="flex items-center gap-3">
                  <select
                    value={match.home_team_id ?? ''}
                    onChange={(e) => handleUpdate(match.id, 'home_team_id', e.target.value)}
                    className="flex-1 rounded-lg bg-white/10 border border-white/20 text-white px-3 py-2"
                  >
                    <option value="" className="bg-zinc-900">— Local —</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id} className="bg-zinc-900">
                        {t.name}
                      </option>
                    ))}
                  </select>

                  <span className="text-gray-500 shrink-0">vs</span>

                  <select
                    value={match.away_team_id ?? ''}
                    onChange={(e) => handleUpdate(match.id, 'away_team_id', e.target.value)}
                    className="flex-1 rounded-lg bg-white/10 border border-white/20 text-white px-3 py-2"
                  >
                    <option value="" className="bg-zinc-900">— Visitante —</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id} className="bg-zinc-900">
                        {t.name}
                      </option>
                    ))}
                  </select>

                  {saving === match.id && (
                    <span className="text-xs text-gray-400">Guardando...</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

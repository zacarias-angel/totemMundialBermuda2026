'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MatchPredictor } from './MatchPredictor'

interface Group {
  id: string
  name: string
}

interface Team {
  id: string
  name: string
}

interface Match {
  id: string
  round: string
  group_id: string | null
  home_team_id: string | null
  away_team_id: string | null
  home_score: number | null
  away_score: number | null
  matchday: number | null
  match_date: string | null
  match_time: string | null
  status: string
  knockout: boolean
  home_team: Team | null
  away_team: Team | null
}

type Tab = 'proximos' | 'knockout' | string

function ProximosList({ matches, userId, predictions }: {
  matches: Match[]
  userId: string
  predictions: Map<string, { home_score: number; away_score: number }>
}) {
  const tz = 'America/Argentina/Buenos_Aires'
  const today = new Date().toLocaleDateString('en-CA', { timeZone: tz })
  const tomorrow = new Date(Date.now() + 86400000)
  const tomorrowStr = tomorrow.toLocaleDateString('en-CA', { timeZone: tz })

  const hoy = matches.filter((m) => m.match_date === today)
  const manana = matches.filter((m) => m.match_date === tomorrowStr)

  return (
    <div className="flex flex-col gap-6">
      {hoy.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-3 text-yellow-400">Hoy</h2>
          <div className="flex flex-col gap-3">
            {hoy.map((match) => (
              <MatchPredictor
                key={match.id}
                match={match}
                userId={userId}
                initialPrediction={predictions.get(match.id) ?? null}
              />
            ))}
          </div>
        </div>
      )}
      {manana.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-3">Mañana</h2>
          <div className="flex flex-col gap-3">
            {manana.map((match) => (
              <MatchPredictor
                key={match.id}
                match={match}
                userId={userId}
                initialPrediction={predictions.get(match.id) ?? null}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function PronosticosClient({ userId }: { userId: string }) {
  const [groups, setGroups] = useState<Group[]>([])
  const [selectedTab, setSelectedTab] = useState<Tab>('proximos')
  const [matches, setMatches] = useState<Match[]>([])
  const [predictions, setPredictions] = useState<Map<string, { home_score: number; away_score: number }>>(new Map())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()

      const [groupRes, matchRes, predRes] = await Promise.all([
        supabase.from('groups').select('id, name'),
        supabase.from('matches').select('*'),
        supabase.from('predictions').select('match_id, home_score, away_score').eq('user_id', userId),
      ])

      const groupsData = (groupRes.data ?? []) as Group[]
      setGroups(groupsData)

      const matchIds = new Set<string>()

      const matchesData = (matchRes.data ?? []) as Match[]
      matchesData.forEach((m) => {
        if (m.home_team_id) matchIds.add(m.home_team_id)
        if (m.away_team_id) matchIds.add(m.away_team_id)
      })

      const { data: teams } = await supabase
        .from('teams')
        .select('id, name')
        .in('id', [...matchIds])

      const teamMap = new Map((teams ?? []).map((t) => [t.id, t as Team]))
      const enriched = matchesData.map((m) => ({
        ...m,
        home_team: m.home_team_id ? (teamMap.get(m.home_team_id) ?? null) : null,
        away_team: m.away_team_id ? (teamMap.get(m.away_team_id) ?? null) : null,
      }))

      setMatches(enriched)

      const predMap = new Map(
        (predRes.data ?? []).map((p) => [p.match_id, { home_score: p.home_score, away_score: p.away_score }])
      )
      setPredictions(predMap)

      setLoading(false)
    }
    load()
  }, [userId])

  const filteredMatches = (() => {
    if (selectedTab === 'proximos') {
      const tz = 'America/Argentina/Buenos_Aires'
      const today = new Date().toLocaleDateString('en-CA', { timeZone: tz })
      const now = new Date().toLocaleTimeString('es-AR', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false })
      return matches
        .filter((m) => {
          if (m.status !== 'scheduled' || !m.match_date) return false
          return m.match_date > today || (m.match_date === today && (m.match_time ?? '00:00') >= now)
        })
        .sort((a, b) => {
          const da = a.match_date ?? ''
          const db = b.match_date ?? ''
          if (da !== db) return da < db ? -1 : 1
          const ta = a.match_time ?? '00:00'
          const tb = b.match_time ?? '00:00'
          return ta < tb ? -1 : 1
        })
    }
    if (selectedTab === 'knockout') return matches.filter((m) => m.knockout)
    return matches.filter((m) => !m.knockout && m.group_id === selectedTab)
  })()

  if (loading) {
    return <p className="text-gray-400 text-center py-12">Cargando partidos...</p>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Pronosticar</h1>
      <p className="text-gray-400 text-sm mb-4">Elegí un grupo y pronosticá los resultados</p>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setSelectedTab('proximos')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95 ${
            selectedTab === 'proximos'
              ? 'bg-green-600 text-white'
              : 'bg-white/10 text-gray-300 hover:bg-white/20'
          }`}
        >
          Próximos
        </button>
        {groups
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((g) => (
            <button
              key={g.id}
              onClick={() => setSelectedTab(g.id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95 ${
                selectedTab === g.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              Grupo {g.name}
            </button>
          ))}
        <button
          onClick={() => setSelectedTab('knockout')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95 ${
            selectedTab === 'knockout'
              ? 'bg-amber-600 text-white'
              : 'bg-white/10 text-gray-300 hover:bg-white/20'
          }`}
        >
          Eliminatorias
        </button>
      </div>

      {filteredMatches.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          {selectedTab === 'proximos'
            ? 'No hay próximos partidos'
            : selectedTab === 'knockout'
              ? 'No hay eliminatorias disponibles todavía'
              : 'No hay partidos en este grupo'}
        </p>
      ) : selectedTab === 'proximos' ? (
        <ProximosList matches={filteredMatches} userId={userId} predictions={predictions} />
      ) : (
        <div className="flex flex-col gap-3">
          {filteredMatches.map((match) => (
            <MatchPredictor
              key={match.id}
              match={match}
              userId={userId}
              initialPrediction={predictions.get(match.id) ?? null}
            />
          ))}
        </div>
      )}
    </div>
  )
}

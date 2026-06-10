'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Flag } from '@/components/ui/Flag'

type RankingEntry = {
  name: string
  email: string
  userId: string
  total: number
  exact: number
  correct: number
  count: number
}

type UserPrediction = {
  home_team: string
  away_team: string
  home_score: number | null
  away_score: number | null
  match_home_score: number | null
  match_away_score: number | null
  points: number | null
  status: string
  round: string
}

export function RankingTableClient({ ranking }: { ranking: RankingEntry[] }) {
  const [selectedUser, setSelectedUser] = useState<RankingEntry | null>(null)
  const [predictions, setPredictions] = useState<UserPrediction[] | null>(null)
  const [loading, setLoading] = useState(false)

  const handleClick = async (entry: RankingEntry) => {
    setSelectedUser(entry)
    setPredictions(null)
    setLoading(true)

    try {
      const res = await fetch(`/api/users/${entry.userId}/predictions`)
      const data = await res.json()
      setPredictions(data)
    } catch {
      setPredictions([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <tbody>
        {ranking.map((entry, i) => (
          <tr
            key={entry.email}
            className="border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors"
            onClick={() => handleClick(entry)}
          >
            <td className="py-3 text-2xl font-bold tabular-nums">
              {i === 0 && '🥇'}
              {i === 1 && '🥈'}
              {i === 2 && '🥉'}
              {i > 2 && `#${i + 1}`}
            </td>
            <td className="py-3 font-medium">{entry.name}</td>
            <td className="py-3 text-right font-bold tabular-nums">{entry.count}</td>
            <td className="py-3 text-right font-bold tabular-nums">{entry.correct + entry.exact}</td>
            <td className="py-3 text-right font-bold tabular-nums">{entry.total}</td>
          </tr>
        ))}
      </tbody>

      {selectedUser && typeof window !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-zinc-900 border-b border-white/10 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Pronósticos de {selectedUser.name}</h2>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-500 hover:text-white text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            <div className="p-6">
              {loading && <p className="text-gray-400 text-center">Cargando...</p>}

              {!loading && predictions && predictions.length === 0 && (
                <p className="text-gray-500 text-center">Sin pronósticos</p>
              )}

              {!loading && predictions && predictions.length > 0 && (
                <div className="flex flex-col gap-3">
                  {predictions.map((p, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl bg-white/5 border border-white/10 p-4"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-1.5">
                          <Flag name={p.home_team} className="text-base" />
                          <span className="font-semibold text-sm">{p.home_team}</span>
                        </div>
                        <span className="text-lg font-bold tabular-nums">
                          {p.home_score} - {p.away_score}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-sm">{p.away_team}</span>
                          <Flag name={p.away_team} className="text-base" />
                        </div>
                      </div>
                      {p.status === 'finished' && (
                        <div className="flex justify-between items-center text-xs text-gray-400">
                          <span>
                            Resultado: {p.match_home_score} - {p.match_away_score}
                          </span>
                          <span
                            className={`font-bold ${
                              p.points === 3
                                ? 'text-green-400'
                                : p.points === 1
                                  ? 'text-yellow-400'
                                  : 'text-red-400'
                            }`}
                          >
                            {p.points != null ? `${p.points} ptos` : '—'}
                          </span>
                        </div>
                      )}
                      {p.status !== 'finished' && (
                        <p className="text-xs text-gray-500 text-center">Por jugarse</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

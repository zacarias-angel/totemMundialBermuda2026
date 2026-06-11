'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Flag } from '@/components/ui/Flag'
import { Skeleton } from '@/components/ui/Skeleton'

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

const MEDALS = ['🥇', '🥈', '🥉']

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
    <div className="w-full animate-rise">
      {/* Column labels */}
      <div className="flex items-center gap-4 px-4 pb-2 text-[11px] font-medium uppercase tracking-[0.12em] text-white/35">
        <span className="w-8">#</span>
        <span className="flex-1">Nombre</span>
        <span className="w-10 text-right">PJ</span>
        <span className="w-12 text-right">Aciertos</span>
        <span className="w-12 text-right">Puntos</span>
      </div>

      <div className="flex flex-col gap-1.5">
        {ranking.map((entry, i) => {
          const podium = i < 3
          return (
            <button
              key={entry.email}
              onClick={() => handleClick(entry)}
              className={`group flex w-full items-center gap-4 rounded-xl border px-4 py-3 text-left transition-all duration-200 active:scale-[0.99] ${
                podium
                  ? 'border-white/[0.1] bg-white/[0.05] hover:bg-white/[0.08]'
                  : 'border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.05]'
              }`}
            >
              <span className="w-8 text-lg font-bold tabular-nums">
                {podium ? (
                  <span className="text-xl">{MEDALS[i]}</span>
                ) : (
                  <span className="text-white/40">{i + 1}</span>
                )}
              </span>
              <span className="flex-1 truncate font-medium text-white/90">{entry.name}</span>
              <span className="w-10 text-right text-sm tabular-nums text-white/45">{entry.count}</span>
              <span className="w-12 text-right text-sm tabular-nums text-white/70">
                {entry.correct + entry.exact}
              </span>
              <span className="w-12 text-right font-bold tabular-nums text-white">{entry.total}</span>
            </button>
          )
        })}
      </div>

      {selectedUser && typeof window !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md animate-fade"
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="flex max-h-[80vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#101012] shadow-2xl shadow-black/50 animate-rise"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-5">
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-white/35">Pronósticos</p>
                <h2 className="text-xl font-semibold tracking-tight">{selectedUser.name}</h2>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                &times;
              </button>
            </div>

            <div className="overflow-y-auto p-6">
              {loading && (
                <div className="flex flex-col gap-3">
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <Skeleton key={idx} className="h-[68px] w-full rounded-xl" />
                  ))}
                </div>
              )}

              {!loading && predictions && predictions.length === 0 && (
                <p className="py-8 text-center text-white/40">Sin pronósticos</p>
              )}

              {!loading && predictions && predictions.length > 0 && (
                <div className="flex flex-col gap-3">
                  {predictions.map((p, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Flag name={p.home_team} className="text-base" />
                          <span className="text-sm font-semibold">{p.home_team}</span>
                        </div>
                        <span className="text-lg font-bold tabular-nums">
                          {p.home_score} - {p.away_score}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-semibold">{p.away_team}</span>
                          <Flag name={p.away_team} className="text-base" />
                        </div>
                      </div>
                      {p.status === 'finished' ? (
                        <div className="flex items-center justify-between text-xs text-white/40">
                          <span>
                            Resultado: {p.match_home_score} - {p.match_away_score}
                          </span>
                          <span
                            className={`font-bold ${
                              p.points === 3
                                ? 'text-emerald-400'
                                : p.points === 1
                                  ? 'text-amber-400'
                                  : 'text-red-400'
                            }`}
                          >
                            {p.points != null ? `${p.points} ptos` : '—'}
                          </span>
                        </div>
                      ) : (
                        <p className="text-center text-xs text-white/30">Por jugarse</p>
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
    </div>
  )
}

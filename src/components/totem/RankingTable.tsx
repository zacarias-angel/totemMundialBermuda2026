import { getRanking } from '@/services/ranking'
import { RankingTableClient } from './RankingTableClient'

export async function RankingTable() {
  const ranking = await getRanking()

  if (ranking.length === 0) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] py-16 text-center animate-fade">
        <p className="text-white/40">Todavía no hay pronósticos</p>
      </div>
    )
  }

  return <RankingTableClient ranking={ranking} />
}

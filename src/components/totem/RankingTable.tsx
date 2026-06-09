import { getRanking } from '@/services/ranking'
import { RankingTableClient } from './RankingTableClient'

export async function RankingTable() {
  const ranking = await getRanking()

  if (ranking.length === 0) {
    return <p className="text-gray-400 text-center py-8">Todavía no hay pronósticos</p>
  }

  return (
    <div className="w-full">
      <table className="w-full text-left">
        <thead>
          <tr className="text-xs uppercase tracking-wider text-gray-400 border-b border-white/10">
            <th className="pb-3 font-medium">#</th>
            <th className="pb-3 font-medium">Nombre</th>
            <th className="pb-3 font-medium text-right">Pronósticos</th>
            <th className="pb-3 font-medium text-right">Aciertos</th>
            <th className="pb-3 font-medium text-right">Puntos</th>
          </tr>
        </thead>
        <RankingTableClient ranking={ranking} />
      </table>
    </div>
  )
}

import { Suspense } from 'react'
import { RankingTable } from '@/components/totem/RankingTable'

export default function MobileRanking() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Ranking</h1>
      <p className="text-gray-400 text-sm mb-6">Posiciones del Prode 2026</p>

      <Suspense fallback={<p className="text-gray-400 text-center py-8">Cargando...</p>}>
        <RankingTable />
      </Suspense>
    </div>
  )
}

import Link from 'next/link'
export const dynamic = 'force-dynamic'
import { Suspense } from 'react'
import { InactivityGuard } from '@/components/totem/InactivityGuard'
import { RankingTable } from '@/components/totem/RankingTable'
import { RankingAutoRefresh } from '@/components/totem/RankingAutoRefresh'
import { QRCode } from '@/components/ui/QRCode'

export default function TotemHome() {
  const url = process.env.NEXT_PUBLIC_APP_URL ?? 'http://192.168.0.127:3000/mobile'

  return (
    <InactivityGuard>
      <div className="relative min-h-screen p-4 sm:p-8 pt-20">
      <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-center">Ranking</h1>

      <RankingAutoRefresh />
      <div className="flex gap-6 max-w-6xl mx-auto">
        <div className="w-[70%]">
          <Suspense fallback={<p className="text-gray-400">Cargando ranking...</p>}>
            <RankingTable />
          </Suspense>
        </div>

        <div className="w-[30%] flex flex-col items-center gap-6 pt-8">
          <Link
            href="/mobile?from=totem"
            className="w-full px-6 py-5 rounded-2xl bg-blue-600 text-white text-xl font-bold text-center hover:bg-blue-700 active:scale-95 transition-all"
          >
            Hacé tus pronósticos
          </Link>

          <div className="flex flex-col items-center gap-3">
            <p className="text-sm text-gray-500 text-center">O escaneá el código</p>
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
              <QRCode url={url} size={180} />
            </div>
          </div>
        </div>
      </div>
    </div>
    </InactivityGuard>
  )
}

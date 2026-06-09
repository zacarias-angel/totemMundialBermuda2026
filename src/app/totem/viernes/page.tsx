import { Suspense } from 'react'
import { ViernesDisplay } from '@/components/totem/ViernesDisplay'

export default function TotemViernes() {
  return (
    <div className="relative min-h-screen flex flex-col items-center p-4 sm:p-8 pt-20">
      <Suspense fallback={<p className="text-gray-400">Cargando...</p>}>
        <ViernesDisplay />
      </Suspense>
    </div>
  )
}

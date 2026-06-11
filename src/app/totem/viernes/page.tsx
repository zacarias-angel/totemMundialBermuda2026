export const dynamic = 'force-dynamic'
import { Suspense } from 'react'
import { InactivityGuard } from '@/components/totem/InactivityGuard'
import { ViernesDisplay } from '@/components/totem/ViernesDisplay'
import { ViernesSkeleton } from '@/components/totem/Skeletons'

export default function TotemViernes() {
  return (
    <InactivityGuard>
      <div className="mx-auto flex w-full max-w-2xl flex-col px-5 pb-16 pt-20 sm:px-8">
        <Suspense fallback={<ViernesSkeleton />}>
          <ViernesDisplay />
        </Suspense>
      </div>
    </InactivityGuard>
  )
}

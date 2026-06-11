import { Skeleton } from '@/components/ui/Skeleton'

export function RankingSkeleton() {
  return (
    <div className="w-full animate-fade">
      <div className="mb-4 flex items-center gap-3 px-1">
        <Skeleton className="h-3 w-6" />
        <Skeleton className="h-3 w-24" />
        <div className="ml-auto flex gap-6">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-xl border border-white/[0.05] bg-white/[0.02] px-4 py-3.5"
            style={{ opacity: 1 - i * 0.07 }}
          >
            <Skeleton className="h-7 w-7 rounded-lg" />
            <Skeleton className="h-4 w-32" />
            <div className="ml-auto flex items-center gap-8">
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-4 w-10" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function MatchesSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-fade">
      {Array.from({ length: 2 }).map((_, group) => (
        <div key={group}>
          <Skeleton className="mb-3 h-5 w-44" />
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4"
              >
                <div className="flex flex-1 items-center justify-end gap-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-6 rounded" />
                </div>
                <Skeleton className="h-4 w-12 shrink-0" />
                <div className="flex flex-1 items-center gap-2">
                  <Skeleton className="h-5 w-6 rounded" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export function ViernesSkeleton() {
  return (
    <div className="mx-auto w-full max-w-xl animate-fade">
      <Skeleton className="mb-2 h-3 w-28" />
      <Skeleton className="mb-8 h-7 w-3/4" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
            <div className="mb-3 flex items-center justify-between">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-4 w-14" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" style={{ width: `${90 - i * 18}%` }} />
          </div>
        ))}
      </div>
    </div>
  )
}

export function SidePanelSkeleton() {
  return (
    <div className="flex w-full flex-col gap-6 animate-fade">
      <Skeleton className="h-16 w-full rounded-2xl" />
      <div className="flex flex-col items-center gap-3">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-[212px] w-[212px] rounded-2xl" />
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    </div>
  )
}

export function GallerySkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 animate-fade">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="aspect-[3/4] w-full rounded-2xl" />
      ))}
    </div>
  )
}

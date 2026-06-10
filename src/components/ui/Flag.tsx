import { getFlagUrl } from '@/lib/utils/flags'

export function Flag({ name, className = '' }: { name: string | null | undefined; className?: string }) {
  const src = getFlagUrl(name)
  if (!src) return null
  return (
    <img
      src={src}
      alt=""
      className={`inline-block w-5 h-auto align-middle ${className}`}
      loading="lazy"
    />
  )
}

import Image from 'next/image'
import { getFlagUrl } from '@/lib/utils/flags'

export function Flag({ name, className = '' }: { name: string | null | undefined; className?: string }) {
  const src = getFlagUrl(name)
  if (!src) return null
  return (
    <Image
      src={src}
      alt=""
      width={24}
      height={18}
      className={`inline-block w-5 h-auto align-middle ${className}`}
      unoptimized
    />
  )
}

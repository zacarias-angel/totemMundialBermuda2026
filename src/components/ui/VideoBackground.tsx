'use client'

interface VideoBackgroundProps {
  src: string
  poster?: string
}

export function VideoBackground({ src, poster }: VideoBackgroundProps) {
  return (
    <video
      className="fixed inset-0 w-full h-full object-cover"
      src={src}
      poster={poster}
      autoPlay
      loop
      muted
      playsInline
    />
  )
}

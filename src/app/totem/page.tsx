'use client'

import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'

export default function TotemSplash() {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoError, setVideoError] = useState(false)

  const enter = () => router.push('/totem/home')

  return (
    <div
      className="relative h-full w-full overflow-hidden cursor-pointer bg-gradient-to-b from-zinc-900 to-black select-none"
      onClick={enter}
      onTouchEnd={enter}
    >
      {!videoError && (
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          src="https://packstory.s3.amazonaws.com/Resumen%20Bermuda%20Vertical.mp4"
          autoPlay
          loop
          muted
          playsInline
          onError={() => setVideoError(true)}
        />
      )}

      {/* Blur + scrim layer over the changing video for legibility */}
      {!videoError && (
        <>
          <div className="absolute inset-0 [backdrop-filter:blur(10px)] [-webkit-backdrop-filter:blur(10px)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/35 to-black/85" />
          <div className="absolute inset-0 bg-[radial-gradient(110%_70%_at_50%_0%,rgba(91,140,255,0.12),transparent_55%)]" />
        </>
      )}

      {/* Content */}
      <div className="@container absolute inset-0 z-10 flex flex-col items-center justify-between py-[12vh] px-5 text-center">
        <div className="animate-rise inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-1.5 backdrop-blur-md">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_10px_var(--accent)]" />
          <span className="whitespace-nowrap text-[clamp(8px,2.6cqw,11px)] font-medium uppercase tracking-[0.2em] text-white/70">
            Bermuda · Mundial 2026
          </span>
        </div>

        <div className="animate-rise" style={{ animationDelay: '80ms' }}>
          <h1 className="text-[clamp(1.5rem,13cqw,7rem)] font-bold leading-[0.92] tracking-tight">
            <span className="block bg-gradient-to-b from-white to-white/55 bg-clip-text text-transparent">
              Prode
            </span>
            <span className="block bg-gradient-to-b from-white to-white/55 bg-clip-text text-transparent">
              Mundial
            </span>
            <span className="mt-1 block bg-gradient-to-r from-[var(--accent)] to-[#8aa9ff] bg-clip-text text-transparent">
              2026
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-[28ch] text-[clamp(11px,3.2cqw,15px)] leading-relaxed text-white/60">
            Pronosticá los resultados y competí por el primer puesto del ranking.
          </p>
        </div>

        <div className="animate-rise flex flex-col items-center gap-3" style={{ animationDelay: '160ms' }}>
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/[0.06] backdrop-blur-md">
            <span className="h-2.5 w-2.5 animate-ping rounded-full bg-white/80" />
          </span>
          <p className="text-sm font-medium tracking-wide text-white/70">Tocá para comenzar</p>
        </div>
      </div>
    </div>
  )
}

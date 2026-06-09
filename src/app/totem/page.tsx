'use client'

import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'

export default function TotemSplash() {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoError, setVideoError] = useState(false)

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden cursor-pointer bg-gradient-to-b from-zinc-900 to-black"
      onClick={() => router.push('/totem/home')}
      onTouchEnd={() => router.push('/totem/home')}
    >
      {!videoError && (
        <video
          ref={videoRef}
          className="fixed inset-0 w-full h-full object-cover pointer-events-none"
          src="https://packstory.s3.amazonaws.com/Resumen%20Bermuda%20Vertical.mp4"
          autoPlay
          loop
          muted
          playsInline
          onError={() => setVideoError(true)}
        />
      )}

      <div
        className="fixed inset-0 z-10 flex flex-col items-center justify-center px-6"
        style={{ background: videoError ? undefined : 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)' }}
      >
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-center drop-shadow-lg">
          Prode Mundial 2026
        </h1>
        <p className="text-gray-400 mt-4 text-lg">Tocá para comenzar</p>
      </div>
    </div>
  )
}

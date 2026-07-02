'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function FotoCarousel() {
  const [urls, setUrls] = useState<string[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    supabase.storage
      .from('fotofigurita')
      .list('', { limit: 100 })
      .then(({ data }) => {
        if (!data) return
        const imageFiles = data.filter((f) => /\.(jpg|jpeg|png|webp|gif)$/i.test(f.name))
        const publicUrls = imageFiles.map((f) =>
          supabase.storage.from('fotofigurita').getPublicUrl(f.name).data.publicUrl
        )
        setUrls(publicUrls)
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [])

  if (!loaded || urls.length === 0) return null

  const doubled = [...urls, ...urls]

  return (
    <section className="animate-rise my-6" style={{ animationDelay: '80ms' }}>
      <h3 className="mb-2.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/35">
        <span className="h-1 w-1 rounded-full bg-pink-400" />
        Foto Figuritas
      </h3>
      <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02]">
        <div className="flex animate-scroll gap-3 py-3 px-3" style={{ width: 'max-content' }}>
          {doubled.map((url, i) => (
            <img
              key={i}
              src={url}
              alt=""
              className="h-16 w-16 shrink-0 rounded-lg object-cover border border-white/10"
              loading="lazy"
            />
          ))}
        </div>
      </div>
      <style jsx>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
      `}</style>
    </section>
  )
}

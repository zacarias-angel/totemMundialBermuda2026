'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { GallerySkeleton } from '@/components/totem/Skeletons'

interface Photo {
  id: string
  url: string
  createdAt: string
}

export default function GaleriaPage() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [selected, setSelected] = useState<Photo | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/photos')
      const data = await res.json()
      setPhotos(Array.isArray(data) ? data : [])
    } catch {
      setPhotos([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleDelete = async (id: string) => {
    await fetch(`/api/photos?id=${id}`, { method: 'DELETE' })
    setPhotos((prev) => prev.filter((p) => p.id !== id))
    setSelected(null)
  }

  const formatDate = (ts: string) => {
    const d = new Date(Number(ts))
    return d.toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-5 pb-16 pt-20 sm:px-8">
      <div className="animate-rise mb-7 flex items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.18em] text-white/40">Fotofiguritas</p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Galería</h1>
        </div>
        <Link
          href="/totem/fotofigurita"
          className="rounded-xl bg-[var(--accent-strong)] px-5 py-3 text-sm font-medium text-white shadow-lg shadow-[var(--accent-strong)]/25 transition-all hover:bg-[var(--accent)] active:scale-[0.97]"
        >
          Nueva foto
        </Link>
      </div>

      {loading ? (
        <GallerySkeleton />
      ) : photos.length === 0 ? (
        <div className="animate-fade rounded-3xl border border-white/[0.07] bg-white/[0.02] py-20 text-center">
          <p className="mb-5 text-lg text-white/45">Todavía no hay fotos</p>
          <Link
            href="/totem/fotofigurita"
            className="inline-block rounded-xl bg-[var(--accent-strong)] px-7 py-3.5 font-medium text-white shadow-lg shadow-[var(--accent-strong)]/25 transition-all hover:bg-[var(--accent)] active:scale-[0.97]"
          >
            Sacar la primera foto
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 animate-fade">
          {photos.map((photo, i) => (
            <button
              key={photo.id}
              onClick={() => setSelected(photo)}
              className="group animate-rise relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] transition-all hover:border-[var(--accent)]/50 hover:shadow-xl hover:shadow-black/40"
              style={{ animationDelay: `${Math.min(i * 40, 320)}ms` }}
            >
              <Image
                src={photo.url}
                alt=""
                width={300}
                height={400}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <p className="absolute bottom-2.5 left-3 right-3 truncate text-left text-xs text-white/80 opacity-0 transition-opacity group-hover:opacity-100">
                {formatDate(photo.createdAt)}
              </p>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md animate-fade"
          onClick={() => setSelected(null)}
        >
          <div className="relative w-full max-w-lg animate-rise" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelected(null)}
              className="absolute -top-12 right-0 flex h-9 w-9 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            >
              ✕
            </button>
            <Image
              src={selected.url}
              alt="Foto"
              width={600}
              height={800}
              className="w-full rounded-3xl shadow-2xl shadow-black/60"
              unoptimized
            />
            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="text-sm text-white/40">{formatDate(selected.createdAt)}</p>
              <div className="flex gap-2.5">
                <button
                  onClick={() => {
                    const a = document.createElement('a')
                    a.download = `fotofigurita-${selected.id.slice(0, 8)}.webp`
                    a.href = selected.url
                    a.click()
                  }}
                  className="rounded-xl bg-[var(--accent-strong)] px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-[var(--accent)] active:scale-[0.97]"
                >
                  Descargar
                </button>
                <button
                  onClick={() => handleDelete(selected.id)}
                  className="rounded-xl bg-red-500/90 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-red-500 active:scale-[0.97]"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

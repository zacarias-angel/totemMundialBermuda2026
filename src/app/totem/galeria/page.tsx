'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface Photo {
  id: string
  url: string
  createdAt: string
}

export default function GaleriaPage() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [selected, setSelected] = useState<Photo | null>(null)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/photos')
      const data = await res.json()
      setPhotos(Array.isArray(data) ? data : [])
    } catch {
      setPhotos([])
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
    <div className="relative min-h-screen bg-black text-white p-6 pb-24">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">Galería</h1>
          <Link
            href="/totem/fotofigurita"
            className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 active:scale-95 transition-all"
          >
            Nueva foto
          </Link>
        </div>

        {photos.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-gray-500 text-xl mb-4">Todavía no hay fotos</p>
            <Link
              href="/totem/fotofigurita"
              className="inline-block px-8 py-4 rounded-xl bg-blue-600 text-white text-lg font-semibold hover:bg-blue-700 transition-all"
            >
              Sacar la primera foto
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {photos.map((photo) => (
              <button
                key={photo.id}
                onClick={() => setSelected(photo)}
                className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 hover:border-blue-500/50 transition-all"
              >
                <Image
                  src={photo.url}
                  alt=""
                  width={300}
                  height={400}
                  className="w-full h-full object-cover"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <p className="absolute bottom-2 left-2 text-xs text-white/80 opacity-0 group-hover:opacity-100 transition-opacity">
                  {formatDate(photo.createdAt)}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute -top-12 right-0 text-white/70 hover:text-white text-2xl"
            >
              ✕
            </button>
            <Image
              src={selected.url}
              alt="Foto"
              width={600}
              height={800}
              className="w-full rounded-2xl shadow-2xl"
              unoptimized
            />
            <div className="flex items-center justify-between mt-4">
              <p className="text-gray-400 text-sm">{formatDate(selected.createdAt)}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const a = document.createElement('a')
                    a.download = `fotofigurita-${selected.id.slice(0, 8)}.webp`
                    a.href = selected.url
                    a.click()
                  }}
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 active:scale-95 transition-all"
                >
                  Descargar
                </button>
                <button
                  onClick={() => handleDelete(selected.id)}
                  className="px-5 py-2 rounded-xl bg-red-600/80 text-white font-semibold hover:bg-red-700 active:scale-95 transition-all"
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

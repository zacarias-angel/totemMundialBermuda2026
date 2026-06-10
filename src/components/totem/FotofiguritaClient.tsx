'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { QRCode } from '@/components/ui/QRCode'

export function FotofiguritaClient() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [playerName, setPlayerName] = useState('')
  const [showNameInput, setShowNameInput] = useState(true)
  const [captured, setCaptured] = useState<string | null>(null)
  const [cameraReady, setCameraReady] = useState(false)
  const [error, setError] = useState('')
  const [generating, setGenerating] = useState(false)
  const [generateError, setGenerateError] = useState('')
  const [countdown, setCountdown] = useState<number | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop())
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current)
    }
  }, [])

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      streamRef.current = s
      if (videoRef.current) {
        videoRef.current.srcObject = s
      }
    } catch (err) {
      let msg: string
      if (!navigator.mediaDevices) {
        msg = 'La cámara no está disponible. Usá http://localhost:3000 desde este navegador, o configurá HTTPS.'
      } else if (err instanceof DOMException) {
        msg =
          err.name === 'NotAllowedError'
            ? 'Permiso de cámara denegado. Permití el acceso en la configuración del navegador.'
            : err.name === 'NotFoundError'
              ? 'No se detectó ninguna cámara.'
              : err.name === 'NotReadableError'
                ? 'La cámara está siendo usada por otra aplicación.'
                : `Error de cámara: ${err.message}`
      } else {
        msg = `No se pudo acceder a la cámara: ${err instanceof Error ? err.message : 'Error desconocido'}`
      }
      setError(msg)
    }
  }

  const handleVideoReady = () => {
    setCameraReady(true)
  }

  const handleStart = () => {
    if (!playerName.trim()) return
    setShowNameInput(false)
    startCamera()
  }

  const saveToGallery = async (blob: Blob): Promise<string | null> => {
    try {
      const formData = new FormData()
      formData.append('photo', blob, 'photo.webp')
      const res = await fetch('/api/photos', { method: 'POST', body: formData })
      const data = await res.json()
      return data.url ?? null
    } catch {
      return null
    }
  }

  const doCapture = useCallback(async () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    setGenerating(true)
    setGenerateError('')

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      setGenerating(false)
      return
    }

    const w = 1080
    const h = 1440
    canvas.width = w
    canvas.height = h

    ctx.save()
    ctx.scale(-1, 1)
    const vw = video.videoWidth
    const vh = video.videoHeight
    const vAspect = vw / vh
    const cAspect = w / h
    let dw: number, dh: number, dx: number, dy: number
    if (vAspect > cAspect) {
      dh = h
      dw = h * vAspect
      dx = (w - dw) / 2
      dy = 0
    } else {
      dw = w
      dh = w / vAspect
      dx = 0
      dy = (h - dh) / 2
    }
    ctx.drawImage(video, -(dx + dw), dy, dw, dh)
    ctx.restore()

    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null

    try {
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, 'image/webp', 0.85)
      })

      if (!blob) {
        throw new Error('No se pudo capturar la foto')
      }

      const form = new FormData()
      form.append('selfie', blob, 'selfie.webp')
      form.append('playerName', playerName.trim())

      const res = await fetch('/api/fotofigurita/generate', { method: 'POST', body: form })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error ?? 'Error al generar la figurita')
      }

      const dataUrl = `data:image/webp;base64,${data.image}`
      setCaptured(dataUrl)

      const resultBlob = await fetch(dataUrl).then((r) => r.blob())
      const savedUrl = await saveToGallery(resultBlob)
      if (savedUrl) setPhotoUrl(savedUrl)
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : 'Error al generar la figurita')
      startCamera()
    } finally {
      setGenerating(false)
    }
  }, [playerName])

  const startCountdown = () => {
    setCountdown(3)
    countdownTimerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          if (countdownTimerRef.current) clearInterval(countdownTimerRef.current)
          countdownTimerRef.current = null
          doCapture()
          return null
        }
        return prev - 1
      })
    }, 1000)
  }

  const capture = () => {
    if (!cameraReady) return
    startCountdown()
  }

  const retake = () => {
    setCaptured(null)
    setPhotoUrl(null)
    setError('')
    setGenerateError('')
    setCountdown(null)
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    startCamera()
  }

  const download = () => {
    if (!captured) return
    const a = document.createElement('a')
    a.download = 'fotofigurita-2026.webp'
    a.href = captured
    a.click()
  }

  const share = async () => {
    if (!captured) return
    try {
      const res = await fetch(captured)
      const blob = await res.blob()
      const file = new File([blob], 'fotofigurita-2026.webp', { type: 'image/webp' })
      await navigator.share({ files: [file], title: 'Fotofigurita 2026' })
    } catch {
      download()
    }
  }

  if (error) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center p-8">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold mb-4">Fotofigurita</h1>
          <p className="text-red-400 mb-6">{error}</p>
          <button
            onClick={retake}
            className="px-8 py-4 rounded-xl bg-blue-600 text-white text-lg font-semibold hover:bg-blue-700 active:scale-95 transition-all"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  if (captured) {
    return (
      <div className="relative min-h-screen flex flex-col items-center pt-[10vh] p-8">
        <div className="text-center max-w-lg">
          <h1 className="text-3xl font-bold mb-6">Tu Fotofigurita</h1>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={captured}
            alt="Fotofigurita generada"
            className="w-full max-w-sm mx-auto rounded-2xl shadow-2xl"
          />
          <div className="flex gap-4 mt-8 justify-center flex-wrap">
            <button
              onClick={retake}
              className="px-8 py-4 rounded-xl bg-white/10 border border-white/20 text-white text-lg font-semibold hover:bg-white/20 active:scale-95 transition-all"
            >
              Volver a sacar
            </button>
            <button
              onClick={download}
              className="px-8 py-4 rounded-xl bg-blue-600 text-white text-lg font-semibold hover:bg-blue-700 active:scale-95 transition-all"
            >
              Descargar
            </button>
            <button
              onClick={share}
              className="px-8 py-4 rounded-xl bg-green-600 text-white text-lg font-semibold hover:bg-green-700 active:scale-95 transition-all"
            >
              Compartir
            </button>
          </div>

          {photoUrl && (
            <div className="mt-8 flex flex-col items-center gap-3">
              <p className="text-sm text-gray-500 text-center">Escaneá para descargar en tu celu</p>
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 inline-block">
                <QRCode url={photoUrl} size={160} />
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (showNameInput) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm text-center">
          <h1 className="text-3xl font-bold mb-2">Fotofigurita</h1>
          <p className="text-gray-400 mb-8">Ingresá el nombre que va a salir en la figurita</p>

          <input
            data-totem-input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Nombre del jugador"
            className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-4 text-white text-lg text-center placeholder:text-gray-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all mb-6"
            autoFocus
          />

          <button
            onClick={handleStart}
            disabled={!playerName.trim()}
            className="w-full px-8 py-4 rounded-xl bg-blue-600 text-white text-lg font-semibold hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-40"
          >
            Empezar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center pt-[10vh] p-4">
      <h1 className="text-3xl font-bold mb-4">Fotofigurita</h1>
      <p className="text-gray-400 mb-6 text-center max-w-sm">
        Posicionate frente a la cámara y tocá para sacarte la foto
      </p>

      {generateError && (
        <p className="text-red-400 mb-4 text-center max-w-sm">{generateError}</p>
      )}

      <div className="relative w-full max-w-sm aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-900">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          onCanPlay={handleVideoReady}
          className="absolute inset-0 w-full h-full object-cover z-10 [transform:scaleX(-1)]"
        />

        {countdown !== null && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
            <span className="text-9xl font-bold text-white drop-shadow-2xl animate-ping">
              {countdown}
            </span>
          </div>
        )}

        {generating && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 z-30 gap-4">
            <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            <p className="text-white text-lg text-center px-4">Generando tu figurita...</p>
            <p className="text-gray-400 text-sm text-center px-4">Puede tardar hasta un minuto</p>
          </div>
        )}
      </div>

      <button
        onClick={capture}
        disabled={!cameraReady || generating || countdown !== null}
        className="mt-8 w-20 h-20 rounded-full border-4 border-white bg-transparent hover:bg-white/10 active:scale-90 transition-all disabled:opacity-40"
        aria-label="Sacar foto"
      >
        <div className="w-16 h-16 rounded-full bg-white mx-auto" />
      </button>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}

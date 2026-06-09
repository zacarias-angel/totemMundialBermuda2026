'use client'

import { useRef, useState, useEffect, useCallback } from 'react'

const FRAME = '/asset/marco.svg'
const BANDERA = '/asset/marcobandera.svg'
const MARCO6 = '/asset/marco6.svg'
// const RECT_AB = '/asset/rectAB.svg'
// const RECT_AR = '/asset/rectAR.svg'
const NUM_2 = '/asset/2.svg'
const NUM_6 = '/asset/6.svg'
const ARG = '/asset/ARG.webp'
// const PANINI = '/asset/panini.svg'
const FIFA = '/asset/logofifa.svg'

interface OverlayInfo {
  src: string
  layer: 'bg' | 'fg'
  pos: { x: number; y: number; w: number; h: number } | 'full'
}

const OVERLAYS: OverlayInfo[] = [
  { src: NUM_2, layer: 'bg', pos: { x: 0.7, y: 0.8, w: 0.08, h: 0.08 } },
  { src: NUM_6, layer: 'bg', pos: { x: 0.8, y: 0.8, w: 0.08, h: 0.08 } },
  { src: ARG, layer: 'fg', pos: { x: 0.01, y: 0.1, w: 1.0, h: 1.0 } },
  { src: FRAME, layer: 'fg', pos: 'full' },
  { src: BANDERA, layer: 'fg', pos: 'full' },
  { src: MARCO6, layer: 'fg', pos: 'full' },
  // { src: RECT_AB, layer: 'fg', pos: 'full' },
  // { src: RECT_AR, layer: 'fg', pos: 'full' },
  // { src: PANINI, layer: 'fg', pos: { x: 0.25, y: 0.8, w: 0.5, h: 0.06 } },
  { src: FIFA, layer: 'fg', pos: { x: 0.72, y: 0.03, w: 0.25, h: 0.05 } },
]

export function FotofiguritaClient() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [captured, setCaptured] = useState<string | null>(null)
  const [cameraReady, setCameraReady] = useState(false)
  const [error, setError] = useState('')
  const [composing, setComposing] = useState(false)
  const bgImagesRef = useRef<HTMLImageElement[]>([])
  const fgImagesRef = useRef<HTMLImageElement[]>([])

  useEffect(() => {
    bgImagesRef.current = OVERLAYS
      .filter((o) => o.layer === 'bg')
      .map((o) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.src = o.src
        return img
      })

    fgImagesRef.current = OVERLAYS
      .filter((o) => o.layer === 'fg')
      .map((o) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.src = o.src
        return img
      })

    startCamera()
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
      }
    }
  }, [])

  const streamRef = useRef<MediaStream | null>(null)

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

  const capture = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    setComposing(true)

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = 1080
    const h = 1440
    canvas.width = w
    canvas.height = h

    const drawContain = (ctx: CanvasRenderingContext2D, img: HTMLImageElement, bx: number, by: number, bw: number, bh: number) => {
      const imgAspect = img.naturalWidth / img.naturalHeight || 1
      const boxAspect = bw / bh
      let dw: number, dh: number
      if (imgAspect > boxAspect) {
        dw = bw
        dh = bw / imgAspect
      } else {
        dh = bh
        dw = bh * imgAspect
      }
      ctx.drawImage(img, bx + (bw - dw) / 2, by + (bh - dh) / 2, dw, dh)
    }

      const drawCover = (ctx: CanvasRenderingContext2D, video: HTMLVideoElement, cw: number, ch: number) => {
      ctx.save()
      ctx.scale(-1, 1)
      const vw = video.videoWidth
      const vh = video.videoHeight
      const vAspect = vw / vh
      const cAspect = cw / ch
      let dw: number, dh: number, dx: number, dy: number
      if (vAspect > cAspect) {
        dh = ch
        dw = ch * vAspect
        dx = (cw - dw) / 2
        dy = 0
      } else {
        dw = cw
        dh = cw / vAspect
        dx = 0
        dy = (ch - dh) / 2
      }
      ctx.drawImage(video, -(dx + dw), dy, dw, dh)
      ctx.restore()
    }

    const drawOverlay = (ctx: CanvasRenderingContext2D, img: HTMLImageElement, overlay: OverlayInfo) => {
      try {
        if (overlay.pos === 'full') {
          drawContain(ctx, img, 0, 0, w, h)
        } else {
          const bx = overlay.pos.x * w
          const by = overlay.pos.y * h
          const bw = overlay.pos.w * w
          const bh = overlay.pos.h * h
          drawContain(ctx, img, bx, by, bw, bh)
        }
      } catch {}
    }

    const bgList = OVERLAYS.filter((o) => o.layer === 'bg')
    const fgList = OVERLAYS.filter((o) => o.layer === 'fg')

    let drawn = 0
    const total = bgList.length + 1 + fgList.length

    const finish = () => {
      drawn++
      if (drawn >= total) {
        const dataUrl = canvas.toDataURL('image/png')
        setCaptured(dataUrl)
        fetch('/api/photos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: dataUrl }),
        })
        setComposing(false)
        streamRef.current?.getTracks().forEach((t) => t.stop())
        streamRef.current = null
      }
    }

    bgList.forEach((overlay, i) => {
      drawOverlay(ctx, bgImagesRef.current[i], overlay)
      finish()
    })

    drawCover(ctx, video, w, h)
    finish()

    fgList.forEach((overlay, i) => {
      const img = fgImagesRef.current[i]
      drawOverlay(ctx, img, overlay)
      finish()
    })
  }, [])

  const retake = () => {
    setCaptured(null)
    setError('')
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    startCamera()
  }

  const download = () => {
    if (!captured) return
    const a = document.createElement('a')
    a.download = 'fotofigurita-2026.png'
    a.href = captured
    a.click()
  }

  const share = async () => {
    if (!captured) return
    try {
      const res = await fetch(captured)
      const blob = await res.blob()
      const file = new File([blob], 'fotofigurita-2026.png', { type: 'image/png' })
      await navigator.share({ files: [file], title: 'Fotofigurita 2026' })
    } catch {
      const a = document.createElement('a')
      a.download = 'fotofigurita-2026.png'
      a.href = captured
      a.click()
    }
  }

  const overlayStyle = (p: OverlayInfo['pos']): React.CSSProperties => {
    if (p === 'full') return { position: 'absolute', inset: 0 }
    return {
      position: 'absolute',
      left: `${p.x * 100}%`,
      top: `${p.y * 100}%`,
      width: `${p.w * 100}%`,
      height: `${p.h * 100}%`,
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
          <img
            src={captured}
            alt="Foto con marco"
            className="w-full max-w-sm mx-auto rounded-2xl shadow-2xl"
          />
          <div className="flex gap-4 mt-8 justify-center">
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
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center pt-[10vh] p-4">
      <h1 className="text-3xl font-bold mb-4">Fotofigurita</h1>
      <p className="text-gray-400 mb-6">Poseionate frente a la cámara y tocá para sacarte la foto</p>

      <div className="relative w-full max-w-sm aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-900">
        <div className="absolute inset-0 pointer-events-none z-0">
          {OVERLAYS.filter((o) => o.layer === 'bg').map((o) => (
            <img key={o.src} src={o.src} alt="" style={overlayStyle(o.pos)} className="object-contain" />
          ))}
        </div>

        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          onCanPlay={handleVideoReady}
          className="absolute inset-0 w-full h-full object-cover z-10 [transform:scaleX(-1)]"
        />

        <div className="absolute inset-0 pointer-events-none z-20">
          {OVERLAYS.filter((o) => o.layer === 'fg').map((o) => (
            <img
              key={o.src}
              src={o.src}
              alt=""
              style={overlayStyle(o.pos)}
              className="object-contain"
            />
          ))}
        </div>

        {composing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-30">
            <p className="text-white text-lg">Componiendo...</p>
          </div>
        )}
      </div>

      <button
        onClick={capture}
        disabled={!cameraReady || composing}
        className="mt-8 w-20 h-20 rounded-full border-4 border-white bg-transparent hover:bg-white/10 active:scale-90 transition-all disabled:opacity-40"
        aria-label="Sacar foto"
      >
        <div className="w-16 h-16 rounded-full bg-white mx-auto" />
      </button>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}

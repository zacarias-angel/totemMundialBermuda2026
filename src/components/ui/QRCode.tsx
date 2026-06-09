'use client'

import { useEffect, useRef } from 'react'

interface QRCodeProps {
  url: string
  size?: number
}

export function QRCode({ url, size = 200 }: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    async function draw() {
      const QRCode = (await import('qrcode')).default
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d')
        if (ctx) {
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, size, size)
        }
        await QRCode.toCanvas(canvasRef.current, url, {
          width: size,
          margin: 2,
          color: { dark: '#000000', light: '#ffffff' },
        })
      }
    }
    draw()
  }, [url, size])

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className="mx-auto rounded-xl"
    />
  )
}

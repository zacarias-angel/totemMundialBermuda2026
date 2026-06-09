'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

const INACTIVITY_TIMEOUT = 120_000

export function InactivityGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      router.push('/totem')
    }, INACTIVITY_TIMEOUT)
  }

  useEffect(() => {
    resetTimer()

    const events = ['mousedown', 'mousemove', 'touchstart', 'keydown', 'scroll', 'click', 'wheel']
    events.forEach((event) => window.addEventListener(event, resetTimer))

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      events.forEach((event) => window.removeEventListener(event, resetTimer))
    }
  }, [])

  return <>{children}</>
}

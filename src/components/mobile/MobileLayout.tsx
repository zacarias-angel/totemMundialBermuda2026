'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { VirtualKeyboard } from '@/components/totem/VirtualKeyboard'

const navItems = [
  { href: '/mobile', label: 'Inicio', icon: '🏠' },
  { href: '/mobile/pronosticos', label: 'Pronosticar', icon: '⚽' },
  { href: '/mobile/mis-pronosticos', label: 'Mis Pronósticos', icon: '📋' },
  { href: '/mobile/ranking', label: 'Ranking', icon: '🏆' },
  { href: '/mobile/viernes', label: 'Viernes de Qué', icon: '🎉' },
]

export function MobileLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null)
  const [fromTotem, setFromTotem] = useState(false)
  const [showFeDeErratas, setShowFeDeErratas] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('prode_user')
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {}
    }

    const params = new URLSearchParams(window.location.search)
    if (params.get('from') === 'totem') {
      sessionStorage.setItem('fromTotem', 'true')
      setFromTotem(true)
    } else if (sessionStorage.getItem('fromTotem') === 'true') {
      setFromTotem(true)
    }

    setShowFeDeErratas(true)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('prode_user')
    sessionStorage.removeItem('fromTotem')
    setFromTotem(false)
    setUser(null)
    router.push('/mobile')
  }

  const isLoginPage = pathname === '/mobile'

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {!isLoginPage && (
        <>
          <header className="sticky top-0 z-30 bg-black/80 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/mobile" className="font-bold text-lg">
                Prode 2026
              </Link>
              {fromTotem && (
                <Link
                  href="/totem"
                  className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                >
                  ← Volver al Tótem
                </Link>
              )}
            </div>

            {user && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400 truncate max-w-[120px]">{user.name}</span>
                <button
                  onClick={handleLogout}
                  className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                >
                  Salir
                </button>
              </div>
            )}
          </header>

          {showFeDeErratas && (
            <div className="bg-yellow-400/10 border-b border-yellow-400/30 px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="text-lg shrink-0">🏆</span>
                <div className="flex-1 min-w-0">
                  <p className="text-yellow-200/80 text-sm leading-snug font-medium">
                    Felicidades a los ganadores
                  </p>
                  <p className="text-yellow-200/40 text-xs leading-snug">TheBermuda</p>
                </div>
                <button
                  onClick={() => setShowFeDeErratas(false)}
                  className="text-yellow-400/60 hover:text-yellow-300 text-lg shrink-0 leading-none"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          <main className="flex-1 px-4 pb-24 pt-4">{children}</main>

          <nav className="fixed bottom-0 left-0 right-0 z-30 bg-zinc-900/95 backdrop-blur-md border-t border-white/10 px-2 pb-safe">
            <div className="flex justify-around">
              {navItems.slice(1).map((item) => {
                const active = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl transition-all text-xs ${
                      active ? 'text-blue-400' : 'text-gray-500'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </nav>
        </>
      )}

      {isLoginPage && children}

      {fromTotem && <VirtualKeyboard />}
    </div>
  )
}

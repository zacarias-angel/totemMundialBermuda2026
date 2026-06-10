'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { VirtualKeyboard } from './VirtualKeyboard'

const navItems = [
  { href: '/totem', label: 'Inicio' },
  { href: '/totem/home', label: 'Ranking' },
  { href: '/totem/proximos', label: 'Próximos Partidos' },
  { href: '/totem/viernes', label: 'Viernes de Qué' },
  { href: '/totem/fotofigurita', label: 'Fotofigurita' },
  { href: '/totem/galeria', label: 'Galería' },
]

export function TotemLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const isSplash = pathname === '/totem'

  if (isSplash) {
    return <>{children}</>
  }

  return (
    <div className="relative min-h-screen w-full bg-black text-white overflow-hidden">
      {children}

      <button
        onClick={() => setOpen(!open)}
        className="fixed top-4 right-4 z-50 w-14 h-14 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 active:scale-90 transition-all"
        aria-label="Menú"
      >
        <div className="flex flex-col gap-1">
          <span className={`block w-6 h-0.5 bg-white transition-all ${open ? 'rotate-45 translate-y-1.5' : ''}`} />
          <span className={`block w-6 h-0.5 bg-white transition-all ${open ? 'opacity-0' : ''}`} />
          <span className={`block w-6 h-0.5 bg-white transition-all ${open ? '-rotate-45 -translate-y-1.5' : ''}`} />
        </div>
      </button>

      <div
        className={`fixed inset-0 z-40 bg-black/80 backdrop-blur-sm transition-all ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setOpen(false)}
      />

      <nav
        className={`fixed top-0 right-0 z-40 h-full w-72 bg-zinc-900 border-l border-white/10 p-6 pt-20 transition-all ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <ul className="flex flex-col gap-2">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                className={`block px-4 py-3 rounded-xl text-lg font-medium transition-all ${
                  pathname === item.href
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-white/10'
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <VirtualKeyboard />
    </div>
  )
}

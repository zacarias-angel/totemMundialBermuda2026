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
    return <div className="absolute inset-0">{children}</div>
  }

  return (
    <div className="absolute inset-0 text-white">
      <main className="totem-scroll">{children}</main>

      <button
        onClick={() => setOpen(!open)}
        className="absolute top-5 right-5 z-50 w-12 h-12 flex items-center justify-center rounded-full bg-white/[0.06] backdrop-blur-xl border border-white/10 shadow-lg shadow-black/20 active:scale-90 transition-all hover:bg-white/10"
        aria-label="Menú"
      >
        <div className="flex flex-col gap-[5px]">
          <span className={`block w-5 h-0.5 rounded-full bg-white transition-all duration-300 ${open ? 'rotate-45 translate-y-[7px]' : ''}`} />
          <span className={`block w-5 h-0.5 rounded-full bg-white transition-all duration-300 ${open ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-0.5 rounded-full bg-white transition-all duration-300 ${open ? '-rotate-45 -translate-y-[7px]' : ''}`} />
        </div>
      </button>

      <div
        className={`absolute inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setOpen(false)}
      />

      <nav
        className={`absolute top-0 right-0 z-40 h-full w-[78%] max-w-xs bg-[#0e0e10]/95 backdrop-blur-2xl border-l border-white/10 p-6 pt-24 transition-transform duration-300 ease-[cubic-bezier(0.21,0.6,0.35,1)] ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <p className="px-3 mb-4 text-[11px] uppercase tracking-[0.18em] text-white/35 font-medium">Navegación</p>
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => {
            const active = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-xl text-[15px] font-medium transition-all duration-200 ${
                    active
                      ? 'bg-white/[0.08] text-white shadow-inner shadow-white/[0.04]'
                      : 'text-white/55 hover:bg-white/[0.05] hover:text-white'
                  }`}
                >
                  {active && <span className="mr-2.5 h-4 w-1 rounded-full bg-[var(--accent)]" />}
                  <span className={active ? '' : 'ml-[18px]'}>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <VirtualKeyboard />
    </div>
  )
}

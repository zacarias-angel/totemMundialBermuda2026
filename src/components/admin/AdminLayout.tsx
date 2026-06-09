'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/usuarios', label: 'Usuarios', icon: '👥' },
  { href: '/admin/resultados', label: 'Resultados', icon: '⚽' },
  { href: '/admin/eliminatorias', label: 'Eliminatorias', icon: '🏆' },
  { href: '/admin/viernes', label: 'Viernes de Qué', icon: '🎉' },
]

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex">
      <aside className="w-64 hidden md:flex flex-col border-r border-white/10 p-4 gap-1 shrink-0">
        <h2 className="font-bold text-lg mb-4 px-3">Admin Prode 2026</h2>
        {navItems.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-white/10'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="md:hidden sticky top-0 z-30 bg-zinc-950/80 backdrop-blur-md border-b border-white/10 px-4 py-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {navItems.map((item) => {
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    active ? 'bg-blue-600 text-white' : 'bg-white/10 text-gray-400'
                  }`}
                >
                  {item.icon} {item.label}
                </Link>
              )
            })}
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'

export function FeDeErratas() {
  const [visible, setVisible] = useState(true)

  if (!visible) return null

  return (
    <section className="animate-rise mb-5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3" style={{ animationDelay: '50ms' }}>
      <div className="flex items-center gap-3">
        <span className="text-lg shrink-0">📢</span>
        <p className="flex-1 text-amber-200 text-xs sm:text-sm leading-relaxed">
          <strong className="text-amber-100">Fe de erratas:</strong> por un error técnico, los partidos de Costa de Marfil, México e Inglaterra se dan por acertados. <em className="text-amber-300/70">Silvia agotó sus tickets de reclamos.</em>
        </p>
        <button
          onClick={() => setVisible(false)}
          className="text-amber-400/60 hover:text-amber-300 text-base shrink-0 px-1"
        >
          ×
        </button>
      </div>
    </section>
  )
}

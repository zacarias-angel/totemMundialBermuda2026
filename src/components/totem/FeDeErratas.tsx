'use client'

import { useState } from 'react'

export function FeDeErratas() {
  const [visible, setVisible] = useState(true)

  if (!visible) return null

  return (
    <section className="animate-rise mb-5 rounded-2xl border border-amber-500/30 bg-amber-500/[0.06] p-4" style={{ animationDelay: '30ms' }}>
      <div className="flex items-start gap-3">
        <span className="text-2xl shrink-0 mt-0.5">📢</span>
        <div className="flex-1 min-w-0">
          <p className="text-amber-300 text-xs font-semibold uppercase tracking-[0.14em] mb-1">
            Fe de Erratas
          </p>
          <p className="text-amber-200/80 text-sm leading-snug">
            Por un error en las fechas de estos partidos se le da por acertados.{' '}
            <strong className="text-amber-100">Silvia ya no puede reclamar más nada.</strong>
          </p>
        </div>
        <button
          onClick={() => setVisible(false)}
          className="text-amber-400/60 hover:text-amber-300 text-lg shrink-0 leading-none mt-1"
        >
          ×
        </button>
      </div>
    </section>
  )
}

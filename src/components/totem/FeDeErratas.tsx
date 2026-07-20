'use client'

import { useState } from 'react'

export function FeDeErratas() {
  const [visible, setVisible] = useState(true)

  if (!visible) return null

  return (
    <section className="animate-rise mb-5 rounded-xl border border-yellow-400/50 bg-yellow-400/10 px-4 py-3" style={{ animationDelay: '50ms' }}>
      <div className="flex items-center gap-3">
        <span className="text-lg shrink-0">🏆</span>
        <p className="flex-1 text-yellow-200 text-xs sm:text-sm leading-relaxed font-medium">
          Felicidades a los ganadores
        </p>
        <button
          onClick={() => setVisible(false)}
          className="text-yellow-400/60 hover:text-yellow-300 text-base shrink-0 px-1"
        >
          ×
        </button>
      </div>
    </section>
  )
}

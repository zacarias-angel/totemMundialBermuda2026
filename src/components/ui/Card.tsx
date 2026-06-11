import { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  highlight?: boolean
}

export function Card({ highlight, className = '', children, ...props }: CardProps) {
  return (
    <div
      className={`rounded-2xl p-4 transition-all duration-200 ${
        highlight
          ? 'bg-[var(--accent-soft)] border border-[var(--accent)]/30'
          : 'bg-white/[0.035] border border-white/[0.08]'
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

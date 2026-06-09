import { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  highlight?: boolean
}

export function Card({ highlight, className = '', children, ...props }: CardProps) {
  return (
    <div
      className={`rounded-2xl p-4 ${
        highlight
          ? 'bg-blue-600/20 border border-blue-500/40'
          : 'bg-white/10 border border-white/20'
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

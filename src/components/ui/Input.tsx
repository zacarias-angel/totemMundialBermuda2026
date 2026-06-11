import { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export function Input({ label, className = '', id, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-white/60">
          {label}
        </label>
      )}
      <input
        id={id}
        data-totem-input
        className={`rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white placeholder:text-white/30 outline-none transition-all duration-200 focus:border-[var(--accent)] focus:bg-white/[0.06] focus:ring-2 focus:ring-[var(--accent)]/20 ${className}`}
        {...props}
      />
    </div>
  )
}

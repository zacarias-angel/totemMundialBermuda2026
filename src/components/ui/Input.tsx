import { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export function Input({ label, className = '', id, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-300">
          {label}
        </label>
      )}
      <input
        id={id}
        data-totem-input
        className={`rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-gray-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all ${className}`}
        {...props}
      />
    </div>
  )
}

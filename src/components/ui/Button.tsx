import { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-[var(--accent-strong)] text-white shadow-lg shadow-[var(--accent-strong)]/25 hover:bg-[var(--accent)] active:bg-[var(--accent-strong)]',
  secondary:
    'bg-white/[0.06] text-white border border-white/10 hover:bg-white/[0.1] hover:border-white/20',
  ghost: 'bg-transparent text-white/65 hover:bg-white/[0.06] hover:text-white',
  danger: 'bg-red-500/90 text-white shadow-lg shadow-red-500/20 hover:bg-red-500',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3.5 py-1.5 text-sm',
  md: 'px-5 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`rounded-xl font-medium tracking-tight transition-all duration-200 touch-manipulation active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

import { type ReactNode } from 'react'
import { motion } from 'framer-motion'

interface GameButtonProps {
  variant?: 'gold' | 'secondary' | 'danger' | 'dark'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  icon?: ReactNode
  className?: string
  fullWidth?: boolean
}

export default function GameButton({
  variant = 'gold',
  size = 'md',
  children,
  onClick,
  disabled = false,
  loading = false,
  icon,
  className = '',
  fullWidth = false,
}: GameButtonProps) {
  const sizeClasses = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  }

  const variantStyles = {
    gold: {
      background: 'var(--gradient-gold)',
      color: 'var(--bg-dark)',
      boxShadow: '0 4px 16px rgba(212,168,48,0.3)',
    },
    secondary: {
      background: 'var(--gradient-dark-panel)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-subtle)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
    },
    danger: {
      background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
      color: '#FFFFFF',
      boxShadow: '0 4px 16px rgba(220,38,38,0.3)',
    },
    dark: {
      background: 'var(--bg-card)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-subtle)',
      boxShadow: 'none',
    },
  }

  const isDisabled = disabled || loading

  return (
    <motion.button
      onClick={onClick}
      disabled={isDisabled}
      whileHover={isDisabled ? {} : { y: -2 }}
      whileTap={isDisabled ? {} : { scale: 0.97 }}
      className={`
        relative inline-flex items-center justify-center gap-2 font-semibold
        rounded-md-game overflow-hidden transition-all duration-fast
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${isDisabled ? 'opacity-40 grayscale cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      style={variantStyles[variant]}
    >
      {/* Gold shine sweep on hover */}
      {variant === 'gold' && !isDisabled && (
        <span className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
            backgroundSize: '200% 100%',
            animation: 'gold-shine 3s linear infinite',
          }}
        />
      )}

      {loading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {!loading && icon}
      <span className="relative z-10">{children}</span>
    </motion.button>
  )
}

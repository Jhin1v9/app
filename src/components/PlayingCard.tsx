import { memo } from 'react'
import { motion } from 'framer-motion'
import { SUIT_SYMBOLS, SUIT_COLORS } from '@/lib/gameUtils'
import type { Suit, SpanishSuit, PokerRank, TrucoRank } from '@/lib/gameUtils'

type CardSize = 'sm' | 'md' | 'lg'

interface PlayingCardProps {
  suit?: Suit | SpanishSuit
  rank?: PokerRank | TrucoRank | string
  faceDown?: boolean
  selected?: boolean
  disabled?: boolean
  onClick?: () => void
  size?: CardSize
  animate?: boolean
  className?: string
}

const sizeMap: Record<CardSize, { width: string; height: string; fontSize: string }> = {
  sm: { width: 'clamp(35px, 8vw, 50px)', fontSize: '10px', height: 'auto' },
  md: { width: 'clamp(50px, 12vw, 90px)', fontSize: '14px', height: 'auto' },
  lg: { width: 'clamp(70px, 16vw, 120px)', fontSize: '20px', height: 'auto' },
}

function PlayingCardComponent({
  suit = 'spades',
  rank = 'A',
  faceDown = false,
  selected = false,
  disabled = false,
  onClick,
  size = 'md',
  animate = true,
  className = '',
}: PlayingCardProps) {
  const { width } = sizeMap[size]
  const suitSymbol = SUIT_SYMBOLS[suit] || ''
  const suitColor = SUIT_COLORS[suit] || '#1A1A1A'

  const cardContent = faceDown ? (
    // Card back design
    <div
      className="w-full h-full rounded-card overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #072A1F 0%, #0B3D2E 50%, #072A1F 100%)',
      }}
    >
      <img
        src="/card-back.png"
        alt="Card back"
        className="w-full h-full object-cover"
        draggable={false}
      />
    </div>
  ) : (
    // Card face
    <div className="w-full h-full flex flex-col justify-between p-[8%] rounded-card bg-white select-none">
      {/* Top-left rank and suit */}
      <div className="flex flex-col items-start leading-none" style={{ color: suitColor }}>
        <span className="font-bold" style={{ fontSize: `clamp(10px, 2.5vw, 16px)` }}>{rank}</span>
        <span style={{ fontSize: `clamp(8px, 2vw, 12px)` }}>{suitSymbol}</span>
      </div>

      {/* Center suit */}
      <div className="flex-1 flex items-center justify-center">
        <span style={{ fontSize: `clamp(16px, 5vw, 36px)`, color: suitColor, lineHeight: 1 }}>
          {suitSymbol}
        </span>
      </div>

      {/* Bottom-right rank and suit (inverted) */}
      <div className="flex flex-col items-end leading-none rotate-180" style={{ color: suitColor }}>
        <span className="font-bold" style={{ fontSize: `clamp(10px, 2.5vw, 16px)` }}>{rank}</span>
        <span style={{ fontSize: `clamp(8px, 2vw, 12px)` }}>{suitSymbol}</span>
      </div>
    </div>
  )

  const aspectStyle = { aspectRatio: '2/3' as const }

  if (animate) {
    return (
      <motion.div
        onClick={disabled ? undefined : onClick}
        className={`
          relative cursor-pointer no-select gpu-transform
          ${selected ? 'ring-2 ring-gold rounded-card shadow-gold-lg' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${className}
        `}
        style={{ width, ...aspectStyle }}
        initial={false}
        animate={{
          y: selected ? -20 : 0,
          rotateY: faceDown ? 180 : 0,
        }}
        whileHover={disabled ? {} : { y: selected ? -24 : -12 }}
        whileTap={disabled ? {} : { scale: 0.95 }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 25,
        }}
      >
        <div className="w-full h-full rounded-card shadow-card" style={{ transformStyle: 'preserve-3d' }}>
          {cardContent}
        </div>
      </motion.div>
    )
  }

  return (
    <div
      onClick={disabled ? undefined : onClick}
      className={`
        relative cursor-pointer no-select gpu-transform
        ${selected ? 'ring-2 ring-gold rounded-card shadow-gold-lg' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      style={{
        width,
        ...aspectStyle,
        transform: selected ? 'translateY(-20px)' : undefined,
        transition: 'transform 200ms var(--ease-out), box-shadow 200ms var(--ease-out)',
      }}
    >
      <div className="w-full h-full rounded-card shadow-card">
        {cardContent}
      </div>
    </div>
  )
}

export default memo(PlayingCardComponent)

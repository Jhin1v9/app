// ===== PotDisplay Component =====
// Animated pot display with chip stack visual

import { memo } from 'react'
import { motion } from 'framer-motion'
import type { SidePot } from '@/engine/pokerEngine'
import { formatCoins } from '@/lib/gameUtils'

interface PotDisplayProps {
  mainPot: number
  sidePots: SidePot[]
  currentBet: number
}

function PotDisplayComponent({ mainPot, sidePots, currentBet }: PotDisplayProps) {
  const totalPot = mainPot + sidePots.reduce((sum, sp) => sum + sp.amount, 0)

  // Calculate visible chip stacks based on pot size
  const chipStacks = getChipStacks(totalPot)

  return (
    <div className="flex flex-col items-center gap-1">
      {/* Chip stack visual */}
      <div className="relative flex items-end justify-center h-8 sm:h-10 gap-0.5">
        {chipStacks.map((stack, i) => (
          <motion.div
            key={i}
            className="flex flex-col-reverse items-center"
            initial={{ scale: 0, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{
              type: 'spring',
              stiffness: 500,
              damping: 20,
              delay: i * 0.05,
            }}
          >
            {Array.from({ length: Math.min(stack.count, 6) }).map((_, j) => (
              <div
                key={j}
                className="w-5 h-1.5 sm:w-6 sm:h-2 rounded-full border border-white/20 -mt-0.5 first:mt-0"
                style={{
                  background: stack.color,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.1)',
                }}
              />
            ))}
          </motion.div>
        ))}

        {/* Glow effect for large pots */}
        {totalPot > 500 && (
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{
              boxShadow: [
                '0 0 10px rgba(212,168,48,0.1)',
                '0 0 25px rgba(212,168,48,0.3)',
                '0 0 10px rgba(212,168,48,0.1)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </div>

      {/* Pot amount */}
      <motion.div
        className="flex flex-col items-center"
        key={totalPot}
        initial={{ scale: 1.2 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      >
        <span className="text-[10px] sm:text-xs text-text-secondary uppercase tracking-wider font-medium">
          {sidePots.length > 0 ? 'POT TOTAL' : 'POT'}
        </span>
        <span className="text-sm sm:text-base font-bold font-mono-game text-gold tabular-nums">
          {formatCoins(totalPot)}
        </span>
      </motion.div>

      {/* Current bet */}
      {currentBet > 0 && (
        <span className="text-[10px] text-text-secondary/60">
          Aposta: {formatCoins(currentBet)}
        </span>
      )}

      {/* Side pots */}
      {sidePots.map((sp, i) => (
        <span key={i} className="text-[9px] sm:text-[10px] text-text-secondary/50">
          Side Pot {i + 1}: {formatCoins(sp.amount)}
        </span>
      ))}
    </div>
  )
}

/**
 * Break down pot amount into chip denominations for visual
 */
function getChipStacks(total: number): { color: string; count: number }[] {
  if (total <= 0) return []

  const denominations = [
    { value: 1000, color: '#D4A830' }, // yellow/gold
    { value: 500, color: '#7B1F3C' },  // purple/burgundy
    { value: 100, color: '#1A1A1A' },  // black
    { value: 25, color: '#059669' },   // green
    { value: 10, color: '#2563EB' },   // blue
    { value: 5, color: '#DC2626' },    // red
    { value: 1, color: '#F5F5F5' },    // white
  ]

  let remaining = total
  const stacks: { color: string; count: number }[] = []

  for (const denom of denominations) {
    const count = Math.floor(remaining / denom.value)
    if (count > 0) {
      stacks.push({ color: denom.color, count: Math.min(count, 8) })
      remaining -= count * denom.value
    }
    if (remaining <= 0) break
  }

  // Limit to 5 visible stacks
  return stacks.slice(0, 5)
}

export default memo(PotDisplayComponent)

// ===== PlayerSeat Component =====
// Displays a player at the table with avatar, cards, chips, status

import { memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Player as PokerPlayer } from '@/engine/pokerEngine'
import { formatCoins } from '@/lib/gameUtils'
import PlayingCard from '@/components/PlayingCard'

interface PlayerSeatProps {
  player: PokerPlayer
  isActive: boolean
  showdownRevealed: boolean
  position: 'bottom' | 'top' | 'left' | 'right' | 'topLeft' | 'topRight'
}

const positionClasses: Record<string, string> = {
  bottom: 'flex-col items-center',
  top: 'flex-col items-center',
  left: 'flex-row-reverse items-center gap-2',
  right: 'flex-row items-center gap-2',
  topLeft: 'flex-row-reverse items-center gap-2',
  topRight: 'flex-row items-center gap-2',
}

const cardContainerClasses: Record<string, string> = {
  bottom: 'flex-row gap-1',
  top: 'flex-row gap-1',
  left: 'flex-row gap-1',
  right: 'flex-row gap-1',
  topLeft: 'flex-row gap-1',
  topRight: 'flex-row gap-1',
}

function PlayerSeatComponent({
  player,
  isActive,
  showdownRevealed,
  position,
}: PlayerSeatProps) {
  const isFolded = player.status === 'FOLDED'
  const isAllIn = player.status === 'ALL_IN'
  const isEliminated = player.status === 'ELIMINATED'
  const showCardsFaceUp = player.isHuman || showdownRevealed

  return (
    <motion.div
      className={`flex ${positionClasses[position]} relative`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: isEliminated ? 0.3 : 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {/* Active turn indicator ring */}
      {isActive && !isFolded && !isEliminated && (
        <motion.div
          className="absolute -inset-2 rounded-full border-2 border-gold"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{ duration: 1.2, repeat: Infinity }}
          style={{ zIndex: 0 }}
        />
      )}

      {/* Player info (avatar + name + chips) */}
      <div className="flex flex-col items-center relative z-10">
        {/* Avatar */}
        <div
          className={`
            relative w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center
            font-bold text-sm sm:text-base select-none
            ${isEliminated ? 'bg-gray-800 text-gray-600' : ''}
            ${isFolded ? 'bg-bg-card/60 text-text-secondary/60' : ''}
            ${!isFolded && !isEliminated ? 'bg-gradient-to-br from-felt-green-light to-felt-green text-text-primary' : ''}
            ${isAllIn ? 'ring-2 ring-ruby shadow-[0_0_12px_rgba(220,38,38,0.5)]' : ''}
            ${isActive && !isFolded ? 'ring-2 ring-gold' : ''}
            border-2 border-border-subtle/60
          `}
        >
          {isEliminated ? (
            <span className="text-xs">X</span>
          ) : (
            <span className="text-xs sm:text-sm">
              {player.name.charAt(0).toUpperCase()}
            </span>
          )}

          {/* Dealer button */}
          {player.isDealer && (
            <span
              className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-white text-bg-dark text-[9px] sm:text-[10px] font-bold rounded-full flex items-center justify-center border border-bg-dark"
            >
              D
            </span>
          )}

          {/* Small blind indicator */}
          {player.isSmallBlind && !player.isDealer && (
            <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-blue-500 text-white text-[8px] sm:text-[9px] font-bold rounded-full flex items-center justify-center">
              SB
            </span>
          )}

          {/* Big blind indicator */}
          {player.isBigBlind && (
            <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-ruby text-white text-[8px] sm:text-[9px] font-bold rounded-full flex items-center justify-center">
              BB
            </span>
          )}
        </div>

        {/* Name */}
        <span
          className={`text-[10px] sm:text-xs font-medium mt-1 max-w-[60px] sm:max-w-[80px] truncate text-center
            ${isFolded ? 'text-text-secondary/40 line-through' : 'text-text-primary'}
            ${isAllIn ? 'text-ruby' : ''}
          `}
        >
          {player.name}
        </span>

        {/* Chip count */}
        <span
          className={`text-[10px] sm:text-xs font-mono-game tabular-nums
            ${isEliminated ? 'text-text-secondary/30' : 'text-gold'}
            ${player.chips === 0 && !isEliminated ? 'text-ruby' : ''}
          `}
        >
          {isEliminated ? '0' : formatCoins(player.chips)}
        </span>

        {/* Current bet */}
        {player.currentBet > 0 && !isFolded && (
          <motion.span
            className="text-[9px] sm:text-[10px] text-text-secondary bg-bg-elevated/80 px-1.5 py-0.5 rounded-full mt-0.5"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
          >
            {formatCoins(player.currentBet)}
          </motion.span>
        )}

        {/* Status labels */}
        <AnimatePresence>
          {isAllIn && (
            <motion.span
              className="text-[9px] text-ruby font-bold uppercase tracking-wider mt-0.5"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              ALL-IN
            </motion.span>
          )}
          {isFolded && (
            <motion.span
              className="text-[9px] text-text-secondary/60 uppercase tracking-wider mt-0.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              FOLD
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Hole cards */}
      {!isEliminated && player.holeCards.length > 0 && (
        <div className={`flex ${cardContainerClasses[position]} relative z-10`}>
          {player.holeCards.map((card, i) => (
            <motion.div
              key={`${player.id}-card-${i}`}
              initial={{ rotateY: 180, x: 0, y: 0 }}
              animate={{
                rotateY: showCardsFaceUp ? 0 : 180,
                x: 0,
                y: 0,
                rotate: isFolded ? (i === 0 ? -15 : 15) : 0,
                opacity: isFolded ? 0.5 : 1,
              }}
              transition={{
                rotateY: { duration: 0.4, delay: i * 0.1, ease: [0.65, 0, 0.35, 1] as [number, number, number, number] },
                rotate: { duration: 0.3 },
                opacity: { duration: 0.3 },
              }}
            >
              <PlayingCard
                suit={card.suit}
                rank={card.rank}
                faceDown={!showCardsFaceUp}
                size="sm"
                animate={false}
                disabled={isFolded}
              />
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

export default memo(PlayerSeatComponent)

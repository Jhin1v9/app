// ===== CommunityCards Component =====
// Displays 5 community cards with flip animation

import { memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { PokerCard } from '@/lib/gameUtils'
import PlayingCard from '@/components/PlayingCard'

interface CommunityCardsProps {
  cards: PokerCard[]
  phase: string
  highlighted?: boolean
}

const cardPositions = [0, 1, 2, 3, 4] // 5 positions: 3 flop + 1 turn + 1 river

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
}

const cardVariants = {
  hidden: { rotateY: 180, scale: 0.5, opacity: 0 },
  show: {
    rotateY: 0,
    scale: 1,
    opacity: 1,
    transition: { duration: 0.4, ease: [0.65, 0, 0.35, 1] as [number, number, number, number] },
  },
}

function CommunityCardsComponent({ cards, phase, highlighted = false }: CommunityCardsProps) {
  const cardsRevealed =
    phase === 'FLOP' ? 3
      : phase === 'TURN' ? 4
        : phase === 'RIVER' ? 5
          : phase === 'SHOWDOWN' || phase === 'HAND_END' ? 5
            : 0

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Cards row */}
      <motion.div
        className="flex items-center gap-1 sm:gap-1.5"
        variants={containerVariants}
        initial="hidden"
        animate="show"
        key={`community-${phase}-${cards.length}`}
      >
        {cardPositions.map(pos => {
          const card = cards[pos]
          const isRevealed = pos < cardsRevealed && card !== undefined

          return (
            <AnimatePresence key={pos} mode="wait">
              {isRevealed && card ? (
                <motion.div
                  key={`card-${pos}-${card.rank}-${card.suit}`}
                  variants={cardVariants}
                  initial="hidden"
                  animate="show"
                  className={highlighted ? 'ring-2 ring-gold rounded-card shadow-gold' : ''}
                >
                  <PlayingCard
                    suit={card.suit}
                    rank={card.rank}
                    faceDown={false}
                    size="sm"
                    animate={false}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key={`placeholder-${pos}`}
                  className="w-[clamp(35px,8vw,50px)] aspect-[2/3] rounded-card border border-dashed border-border-subtle/40 bg-black/20 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="text-text-secondary/20 text-[10px]">
                    {pos < 3 ? 'F' : pos === 3 ? 'T' : 'R'}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          )
        })}
      </motion.div>
    </div>
  )
}

export default memo(CommunityCardsComponent)

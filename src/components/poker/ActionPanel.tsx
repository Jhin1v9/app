// ===== ActionPanel Component =====
// Player action buttons with bet slider

import { useState, useCallback, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { PlayerAction } from '@/engine/pokerEngine'
import { formatCoins } from '@/lib/gameUtils'
import { ACTION_NAMES_PT } from '@/engine/pokerEngine'

interface ValidAction {
  action: PlayerAction
  enabled: boolean
  amount?: number
}

interface ActionPanelProps {
  validActions: ValidAction[]
  handStrength: string
  potSize: number
  playerChips: number
  currentBet: number
  onAction: (action: PlayerAction, amount?: number) => void
  isVisible: boolean
}

const panelVariants = {
  hidden: { y: 30, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
  exit: {
    y: 20,
    opacity: 0,
    transition: { duration: 0.15 },
  },
}

const buttonVariants = {
  tap: { scale: 0.95, transition: { duration: 0.08 } },
  hover: { scale: 1.02, transition: { duration: 0.15 } },
}

function ActionPanelComponent({
  validActions,
  handStrength,
  potSize,
  playerChips,
  currentBet,
  onAction,
  isVisible,
}: ActionPanelProps) {
  const [showBetSlider, setShowBetSlider] = useState(false)
  const [betAmount, setBetAmount] = useState(0)
  const [pendingAction, setPendingAction] = useState<PlayerAction | null>(null)

  const canFold = validActions.find(a => a.action === 'FOLD')?.enabled ?? false
  const canCheck = validActions.find(a => a.action === 'CHECK')?.enabled ?? false
  const canCall = validActions.find(a => a.action === 'CALL')?.enabled ?? false
  const callAmount = validActions.find(a => a.action === 'CALL')?.amount || 0
  const canBet = validActions.find(a => a.action === 'BET')?.enabled ?? false
  const canRaise = validActions.find(a => a.action === 'RAISE')?.enabled ?? false
  const canAllIn = validActions.find(a => a.action === 'ALL_IN')?.enabled ?? false
  const minRaiseAmount = validActions.find(a => a.action === 'RAISE')?.amount || 0

  const minBet = currentBet > 0 ? minRaiseAmount : Math.max(20, currentBet)

  const handleBetClick = useCallback(() => {
    setPendingAction(canBet ? 'BET' : 'RAISE')
    setBetAmount(minBet)
    setShowBetSlider(true)
  }, [canBet, minBet])

  const handleConfirmBet = useCallback(() => {
    if (pendingAction) {
      onAction(pendingAction, betAmount)
      setShowBetSlider(false)
      setPendingAction(null)
    }
  }, [pendingAction, betAmount, onAction])

  const handleCancelBet = useCallback(() => {
    setShowBetSlider(false)
    setPendingAction(null)
  }, [])

  const handleQuickBet = useCallback(
    (fraction: number) => {
      const amount = Math.floor(potSize * fraction)
      const clamped = Math.max(minBet, Math.min(amount, playerChips))
      setBetAmount(clamped)
    },
    [potSize, minBet, playerChips],
  )

  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setBetAmount(Number(e.target.value))
    },
    [],
  )

  if (!isVisible) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="w-full max-w-xl mx-auto"
          variants={panelVariants}
          initial="hidden"
          animate="show"
          exit="exit"
        >
          {/* Hand strength indicator */}
          {handStrength && (
            <div className="text-center mb-2">
              <span className="text-xs sm:text-sm text-gold font-medium bg-bg-elevated/80 px-3 py-1 rounded-full">
                {handStrength}
              </span>
            </div>
          )}

          {/* Bet slider panel */}
          <AnimatePresence>
            {showBetSlider && (
              <motion.div
                className="bg-bg-elevated/95 backdrop-blur-sm border border-border-subtle rounded-lg-game p-3 mb-2"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* Bet amount display */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-text-secondary">Valor da aposta</span>
                  <span className="text-lg font-bold font-mono-game text-gold">
                    {formatCoins(betAmount)}
                  </span>
                </div>

                {/* Slider */}
                <input
                  type="range"
                  min={minBet}
                  max={playerChips}
                  value={betAmount}
                  onChange={handleSliderChange}
                  className="w-full h-2 bg-border-subtle rounded-full appearance-none cursor-pointer accent-gold mb-2"
                />

                {/* Quick bet buttons */}
                <div className="flex gap-1.5 mb-2">
                  {[
                    { label: 'Min', value: minBet },
                    { label: '1/2 POT', fraction: 0.5 },
                    { label: 'POT', fraction: 1 },
                    { label: 'All-in', value: playerChips },
                  ].map(btn => (
                    <button
                      key={btn.label}
                      onClick={() =>
                        btn.fraction !== undefined
                          ? handleQuickBet(btn.fraction)
                          : setBetAmount(btn.value || minBet)
                      }
                      className="flex-1 py-1.5 px-1 text-[10px] sm:text-xs font-medium rounded bg-bg-card border border-border-subtle text-text-secondary hover:border-gold hover:text-gold transition-colors"
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>

                {/* Confirm/Cancel */}
                <div className="flex gap-2">
                  <button
                    onClick={handleCancelBet}
                    className="flex-1 py-2 rounded bg-bg-card border border-border-subtle text-text-secondary text-xs font-medium hover:bg-bg-card-hover transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirmBet}
                    className="flex-1 py-2 rounded bg-gold text-bg-dark text-xs font-bold hover:bg-gold-light transition-colors"
                  >
                    Confirmar
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main action buttons */}
          {!showBetSlider && (
            <div className="flex gap-1.5 sm:gap-2 items-center justify-center">
              {/* Fold - red */}
              {canFold && (
                <motion.button
                  variants={buttonVariants}
                  whileTap="tap"
                  whileHover="hover"
                  onClick={() => onAction('FOLD')}
                  className="px-3 sm:px-5 py-2.5 sm:py-3 rounded-lg bg-ruby-dark border border-ruby text-white text-xs sm:text-sm font-semibold hover:bg-ruby transition-colors shadow-md min-w-[70px] sm:min-w-[90px]"
                >
                  {ACTION_NAMES_PT.FOLD}
                </motion.button>
              )}

              {/* Check - blue/gray */}
              {canCheck && (
                <motion.button
                  variants={buttonVariants}
                  whileTap="tap"
                  whileHover="hover"
                  onClick={() => onAction('CHECK')}
                  className="px-3 sm:px-5 py-2.5 sm:py-3 rounded-lg bg-bg-card border border-emerald text-emerald text-xs sm:text-sm font-semibold hover:border-emerald hover:bg-bg-card-hover transition-colors shadow-md min-w-[70px] sm:min-w-[90px]"
                >
                  {ACTION_NAMES_PT.CHECK}
                </motion.button>
              )}

              {/* Call - blue */}
              {canCall && (
                <motion.button
                  variants={buttonVariants}
                  whileTap="tap"
                  whileHover="hover"
                  onClick={() => onAction('CALL')}
                  className="px-3 sm:px-5 py-2.5 sm:py-3 rounded-lg bg-bg-card border border-emerald text-emerald text-xs sm:text-sm font-semibold hover:border-emerald hover:bg-bg-card-hover transition-colors shadow-md min-w-[70px] sm:min-w-[90px]"
                >
                  <span>{ACTION_NAMES_PT.CALL}</span>
                  <span className="block text-[10px] text-emerald/80">
                    {formatCoins(callAmount)}
                  </span>
                </motion.button>
              )}

              {/* Bet - gold */}
              {canBet && (
                <motion.button
                  variants={buttonVariants}
                  whileTap="tap"
                  whileHover="hover"
                  onClick={handleBetClick}
                  className="px-3 sm:px-5 py-2.5 sm:py-3 rounded-lg bg-gold-dark border border-gold text-bg-dark text-xs sm:text-sm font-bold hover:bg-gold transition-colors shadow-md min-w-[70px] sm:min-w-[90px]"
                >
                  {ACTION_NAMES_PT.BET}
                </motion.button>
              )}

              {/* Raise - gold */}
              {canRaise && (
                <motion.button
                  variants={buttonVariants}
                  whileTap="tap"
                  whileHover="hover"
                  onClick={handleBetClick}
                  className="px-3 sm:px-5 py-2.5 sm:py-3 rounded-lg bg-gold border border-gold-light text-bg-dark text-xs sm:text-sm font-bold hover:bg-gold-light transition-colors shadow-md min-w-[70px] sm:min-w-[90px]"
                >
                  {ACTION_NAMES_PT.RAISE}
                </motion.button>
              )}

              {/* All-in - dramatic red/gold */}
              {canAllIn && (
                <motion.button
                  variants={buttonVariants}
                  whileTap="tap"
                  whileHover="hover"
                  onClick={() => onAction('ALL_IN')}
                  className="px-2 sm:px-4 py-2.5 sm:py-3 rounded-lg text-white text-xs sm:text-sm font-bold shadow-md min-w-[60px] sm:min-w-[80px]"
                  style={{
                    background: 'linear-gradient(135deg, #DC2626 0%, #D4A830 100%)',
                    backgroundSize: '200% 200%',
                  }}
                >
                  <span className="drop-shadow-sm">{ACTION_NAMES_PT.ALL_IN}</span>
                </motion.button>
              )}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default memo(ActionPanelComponent)

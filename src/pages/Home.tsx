import { useState, useEffect, useCallback, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play, UserPlus, HelpCircle, Settings,
  ShoppingBag, Sparkles, X, ChevronRight
} from 'lucide-react'
import { useGameStore } from '@/store/gameStore'
import GameButton from '@/components/GameButton'
import { formatCoins } from '@/lib/gameUtils'
import { ease_out, ease_spring } from '@/lib/easing'

// ===== Floating Card Particle (isolated for perf) =====
const FloatingCard = memo(function FloatingCard({
  index,
}: {
  index: number
}) {
  const suits = ['\u2660', '\u2665', '\u2666', '\u2663']
  const suit = suits[index % 4]
  const size = 20 + (index % 5) * 10 // 20-60px
  const left = (index * 7) % 100 // spread across
  const duration = 20 + (index % 4) * 8 // 20-44s
  const delay = index * 0.5 // stagger

  return (
    <div
      className="fixed pointer-events-none select-none"
      style={{
        left: `${left}%`,
        bottom: '-80px',
        fontSize: `${size}px`,
        color: 'rgba(212,168,48,0.08)',
        animation: `particle-float ${duration}s linear ${delay}s infinite`,
        zIndex: 1,
      }}
    >
      {suit}
    </div>
  )
})

// ===== Daily Reward Modal =====
function DailyRewardModal({ onClose }: { onClose: () => void }) {
  const { dailyReward, claimDailyReward } = useGameStore()
  const rewards = [1000, 2000, 3000, 5000, 10000, 15000, 25000]
  const diamondRewards = [0, 0, 0, 0, 10, 0, 50]
  const dayIndex = Math.min(dailyReward.dayOfWeek - 1, 6)
  const coinReward = rewards[dayIndex]
  const diamondReward = diamondRewards[dayIndex]

  return (
    <motion.div
      className="modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      <motion.div
        className="relative w-[min(420px,calc(100vw-32px))] rounded-xl-game overflow-hidden"
        style={{
          background: 'var(--gradient-modal)',
          border: '2px solid var(--border-gold)',
          boxShadow: '0 0 40px rgba(212,168,48,0.3)',
        }}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.4, ease: ease_spring }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full text-text-secondary hover:text-white hover:bg-white/10 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="p-6 text-center">
          {/* Header */}
          <h2 className="font-display text-2xl font-bold text-gold mb-1">
            Recompensa Diaria
          </h2>
          <p className="text-text-secondary text-sm mb-6">
            Dia {dailyReward.dayOfWeek} de 7
          </p>

          {/* Coin animation */}
          <motion.div
            className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #D4A830, #F0C94A)',
              boxShadow: '0 0 30px rgba(212,168,48,0.4)',
            }}
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: ease_spring }}
          >
            <Sparkles size={36} className="text-bg-dark" />
          </motion.div>

          {/* Reward amount */}
          <p className="font-mono-game text-3xl font-bold text-gold mb-1">
            +{formatCoins(coinReward)} Moedas
          </p>
          {diamondReward > 0 && (
            <p className="font-mono-game text-lg font-bold text-blue-400 mb-4">
              +{diamondReward} Diamantes
            </p>
          )}

          {/* Streak indicator */}
          <div className="flex items-center justify-center gap-2 mb-6 mt-4">
            {Array.from({ length: 7 }, (_, i) => (
              <div
                key={i}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                  i < dailyReward.dayOfWeek - 1
                    ? 'bg-gold border-gold'
                    : i === dailyReward.dayOfWeek - 1
                    ? 'bg-transparent border-gold animate-pulse-gold'
                    : 'bg-transparent border-border-subtle'
                }`}
              >
                {i < dailyReward.dayOfWeek - 1 && (
                  <span className="text-[8px] font-bold text-bg-dark">{i + 1}</span>
                )}
                {i === dailyReward.dayOfWeek - 1 && (
                  <span className="text-[8px] font-bold text-gold">{i + 1}</span>
                )}
              </div>
            ))}
          </div>
          <p className="text-text-secondary text-xs mb-6">
            Volte amanha para mais!
          </p>

          {/* Claim button */}
          <GameButton variant="gold" size="lg" fullWidth onClick={claimDailyReward}>
            Coletar
          </GameButton>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ===== Guest Play Modal =====
function GuestModal({ onClose, onPlay }: { onClose: () => void; onPlay: (name: string) => void }) {
  const [name, setName] = useState('')

  return (
    <motion.div
      className="modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      <motion.div
        className="relative w-[min(360px,calc(100vw-32px))] rounded-xl-game p-6"
        style={{
          background: 'var(--gradient-modal)',
          border: '1px solid var(--border-subtle)',
        }}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.4, ease: ease_spring }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display text-xl font-bold text-gold mb-2 text-center">
          Jogar como Convidado
        </h2>
        <p className="text-text-secondary text-sm text-center mb-4">
          Digite seu nome para comecar a jogar imediatamente.
        </p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Seu nome"
          maxLength={16}
          className="w-full px-4 py-3 rounded-md-game bg-bg-dark border border-border-subtle text-text-primary placeholder-text-secondary focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/30 transition-all mb-4"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && name.trim()) {
              onPlay(name.trim())
            }
          }}
        />
        <div className="flex gap-3">
          <GameButton variant="dark" size="md" className="flex-1" onClick={onClose}>
            Cancelar
          </GameButton>
          <GameButton
            variant="gold"
            size="md"
            className="flex-1"
            onClick={() => name.trim() && onPlay(name.trim())}
            disabled={!name.trim()}
          >
            Jogar
          </GameButton>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ===== Main Home Component =====
export default function Home() {
  const navigate = useNavigate()
  const { isLoggedIn, isGuest, player, showDailyReward, guestLogin, dismissDailyReward } = useGameStore()
  const [showGuestModal, setShowGuestModal] = useState(false)
  const [showDailyModal, setShowDailyModal] = useState(false)

  const isAuth = isLoggedIn || isGuest

  // Show daily reward modal when flagged
  useEffect(() => {
    if (showDailyReward) {
      const timer = setTimeout(() => setShowDailyModal(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [showDailyReward])

  // Auto-dismiss daily modal after 5s if not interacted
  useEffect(() => {
    if (!showDailyModal) return
    const timer = setTimeout(() => {
      setShowDailyModal(false)
      dismissDailyReward()
    }, 5000)
    return () => clearTimeout(timer)
  }, [showDailyModal, dismissDailyReward])

  const handleGuestPlay = useCallback((name: string) => {
    guestLogin(name)
    setShowGuestModal(false)
    navigate('/lobby')
  }, [guestLogin, navigate])

  const handlePlayNow = useCallback(() => {
    if (isAuth) {
      navigate('/lobby')
    } else {
      setShowGuestModal(true)
    }
  }, [isAuth, navigate])

  // Animation variants
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: ease_out },
    },
  }

  return (
    <div className="relative min-h-[100dvh] overflow-hidden flex flex-col">
      {/* ===== Animated Background ===== */}
      <div className="absolute inset-0 z-0">
        {/* Dark gradient overlay (CSS fallback for video) */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at 30% 70%, rgba(11,61,46,0.4) 0%, transparent 50%),
              radial-gradient(ellipse at 70% 30%, rgba(212,168,48,0.08) 0%, transparent 50%),
              linear-gradient(180deg, rgba(10,14,26,0.6) 0%, rgba(10,14,26,0.85) 60%, rgba(10,14,26,0.98) 100%)
            `,
          }}
        />
        {/* Subtle animated gradient mesh */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: 'radial-gradient(ellipse at 50% 50%, rgba(11,61,46,0.3) 0%, transparent 70%)',
            animation: 'pulse-gold 8s ease-in-out infinite',
          }}
        />
      </div>

      {/* ===== Floating Particles ===== */}
      {Array.from({ length: 15 }, (_, i) => (
        <FloatingCard key={i} index={i} />
      ))}

      {/* ===== Content ===== */}
      <motion.div
        className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-20"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Logo */}
        <motion.div
          variants={itemVariants}
          className="mb-8"
        >
          <motion.img
            src="/logo-gold.png"
            alt="TRUCO POKER ARENA"
            className="w-[260px] sm:w-[340px] lg:w-[400px] h-auto mx-auto"
            style={{
              filter: 'drop-shadow(0 0 20px rgba(212,168,48,0.3))',
            }}
            animate={{
              filter: [
                'drop-shadow(0 0 20px rgba(212,168,48,0.3))',
                'drop-shadow(0 0 35px rgba(212,168,48,0.5))',
                'drop-shadow(0 0 20px rgba(212,168,48,0.3))',
              ],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>

        {/* Tagline */}
        <motion.p
          variants={itemVariants}
          className="text-text-secondary text-base sm:text-lg text-center mb-10 font-body"
        >
          O melhor jogo de cartas do Brasil
        </motion.p>

        {/* Primary CTA - JOGAR AGORA */}
        <motion.div variants={itemVariants} className="w-full max-w-[320px] mb-4">
          <GameButton
            variant="gold"
            size="lg"
            fullWidth
            onClick={handlePlayNow}
            icon={<Play size={20} />}
          >
            JOGAR AGORA
          </GameButton>
        </motion.div>

        {/* Mode Selection */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-3 w-full max-w-[600px] mb-8"
        >
          {/* Truco Mineiro - MAIN */}
          <motion.button
            className="flex-1 flex items-center gap-3 p-4 rounded-lg text-left transition-all duration-fast group"
            style={{
              background: 'var(--gradient-dark-panel)',
              borderLeft: '4px solid var(--emerald)',
              borderTop: '1px solid var(--border-subtle)',
              borderRight: '1px solid var(--border-subtle)',
              borderBottom: '1px solid var(--border-subtle)',
            }}
            whileHover={{ x: 4, borderColor: 'var(--emerald)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => isAuth ? navigate('/lobby') : setShowGuestModal(true)}
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(16,185,129,0.15)' }}>
              <span className="text-xl" style={{ color: 'var(--emerald)' }}>{'\u2663'}</span>
            </div>
            <div>
              <p className="font-semibold text-text-primary text-sm group-hover:text-emerald transition-colors">
                Truco Mineiro
              </p>
              <p className="text-text-secondary text-xs">Modo Principal</p>
            </div>
            <ChevronRight size={16} className="ml-auto text-text-secondary group-hover:text-emerald transition-colors" />
          </motion.button>

          {/* Truco Paulista */}
          <motion.button
            className="flex-1 flex items-center gap-3 p-4 rounded-lg text-left transition-all duration-fast group"
            style={{
              background: 'var(--gradient-dark-panel)',
              borderLeft: '4px solid var(--ruby)',
              borderTop: '1px solid var(--border-subtle)',
              borderRight: '1px solid var(--border-subtle)',
              borderBottom: '1px solid var(--border-subtle)',
            }}
            whileHover={{ x: 4, borderColor: 'var(--ruby)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => isAuth ? navigate('/lobby') : setShowGuestModal(true)}
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(220,38,38,0.15)' }}>
              <span className="text-xl" style={{ color: 'var(--ruby)' }}>{'\u2665'}</span>
            </div>
            <div>
              <p className="font-semibold text-text-primary text-sm group-hover:text-ruby transition-colors">
                Truco Paulista
              </p>
              <p className="text-text-secondary text-xs">Variacao Classica</p>
            </div>
            <ChevronRight size={16} className="ml-auto text-text-secondary group-hover:text-ruby transition-colors" />
          </motion.button>

          {/* Poker */}
          <motion.button
            className="flex-1 flex items-center gap-3 p-4 rounded-lg text-left transition-all duration-fast group"
            style={{
              background: 'var(--gradient-dark-panel)',
              borderLeft: '4px solid var(--gold)',
              borderTop: '1px solid var(--border-subtle)',
              borderRight: '1px solid var(--border-subtle)',
              borderBottom: '1px solid var(--border-subtle)',
            }}
            whileHover={{ x: 4, borderColor: 'var(--gold)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => isAuth ? navigate('/lobby') : setShowGuestModal(true)}
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(212,168,48,0.15)' }}>
              <div className="w-4 h-4 rounded-full border-2 border-gold" />
            </div>
            <div>
              <p className="font-semibold text-text-primary text-sm group-hover:text-gold transition-colors">
                Poker
              </p>
              <p className="text-text-secondary text-xs">Texas Hold&apos;em</p>
            </div>
            <ChevronRight size={16} className="ml-auto text-text-secondary group-hover:text-gold transition-colors" />
          </motion.button>
        </motion.div>

        {/* Secondary Links */}
        <motion.div
          variants={itemVariants}
          className="flex items-center gap-6 mb-8"
        >
          <button
            onClick={() => navigate('/tutorial')}
            className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-gold transition-colors"
          >
            <HelpCircle size={16} />
            Como Jogar
          </button>
          <button
            onClick={() => navigate('/settings')}
            className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-gold transition-colors"
          >
            <Settings size={16} />
            Configuracoes
          </button>
          <button
            onClick={() => navigate('/store')}
            className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-gold transition-colors"
          >
            <ShoppingBag size={16} />
            Loja
          </button>
        </motion.div>
      </motion.div>

      {/* ===== Bottom Login Bar ===== */}
      <motion.div
        className="relative z-10 w-full"
        style={{
          background: 'rgba(10,14,26,0.85)',
          backdropFilter: 'blur(8px)',
          borderTop: '1px solid var(--border-subtle)',
        }}
        initial={{ y: 60 }}
        animate={{ y: 0 }}
        transition={{ delay: 1, duration: 0.4, ease: ease_out }}
      >
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-center gap-3 flex-wrap">
          {!isAuth ? (
            <>
              <GameButton variant="dark" size="sm" onClick={() => navigate('/auth')}>
                Entrar
              </GameButton>
              <span className="text-text-secondary text-xs">ou</span>
              <GameButton variant="gold" size="sm" onClick={() => navigate('/auth')}>
                <UserPlus size={14} />
                Criar Conta
              </GameButton>
              <button
                onClick={() => setShowGuestModal(true)}
                className="text-text-secondary hover:text-gold text-xs underline transition-colors ml-2"
              >
                Jogar como Convidado
              </button>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center text-bg-dark font-bold text-xs">
                  {player.username.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-text-primary">{player.username}</span>
                {isGuest && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-bg-card text-text-secondary">
                    Convidado
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono-game text-sm text-gold">{formatCoins(player.coins)}</span>
                <span className="font-mono-game text-sm text-blue-400">{player.diamonds}D</span>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* ===== Modals ===== */}
      <AnimatePresence>
        {showDailyModal && (
          <DailyRewardModal onClose={() => { setShowDailyModal(false); dismissDailyReward() }} />
        )}
        {showGuestModal && (
          <GuestModal
            onClose={() => setShowGuestModal(false)}
            onPlay={handleGuestPlay}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

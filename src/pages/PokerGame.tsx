// ===== PokerGame Page =====
// Complete Texas Hold'em Poker game with casino-quality UI

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Trophy,
  Users,
  Zap,
  Coins,
  Play,
  RotateCcw,
} from 'lucide-react'
import { usePokerGame } from '@/hooks/usePokerGame'
import type { GameMode } from '@/engine/pokerEngine'
import type { Difficulty } from '@/engine/pokerAI'
import PokerTable from '@/components/poker/PokerTable'
import ActionPanel from '@/components/poker/ActionPanel'
import { formatCoins } from '@/lib/gameUtils'
import { HAND_RANK_NAMES_PT } from '@/engine/pokerEngine'

// ===== Setup Screen =====
function SetupScreen({
  onStart,
}: {
  onStart: (mode: GameMode, difficulty: Difficulty, botCount: number) => void
}) {
  const [gameMode, setGameMode] = useState<GameMode>('CASH')
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [botCount, setBotCount] = useState(5)
  const navigate = useNavigate()

  const difficulties: { value: Difficulty; label: string; color: string }[] = [
    { value: 'easy', label: 'Facil', color: 'text-emerald' },
    { value: 'medium', label: 'Medio', color: 'text-blue-400' },
    { value: 'hard', label: 'Dificil', color: 'text-orange-400' },
    { value: 'expert', label: 'Expert', color: 'text-ruby' },
  ]

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-4 py-8 bg-bg-dark">
      {/* Header */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-text-secondary hover:text-gold transition-colors mb-4 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-gold mb-2">
          Texas Hold&apos;em
        </h1>
        <p className="text-text-secondary text-sm">Configure sua partida de Poker</p>
      </motion.div>

      {/* Setup panel */}
      <motion.div
        className="game-panel w-full max-w-md p-6 space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {/* Game Mode */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-text-primary mb-3">
            <Coins className="w-4 h-4 text-gold" />
            Modo de Jogo
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setGameMode('CASH')}
              className={`py-3 px-4 rounded-lg border text-sm font-medium transition-all ${
                gameMode === 'CASH'
                  ? 'bg-gold/20 border-gold text-gold'
                  : 'bg-bg-card border-border-subtle text-text-secondary hover:border-gold/50'
              }`}
            >
              <div className="font-semibold">Cash Game</div>
              <div className="text-[10px] opacity-70 mt-1">1.000 fichas</div>
            </button>
            <button
              onClick={() => setGameMode('TOURNAMENT')}
              className={`py-3 px-4 rounded-lg border text-sm font-medium transition-all ${
                gameMode === 'TOURNAMENT'
                  ? 'bg-gold/20 border-gold text-gold'
                  : 'bg-bg-card border-border-subtle text-text-secondary hover:border-gold/50'
              }`}
            >
              <div className="font-semibold">Torneio</div>
              <div className="text-[10px] opacity-70 mt-1">1.500 fichas, blinds crescentes</div>
            </button>
          </div>
        </div>

        {/* Bot Difficulty */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-text-primary mb-3">
            <Zap className="w-4 h-4 text-gold" />
            Dificuldade dos Bots
          </label>
          <div className="grid grid-cols-4 gap-2">
            {difficulties.map(d => (
              <button
                key={d.value}
                onClick={() => setDifficulty(d.value)}
                className={`py-2 px-2 rounded-lg border text-xs font-semibold transition-all ${
                  difficulty === d.value
                    ? 'bg-gold/20 border-gold text-gold'
                    : 'bg-bg-card border-border-subtle text-text-secondary hover:border-gold/50'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bot Count */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-text-primary mb-3">
            <Users className="w-4 h-4 text-gold" />
            Numero de Oponentes
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(count => (
              <button
                key={count}
                onClick={() => setBotCount(count)}
                className={`flex-1 py-2 rounded-lg border text-sm font-bold transition-all ${
                  botCount === count
                    ? 'bg-gold/20 border-gold text-gold'
                    : 'bg-bg-card border-border-subtle text-text-secondary hover:border-gold/50'
                }`}
              >
                {count}
              </button>
            ))}
          </div>
        </div>

        {/* Start button */}
        <motion.button
          onClick={() => onStart(gameMode, difficulty, botCount)}
          className="w-full btn-gold text-base py-4 flex items-center justify-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Play className="w-5 h-5" />
          Iniciar Partida
        </motion.button>
      </motion.div>
    </div>
  )
}

// ===== Winner Banner =====
function WinnerBanner({
  winners,
  onClose,
}: {
  winners: { playerId: string; playerName: string; amount: number; handResult: { handRank: string; description: string } }[]
  onClose: () => void
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <motion.div
      className="fixed inset-x-0 top-20 z-50 flex justify-center px-4 pointer-events-none"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <div
        className="pointer-events-auto rounded-xl px-6 py-4 text-center border-2 border-gold"
        style={{
          background: 'linear-gradient(180deg, #1E2945ee 0%, #141B2Dee 100%)',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 8px 40px rgba(212,168,48,0.3)',
        }}
      >
        <Trophy className="w-8 h-8 text-gold mx-auto mb-2" />
        <h3 className="font-display text-lg font-bold text-gold mb-1">
          {winners.length === 1 ? 'Vencedor!' : 'Empate! Pot Dividido'}
        </h3>
        <div className="space-y-1">
          {winners.map((w, i) => (
            <div key={i} className="flex items-center gap-3 justify-center">
              <span className="text-text-primary font-semibold">{w.playerName}</span>
              <span className="text-text-secondary text-xs">
                {HAND_RANK_NAMES_PT[w.handResult.handRank] || w.handResult.description}
              </span>
              <span className="text-gold font-bold font-mono-game text-lg">
                +{formatCoins(w.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// ===== Round Indicator =====
function RoundIndicator({ phase }: { phase: string }) {
  const rounds = ['PRE_FLOP', 'FLOP', 'TURN', 'RIVER']
  const currentIndex = rounds.indexOf(phase)

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      {rounds.map((round, i) => {
        const isActive = i === currentIndex
        const isDone = i < currentIndex

        return (
          <div key={round} className="flex items-center gap-1 sm:gap-1.5">
            <div
              className={`w-5 h-1.5 sm:w-8 sm:h-2 rounded-full transition-all duration-300 ${
                isActive
                  ? 'bg-gold shadow-[0_0_8px_rgba(212,168,48,0.5)]'
                  : isDone
                    ? 'bg-emerald'
                    : 'bg-border-subtle/40'
              }`}
            />
            {i < rounds.length - 1 && (
              <div
                className={`w-2 sm:w-3 h-px ${
                  isDone ? 'bg-emerald' : 'bg-border-subtle/30'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ===== Blind Info =====
function BlindInfo({
  blinds,
  gameMode,
}: {
  blinds: { smallBlind: number; bigBlind: number; level: number }
  gameMode: string
}) {
  if (gameMode !== 'TOURNAMENT') {
    return (
      <div className="flex items-center gap-3 text-[10px] sm:text-xs text-text-secondary">
        <span>SB: <span className="text-gold font-mono-game">{formatCoins(blinds.smallBlind)}</span></span>
        <span>BB: <span className="text-gold font-mono-game">{formatCoins(blinds.bigBlind)}</span></span>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-end gap-0.5">
      <span className="text-[10px] sm:text-xs text-text-secondary">
        Nivel <span className="text-gold font-bold">{blinds.level}</span>
      </span>
      <div className="flex items-center gap-2 text-[10px] sm:text-xs">
        <span>SB: <span className="text-gold font-mono-game">{formatCoins(blinds.smallBlind)}</span></span>
        <span>BB: <span className="text-gold font-mono-game">{formatCoins(blinds.bigBlind)}</span></span>
      </div>
    </div>
  )
}

// ===== Main Game Screen =====
function GameScreen({
  gameMode,
  difficulty,
  botCount,
}: {
  gameMode: GameMode
  difficulty: Difficulty
  botCount: number
}) {
  const {
    gameState,
    isProcessing,
    showdownRevealed,
    lastAction,
    message,
    dealNewHand,
    playerAction,
    resetGame,
    humanValidActions,
    handStrengthHint,

  } = usePokerGame({ gameMode, maxPlayers: botCount + 1, botDifficulty: difficulty })


  const [showWinnerBanner, setShowWinnerBanner] = useState(false)
  const navigate = useNavigate()

  // Auto-start first hand
  useEffect(() => {
    if (gameState.phase === 'WAITING' && gameState.handNumber === 0) {
      dealNewHand()
    }
  }, [gameState.phase, gameState.handNumber, dealNewHand])

  // Show winner banner on hand end
  useEffect(() => {
    if (gameState.phase === 'HAND_END' && gameState.handWinners.length > 0) {
      setShowWinnerBanner(true)
    }
  }, [gameState.phase, gameState.handWinners])

  const handleStartNewHand = useCallback(() => {
    setShowWinnerBanner(false)
    dealNewHand()
  }, [dealNewHand])

  const handleAction = useCallback(
    (action: string, amount?: number) => {
      playerAction(action as Parameters<typeof playerAction>[0], amount)
    },
    [playerAction],
  )

  const humanIndex = gameState.players.findIndex(p => p.isHuman)
  const humanPlayer = gameState.players[humanIndex]
  const isHumanTurn =
    gameState.activePlayerIndex === humanIndex &&
    gameState.phase !== 'WAITING' &&
    gameState.phase !== 'DEALING' &&
    gameState.phase !== 'HAND_END' &&
    humanPlayer?.status === 'ACTIVE'

  const validActions = humanValidActions()

  return (
    <div className="min-h-[100dvh] flex flex-col bg-bg-dark overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-bg-dark/90 backdrop-blur-sm border-b border-border-subtle/30 z-40">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/')}
            className="p-1.5 rounded-md hover:bg-bg-card transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-text-secondary" />
          </button>
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-text-primary">Poker</h2>
            <div className="flex items-center gap-1">
              <span className="text-[9px] sm:text-[10px] text-text-secondary capitalize">
                {gameMode === 'CASH' ? 'Cash Game' : 'Torneio'}
              </span>
              <span className="text-[9px] text-border-subtle">|</span>
              <span className="text-[9px] sm:text-[10px] text-text-secondary capitalize">
                {difficulty}
              </span>
            </div>
          </div>
        </div>

        {/* Round indicator */}
        <RoundIndicator phase={gameState.phase} />

        {/* Blinds + Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <BlindInfo blinds={gameState.blinds} gameMode={gameMode} />
          <button
            onClick={resetGame}
            className="p-1.5 rounded-md hover:bg-bg-card transition-colors"
            title="Reiniciar"
          >
            <RotateCcw className="w-3.5 h-3.5 text-text-secondary" />
          </button>
        </div>
      </div>

      {/* Message bar */}
      <AnimatePresence mode="wait">
        {message && (
          <motion.div
            key={message}
            className="text-center py-1.5 bg-bg-elevated/50 border-b border-border-subtle/20"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <span className="text-xs sm:text-sm text-text-secondary">{message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table area */}
      <div className="flex-1 flex flex-col items-center justify-center px-2 sm:px-4 py-2 sm:py-4 relative">
        <PokerTable gameState={gameState} showdownRevealed={showdownRevealed} />

        {/* Winner banner overlay */}
        <AnimatePresence>
          {showWinnerBanner && gameState.handWinners.length > 0 && (
            <WinnerBanner
              winners={gameState.handWinners}
              onClose={() => setShowWinnerBanner(false)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Bottom area: Player info + Action panel */}
      <div className="shrink-0 px-3 sm:px-4 pb-4 pt-2 bg-gradient-to-t from-bg-dark via-bg-dark to-transparent z-40">
        {/* Human player info bar */}
        <div className="flex items-center justify-between mb-2 max-w-xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-felt-green-light to-felt-green flex items-center justify-center text-text-primary font-bold text-xs border border-gold/50">
              {humanPlayer?.name.charAt(0) || 'V'}
            </div>
            <div>
              <span className="text-xs font-semibold text-text-primary block">
                {humanPlayer?.name || 'Voce'}
              </span>
              <span className="text-[10px] font-mono-game text-gold">
                {humanPlayer ? formatCoins(humanPlayer.chips) : '0'}
              </span>
            </div>
          </div>

          {/* Hand strength */}
          {handStrengthHint() && gameState.phase !== 'HAND_END' && (
            <span className="text-xs text-gold bg-bg-elevated/60 px-2 py-0.5 rounded-full">
              {handStrengthHint()}
            </span>
          )}

          {/* Last action */}
          <AnimatePresence mode="wait">
            {lastAction && (
              <motion.span
                key={`${lastAction.playerId}-${lastAction.action}`}
                className="text-[10px] text-text-secondary bg-bg-card px-2 py-0.5 rounded-full"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
              >
                {gameState.players.find(p => p.id === lastAction.playerId)?.name}{' '}
                {lastAction.action}
                {lastAction.amount ? ` ${formatCoins(lastAction.amount)}` : ''}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Action panel */}
        <ActionPanel
          validActions={validActions.map(a => ({
            action: a.action,
            enabled: a.enabled,
            amount: a.amount,
          }))}
          handStrength={handStrengthHint()}
          potSize={gameState.pot.mainPot}
          playerChips={humanPlayer?.chips || 0}
          currentBet={gameState.pot.currentBet}
          onAction={handleAction}
          isVisible={isHumanTurn}
        />

        {/* New hand button */}
        {gameState.phase === 'HAND_END' && (
          <motion.div
            className="text-center mt-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <button
              onClick={handleStartNewHand}
              className="btn-gold px-8 py-3"
              disabled={isProcessing}
            >
              <Play className="w-4 h-4 inline mr-2" />
              Proxima Mao
            </button>
          </motion.div>
        )}

        {/* Eliminated message */}
        {humanPlayer?.status === 'ELIMINATED' && (
          <motion.div
            className="text-center mt-3 p-4 bg-burgundy-dark/50 border border-burgundy rounded-lg-game"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h3 className="text-ruby font-display font-bold text-lg mb-1">
              Voce foi eliminado!
            </h3>
            <p className="text-text-secondary text-sm mb-3">
              Ficou sem fichas no torneio.
            </p>
            <button onClick={resetGame} className="btn-gold px-6 py-2 text-sm">
              <RotateCcw className="w-4 h-4 inline mr-2" />
              Novo Jogo
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}

// ===== Main PokerGame Page =====
export default function PokerGame() {
  const [gameConfig, setGameConfig] = useState<{
    mode: GameMode
    difficulty: Difficulty
    botCount: number
    started: boolean
  } | null>(null)

  const handleStart = useCallback(
    (mode: GameMode, difficulty: Difficulty, botCount: number) => {
      setGameConfig({ mode, difficulty, botCount, started: true })
    },
    [],
  )

  if (!gameConfig || !gameConfig.started) {
    return <SetupScreen onStart={handleStart} />
  }

  return (
    <GameScreen
      gameMode={gameConfig.mode}
      difficulty={gameConfig.difficulty}
      botCount={gameConfig.botCount}
    />
  )
}

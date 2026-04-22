import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Bot, Crown, Hand, Shield, Sparkles, Trophy, User } from 'lucide-react'
import PlayingCard from '@/components/PlayingCard'
import { useTrucoGame } from '@/hooks/useTrucoGame'
import {
  getTrucoLabel,
  getRaiseLabel,
  getNextTrucoValue,
  getTeam,
  getPlayerName,
  getManilhaName,
  isManilha,
} from '@/engine/trucoEngine'
import type { GameMode, Difficulty, TrucoState, TrucoCard } from '@/engine/trucoEngine'
import { useGameStore } from '@/store/gameStore'

// ===== Setup Screen =====

function SetupScreen({
  onStart,
}: {
  onStart: (mode: GameMode, difficulty: Difficulty) => void
}) {
  const [mode, setMode] = useState<GameMode>('mineiro')
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const navigate = useNavigate()

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-4 truco-room-bg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="game-panel max-w-md w-full p-6 md:p-8"
      >
        <h1 className="font-display text-2xl md:text-3xl font-bold text-gold text-center mb-6">
          Truco
        </h1>

        <div className="mb-6">
          <label className="block text-sm font-medium text-text-secondary mb-3">
            Modo de Jogo
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setMode('mineiro')}
              className={`py-3 px-4 rounded-lg font-semibold text-sm transition-all ${
                mode === 'mineiro'
                  ? 'bg-gold text-bg-dark shadow-gold'
                  : 'bg-bg-card text-text-primary border border-border-subtle hover:border-gold'
              }`}
            >
              Mineiro
              <span className="block text-xs font-normal mt-1 opacity-70">
                Manilhas fixas
              </span>
            </button>
            <button
              onClick={() => setMode('paulista')}
              className={`py-3 px-4 rounded-lg font-semibold text-sm transition-all ${
                mode === 'paulista'
                  ? 'bg-gold text-bg-dark shadow-gold'
                  : 'bg-bg-card text-text-primary border border-border-subtle hover:border-gold'
              }`}
            >
              Paulista
              <span className="block text-xs font-normal mt-1 opacity-70">
                Vira define manilha
              </span>
            </button>
          </div>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-medium text-text-secondary mb-3">
            Dificuldade dos Bots
          </label>
          <div className="grid grid-cols-2 gap-3">
            {(['easy', 'medium', 'hard', 'expert'] as Difficulty[]).map((d) => {
              const labels: Record<Difficulty, string> = {
                easy: 'Facil',
                medium: 'Medio',
                hard: 'Dificil',
                expert: 'Expert',
              }
              return (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`py-3 px-4 rounded-lg font-semibold text-sm transition-all ${
                    difficulty === d
                      ? 'bg-gold text-bg-dark shadow-gold'
                      : 'bg-bg-card text-text-primary border border-border-subtle hover:border-gold'
                  }`}
                >
                  {labels[d]}
                </button>
              )
            })}
          </div>
        </div>

        <button onClick={() => onStart(mode, difficulty)} className="btn-gold w-full">
          Comecar Jogo
        </button>

        <button onClick={() => navigate('/lobby')} className="btn-dark w-full mt-3">
          Voltar ao Lobby
        </button>
      </motion.div>
    </div>
  )
}

// ===== Game Over Screen =====

function GameOverScreen({
  state,
  onNewGame,
}: {
  state: TrucoState
  onNewGame: () => void
}) {
  const navigate = useNavigate()
  const isWinner = state.gameWinner === 'nos'
  const { addCoins, updateStats } = useGameStore()

  useEffect(() => {
    const coins = isWinner ? 500 : 100
    addCoins(coins)
    updateStats({
      matchesPlayed: 1,
      wins: isWinner ? 1 : 0,
      losses: isWinner ? 0 : 1,
      trucoWins: isWinner ? 1 : 0,
    })
  }, [isWinner, addCoins, updateStats])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg-dark/90 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="game-panel max-w-sm w-full mx-4 p-8 text-center"
      >
        <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
          isWinner ? 'bg-gold/20 text-gold' : 'bg-ruby/20 text-ruby'
        }`}>
          {isWinner ? <Trophy size={34} /> : <Shield size={34} />}
        </div>
        <h2 className={`font-display text-3xl font-bold mb-2 ${isWinner ? 'text-gold' : 'text-text-secondary'}`}>
          {isWinner ? 'VITORIA!' : 'DERROTA'}
        </h2>
        <p className="text-lg text-text-primary mb-4">
          {isWinner
            ? `NOS venceu por ${state.scoreNos} a ${state.scoreEles}!`
            : `ELES venceu por ${state.scoreEles} a ${state.scoreNos}`}
        </p>

        <div className="flex flex-col gap-3 mt-6">
          <button onClick={onNewGame} className="btn-gold w-full">
            Jogar Novamente
          </button>
          <button onClick={() => navigate('/lobby')} className="btn-dark w-full">
            Voltar ao Lobby
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ===== Score Bar =====

function ScorePips({ score, color }: { score: number; color: 'blue' | 'red' }) {
  return (
    <div className="grid grid-cols-6 gap-1">
      {Array.from({ length: 12 }, (_, i) => (
        <span
          key={i}
          className={`h-1.5 w-3 rounded-full transition-colors ${
            i < score
              ? color === 'blue' ? 'bg-sky-400' : 'bg-rose-400'
              : 'bg-white/12'
          }`}
        />
      ))}
    </div>
  )
}

function ScoreBar({ state, onExit }: { state: TrucoState; onExit: () => void }) {
  const label = state.mode === 'mineiro' ? 'MINEIRO' : 'PAULISTA'
  const handValue = getTrucoLabel(state.trucoValue, state.mode)

  return (
    <div className="relative z-20 px-3 pt-3 md:px-6 md:pt-5">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/35 px-3 py-2 shadow-xl backdrop-blur-md md:px-5">
        <button
          onClick={onExit}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/8 text-text-primary transition hover:border-gold/70 hover:text-gold"
          aria-label="Voltar"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="flex min-w-0 flex-1 items-center justify-center gap-2 md:gap-5">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="text-right">
              <span className="block text-[10px] font-bold uppercase text-sky-300">Nos</span>
              <motion.span
                key={state.scoreNos}
                initial={{ scale: 1.25 }}
                animate={{ scale: 1 }}
                className="block font-mono-game text-2xl font-bold text-white md:text-3xl"
              >
                {state.scoreNos}
              </motion.span>
            </div>
            <ScorePips score={state.scoreNos} color="blue" />
          </div>

          <div className="flex min-w-[84px] flex-col items-center rounded-md border border-gold/30 bg-gold/10 px-3 py-1">
            <span className="text-[10px] font-bold uppercase text-gold/80">{label}</span>
            <span className="font-display text-base font-bold text-gold md:text-lg">{handValue}</span>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <ScorePips score={state.scoreEles} color="red" />
            <div>
              <span className="block text-[10px] font-bold uppercase text-rose-300">Eles</span>
              <motion.span
                key={state.scoreEles}
                initial={{ scale: 1.25 }}
                animate={{ scale: 1 }}
                className="block font-mono-game text-2xl font-bold text-white md:text-3xl"
              >
                {state.scoreEles}
              </motion.span>
            </div>
          </div>
        </div>

        <div className="hidden min-w-[116px] text-right sm:block">
          <span className="block text-[10px] font-bold uppercase text-text-secondary">Rodada</span>
          <span className="font-semibold text-text-primary">{state.currentRound + 1} / 3</span>
        </div>
      </div>
    </div>
  )
}

// ===== Round Wins Indicator =====

function RoundWins({ state }: { state: TrucoState }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {[0, 1, 2].map((round) => {
        const winner = state.roundWinners[round]
        return (
          <div
            key={round}
            className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold shadow-lg transition-all ${
              winner === null
                ? 'border-white/15 bg-black/25 text-text-secondary'
                : winner === 0
                  ? 'border-sky-300/60 bg-sky-500 text-white'
                  : 'border-rose-300/60 bg-rose-500 text-white'
            }`}
          >
            {round + 1}
          </div>
        )
      })}
    </div>
  )
}

// ===== Player Seat =====

function PlayerSeat({
  index,
  isActive,
  isBot,
  cardCount,
  placement,
}: {
  index: number
  isActive: boolean
  isBot: boolean
  cardCount: number
  placement: 'top' | 'left' | 'right' | 'bottom'
}) {
  const team = getTeam(index)
  const name = getPlayerName(index)
  const isBlue = team === 'nos'

  return (
    <div className={`truco-seat truco-seat-${placement} ${isActive ? 'is-active' : ''}`}>
      <motion.div
        animate={
          isActive
            ? {
                boxShadow: [
                  '0 0 0 0 rgba(240,201,74,0.45)',
                  '0 0 0 10px rgba(240,201,74,0)',
                ],
              }
            : {}
        }
        transition={isActive ? { duration: 1.4, repeat: Infinity, ease: 'easeOut' } : {}}
        className={`flex h-11 w-11 items-center justify-center rounded-full border-2 shadow-lg md:h-12 md:w-12 ${
          isBlue
            ? 'border-sky-300 bg-gradient-to-br from-sky-500 to-blue-800'
            : 'border-rose-300 bg-gradient-to-br from-rose-500 to-red-900'
        }`}
      >
        {isBot ? <Bot size={20} /> : <User size={20} />}
      </motion.div>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-xs font-bold text-white md:text-sm">{name}</span>
          {index === 2 && <Crown size={13} className="text-gold" />}
        </div>
        <div className="mt-0.5 flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${isBlue ? 'bg-sky-300' : 'bg-rose-300'}`} />
          <span className="text-[10px] font-semibold uppercase text-text-secondary">
            {isActive ? 'Na vez' : `${cardCount} cartas`}
          </span>
        </div>
      </div>
    </div>
  )
}

// ===== Center Play Area =====

function PlayedCardSlot({
  state,
  playerIndex,
  className,
  rotate = 0,
}: {
  state: TrucoState
  playerIndex: number
  className: string
  rotate?: number
}) {
  const played = state.playedCards.find((p) => p.playerIndex === playerIndex)

  return (
    <div className={`absolute ${className}`}>
      {played ? (
        <motion.div
          initial={{ scale: 0.25, opacity: 0, y: 8 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 420, damping: 28 }}
          style={{ rotate }}
        >
          <PlayingCard
            suit={played.card.suit}
            rank={played.card.rank}
            faceDown={played.covered}
            size="sm"
            animate={false}
          />
        </motion.div>
      ) : (
        <div
          className="h-[clamp(54px,8.5vw,72px)] w-[clamp(36px,5.7vw,48px)] rounded-md border border-dashed border-white/20 bg-black/20 shadow-inner"
          style={{ transform: `rotate(${rotate}deg)` }}
        />
      )}
    </div>
  )
}

function CenterPlayArea({ state }: { state: TrucoState }) {
  return (
    <div className="absolute inset-[18%] md:inset-[19%]">
      <div className="absolute inset-0 rounded-full border border-white/10 bg-black/10 shadow-inner" />
      <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 bg-black/35 text-gold shadow-gold md:h-16 md:w-16">
          <Sparkles size={24} />
        </div>
        <div>
          <p className="font-display text-sm font-bold uppercase text-gold md:text-lg">Truco Arena</p>
          <p className="text-[10px] font-semibold uppercase text-white/55">
            Mao vale {getTrucoLabel(state.trucoValue, state.mode)}
          </p>
        </div>
        <RoundWins state={state} />
      </div>

      <PlayedCardSlot state={state} playerIndex={0} className="bottom-[3%] left-1/2 -translate-x-1/2" rotate={4} />
      <PlayedCardSlot state={state} playerIndex={1} className="left-[6%] top-1/2 -translate-y-1/2" rotate={-12} />
      <PlayedCardSlot state={state} playerIndex={2} className="left-1/2 top-[3%] -translate-x-1/2" rotate={-4} />
      <PlayedCardSlot state={state} playerIndex={3} className="right-[6%] top-1/2 -translate-y-1/2" rotate={12} />

      {state.mode === 'paulista' && state.vira && (
        <div className="absolute right-[9%] top-[7%] flex items-center gap-2 rounded-md border border-gold/30 bg-black/45 px-2 py-1.5 shadow-lg backdrop-blur-sm">
          <div className="scale-90">
            <PlayingCard suit={state.vira.suit} rank={state.vira.rank} size="sm" animate={false} />
          </div>
          <div className="hidden text-left sm:block">
            <span className="block text-[10px] font-bold uppercase text-gold">Vira</span>
            <span className="text-xs font-semibold text-white">{getManilhaName(state)}</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ===== Bot Hand (face down) =====

function BotHand({ count, fan = 'center' }: { count: number; fan?: 'center' | 'left' | 'right' }) {
  const rotation = fan === 'left' ? -8 : fan === 'right' ? 8 : 0

  return (
    <div className="flex -space-x-5 justify-center">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="w-9 md:w-10"
          style={{ transform: `rotate(${(i - 1) * 5 + rotation}deg)` }}
        >
          <PlayingCard faceDown size="sm" animate={false} />
        </div>
      ))}
    </div>
  )
}

// ===== Player Hand =====

function PlayerHand({
  state,
  cards,
  selectedCard,
  onSelectCard,
  onPlayCard,
  isMyTurn,
  canPlayCovered,
  coveredSelected,
  onToggleCovered,
}: {
  state: TrucoState
  cards: TrucoCard[]
  selectedCard: number | null
  onSelectCard: (index: number) => void
  onPlayCard: () => void
  isMyTurn: boolean
  canPlayCovered: boolean
  coveredSelected: boolean
  onToggleCovered: () => void
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-end justify-center gap-2 md:gap-4">
        {cards.map((card, index) => {
          const rotation = (index - (cards.length - 1) / 2) * 8
          const manilha = isManilha(card, state)

          return (
            <motion.div
              key={`${card.suit}-${card.rank}`}
              className="relative"
              style={{ rotate: rotation }}
              whileHover={isMyTurn ? { y: -12, rotate: rotation * 0.3 } : {}}
              whileTap={isMyTurn ? { scale: 0.95 } : {}}
            >
              {manilha && (
                <div className="absolute -top-7 left-1/2 z-10 -translate-x-1/2 rounded-full border border-gold/40 bg-black/65 px-2 py-0.5 text-[10px] font-bold uppercase text-gold shadow-lg">
                  Manilha
                </div>
              )}
              <PlayingCard
                suit={card.suit}
                rank={card.rank}
                selected={selectedCard === index}
                disabled={!isMyTurn}
                onClick={() => isMyTurn && onSelectCard(index)}
                size="md"
                animate
              />
            </motion.div>
          )
        })}
      </div>

      {isMyTurn && selectedCard !== null && (
        <div className="flex flex-wrap items-center justify-center gap-2 rounded-lg border border-white/10 bg-black/35 px-3 py-2 shadow-xl backdrop-blur-md">
          {canPlayCovered && (
            <button
              onClick={onToggleCovered}
              className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-bold transition ${
                coveredSelected
                  ? 'border-gold bg-gold text-bg-dark'
                  : 'border-white/15 bg-white/8 text-text-primary hover:border-gold/70'
              }`}
            >
              <Hand size={15} />
              Coberta
            </button>
          )}
          <button onClick={onPlayCard} className="btn-gold px-7 py-2">
            Jogar Carta
          </button>
        </div>
      )}
    </div>
  )
}

// ===== Truco Button =====

function TrucoButton({ onClick, value, mode }: { onClick: () => void; value: number; mode: GameMode }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-lg border border-yellow-200/50 bg-gradient-to-b from-yellow-300 via-gold to-gold-dark px-7 py-3 text-base font-black uppercase text-bg-dark shadow-gold-lg"
    >
      <Sparkles size={18} />
      {getRaiseLabel(value, mode)}
    </motion.button>
  )
}

// ===== Truco Response Panel =====

function TrucoResponsePanel({
  state,
  onRespond,
}: {
  state: TrucoState
  onRespond: (response: 'accept' | 'raise' | 'flee') => void
}) {
  const currentVal = state.lastRaiseValue ?? state.trucoValue
  const nextVal = getNextTrucoValue(currentVal, state.mode)
  const canRaise = nextVal > currentVal

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="flex flex-col items-center gap-3 rounded-lg border border-gold/35 bg-black/70 p-4 shadow-2xl backdrop-blur-md md:p-5"
    >
      <p className="text-center text-base font-bold text-gold md:text-lg">
        {getPlayerName(state.trucoCaller ?? 0)} pediu {getTrucoLabel(currentVal, state.mode)}!
      </p>
      <div className="text-sm text-text-secondary">
        Esta mao vale {currentVal} pontos
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        <button
          onClick={() => onRespond('accept')}
          className="rounded-md bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-500"
        >
          Aceitar
        </button>

        {canRaise && (
          <button
            onClick={() => onRespond('raise')}
            className="rounded-md bg-gold px-5 py-3 text-sm font-bold text-bg-dark transition-colors hover:bg-gold-light"
          >
            {getRaiseLabel(currentVal, state.mode)}
          </button>
        )}

        <button
          onClick={() => onRespond('flee')}
          className="rounded-md bg-ruby px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-ruby-dark"
        >
          Correr
        </button>
      </div>
    </motion.div>
  )
}

// ===== Notification Overlay =====

function NotificationOverlay({ message, subMessage }: { message: string; subMessage?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <div className="game-panel p-6 md:p-8 text-center max-w-sm mx-4">
        <h3 className="font-display text-2xl md:text-3xl font-bold text-gold mb-2">
          {message}
        </h3>
        {subMessage && <p className="text-sm text-text-secondary">{subMessage}</p>}
      </div>
    </motion.div>
  )
}

// ===== Message Banner =====

function MessageBanner({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -40, opacity: 0 }}
      className="absolute left-1/2 top-20 z-30 -translate-x-1/2 rounded-lg border border-gold/35 bg-black/65 px-5 py-3 shadow-xl backdrop-blur-md"
    >
      <span className="text-sm font-semibold text-gold">{message}</span>
    </motion.div>
  )
}

// ===== Main Game Component =====

export default function TrucoGame() {
  const {
    state,
    startGame,
    playPlayerCard,
    callPlayerTruco,
    respondPlayerTruco,
    setCoveredPlay,
    newHand,
    resetGame,
    getValidPlayerActions,
  } = useTrucoGame()

  const [selectedCard, setSelectedCard] = useState<number | null>(null)
  const [showSetup, setShowSetup] = useState(true)
  const navigate = useNavigate()

  const validActions = getValidPlayerActions()
  const isMyTurn = state.currentPlayerIndex === 0 && state.phase.startsWith('PLAYING')
  const isTrucoResponse = state.phase === 'TRUCO_CALLED' && state.trucoPending

  const handleStartGame = useCallback(
    (mode: GameMode, difficulty: Difficulty) => {
      setShowSetup(false)
      startGame(mode, difficulty)
    },
    [startGame]
  )

  const handleSelectCard = useCallback(
    (index: number) => {
      if (!isMyTurn) return
      setSelectedCard((prev) => (prev === index ? null : index))
    },
    [isMyTurn]
  )

  const handlePlayCard = useCallback(() => {
    if (selectedCard === null) return
    playPlayerCard(selectedCard, state.coveredPending)
    setSelectedCard(null)
  }, [selectedCard, playPlayerCard, state.coveredPending])

  const handleCallTruco = useCallback(() => {
    if (!validActions.canCallTruco) return
    callPlayerTruco()
  }, [validActions.canCallTruco, callPlayerTruco])

  const handleRespondTruco = useCallback(
    (response: 'accept' | 'raise' | 'flee') => {
      respondPlayerTruco(response)
    },
    [respondPlayerTruco]
  )

  const handleNewHand = useCallback(() => {
    newHand()
  }, [newHand])

  const handleNewGame = useCallback(() => {
    setShowSetup(true)
    resetGame()
  }, [resetGame])

  if (showSetup) {
    return <SetupScreen onStart={handleStartGame} />
  }

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden truco-room-bg">
      <ScoreBar state={state} onExit={() => navigate('/lobby')} />

      <div className="relative z-10 mx-auto flex h-[calc(100dvh-72px)] w-full max-w-6xl items-center justify-center px-2 pb-safe pt-2 md:px-6">
        <div className="relative h-full max-h-[760px] min-h-[560px] w-full">
          <div className="absolute left-1/2 top-[2%] z-20 flex -translate-x-1/2 flex-col items-center gap-2">
            <PlayerSeat index={2} isActive={state.currentPlayerIndex === 2} isBot cardCount={state.hands[2]?.length ?? 0} placement="top" />
            <BotHand count={state.hands[2]?.length ?? 0} />
          </div>

          <div className="absolute left-[1%] top-1/2 z-20 flex -translate-y-1/2 flex-col items-center gap-2 md:left-[4%]">
            <PlayerSeat index={1} isActive={state.currentPlayerIndex === 1} isBot cardCount={state.hands[1]?.length ?? 0} placement="left" />
            <BotHand count={state.hands[1]?.length ?? 0} fan="left" />
          </div>

          <div className="absolute right-[1%] top-1/2 z-20 flex -translate-y-1/2 flex-col items-center gap-2 md:right-[4%]">
            <PlayerSeat index={3} isActive={state.currentPlayerIndex === 3} isBot cardCount={state.hands[3]?.length ?? 0} placement="right" />
            <BotHand count={state.hands[3]?.length ?? 0} fan="right" />
          </div>

          <div className="absolute left-1/2 top-[47%] h-[58%] w-[88%] max-w-[860px] -translate-x-1/2 -translate-y-1/2 md:h-[64%] md:w-[78%]">
            <div className="truco-table-shell h-full w-full">
              <div className="truco-table-felt h-full w-full">
                <CenterPlayArea state={state} />
              </div>
            </div>
          </div>

          <div className="absolute bottom-[1%] left-1/2 z-30 flex w-full -translate-x-1/2 flex-col items-center gap-2 px-2 md:bottom-[3%]">
            <PlayerSeat index={0} isActive={state.currentPlayerIndex === 0} isBot={false} cardCount={state.hands[0]?.length ?? 0} placement="bottom" />

            {state.hands[0]?.length > 0 && (
              <PlayerHand
                state={state}
                cards={state.hands[0]}
                selectedCard={selectedCard}
                onSelectCard={handleSelectCard}
                onPlayCard={handlePlayCard}
                isMyTurn={isMyTurn}
                canPlayCovered={validActions.canPlayCovered}
                coveredSelected={state.coveredPending}
                onToggleCovered={() => setCoveredPlay(!state.coveredPending)}
              />
            )}

            <div className="flex flex-col items-center gap-2">
              {isMyTurn && validActions.canCallTruco && (
                <TrucoButton onClick={handleCallTruco} value={state.trucoValue} mode={state.mode} />
              )}

              {isTrucoResponse && (
                <TrucoResponsePanel state={state} onRespond={handleRespondTruco} />
              )}

              {state.phase === 'HAND_END' && (
                <button onClick={handleNewHand} className="btn-gold px-8 py-3">
                  Proxima Mao
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {state.isMaoDeFerro && state.phase !== 'GAME_OVER' && (
          <NotificationOverlay
            message="MAO DE FERRO!"
            subMessage="Todas as cartas serao jogadas cobertas."
          />
        )}
        {(state.isMaoDe10 || state.isMaoDe11) && !state.isMaoDeFerro && state.phase !== 'GAME_OVER' && (
          <NotificationOverlay
            message={state.mode === 'mineiro' ? 'MAO DE 10!' : 'MAO DE 11!'}
            subMessage="Sem truco nesta mao. Voce pode ver as cartas do seu parceiro."
          />
        )}
        {state.handMessage && <MessageBanner message={state.handMessage} />}
      </AnimatePresence>

      <AnimatePresence>
        {state.phase === 'GAME_OVER' && (
          <GameOverScreen state={state} onNewGame={handleNewGame} />
        )}
      </AnimatePresence>
    </div>
  )
}

import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import PlayingCard from '@/components/PlayingCard'
import { useTrucoGame } from '@/hooks/useTrucoGame'
import {
  getTrucoLabel,
  getRaiseLabel,
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
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="game-panel max-w-md w-full p-6 md:p-8"
      >
        <h1 className="font-display text-2xl md:text-3xl font-bold text-gold text-center mb-6">
          Truco
        </h1>

        {/* Mode Selector */}
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

        {/* Difficulty Selector */}
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

        {/* Start Button */}
        <button onClick={() => onStart(mode, difficulty)} className="btn-gold w-full">
          Comecar Jogo
        </button>

        <button
          onClick={() => navigate('/lobby')}
          className="btn-dark w-full mt-3"
        >
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg-dark/90"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="game-panel max-w-sm w-full mx-4 p-8 text-center"
      >
        {isWinner ? (
          <>
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="font-display text-3xl font-bold text-gold mb-2">
              VITORIA!
            </h2>
            <p className="text-lg text-text-primary mb-4">
              NOS venceu por {state.scoreNos} a {state.scoreEles}!
            </p>
          </>
        ) : (
          <>
            <div className="text-6xl mb-4">💔</div>
            <h2 className="font-display text-3xl font-bold text-text-secondary mb-2">
              DERROTA
            </h2>
            <p className="text-lg text-text-primary mb-4">
              ELES venceu por {state.scoreEles} a {state.scoreNos}
            </p>
          </>
        )}

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

function ScoreBar({ state }: { state: TrucoState }) {
  const dots = Array.from({ length: 12 }, (_, i) => i + 1)
  const label = state.mode === 'mineiro' ? 'MINEIRO' : 'PAULISTA'

  return (
    <div className="flex flex-col items-center gap-2 py-2 px-4">
      <div className="flex items-center gap-4 md:gap-8">
        {/* NOS Score */}
        <div className="flex flex-col items-center">
          <span className="text-sm font-bold text-blue-500">NOS</span>
          <motion.span
            key={state.scoreNos}
            initial={{ scale: 1.3, color: '#D4A830' }}
            animate={{ scale: 1, color: '#3B82F6' }}
            className="text-2xl md:text-3xl font-bold"
          >
            {state.scoreNos}
          </motion.span>
        </div>

        {/* VS */}
        <div className="flex flex-col items-center">
          <span className="text-xs text-text-secondary uppercase tracking-wider">{label}</span>
          <span className="text-lg text-text-secondary font-medium">x</span>
        </div>

        {/* ELES Score */}
        <div className="flex flex-col items-center">
          <span className="text-sm font-bold text-red-500">ELES</span>
          <motion.span
            key={state.scoreEles}
            initial={{ scale: 1.3, color: '#D4A830' }}
            animate={{ scale: 1, color: '#EF4444' }}
            className="text-2xl md:text-3xl font-bold"
          >
            {state.scoreEles}
          </motion.span>
        </div>
      </div>

      {/* Progress Dots */}
      <div className="flex gap-1">
        {dots.map((dot) => (
          <div
            key={dot}
            className={`w-2 h-2 rounded-full transition-colors duration-300 ${
              dot <= state.scoreNos
                ? 'bg-blue-500'
                : dot <= state.scoreEles
                  ? 'bg-red-500'
                  : 'bg-border-subtle'
            }`}
          />
        ))}
      </div>

      {/* Hand Value */}
      <div className="text-sm text-text-secondary">
        Esta mao vale:{" "}
        <span className="font-bold text-gold">{getTrucoLabel(state.trucoValue, state.mode)}</span>
        {state.trucoPending && (
          <span className="ml-2 text-gold animate-pulse">TRUCO PENDENTE</span>
        )}
      </div>
    </div>
  )
}

// ===== Round Wins Indicator =====

function RoundWins({ state }: { state: TrucoState }) {
  return (
    <div className="flex gap-2 justify-center">
      {[0, 1, 2].map((round) => {
        const winner = state.roundWinners[round]
        return (
          <div
            key={round}
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              winner === null
                ? 'bg-border-subtle text-text-secondary'
                : winner === 0
                  ? 'bg-blue-500 text-white'
                  : 'bg-red-500 text-white'
            }`}
          >
            {round + 1}
          </div>
        )
      })}
    </div>
  )
}

// ===== Player Avatar =====

function PlayerAvatar({
  index,
  isActive,
  isBot,
}: {
  index: number
  isActive: boolean
  isBot: boolean
}) {
  const team = getTeam(index)
  const name = getPlayerName(index)

  return (
    <div className="flex flex-col items-center gap-1">
      <motion.div
        animate={
          isActive
            ? {
                boxShadow: [
                  '0 0 0 0px rgba(212,168,48,0.4)',
                  '0 0 0 8px rgba(212,168,48,0)',
                ],
              }
            : {}
        }
        transition={
          isActive
            ? { duration: 1.5, repeat: Infinity, ease: 'easeOut' }
            : {}
        }
        className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-sm font-bold relative ${
          team === 'nos'
            ? 'bg-blue-600 border-2 border-blue-400'
            : 'bg-red-600 border-2 border-red-400'
        } ${isActive ? 'ring-2 ring-gold' : ''}`}
      >
        {isBot ? (index === 1 ? 'B1' : 'B2') : index === 0 ? 'EU' : 'PR'}
      </motion.div>
      <span className="text-xs text-text-primary font-medium">{name}</span>
      {isActive && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-gold font-semibold"
        >
          Vez
        </motion.span>
      )}
    </div>
  )
}

// ===== Center Play Area =====

function CenterPlayArea({ state }: { state: TrucoState }) {
  const positions = [
    { idx: 0, className: 'absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2' }, // bottom
    { idx: 1, className: 'absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2' }, // left
    { idx: 2, className: 'absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2' }, // top
    { idx: 3, className: 'absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2' }, // right
  ]

  return (
    <div className="relative w-40 h-40 md:w-52 md:h-52">
      {positions.map((pos) => {
        const played = state.playedCards.find((p) => p.playerIndex === pos.idx)
        if (!played) {
          return (
            <div
              key={pos.idx}
              className={`${pos.className} w-10 h-14 md:w-12 md:h-16 rounded-lg bg-white/5 border border-white/10`}
            />
          )
        }

        return (
          <motion.div
            key={pos.idx}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className={`${pos.className} z-10`}
            style={{ transform: `${pos.className.includes('translate-x') ? '' : ''}` }}
          >
            <PlayingCard
              suit={played.card.suit}
              rank={played.card.rank}
              faceDown={played.covered}
              size="sm"
              animate={false}
            />
          </motion.div>
        )
      })}

      {/* Vira Card (Paulista) */}
      {state.mode === 'paulista' && state.vira && (
        <div className="absolute -top-8 -right-8 md:-top-10 md:-right-10 flex flex-col items-center">
          <span className="text-xs text-gold font-bold mb-1">VIRA</span>
          <PlayingCard
            suit={state.vira.suit}
            rank={state.vira.rank}
            size="sm"
            animate={false}
          />
          <span className="text-xs text-text-secondary mt-1">
            Manilha: {getManilhaName(state)}
          </span>
        </div>
      )}
    </div>
  )
}

// ===== Bot Hand (face down) =====

function BotHand({ count }: { count: number }) {
  return (
    <div className="flex -space-x-3 justify-center">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="w-8 h-11 md:w-10 md:h-14">
          <PlayingCard faceDown size="sm" animate={false} />
        </div>
      ))}
    </div>
  )
}

// ===== Player Hand =====

function PlayerHand({
  cards,
  selectedCard,
  onSelectCard,
  onPlayCard,
  isMyTurn,
  canPlayCovered,
  coveredSelected,
  onToggleCovered,
}: {
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
      <div className="flex gap-2 md:gap-3">
        {cards.map((card, index) => (
          <motion.div
            key={`${card.suit}-${card.rank}`}
            whileHover={isMyTurn ? { y: -12 } : {}}
            whileTap={isMyTurn ? { scale: 0.95 } : {}}
          >
            <PlayingCard
              suit={card.suit}
              rank={card.rank}
              selected={selectedCard === index}
              disabled={!isMyTurn}
              onClick={() => isMyTurn && onSelectCard(index)}
              size="md"
              animate
            />
            {isManilha(card, { mode: 'mineiro', vira: null, currentRound: 0 } as TrucoState) && (
              <div className="text-center mt-1">
                <span className="text-xs text-gold font-bold">MANILHA</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {isMyTurn && selectedCard !== null && (
        <div className="flex flex-col items-center gap-2">
          {canPlayCovered && (
            <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
              <input
                type="checkbox"
                checked={coveredSelected}
                onChange={onToggleCovered}
                className="w-4 h-4 rounded accent-gold"
              />
              Jogar coberta
            </label>
          )}
          <button onClick={onPlayCard} className="btn-gold px-8 py-2">
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
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="btn-gold px-6 py-3 text-lg font-bold shadow-gold-lg"
      style={{
        background: 'var(--gradient-gold)',
        boxShadow: '0 4px 20px rgba(212,168,48,0.4)',
      }}
    >
      {getTrucoLabel(value, mode)}!
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
  const nextLabel = getRaiseLabel(state.lastRaiseValue ?? state.trucoValue, state.mode)
  const currentVal = state.lastRaiseValue ?? state.trucoValue
  const nextVal = currentVal >= 12 ? null : currentVal

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="game-panel p-4 md:p-6 flex flex-col items-center gap-3"
    >
      <p className="text-lg font-bold text-gold mb-2">
        {getPlayerName(state.trucoCaller ?? 0)} pediu {getTrucoLabel(state.lastRaiseValue ?? state.trucoValue, state.mode)}!
      </p>
      <div className="text-sm text-text-secondary mb-2">
        Esta mao valera: {state.lastRaiseValue ?? state.trucoValue} pontos
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        <button
          onClick={() => onRespond('accept')}
          className="px-6 py-3 rounded-lg font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
        >
          Aceitar
        </button>

        {nextVal !== null && nextVal > currentVal && (
          <button
            onClick={() => onRespond('raise')}
            className="px-6 py-3 rounded-lg font-bold text-sm bg-gold hover:bg-gold-light text-bg-dark transition-colors"
          >
            {nextLabel}
          </button>
        )}

        <button
          onClick={() => onRespond('flee')}
          className="px-6 py-3 rounded-lg font-bold text-sm bg-ruby hover:bg-ruby-dark text-white transition-colors"
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
      className="absolute inset-0 z-40 flex items-center justify-center bg-black/60"
    >
      <div className="game-panel p-6 md:p-8 text-center max-w-sm mx-4">
        <h3 className="font-display text-2xl md:text-3xl font-bold text-gold mb-2">
          {message}
        </h3>
        {subMessage && (
          <p className="text-sm text-text-secondary">{subMessage}</p>
        )}
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
      className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-bg-elevated border border-gold/30 px-6 py-3 rounded-lg shadow-lg"
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

  // Setup screen
  if (showSetup) {
    return <SetupScreen onStart={handleStartGame} />
  }

  return (
    <div className="h-[100dvh] w-full flex flex-col relative overflow-hidden" style={{ background: 'var(--bg-dark)' }}>
      {/* Table Background */}
      <div
        className="absolute inset-4 md:inset-8 rounded-[50%] opacity-30"
        style={{ background: 'var(--gradient-table)' }}
      />

      {/* Score Bar */}
      <div className="relative z-10 flex-shrink-0">
        <ScoreBar state={state} />
        <div className="flex justify-center mt-1">
          <RoundWins state={state} />
        </div>
      </div>

      {/* Game Table Area */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4">
        <div className="relative w-full max-w-3xl h-full flex flex-col">
          {/* Partner (Top) */}
          <div className="flex justify-center pt-2 md:pt-4">
            <div className="flex flex-col items-center gap-2">
              <PlayerAvatar
                index={2}
                isActive={state.currentPlayerIndex === 2}
                isBot
              />
              <BotHand count={state.hands[2]?.length ?? 0} />
            </div>
          </div>

          {/* Middle Row: Left Opponent, Center, Right Opponent */}
          <div className="flex-1 flex items-center justify-between px-2 md:px-8">
            {/* Left Opponent */}
            <div className="flex flex-col items-center gap-2">
              <PlayerAvatar
                index={1}
                isActive={state.currentPlayerIndex === 1}
                isBot
              />
              <BotHand count={state.hands[1]?.length ?? 0} />
            </div>

            {/* Center Play Area */}
            <CenterPlayArea state={state} />

            {/* Right Opponent */}
            <div className="flex flex-col items-center gap-2">
              <PlayerAvatar
                index={3}
                isActive={state.currentPlayerIndex === 3}
                isBot
              />
              <BotHand count={state.hands[3]?.length ?? 0} />
            </div>
          </div>

          {/* Bottom: Player */}
          <div className="flex flex-col items-center gap-3 pb-4 md:pb-6">
            <PlayerAvatar
              index={0}
              isActive={state.currentPlayerIndex === 0}
              isBot={false}
            />

            {/* Player Hand */}
            {state.hands[0]?.length > 0 && (
              <PlayerHand
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

            {/* Actions */}
            <div className="flex flex-col items-center gap-2">
              {isMyTurn && validActions.canCallTruco && (
                <TrucoButton
                  onClick={handleCallTruco}
                  value={state.trucoValue}
                  mode={state.mode}
                />
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

      {/* Notifications */}
      <AnimatePresence>
        {state.isMaoDeFerro && state.phase !== 'GAME_OVER' && (
          <NotificationOverlay
            message="MAO DE FERRO!"
            subMessage="Todas as cartas serao jogadas cobertas!"
          />
        )}
        {(state.isMaoDe10 || state.isMaoDe11) && !state.isMaoDeFerro && state.phase !== 'GAME_OVER' && (
          <NotificationOverlay
            message={state.mode === 'mineiro' ? 'MAO DE 10!' : 'MAO DE 11!'}
            subMessage="Sem truco nesta mao. Voce pode ver as cartas do seu parceiro!"
          />
        )}
        {state.handMessage && (
          <MessageBanner message={state.handMessage} />
        )}
      </AnimatePresence>

      {/* Game Over */}
      <AnimatePresence>
        {state.phase === 'GAME_OVER' && (
          <GameOverScreen state={state} onNewGame={handleNewGame} />
        )}
      </AnimatePresence>
    </div>
  )
}

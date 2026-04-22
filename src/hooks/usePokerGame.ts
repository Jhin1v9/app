// ===== usePokerGame Hook =====
// Manages complete Poker game state with bot integration

import { useState, useCallback, useRef, useEffect } from 'react'
import type {
  PokerGameState,
  PlayerAction,
  GameMode,
} from '@/engine/pokerEngine'
import type { Difficulty } from '@/engine/pokerAI'
import {
  createInitialState,
  startNewHand,
  executeAction,
  getValidActions,
  getHandStrengthHint,
  escalateBlinds,
} from '@/engine/pokerEngine'
import { getBotAction } from '@/engine/pokerAI'

export interface PokerGameConfig {
  gameMode: GameMode
  maxPlayers: number
  botDifficulty: Difficulty
  botCount: number
  humanName: string
}

const defaultConfig: PokerGameConfig = {
  gameMode: 'CASH',
  maxPlayers: 6,
  botDifficulty: 'medium',
  botCount: 5,
  humanName: 'Voce',
}

export function usePokerGame(config: Partial<PokerGameConfig> = {}) {
  const mergedConfig = { ...defaultConfig, ...config }
  const [gameState, setGameState] = useState<PokerGameState>(() =>
    createInitialState(mergedConfig.gameMode, mergedConfig.maxPlayers, mergedConfig.humanName),
  )
  const [isProcessing, setIsProcessing] = useState(false)
  const [showdownRevealed, setShowdownRevealed] = useState(false)
  const [lastAction, setLastAction] = useState<{
    playerId: string
    action: string
    amount?: number
  } | null>(null)
  const [message, setMessage] = useState('')
  const botTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (botTimeoutRef.current) clearTimeout(botTimeoutRef.current)
    }
  }, [])

  // ===== Start New Hand =====
  const dealNewHand = useCallback(() => {
    setGameState(prev => {
      const result = startNewHand(prev)
      if (result.success) {
        setShowdownRevealed(false)
        setLastAction(null)
        setMessage(`Mao ${result.state.handNumber} - Pre-Flop`)
        return result.state
      }
      setMessage(result.message || 'Erro ao iniciar mao')
      return prev
    })
  }, [])

  // ===== Player Action =====
  const playerAction = useCallback(
    (action: PlayerAction, amount?: number) => {
      if (isProcessing) return
      setIsProcessing(true)

      setGameState(prev => {
        const humanIndex = prev.players.findIndex(p => p.isHuman)
        if (humanIndex === -1 || prev.activePlayerIndex !== humanIndex) {
          setIsProcessing(false)
          return prev
        }

        const result = executeAction(prev, action, amount)
        if (result.success) {
          const player = prev.players[humanIndex]
          setLastAction({
            playerId: player.id,
            action,
            amount: result.amount,
          })

          // Check if hand ended
          if (result.state.phase === 'HAND_END') {
            if (result.state.handWinners.length > 0) {
              const winners = result.state.handWinners
                .map(w => `${w.playerName} (+${w.amount})`)
                .join(', ')
              setMessage(`Vencedor: ${winners}`)
            }
            setIsProcessing(false)
            return result.state
          }

          // Trigger bot turn if next player is a bot
          const nextIdx = result.state.activePlayerIndex
          if (
            nextIdx >= 0 &&
            !result.state.players[nextIdx].isHuman &&
            result.state.players[nextIdx].status === 'ACTIVE'
          ) {
            triggerBotTurn(result.state, mergedConfig.botDifficulty)
          } else {
            setIsProcessing(false)
          }

          return result.state
        }

        setMessage(result.message || 'Acao invalida')
        setIsProcessing(false)
        return prev
      })
    },
    [isProcessing, mergedConfig.botDifficulty],
  )

  // ===== Bot Turn Logic =====
  const triggerBotTurn = useCallback(
    (currentState: PokerGameState, difficulty: Difficulty) => {
      const botIndex = currentState.activePlayerIndex
      if (botIndex < 0) {
        setIsProcessing(false)
        return
      }

      const botPlayer = currentState.players[botIndex]
      if (!botPlayer || botPlayer.isHuman || botPlayer.status !== 'ACTIVE') {
        setIsProcessing(false)
        return
      }

      const aiDecision = getBotAction(currentState, botIndex, difficulty)

      botTimeoutRef.current = setTimeout(() => {
        setGameState(prev => {
          // Re-check state is still waiting for this bot
          if (
            prev.activePlayerIndex !== botIndex ||
            prev.players[botIndex].status !== 'ACTIVE'
          ) {
            setIsProcessing(false)
            return prev
          }

          const result = executeAction(prev, aiDecision.action, aiDecision.amount)
          if (result.success) {
            setLastAction({
              playerId: botPlayer.id,
              action: aiDecision.action,
              amount: result.amount,
            })

            // Check if hand ended
            if (result.state.phase === 'HAND_END') {
              if (result.state.handWinners.length > 0) {
                const winners = result.state.handWinners
                  .map(w => `${w.playerName} (+${w.amount})`)
                  .join(', ')
                setMessage(`Vencedor: ${winners}`)
              }
              setIsProcessing(false)
              return result.state
            }

            // Check if next is also a bot
            const nextIdx = result.state.activePlayerIndex
            if (
              nextIdx >= 0 &&
              !result.state.players[nextIdx].isHuman &&
              result.state.players[nextIdx].status === 'ACTIVE'
            ) {
              triggerBotTurn(result.state, difficulty)
            } else {
              setIsProcessing(false)
            }

            return result.state
          }

          setIsProcessing(false)
          return prev
        })
      }, aiDecision.thinkTime)
    },
    [],
  )

  // ===== Escalate Blinds (Tournament) =====
  const nextBlindLevel = useCallback(() => {
    setGameState(prev => {
      if (prev.gameMode !== 'TOURNAMENT') return prev
      return escalateBlinds(prev)
    })
  }, [])

  // ===== Reset Game =====
  const resetGame = useCallback(() => {
    if (botTimeoutRef.current) clearTimeout(botTimeoutRef.current)
    setIsProcessing(false)
    setShowdownRevealed(false)
    setLastAction(null)
    setMessage('')
    const newState = createInitialState(
      mergedConfig.gameMode,
      mergedConfig.maxPlayers,
      mergedConfig.humanName,
    )
    setGameState(newState)
  }, [mergedConfig])

  // ===== Get valid actions for human =====
  const humanValidActions = useCallback(() => {
    const humanIndex = gameState.players.findIndex(p => p.isHuman)
    if (humanIndex === -1) return []
    if (gameState.activePlayerIndex !== humanIndex) return []
    return getValidActions(gameState, humanIndex)
  }, [gameState])

  // ===== Get hand strength hint =====
  const handStrengthHint = useCallback(() => {
    const human = gameState.players.find(p => p.isHuman)
    if (!human) return ''
    return getHandStrengthHint(human.holeCards, gameState.communityCards)
  }, [gameState])

  // ===== Reveal showdown cards =====
  const revealShowdown = useCallback(() => {
    setShowdownRevealed(true)
  }, [])

  // ===== Phase label =====
  const phaseLabel = useCallback(() => {
    const labels: Record<string, string> = {
      WAITING: 'Aguardando',
      DEALING: 'Distribuindo',
      PRE_FLOP: 'Pre-Flop',
      FLOP: 'Flop',
      TURN: 'Turn',
      RIVER: 'River',
      SHOWDOWN: 'Showdown',
      HAND_END: 'Fim da Mao',
    }
    return labels[gameState.phase] || gameState.phase
  }, [gameState.phase])

  return {
    gameState,
    isProcessing,
    showdownRevealed,
    lastAction,
    message,
    dealNewHand,
    playerAction,
    nextBlindLevel,
    resetGame,
    humanValidActions,
    handStrengthHint,
    revealShowdown,
    phaseLabel,
  }
}

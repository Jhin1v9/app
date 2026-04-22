// ===== useTrucoGame Hook =====
// Manages the full Truco game loop with bot AI integration

import { useCallback, useEffect, useRef, useReducer } from 'react'
import type { TrucoState, GameMode, Difficulty } from '@/engine/trucoEngine'
import {
  createInitialState,
  deal,
  playCard,
  callTruco,
  respondToTruco,
  advanceFromRoundEnd,
  startNewHand,
  getValidActions,
} from '@/engine/trucoEngine'
import { getBotAction } from '@/engine/trucoAI'

// ===== Action Types =====

type GameAction =
  | { type: 'START_GAME'; mode: GameMode; difficulty: Difficulty }
  | { type: 'DEAL' }
  | { type: 'PLAY_CARD'; playerIndex: number; cardIndex: number; covered?: boolean }
  | { type: 'CALL_TRUCO'; playerIndex: number }
  | { type: 'RESPOND_TRUCO'; response: 'accept' | 'raise' | 'flee' }
  | { type: 'ADVANCE_ROUND' }
  | { type: 'NEW_HAND' }
  | { type: 'BOT_ACTION'; botIndex: number }
  | { type: 'SET_COVERED'; covered: boolean }
  | { type: 'RESET_GAME' }
  | { type: 'SET_MESSAGE'; message: string }
  | { type: 'CLEAR_MESSAGE' }

// ===== Reducer =====

function gameReducer(state: TrucoState, action: GameAction): TrucoState {
  switch (action.type) {
    case 'START_GAME': {
      const initial = createInitialState(action.mode, action.difficulty)
      return deal(initial)
    }

    case 'DEAL':
      return deal(state)

    case 'PLAY_CARD': {
      const newState = playCard(state, action.playerIndex, action.cardIndex, action.covered)
      return newState
    }

    case 'CALL_TRUCO':
      return callTruco(state, action.playerIndex)

    case 'RESPOND_TRUCO':
      return respondToTruco(state, action.response)

    case 'ADVANCE_ROUND':
      return advanceFromRoundEnd(state)

    case 'NEW_HAND':
      return startNewHand(state)

    case 'SET_COVERED':
      return { ...state, coveredPending: action.covered }

    case 'RESET_GAME':
      return createInitialState(state.mode, state.difficulty)

    case 'SET_MESSAGE':
      return { ...state, handMessage: action.message }

    case 'CLEAR_MESSAGE':
      return { ...state, handMessage: '' }

    default:
      return state
  }
}

// ===== Hook =====

export interface UseTrucoGameReturn {
  state: TrucoState
  startGame: (mode: GameMode, difficulty: Difficulty) => void
  playPlayerCard: (cardIndex: number, covered?: boolean) => void
  callPlayerTruco: () => void
  respondPlayerTruco: (response: 'accept' | 'raise' | 'flee') => void
  setCoveredPlay: (covered: boolean) => void
  advanceRound: () => void
  newHand: () => void
  resetGame: () => void
  getValidPlayerActions: () => ReturnType<typeof getValidActions>
  isBotThinking: boolean
}

export function useTrucoGame(): UseTrucoGameReturn {
  const [state, dispatch] = useReducer(gameReducer, null, () =>
    createInitialState('mineiro', 'medium')
  )

  const botTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const advanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const messageTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Clear all timeouts on unmount
  useEffect(() => {
    return () => {
      if (botTimeoutRef.current) clearTimeout(botTimeoutRef.current)
      if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current)
      if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current)
    }
  }, [])

  // ===== Bot Turn Logic =====

  useEffect(() => {
    // Only run bot logic when it's a bot's turn and we're in a playing phase
    if (state.phase === 'GAME_OVER') return
    if (state.phase === 'SETUP') return
    if (state.phase === 'DEALING') return
    if (state.phase === 'HAND_END') return
    if (state.phase === 'ROUND_END') return

    const currentPlayer = state.currentPlayerIndex

    // Human is player 0
    if (currentPlayer === 0) return

    // Bot turn
    const delay = 1000 + Math.random() * 1000 // 1-2 second delay

    botTimeoutRef.current = setTimeout(() => {
      const action = getBotAction(state, currentPlayer, state.difficulty)

      switch (action.type) {
        case 'play_card':
          dispatch({
            type: 'PLAY_CARD',
            playerIndex: currentPlayer,
            cardIndex: action.cardIndex,
            covered: action.covered,
          })
          break

        case 'call_truco':
          dispatch({ type: 'CALL_TRUCO', playerIndex: currentPlayer })
          break

        case 'respond_truco':
          dispatch({ type: 'RESPOND_TRUCO', response: action.response })
          break

        case 'none':
        default:
          break
      }
    }, delay)

    return () => {
      if (botTimeoutRef.current) clearTimeout(botTimeoutRef.current)
    }
  }, [state.currentPlayerIndex, state.phase, state.trucoPending])

  // ===== Round End Auto-Advance =====

  useEffect(() => {
    if (state.phase === 'ROUND_END') {
      advanceTimeoutRef.current = setTimeout(() => {
        dispatch({ type: 'ADVANCE_ROUND' })
      }, 1500)
    }

    return () => {
      if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current)
    }
  }, [state.phase])

  // ===== Message Auto-Clear =====

  useEffect(() => {
    if (state.handMessage && state.phase !== 'GAME_OVER') {
      messageTimeoutRef.current = setTimeout(() => {
        dispatch({ type: 'CLEAR_MESSAGE' })
      }, 2000)
    }

    return () => {
      if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current)
    }
  }, [state.handMessage])

  // ===== Player Actions =====

  const startGame = useCallback((mode: GameMode, difficulty: Difficulty) => {
    dispatch({ type: 'START_GAME', mode, difficulty })
  }, [])

  const playPlayerCard = useCallback((cardIndex: number, covered?: boolean) => {
    const isCovered = covered ?? state.coveredPending ?? false
    dispatch({ type: 'PLAY_CARD', playerIndex: 0, cardIndex, covered: isCovered })
  }, [state.coveredPending])

  const callPlayerTruco = useCallback(() => {
    dispatch({ type: 'CALL_TRUCO', playerIndex: 0 })
  }, [])

  const respondPlayerTruco = useCallback((response: 'accept' | 'raise' | 'flee') => {
    dispatch({ type: 'RESPOND_TRUCO', response })
  }, [])

  const setCoveredPlay = useCallback((covered: boolean) => {
    dispatch({ type: 'SET_COVERED', covered })
  }, [])

  const advanceRound = useCallback(() => {
    dispatch({ type: 'ADVANCE_ROUND' })
  }, [])

  const newHand = useCallback(() => {
    dispatch({ type: 'NEW_HAND' })
  }, [])

  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' })
  }, [])

  const getValidPlayerActions = useCallback(() => {
    return getValidActions(state, 0)
  }, [state])

  return {
    state,
    startGame,
    playPlayerCard,
    callPlayerTruco,
    respondPlayerTruco,
    setCoveredPlay,
    advanceRound,
    newHand,
    resetGame,
    getValidPlayerActions,
    isBotThinking: false,
  }
}

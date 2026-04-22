// ===== Truco Bot AI =====
// 4 difficulty levels: easy, medium, hard, expert

import type {
  TrucoState,
  TrucoCard,
  Difficulty,
} from './trucoEngine'
import {
  getValidActions,
  getHandStrength,
  getTeam,
  getPartner,
  getNextTrucoValue,
} from './trucoEngine'

export type BotAction =
  | { type: 'play_card'; cardIndex: number; covered: boolean }
  | { type: 'call_truco' }
  | { type: 'respond_truco'; response: 'accept' | 'raise' | 'flee' }
  | { type: 'none' }

export function getBotAction(state: TrucoState, botIndex: number, difficulty: Difficulty): BotAction {
  const actions = getValidActions(state, botIndex)

  // If truco is pending and we need to respond
  if (state.trucoPending && state.phase === 'TRUCO_CALLED') {
    const callerTeam = state.trucoCaller !== null ? getTeam(state.trucoCaller) : null
    const myTeam = getTeam(botIndex)
    // Only respond if we're the ones being asked
    if (callerTeam !== myTeam) {
      return decideTrucoResponse(state, botIndex, difficulty)
    }
    // If we called and opponent raised, we need to respond to the raise
    if (state.trucoResponse === 'raise') {
      return decideTrucoResponse(state, botIndex, difficulty)
    }
  }

  // Decide whether to call truco before playing
  if (actions.canCallTruco) {
    const shouldCall = shouldCallTruco(state, botIndex, difficulty)
    if (shouldCall) {
      return { type: 'call_truco' }
    }
  }

  // Play a card
  if (actions.canPlay && actions.playableCards.length > 0) {
    const cardIndex = chooseCard(state, botIndex, difficulty)
    const covered = shouldPlayCovered(state, botIndex, cardIndex, difficulty)
    return { type: 'play_card', cardIndex, covered }
  }

  return { type: 'none' }
}

// ===== Truco Call Decision =====

function shouldCallTruco(state: TrucoState, botIndex: number, difficulty: Difficulty): boolean {
  const hand = state.hands[botIndex]
  const strength = getHandStrength(hand)
  const team = getTeam(botIndex)
  const scoreUs = team === 'nos' ? state.scoreNos : state.scoreEles
  const scoreThem = team === 'nos' ? state.scoreEles : state.scoreNos

  switch (difficulty) {
    case 'easy':
      return Math.random() < 0.3

    case 'medium':
      if (strength > 25) return Math.random() < 0.7
      if (strength > 18) return Math.random() < 0.3
      return false

    case 'hard': {
      const bluffing = Math.random() < 0.2
      if (bluffing && strength < 15) return true
      if (strength > 22) return Math.random() < 0.8
      if (strength > 16) return Math.random() < 0.4
      if (scoreThem - scoreUs >= 6 && scoreThem >= 9) return Math.random() < 0.5
      return false
    }

    case 'expert': {
      const roundsWon = state.roundWinners.filter(
        (w) => w === (team === 'nos' ? 0 : 1)
      ).length
      const partnerIdx = getPartner(botIndex)
      const partnerStrength = estimatePartnerStrength(state, partnerIdx)

      if (roundsWon >= 1 && strength > 18) return true
      if (partnerStrength > 20 && strength > 12) return true
      if (strength > 24) return true
      if (strength > 18) return Math.random() < 0.75
      if (scoreUs > scoreThem + 3 && Math.random() < 0.15) return true
      if (scoreThem >= 10 && strength > 12) return Math.random() < 0.6
      return false
    }
  }
  return false
}

// ===== Truco Response Decision =====

function decideTrucoResponse(
  state: TrucoState,
  botIndex: number,
  difficulty: Difficulty
): BotAction {
  const hand = state.hands[botIndex]
  const strength = getHandStrength(hand)
  const currentVal = state.lastRaiseValue ?? state.trucoValue
  const nextVal = getNextTrucoValue(currentVal, state.mode)
  const canRaise = nextVal > currentVal
  const team = getTeam(botIndex)
  const scoreThem = team === 'nos' ? state.scoreEles : state.scoreNos

  switch (difficulty) {
    case 'easy': {
      const roll = Math.random()
      if (roll < 0.3) return { type: 'respond_truco', response: 'flee' }
      if (roll < 0.8 || !canRaise) return { type: 'respond_truco', response: 'accept' }
      return { type: 'respond_truco', response: 'raise' }
    }

    case 'medium': {
      if (strength < 10) return { type: 'respond_truco', response: 'flee' }
      if (strength > 20 && canRaise && Math.random() < 0.4) {
        return { type: 'respond_truco', response: 'raise' }
      }
      if (strength > 15) return { type: 'respond_truco', response: 'accept' }
      return { type: 'respond_truco', response: Math.random() < 0.5 ? 'accept' : 'flee' }
    }

    case 'hard': {
      const roundsWon = state.roundWinners.filter(
        (w) => w === (team === 'nos' ? 0 : 1)
      ).length
      const hasManilha = hand.some((c) => c.value >= 97)

      if (strength < 8 && !hasManilha) return { type: 'respond_truco', response: 'flee' }
      if ((strength > 22 || hasManilha) && canRaise && Math.random() < 0.5) {
        return { type: 'respond_truco', response: 'raise' }
      }
      if (roundsWon >= 1 && strength > 14) return { type: 'respond_truco', response: 'accept' }
      if (strength > 14 || roundsWon >= 1) return { type: 'respond_truco', response: 'accept' }
      if (scoreThem >= 10) return { type: 'respond_truco', response: 'accept' }
      return { type: 'respond_truco', response: 'flee' }
    }

    case 'expert': {
      const roundsWon = state.roundWinners.filter(
        (w) => w === (team === 'nos' ? 0 : 1)
      ).length
      const hasManilha = hand.some((c) => c.value >= 97)
      const highCards = hand.filter((c) => c.value >= 10).length

      if (roundsWon >= 1 && strength > 10) {
        if ((hasManilha || highCards >= 2) && canRaise) {
          return { type: 'respond_truco', response: 'raise' }
        }
        return { type: 'respond_truco', response: 'accept' }
      }

      if (hasManilha) {
        if (canRaise && strength > 18) return { type: 'respond_truco', response: 'raise' }
        return { type: 'respond_truco', response: 'accept' }
      }

      if (strength > 20) {
        if (canRaise && Math.random() < 0.4) return { type: 'respond_truco', response: 'raise' }
        return { type: 'respond_truco', response: 'accept' }
      }

      if (strength > 14) return { type: 'respond_truco', response: 'accept' }
      if (scoreThem >= 10) return { type: 'respond_truco', response: 'accept' }
      if (strength < 10) return { type: 'respond_truco', response: 'flee' }
      return { type: 'respond_truco', response: 'accept' }
    }
  }
}

// ===== Card Selection =====

function chooseCard(state: TrucoState, botIndex: number, difficulty: Difficulty): number {
  const hand = state.hands[botIndex]
  if (hand.length <= 1) return 0

  const playedThisRound = state.playedCards
  const myTeam = getTeam(botIndex)
  const teamPlayed = playedThisRound.filter((p) => getTeam(p.playerIndex) === myTeam)
  const opponentPlayed = playedThisRound.filter((p) => getTeam(p.playerIndex) !== myTeam)
  const indexed = hand.map((card, idx) => ({ card, idx })).sort((a, b) => a.card.value - b.card.value)

  switch (difficulty) {
    case 'easy':
      return Math.floor(Math.random() * hand.length)

    case 'medium':
      return chooseCardMedium(indexed, opponentPlayed)

    case 'hard':
      return chooseCardHard(state, botIndex, indexed, opponentPlayed, teamPlayed)

    case 'expert':
      return chooseCardExpert(state, botIndex, indexed, opponentPlayed, teamPlayed, playedThisRound)
  }
}

function chooseCardMedium(
  indexed: { card: TrucoCard; idx: number }[],
  opponentPlayed: { card: TrucoCard; playerIndex: number; covered: boolean }[]
): number {
  if (opponentPlayed.length > 0) {
    const maxOpponent = Math.max(...opponentPlayed.map((p) => p.card.value))
    const winner = indexed.find(({ card }) => card.value > maxOpponent)
    if (winner) return winner.idx
    return indexed[0].idx
  }
  return indexed[Math.floor(indexed.length / 2)].idx
}

function chooseCardHard(
  state: TrucoState,
  botIndex: number,
  indexed: { card: TrucoCard; idx: number }[],
  opponentPlayed: { card: TrucoCard; playerIndex: number; covered: boolean }[],
  teamPlayed: { card: TrucoCard; playerIndex: number; covered: boolean }[]
): number {
  const myTeam = getTeam(botIndex)
  const roundsWon = state.roundWinners.filter((w) => w === (myTeam === 'nos' ? 0 : 1)).length

  if (roundsWon >= 1) {
    if (opponentPlayed.length > 0) {
      const maxOpp = Math.max(...opponentPlayed.map((p) => p.card.value))
      const winner = indexed.find(({ card }) => card.value > maxOpp)
      if (winner) return winner.idx
      return indexed[0].idx
    }
    return indexed[0].idx
  }

  if (opponentPlayed.length > 0) {
    const maxOpp = Math.max(...opponentPlayed.map((p) => p.card.value))
    if (teamPlayed.length > 0) {
      const maxTeam = Math.max(...teamPlayed.map((p) => p.card.value))
      if (maxTeam > maxOpp) return indexed[0].idx
    }
    const winner = indexed.find(({ card }) => card.value > maxOpp)
    if (winner) return winner.idx
    return indexed[0].idx
  }

  if (indexed.length >= 2 && indexed[indexed.length - 1].card.value >= 97) {
    return indexed[indexed.length - 2].idx
  }
  return indexed[indexed.length - 1].idx
}

function chooseCardExpert(
  state: TrucoState,
  botIndex: number,
  indexed: { card: TrucoCard; idx: number }[],
  opponentPlayed: { card: TrucoCard; playerIndex: number; covered: boolean }[],
  _teamPlayed: { card: TrucoCard; playerIndex: number; covered: boolean }[],
  playedThisRound: { card: TrucoCard; playerIndex: number; covered: boolean }[]
): number {
  const myTeam = getTeam(botIndex)
  const roundsWon = state.roundWinners.filter((w) => w === (myTeam === 'nos' ? 0 : 1)).length
  const roundsLost = state.roundWinners.filter((w) => w === (myTeam === 'nos' ? 1 : 0)).length

  if (roundsWon >= 1) {
    if (opponentPlayed.length > 0) {
      const maxOpp = Math.max(...opponentPlayed.map((p) => p.card.value))
      const partnerIdx = getPartner(botIndex)
      const partnerPlayed = playedThisRound.find((p) => p.playerIndex === partnerIdx)
      if (partnerPlayed && partnerPlayed.card.value > maxOpp) {
        return indexed[0].idx
      }
      const winner = indexed.find(({ card }) => card.value > maxOpp)
      if (winner) return winner.idx
      return indexed[0].idx
    }
    return indexed[0].idx
  }

  if (roundsLost >= 1) {
    if (opponentPlayed.length > 0) {
      const maxOpp = Math.max(...opponentPlayed.map((p) => p.card.value))
      const winner = indexed.find(({ card }) => card.value > maxOpp)
      if (winner) return winner.idx
      return indexed[indexed.length - 1].idx
    }
    if (indexed.length >= 3) return indexed[Math.floor(indexed.length / 2)].idx
    return indexed[indexed.length - 1].idx
  }

  if (opponentPlayed.length > 0) {
    const maxOpp = Math.max(...opponentPlayed.map((p) => p.card.value))
    const winner = indexed.find(({ card }) => card.value > maxOpp)
    if (winner) return winner.idx
    return indexed[0].idx
  }

  const manilhas = indexed.filter(({ card }) => card.value >= 97)
  if (manilhas.length === 1 && indexed.length >= 2) {
    const nonManilhas = indexed.filter(({ card }) => card.value < 97)
    if (nonManilhas.length > 0) return nonManilhas[nonManilhas.length - 1].idx
  }

  return indexed[indexed.length - 1].idx
}

// ===== Covered Card Decision =====

function shouldPlayCovered(
  state: TrucoState,
  botIndex: number,
  cardIndex: number,
  difficulty: Difficulty
): boolean {
  if (state.currentRound === 0) return false
  if (state.maoDeFerroActive) return true

  const hand = state.hands[botIndex]
  const card = hand[cardIndex]
  if (!card) return false

  switch (difficulty) {
    case 'easy':
      return Math.random() < 0.15

    case 'medium':
      return card.value <= 4 && Math.random() < 0.5

    case 'hard': {
      if (card.value <= 5) return true
      if (card.value <= 9 && Math.random() < 0.3) return true
      return false
    }

    case 'expert': {
      const myTeam = getTeam(botIndex)
      const teamPlayed = state.playedCards.filter((p) => getTeam(p.playerIndex) === myTeam)
      const opponentPlayed = state.playedCards.filter((p) => getTeam(p.playerIndex) !== myTeam)
      if (teamPlayed.length > 0 && opponentPlayed.length > 0) {
        const maxTeam = Math.max(...teamPlayed.map((p) => p.card.value))
        const maxOpp = Math.max(...opponentPlayed.map((p) => p.card.value))
        if (maxTeam > maxOpp) return true
      }
      if (card.value <= 5) return true
      if (card.value <= 10 && Math.random() < 0.4) return true
      return false
    }
  }
  return false
}

// ===== Helper Functions =====

function estimatePartnerStrength(state: TrucoState, partnerIndex: number): number {
  let estimate = 12
  const partnerPlays = state.playedCards.filter((p) => p.playerIndex === partnerIndex)
  if (partnerPlays.length > 0) {
    const avgPlayed = partnerPlays.reduce((sum, p) => sum + p.card.value, 0) / partnerPlays.length
    if (avgPlayed > 12) estimate = 16
    if (avgPlayed > 20) estimate = 20
  }
  return estimate
}

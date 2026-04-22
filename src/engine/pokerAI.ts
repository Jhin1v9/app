// ===== Poker AI Engine =====
// 4 difficulty levels: Easy, Medium, Hard, Expert

import type {
  PokerGameState,
  PlayerAction,
} from './pokerEngine'
import type { PokerCard } from '@/lib/gameUtils'
import {
  evaluateBestHand,
  getValidActions,
  getPositionName,
} from './pokerEngine'

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert'

export interface AIAction {
  action: PlayerAction
  amount?: number
  thinkTime: number // ms to wait before acting
}

// ===== Hand Strength Calculation =====

function calculateHandStrength(
  holeCards: PokerCard[],
  communityCards: PokerCard[],
): number {
  if (communityCards.length === 0) {
    return evaluatePreFlopStrength(holeCards)
  }

  const allCards = [...holeCards, ...communityCards]
  const result = evaluateBestHand(allCards)

  // Map hand rank to a 0-1 scale with finer granularity
  const baseStrength = result.handRankValue / 10

  // Factor in kickers for closer differentiation
  const kickerBonus = result.kickers.length > 0
    ? result.kickers[0] / 1400 // max ~0.01
    : 0

  return Math.min(1, baseStrength + kickerBonus)
}

/**
 * Pre-flop hand strength evaluation (0-1 scale)
 * Uses standard starting hand chart methodology
 */
function evaluatePreFlopStrength(holeCards: PokerCard[]): number {
  const v1 = holeCards[0].value
  const v2 = holeCards[1].value
  const high = Math.max(v1, v2)
  const low = Math.min(v1, v2)
  const suited = holeCards[0].suit === holeCards[1].suit
  const pair = v1 === v2

  // Premium pairs
  if (pair) {
    if (high >= 14) return 0.95 // AA
    if (high >= 13) return 0.90 // KK
    if (high >= 12) return 0.82 // QQ
    if (high >= 11) return 0.75 // JJ
    if (high >= 10) return 0.68 // TT
    if (high >= 8) return 0.55 // 88-99
    if (high >= 6) return 0.45 // 66-77
    return 0.35 // 22-55
  }

  // Ace-high
  if (high === 14) {
    if (low >= 13) return suited ? 0.88 : 0.82 // AK
    if (low >= 11) return suited ? 0.78 : 0.70 // AQ, AJ
    if (low >= 10) return suited ? 0.72 : 0.63 // AT
    if (low >= 8) return suited ? 0.62 : 0.55 // A9, A8
    return suited ? 0.55 : 0.45 // A7-A2
  }

  // King-high
  if (high === 13) {
    if (low >= 12) return suited ? 0.75 : 0.68 // KQ
    if (low >= 11) return suited ? 0.68 : 0.60 // KJ
    if (low >= 10) return suited ? 0.65 : 0.58 // KT
    if (low >= 9) return suited ? 0.55 : 0.48 // K9
    return suited ? 0.48 : 0.40
  }

  // Queen-high
  if (high === 12) {
    if (low >= 11) return suited ? 0.65 : 0.58 // QJ
    if (low >= 10) return suited ? 0.62 : 0.55 // QT
    if (low >= 9) return suited ? 0.52 : 0.45 // Q9
    return suited ? 0.45 : 0.35
  }

  // Jack-high
  if (high === 11) {
    if (low >= 10) return suited ? 0.60 : 0.52 // JT
    if (low >= 9) return suited ? 0.50 : 0.42 // J9
    return suited ? 0.42 : 0.32
  }

  // Ten-high and lower (suited connectors)
  if (suited && high - low <= 4) {
    return 0.35 + (high / 100)
  }

  // Connected cards
  if (high - low <= 2) {
    return 0.25 + (high / 100)
  }

  return 0.15 + (high / 200)
}

/**
 * Calculate pot odds (call amount / total pot after call)
 */
function calculatePotOdds(state: PokerGameState, playerIndex: number): number {
  const player = state.players[playerIndex]
  const callAmount = state.pot.currentBet - player.currentBet
  if (callAmount <= 0) return 1

  const totalPot = state.pot.mainPot + callAmount
  return callAmount / totalPot
}

/**
 * Calculate stack-to-pot ratio
 */
function calculateSPR(state: PokerGameState, playerIndex: number): number {
  const player = state.players[playerIndex]
  const pot = state.pot.mainPot || 1
  return player.chips / pot
}

/**
 * Estimate drawing odds based on cards seen
 */
function estimateDrawOdds(
  holeCards: PokerCard[],
  communityCards: PokerCard[],
): number {
  const allCards = [...holeCards, ...communityCards]
  const result = evaluateBestHand(allCards)

  // If we already have a strong hand, good odds
  if (result.handRankValue >= 5) return 0.8 // straight+
  if (result.handRankValue >= 4) return 0.6 // three of a kind

  // Count outs for common draws
  const values = allCards.map(c => c.value)
  const suits = allCards.map(c => c.suit)

  // Flush draw check
  const suitCounts: Record<string, number> = {}
  for (const s of suits) {
    suitCounts[s] = (suitCounts[s] || 0) + 1
  }
  const maxSuitCount = Math.max(...Object.values(suitCounts), 0)
  if (maxSuitCount >= 4) return 0.35 // flush draw ~35%

  // Straight draw check (simplified)
  const uniqueValues = [...new Set(values)].sort((a, b) => b - a)
  if (uniqueValues.length >= 4) {
    for (let i = 0; i <= uniqueValues.length - 4; i++) {
      if (uniqueValues[i] - uniqueValues[i + 3] <= 4) {
        return 0.32 // open-ended or gutshot ~32%
      }
    }
  }

  return 0.1 // no draw
}

// ===== Position Awareness =====

function getPositionFactor(
  playerIndex: number,
  state: PokerGameState,
): number {
  const posName = getPositionName(
    playerIndex,
    state.dealerPosition,
    state.players.length,
  )
  // Late position is better (can act with weaker hands)
  const positionStrength: Record<string, number> = {
    D: 1.0,
    BTN: 1.0,
    CO: 0.9,
    MP: 0.75,
    UTG: 0.6,
    BB: 0.7,
    SB: 0.5,
  }
  return positionStrength[posName] || 0.7
}

// ===== Difficulty-Based Decision Making =====

export function getBotAction(
  state: PokerGameState,
  botIndex: number,
  difficulty: Difficulty,
): AIAction {
  const bot = state.players[botIndex]
  const handStrength = calculateHandStrength(bot.holeCards, state.communityCards)
  const potOdds = calculatePotOdds(state, botIndex)
  const spr = calculateSPR(state, botIndex)
  const positionFactor = getPositionFactor(botIndex, state)
  const drawOdds = estimateDrawOdds(bot.holeCards, state.communityCards)

  switch (difficulty) {
    case 'easy':
      return easyBotAction(state, botIndex, handStrength)
    case 'medium':
      return mediumBotAction(state, botIndex, handStrength, potOdds, positionFactor)
    case 'hard':
      return hardBotAction(state, botIndex, handStrength, potOdds, positionFactor, spr, drawOdds)
    case 'expert':
      return expertBotAction(state, botIndex, handStrength, potOdds, positionFactor, spr, drawOdds)
    default:
      return easyBotAction(state, botIndex, handStrength)
  }
}

// ===== Easy Bot: Loose-Aggressive, Random =====

function easyBotAction(
  state: PokerGameState,
  botIndex: number,
  handStrength: number,
): AIAction {
  const validActions = getValidActions(state, botIndex)
  const canFold = validActions.find(a => a.action === 'FOLD')?.enabled ?? false
  const canCheck = validActions.find(a => a.action === 'CHECK')?.enabled ?? false
  const canCall = validActions.find(a => a.action === 'CALL')?.enabled ?? false
  const canBet = validActions.find(a => a.action === 'BET')?.enabled ?? false
  const canRaise = validActions.find(a => a.action === 'RAISE')?.enabled ?? false
  const canAllIn = validActions.find(a => a.action === 'ALL_IN')?.enabled ?? false
  const callAmount = validActions.find(a => a.action === 'CALL')?.amount || 0
  const bot = state.players[botIndex]

  // Random behavior: often makes irrational decisions
  const roll = Math.random()

  // 30% chance to do something completely random regardless of hand
  if (roll < 0.3) {
    if (canAllIn && roll < 0.05) {
      return { action: 'ALL_IN', amount: bot.chips, thinkTime: 1500 }
    }
    if (canRaise && roll < 0.15) {
      const raiseAmount = state.pot.currentBet + state.blinds.bigBlind * (1 + Math.floor(Math.random() * 4))
      return { action: 'RAISE', amount: Math.min(raiseAmount, bot.chips + bot.currentBet), thinkTime: 1200 }
    }
    if (canBet) {
      const betSize = state.pot.mainPot * (0.5 + Math.random())
      return { action: 'BET', amount: Math.min(Math.max(betSize, state.blinds.bigBlind), bot.chips), thinkTime: 1000 }
    }
    if (canCall) {
      return { action: 'CALL', amount: callAmount, thinkTime: 800 }
    }
    if (canCheck) {
      return { action: 'CHECK', thinkTime: 600 }
    }
  }

  // Otherwise: loose play, call with weak hands, bluff often
  if (handStrength > 0.8) {
    // Strong hand - bet/raise
    if (canRaise) {
      const raiseAmount = state.pot.currentBet + state.pot.mainPot * 0.75
      return { action: 'RAISE', amount: Math.min(raiseAmount, bot.chips + bot.currentBet), thinkTime: 1200 }
    }
    if (canBet) {
      return { action: 'BET', amount: Math.min(state.pot.mainPot * 0.75, bot.chips), thinkTime: 1000 }
    }
    if (canCall) return { action: 'CALL', amount: callAmount, thinkTime: 800 }
    if (canCheck) return { action: 'CHECK', thinkTime: 600 }
  }

  if (handStrength > 0.4) {
    // Medium hand - often call (loose)
    if (canCall && Math.random() > 0.2) {
      return { action: 'CALL', amount: callAmount, thinkTime: 800 }
    }
    if (canCheck) return { action: 'CHECK', thinkTime: 600 }
  }

  // Weak hand - sometimes bluff (easy bluffs randomly)
  if (Math.random() < 0.25 && canBet) {
    return { action: 'BET', amount: Math.min(state.pot.mainPot * 0.5, bot.chips), thinkTime: 1000 }
  }

  if (canCheck) return { action: 'CHECK', thinkTime: 500 }
  if (canFold && canFold) return { action: 'FOLD', thinkTime: 400 }

  // Fallback
  const enabledAction = validActions.find(a => a.enabled)
  if (enabledAction) {
    return { action: enabledAction.action, amount: enabledAction.amount, thinkTime: 800 }
  }

  return { action: 'FOLD', thinkTime: 400 }
}

// ===== Medium Bot: Basic Strategy =====

function mediumBotAction(
  state: PokerGameState,
  botIndex: number,
  handStrength: number,
  potOdds: number,
  positionFactor: number,
): AIAction {
  const validActions = getValidActions(state, botIndex)
  const canCheck = validActions.find(a => a.action === 'CHECK')?.enabled ?? false
  const canCall = validActions.find(a => a.action === 'CALL')?.enabled ?? false
  const canBet = validActions.find(a => a.action === 'BET')?.enabled ?? false
  const canRaise = validActions.find(a => a.action === 'RAISE')?.enabled ?? false
  const callAmount = validActions.find(a => a.action === 'CALL')?.amount || 0
  const bot = state.players[botIndex]

  const adjustedStrength = handStrength * positionFactor

  // Occasional bluff (15%)
  if (Math.random() < 0.15 && (canBet || canRaise)) {
    if (canRaise) {
      return { action: 'RAISE', amount: state.pot.currentBet + state.pot.mainPot * 0.6, thinkTime: 1500 }
    }
    if (canBet) {
      return { action: 'BET', amount: Math.min(state.pot.mainPot * 0.6, bot.chips), thinkTime: 1200 }
    }
  }

  // Strong hand (>70% adjusted)
  if (adjustedStrength > 0.7) {
    if (canRaise) {
      const raiseSize = state.pot.mainPot * (0.75 + Math.random() * 0.5)
      return { action: 'RAISE', amount: Math.min(state.pot.currentBet + raiseSize, bot.chips + bot.currentBet), thinkTime: 1400 }
    }
    if (canBet) {
      return { action: 'BET', amount: Math.min(state.pot.mainPot * 0.75, bot.chips), thinkTime: 1200 }
    }
    if (canCall) return { action: 'CALL', amount: callAmount, thinkTime: 900 }
    if (canCheck) return { action: 'CHECK', thinkTime: 700 }
  }

  // Medium hand (40-70% adjusted) - consider pot odds
  if (adjustedStrength > 0.4) {
    // Call if pot odds are favorable
    if (canCall && (potOdds < adjustedStrength || potOdds < 0.3)) {
      return { action: 'CALL', amount: callAmount, thinkTime: 1000 }
    }
    if (canCheck) return { action: 'CHECK', thinkTime: 700 }
    if (canCall) return { action: 'CALL', amount: callAmount, thinkTime: 900 }
  }

  // Weak hand (<40% adjusted)
  if (canCheck) return { action: 'CHECK', thinkTime: 600 }
  if (canCall && potOdds < 0.15) {
    // Call with very good pot odds even with weak hand
    return { action: 'CALL', amount: callAmount, thinkTime: 800 }
  }

  return { action: 'FOLD', thinkTime: 500 }
}

// ===== Hard Bot: Tight-Aggressive, Equity-Based =====

function hardBotAction(
  state: PokerGameState,
  botIndex: number,
  handStrength: number,
  potOdds: number,
  positionFactor: number,
  spr: number,
  drawOdds: number,
): AIAction {
  const validActions = getValidActions(state, botIndex)
  const canCheck = validActions.find(a => a.action === 'CHECK')?.enabled ?? false
  const canCall = validActions.find(a => a.action === 'CALL')?.enabled ?? false
  const canBet = validActions.find(a => a.action === 'BET')?.enabled ?? false
  const canRaise = validActions.find(a => a.action === 'RAISE')?.enabled ?? false
  const canAllIn = validActions.find(a => a.action === 'ALL_IN')?.enabled ?? false
  const callAmount = validActions.find(a => a.action === 'CALL')?.amount || 0
  const bot = state.players[botIndex]

  // Combine made hand strength with draw potential
  const effectiveStrength = Math.max(handStrength, drawOdds * 0.7) * positionFactor

  // Controlled bluffing (20% chance in good spots)
  const isGoodBluffSpot =
    state.communityCards.length >= 3 &&
    potOdds > 0.2 &&
    positionFactor >= 0.9

  if (isGoodBluffSpot && Math.random() < 0.2 && (canBet || canRaise)) {
    if (canRaise) {
      return { action: 'RAISE', amount: state.pot.currentBet + state.pot.mainPot * 0.75, thinkTime: 1800 }
    }
    if (canBet) {
      return { action: 'BET', amount: Math.min(state.pot.mainPot * 0.65, bot.chips), thinkTime: 1600 }
    }
  }

  // Strong made hand (>75% effective) - value bet aggressively
  if (effectiveStrength > 0.75) {
    const betSizing = spr < 3 ? 1.0 : spr < 6 ? 0.75 : 0.5

    if (canAllIn && (handStrength > 0.9 || spr < 2)) {
      return { action: 'ALL_IN', amount: bot.chips, thinkTime: 2000 }
    }
    if (canRaise) {
      const raiseSize = state.pot.mainPot * betSizing
      return { action: 'RAISE', amount: Math.min(state.pot.currentBet + raiseSize, bot.chips + bot.currentBet), thinkTime: 1600 }
    }
    if (canBet) {
      return { action: 'BET', amount: Math.min(state.pot.mainPot * betSizing, bot.chips), thinkTime: 1400 }
    }
    if (canCall) return { action: 'CALL', amount: callAmount, thinkTime: 1000 }
    if (canCheck) return { action: 'CHECK', thinkTime: 700 }
  }

  // Medium strength (45-75%) - play based on pot odds and position
  if (effectiveStrength > 0.45) {
    // Draw with good odds - call
    if (drawOdds > 0.3 && canCall && potOdds < drawOdds) {
      return { action: 'CALL', amount: callAmount, thinkTime: 1200 }
    }

    // Semi-bluff on draw
    if (drawOdds > 0.3 && (canBet || canRaise) && Math.random() < 0.3) {
      if (canRaise) {
        return { action: 'RAISE', amount: state.pot.currentBet + state.pot.mainPot * 0.5, thinkTime: 1500 }
      }
      if (canBet) {
        return { action: 'BET', amount: Math.min(state.pot.mainPot * 0.5, bot.chips), thinkTime: 1300 }
      }
    }

    // In position with medium hand, bet for control
    if (positionFactor >= 0.9 && canBet && effectiveStrength > 0.55) {
      return { action: 'BET', amount: Math.min(state.pot.mainPot * 0.5, bot.chips), thinkTime: 1200 }
    }

    if (canCall && potOdds < effectiveStrength) {
      return { action: 'CALL', amount: callAmount, thinkTime: 1100 }
    }
    if (canCheck) return { action: 'CHECK', thinkTime: 800 }
    if (canCall) return { action: 'CALL', amount: callAmount, thinkTime: 1000 }
  }

  // Weak hand (<45%)
  if (canCheck) return { action: 'CHECK', thinkTime: 700 }

  // Only call with incredible pot odds
  if (canCall && potOdds < 0.1) {
    return { action: 'CALL', amount: callAmount, thinkTime: 900 }
  }

  return { action: 'FOLD', thinkTime: 600 }
}

// ===== Expert Bot: GTO-like, Range-Based, Exploitative =====

function expertBotAction(
  state: PokerGameState,
  botIndex: number,
  handStrength: number,
  potOdds: number,
  positionFactor: number,
  spr: number,
  drawOdds: number,
): AIAction {
  const validActions = getValidActions(state, botIndex)
  const canCheck = validActions.find(a => a.action === 'CHECK')?.enabled ?? false
  const canCall = validActions.find(a => a.action === 'CALL')?.enabled ?? false
  const canBet = validActions.find(a => a.action === 'BET')?.enabled ?? false
  const canRaise = validActions.find(a => a.action === 'RAISE')?.enabled ?? false
  const canAllIn = validActions.find(a => a.action === 'ALL_IN')?.enabled ?? false
  const callAmount = validActions.find(a => a.action === 'CALL')?.amount || 0
  const bot = state.players[botIndex]

  // Expert uses exact equity calculation
  const equity = calculateEquity(bot.holeCards, state.communityCards, handStrength)
  const adjustedEquity = equity * positionFactor

  // Count active opponents for bet sizing
  const activeOpponents = state.players.filter(
    (p, i) => i !== botIndex && p.status !== 'FOLDED' && p.status !== 'ELIMINATED',
  ).length

  // GTO bet sizing: smaller against more opponents
  const gtoBetSize = state.pot.mainPot * (0.33 + (1 / (activeOpponents + 1)) * 0.3)

  // Advanced bluffing with blocker consideration (30%)
  // "Blockers" = having cards that block opponent's strong hands
  const hasBlockers = hasStrongBlockers(bot.holeCards, state.communityCards)
  const isGoodBluffSpot =
    state.communityCards.length >= 3 &&
    positionFactor >= 0.85 &&
    activeOpponents <= 2

  if (isGoodBluffSpot && hasBlockers && Math.random() < 0.3 && (canBet || canRaise)) {
    if (canRaise) {
      return { action: 'RAISE', amount: state.pot.currentBet + gtoBetSize * 1.2, thinkTime: 2200 }
    }
    if (canBet) {
      return { action: 'BET', amount: Math.min(gtoBetSize * 1.1, bot.chips), thinkTime: 2000 }
    }
  }

  // Premium hand - max value
  if (adjustedEquity > 0.8) {
    if (canAllIn && (spr < 4 || adjustedEquity > 0.92)) {
      return { action: 'ALL_IN', amount: bot.chips, thinkTime: 2500 }
    }
    if (canRaise) {
      // Overbet for max value with nuts
      const valueSize = adjustedEquity > 0.9 ? gtoBetSize * 1.5 : gtoBetSize
      return { action: 'RAISE', amount: Math.min(state.pot.currentBet + valueSize, bot.chips + bot.currentBet), thinkTime: 2000 }
    }
    if (canBet) {
      return { action: 'BET', amount: Math.min(gtoBetSize, bot.chips), thinkTime: 1800 }
    }
    if (canCall) return { action: 'CALL', amount: callAmount, thinkTime: 1200 }
    if (canCheck) return { action: 'CHECK', thinkTime: 800 }
  }

  // Strong hand (60-80%) - value bet
  if (adjustedEquity > 0.6) {
    const betSize = gtoBetSize * (0.7 + Math.random() * 0.3)

    if (canRaise && spr < 5) {
      return { action: 'RAISE', amount: Math.min(state.pot.currentBet + betSize, bot.chips + bot.currentBet), thinkTime: 1800 }
    }
    if (canBet) {
      return { action: 'BET', amount: Math.min(betSize, bot.chips), thinkTime: 1600 }
    }
    if (canCall && potOdds < adjustedEquity) {
      return { action: 'CALL', amount: callAmount, thinkTime: 1300 }
    }
    if (canCheck) return { action: 'CHECK', thinkTime: 900 }
  }

  // Medium hand (45-60%) - mixed strategy
  if (adjustedEquity > 0.45) {
    // Check-call with draws, occasional bet
    if (drawOdds > 0.25 && canCall && potOdds < drawOdds * 1.2) {
      return { action: 'CALL', amount: callAmount, thinkTime: 1400 }
    }

    // Mixed: sometimes bet medium hands for protection
    if (Math.random() < 0.4 && canBet && state.communityCards.length >= 3) {
      return { action: 'BET', amount: Math.min(gtoBetSize * 0.66, bot.chips), thinkTime: 1600 }
    }

    if (canCall && potOdds < adjustedEquity * 0.8) {
      return { action: 'CALL', amount: callAmount, thinkTime: 1300 }
    }
    if (canCheck) return { action: 'CHECK', thinkTime: 1000 }
  }

  // Weak hand (<45%) - pure GTO: fold unless incredible odds or bluff spot
  if (canCheck) return { action: 'CHECK', thinkTime: 800 }

  // Call only with incredible pot odds (drawing)
  if (canCall && potOdds < 0.08) {
    return { action: 'CALL', amount: callAmount, thinkTime: 1100 }
  }

  return { action: 'FOLD', thinkTime: 700 }
}

// ===== Helper Functions =====

/**
 * More accurate equity calculation using Monte Carlo simulation
 */
function calculateEquity(holeCards: PokerCard[], communityCards: PokerCard[], _handStrength: number): number {
  const knownStrength = calculateHandStrength(holeCards, communityCards)

  // Adjust based on number of cards to come
  const cardsToCome = 5 - communityCards.length
  if (cardsToCome <= 0) return knownStrength

  // Monte Carlo: simulate random opponent hands and future cards
  let wins = 0
  let ties = 0
  let total = 0

  const allKnownCards = [...holeCards, ...communityCards]
  const remainingDeck = buildRemainingDeck(allKnownCards)

  const iterations = Math.min(200, remainingDeck.length * 10)
  for (let i = 0; i < iterations; i++) {
    const shuffled = [...remainingDeck].sort(() => Math.random() - 0.5)

    // Random opponent hole cards
    const oppHole = [shuffled[0], shuffled[1]]

    // Future community cards
    const futureCards = shuffled.slice(2, 2 + cardsToCome)
    const finalCommunity = [...communityCards, ...futureCards]

    const myBest = evaluateBestHand([...holeCards, ...finalCommunity])
    const oppBest = evaluateBestHand([...oppHole, ...finalCommunity])
    const comparison = myBest.handRankValue - oppBest.handRankValue ||
      (myBest.kickers[0] || 0) - (oppBest.kickers[0] || 0)

    if (comparison > 0) wins++
    else if (comparison === 0) ties++
    total++
  }

  if (total === 0) return knownStrength

  // Equity = win% + tie%/2
  return (wins / total) + (ties / total) * 0.5
}

function buildRemainingDeck(knownCards: PokerCard[]): PokerCard[] {
  const suits = ['hearts', 'diamonds', 'clubs', 'spades'] as const
  const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'] as const
  const rankValues: Record<string, number> = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
    'J': 11, 'Q': 12, 'K': 13, 'A': 14,
  }

  const deck: PokerCard[] = []
  for (const suit of suits) {
    for (const rank of ranks) {
      const isKnown = knownCards.some(
        c => c.suit === suit && c.rank === rank,
      )
      if (!isKnown) {
        deck.push({ suit, rank, value: rankValues[rank] })
      }
    }
  }
  return deck
}

/**
 * Check if hole cards block opponent's strong hands
 */
function hasStrongBlockers(holeCards: PokerCard[], communityCards: PokerCard[]): boolean {
  if (communityCards.length < 3) return false

  const allCards = [...holeCards, ...communityCards]
  const suits = allCards.map(c => c.suit)

  // Check for flush blockers (holding cards of the dominant suit)
  const suitCounts: Record<string, number> = {}
  for (const s of suits) {
    suitCounts[s] = (suitCounts[s] || 0) + 1
  }
  const maxCount = Math.max(...Object.values(suitCounts), 0)
  if (maxCount >= 4) {
    // We have cards of the likely flush suit
    return true
  }

  // Check for straight blockers (holding key connector cards)
  const values = allCards.map(c => c.value).sort((a, b) => b - a)
  if (values.length >= 4) {
    const gaps = values[0] - values[values.length - 1]
    if (gaps <= 5) return true // close to straight
  }

  // Ace blockers are always valuable
  if (holeCards.some(c => c.value === 14)) return true

  return false
}

// ===== Think time generation =====

export function getThinkTime(difficulty: Difficulty): number {
  switch (difficulty) {
    case 'easy':
      return 600 + Math.random() * 800
    case 'medium':
      return 900 + Math.random() * 1000
    case 'hard':
      return 1200 + Math.random() * 1500
    case 'expert':
      return 1500 + Math.random() * 2000
    default:
      return 1000
  }
}

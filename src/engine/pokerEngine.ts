// ===== Poker Engine - Texas Hold'em =====
// Complete game logic: deck, hand evaluation, betting, showdown, side pots

import type { PokerCard, HandResult } from '@/lib/gameUtils'
import {
  createPokerDeck,
  shuffleDeck,
  evaluatePokerHand,
  comparePokerHands,
} from '@/lib/gameUtils'

// ===== Types =====

export type GamePhase =
  | 'WAITING'
  | 'DEALING'
  | 'PRE_FLOP'
  | 'FLOP'
  | 'TURN'
  | 'RIVER'
  | 'SHOWDOWN'
  | 'HAND_END'

export type PlayerAction = 'FOLD' | 'CHECK' | 'CALL' | 'BET' | 'RAISE' | 'ALL_IN'

export type GameMode = 'CASH' | 'TOURNAMENT'

export type PlayerStatus = 'ACTIVE' | 'FOLDED' | 'ALL_IN' | 'ELIMINATED'

export interface Player {
  id: string
  name: string
  avatar: string
  chips: number
  holeCards: PokerCard[]
  status: PlayerStatus
  currentBet: number
  totalBetThisHand: number
  isDealer: boolean
  isSmallBlind: boolean
  isBigBlind: boolean
  isHuman: boolean
  position: number // 0 = first after dealer (SB)
}

export interface SidePot {
  amount: number
  eligiblePlayers: string[] // player ids
}

export interface Pot {
  mainPot: number
  sidePots: SidePot[]
  currentBet: number
  minRaise: number
}

export interface Blinds {
  smallBlind: number
  bigBlind: number
  level: number
  nextSB: number
  nextBB: number
}

export interface HandWinner {
  playerId: string
  playerName: string
  amount: number
  handResult: HandResult
}

export interface PokerGameState {
  phase: GamePhase
  players: Player[]
  communityCards: PokerCard[]
  deck: PokerCard[]
  pot: Pot
  blinds: Blinds
  dealerPosition: number
  activePlayerIndex: number
  handWinners: HandWinner[]
  handNumber: number
  gameMode: GameMode
  maxPlayers: number
  handHistory: HandHistoryEntry[]
}

export interface HandHistoryEntry {
  handNumber: number
  potSize: number
  winners: HandWinner[]
  communityCards: PokerCard[]
  timestamp: number
}

// ===== Constants =====

export const HAND_RANK_NAMES_PT: Record<string, string> = {
  'high-card': 'Carta Alta',
  pair: 'Par',
  'two-pair': 'Dois Pares',
  'three-kind': 'Trinca',
  straight: 'Sequencia',
  flush: 'Flush',
  'full-house': 'Full House',
  'four-kind': 'Quadra',
  'straight-flush': 'Straight Flush',
  'royal-flush': 'Royal Flush',
}

export const ACTION_NAMES_PT: Record<PlayerAction, string> = {
  FOLD: 'Desistir',
  CHECK: 'Passar',
  CALL: 'Pagar',
  BET: 'Apostar',
  RAISE: 'Aumentar',
  ALL_IN: 'Tudo In',
}

export const INITIAL_BLINDS = {
  cash: { smallBlind: 10, bigBlind: 20 },
  tournament: { smallBlind: 25, bigBlind: 50 },
}

export const TOURNAMENT_BLIND_LEVELS = [
  { sb: 25, bb: 50 },
  { sb: 50, bb: 100 },
  { sb: 100, bb: 200 },
  { sb: 200, bb: 400 },
  { sb: 300, bb: 600 },
  { sb: 500, bb: 1000 },
  { sb: 1000, bb: 2000 },
  { sb: 2000, bb: 4000 },
  { sb: 3000, bb: 6000 },
  { sb: 5000, bb: 10000 },
]

// ===== Hand Evaluation (7-card) =====

/**
 * Find the best 5-card hand from 7 cards (2 hole + 5 community)
 * Returns the best possible HandResult
 */
export function evaluateBestHand(sevenCards: PokerCard[]): HandResult {
  if (sevenCards.length < 5) {
    return {
      handRank: 'high-card',
      handRankValue: 1,
      kickers: sevenCards.map(c => c.value).sort((a, b) => b - a),
      description: 'Carta Alta',
    }
  }

  // Generate all combinations of 5 cards from 7
  let bestResult: HandResult | null = null

  const combinations = getCombinations(sevenCards, 5)
  for (const fiveCards of combinations) {
    const result = evaluatePokerHand(fiveCards)
    if (!bestResult || comparePokerHands(result, bestResult) > 0) {
      bestResult = result
    }
  }

  return bestResult!
}

function getCombinations<T>(arr: T[], k: number): T[][] {
  if (k === 0) return [[]]
  if (arr.length === 0) return []
  const [first, ...rest] = arr
  const withFirst = getCombinations(rest, k - 1).map(c => [first, ...c])
  const withoutFirst = getCombinations(rest, k)
  return [...withFirst, ...withoutFirst]
}

// ===== Game State Initialization =====

export function createInitialState(
  gameMode: GameMode = 'CASH',
  maxPlayers: number = 6,
  humanName: string = 'Voce',
): PokerGameState {
  const players = createPlayers(maxPlayers, humanName, gameMode)
  const blinds: Blinds =
    gameMode === 'CASH'
      ? { ...INITIAL_BLINDS.cash, level: 1, nextSB: 0, nextBB: 0 }
      : { ...INITIAL_BLINDS.tournament, level: 1, nextSB: TOURNAMENT_BLIND_LEVELS[1]?.sb ?? 0, nextBB: TOURNAMENT_BLIND_LEVELS[1]?.bb ?? 0 }

  return {
    phase: 'WAITING',
    players,
    communityCards: [],
    deck: [],
    pot: { mainPot: 0, sidePots: [], currentBet: 0, minRaise: blinds.bigBlind },
    blinds,
    dealerPosition: 0,
    activePlayerIndex: -1,
    handWinners: [],
    handNumber: 0,
    gameMode,
    maxPlayers,
    handHistory: [],
  }
}

function createPlayers(
  count: number,
  humanName: string,
  gameMode: GameMode,
): Player[] {
  const botNames = ['Carlos', 'Ana', 'Roberto', 'Maria', 'Pedro', 'Julia']
  const startingChips = gameMode === 'CASH' ? 1000 : 1500

  const players: Player[] = []

  // Human player is always index 0 (bottom position)
  players.push({
    id: 'human',
    name: humanName,
    avatar: '/avatar-default-1.png',
    chips: startingChips,
    holeCards: [],
    status: 'ACTIVE',
    currentBet: 0,
    totalBetThisHand: 0,
    isDealer: false,
    isSmallBlind: false,
    isBigBlind: false,
    isHuman: true,
    position: 0,
  })

  // Bots fill remaining seats
  for (let i = 1; i < count; i++) {
    players.push({
      id: `bot-${i}`,
      name: botNames[i - 1] || `Bot ${i}`,
      avatar: `/bot-${['easy', 'medium', 'hard', 'expert'][i % 4]}.png`,
      chips: startingChips,
      holeCards: [],
      status: 'ACTIVE',
      currentBet: 0,
      totalBetThisHand: 0,
      isDealer: false,
      isSmallBlind: false,
      isBigBlind: false,
      isHuman: false,
      position: i,
    })
  }

  return players
}

// ===== Game Actions =====

export interface ActionResult {
  state: PokerGameState
  success: boolean
  message?: string
  action?: PlayerAction
  amount?: number
}

/**
 * Start a new hand - deal cards, post blinds
 */
export function startNewHand(state: PokerGameState): ActionResult {
  if (state.players.filter(p => p.chips > 0 && p.status !== 'ELIMINATED').length < 2) {
    return { state, success: false, message: 'Nao ha jogadores suficientes' }
  }

  const newState = deepCloneState(state)
  newState.handNumber++
  newState.phase = 'DEALING'
  newState.handWinners = []
  newState.communityCards = []

  // Reset player state for new hand
  for (const player of newState.players) {
    if (player.chips > 0) {
      player.status = 'ACTIVE'
    }
    player.holeCards = []
    player.currentBet = 0
    player.totalBetThisHand = 0
    player.isDealer = false
    player.isSmallBlind = false
    player.isBigBlind = false
  }

  // Move dealer button
  const activePlayers = newState.players.filter(p => p.chips > 0 && p.status !== 'ELIMINATED')
  if (activePlayers.length < 2) {
    return { state, success: false, message: 'Nao ha jogadores suficientes' }
  }

  // Find next dealer position
  do {
    newState.dealerPosition = (newState.dealerPosition + 1) % newState.players.length
  } while (newState.players[newState.dealerPosition].chips <= 0)

  // Assign dealer
  newState.players[newState.dealerPosition].isDealer = true

  // Assign blinds (next two active players after dealer)
  const activeIndices = getActivePlayerIndices(newState)
  const dealerIdxInActive = activeIndices.indexOf(newState.dealerPosition)
  const sbIdx = activeIndices[(dealerIdxInActive + 1) % activeIndices.length]
  const bbIdx = activeIndices[(dealerIdxInActive + 2) % activeIndices.length]

  newState.players[sbIdx].isSmallBlind = true
  newState.players[bbIdx].isBigBlind = true

  // Create and shuffle deck
  newState.deck = shuffleDeck(createPokerDeck())

  // Deal 2 hole cards to each active player
  let cardIdx = 0
  for (let c = 0; c < 2; c++) {
    for (const pIdx of activeIndices) {
      if (cardIdx < newState.deck.length) {
        newState.players[pIdx].holeCards.push(newState.deck[cardIdx])
        cardIdx++
      }
    }
  }
  newState.deck = newState.deck.slice(cardIdx)

  // Post blinds
  const sbAmount = newState.blinds.smallBlind
  const bbAmount = newState.blinds.bigBlind

  newState.players[sbIdx].chips -= Math.min(sbAmount, newState.players[sbIdx].chips)
  newState.players[sbIdx].currentBet = Math.min(sbAmount, newState.players[sbIdx].chips + newState.players[sbIdx].currentBet)
  newState.players[sbIdx].totalBetThisHand = newState.players[sbIdx].currentBet

  newState.players[bbIdx].chips -= Math.min(bbAmount, newState.players[bbIdx].chips)
  newState.players[bbIdx].currentBet = Math.min(bbAmount, newState.players[bbIdx].chips + newState.players[bbIdx].currentBet)
  newState.players[bbIdx].totalBetThisHand = newState.players[bbIdx].currentBet

  // Set initial pot
  newState.pot = {
    mainPot: newState.players[sbIdx].currentBet + newState.players[bbIdx].currentBet,
    sidePots: [],
    currentBet: bbAmount,
    minRaise: bbAmount,
  }

  // Check if blinds went all-in
  if (newState.players[sbIdx].chips === 0 && newState.players[sbIdx].currentBet > 0) {
    newState.players[sbIdx].status = 'ALL_IN'
  }
  if (newState.players[bbIdx].chips === 0 && newState.players[bbIdx].currentBet > 0) {
    newState.players[bbIdx].status = 'ALL_IN'
  }

  // Start with player after big blind
  const bbIdxInActive = activeIndices.indexOf(bbIdx)
  const firstToAct = activeIndices[(bbIdxInActive + 1) % activeIndices.length]
  newState.activePlayerIndex = firstToAct

  // Skip if only one player can act (everyone else all-in)
  newState.phase = 'PRE_FLOP'

  return { state: newState, success: true }
}

/**
 * Execute a player action
 */
export function executeAction(
  state: PokerGameState,
  action: PlayerAction,
  amount?: number,
): ActionResult {
  const player = state.players[state.activePlayerIndex]
  if (!player || (player.status !== 'ACTIVE' && player.status !== 'ALL_IN')) {
    return { state, success: false, message: 'Nao e a vez deste jogador' }
  }

  const newState = deepCloneState(state)
  const currentPlayer = newState.players[newState.activePlayerIndex]

  switch (action) {
    case 'FOLD':
      return handleFold(newState, currentPlayer)
    case 'CHECK':
      return handleCheck(newState, currentPlayer)
    case 'CALL':
      return handleCall(newState, currentPlayer)
    case 'BET':
      return handleBet(newState, currentPlayer, amount || 0)
    case 'RAISE':
      return handleRaise(newState, currentPlayer, amount || 0)
    case 'ALL_IN':
      return handleAllIn(newState, currentPlayer)
    default:
      return { state, success: false, message: 'Acao invalida' }
  }
}

function handleFold(state: PokerGameState, player: Player): ActionResult {
  player.status = 'FOLDED'
  return advanceTurn(state, 'FOLD')
}

function handleCheck(state: PokerGameState, player: Player): ActionResult {
  if (state.pot.currentBet > 0 && player.currentBet < state.pot.currentBet) {
    return { state, success: false, message: 'Nao pode passar com aposta pendente' }
  }
  return advanceTurn(state, 'CHECK')
}

function handleCall(state: PokerGameState, player: Player): ActionResult {
  const callAmount = state.pot.currentBet - player.currentBet
  if (callAmount <= 0) {
    return advanceTurn(state, 'CHECK')
  }

  const actualCall = Math.min(callAmount, player.chips)
  player.chips -= actualCall
  player.currentBet += actualCall
  player.totalBetThisHand += actualCall
  state.pot.mainPot += actualCall

  if (player.chips === 0) {
    player.status = 'ALL_IN'
  }

  return advanceTurn(state, 'CALL', actualCall)
}

function handleBet(state: PokerGameState, player: Player, amount: number): ActionResult {
  if (state.pot.currentBet > 0) {
    return { state, success: false, message: 'Ja existe uma aposta. Use Aumentar.' }
  }

  const minBet = state.blinds.bigBlind
  if (amount < minBet) {
    return { state, success: false, message: `Aposta minima: ${minBet}` }
  }

  const actualBet = Math.min(amount, player.chips)
  player.chips -= actualBet
  player.currentBet = actualBet
  player.totalBetThisHand += actualBet
  state.pot.mainPot += actualBet
  state.pot.currentBet = actualBet
  state.pot.minRaise = actualBet

  if (player.chips === 0) {
    player.status = 'ALL_IN'
  }

  return advanceTurn(state, 'BET', actualBet)
}

function handleRaise(state: PokerGameState, player: Player, amount: number): ActionResult {
  if (state.pot.currentBet <= 0) {
    return { state, success: false, message: 'Nao ha aposta para aumentar. Use Apostar.' }
  }

  const totalNeeded = amount - player.currentBet
  if (totalNeeded > player.chips) {
    // Auto-convert to all-in if not enough chips
    return handleAllIn(state, player)
  }

  const raiseSize = amount - state.pot.currentBet
  if (raiseSize < state.pot.minRaise && totalNeeded < player.chips) {
    return {
      state,
      success: false,
      message: `Aumento minimo: ${state.pot.minRaise}`,
    }
  }

  player.chips -= totalNeeded
  player.currentBet = amount
  player.totalBetThisHand += totalNeeded
  state.pot.mainPot += totalNeeded

  const actualRaise = amount - state.pot.currentBet
  state.pot.minRaise = Math.max(actualRaise, state.pot.minRaise)
  state.pot.currentBet = amount

  if (player.chips === 0) {
    player.status = 'ALL_IN'
  }

  return advanceTurn(state, 'RAISE', amount)
}

function handleAllIn(state: PokerGameState, player: Player): ActionResult {
  const allInAmount = player.chips
  const newTotalBet = player.currentBet + allInAmount

  if (allInAmount <= 0) {
    return advanceTurn(state, 'ALL_IN', 0)
  }

  player.chips = 0
  player.currentBet = newTotalBet
  player.totalBetThisHand += allInAmount
  state.pot.mainPot += allInAmount
  player.status = 'ALL_IN'

  // If this raise exceeds current bet, update
  if (newTotalBet > state.pot.currentBet) {
    const raiseSize = newTotalBet - state.pot.currentBet
    state.pot.minRaise = Math.max(raiseSize, state.pot.minRaise)
    state.pot.currentBet = newTotalBet
  }

  return advanceTurn(state, 'ALL_IN', newTotalBet)
}

// ===== Turn Advancement =====

function advanceTurn(
  state: PokerGameState,
  action: PlayerAction,
  amount?: number,
): ActionResult {
  // Check if betting round is complete
  if (isBettingRoundComplete(state)) {
    return advancePhase(state)
  }

  // Move to next active player
  const activeIndices = getBettingPlayerIndices(state)
  const currentIdxInActive = activeIndices.indexOf(state.activePlayerIndex)

  // Find next player who can act (not folded, not all-in)
  let nextIdx = (currentIdxInActive + 1) % activeIndices.length
  let loops = 0
  while (
    loops < activeIndices.length &&
    (state.players[activeIndices[nextIdx]].status === 'FOLDED' ||
      state.players[activeIndices[nextIdx]].status === 'ALL_IN')
  ) {
    nextIdx = (nextIdx + 1) % activeIndices.length
    loops++
  }

  // If all remaining players are all-in or folded, advance phase
  const canStillAct = activeIndices.filter(
    i => state.players[i].status === 'ACTIVE',
  )
  if (canStillAct.length <= 1) {
    // Check if the one active player still needs to call
    const lastActive = canStillAct[0]
    if (
      lastActive !== undefined &&
      state.players[lastActive].currentBet >= state.pot.currentBet
    ) {
      return advancePhase(state)
    }
    // If they need to call but it's all all-ins, advance
    const nonFolded = activeIndices.filter(
      i => state.players[i].status !== 'FOLDED',
    )
    const allAllInOrCalled = nonFolded.every(
      p =>
        state.players[p].status === 'ALL_IN' ||
        state.players[p].currentBet >= state.pot.currentBet,
    )
    if (allAllInOrCalled) {
      return advancePhase(state)
    }
  }

  state.activePlayerIndex = activeIndices[nextIdx]

  return {
    state,
    success: true,
    action,
    amount,
  }
}

function isBettingRoundComplete(state: PokerGameState): boolean {
  const bettingPlayers = getBettingPlayerIndices(state)
  const activeBetting = bettingPlayers.filter(
    i => state.players[i].status === 'ACTIVE',
  )

  if (activeBetting.length === 0) return true

  // All active players must have matched the current bet
  const allMatched = activeBetting.every(
    i => state.players[i].currentBet === state.pot.currentBet,
  )

  // And at least one action has been taken (not just blinds posted)
  if (!allMatched) return false

  // Check if everyone has had a chance to act
  // This is simplified - in real poker we track who has acted
  return allMatched
}

function advancePhase(state: PokerGameState): ActionResult {
  // Reset current bets for the new round
  for (const player of state.players) {
    player.currentBet = 0
  }
  state.pot.currentBet = 0
  state.pot.minRaise = state.blinds.bigBlind

  switch (state.phase) {
    case 'PRE_FLOP':
      // Deal flop (3 cards)
      dealCommunityCards(state, 3)
      state.phase = 'FLOP'
      break
    case 'FLOP':
      // Deal turn (1 card)
      dealCommunityCards(state, 1)
      state.phase = 'TURN'
      break
    case 'TURN':
      // Deal river (1 card)
      dealCommunityCards(state, 1)
      state.phase = 'RIVER'
      break
    case 'RIVER':
    case 'PRE_FLOP':
      state.phase = 'SHOWDOWN'
      return runShowdown(state)
    default:
      break
  }

  // Set first active player after dealer
  const activeIndices = getBettingPlayerIndices(state)
  if (activeIndices.length === 0) {
    return runShowdown(state)
  }

  // First to act is first active player after dealer (or SB position post-flop)
  const dealerIdx = state.dealerPosition
  let firstToAct = -1
  for (let i = 1; i <= state.players.length; i++) {
    const idx = (dealerIdx + i) % state.players.length
    if (
      state.players[idx].status === 'ACTIVE' ||
      state.players[idx].status === 'ALL_IN'
    ) {
      if (state.players[idx].status === 'ACTIVE') {
        firstToAct = idx
        break
      }
    }
  }

  if (firstToAct === -1) {
    // All remaining players are all-in, go to showdown
    return runShowdown(state)
  }

  state.activePlayerIndex = firstToAct

  return { state, success: true }
}

function dealCommunityCards(state: PokerGameState, count: number) {
  for (let i = 0; i < count; i++) {
    if (state.deck.length > 0) {
      state.communityCards.push(state.deck.shift()!)
    }
  }
}

// ===== Showdown =====

function runShowdown(state: PokerGameState): ActionResult {
  state.phase = 'SHOWDOWN'

  const remainingPlayers = state.players.filter(
    p => p.status === 'ACTIVE' || p.status === 'ALL_IN',
  )

  if (remainingPlayers.length === 0) {
    state.phase = 'HAND_END'
    return { state, success: true }
  }

  if (remainingPlayers.length === 1) {
    // Only one player left, they win
    const winner = remainingPlayers[0]
    const winAmount = state.pot.mainPot
    winner.chips += winAmount

    state.handWinners = [
      {
        playerId: winner.id,
        playerName: winner.name,
        amount: winAmount,
        handResult: {
          handRank: 'high-card',
          handRankValue: 1,
          kickers: [],
          description: 'Todos desistiram',
        },
      },
    ]

    state.phase = 'HAND_END'
    recordHandHistory(state)
    return { state, success: true }
  }

  // Evaluate hands for all remaining players
  const playerResults: {
    player: Player
    result: HandResult
  }[] = []

  for (const player of remainingPlayers) {
    const allCards = [...player.holeCards, ...state.communityCards]
    const result = evaluateBestHand(allCards)
    playerResults.push({ player, result })
  }

  // Sort by hand strength (best first)
  playerResults.sort((a, b) => comparePokerHands(b.result, a.result))

  // Determine winner(s) and award pot
  const bestResult = playerResults[0].result
  const winners = playerResults.filter(
    pr => comparePokerHands(pr.result, bestResult) === 0,
  )

  // Award main pot
  const winAmount = Math.floor(state.pot.mainPot / winners.length)
  for (const w of winners) {
    w.player.chips += winAmount
  }

  // Handle remainder (odd chip)
  const remainder = state.pot.mainPot - winAmount * winners.length
  if (remainder > 0) {
    // Give to first winner after dealer
    winners[0].player.chips += remainder
  }

  state.handWinners = winners.map(w => ({
    playerId: w.player.id,
    playerName: w.player.name,
    amount: winAmount + (w.player.id === winners[0].player.id ? remainder : 0),
    handResult: w.result,
  }))

  // Check for eliminated players (tournament)
  if (state.gameMode === 'TOURNAMENT') {
    for (const player of state.players) {
      if (player.chips <= 0) {
        player.status = 'ELIMINATED'
      }
    }
  }

  state.phase = 'HAND_END'
  recordHandHistory(state)

  return { state, success: true }
}

function recordHandHistory(state: PokerGameState) {
  state.handHistory.unshift({
    handNumber: state.handNumber,
    potSize: state.pot.mainPot + state.pot.sidePots.reduce((s, sp) => s + sp.amount, 0),
    winners: [...state.handWinners],
    communityCards: [...state.communityCards],
    timestamp: Date.now(),
  })
  if (state.handHistory.length > 20) {
    state.handHistory.pop()
  }
}

// ===== Side Pots Calculation =====

export function calculateSidePots(players: Player[]): {
  mainPot: number
  sidePots: SidePot[]
} {
  const allInPlayers = players
    .filter(p => p.status === 'ALL_IN' && p.totalBetThisHand > 0)
    .sort((a, b) => a.totalBetThisHand - b.totalBetThisHand)

  if (allInPlayers.length === 0) {
    const mainPot = players.reduce((sum, p) => sum + p.totalBetThisHand, 0)
    return { mainPot, sidePots: [] }
  }

  const sidePots: SidePot[] = []
  let processedAmount = 0

  for (const allInPlayer of allInPlayers) {
    if (allInPlayer.totalBetThisHand > processedAmount) {
      const potAmount =
        (allInPlayer.totalBetThisHand - processedAmount) *
        players.filter(
          p => p.totalBetThisHand >= allInPlayer.totalBetThisHand && p.status !== 'FOLDED',
        ).length

      const eligiblePlayers = players
        .filter(
          p =>
            p.totalBetThisHand >= allInPlayer.totalBetThisHand &&
            p.status !== 'FOLDED' &&
            p.status !== 'ELIMINATED',
        )
        .map(p => p.id)

      if (potAmount > 0) {
        sidePots.push({ amount: potAmount, eligiblePlayers })
      }
      processedAmount = allInPlayer.totalBetThisHand
    }
  }

  // Main pot is the first (smallest) side pot conceptually
  // For simplicity, return total as mainPot
  const totalPot = players.reduce((sum, p) => sum + p.totalBetThisHand, 0)

  return {
    mainPot: totalPot,
    sidePots,
  }
}

// ===== Utility Functions =====

function getActivePlayerIndices(state: PokerGameState): number[] {
  return state.players
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => p.chips > 0 && p.status !== 'ELIMINATED')
    .map(({ i }) => i)
}

function getBettingPlayerIndices(state: PokerGameState): number[] {
  return state.players
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => p.status !== 'FOLDED' && p.status !== 'ELIMINATED')
    .map(({ i }) => i)
}

function deepCloneState(state: PokerGameState): PokerGameState {
  return {
    ...state,
    players: state.players.map(p => ({
      ...p,
      holeCards: [...p.holeCards],
    })),
    communityCards: [...state.communityCards],
    deck: [...state.deck],
    pot: { ...state.pot, sidePots: state.pot.sidePots.map(sp => ({ ...sp })) },
    blinds: { ...state.blinds },
    handWinners: [...state.handWinners],
    handHistory: [...state.handHistory],
  }
}

// ===== Tournament Functions =====

export function escalateBlinds(state: PokerGameState): PokerGameState {
  if (state.gameMode !== 'TOURNAMENT') return state

  const newState = deepCloneState(state)
  const currentLevel = newState.blinds.level

  if (currentLevel < TOURNAMENT_BLIND_LEVELS.length) {
    const nextLevel = TOURNAMENT_BLIND_LEVELS[currentLevel]
    newState.blinds.smallBlind = nextLevel.sb
    newState.blinds.bigBlind = nextLevel.bb
    newState.blinds.level = currentLevel + 1

    if (currentLevel + 1 < TOURNAMENT_BLIND_LEVELS.length) {
      newState.blinds.nextSB = TOURNAMENT_BLIND_LEVELS[currentLevel + 1].sb
      newState.blinds.nextBB = TOURNAMENT_BLIND_LEVELS[currentLevel + 1].bb
    }
  }

  return newState
}

// ===== Valid Actions =====

export function getValidActions(
  state: PokerGameState,
  playerIndex: number,
): { action: PlayerAction; enabled: boolean; amount?: number }[] {
  const player = state.players[playerIndex]
  if (!player || player.status !== 'ACTIVE') return []

  const callAmount = state.pot.currentBet - player.currentBet
  const canCheck = callAmount <= 0
  const canCall = callAmount > 0 && player.chips >= callAmount
  const minBet = state.blinds.bigBlind
  const canBet = canCheck && player.chips >= minBet
  const canRaise =
    callAmount > 0 &&
    player.chips > callAmount &&
    player.chips >= callAmount + state.pot.minRaise
  const canAllIn = player.chips > 0

  return [
    { action: 'FOLD', enabled: true },
    { action: 'CHECK', enabled: canCheck },
    { action: 'CALL', enabled: canCall, amount: callAmount },
    { action: 'BET', enabled: canBet, amount: minBet },
    { action: 'RAISE', enabled: canRaise, amount: callAmount + state.pot.minRaise },
    { action: 'ALL_IN', enabled: canAllIn, amount: player.chips },
  ]
}

// ===== Hand Description in Portuguese =====

export function getHandDescriptionPt(result: HandResult): string {
  const rankName = HAND_RANK_NAMES_PT[result.handRank] || result.handRank
  if (result.handRank === 'pair') {
    const cardName = getCardName(result.kickers[0])
    return `Par de ${cardName}s`
  }
  if (result.handRank === 'two-pair') {
    return `Dois Pares`
  }
  if (result.handRank === 'three-kind') {
    const cardName = getCardName(result.kickers[0])
    return `Trinca de ${cardName}s`
  }
  if (result.handRank === 'straight') {
    return `Sequencia`
  }
  if (result.handRank === 'flush') {
    return `Flush`
  }
  if (result.handRank === 'full-house') {
    return `Full House`
  }
  if (result.handRank === 'four-kind') {
    const cardName = getCardName(result.kickers[0])
    return `Quadra de ${cardName}s`
  }
  if (result.handRank === 'straight-flush') {
    return `Straight Flush`
  }
  if (result.handRank === 'royal-flush') {
    return `Royal Flush`
  }
  return rankName
}

function getCardName(value: number): string {
  const names: Record<number, string> = {
    2: 'Dois', 3: 'Tres', 4: 'Quatro', 5: 'Cinco', 6: 'Seis',
    7: 'Sete', 8: 'Oito', 9: 'Nove', 10: 'Dez',
    11: 'Valete', 12: 'Dama', 13: 'Rei', 14: 'As',
  }
  return names[value] || String(value)
}

// ===== Quick human-readable hand strength =====

export function getHandStrengthHint(holeCards: PokerCard[], communityCards: PokerCard[]): string {
  if (holeCards.length < 2) return ''
  const allCards = [...holeCards, ...communityCards]
  if (allCards.length < 5) {
    // Pre-flop hints
    const v1 = holeCards[0].value
    const v2 = holeCards[1].value
    if (v1 === v2) {
      if (v1 >= 12) return 'Mao forte! Par premium'
      if (v1 >= 8) return 'Par medio - boa mao'
      return 'Par baixo'
    }
    const high = Math.max(v1, v2)
    const suited = holeCards[0].suit === holeCards[1].suit
    if (high >= 13) {
      return suited ? 'Alto suited - mao forte' : 'Carta alta - jogavel'
    }
    if (high >= 10 && suited) return 'Suited conector - potencial'
    return 'Mao fraca - cuidado'
  }
  const result = evaluateBestHand(allCards)
  return getHandDescriptionPt(result)
}

// ===== Position names =====

export function getPositionName(playerIndex: number, dealerPos: number, totalPlayers: number): string {
  const dist = (playerIndex - dealerPos + totalPlayers) % totalPlayers
  if (dist === 0) return 'D'
  if (dist === 1) return 'SB'
  if (dist === 2) return 'BB'
  if (dist === 3) return 'UTG'
  if (dist === totalPlayers - 1) return 'BTN'
  if (dist === totalPlayers - 2) return 'CO'
  return 'MP'
}

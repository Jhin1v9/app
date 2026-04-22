// ===== Truco Game Engine =====
// Complete game logic for Brazilian Truco (Mineiro and Paulista variants)

export type TrucoSuit = 'clubs' | 'hearts' | 'spades' | 'diamonds'
export type TrucoRank = '4' | '5' | '6' | '7' | 'Q' | 'J' | 'K' | 'A' | '2' | '3'
export type GameMode = 'mineiro' | 'paulista'
export type GamePhase =
  | 'SETUP'
  | 'DEALING'
  | 'PLAYING_ROUND_1'
  | 'PLAYING_ROUND_2'
  | 'PLAYING_ROUND_3'
  | 'TRUCO_CALLED'
  | 'ROUND_END'
  | 'HAND_END'
  | 'GAME_OVER'
export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert'

export interface TrucoCard {
  suit: TrucoSuit
  rank: TrucoRank
  value: number
}

export interface PlayedCard {
  card: TrucoCard
  playerIndex: number
  covered: boolean
}

export interface TrucoState {
  // Game config
  mode: GameMode
  difficulty: Difficulty
  // Scores
  scoreNos: number
  scoreEles: number
  // Current hand
  phase: GamePhase
  hands: TrucoCard[][] // 4 players' hands
  currentRound: number // 0, 1, 2 (rounds 1-3)
  currentPlayerIndex: number // whose turn it is
  maodePlayerIndex: number // first player this hand ("mao")
  vira: TrucoCard | null // Paulista vira card
  playedCards: PlayedCard[] // cards played this round
  roundWinners: (number | null)[] // winning team per round (0=NOS, 1=ELES, null=tie)
  // Truco state
  trucoValue: number // current hand point value
  trucoCaller: number | null // who called truco
  trucoPending: boolean // waiting for response
  trucoResponse: 'accept' | 'raise' | 'flee' | null
  lastRaiseValue: number | null // for escalation display
  // Special states
  isMaoDe10: boolean // Mineiro: at 10 points
  isMaoDe11: boolean // Paulista: at 11 points
  isMaoDeFerro: boolean // both at threshold
  maoDeFerroActive: boolean // blind play mode
  // Covered play
  canPlayCovered: boolean // rounds 2&3 allow covered
  coveredPending: boolean // player chose to play covered
  // Meta
  handMessage: string // display message
  handHistory: HandRecord[]
  gameWinner: 'nos' | 'eles' | null
  turnCount: number // to track when all 4 played
  pendingTrucoPhase: GamePhase | null // phase to return to after truco resolve
}

export interface HandRecord {
  roundWinners: (number | null)[]
  handWinner: 'nos' | 'eles'
  points: number
}

// ===== Deck =====

const ALL_SUITS: TrucoSuit[] = ['clubs', 'hearts', 'spades', 'diamonds']
const ALL_RANKS: TrucoRank[] = ['4', '5', '6', '7', 'Q', 'J', 'K', 'A', '2', '3']

export function createDeck(): TrucoCard[] {
  const deck: TrucoCard[] = []
  for (const suit of ALL_SUITS) {
    for (const rank of ALL_RANKS) {
      deck.push({ suit, rank, value: 0 })
    }
  }
  return deck
}

export function shuffle<T>(deck: T[]): T[] {
  const d = [...deck]
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[d[i], d[j]] = [d[j], d[i]]
  }
  return d
}

// ===== Card Value System =====

// Regular card base values (for comparison)
const RANK_BASE_VALUES: Record<TrucoRank, number> = {
  '4': 1, '5': 2, '6': 3, '7': 4, 'Q': 5, 'J': 6, 'K': 7, 'A': 8, '2': 9, '3': 10,
}

// Full values for AI hand strength evaluation
const RANK_FULL_VALUES: Record<TrucoRank, number> = {
  '4': 5, '5': 6, '6': 7, '7': 8, 'Q': 9, 'J': 10, 'K': 11, 'A': 12, '2': 13, '3': 14,
}

// Mineiro fixed manilhas
const MINEIRO_MANILHAS: { suit: TrucoSuit; rank: TrucoRank; value: number }[] = [
  { suit: 'clubs', rank: '4', value: 100 },
  { suit: 'hearts', rank: '7', value: 99 },
  { suit: 'spades', rank: 'A', value: 98 },
  { suit: 'diamonds', rank: '7', value: 97 },
]

// Suit order for Paulista manilha tie-breaking (clubs > hearts > spades > diamonds)
const SUIT_ORDER: TrucoSuit[] = ['clubs', 'hearts', 'spades', 'diamonds']

export function getCardValue(card: TrucoCard, mode: GameMode, vira?: TrucoCard | null): number {
  // Check if covered card
  if (card.value === 0 && card.rank === '0' as TrucoRank) return 0

  if (mode === 'mineiro') {
    // Check fixed manilhas
    const manilha = MINEIRO_MANILHAS.find(
      (m) => m.suit === card.suit && m.rank === card.rank
    )
    if (manilha) return manilha.value
    // Regular cards
    return RANK_BASE_VALUES[card.rank]
  }

  // Paulista mode
  if (!vira) return RANK_BASE_VALUES[card.rank]

  // Determine manilha rank from vira
  const manilhaRank = getManilhaRankFromVira(vira.rank)

  // Check if this card is a manilha
  if (card.rank === manilhaRank) {
    // Manilha value: 97 + suit order (clubs=100, hearts=99, spades=98, diamonds=97)
    const suitIdx = SUIT_ORDER.indexOf(card.suit)
    return 97 + (3 - suitIdx)
  }

  return RANK_BASE_VALUES[card.rank]
}

function getManilhaRankFromVira(viraRank: TrucoRank): TrucoRank {
  const rankCycle: TrucoRank[] = ['4', '5', '6', '7', 'Q', 'J', 'K', 'A', '2', '3']
  const idx = rankCycle.indexOf(viraRank)
  return rankCycle[(idx + 1) % rankCycle.length]
}

export function getManilhaRank(state: TrucoState): TrucoRank | null {
  if (state.mode === 'mineiro') return null
  if (!state.vira) return null
  return getManilhaRankFromVira(state.vira.rank)
}

// Check if card is manilha (for UI display)
export function isManilha(card: TrucoCard, state: TrucoState): boolean {
  if (state.mode === 'mineiro') {
    return MINEIRO_MANILHAS.some((m) => m.suit === card.suit && m.rank === card.rank)
  }
  if (!state.vira) return false
  return card.rank === getManilhaRankFromVira(state.vira.rank)
}

// Get manilha display name
export function getManilhaName(state: TrucoState): string {
  if (state.mode === 'mineiro') return 'Manilhas fixas'
  const mr = getManilhaRank(state)
  if (!mr) return ''
  const names: Record<TrucoRank, string> = {
    '4': '4', '5': '5', '6': '6', '7': '7', Q: 'Q', J: 'J', K: 'K', A: 'A', '2': '2', '3': '3',
  }
  return names[mr] || mr
}

// ===== Score/Value System =====

export function getInitialHandValue(mode: GameMode): number {
  return mode === 'mineiro' ? 2 : 1
}

export function getNextTrucoValue(current: number, mode: GameMode): number {
  if (mode === 'mineiro') {
    const escalation = [2, 4, 6, 10, 12]
    const idx = escalation.indexOf(current)
    return escalation[Math.min(idx + 1, escalation.length - 1)]
  }
  const escalation = [1, 3, 6, 9, 12]
  const idx = escalation.indexOf(current)
  return escalation[Math.min(idx + 1, escalation.length - 1)]
}

export function getTrucoLabel(value: number, mode: GameMode): string {
  if (mode === 'mineiro') {
    if (value === 2) return '2'
    if (value === 4) return 'TRUCO'
    if (value === 6) return 'SEIS'
    if (value === 10) return 'DEZ'
    if (value === 12) return 'DOZE'
  } else {
    if (value === 1) return '1'
    if (value === 3) return 'TRUCO'
    if (value === 6) return 'SEIS'
    if (value === 9) return 'NOVE'
    if (value === 12) return 'DOZE'
  }
  return String(value)
}

export function getRaiseLabel(value: number, mode: GameMode): string {
  const next = getNextTrucoValue(value, mode)
  return `${getTrucoLabel(next, mode)}!`
}

// ===== Team Helpers =====

export function getTeam(playerIndex: number): 'nos' | 'eles' {
  return playerIndex === 0 || playerIndex === 2 ? 'nos' : 'eles'
}

export function getPartner(playerIndex: number): number {
  return (playerIndex + 2) % 4
}

export function getOpponents(playerIndex: number): number[] {
  return [(playerIndex + 1) % 4, (playerIndex + 3) % 4]
}

// ===== State Initialization =====

export function createInitialState(mode: GameMode = 'mineiro', difficulty: Difficulty = 'medium'): TrucoState {
  return {
    mode,
    difficulty,
    scoreNos: 0,
    scoreEles: 0,
    phase: 'SETUP',
    hands: [[], [], [], []],
    currentRound: 0,
    currentPlayerIndex: 0,
    maodePlayerIndex: 0,
    vira: null,
    playedCards: [],
    roundWinners: [null, null, null],
    trucoValue: getInitialHandValue(mode),
    trucoCaller: null,
    trucoPending: false,
    trucoResponse: null,
    lastRaiseValue: null,
    isMaoDe10: false,
    isMaoDe11: false,
    isMaoDeFerro: false,
    maoDeFerroActive: false,
    canPlayCovered: false,
    coveredPending: false,
    handMessage: '',
    handHistory: [],
    gameWinner: null,
    turnCount: 0,
    pendingTrucoPhase: null,
  }
}

// ===== Dealing =====

export function deal(state: TrucoState): TrucoState {
  const deck = shuffle(createDeck())
  const hands: TrucoCard[][] = [[], [], [], []]

  let cardIdx = 0
  for (let c = 0; c < 3; c++) {
    for (let p = 0; p < 4; p++) {
      hands[p].push(deck[cardIdx])
      cardIdx++
    }
  }

  // Paulista: set vira card
  let vira: TrucoCard | null = null
  if (state.mode === 'paulista' && cardIdx < deck.length) {
    vira = deck[cardIdx]
  }

  // Determine Mão de 10/11/Ferro states
  const maoThreshold = state.mode === 'mineiro' ? 10 : 11
  const isMaoDeThreshold = state.scoreNos >= maoThreshold || state.scoreEles >= maoThreshold
  const bothAtThreshold = state.scoreNos >= maoThreshold && state.scoreEles >= maoThreshold

  // Assign card values
  const valuedHands = hands.map((hand) =>
    hand.map((card) => ({
      ...card,
      value: getCardValue(card, state.mode, vira),
    }))
  )

  const newState: TrucoState = {
    ...state,
    hands: valuedHands,
    vira,
    playedCards: [],
    roundWinners: [null, null, null],
    currentRound: 0,
    currentPlayerIndex: state.maodePlayerIndex,
    phase: bothAtThreshold ? 'PLAYING_ROUND_1' : 'PLAYING_ROUND_1',
    trucoValue: getInitialHandValue(state.mode),
    trucoCaller: null,
    trucoPending: false,
    trucoResponse: null,
    lastRaiseValue: null,
    isMaoDe10: state.mode === 'mineiro' && isMaoDeThreshold,
    isMaoDe11: state.mode === 'paulista' && isMaoDeThreshold,
    isMaoDeFerro: bothAtThreshold,
    maoDeFerroActive: bothAtThreshold,
    canPlayCovered: false,
    coveredPending: false,
    handMessage: bothAtThreshold
      ? 'MAO DE FERRO! Todas as cartas serao jogadas cobertas!'
      : isMaoDeThreshold
        ? state.mode === 'mineiro'
          ? 'MAO DE 10!'
          : 'MAO DE 11!'
        : '',
    turnCount: 0,
    pendingTrucoPhase: null,
  }

  return newState
}

// ===== Card Play =====

export function playCard(
  state: TrucoState,
  playerIndex: number,
  cardIndex: number,
  covered = false
): TrucoState {
  if (state.currentPlayerIndex !== playerIndex) return state
  if (state.phase === 'TRUCO_CALLED') return state
  if (state.phase === 'GAME_OVER') return state

  const hand = state.hands[playerIndex]
  if (cardIndex < 0 || cardIndex >= hand.length) return state

  // In Mão de Ferro, all cards are played covered
  const isCovered = state.maoDeFerroActive || covered

  // Can only play covered in rounds 2+ and 3 (index 1, 2)
  if (covered && state.currentRound === 0 && !state.maoDeFerroActive) return state

  const card = hand[cardIndex]
  const newHand = [...hand.slice(0, cardIndex), ...hand.slice(cardIndex + 1)]
  const newHands = state.hands.map((h, i) => (i === playerIndex ? newHand : h))

  const playedCard: PlayedCard = {
    card: { ...card },
    playerIndex,
    covered: isCovered,
  }

  const newPlayedCards = [...state.playedCards, playedCard]
  const newTurnCount = state.turnCount + 1

  let newState: TrucoState = {
    ...state,
    hands: newHands,
    playedCards: newPlayedCards,
    turnCount: newTurnCount,
    coveredPending: false,
    canPlayCovered: false,
  }

  // If all 4 players have played, resolve the round
  if (newTurnCount >= 4) {
    return resolveRound(newState)
  }

  // Otherwise, advance to next player
  newState.currentPlayerIndex = (playerIndex + 1) % 4

  return newState
}

// ===== Round Resolution =====

export function resolveRound(state: TrucoState): TrucoState {
  const winnerIndex = determineRoundWinner(state.playedCards, state)
  const newRoundWinners = [...state.roundWinners]

  if (winnerIndex === null) {
    // Tie: "mão" wins (first player of the round)
    const tieWinner = state.playedCards[0]?.playerIndex ?? state.maodePlayerIndex
    newRoundWinners[state.currentRound] = getTeam(tieWinner) === 'nos' ? 0 : 1
  } else {
    newRoundWinners[state.currentRound] = getTeam(winnerIndex) === 'nos' ? 0 : 1
  }

  const winnerTeam = newRoundWinners[state.currentRound]
  const winnerPlayerIdx = winnerIndex !== null ? winnerIndex : state.playedCards[0]?.playerIndex ?? 0

  const newState: TrucoState = {
    ...state,
    roundWinners: newRoundWinners,
    phase: 'ROUND_END',
    currentPlayerIndex: winnerIndex !== null ? winnerIndex : winnerPlayerIdx,
    handMessage:
      winnerTeam === null
        ? 'Empate! A mao ganha.'
        : winnerTeam === 0
          ? 'NOS ganhou a rodada!'
          : 'ELES ganhou a rodada!',
  }

  return newState
}

export function determineRoundWinner(playedCards: PlayedCard[], _state: TrucoState): number | null {
  if (playedCards.length === 0) return null

  let bestIdx = 0
  let isTie = false

  for (let i = 1; i < playedCards.length; i++) {
    const cardA = playedCards[bestIdx]
    const cardB = playedCards[i]

    const valA = cardA.covered ? 0 : cardA.card.value
    const valB = cardB.covered ? 0 : cardB.card.value

    if (valB > valA) {
      bestIdx = i
      isTie = false
    } else if (valB === valA) {
      isTie = true
    }
  }

  if (isTie && playedCards[bestIdx].card.value === playedCards[playedCards.length - 1].card.value) {
    // Verify if actual tie or just same value
    const maxVal = Math.max(...playedCards.map((p) => (p.covered ? 0 : p.card.value)))
    const maxCards = playedCards.filter((p) => (p.covered ? 0 : p.card.value) === maxVal)
    if (maxCards.length > 1) {
      // Tie: mão (first player) wins
      return playedCards[0].playerIndex
    }
  }

  return playedCards[bestIdx].playerIndex
}

// ===== Hand Resolution =====

export function advanceFromRoundEnd(state: TrucoState): TrucoState {
  // Check if hand has a winner
  const handWinner = determineHandWinner(state.roundWinners)

  if (handWinner !== null) {
    // Hand is decided
    const winningTeam = handWinner as 'nos' | 'eles'
    return resolveHand(state, winningTeam)
  }

  // Not decided yet, start next round
  const nextRound = state.currentRound + 1
  if (nextRound >= 3) {
    // All rounds played, hand is a tie
    return resolveHand(state, getTeam(state.maodePlayerIndex))
  }

  const nextPhase: GamePhase =
    nextRound === 0
      ? 'PLAYING_ROUND_1'
      : nextRound === 1
        ? 'PLAYING_ROUND_2'
        : 'PLAYING_ROUND_3'

  return {
    ...state,
    phase: nextPhase,
    currentRound: nextRound,
    playedCards: [],
    turnCount: 0,
    canPlayCovered: nextRound >= 1,
    currentPlayerIndex: state.currentPlayerIndex,
    handMessage: '',
  }
}

export function determineHandWinner(roundWinners: (number | null)[]): 'nos' | 'eles' | null {
  let nosWins = 0
  let elesWins = 0

  for (const w of roundWinners) {
    if (w === 0) nosWins++
    else if (w === 1) elesWins++
  }

  // Best of 3: first to 2 round wins
  if (nosWins >= 2) return 'nos'
  if (elesWins >= 2) return 'eles'

  // Not enough rounds played yet
  const roundsPlayed = roundWinners.filter((w) => w !== null).length
  if (roundsPlayed < 3) return null

  // All 3 rounds played
  if (nosWins > elesWins) return 'nos'
  if (elesWins > nosWins) return 'eles'

  // Tie after 3 rounds: mão wins
  return null // will be resolved by caller
}

function resolveHand(state: TrucoState, winner: 'nos' | 'eles'): TrucoState {
  const points = state.trucoValue
  const newScoreNos = state.scoreNos + (winner === 'nos' ? points : 0)
  const newScoreEles = state.scoreEles + (winner === 'eles' ? points : 0)

  const record: HandRecord = {
    roundWinners: [...state.roundWinners],
    handWinner: winner,
    points,
  }

  // Check game over (first to 12 wins, but must win by playing)
  const gameOverNos = newScoreNos >= 12
  const gameOverEles = newScoreEles >= 12

  if (gameOverNos || gameOverEles) {
    return {
      ...state,
      scoreNos: Math.min(newScoreNos, 12),
      scoreEles: Math.min(newScoreEles, 12),
      phase: 'GAME_OVER',
      gameWinner: gameOverNos ? 'nos' : 'eles',
      handMessage: gameOverNos ? 'NOS venceu o jogo!' : 'ELES venceu o jogo!',
      handHistory: [...state.handHistory, record],
      hands: [[], [], [], []],
      playedCards: [],
      turnCount: 0,
      trucoPending: false,
      trucoCaller: null,
      trucoResponse: null,
    }
  }

  // Rotate mão for next hand
  const newMaode = (state.maodePlayerIndex + 1) % 4

  const newState: TrucoState = {
    ...state,
    scoreNos: newScoreNos,
    scoreEles: newScoreEles,
    phase: 'HAND_END',
    maodePlayerIndex: newMaode,
    handMessage: `${winner === 'nos' ? 'NOS' : 'ELES'} ganhou a mao! +${points} pontos`,
    handHistory: [...state.handHistory, record],
    hands: [[], [], [], []],
    playedCards: [],
    turnCount: 0,
    trucoPending: false,
    trucoCaller: null,
    trucoResponse: null,
  }

  return newState
}

// ===== Truco System =====

export function callTruco(state: TrucoState, playerIndex: number): TrucoState {
  if (state.trucoPending) return state
  if (state.phase === 'GAME_OVER') return state
  if (state.phase === 'TRUCO_CALLED') return state

  // Cannot call truco in Mão de 10/11 (unless fleeing is the only option)
  if ((state.isMaoDe10 || state.isMaoDe11) && !state.isMaoDeFerro) return state

  // Check max escalation
  const nextVal = getNextTrucoValue(state.trucoValue, state.mode)
  if (nextVal === state.trucoValue) return state // already at max

  const newState: TrucoState = {
    ...state,
    trucoCaller: playerIndex,
    trucoPending: true,
    trucoResponse: null,
    lastRaiseValue: nextVal,
    pendingTrucoPhase: state.phase,
    phase: 'TRUCO_CALLED',
  }

  return newState
}

export function respondToTruco(
  state: TrucoState,
  response: 'accept' | 'raise' | 'flee'
): TrucoState {
  if (!state.trucoPending) return state

  const callerTeam = state.trucoCaller !== null ? getTeam(state.trucoCaller) : null

  if (response === 'flee') {
    // Caller team wins the hand
    const winner = callerTeam === 'nos' ? 'eles' : 'nos'
    return resolveHand(state, winner)
  }

  if (response === 'accept') {
    const newVal = state.lastRaiseValue ?? state.trucoValue
    return {
      ...state,
      trucoValue: newVal,
      trucoPending: false,
      trucoResponse: 'accept',
      lastRaiseValue: null,
      phase: state.pendingTrucoPhase ?? 'PLAYING_ROUND_1',
      handMessage: `Aceito! Mao vale ${newVal}`,
      pendingTrucoPhase: null,
    }
  }

  if (response === 'raise') {
    // Raising: switch caller and responder roles
    const nextVal = getNextTrucoValue(state.lastRaiseValue ?? state.trucoValue, state.mode)
    const currentVal = state.lastRaiseValue ?? state.trucoValue
    if (nextVal === currentVal) {
      // Can't raise further, auto-accept
      return {
        ...state,
        trucoValue: currentVal,
        trucoPending: false,
        trucoResponse: 'accept',
        lastRaiseValue: null,
        phase: state.pendingTrucoPhase ?? 'PLAYING_ROUND_1',
        handMessage: `Aceito! Mao vale ${currentVal}`,
        pendingTrucoPhase: null,
      }
    }
    return {
      ...state,
      trucoCaller: state.currentPlayerIndex,
      lastRaiseValue: nextVal,
      trucoResponse: 'raise',
      handMessage: `${getTrucoLabel(nextVal, state.mode)}!`,
    }
  }

  return state
}

// ===== Valid Actions =====

export interface ValidActions {
  canPlay: boolean
  playableCards: number[] // indices of cards that can be played
  canCallTruco: boolean
  canAccept: boolean
  canRaise: boolean
  canFlee: boolean
  canPlayCovered: boolean
}

export function getValidActions(state: TrucoState, playerIndex: number): ValidActions {
  const isMyTurn = state.currentPlayerIndex === playerIndex
  const isTrucoPhase = state.phase === 'TRUCO_CALLED'
  const trucoCaller = state.trucoCaller
  const myTeam = getTeam(playerIndex)
  const callerTeam = trucoCaller !== null ? getTeam(trucoCaller) : null
  const isCaller = trucoCaller === playerIndex

  // During truco response: only the target can respond
  if (isTrucoPhase) {
    // The player whose turn it is should respond
    // If the caller is asking, the next player should respond
    const canRespond = isMyTurn && !isCaller && callerTeam !== myTeam
    const currentVal = state.lastRaiseValue ?? state.trucoValue
    const nextVal = getNextTrucoValue(currentVal, state.mode)
    const canRaiseResponse = canRespond && nextVal > currentVal

    return {
      canPlay: false,
      playableCards: [],
      canCallTruco: false,
      canAccept: canRespond,
      canRaise: canRaiseResponse,
      canFlee: canRespond,
      canPlayCovered: false,
    }
  }

  const canPlayCards = isMyTurn && !isTrucoPhase && state.phase.startsWith('PLAYING')

  // Check if can call truco
  let canCallTruco = false
  if (isMyTurn && !isTrucoPhase && state.phase.startsWith('PLAYING')) {
    // Can't call if in Mão de 10/11 (non-ferro)
    if ((state.isMaoDe10 || state.isMaoDe11) && !state.isMaoDeFerro) {
      canCallTruco = false
    } else if (trucoCaller !== null && getTeam(trucoCaller) === myTeam) {
      // Can't call if my team already called
      canCallTruco = false
    } else {
      // Check max escalation
      const nextVal = getNextTrucoValue(state.trucoValue, state.mode)
      canCallTruco = nextVal > state.trucoValue
    }
  }

  const allowCovered = state.currentRound >= 1 && canPlayCards && !state.maoDeFerroActive

  return {
    canPlay: canPlayCards,
    playableCards: canPlayCards
      ? state.hands[playerIndex].map((_, i) => i)
      : [],
    canCallTruco,
    canAccept: false,
    canRaise: false,
    canFlee: false,
    canPlayCovered: allowCovered,
  }
}

// ===== Check Game Over =====

export function checkGameOver(state: TrucoState): boolean {
  return state.scoreNos >= 12 || state.scoreEles >= 12
}

// ===== Start New Hand =====

export function startNewHand(state: TrucoState): TrucoState {
  const newState = deal(state)
  return newState
}

// ===== Hand strength for AI =====

export function getHandStrength(cards: TrucoCard[]): number {
  if (cards.length === 0) return 0
  const total = cards.reduce((sum, c) => sum + (RANK_FULL_VALUES[c.rank] || c.value), 0)
  return total / cards.length
}

// ===== Get card display info =====

export function getCardSuitSymbol(suit: TrucoSuit): string {
  const map: Record<TrucoSuit, string> = {
    clubs: '\u2663',
    hearts: '\u2665',
    spades: '\u2660',
    diamonds: '\u2666',
  }
  return map[suit]
}

export function getCardSuitColor(suit: TrucoSuit): string {
  return suit === 'hearts' || suit === 'diamonds' ? '#DC2626' : '#1A1A1A'
}

export function getPlayerName(index: number): string {
  const names = ['Voce', 'Bot Esq.', 'Parceiro', 'Bot Dir.']
  return names[index] || `Jogador ${index + 1}`
}

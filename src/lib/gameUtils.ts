// ===== Types =====

export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades'
export type SpanishSuit = 'clubs' | 'cups' | 'swords' | 'gold'

export type PokerRank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A'
export type TrucoRank = '4' | '5' | '6' | '7' | 'Q' | 'J' | 'K' | 'A' | '2' | '3'

export interface Card {
  suit: Suit | SpanishSuit
  rank: PokerRank | TrucoRank | string
  value: number // numeric value for comparison
}

export interface PokerCard {
  suit: Suit
  rank: PokerRank
  value: number
}

export interface TrucoCard {
  suit: SpanishSuit
  rank: TrucoRank
  value: number
}

// ===== Truco Spanish Deck Ranks (lowest to highest) =====
// 4 < 5 < 6 < 7 < Q < J < K < A < 2 < 3
const TRUCO_RANK_ORDER: TrucoRank[] = ['4', '5', '6', '7', 'Q', 'J', 'K', 'A', '2', '3']

// Truco rank values for comparison
const TRUCO_RANK_VALUES: Record<TrucoRank, number> = {
  '4': 1, '5': 2, '6': 3, '7': 4, 'Q': 5, 'J': 6, 'K': 7, 'A': 8, '2': 9, '3': 10,
}

// ===== Poker Standard Deck Ranks (lowest to highest) =====
const POKER_RANK_ORDER: PokerRank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']

const POKER_RANK_VALUES: Record<PokerRank, number> = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
  'J': 11, 'Q': 12, 'K': 13, 'A': 14,
}

// ===== Suit Symbols =====
export const SUIT_SYMBOLS: Record<Suit | SpanishSuit, string> = {
  hearts: '\u2665',
  diamonds: '\u2666',
  clubs: '\u2663',
  spades: '\u2660',
  cups: '\u2615',     // approximating cup/goblet
  swords: '\u2694',   // approximating sword
  gold: '\u25C6',     // diamond shape for oro
}

export const SUIT_COLORS: Record<Suit | SpanishSuit, string> = {
  hearts: '#DC2626',
  diamonds: '#DC2626',
  clubs: '#1A1A1A',
  spades: '#1A1A1A',
  cups: '#DC2626',
  swords: '#1A1A1A',
  gold: '#D4A830',
}

// ===== Spanish Suit Names (for Truco) =====
const SPANISH_SUITS: SpanishSuit[] = ['clubs', 'cups', 'swords', 'gold']

// ===== Standard Suits (for Poker) =====
const STANDARD_SUITS: Suit[] = ['clubs', 'hearts', 'spades', 'diamonds']

// ===== Deck Creation =====

/**
 * Creates a Truco Spanish deck (40 cards)
 * Uses: clubs (paus), cups (copas), swords (espadas), gold (ouros)
 * Ranks: 3, 2, A, K, J, Q, 7, 6, 5, 4
 */
export function createTrucoDeck(): TrucoCard[] {
  const deck: TrucoCard[] = []
  for (const suit of SPANISH_SUITS) {
    for (const rank of TRUCO_RANK_ORDER) {
      deck.push({
        suit,
        rank,
        value: TRUCO_RANK_VALUES[rank],
      })
    }
  }
  return deck
}

/**
 * Creates a standard 52-card Poker deck
 */
export function createPokerDeck(): PokerCard[] {
  const deck: PokerCard[] = []
  for (const suit of STANDARD_SUITS) {
    for (const rank of POKER_RANK_ORDER) {
      deck.push({
        suit,
        rank,
        value: POKER_RANK_VALUES[rank],
      })
    }
  }
  return deck
}

/**
 * Fisher-Yates shuffle algorithm
 */
export function shuffleDeck<T extends Card>(deck: T[]): T[] {
  const shuffled = [...deck]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * Deals cards to players
 */
export function dealCards<T extends Card>(deck: T[], numPlayers: number, cardsPerPlayer: number): T[][] {
  const hands: T[][] = Array.from({ length: numPlayers }, () => [])
  let cardIndex = 0
  for (let c = 0; c < cardsPerPlayer; c++) {
    for (let p = 0; p < numPlayers; p++) {
      if (cardIndex < deck.length) {
        hands[p].push(deck[cardIndex])
        cardIndex++
      }
    }
  }
  return hands
}

// ===== Card Comparison =====

/**
 * Compare two Truco cards
 * Returns: positive if card1 wins, negative if card2 wins, 0 if tie
 */
export function compareTrucoCards(card1: TrucoCard, card2: TrucoCard): number {
  return card1.value - card2.value
}

/**
 * Compare two Poker cards by rank
 */
export function comparePokerCards(card1: PokerCard, card2: PokerCard): number {
  return card1.value - card2.value
}

/**
 * Check if a card is a manilha (Truco Mineiro)
 * In Mineiro, manilhas are fixed: 4 of clubs, 7 of hearts, A of spades, 7 of diamonds
 */
export function isManilhaMineiro(card: TrucoCard): boolean {
  const manilhas = [
    { suit: 'clubs' as SpanishSuit, rank: '4' as TrucoRank },
    { suit: 'cups' as SpanishSuit, rank: '7' as TrucoRank },    // hearts equivalent
    { suit: 'swords' as SpanishSuit, rank: 'A' as TrucoRank },  // spades equivalent
    { suit: 'gold' as SpanishSuit, rank: '7' as TrucoRank },    // diamonds equivalent
  ]
  return manilhas.some(m => m.suit === card.suit && m.rank === card.rank)
}

/**
 * Get manilha rank order for Mineiro (for tie-breaking)
 */
export function getManilhaMineiroRank(card: TrucoCard): number {
  const order = [
    { suit: 'clubs', rank: '4' },
    { suit: 'cups', rank: '7' },
    { suit: 'swords', rank: 'A' },
    { suit: 'gold', rank: '7' },
  ]
  return order.findIndex(m => m.suit === card.suit && m.rank === card.rank)
}

// ===== Poker Hand Evaluation =====

export type PokerHandRank =
  | 'high-card' | 'pair' | 'two-pair' | 'three-kind'
  | 'straight' | 'flush' | 'full-house' | 'four-kind' | 'straight-flush' | 'royal-flush'

export interface HandResult {
  handRank: PokerHandRank
  handRankValue: number // 1-10 for comparison
  kickers: number[] // sorted descending
  description: string
}

/**
 * Evaluate a 5-card Poker hand
 */
export function evaluatePokerHand(cards: PokerCard[]): HandResult {
  if (cards.length !== 5) {
    return { handRank: 'high-card', handRankValue: 1, kickers: [], description: 'Invalid hand' }
  }

  const values = cards.map(c => c.value).sort((a, b) => b - a)
  const suits = cards.map(c => c.suit)

  const isFlush = suits.every(s => s === suits[0])
  const isStraight = checkStraight(values)
  const valueCounts = countValues(values)

  // Royal Flush
  if (isFlush && isStraight && values[0] === 14 && values[4] === 10) {
    return { handRank: 'royal-flush', handRankValue: 10, kickers: values, description: 'Royal Flush' }
  }

  // Straight Flush
  if (isFlush && isStraight) {
    return { handRank: 'straight-flush', handRankValue: 9, kickers: values, description: 'Straight Flush' }
  }

  // Four of a Kind
  const four = valueCounts.find(vc => vc.count === 4)
  if (four) {
    const kicker = values.find(v => v !== four.value) || 0
    return { handRank: 'four-kind', handRankValue: 8, kickers: [four.value, kicker], description: 'Quadra' }
  }

  // Full House
  const three = valueCounts.find(vc => vc.count === 3)
  const pair = valueCounts.find(vc => vc.count === 2)
  if (three && pair) {
    return { handRank: 'full-house', handRankValue: 7, kickers: [three.value, pair.value], description: 'Full House' }
  }

  // Flush
  if (isFlush) {
    return { handRank: 'flush', handRankValue: 6, kickers: values, description: 'Flush' }
  }

  // Straight
  if (isStraight) {
    return { handRank: 'straight', handRankValue: 5, kickers: values, description: 'Sequencia' }
  }

  // Three of a Kind
  if (three) {
    const kickers = values.filter(v => v !== three.value).slice(0, 2)
    return { handRank: 'three-kind', handRankValue: 4, kickers: [three.value, ...kickers], description: 'Trinca' }
  }

  // Two Pair
  const pairs = valueCounts.filter(vc => vc.count === 2)
  if (pairs.length === 2) {
    const pairValues = pairs.map(p => p.value).sort((a, b) => b - a)
    const kicker = values.find(v => !pairValues.includes(v)) || 0
    return { handRank: 'two-pair', handRankValue: 3, kickers: [...pairValues, kicker], description: 'Dois Pares' }
  }

  // Pair
  if (pairs.length === 1) {
    const pairValue = pairs[0].value
    const kickers = values.filter(v => v !== pairValue).slice(0, 3)
    return { handRank: 'pair', handRankValue: 2, kickers: [pairValue, ...kickers], description: 'Par' }
  }

  // High Card
  return { handRank: 'high-card', handRankValue: 1, kickers: values, description: 'Carta Alta' }
}

function checkStraight(sortedValues: number[]): boolean {
  // Normal straight
  const unique = [...new Set(sortedValues)].sort((a, b) => b - a)
  if (unique.length < 5) return false

  // Check normal straight
  for (let i = 0; i <= unique.length - 5; i++) {
    if (unique[i] - unique[i + 4] === 4) return true
  }

  // Check A-5-4-3-2 straight (wheel)
  if (unique.includes(14) && unique.includes(2) && unique.includes(3) && unique.includes(4) && unique.includes(5)) {
    return true
  }

  return false
}

function countValues(values: number[]) {
  const counts: Record<number, number> = {}
  for (const v of values) {
    counts[v] = (counts[v] || 0) + 1
  }
  return Object.entries(counts).map(([value, count]) => ({
    value: Number(value),
    count,
  })).sort((a, b) => b.count - a.value || b.value - a.value)
}

/**
 * Compare two poker hand results
 * Returns: positive if hand1 wins, negative if hand2 wins, 0 if tie
 */
export function comparePokerHands(hand1: HandResult, hand2: HandResult): number {
  if (hand1.handRankValue !== hand2.handRankValue) {
    return hand1.handRankValue - hand2.handRankValue
  }
  for (let i = 0; i < Math.max(hand1.kickers.length, hand2.kickers.length); i++) {
    const k1 = hand1.kickers[i] || 0
    const k2 = hand2.kickers[i] || 0
    if (k1 !== k2) return k1 - k2
  }
  return 0
}

// ===== Formatting Utilities =====

/**
 * Format a coin amount with Brazilian separators
 */
export function formatCoins(amount: number): string {
  return amount.toLocaleString('pt-BR')
}

/**
 * Format a diamond amount
 */
export function formatDiamonds(amount: number): string {
  return amount.toLocaleString('pt-BR')
}

/**
 * Format a VIP tier name for display
 */
export function formatVipTier(tier: string): string {
  const map: Record<string, string> = {
    none: 'Free',
    bronze: 'Bronze',
    silver: 'Prata',
    gold: 'Ouro',
  }
  return map[tier] || tier
}

/**
 * Get relative time in Portuguese
 */
export function getRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'agora'
  if (diffMins < 60) return `${diffMins}min atras`
  if (diffHours < 24) return `${diffHours}h atras`
  if (diffDays < 7) return `${diffDays}d atras`
  return date.toLocaleDateString('pt-BR')
}

/**
 * Generate a unique room code
 */
export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

/**
 * Get card display name in Portuguese
 */
export function getCardNamePt(rank: string): string {
  const map: Record<string, string> = {
    'A': 'As', 'K': 'Rei', 'Q': 'Dama', 'J': 'Valete',
    '2': 'Dois', '3': 'Tres', '4': 'Quatro', '5': 'Cinco',
    '6': 'Seis', '7': 'Sete', '8': 'Oito', '9': 'Nove', '10': 'Dez',
  }
  return map[rank] || rank
}

/**
 * Get suit name in Portuguese
 */
export function getSuitNamePt(suit: string): string {
  const map: Record<string, string> = {
    hearts: 'Copas', diamonds: 'Ouros', clubs: 'Paus', spades: 'Espadas',
    cups: 'Copas', swords: 'Espadas', gold: 'Ouros',
  }
  return map[suit] || suit
}

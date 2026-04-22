import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ===== Types =====

export type GameMode = 'truco-mineiro' | 'truco-paulista' | 'poker' | null
export type VipTier = 'none' | 'bronze' | 'silver' | 'gold'
export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert'
export type CardStyle = 'classic' | 'modern' | 'gold'

export interface PlayerStats {
  wins: number
  losses: number
  draws: number
  matchesPlayed: number
  trucoWins: number
  pokerWins: number
  winStreak: number
  bestWinStreak: number
  totalCoinsEarned: number
  totalCoinsSpent: number
  biggestPot: number
  allInsWon: number
  trucosCalled: number
  maoDeFerroWins: number
  playTimeMinutes: number
  friends: number
}

export interface Player {
  id: string
  username: string
  email?: string
  avatar: string
  coins: number
  diamonds: number
  vipTier: VipTier
  level: number
  xp: number
  stats: PlayerStats
}

export interface GameSettings {
  soundEnabled: boolean
  musicEnabled: boolean
  vibration: boolean
  difficulty: Difficulty
  cardStyle: CardStyle
  language: 'pt-BR' | 'en'
}

export interface CurrentGame {
  mode: GameMode
  state: 'idle' | 'playing' | 'paused' | 'finished'
  players: string[]
  scores: Record<string, number>
}

export interface MultiplayerState {
  connectionState: 'disconnected' | 'connecting' | 'connected'
  roomId: string | null
  players: string[]
  ping: number
}

export interface DailyReward {
  lastClaimed: string | null
  streak: number
  dayOfWeek: number
}

export interface PurchaseRecord {
  id: string
  date: string
  itemName: string
  itemType: 'coins' | 'diamonds' | 'vip' | 'special'
  amount: number
  price: string
  currency: string
  status: 'completed' | 'processing' | 'cancelled'
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt: string | null
  progress: number
  maxProgress: number
  category: 'truco' | 'poker' | 'general' | 'social'
}

export interface MatchRecord {
  id: string
  date: string
  mode: 'truco-mineiro' | 'truco-paulista' | 'poker'
  result: 'win' | 'loss' | 'draw'
  score: string
  opponentScore: string
  opponents: string[]
  duration: number
  coinsEarned: number
  xpEarned: number
}

export type LeaderboardTimeFilter = 'today' | 'week' | 'month' | 'all'
export type LeaderboardModeFilter = 'truco-mineiro' | 'truco-paulista' | 'poker'

export interface LeaderboardEntry {
  rank: number
  playerId: string
  username: string
  avatar: string
  vipTier: VipTier
  matches: number
  wins: number
  winRate: number
  points: number
}

export interface GameState {
  // Player
  player: Player
  // Auth
  isLoggedIn: boolean
  authToken: string | null
  isGuest: boolean
  // Settings
  settings: GameSettings
  // Current Game
  currentGame: CurrentGame
  // Multiplayer
  multiplayer: MultiplayerState
  // Daily Reward
  dailyReward: DailyReward
  // UI State
  showDailyReward: boolean
  // Purchase History
  purchaseHistory: PurchaseRecord[]
  // Achievements
  achievements: Achievement[]
  // Match History
  matchHistory: MatchRecord[]
  // Leaderboard cache
  leaderboardCache: Record<string, LeaderboardEntry[]>
  // Actions
  setPlayer: (player: Partial<Player>) => void
  addCoins: (amount: number) => void
  removeCoins: (amount: number) => boolean
  addDiamonds: (amount: number) => void
  removeDiamonds: (amount: number) => boolean
  setVipTier: (tier: VipTier) => void
  updateStats: (partial: Partial<PlayerStats>) => void
  addXp: (amount: number) => void
  login: (token: string, playerData: Partial<Player>) => void
  logout: () => void
  guestLogin: (name: string) => void
  updateSettings: (partial: Partial<GameSettings>) => void
  startGame: (mode: GameMode) => void
  endGame: () => void
  claimDailyReward: () => void
  dismissDailyReward: () => void
  addPurchase: (purchase: Omit<PurchaseRecord, 'id' | 'date'>) => void
  unlockAchievement: (id: string) => void
  updateAchievementProgress: (id: string, progress: number) => void
  addMatch: (match: Omit<MatchRecord, 'id' | 'date'>) => void
  setLeaderboardCache: (key: string, entries: LeaderboardEntry[]) => void
  resetStore: () => void
}

// ===== Default State =====

const defaultPlayer: Player = {
  id: '',
  username: 'Convidado',
  avatar: '/avatar-default-1.png',
  coins: 5000,
  diamonds: 10,
  vipTier: 'none',
  level: 1,
  xp: 0,
  stats: {
    wins: 12,
    losses: 8,
    draws: 2,
    matchesPlayed: 22,
    trucoWins: 8,
    pokerWins: 4,
    winStreak: 3,
    bestWinStreak: 5,
    totalCoinsEarned: 25000,
    totalCoinsSpent: 5000,
    biggestPot: 5000,
    allInsWon: 3,
    trucosCalled: 45,
    maoDeFerroWins: 2,
    playTimeMinutes: 480,
    friends: 5,
  },
}

const defaultSettings: GameSettings = {
  soundEnabled: true,
  musicEnabled: true,
  vibration: true,
  difficulty: 'medium',
  cardStyle: 'classic',
  language: 'pt-BR',
}

const defaultCurrentGame: CurrentGame = {
  mode: null,
  state: 'idle',
  players: [],
  scores: {},
}

const defaultMultiplayer: MultiplayerState = {
  connectionState: 'disconnected',
  roomId: null,
  players: [],
  ping: 0,
}

const defaultDailyReward: DailyReward = {
  lastClaimed: null,
  streak: 0,
  dayOfWeek: 1,
}

const defaultAchievements: Achievement[] = [
  { id: 'first-win', name: 'Primeira Vitoria', description: 'Vença sua primeira partida', icon: 'trophy', unlocked: true, unlockedAt: '2024-01-15', progress: 1, maxProgress: 1, category: 'general' },
  { id: 'trucador', name: 'Trucador', description: 'Vença 50 partidas de Truco', icon: 'swords', unlocked: false, unlockedAt: null, progress: 8, maxProgress: 50, category: 'truco' },
  { id: 'millionaire', name: 'Milionario', description: 'Acumule 1.000.000 de moedas', icon: 'coins', unlocked: false, unlockedAt: null, progress: 5000, maxProgress: 1000000, category: 'general' },
  { id: 'bluff-master', name: 'Blefe Mestre', description: 'Vença com blefe no Poker 50 vezes', icon: 'eye', unlocked: false, unlockedAt: null, progress: 3, maxProgress: 50, category: 'poker' },
  { id: 'mao-de-ferro', name: 'Mao de Ferro', description: 'Vença uma Mão de Ferro', icon: 'fist', unlocked: true, unlockedAt: '2024-02-01', progress: 2, maxProgress: 1, category: 'truco' },
  { id: 'invicto', name: 'Invicto', description: 'Vença 10 partidas consecutivas', icon: 'flame', unlocked: false, unlockedAt: null, progress: 5, maxProgress: 10, category: 'general' },
  { id: 'all-in-hero', name: 'All-In Hero', description: 'Vença um all-in no Poker', icon: 'zap', unlocked: true, unlockedAt: '2024-01-20', progress: 3, maxProgress: 1, category: 'poker' },
  { id: 'zap-collector', name: 'Zap Collector', description: 'Vença com o Zap (manilha)', icon: 'star', unlocked: true, unlockedAt: '2024-01-25', progress: 1, maxProgress: 1, category: 'truco' },
  { id: 'poker-shark', name: 'Poker Shark', description: 'Vença 50 mãos de Poker', icon: 'chip', unlocked: false, unlockedAt: null, progress: 12, maxProgress: 50, category: 'poker' },
  { id: 'social-butterfly', name: 'Social', description: 'Adicione 10 amigos', icon: 'users', unlocked: false, unlockedAt: null, progress: 5, maxProgress: 10, category: 'social' },
  { id: 'vip-member', name: 'VIP', description: 'Assine qualquer tier VIP', icon: 'crown', unlocked: false, unlockedAt: null, progress: 0, maxProgress: 1, category: 'general' },
  { id: 'dedicated', name: 'Dedicado', description: 'Jogue 7 dias consecutivos', icon: 'calendar', unlocked: true, unlockedAt: '2024-02-10', progress: 7, maxProgress: 7, category: 'general' },
  { id: 'strategist', name: 'Estrategista', description: 'Vença sem jogar manilhas', icon: 'brain', unlocked: false, unlockedAt: null, progress: 0, maxProgress: 1, category: 'truco' },
  { id: 'royal-flush', name: 'Royal Flush', description: 'Obtenha um Royal Flush no Poker', icon: 'crown-gold', unlocked: false, unlockedAt: null, progress: 0, maxProgress: 1, category: 'poker' },
  { id: 'coin-magnet', name: 'Imã de Moedas', description: 'Ganhe 100.000 moedas em partidas', icon: 'magnet', unlocked: false, unlockedAt: null, progress: 25000, maxProgress: 100000, category: 'general' },
  { id: 'truco-master', name: 'Truco Mestre', description: 'Vença 100 partidas de Truco', icon: 'award', unlocked: false, unlockedAt: null, progress: 8, maxProgress: 100, category: 'truco' },
]

const defaultMatchHistory: MatchRecord[] = [
  { id: 'm1', date: '2024-03-15T14:30:00', mode: 'truco-mineiro', result: 'win', score: '12', opponentScore: '10', opponents: ['Bot_Maria', 'Bot_Joao', 'Bot_Ana'], duration: 8, coinsEarned: 500, xpEarned: 25 },
  { id: 'm2', date: '2024-03-15T13:45:00', mode: 'poker', result: 'win', score: '2500', opponentScore: '0', opponents: ['Bot_Carlos', 'Bot_Maria'], duration: 15, coinsEarned: 2500, xpEarned: 50 },
  { id: 'm3', date: '2024-03-14T18:20:00', mode: 'truco-mineiro', result: 'loss', score: '10', opponentScore: '12', opponents: ['Bot_Joao', 'Bot_Ana', 'Bot_Pedro'], duration: 10, coinsEarned: 0, xpEarned: 10 },
  { id: 'm4', date: '2024-03-14T16:00:00', mode: 'truco-paulista', result: 'win', score: '12', opponentScore: '8', opponents: ['Bot_Maria', 'Bot_Carlos', 'Bot_Luis'], duration: 12, coinsEarned: 750, xpEarned: 30 },
  { id: 'm5', date: '2024-03-13T20:15:00', mode: 'poker', result: 'loss', score: '0', opponentScore: '1500', opponents: ['Bot_Ana', 'Bot_Pedro'], duration: 20, coinsEarned: 0, xpEarned: 15 },
  { id: 'm6', date: '2024-03-13T19:00:00', mode: 'truco-mineiro', result: 'win', score: '12', opponentScore: '6', opponents: ['Bot_Joao', 'Bot_Maria', 'Bot_Luis'], duration: 7, coinsEarned: 600, xpEarned: 28 },
  { id: 'm7', date: '2024-03-12T21:30:00', mode: 'truco-mineiro', result: 'win', score: '12', opponentScore: '11', opponents: ['Bot_Carlos', 'Bot_Ana', 'Bot_Pedro'], duration: 14, coinsEarned: 800, xpEarned: 35 },
  { id: 'm8', date: '2024-03-12T18:00:00', mode: 'poker', result: 'win', score: '5000', opponentScore: '0', opponents: ['Bot_Maria', 'Bot_Joao'], duration: 25, coinsEarned: 5000, xpEarned: 80 },
]

const defaultPurchaseHistory: PurchaseRecord[] = [
  { id: 'TRX-001', date: '2024-03-10T10:30:00', itemName: 'Pacote Starter', itemType: 'coins', amount: 10000, price: 'R$ 4,99', currency: 'BRL', status: 'completed' },
  { id: 'TRX-002', date: '2024-02-28T15:20:00', itemName: 'Pacote Pro', itemType: 'coins', amount: 50000, price: 'R$ 19,99', currency: 'BRL', status: 'completed' },
]

// ===== Store =====

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // State
      player: { ...defaultPlayer },
      isLoggedIn: false,
      authToken: null,
      isGuest: false,
      settings: { ...defaultSettings },
      currentGame: { ...defaultCurrentGame },
      multiplayer: { ...defaultMultiplayer },
      dailyReward: { ...defaultDailyReward },
      showDailyReward: false,
      purchaseHistory: [...defaultPurchaseHistory],
      achievements: [...defaultAchievements],
      matchHistory: [...defaultMatchHistory],
      leaderboardCache: {},

      // Actions
      setPlayer: (partial) =>
        set((state) => ({
          player: { ...state.player, ...partial },
        })),

      addCoins: (amount) =>
        set((state) => ({
          player: {
            ...state.player,
            coins: state.player.coins + amount,
            stats: {
              ...state.player.stats,
              totalCoinsEarned: state.player.stats.totalCoinsEarned + amount,
            },
          },
        })),

      removeCoins: (amount) => {
        const state = get()
        if (state.player.coins < amount) return false
        set({
          player: {
            ...state.player,
            coins: state.player.coins - amount,
            stats: {
              ...state.player.stats,
              totalCoinsSpent: state.player.stats.totalCoinsSpent + amount,
            },
          },
        })
        return true
      },

      addDiamonds: (amount) =>
        set((state) => ({
          player: {
            ...state.player,
            diamonds: state.player.diamonds + amount,
          },
        })),

      removeDiamonds: (amount) => {
        const state = get()
        if (state.player.diamonds < amount) return false
        set({
          player: {
            ...state.player,
            diamonds: state.player.diamonds - amount,
          },
        })
        return true
      },

      setVipTier: (tier) =>
        set((state) => ({
          player: { ...state.player, vipTier: tier },
        })),

      updateStats: (partial) =>
        set((state) => ({
          player: {
            ...state.player,
            stats: { ...state.player.stats, ...partial },
          },
        })),

      addXp: (amount) =>
        set((state) => {
          const newXp = state.player.xp + amount
          const newLevel = Math.floor(newXp / 1000) + 1
          return {
            player: {
              ...state.player,
              xp: newXp,
              level: Math.max(newLevel, state.player.level),
            },
          }
        }),

      login: (token, playerData) =>
        set({
          isLoggedIn: true,
          authToken: token,
          isGuest: false,
          player: {
            ...get().player,
            ...playerData,
          },
        }),

      logout: () =>
        set({
          isLoggedIn: false,
          authToken: null,
          isGuest: false,
          player: { ...defaultPlayer },
        }),

      guestLogin: (name) =>
        set({
          isLoggedIn: true,
          isGuest: true,
          authToken: 'guest',
          player: {
            ...defaultPlayer,
            id: `guest_${Date.now()}`,
            username: name || 'Convidado',
            coins: 3000,
            diamonds: 0,
          },
        }),

      updateSettings: (partial) =>
        set((state) => ({
          settings: { ...state.settings, ...partial },
        })),

      startGame: (mode) =>
        set({
          currentGame: {
            mode,
            state: 'playing',
            players: [],
            scores: {},
          },
        }),

      endGame: () =>
        set({
          currentGame: { ...defaultCurrentGame },
        }),

      claimDailyReward: () => {
        const state = get()
        const rewards = [1000, 2000, 3000, 5000, 10000, 15000, 25000]
        const diamondRewards = [0, 0, 0, 0, 10, 0, 50]
        const dayIndex = Math.min(state.dailyReward.dayOfWeek - 1, 6)
        const coinReward = rewards[dayIndex]
        const diamondReward = diamondRewards[dayIndex]

        set((s) => ({
          player: {
            ...s.player,
            coins: s.player.coins + coinReward,
            diamonds: s.player.diamonds + diamondReward,
          },
          dailyReward: {
            lastClaimed: new Date().toISOString(),
            streak: s.dailyReward.streak + 1,
            dayOfWeek: Math.min(s.dailyReward.dayOfWeek + 1, 7),
          },
          showDailyReward: false,
        }))
      },

      dismissDailyReward: () =>
        set({ showDailyReward: false }),

      addPurchase: (purchase) =>
        set((state) => ({
          purchaseHistory: [
            {
              ...purchase,
              id: `TRX-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
              date: new Date().toISOString(),
            },
            ...state.purchaseHistory,
          ],
        })),

      unlockAchievement: (id) =>
        set((state) => ({
          achievements: state.achievements.map((a) =>
            a.id === id && !a.unlocked
              ? { ...a, unlocked: true, unlockedAt: new Date().toISOString(), progress: a.maxProgress }
              : a
          ),
        })),

      updateAchievementProgress: (id, progress) =>
        set((state) => ({
          achievements: state.achievements.map((a) =>
            a.id === id
              ? { ...a, progress: Math.min(progress, a.maxProgress) }
              : a
          ),
        })),

      addMatch: (match) =>
        set((state) => ({
          matchHistory: [
            {
              ...match,
              id: `match_${Date.now()}`,
              date: new Date().toISOString(),
            },
            ...state.matchHistory,
          ],
        })),

      setLeaderboardCache: (key, entries) =>
        set((state) => ({
          leaderboardCache: { ...state.leaderboardCache, [key]: entries },
        })),

      resetStore: () =>
        set({
          player: { ...defaultPlayer },
          isLoggedIn: false,
          authToken: null,
          isGuest: false,
          settings: { ...defaultSettings },
          currentGame: { ...defaultCurrentGame },
          multiplayer: { ...defaultMultiplayer },
          dailyReward: { ...defaultDailyReward },
          showDailyReward: false,
          purchaseHistory: [...defaultPurchaseHistory],
          achievements: [...defaultAchievements],
          matchHistory: [...defaultMatchHistory],
          leaderboardCache: {},
        }),
    }),
    {
      name: 'truco-poker-arena',
      partialize: (state) => ({
        player: state.player,
        isLoggedIn: state.isLoggedIn,
        isGuest: state.isGuest,
        authToken: state.authToken,
        settings: state.settings,
        dailyReward: state.dailyReward,
        purchaseHistory: state.purchaseHistory,
        achievements: state.achievements,
        matchHistory: state.matchHistory,
        leaderboardCache: state.leaderboardCache,
      }),
    }
  )
)

// ===== Selectors =====

export const selectIsAuthenticated = (state: GameState) =>
  state.isLoggedIn || state.isGuest

export const selectCanAfford = (amount: number) => (state: GameState) =>
  state.player.coins >= amount

export const selectUnlockedAchievements = (state: GameState) =>
  state.achievements.filter((a) => a.unlocked)

export const selectLockedAchievements = (state: GameState) =>
  state.achievements.filter((a) => !a.unlocked)

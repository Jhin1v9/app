import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Trophy, ChevronLeft, ChevronRight, Crown } from 'lucide-react'
import { useGameStore } from '@/store/gameStore'
import PodiumItem from '@/components/leaderboard/PodiumItem'
import RankRow from '@/components/leaderboard/RankRow'
import FilterTabs from '@/components/leaderboard/FilterTabs'
import type { LeaderboardEntry, LeaderboardModeFilter, LeaderboardTimeFilter } from '@/store/gameStore'

// Generate mock leaderboard data
function generateLeaderboardData(mode: LeaderboardModeFilter, time: LeaderboardTimeFilter): LeaderboardEntry[] {
  const baseEntries: Omit<LeaderboardEntry, 'rank'>[] = [
    { playerId: 'p1', username: 'MestreTruco', avatar: '/avatar-default-1.png', vipTier: 'gold', matches: 342, wins: 289, winRate: 84, points: 24500 },
    { playerId: 'p2', username: 'PokerKing_BR', avatar: '/avatar-default-2.png', vipTier: 'gold', matches: 298, wins: 241, winRate: 81, points: 21800 },
    { playerId: 'p3', username: 'ZapQueen', avatar: '/avatar-default-3.png', vipTier: 'silver', matches: 256, wins: 198, winRate: 77, points: 19200 },
    { playerId: 'p4', username: 'BlefeMestre', avatar: '/avatar-default-4.png', vipTier: 'silver', matches: 310, wins: 234, winRate: 75, points: 17600 },
    { playerId: 'p5', username: 'CarlosTrucador', avatar: '/avatar-default-1.png', vipTier: 'bronze', matches: 189, wins: 142, winRate: 75, points: 15400 },
    { playerId: 'p6', username: 'MariaPoker', avatar: '/avatar-default-2.png', vipTier: 'bronze', matches: 234, wins: 171, winRate: 73, points: 14200 },
    { playerId: 'p7', username: 'JoaoDasCartas', avatar: '/avatar-default-3.png', vipTier: 'none', matches: 267, wins: 187, winRate: 70, points: 13100 },
    { playerId: 'p8', username: 'AnaMaoDeFerro', avatar: '/avatar-default-4.png', vipTier: 'none', matches: 198, wins: 134, winRate: 68, points: 11900 },
    { playerId: 'p9', username: 'PedroAllIn', avatar: '/avatar-default-1.png', vipTier: 'none', matches: 176, wins: 118, winRate: 67, points: 10800 },
    { playerId: 'p10', username: 'LuizaRoyal', avatar: '/avatar-default-2.png', vipTier: 'silver', matches: 145, wins: 96, winRate: 66, points: 9700 },
    { playerId: 'p11', username: 'FernandoXP', avatar: '/avatar-default-3.png', vipTier: 'none', matches: 167, wins: 108, winRate: 65, points: 8900 },
    { playerId: 'p12', username: 'JulianaSorte', avatar: '/avatar-default-4.png', vipTier: 'bronze', matches: 134, wins: 85, winRate: 63, points: 8200 },
    { playerId: 'p13', username: 'RicardoFlush', avatar: '/avatar-default-1.png', vipTier: 'none', matches: 156, wins: 96, winRate: 62, points: 7600 },
    { playerId: 'p14', username: 'PatriciaCall', avatar: '/avatar-default-2.png', vipTier: 'none', matches: 123, wins: 74, winRate: 60, points: 7100 },
    { playerId: 'p15', username: 'RobertoRaise', avatar: '/avatar-default-3.png', vipTier: 'none', matches: 145, wins: 86, winRate: 59, points: 6500 },
    { playerId: 'p16', username: 'CamilaCheck', avatar: '/avatar-default-4.png', vipTier: 'none', matches: 112, wins: 65, winRate: 58, points: 5800 },
    { playerId: 'p17', username: 'BrunoFold', avatar: '/avatar-default-1.png', vipTier: 'none', matches: 98, wins: 55, winRate: 56, points: 5200 },
    { playerId: 'p18', username: 'MarianaBluff', avatar: '/avatar-default-2.png', vipTier: 'none', matches: 87, wins: 47, winRate: 54, points: 4600 },
    { playerId: 'p19', username: 'GabrielTruco', avatar: '/avatar-default-3.png', vipTier: 'none', matches: 76, wins: 39, winRate: 51, points: 3800 },
    { playerId: 'p20', username: 'LarissaPoker', avatar: '/avatar-default-4.png', vipTier: 'none', matches: 65, wins: 32, winRate: 49, points: 3100 },
    { playerId: 'p21', username: 'ThiagoCartas', avatar: '/avatar-default-1.png', vipTier: 'none', matches: 54, wins: 25, winRate: 46, points: 2500 },
    { playerId: 'p22', username: 'VanessaRaise', avatar: '/avatar-default-2.png', vipTier: 'none', matches: 43, wins: 19, winRate: 44, points: 1900 },
    { playerId: 'p23', username: 'DiegoMesa', avatar: '/avatar-default-3.png', vipTier: 'none', matches: 38, wins: 15, winRate: 39, points: 1400 },
    { playerId: 'p24', username: 'NatashaFelt', avatar: '/avatar-default-4.png', vipTier: 'none', matches: 28, wins: 10, winRate: 36, points: 900 },
    { playerId: 'p25', username: 'LucasChip', avatar: '/avatar-default-1.png', vipTier: 'none', matches: 22, wins: 7, winRate: 32, points: 500 },
    { playerId: 'p26', username: 'SofiaDeck', avatar: '/avatar-default-2.png', vipTier: 'none', matches: 18, wins: 5, winRate: 28, points: 300 },
    { playerId: 'p27', username: 'AndrePot', avatar: '/avatar-default-3.png', vipTier: 'none', matches: 15, wins: 4, winRate: 27, points: 200 },
    { playerId: 'p28', username: 'BeatrizHand', avatar: '/avatar-default-4.png', vipTier: 'none', matches: 12, wins: 3, winRate: 25, points: 150 },
    { playerId: 'p29', username: 'CaioRiver', avatar: '/avatar-default-1.png', vipTier: 'none', matches: 10, wins: 2, winRate: 20, points: 100 },
    { playerId: 'p30', username: 'DianaTurn', avatar: '/avatar-default-2.png', vipTier: 'none', matches: 8, wins: 1, winRate: 13, points: 50 },
  ]

  // Adjust points based on time filter
  const timeMultiplier = time === 'today' ? 0.05 : time === 'week' ? 0.2 : time === 'month' ? 0.5 : 1
  const modeMultiplier = mode === 'poker' ? 0.8 : mode === 'truco-paulista' ? 0.9 : 1

  return baseEntries.map((e, i) => ({
    ...e,
    rank: i + 1,
    points: Math.round(e.points * timeMultiplier * modeMultiplier),
    matches: Math.round(e.matches * timeMultiplier),
    wins: Math.round(e.wins * timeMultiplier),
  }))
}

const modeTabs: { value: LeaderboardModeFilter; label: string }[] = [
  { value: 'truco-mineiro', label: 'Truco Mineiro' },
  { value: 'truco-paulista', label: 'Truco Paulista' },
  { value: 'poker', label: 'Poker' },
]

const timeTabs: { value: LeaderboardTimeFilter; label: string }[] = [
  { value: 'today', label: 'Hoje' },
  { value: 'week', label: 'Semana' },
  { value: 'month', label: 'Mês' },
  { value: 'all', label: 'Tudo' },
]

const PAGE_SIZE = 50

export default function Leaderboard() {
  const { player } = useGameStore()
  const [modeFilter, setModeFilter] = useState<LeaderboardModeFilter>('truco-mineiro')
  const [timeFilter, setTimeFilter] = useState<LeaderboardTimeFilter>('all')
  const [page, setPage] = useState(1)
  const [selectedEntry, setSelectedEntry] = useState<LeaderboardEntry | null>(null)

  const allEntries = useMemo(
    () => generateLeaderboardData(modeFilter, timeFilter),
    [modeFilter, timeFilter]
  )

  // Insert current player into the list at a reasonable position
  const entriesWithPlayer = useMemo(() => {
    const playerEntry: LeaderboardEntry = {
      rank: 0,
      playerId: player.id || 'me',
      username: player.username,
      avatar: player.avatar,
      vipTier: player.vipTier,
      matches: player.stats.matchesPlayed,
      wins: player.stats.wins,
      winRate: player.stats.matchesPlayed > 0 ? Math.round((player.stats.wins / player.stats.matchesPlayed) * 100) : 0,
      points: Math.round(player.stats.totalCoinsEarned / 10),
    }

    // Place player at rank ~15
    const insertRank = 15
    const entries = [...allEntries]
    entries.splice(insertRank - 1, 0, { ...playerEntry, rank: insertRank })

    // Renumber ranks
    return entries.map((e, i) => ({ ...e, rank: i + 1 }))
  }, [allEntries, player])

  const totalPages = Math.ceil(entriesWithPlayer.length / PAGE_SIZE)
  const paginatedEntries = entriesWithPlayer.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const top3 = entriesWithPlayer.slice(0, 3)

  // Find player position
  const playerRank = entriesWithPlayer.findIndex((e) => e.username === player.username) + 1
  const totalPlayers = entriesWithPlayer.length

  const handlePageChange = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage)
      window.scrollTo({ top: 400, behavior: 'smooth' })
    }
  }, [totalPages])

  return (
    <div className="min-h-[100dvh] pb-12" style={{ background: 'var(--bg-dark)' }}>
      {/* ===== HEADER ===== */}
      <div
        className="relative w-full pt-10 pb-20 px-4"
        style={{
          background: 'linear-gradient(180deg, #141B2D 0%, #0A0E1A 100%)',
          borderBottom: '1px solid #2A3655',
        }}
      >
        {/* Trophy pattern */}
        <div className="absolute inset-0 overflow-hidden opacity-[0.03] pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <Trophy
              key={i}
              size={40}
              className="absolute text-white"
              style={{
                left: `${(i % 5) * 25}%`,
                top: `${Math.floor(i / 5) * 50}%`,
                transform: `rotate(${Math.random() * 30 - 15}deg)`,
              }}
            />
          ))}
        </div>

        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center text-3xl md:text-4xl font-bold text-[#D4A830] mb-2"
          style={{ fontFamily: 'Cinzel, Georgia, serif' }}
        >
          RANKING
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center text-sm text-[#8B95B8] mb-8"
        >
          Os melhores jogadores do mundo
        </motion.p>

        {/* Player position card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.2,
            duration: 0.4,
            ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
          }}
          className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-full max-w-[600px] mx-auto"
        >
          <div
            className="mx-4 rounded-xl px-6 py-4 flex items-center gap-4"
            style={{
              background: 'linear-gradient(180deg, #141B2D 0%, #0F1525 100%)',
              border: '2px solid #D4A830',
              boxShadow: '0 0 20px rgba(212,168,48,0.2)',
            }}
          >
            <span className="text-2xl font-bold text-[#D4A830] font-mono">#{playerRank}</span>
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
              style={{
                background: player.vipTier !== 'none'
                  ? 'linear-gradient(135deg, #D4A830 0%, #F0C94A 100%)'
                  : '#2A3655',
                color: player.vipTier !== 'none' ? '#0A0E1A' : '#F0F0F5',
              }}
            >
              {player.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#F0F0F5] truncate">{player.username}</p>
              <p className="text-xs text-[#8B95B8]">
                {modeFilter === 'truco-mineiro' ? 'Truco Mineiro' : modeFilter === 'truco-paulista' ? 'Truco Paulista' : 'Poker'}
                {' — '}
                {timeFilter === 'today' ? 'Hoje' : timeFilter === 'week' ? 'Esta semana' : timeFilter === 'month' ? 'Este mês' : 'Todo o período'}
              </p>
            </div>
            <span className="text-sm font-bold text-[#D4A830] font-mono flex-shrink-0">
              {entriesWithPlayer[playerRank - 1]?.points.toLocaleString('pt-BR') || 0} pts
            </span>
          </div>
        </motion.div>
      </div>

      {/* ===== FILTERS ===== */}
      <div className="max-w-3xl mx-auto px-4 pt-16 pb-6">
        <div className="flex flex-col gap-3">
          <FilterTabs tabs={modeTabs} active={modeFilter} onChange={setModeFilter} variant="pills" />
          <FilterTabs tabs={timeTabs} active={timeFilter} onChange={setTimeFilter} variant="underline" />
        </div>
      </div>

      {/* ===== PODIUM (Top 3) ===== */}
      <div className="max-w-xl mx-auto px-4 mb-8">
        <div className="flex items-end justify-center gap-3 md:gap-6 h-[240px]">
          {/* Rank 2 */}
          <div className="flex-1 h-full flex flex-col justify-end">
            <PodiumItem
              rank={2}
              username={top3[1]?.username || ''}
              points={top3[1]?.points || 0}
              avatar={top3[1]?.avatar || ''}
              index={0}
            />
          </div>
          {/* Rank 1 */}
          <div className="flex-1 h-full flex flex-col justify-end">
            <PodiumItem
              rank={1}
              username={top3[0]?.username || ''}
              points={top3[0]?.points || 0}
              avatar={top3[0]?.avatar || ''}
              index={1}
            />
          </div>
          {/* Rank 3 */}
          <div className="flex-1 h-full flex flex-col justify-end">
            <PodiumItem
              rank={3}
              username={top3[2]?.username || ''}
              points={top3[2]?.points || 0}
              avatar={top3[2]?.avatar || ''}
              index={2}
            />
          </div>
        </div>
      </div>

      {/* ===== RANKING TABLE ===== */}
      <div className="max-w-3xl mx-auto px-4">
        {/* Table Header */}
        <div
          className="grid gap-2 px-4 py-3 rounded-t-lg text-xs text-[#8B95B8] uppercase"
          style={{
            background: '#141B2D',
            gridTemplateColumns: '60px 1fr 80px 80px 100px',
          }}
        >
          <span>Rank</span>
          <span>Jogador</span>
          <span className="text-right">Partidas</span>
          <span className="text-right">Taxa %</span>
          <span className="text-right">Pontos</span>
        </div>

        {/* Table Rows */}
        <div className="space-y-1">
          {paginatedEntries.map((entry) => (
            <RankRow
              key={entry.playerId}
              entry={entry}
              isCurrentPlayer={entry.username === player.username}
              index={entry.rank - 1}
              onClick={() => setSelectedEntry(entry)}
            />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6 pb-8">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#141B2D] border border-[#2A3655] text-[#8B95B8] hover:text-[#F0F0F5] hover:border-[#D4A830] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={18} />
            </button>

            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum = i + 1
              if (totalPages > 5 && page > 3) {
                pageNum = page - 3 + i + 1
                if (pageNum > totalPages) pageNum = totalPages - (4 - i)
              }
              if (pageNum < 1 || pageNum > totalPages) return null
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                    page === pageNum
                      ? 'bg-[#D4A830] text-[#0A0E1A]'
                      : 'bg-[#141B2D] border border-[#2A3655] text-[#8B95B8] hover:text-[#F0F0F5]'
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}

            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#141B2D] border border-[#2A3655] text-[#8B95B8] hover:text-[#F0F0F5] hover:border-[#D4A830] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      {/* ===== PLAYER RANK CARD (Bottom) ===== */}
      <div className="max-w-3xl mx-auto px-4 mt-8">
        <div
          className="rounded-xl p-6 text-center"
          style={{
            background: 'linear-gradient(180deg, #141B2D 0%, #0F1525 100%)',
            border: '1px solid #2A3655',
          }}
        >
          <p className="text-sm text-[#8B95B8] mb-2">
            Você está na posição <span className="text-[#D4A830] font-bold font-mono">#{playerRank}</span> de{' '}
            <span className="text-[#F0F0F5] font-medium">{totalPlayers}</span> jogadores
          </p>
          {playerRank > 1 && (
            <p className="text-xs text-[#8B95B8]">
              {entriesWithPlayer[playerRank - 2] ? (
                <>
                  Faltam{' '}
                  <span className="text-[#D4A830] font-mono">
                    {(entriesWithPlayer[playerRank - 2].points - (entriesWithPlayer[playerRank - 1]?.points || 0)).toLocaleString('pt-BR')}
                  </span>{' '}
                  pts para passar <span className="text-[#F0F0F5]">{entriesWithPlayer[playerRank - 2].username}</span>
                </>
              ) : null}
            </p>
          )}
        </div>
      </div>

      {/* ===== RANK DETAIL MODAL ===== */}
      {selectedEntry && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: 'rgba(10, 14, 26, 0.85)',
            backdropFilter: 'blur(4px)',
          }}
          onClick={() => setSelectedEntry(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] }}
            className="w-full max-w-[480px] rounded-2xl p-6"
            style={{
              background: 'linear-gradient(180deg, #1E2945 0%, #141B2D 100%)',
              border: '1px solid #2A3655',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Player preview */}
            <div className="flex flex-col items-center mb-6">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold mb-3"
                style={{
                  background: selectedEntry.vipTier !== 'none'
                    ? 'linear-gradient(135deg, #D4A830 0%, #F0C94A 100%)'
                    : '#2A3655',
                  color: selectedEntry.vipTier !== 'none' ? '#0A0E1A' : '#F0F0F5',
                  border: selectedEntry.vipTier !== 'none' ? '3px solid #D4A830' : '3px solid #2A3655',
                }}
              >
                {selectedEntry.username.charAt(0).toUpperCase()}
              </div>
              <h3 className="text-xl font-bold text-[#F0F0F5]">{selectedEntry.username}</h3>
              <p className="text-sm text-[#D4A830] font-mono">
                #{selectedEntry.rank} Global
              </p>
              {selectedEntry.vipTier !== 'none' && (
                <div className="flex items-center gap-1 mt-1">
                  <Crown size={14} className="text-[#D4A830]" />
                  <span className="text-xs text-[#D4A830]">VIP {selectedEntry.vipTier === 'bronze' ? 'Bronze' : selectedEntry.vipTier === 'silver' ? 'Prata' : 'Ouro'}</span>
                </div>
              )}
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { label: 'Partidas', value: selectedEntry.matches },
                { label: 'Vitórias', value: selectedEntry.wins },
                { label: 'Taxa %', value: `${selectedEntry.winRate}%`, color: selectedEntry.winRate >= 60 ? '#10B981' : selectedEntry.winRate >= 40 ? '#D4A830' : '#DC2626' },
                { label: 'Pontos', value: selectedEntry.points.toLocaleString('pt-BR'), color: '#D4A830' },
              ].map((s) => (
                <div
                  key={s.label}
                  className="p-3 rounded-lg text-center"
                  style={{ background: '#0A0E1A' }}
                >
                  <p className="text-xs text-[#8B95B8] mb-1">{s.label}</p>
                  <p className="text-lg font-bold font-mono" style={{ color: (s as { color?: string }).color || '#F0F0F5' }}>
                    {s.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Recent performance bar chart */}
            <div className="mb-6">
              <p className="text-xs text-[#8B95B8] mb-2">Últimas 10 partidas</p>
              <div className="flex items-end gap-1 h-12">
                {Array.from({ length: 10 }).map((_, i) => {
                  const won = Math.random() > 0.4
                  return (
                    <motion.div
                      key={i}
                      className="flex-1 rounded-sm"
                      style={{
                        background: won ? '#10B981' : '#DC2626',
                        minWidth: 4,
                      }}
                      initial={{ height: 0 }}
                      animate={{ height: `${20 + Math.random() * 80}%` }}
                      transition={{ delay: i * 0.05, duration: 0.4 }}
                    />
                  )
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="flex-1 py-2.5 rounded-lg font-semibold text-sm"
                style={{
                  background: 'linear-gradient(135deg, #D4A830 0%, #F0C94A 50%, #D4A830 100%)',
                  color: '#0A0E1A',
                }}
              >
                Adicionar Amigo
              </motion.button>
              <button
                onClick={() => setSelectedEntry(null)}
                className="flex-1 py-2.5 rounded-lg font-medium text-sm bg-[#141B2D] border border-[#2A3655] text-[#F0F0F5] hover:bg-[#1C2540] transition-colors"
              >
                Fechar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

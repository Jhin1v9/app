import { motion } from 'framer-motion'
import { Crown } from 'lucide-react'
import type { LeaderboardEntry } from '@/store/gameStore'

interface RankRowProps {
  entry: LeaderboardEntry
  isCurrentPlayer: boolean
  index: number
  onClick: () => void
}

export default function RankRow({ entry, isCurrentPlayer, index, onClick }: RankRowProps) {
  const getRankColor = (rank: number) => {
    if (rank === 1) return '#D4A830'
    if (rank === 2) return '#C0C0C0'
    if (rank === 3) return '#CD7F32'
    if (rank <= 10) return '#F0F0F5'
    return '#8B95B8'
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown size={14} className="text-[#D4A830]" />
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay: index * 0.04,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      }}
      onClick={onClick}
      className={`grid items-center gap-2 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 ${
        isCurrentPlayer
          ? 'border-l-[3px] border-l-[#D4A830]'
          : ''
      }`}
      style={{
        background: isCurrentPlayer
          ? '#1E2945'
          : index % 2 === 0
            ? '#141B2D'
            : '#0A0E1A',
        gridTemplateColumns: '60px 1fr 80px 80px 100px',
      }}
    >
      {/* Rank */}
      <div className="flex items-center gap-1.5">
        {getRankIcon(entry.rank)}
        <span
          className="text-sm font-bold font-mono"
          style={{ color: getRankColor(entry.rank) }}
        >
          #{entry.rank}
        </span>
      </div>

      {/* Player */}
      <div className="flex items-center gap-2 min-w-0">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
          style={{
            background: entry.vipTier !== 'none'
              ? 'linear-gradient(135deg, #D4A830 0%, #F0C94A 100%)'
              : '#2A3655',
            color: entry.vipTier !== 'none' ? '#0A0E1A' : '#F0F0F5',
          }}
        >
          {entry.username.charAt(0).toUpperCase()}
        </div>
        <span className="text-sm text-[#F0F0F5] truncate font-medium">
          {entry.username}
        </span>
        {entry.vipTier !== 'none' && (
          <Crown size={12} className="text-[#D4A830] flex-shrink-0" />
        )}
      </div>

      {/* Matches */}
      <span className="text-sm text-[#8B95B8] text-right font-mono">
        {entry.matches}
      </span>

      {/* Win rate bar */}
      <div className="text-right">
        <span className="text-sm text-[#8B95B8] font-mono">{entry.winRate}%</span>
        <div className="h-1 rounded-full bg-[#0A0E1A] mt-1 overflow-hidden ml-auto" style={{ width: 50 }}>
          <motion.div
            className="h-full rounded-full"
            style={{
              background: entry.winRate >= 60
                ? '#10B981'
                : entry.winRate >= 40
                  ? '#D4A830'
                  : '#DC2626',
            }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(entry.winRate, 100)}%` }}
            transition={{ duration: 0.6, delay: index * 0.04 + 0.2 }}
          />
        </div>
      </div>

      {/* Points */}
      <span className="text-sm text-[#D4A830] font-bold font-mono text-right">
        {entry.points.toLocaleString('pt-BR')}
      </span>
    </motion.div>
  )
}

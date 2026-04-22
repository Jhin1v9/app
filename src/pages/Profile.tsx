import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Trophy, Clock, Star, Flame, Edit3, Club, Globe,
  Swords, Filter,
} from 'lucide-react'
import { useGameStore } from '@/store/gameStore'
import StatCard from '@/components/profile/StatCard'
import AchievementCard from '@/components/profile/AchievementCard'
import MatchHistoryItem from '@/components/profile/MatchHistoryItem'

const avatarOptions = [
  { id: '/avatar-default-1.png', name: 'Padrão 1', locked: false },
  { id: '/avatar-default-2.png', name: 'Padrão 2', locked: false },
  { id: '/avatar-default-3.png', name: 'Padrão 3', locked: false },
  { id: '/avatar-default-4.png', name: 'Padrão 4', locked: false },
  { id: 'premium-1', name: 'Premium 1', locked: true, unlockType: 'diamonds', unlockValue: 100 },
  { id: 'premium-2', name: 'Premium 2', locked: true, unlockType: 'diamonds', unlockValue: 200 },
  { id: 'premium-3', name: 'Premium 3', locked: true, unlockType: 'diamonds', unlockValue: 300 },
  { id: 'vip-gold', name: 'VIP Ouro', locked: true, unlockType: 'vip', unlockValue: 'gold' },
  { id: 'achv-1', name: 'Conquistador', locked: true, unlockType: 'achievement', unlockValue: 'first-win' },
  { id: 'achv-2', name: 'Mestre', locked: true, unlockType: 'achievement', unlockValue: 'trucador' },
  { id: 'achv-3', name: 'Lendário', locked: true, unlockType: 'achievement', unlockValue: 'millionaire' },
  { id: 'achv-4', name: 'Imortal', locked: true, unlockType: 'achievement', unlockValue: 'invicto' },
]

type AchievementFilter = 'all' | 'unlocked' | 'locked'
type MatchFilter = 'all' | 'truco' | 'poker'

export default function Profile() {
  const { player, achievements, matchHistory } = useGameStore()
  const [achievementFilter, setAchievementFilter] = useState<AchievementFilter>('all')
  const [matchFilter, setMatchFilter] = useState<MatchFilter>('all')
  const [showAvatarSelector, setShowAvatarSelector] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState(player.avatar)

  const filteredAchievements = achievements.filter((a) => {
    if (achievementFilter === 'unlocked') return a.unlocked
    if (achievementFilter === 'locked') return !a.unlocked
    return true
  })

  const filteredMatches = matchHistory.filter((m) => {
    if (matchFilter === 'truco') return m.mode === 'truco-mineiro' || m.mode === 'truco-paulista'
    if (matchFilter === 'poker') return m.mode === 'poker'
    return true
  })

  const winRate = player.stats.matchesPlayed > 0
    ? Math.round((player.stats.wins / player.stats.matchesPlayed) * 100)
    : 0

  const hoursPlayed = Math.floor(player.stats.playTimeMinutes / 60)

  const handleAvatarSelect = (avatarId: string) => {
    setSelectedAvatar(avatarId)
    useGameStore.getState().setPlayer({ avatar: avatarId })
  }

  return (
    <div className="min-h-[100dvh] pb-12" style={{ background: 'var(--bg-dark)' }}>
      {/* ===== HEADER ===== */}
      <div
        className="relative w-full pt-10 pb-16 px-4"
        style={{
          background: 'linear-gradient(180deg, #0A0E1A 0%, #141B2D 100%)',
          borderBottom: '1px solid #2A3655',
        }}
      >
        <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center gap-6">
          {/* Avatar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] }}
            className="relative cursor-pointer"
            onClick={() => setShowAvatarSelector(true)}
          >
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold"
              style={{
                background: player.vipTier !== 'none'
                  ? 'linear-gradient(135deg, #D4A830 0%, #F0C94A 100%)'
                  : 'linear-gradient(135deg, #2A3655 0%, #1C2540 100%)',
                border: player.vipTier !== 'none' ? '4px solid #D4A830' : '4px solid #2A3655',
                boxShadow: player.vipTier !== 'none' ? '0 0 24px rgba(212,168,48,0.3)' : 'none',
              }}
            >
              {player.username.charAt(0).toUpperCase()}
            </div>
            {/* Edit icon */}
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#1E2945] border border-[#2A3655] flex items-center justify-center">
              <Edit3 size={14} className="text-[#8B95B8]" />
            </div>
            {/* VIP frame indicator */}
            {player.vipTier !== 'none' && (
              <motion.div
                animate={{ boxShadow: ['0 0 8px rgba(212,168,48,0.2)', '0 0 20px rgba(212,168,48,0.4)', '0 0 8px rgba(212,168,48,0.2)'] }}
                transition={{ duration: 2, repeat: -1 }}
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{ border: '2px solid rgba(212,168,48,0.5)' }}
              />
            )}
          </motion.div>

          {/* Player Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="text-center md:text-left flex-1"
          >
            <h1 className="text-2xl md:text-3xl font-bold text-[#F0F0F5] mb-1">{player.username}</h1>

            {/* Level bar */}
            <div className="flex items-center gap-2 mb-2 justify-center md:justify-start">
              <span className="text-sm text-[#D4A830]">Nível {player.level}</span>
              <div className="w-32 h-2 rounded-full bg-[#0A0E1A] overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${((player.xp % 1000) / 1000) * 100}%`,
                    background: 'linear-gradient(135deg, #D4A830 0%, #F0C94A 100%)',
                  }}
                />
              </div>
              <span className="text-xs text-[#8B95B8]">{player.xp % 1000}/1000 XP</span>
            </div>

            {/* VIP badge */}
            {player.vipTier !== 'none' && (
              <div className="flex items-center gap-1.5 mb-2 justify-center md:justify-start">
                <Star size={14} className="text-[#D4A830]" />
                <span className="text-xs font-semibold text-[#D4A830] uppercase">
                  VIP {player.vipTier === 'bronze' ? 'Bronze' : player.vipTier === 'silver' ? 'Prata' : 'Ouro'}
                </span>
              </div>
            )}

            <p className="text-xs text-[#8B95B8]">Membro desde Jan/2024</p>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="flex gap-4 md:gap-6 flex-wrap justify-center"
          >
            {[
              { icon: <Trophy size={16} className="text-[#D4A830]" />, value: player.stats.wins, label: 'Vitórias' },
              { icon: <Clock size={16} className="text-[#8B95B8]" />, value: `${hoursPlayed}h`, label: 'Jogadas' },
              { icon: <Star size={16} className="text-[#D4A830]" />, value: player.level, label: 'Nível' },
              { icon: <Flame size={16} className="text-orange-400" />, value: player.stats.winStreak, label: 'Dias seg.' },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.15 }}
                className="flex flex-col items-center"
              >
                <div className="flex items-center gap-1 mb-0.5">{s.icon}<span className="text-sm font-bold text-[#F0F0F5]">{s.value}</span></div>
                <span className="text-[10px] text-[#8B95B8] uppercase">{s.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ===== STATISTICS DASHBOARD ===== */}
      <div className="max-w-3xl mx-auto px-4 mt-8">
        <h2 className="text-lg font-semibold text-[#D4A830] mb-4" style={{ fontFamily: 'Cinzel, Georgia, serif' }}>
          Estatísticas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatCard
            icon={<Club size={22} className="text-emerald-400" />}
            title="Truco"
            stats={[
              { label: 'Partidas', value: player.stats.trucoWins + 14 },
              { label: 'Vitórias', value: `${player.stats.trucoWins} (${Math.round((player.stats.trucoWins / (player.stats.trucoWins + 14 || 1)) * 100)}%)`, color: '#10B981' },
              { label: 'Trucos pedidos', value: player.stats.trucosCalled },
              { label: 'Maior sequência', value: player.stats.bestWinStreak },
            ]}
            chartData={[1, 0, 1, 1, -1, 1, 0, 1, 1, -1]}
            index={0}
          />
          <StatCard
            icon={<Swords size={22} className="text-[#D4A830]" />}
            title="Poker"
            stats={[
              { label: 'Mãos jogadas', value: player.stats.pokerWins + 10 },
              { label: 'Vitórias', value: `${player.stats.pokerWins} (${Math.round((player.stats.pokerWins / (player.stats.pokerWins + 10 || 1)) * 100)}%)`, color: '#10B981' },
              { label: 'All-ins', value: player.stats.allInsWon + 5 },
              { label: 'Maior pote', value: player.stats.biggestPot.toLocaleString('pt-BR'), color: '#D4A830' },
            ]}
            chartData={[0, 1, -1, 1, 1, 0, 1, -1, 1, 1]}
            index={1}
          />
          <StatCard
            icon={<Globe size={22} className="text-blue-400" />}
            title="Multiplayer"
            stats={[
              { label: 'Partidas online', value: player.stats.matchesPlayed },
              { label: 'Taxa de vitória', value: `${winRate}%`, color: winRate >= 50 ? '#10B981' : '#D4A830' },
              { label: 'Torneios', value: 3 },
              { label: 'Amigos', value: player.stats.friends },
            ]}
            index={2}
          />
          <StatCard
            icon={<Star size={22} className="text-[#D4A830]" />}
            title="Geral"
            stats={[
              { label: 'Dias jogados', value: 15 },
              { label: 'Horas totais', value: `${hoursPlayed}h` },
              { label: 'Conquistas', value: `${achievements.filter(a => a.unlocked).length}/${achievements.length}`, color: '#D4A830' },
              { label: 'Nível', value: player.level },
            ]}
            index={3}
          />
        </div>
      </div>

      {/* ===== ACHIEVEMENTS WALL ===== */}
      <div className="max-w-3xl mx-auto px-4 mt-12">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[#D4A830]" style={{ fontFamily: 'Cinzel, Georgia, serif' }}>
              Conquistas
            </h2>
            <p className="text-xs text-[#8B95B8]">
              {achievements.filter(a => a.unlocked).length} de {achievements.length} desbloqueadas
            </p>
          </div>
          <div className="flex gap-1">
            {[
              { value: 'all', label: 'Todas' },
              { value: 'unlocked', label: 'Desbloqueadas' },
              { value: 'locked', label: 'Bloqueadas' },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setAchievementFilter(f.value as AchievementFilter)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors duration-200 ${
                  achievementFilter === f.value
                    ? 'text-[#0A0E1A] bg-gradient-to-r from-[#D4A830] to-[#F0C94A]'
                    : 'text-[#8B95B8] bg-[#141B2D] border border-[#2A3655] hover:text-[#F0F0F5]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {filteredAchievements.map((a, i) => (
            <AchievementCard key={a.id} achievement={a} index={i} />
          ))}
        </div>
      </div>

      {/* ===== MATCH HISTORY ===== */}
      <div className="max-w-3xl mx-auto px-4 mt-12">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="text-lg font-semibold text-[#D4A830]" style={{ fontFamily: 'Cinzel, Georgia, serif' }}>
            Histórico de Partidas
          </h2>
          <div className="flex gap-1">
            {[
              { value: 'all', label: 'Todas' },
              { value: 'truco', label: 'Truco' },
              { value: 'poker', label: 'Poker' },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setMatchFilter(f.value as MatchFilter)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors duration-200 ${
                  matchFilter === f.value
                    ? 'text-[#0A0E1A] bg-gradient-to-r from-[#D4A830] to-[#F0C94A]'
                    : 'text-[#8B95B8] bg-[#141B2D] border border-[#2A3655] hover:text-[#F0F0F5]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {filteredMatches.map((match, i) => (
            <MatchHistoryItem key={match.id} match={match} index={i} />
          ))}
        </div>
      </div>

      {/* ===== AVATAR SELECTOR MODAL ===== */}
      {showAvatarSelector && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: 'rgba(10, 14, 26, 0.85)',
            backdropFilter: 'blur(4px)',
          }}
          onClick={() => setShowAvatarSelector(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] }}
            className="w-full max-w-[520px] rounded-2xl p-6"
            style={{
              background: 'linear-gradient(180deg, #1E2945 0%, #141B2D 100%)',
              border: '1px solid #2A3655',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-[#F0F0F5]">Escolher Avatar</h3>
              <button
                onClick={() => setShowAvatarSelector(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-[#8B95B8] hover:text-[#F0F0F5] hover:bg-white/5 transition-colors"
              >
                <Filter size={16} />
              </button>
            </div>

            {/* Preview */}
            <div className="flex justify-center mb-6">
              <div
                className="w-28 h-28 rounded-full flex items-center justify-center text-4xl font-bold border-3"
                style={{
                  border: '3px solid #D4A830',
                  background: 'linear-gradient(135deg, #D4A830 0%, #F0C94A 100%)',
                  color: '#0A0E1A',
                  boxShadow: '0 0 24px rgba(212,168,48,0.3)',
                }}
              >
                {player.username.charAt(0).toUpperCase()}
              </div>
            </div>

            {/* Avatar Grid */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              {avatarOptions.map((avatar) => (
                <button
                  key={avatar.id}
                  onClick={() => !avatar.locked && handleAvatarSelect(avatar.id)}
                  className={`relative aspect-square rounded-xl flex flex-col items-center justify-center gap-1 transition-all duration-200 ${
                    selectedAvatar === avatar.id
                      ? 'border-2 border-[#D4A830]'
                      : 'border border-[#2A3655]'
                  } ${avatar.locked ? 'opacity-50 cursor-not-allowed' : 'hover:border-[#D4A830]/50 cursor-pointer'}`}
                  style={{ background: '#0A0E1A' }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{
                      background: avatar.locked
                        ? '#2A3655'
                        : 'linear-gradient(135deg, #D4A830 0%, #F0C94A 100%)',
                      color: avatar.locked ? '#8B95B8' : '#0A0E1A',
                    }}
                  >
                    {avatar.name.charAt(0)}
                  </div>
                  <span className="text-[10px] text-[#8B95B8] truncate max-w-full px-1">{avatar.name}</span>
                  {avatar.locked && (
                    <div className="absolute top-1 right-1">
                      <Star size={10} className="text-[#8B95B8]" />
                    </div>
                  )}
                  {selectedAvatar === avatar.id && !avatar.locked && (
                    <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#D4A830] flex items-center justify-center">
                      <Star size={10} className="text-[#0A0E1A]" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Selected info */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#8B95B8]">
                {avatarOptions.find(a => a.id === selectedAvatar)?.name || 'Padrão'}
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowAvatarSelector(false)}
                className="px-6 py-2 rounded-lg font-semibold text-sm"
                style={{
                  background: 'linear-gradient(135deg, #D4A830 0%, #F0C94A 50%, #D4A830 100%)',
                  color: '#0A0E1A',
                }}
              >
                Equipar
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

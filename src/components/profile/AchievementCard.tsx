import { motion } from 'framer-motion'
import { Lock, Check } from 'lucide-react'
import { Trophy, Swords, Eye, Crown, Flame, Star, Zap, Users, Calendar, Brain, Award, Magnet } from 'lucide-react'
import type { Achievement } from '@/store/gameStore'

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  trophy: Trophy,
  swords: Swords,
  coins: Magnet,
  eye: Eye,
  fist: Swords,
  flame: Flame,
  star: Star,
  zap: Zap,
  chip: Crown,
  users: Users,
  crown: Crown,
  calendar: Calendar,
  brain: Brain,
  'crown-gold': Crown,
  award: Award,
  magnet: Magnet,
}

interface AchievementCardProps {
  achievement: Achievement
  index: number
}

export default function AchievementCard({ achievement, index }: AchievementCardProps) {
  const IconComponent = iconMap[achievement.icon] || Trophy
  const progressPercent = Math.min((achievement.progress / achievement.maxProgress) * 100, 100)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.3,
        delay: index * 0.06,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      }}
      className={`relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200 ${
        achievement.unlocked
          ? 'border-[#D4A830] bg-[#141B2D]'
          : 'border-dashed border-[#2A3655] bg-[#141B2D]/60'
      }`}
      style={
        achievement.unlocked
          ? { boxShadow: '0 0 12px rgba(212,168,48,0.15)' }
          : {}
      }
    >
      {/* Lock overlay for locked achievements */}
      {!achievement.unlocked && (
        <div className="absolute top-2 right-2">
          <Lock size={14} className="text-[#8B95B8]" />
        </div>
      )}

      {/* Checkmark for unlocked */}
      {achievement.unlocked && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 500, damping: 25 }}
          className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#D4A830] flex items-center justify-center"
        >
          <Check size={12} className="text-[#0A0E1A]" strokeWidth={3} />
        </motion.div>
      )}

      {/* Icon */}
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
          achievement.unlocked ? '' : 'opacity-40'
        }`}
        style={{
          background: achievement.unlocked
            ? 'linear-gradient(135deg, #D4A830 0%, #F0C94A 50%, #D4A830 100%)'
            : 'linear-gradient(135deg, #2A3655 0%, #1C2540 100%)',
        }}
      >
        <IconComponent
          size={22}
          className={achievement.unlocked ? 'text-[#0A0E1A]' : 'text-[#8B95B8]'}
        />
      </div>

      {/* Name */}
      <h4
        className={`text-sm font-semibold text-center mb-1 ${
          achievement.unlocked ? 'text-[#F0F0F5]' : 'text-[#8B95B8]'
        }`}
      >
        {achievement.name}
      </h4>

      {/* Description */}
      <p
        className={`text-xs text-center mb-3 ${
          achievement.unlocked ? 'text-[#8B95B8]' : 'text-[#8B95B8]/50'
        }`}
      >
        {achievement.description}
      </p>

      {/* Progress bar */}
      <div className="w-full">
        <div className="flex justify-between text-xs mb-1">
          <span className={achievement.unlocked ? 'text-emerald-400' : 'text-[#8B95B8]/60'}>
            {achievement.unlocked
              ? `Desbloqueado em ${achievement.unlockedAt ? new Date(achievement.unlockedAt).toLocaleDateString('pt-BR') : ''}`
              : `${achievement.progress}/${achievement.maxProgress}`}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-[#0A0E1A] overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: achievement.unlocked
                ? 'linear-gradient(135deg, #D4A830 0%, #F0C94A 100%)'
                : '#2A3655',
            }}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
        </div>
      </div>
    </motion.div>
  )
}

import { motion } from 'framer-motion'
import { Crown } from 'lucide-react'

interface PodiumItemProps {
  rank: number
  username: string
  points: number
  avatar: string
  index: number
}

const rankConfig = {
  1: {
    height: '100%',
    color: '#D4A830',
    bgGradient: 'linear-gradient(180deg, rgba(212,168,48,0.2) 0%, rgba(212,168,48,0.05) 100%)',
    border: '2px solid #D4A830',
    avatarSize: 72,
    fontSize: 'text-3xl',
    showCrown: true,
  },
  2: {
    height: '60%',
    color: '#C0C0C0',
    bgGradient: 'linear-gradient(180deg, rgba(192,192,192,0.15) 0%, rgba(192,192,192,0.03) 100%)',
    border: '2px solid #C0C0C0',
    avatarSize: 56,
    fontSize: 'text-2xl',
    showCrown: false,
  },
  3: {
    height: '50%',
    color: '#CD7F32',
    bgGradient: 'linear-gradient(180deg, rgba(205,127,50,0.15) 0%, rgba(205,127,50,0.03) 100%)',
    border: '2px solid #CD7F32',
    avatarSize: 48,
    fontSize: 'text-xl',
    showCrown: false,
  },
}

export default function PodiumItem({ rank, username, points, avatar: _avatar, index }: PodiumItemProps) {
  const config = rankConfig[rank as keyof typeof rankConfig]

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.15,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      }}
      className="flex flex-col items-center flex-1"
    >
      {/* Player info above platform */}
      <div className="flex flex-col items-center mb-3">
        {config.showCrown && (
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Crown size={28} style={{ color: config.color }} />
          </motion.div>
        )}

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            delay: 0.3 + index * 0.15,
            type: 'spring',
            stiffness: 400,
            damping: 20,
          }}
          className="rounded-full flex items-center justify-center border-2 mb-2"
          style={{
            width: config.avatarSize,
            height: config.avatarSize,
            borderColor: config.color,
            boxShadow: rank === 1 ? `0 0 20px ${config.color}40` : 'none',
          }}
        >
          <span className="text-lg font-bold" style={{ color: config.color }}>
            {username.charAt(0).toUpperCase()}
          </span>
        </motion.div>

        <span className="text-sm font-semibold text-[#F0F0F5] max-w-[80px] truncate">
          {username}
        </span>

        <span className="text-xs font-mono mt-0.5" style={{ color: config.color }}>
          {points.toLocaleString('pt-BR')} pts
        </span>
      </div>

      {/* Platform */}
      <motion.div
        initial={{ height: 0 }}
        animate={{ height: config.height }}
        transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        className="w-full rounded-t-lg flex items-center justify-center relative"
        style={{
          background: config.bgGradient,
          border: config.border,
          borderBottom: 'none',
          minHeight: 60,
        }}
      >
        <span className={`font-bold ${config.fontSize}`} style={{ color: config.color }}>
          {rank}
        </span>

        {/* Gold particles for rank 1 */}
        {rank === 1 && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-t-lg">
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-[#D4A830]"
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  bottom: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -30, -60],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2 + Math.random(),
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: 'easeOut',
                }}
              />
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

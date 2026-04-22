import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface StatItem {
  label: string
  value: string | number
  color?: string
}

interface StatCardProps {
  icon: ReactNode
  title: string
  stats: StatItem[]
  chartData?: number[]
  index: number
}

export default function StatCard({ icon, title, stats, chartData, index }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.1,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      }}
      whileHover={{ borderColor: 'rgba(212,168,48,0.3)', transition: { duration: 0.2 } }}
      className="p-5 rounded-xl border border-[#2A3655] transition-colors duration-200"
      style={{ background: '#141B2D' }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3 className="text-lg font-semibold text-[#F0F0F5]">{title}</h3>
      </div>

      {/* Stats list */}
      <ul className="space-y-2 mb-4">
        {stats.map((stat, i) => (
          <li key={i} className="flex justify-between items-center text-sm">
            <span className="text-[#8B95B8]">{stat.label}</span>
            <motion.span
              className="font-semibold font-mono"
              style={{ color: stat.color || '#F0F0F5' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.1 }}
            >
              {stat.value}
            </motion.span>
          </li>
        ))}
      </ul>

      {/* Mini chart */}
      {chartData && chartData.length > 0 && (
        <div className="flex items-end gap-1 h-10 mt-3">
          {chartData.map((val, i) => (
            <motion.div
              key={i}
              className="flex-1 rounded-sm"
              style={{
                background: val >= 0 ? '#10B981' : '#DC2626',
                minWidth: 2,
              }}
              initial={{ height: 0 }}
              animate={{ height: `${Math.min(Math.abs(val) * 10, 100)}%` }}
              transition={{ delay: 0.5 + i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            />
          ))}
        </div>
      )}
    </motion.div>
  )
}

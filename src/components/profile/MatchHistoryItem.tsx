import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, X, Minus, ChevronDown, Clock, Coins } from 'lucide-react'
import type { MatchRecord } from '@/store/gameStore'

interface MatchHistoryItemProps {
  match: MatchRecord
  index: number
}

const modeLabels: Record<string, string> = {
  'truco-mineiro': 'Truco Mineiro',
  'truco-paulista': 'Truco Paulista',
  'poker': 'Poker',
}

export default function MatchHistoryItem({ match, index }: MatchHistoryItemProps) {
  const [expanded, setExpanded] = useState(false)
  const resultConfig = {
    win: { bg: 'bg-emerald-500', icon: Trophy, text: 'Vitória', color: 'text-emerald-400' },
    loss: { bg: 'bg-[#DC2626]', icon: X, text: 'Derrota', color: 'text-[#DC2626]' },
    draw: { bg: 'bg-[#2A3655]', icon: Minus, text: 'Empate', color: 'text-[#8B95B8]' },
  }

  const config = resultConfig[match.result]
  const ResultIcon = config.icon

  const date = new Date(match.date)
  const isToday = new Date().toDateString() === date.toDateString()
  const dateStr = isToday
    ? `Hoje, ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
    : date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay: index * 0.05,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      }}
      className="rounded-lg border border-[#2A3655] overflow-hidden transition-colors duration-200 hover:border-[#2A3655]"
      style={{ background: '#141B2D' }}
    >
      {/* Main row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
      >
        {/* Result indicator */}
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${config.bg}`}
        >
          <ResultIcon size={18} className="text-white" />
        </div>

        {/* Mode */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#F0F0F5]">
            {modeLabels[match.mode] || match.mode}
          </p>
          <div className="flex items-center gap-2 text-xs text-[#8B95B8]">
            <Clock size={12} />
            <span>{dateStr}</span>
            <span>•</span>
            <span>{match.duration} min</span>
          </div>
        </div>

        {/* Score */}
        <div className="text-right flex-shrink-0">
          <p className={`text-sm font-bold font-mono ${config.color}`}>
            {match.score} - {match.opponentScore}
          </p>
          {match.coinsEarned > 0 && (
            <div className="flex items-center gap-1 justify-end">
              <Coins size={12} className="text-[#D4A830]" />
              <span className="text-xs text-[#D4A830] font-medium">+{match.coinsEarned}</span>
            </div>
          )}
        </div>

        {/* Expand arrow */}
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 text-[#8B95B8]"
        >
          <ChevronDown size={18} />
        </motion.div>
      </button>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 pt-1 border-t border-[#2A3655]/50">
              <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                <div>
                  <span className="text-[#8B95B8]">Oponentes:</span>
                  <div className="flex gap-1 mt-1">
                    {match.opponents.map((op, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-full bg-[#0A0E1A] text-[#F0F0F5] text-xs">
                        {op}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-[#8B95B8]">XP ganho:</span>
                  <p className="text-[#F0F0F5] font-medium">+{match.xpEarned} XP</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

import { motion } from 'framer-motion'
import { Check, Lock, Crown } from 'lucide-react'
import type { VipTier } from '@/store/gameStore'

interface VIPCardProps {
  tier: VipTier
  name: string
  price: string
  benefits: { text: string; included: boolean }[]
  isCurrentTier: boolean
  onSubscribe: () => void
  index: number
}

const tierStyles: Record<VipTier, { gradient: string; border: string; shadow: string; icon: string }> = {
  bronze: {
    gradient: 'linear-gradient(135deg, #CD7F32 0%, #A0522D 100%)',
    border: '2px solid #CD7F32',
    shadow: '0 4px 16px rgba(205,127,50,0.3)',
    icon: '#CD7F32',
  },
  silver: {
    gradient: 'linear-gradient(135deg, #C0C0C0 0%, #808080 100%)',
    border: '2px solid #C0C0C0',
    shadow: '0 4px 16px rgba(192,192,192,0.3)',
    icon: '#C0C0C0',
  },
  gold: {
    gradient: 'linear-gradient(135deg, #D4A830 0%, #B8860B 100%)',
    border: '2px solid #D4A830',
    shadow: '0 4px 24px rgba(212,168,48,0.4)',
    icon: '#D4A830',
  },
  none: {
    gradient: '',
    border: '',
    shadow: '',
    icon: '',
  },
}

export default function VIPCard({
  tier,
  name,
  price,
  benefits,
  isCurrentTier,
  onSubscribe,
  index,
}: VIPCardProps) {
  const style = tierStyles[tier]
  const isGold = tier === 'gold'

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.15,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className="relative flex flex-col p-6 rounded-xl w-full max-w-[340px]"
      style={{
        background: 'linear-gradient(180deg, #141B2D 0%, #0F1525 100%)',
        border: style.border,
        boxShadow: style.shadow,
        transform: isGold ? 'scale(1.03)' : 'scale(1)',
      }}
    >
      {/* Crown icon */}
      <div className="flex justify-center mb-3">
        <motion.div
          animate={isGold ? { y: [0, -3, 0] } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Crown size={48} style={{ color: style.icon }} />
        </motion.div>
      </div>

      {/* Tier name */}
      <h3 className="text-center text-2xl font-bold text-[#F0F0F5] mb-1" style={{ fontFamily: 'Cinzel, Georgia, serif' }}>
        {name}
      </h3>

      {/* Price */}
      <p className="text-center text-lg font-semibold text-[#F0F0F5] mb-4">{price}</p>

      {/* Benefits */}
      <ul className="space-y-2.5 mb-6 flex-1">
        {benefits.map((benefit, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.15 + i * 0.05 + 0.3, duration: 0.3 }}
            className={`flex items-center gap-2 text-sm ${
              benefit.included ? 'text-[#F0F0F5]' : 'text-[#8B95B8]'
            }`}
          >
            {benefit.included ? (
              <Check size={16} style={{ color: style.icon }} className="flex-shrink-0" />
            ) : (
              <Lock size={16} className="text-[#8B95B8] flex-shrink-0" />
            )}
            <span>{benefit.text}</span>
          </motion.li>
        ))}
      </ul>

      {/* Subscribe button */}
      <motion.button
        whileHover={{ scale: isCurrentTier ? 1 : 1.02 }}
        whileTap={{ scale: isCurrentTier ? 1 : 0.97 }}
        onClick={onSubscribe}
        disabled={isCurrentTier}
        className="w-full py-3 rounded-lg font-semibold text-sm transition-all duration-200 mt-auto"
        style={{
          background: isCurrentTier
            ? 'var(--bg-card-hover)'
            : style.gradient,
          color: isCurrentTier ? '#8B95B8' : '#FFFFFF',
          border: isCurrentTier ? '1px solid var(--border-subtle)' : 'none',
          boxShadow: isCurrentTier ? 'none' : style.shadow,
          cursor: isCurrentTier ? 'default' : 'pointer',
          opacity: isCurrentTier ? 0.6 : 1,
        }}
      >
        {isCurrentTier ? 'Seu plano atual' : `Assinar ${name}`}
      </motion.button>
    </motion.div>
  )
}

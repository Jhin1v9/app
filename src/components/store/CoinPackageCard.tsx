import { motion } from 'framer-motion'
import { Coins } from 'lucide-react'

interface CoinPackageCardProps {
  name: string
  amount: number
  price: string
  bonus?: string
  diamondBonus?: number
  badge?: string
  badgeColor?: 'gold' | 'emerald'
  featured?: boolean
  onPurchase: () => void
  index: number
}

export default function CoinPackageCard({
  name,
  amount,
  price,
  bonus,
  diamondBonus,
  badge,
  badgeColor = 'gold',
  featured = false,
  onPurchase,
  index,
}: CoinPackageCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.1,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`relative flex flex-col p-6 rounded-xl transition-shadow duration-200 ${
        featured ? 'scale-[1.02] border-2 border-[#D4A830]' : 'border border-[#2A3655]'
      }`}
      style={{
        background: 'linear-gradient(180deg, #141B2D 0%, #0F1525 100%)',
        boxShadow: featured
          ? '0 0 20px rgba(212,168,48,0.3), 0 4px 12px rgba(0,0,0,0.4)'
          : '0 4px 12px rgba(0,0,0,0.4)',
      }}
    >
      {/* Top border accent */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px] rounded-t-xl"
        style={{
          background: featured
            ? 'linear-gradient(135deg, #D4A830 0%, #F0C94A 50%, #D4A830 100%)'
            : '#D4A830',
        }}
      />

      {/* Badge */}
      {badge && (
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className={`absolute -top-2 right-4 px-3 py-1 rounded-full text-xs font-bold ${
            badgeColor === 'emerald' ? 'bg-emerald-600 text-white' : ''
          }`}
          style={
            badgeColor === 'gold'
              ? {
                  background: 'linear-gradient(135deg, #D4A830 0%, #F0C94A 50%, #D4A830 100%)',
                  color: '#0A0E1A',
                }
              : {}
          }
        >
          {badge}
        </motion.div>
      )}

      {/* Package name */}
      <h3 className="text-lg font-semibold text-[#F0F0F5] mb-3">{name}</h3>

      {/* Animated coin icon */}
      <motion.div
        className="flex justify-center my-3"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #D4A830 0%, #F0C94A 50%, #D4A830 100%)',
            boxShadow: '0 0 16px rgba(212,168,48,0.4)',
          }}
        >
          <Coins size={32} className="text-[#0A0E1A]" />
        </div>
      </motion.div>

      {/* Amount */}
      <div className="text-center mb-2">
        <span className="text-2xl font-bold text-[#D4A830] font-mono">
          {amount.toLocaleString('pt-BR')}
        </span>
        <span className="block text-xs text-[#8B95B8] mt-1">Moedas</span>
      </div>

      {/* Bonus */}
      {bonus && (
        <div className="text-center mb-1">
          <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-900/50 text-emerald-400 border border-emerald-700/50">
            +{bonus} BÔNUS
          </span>
        </div>
      )}

      {/* Diamond bonus */}
      {diamondBonus ? (
        <div className="text-center mb-2 flex items-center justify-center gap-1">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-xs text-blue-400 font-medium">+{diamondBonus} Diamantes</span>
        </div>
      ) : (
        <div className="h-6" />
      )}

      {/* Price */}
      <div className="text-center mb-4">
        <span className="text-xl font-bold text-[#F0F0F5]">{price}</span>
      </div>

      {/* Buy button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={onPurchase}
        className="w-full py-3 rounded-lg font-semibold text-sm transition-all duration-200 mt-auto"
        style={{
          background: 'linear-gradient(135deg, #D4A830 0%, #F0C94A 50%, #D4A830 100%)',
          color: '#0A0E1A',
          boxShadow: '0 4px 16px rgba(212,168,48,0.3)',
        }}
      >
        Comprar
      </motion.button>
    </motion.div>
  )
}

import { motion } from 'framer-motion'
import { Diamond } from 'lucide-react'

interface DiamondPackageCardProps {
  name: string
  amount: number
  price: string
  bonus?: number
  badge?: string
  badgeColor?: 'blue' | 'emerald'
  featured?: boolean
  onPurchase: () => void
  index: number
}

export default function DiamondPackageCard({
  name,
  amount,
  price,
  bonus,
  badge,
  badgeColor = 'blue',
  featured = false,
  onPurchase,
  index,
}: DiamondPackageCardProps) {
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
        featured ? 'scale-[1.02] border-2 border-blue-500' : 'border border-[#2A3655]'
      }`}
      style={{
        background: 'linear-gradient(180deg, #141B2D 0%, #0F1525 100%)',
        boxShadow: featured
          ? '0 0 20px rgba(37,99,235,0.3), 0 4px 12px rgba(0,0,0,0.4)'
          : '0 4px 12px rgba(0,0,0,0.4)',
      }}
    >
      {/* Top border accent */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px] rounded-t-xl"
        style={{
          background: 'linear-gradient(135deg, #2563EB 0%, #60A5FA 50%, #2563EB 100%)',
        }}
      />

      {/* Badge */}
      {badge && (
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className={`absolute -top-2 right-4 px-3 py-1 rounded-full text-xs font-bold ${
            badgeColor === 'emerald'
              ? 'bg-emerald-600 text-white'
              : 'bg-blue-600 text-white'
          }`}
        >
          {badge}
        </motion.div>
      )}

      {/* Package name */}
      <h3 className="text-lg font-semibold text-[#F0F0F5] mb-3">{name}</h3>

      {/* Diamond icon */}
      <motion.div
        className="flex justify-center my-3 relative"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center relative"
          style={{
            background: 'linear-gradient(135deg, #2563EB 0%, #60A5FA 50%, #2563EB 100%)',
            boxShadow: '0 0 16px rgba(37,99,235,0.4)',
          }}
        >
          <Diamond size={32} className="text-white" />
        </div>
      </motion.div>

      {/* Amount */}
      <div className="text-center mb-2">
        <span className="text-2xl font-bold text-blue-400 font-mono">
          {amount.toLocaleString('pt-BR')}
        </span>
        <span className="block text-xs text-[#8B95B8] mt-1">Diamantes</span>
      </div>

      {/* Bonus */}
      {bonus ? (
        <div className="text-center mb-2">
          <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-900/50 text-blue-400 border border-blue-700/50">
            +{bonus.toLocaleString('pt-BR')} BÔNUS
          </span>
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
          background: 'linear-gradient(135deg, #2563EB 0%, #60A5FA 50%, #2563EB 100%)',
          color: '#FFFFFF',
          boxShadow: '0 4px 16px rgba(37,99,235,0.3)',
        }}
      >
        Comprar
      </motion.button>
    </motion.div>
  )
}

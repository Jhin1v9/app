import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, Coins, Diamond, Crown } from 'lucide-react'
import { useGameStore } from '@/store/gameStore'

interface PurchaseModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'coins' | 'diamonds' | 'vip'
  itemName: string
  amount: number
  price: string
  diamondBonus?: number
}

type PurchaseStep = 'confirm' | 'processing' | 'success'

// Simple confetti particle component
function ConfettiParticle({ index }: { index: number }) {
  const x = (Math.random() - 0.5) * 300
  const y = (Math.random() - 0.5) * 300
  const rotation = Math.random() * 360
  const colors = ['#D4A830', '#F0C94A', '#10B981', '#2563EB', '#FFFFFF']
  const color = colors[index % colors.length]
  const size = 6 + Math.random() * 6

  return (
    <motion.div
      initial={{ opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 }}
      animate={{
        opacity: [1, 1, 0],
        x: x,
        y: y - 100,
        scale: [1, 1, 0.5],
        rotate: rotation,
      }}
      transition={{ duration: 1.5, ease: 'easeOut', delay: index * 0.03 }}
      className="absolute left-1/2 top-1/2 rounded-sm pointer-events-none"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
      }}
    />
  )
}

export default function PurchaseModal({
  isOpen,
  onClose,
  type,
  itemName,
  amount,
  price,
  diamondBonus,
}: PurchaseModalProps) {
  const [step, setStep] = useState<PurchaseStep>('confirm')
  const [transactionId, setTransactionId] = useState('')
  const { player, addCoins, addDiamonds, addPurchase, setVipTier } = useGameStore()

  const handleConfirm = useCallback(() => {
    setStep('processing')
    setTransactionId(`TRX-${Math.random().toString(36).substring(2, 8).toUpperCase()}`)

    // Simulate processing delay
    setTimeout(() => {
      // Add the actual currency/items
      if (type === 'coins') {
        addCoins(amount)
        if (diamondBonus) {
          addDiamonds(diamondBonus)
        }
      } else if (type === 'diamonds') {
        addDiamonds(amount)
      } else if (type === 'vip') {
        const tierMap: Record<string, 'bronze' | 'silver' | 'gold'> = {
          'Bronze': 'bronze',
          'Prata': 'silver',
          'Ouro': 'gold',
        }
        const tierName = itemName.split(' ').pop() || 'bronze'
        const tier = tierMap[tierName] || 'bronze'
        setVipTier(tier)
      }

      // Save purchase to history
      addPurchase({
        itemName,
        itemType: type,
        amount: type === 'vip' ? 0 : amount + (diamondBonus || 0),
        price,
        currency: 'BRL',
        status: 'completed',
      })

      setStep('success')
    }, 1500)
  }, [type, amount, diamondBonus, itemName, price, addCoins, addDiamonds, addPurchase, setVipTier])

  const handleClose = useCallback(() => {
    setStep('confirm')
    setTransactionId('')
    onClose()
  }, [onClose])

  // Auto-dismiss after success
  useEffect(() => {
    if (step === 'success') {
      const timer = setTimeout(() => {
        handleClose()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [step, handleClose])

  const newBalance =
    type === 'coins'
      ? player.coins + amount
      : type === 'diamonds'
        ? player.diamonds + amount
        : player.coins

  const IconComponent = type === 'coins' ? Coins : type === 'diamonds' ? Diamond : Crown
  const iconColor = type === 'coins' ? '#D4A830' : type === 'diamonds' ? '#2563EB' : '#D4A830'

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: 'rgba(10, 14, 26, 0.85)',
            backdropFilter: 'blur(4px)',
          }}
          onClick={step === 'confirm' ? handleClose : undefined}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{
              duration: 0.3,
              ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
            }}
            className="relative w-full max-w-[400px] rounded-2xl p-8"
            style={{
              background: 'linear-gradient(180deg, #1E2945 0%, #141B2D 100%)',
              border: '2px solid #D4A830',
              boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            {step === 'confirm' && (
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-[#8B95B8] hover:text-[#F0F0F5] hover:bg-white/5 transition-colors"
              >
                <X size={20} />
              </button>
            )}

            <AnimatePresence mode="wait">
              {/* Step 1: Confirm */}
              {step === 'confirm' && (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col items-center"
                >
                  {/* Icon */}
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                    style={{
                      background: `linear-gradient(135deg, ${iconColor}80 0%, ${iconColor}40 100%)`,
                    }}
                  >
                    <IconComponent size={32} style={{ color: iconColor }} />
                  </div>

                  <h2 className="text-xl font-bold text-[#F0F0F5] mb-2" style={{ fontFamily: 'Cinzel, Georgia, serif' }}>
                    Confirmar Compra
                  </h2>

                  <p className="text-[#8B95B8] text-sm text-center mb-1">{itemName}</p>

                  <p
                    className="text-3xl font-bold font-mono mb-4"
                    style={{ color: '#D4A830' }}
                  >
                    {price}
                  </p>

                  <div className="w-full p-3 rounded-lg bg-[#0A0E1A]/50 border border-[#2A3655] mb-6">
                    <p className="text-xs text-[#8B95B8] text-center">
                      Saldo após compra:{' '}
                      <span className="text-[#F0F0F5] font-semibold">
                        {newBalance.toLocaleString('pt-BR')} {type === 'coins' ? 'moedas' : type === 'diamonds' ? 'diamantes' : ''}
                      </span>
                    </p>
                  </div>

                  <div className="flex gap-3 w-full">
                    <button
                      onClick={handleClose}
                      className="flex-1 py-3 rounded-lg font-medium text-sm transition-all duration-200 bg-[#141B2D] border border-[#2A3655] text-[#F0F0F5] hover:bg-[#1C2540] hover:border-[#D4A830]"
                    >
                      Cancelar
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleConfirm}
                      className="flex-1 py-3 rounded-lg font-semibold text-sm transition-all duration-200"
                      style={{
                        background: 'linear-gradient(135deg, #D4A830 0%, #F0C94A 50%, #D4A830 100%)',
                        color: '#0A0E1A',
                        boxShadow: '0 4px 16px rgba(212,168,48,0.3)',
                      }}
                    >
                      Confirmar
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Processing */}
              {step === 'processing' && (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col items-center py-8"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    className="w-16 h-16 rounded-full border-4 border-[#2A3655] border-t-[#D4A830] mb-6"
                  />
                  <p className="text-[#F0F0F5] font-medium text-lg">Processando pagamento...</p>
                  <p className="text-[#8B95B8] text-sm mt-2">Aguarde um momento</p>
                </motion.div>
              )}

              {/* Step 3: Success */}
              {step === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col items-center relative"
                >
                  {/* Confetti */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <ConfettiParticle key={i} index={i} />
                    ))}
                  </div>

                  {/* Checkmark */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      duration: 0.4,
                      ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
                    }}
                    className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center mb-4"
                    style={{ boxShadow: '0 0 24px rgba(16,185,129,0.4)' }}
                  >
                    <Check size={40} className="text-white" strokeWidth={3} />
                  </motion.div>

                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl font-bold text-emerald-400 mb-2"
                    style={{ fontFamily: 'Cinzel, Georgia, serif' }}
                  >
                    Compra realizada!
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-[#F0F0F5] text-lg font-semibold mb-1"
                  >
                    {type === 'vip' ? (
                      <span className="flex items-center gap-2">
                        <Crown size={20} className="text-[#D4A830]" />
                        {itemName}
                      </span>
                    ) : (
                      <span className="text-[#D4A830] font-mono">
                        +{amount.toLocaleString('pt-BR')}{' '}
                        {type === 'coins' ? 'Moedas' : 'Diamantes'}
                      </span>
                    )}
                  </motion.p>

                  {diamondBonus && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-blue-400 text-sm font-medium mb-3"
                    >
                      +{diamondBonus} Diamantes de bônus
                    </motion.p>
                  )}

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="w-full p-3 rounded-lg bg-[#0A0E1A]/50 border border-[#2A3655] mb-2"
                  >
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#8B95B8]">ID da transação:</span>
                      <span className="text-[#F0F0F5] font-mono">{transactionId}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[#8B95B8]">Data:</span>
                      <span className="text-[#F0F0F5]">
                        {new Date().toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </motion.div>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-[#8B95B8] text-xs mb-4"
                  >
                    Novo saldo:{' '}
                    <span className="text-[#D4A830] font-semibold">
                      {(type === 'coins' ? player.coins : player.diamonds).toLocaleString('pt-BR')}
                    </span>
                  </motion.p>

                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleClose}
                    className="w-full py-3 rounded-lg font-semibold text-sm"
                    style={{
                      background: 'linear-gradient(135deg, #D4A830 0%, #F0C94A 50%, #D4A830 100%)',
                      color: '#0A0E1A',
                      boxShadow: '0 4px 16px rgba(212,168,48,0.3)',
                    }}
                  >
                    Continuar
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

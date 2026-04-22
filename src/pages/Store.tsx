import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Coins, Diamond, Crown, Gift, Clock, ShoppingBag } from 'lucide-react'
import { useGameStore } from '@/store/gameStore'
import CoinPackageCard from '@/components/store/CoinPackageCard'
import DiamondPackageCard from '@/components/store/DiamondPackageCard'
import VIPCard from '@/components/store/VIPCard'
import PurchaseModal from '@/components/store/PurchaseModal'
import type { VipTier } from '@/store/gameStore'

type StoreTab = 'coins' | 'diamonds' | 'vip' | 'specials'

const tabs: { value: StoreTab; label: string }[] = [
  { value: 'coins', label: 'Moedas' },
  { value: 'diamonds', label: 'Diamantes' },
  { value: 'vip', label: 'VIP' },
  { value: 'specials', label: 'Especiais' },
]

const coinPackages = [
  { name: 'Coin Starter', amount: 10000, price: 'R$ 4,99', bonus: undefined, diamondBonus: undefined },
  { name: 'Coin Plus', amount: 55000, price: 'R$ 19,99', bonus: '10%', diamondBonus: 50, badge: 'POPULAR' as const },
  { name: 'Coin Pro', amount: 120000, price: 'R$ 49,99', bonus: '20%', diamondBonus: 150, badge: 'MAIOR VALOR' as const, badgeColor: 'emerald' as const, featured: true },
  { name: 'Coin Mega', amount: 280000, price: 'R$ 99,99', bonus: '40%', diamondBonus: 400, badge: 'MEGA' as const },
]

const diamondPackages = [
  { name: 'Diamond Small', amount: 100, price: 'R$ 4,99' },
  { name: 'Diamond Medium', amount: 600, price: 'R$ 19,99', bonus: 50, badge: 'POPULAR' as const },
  { name: 'Diamond Large', amount: 1400, price: 'R$ 49,99', bonus: 200, badge: 'MAIOR VALOR' as const, badgeColor: 'emerald' as const, featured: true },
  { name: 'Diamond XL', amount: 3500, price: 'R$ 99,99', bonus: 500, badge: 'MEGA' as const },
]

const vipTiers: { tier: VipTier; name: string; price: string; benefits: { text: string; included: boolean }[] }[] = [
  {
    tier: 'bronze',
    name: 'Bronze',
    price: 'R$ 9,99/mês',
    benefits: [
      { text: '+20% bônus em moedas', included: true },
      { text: 'Recompensa diária bônus', included: true },
      { text: 'Badge VIP Bronze', included: true },
      { text: '2 avatar frames exclusivos', included: true },
      { text: 'Nome dourado no chat', included: false },
      { text: 'Matchmaking prioritário', included: false },
      { text: 'Acesso antecipado', included: false },
    ],
  },
  {
    tier: 'silver',
    name: 'Prata',
    price: 'R$ 19,99/mês',
    benefits: [
      { text: '+50% bônus em moedas', included: true },
      { text: 'Recompensa diária 2x', included: true },
      { text: 'Badge VIP Prata', included: true },
      { text: '5 avatar frames exclusivos', included: true },
      { text: 'Nome dourado no chat', included: true },
      { text: 'Matchmaking prioritário', included: false },
      { text: 'Acesso antecipado', included: false },
    ],
  },
  {
    tier: 'gold',
    name: 'Ouro',
    price: 'R$ 39,99/mês',
    benefits: [
      { text: '+100% bônus em moedas', included: true },
      { text: 'Recompensa diária 3x', included: true },
      { text: 'Badge VIP Ouro', included: true },
      { text: '10 avatar frames exclusivos', included: true },
      { text: 'Nome dourado no chat', included: true },
      { text: 'Matchmaking prioritário', included: true },
      { text: 'Acesso antecipado a modos', included: true },
    ],
  },
]

const specialItems = [
  { name: 'Pacote de Avatares', description: '10 novos avatares exclusivos', price: '500', priceType: 'diamonds' as const },
  { name: 'Tema Mesa Verde Escuro', description: 'Tema premium para mesa de jogo', price: '200', priceType: 'diamonds' as const },
  { name: 'Baralho Dourado', description: 'Design dourado para as cartas', price: '300', priceType: 'diamonds' as const },
  { name: 'Pacote de Fichas Premium', description: 'Fichas de poker customizadas', price: '250', priceType: 'diamonds' as const },
  { name: 'Dobra de XP (24h)', description: 'Ganhe 2x XP por 24 horas', price: '1000', priceType: 'coins' as const },
]

// Countdown timer component
function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 45 })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev
        seconds--
        if (seconds < 0) {
          seconds = 59
          minutes--
        }
        if (minutes < 0) {
          minutes = 59
          hours--
        }
        if (hours < 0) {
          hours = 23
          minutes = 59
          seconds = 59
        }
        return { hours, minutes, seconds }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const isUrgent = timeLeft.hours < 1

  return (
    <div className={`flex items-center gap-1 font-mono text-lg ${isUrgent ? 'text-[#DC2626]' : 'text-[#F0F0F5]'}`}>
      <Clock size={18} className={isUrgent ? 'text-[#DC2626]' : 'text-[#8B95B8]'} />
      <span>
        {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
      </span>
    </div>
  )
}

export default function Store() {
  const [activeTab, setActiveTab] = useState<StoreTab>('coins')
  const [purchaseModal, setPurchaseModal] = useState<{
    open: boolean
    type: 'coins' | 'diamonds' | 'vip'
    itemName: string
    amount: number
    price: string
    diamondBonus?: number
  } | null>(null)
  const [showHistory, setShowHistory] = useState(false)

  const { player, purchaseHistory } = useGameStore()

  const handlePurchase = useCallback(
    (type: 'coins' | 'diamonds' | 'vip', itemName: string, amount: number, price: string, diamondBonus?: number) => {
      setPurchaseModal({ open: true, type, itemName, amount, price, diamondBonus })
    },
    []
  )

  return (
    <div className="min-h-[100dvh]" style={{ background: 'var(--bg-dark)' }}>
      {/* Header */}
      <div
        className="relative w-full pt-10 pb-16 px-4"
        style={{
          minHeight: 200,
          background: 'linear-gradient(180deg, rgba(10,14,26,0.3) 0%, rgba(10,14,26,0.95) 100%), radial-gradient(ellipse at center, #1A5C42 0%, #0B3D2E 60%, #072A1F 100%)',
        }}
      >
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center text-3xl md:text-4xl font-bold text-[#D4A830] mb-6"
          style={{ fontFamily: 'Cinzel, Georgia, serif', textShadow: '0 2px 20px rgba(212,168,48,0.4)' }}
        >
          LOJA
        </motion.h1>

        {/* Balances */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex justify-center gap-8 mb-8"
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #D4A830 0%, #F0C94A 100%)' }}>
              <Coins size={14} className="text-[#0A0E1A]" />
            </div>
            <span className="text-xl font-bold font-mono text-[#D4A830]">{player.coins.toLocaleString('pt-BR')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #2563EB 0%, #60A5FA 100%)' }}>
              <Diamond size={14} className="text-white" />
            </div>
            <span className="text-xl font-bold font-mono text-blue-400">{player.diamonds.toLocaleString('pt-BR')}</span>
          </div>
        </motion.div>

        {/* History link */}
        <div className="absolute top-4 right-4">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-1.5 text-xs text-[#8B95B8] hover:text-[#D4A830] transition-colors"
          >
            <ShoppingBag size={14} />
            <span>Histórico</span>
          </button>
        </div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex justify-center gap-2 flex-wrap"
        >
          {tabs.map((tab, i) => (
            <motion.button
              key={tab.value}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.06 }}
              onClick={() => setActiveTab(tab.value)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeTab === tab.value
                  ? 'text-[#0A0E1A]'
                  : 'text-[#8B95B8] hover:text-[#F0F0F5]'
              }`}
              style={
                activeTab === tab.value
                  ? { background: 'linear-gradient(135deg, #D4A830 0%, #F0C94A 50%, #D4A830 100%)' }
                  : { background: 'rgba(20,27,45,0.8)', border: '1px solid #2A3655' }
              }
            >
              {tab.label}
            </motion.button>
          ))}
        </motion.div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Coins Tab */}
        <AnimatePresence mode="wait">
          {activeTab === 'coins' && (
            <motion.div
              key="coins"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {coinPackages.map((pkg, i) => (
                <CoinPackageCard
                  key={pkg.name}
                  {...pkg}
                  index={i}
                  onPurchase={() => handlePurchase('coins', pkg.name, pkg.amount, pkg.price, pkg.diamondBonus)}
                />
              ))}
            </motion.div>
          )}

          {/* Diamonds Tab */}
          {activeTab === 'diamonds' && (
            <motion.div
              key="diamonds"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
              style={{ background: 'rgba(37,99,235,0.03)' }}
            >
              {diamondPackages.map((pkg, i) => (
                <DiamondPackageCard
                  key={pkg.name}
                  {...pkg}
                  index={i}
                  onPurchase={() => handlePurchase('diamonds', pkg.name, pkg.amount, pkg.price)}
                />
              ))}
            </motion.div>
          )}

          {/* VIP Tab */}
          {activeTab === 'vip' && (
            <motion.div
              key="vip"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* VIP Banner */}
              <div
                className="w-full h-[120px] rounded-xl mb-8 flex items-center justify-center gap-3"
                style={{
                  background: 'linear-gradient(135deg, #1E2945 0%, #141B2D 100%)',
                  border: '1px solid #2A3655',
                }}
              >
                <Crown size={32} className="text-[#D4A830]" />
                <div>
                  <h2 className="text-xl font-bold text-[#D4A830]" style={{ fontFamily: 'Cinzel, Georgia, serif' }}>VIP</h2>
                  <p className="text-sm text-[#8B95B8]">Benefícios exclusivos para assinantes</p>
                </div>
              </div>

              {/* VIP Cards */}
              <div className="flex flex-col md:flex-row justify-center gap-6 items-stretch">
                {vipTiers.map((vip, i) => (
                  <VIPCard
                    key={vip.tier}
                    {...vip}
                    isCurrentTier={player.vipTier === vip.tier}
                    onSubscribe={() => handlePurchase('vip', `VIP ${vip.name}`, 0, vip.price)}
                    index={i}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Specials Tab */}
          {activeTab === 'specials' && (
            <motion.div
              key="specials"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Daily Deal Banner */}
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="relative w-full rounded-2xl p-6 mb-8 border-2 border-[#D4A830] overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #1E2945 0%, #141B2D 100%)',
                  boxShadow: '0 0 20px rgba(212,168,48,0.2)',
                }}
              >
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Gift size={20} className="text-[#D4A830]" />
                      <span className="text-xs font-bold text-[#DC2626] bg-[#DC2626]/10 px-2 py-0.5 rounded-full">
                        OFERTA DO DIA
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-[#F0F0F5] mb-1">Pacote Iniciante Deluxe</h3>
                    <p className="text-sm text-[#8B95B8] mb-2">50.000 Moedas + 100 Diamantes</p>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-[#8B95B8] line-through">R$ 29,99</span>
                      <span className="text-2xl font-bold text-[#D4A830]">R$ 14,99</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <CountdownTimer />
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handlePurchase('coins', 'Pacote Iniciante Deluxe', 50000, 'R$ 14,99', 100)}
                      className="px-6 py-2.5 rounded-lg font-semibold text-sm"
                      style={{
                        background: 'linear-gradient(135deg, #D4A830 0%, #F0C94A 50%, #D4A830 100%)',
                        color: '#0A0E1A',
                      }}
                    >
                      Ver oferta
                    </motion.button>
                  </div>
                </div>
              </motion.div>

              {/* Special Items Grid */}
              <h3 className="text-lg font-semibold text-[#F0F0F5] mb-4">Itens Especiais</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {specialItems.map((item, i) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08, duration: 0.3 }}
                    className="p-4 rounded-xl border border-[#2A3655]"
                    style={{ background: '#141B2D' }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#0A0E1A' }}>
                        <Gift size={20} className="text-[#D4A830]" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-[#F0F0F5]">{item.name}</h4>
                        <p className="text-xs text-[#8B95B8]">{item.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1">
                        {item.priceType === 'coins' ? (
                          <>
                            <Coins size={14} className="text-[#D4A830]" />
                            <span className="text-sm font-medium text-[#D4A830] font-mono">{item.price}</span>
                          </>
                        ) : (
                          <>
                            <Diamond size={14} className="text-blue-400" />
                            <span className="text-sm font-medium text-blue-400 font-mono">{item.price}</span>
                          </>
                        )}
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-1.5 rounded-lg text-xs font-semibold"
                        style={{
                          background: 'linear-gradient(135deg, #D4A830 0%, #F0C94A 100%)',
                          color: '#0A0E1A',
                        }}
                      >
                        Comprar
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Purchase History */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-8 overflow-hidden"
            >
              <h3 className="text-lg font-semibold text-[#D4A830] mb-4" style={{ fontFamily: 'Cinzel, Georgia, serif' }}>
                Histórico de Compras
              </h3>
              <div className="rounded-xl border border-[#2A3655] overflow-hidden" style={{ background: '#141B2D' }}>
                <div className="grid grid-cols-4 gap-2 p-3 text-xs text-[#8B95B8] uppercase border-b border-[#2A3655]" style={{ background: '#0A0E1A' }}>
                  <span>Data</span>
                  <span>Item</span>
                  <span>Valor</span>
                  <span>Status</span>
                </div>
                {purchaseHistory.length === 0 ? (
                  <div className="p-6 text-center text-sm text-[#8B95B8]">
                    Nenhuma compra realizada ainda.
                  </div>
                ) : (
                  purchaseHistory.slice(0, 10).map((purchase, i) => (
                    <motion.div
                      key={purchase.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="grid grid-cols-4 gap-2 p-3 text-sm border-b border-[#2A3655]/50 items-center"
                    >
                      <span className="text-[#8B95B8] text-xs">
                        {new Date(purchase.date).toLocaleDateString('pt-BR')}
                      </span>
                      <span className="text-[#F0F0F5] text-xs truncate">{purchase.itemName}</span>
                      <span className="text-[#F0F0F5] font-mono text-xs">{purchase.price}</span>
                      <span className={`text-xs font-medium ${
                        purchase.status === 'completed' ? 'text-emerald-400' :
                        purchase.status === 'processing' ? 'text-[#D4A830]' : 'text-[#DC2626]'
                      }`}>
                        {purchase.status === 'completed' ? 'Concluído' :
                         purchase.status === 'processing' ? 'Processando' : 'Cancelado'}
                      </span>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Purchase Modal */}
      {purchaseModal?.open && (
        <PurchaseModal
          isOpen={purchaseModal.open}
          onClose={() => setPurchaseModal(null)}
          type={purchaseModal.type}
          itemName={purchaseModal.itemName}
          amount={purchaseModal.amount}
          price={purchaseModal.price}
          diamondBonus={purchaseModal.diamondBonus}
        />
      )}
    </div>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, LogIn } from 'lucide-react'
import { useGameStore } from '@/store/gameStore'
import { formatCoins, formatDiamonds } from '@/lib/gameUtils'

export default function Navbar() {
  const navigate = useNavigate()
  const { player, isLoggedIn, isGuest } = useGameStore()
  const [showDropdown, setShowDropdown] = useState(false)

  const isAuth = isLoggedIn || isGuest

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-border-subtle"
      style={{
        background: 'rgba(10,14,26,0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}>
      <div className="flex items-center justify-between h-full px-4 max-w-7xl mx-auto">
        {/* Left: Logo */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <img src="/logo-gold.png" alt="TPA" className="h-8 w-auto" />
          <span className="hidden sm:block font-display text-gold text-sm font-bold tracking-wider">
            TRUCO POKER ARENA
          </span>
        </button>

        {/* Center: Balances */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full"
            style={{ background: 'rgba(212,168,48,0.1)', border: '1px solid rgba(212,168,48,0.2)' }}>
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center">
              <span className="text-[8px] font-bold text-bg-dark">C</span>
            </div>
            <span className="font-mono-game text-sm font-bold text-gold">{formatCoins(player.coins)}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full"
            style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)' }}>
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-team-blue to-blue-700 flex items-center justify-center">
              <span className="text-[8px] font-bold text-white">D</span>
            </div>
            <span className="font-mono-game text-sm font-bold text-blue-400">{formatDiamonds(player.diamonds)}</span>
          </div>
        </div>

        {/* Right: Profile / Login */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/settings')}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-text-secondary hover:text-gold hover:bg-white/5 transition-colors"
          >
            <Settings size={18} />
          </button>

          {isAuth ? (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/5 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center text-bg-dark font-bold text-xs border-2 border-gold/50">
                  {player.username.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:block text-sm font-medium text-text-primary max-w-[80px] truncate">
                  {player.username}
                </span>
              </button>

              <AnimatePresence>
                {showDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-12 w-48 rounded-lg border border-border-subtle shadow-xl-game overflow-hidden"
                    style={{ background: 'var(--bg-elevated)' }}
                  >
                    <button
                      onClick={() => { navigate('/profile'); setShowDropdown(false) }}
                      className="w-full px-4 py-2.5 text-left text-sm text-text-primary hover:bg-white/5 transition-colors"
                    >
                      Perfil
                    </button>
                    <button
                      onClick={() => { navigate('/settings'); setShowDropdown(false) }}
                      className="w-full px-4 py-2.5 text-left text-sm text-text-primary hover:bg-white/5 transition-colors"
                    >
                      Configuracoes
                    </button>
                    <hr className="border-border-subtle my-1" />
                    <button
                      onClick={() => {
                        useGameStore.getState().logout()
                        setShowDropdown(false)
                        navigate('/')
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-ruby hover:bg-white/5 transition-colors"
                    >
                      Sair
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button
              onClick={() => navigate('/auth')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-bg-dark bg-gradient-to-r from-gold to-gold-light hover:from-gold-light hover:to-gold transition-all"
            >
              <LogIn size={14} />
              <span className="hidden sm:inline">Entrar</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}

import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, Gamepad2, ShoppingBag, Trophy, User } from 'lucide-react'

const navItems = [
  { icon: Home, label: 'Inicio', path: '/' },
  { icon: Gamepad2, label: 'Jogar', path: '/lobby' },
  { icon: ShoppingBag, label: 'Loja', path: '/store' },
  { icon: Trophy, label: 'Ranking', path: '/leaderboard' },
  { icon: User, label: 'Perfil', path: '/profile' },
]

export default function Footer() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <footer
      className="fixed bottom-0 left-0 right-0 z-50 pb-safe"
      style={{
        background: 'rgba(10,14,26,0.95)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(212,168,48,0.3)',
        height: 'calc(64px + env(safe-area-inset-bottom, 0px))',
      }}
    >
      <nav className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          const Icon = item.icon

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="relative flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-colors"
            >
              {isActive && (
                <motion.div
                  layoutId="footer-active"
                  className="absolute inset-0 rounded-xl"
                  style={{ background: 'rgba(212,168,48,0.1)' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <Icon
                size={22}
                className={`transition-colors ${isActive ? 'text-gold' : 'text-text-secondary'}`}
                style={isActive ? { filter: 'drop-shadow(0 0 4px rgba(212,168,48,0.4))' } : undefined}
              />
              <span
                className={`text-[10px] mt-0.5 font-medium transition-colors ${isActive ? 'text-gold' : 'text-text-secondary'}`}
              >
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="footer-indicator"
                  className="absolute -bottom-0.5 w-6 h-0.5 rounded-full bg-gold"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          )
        })}
      </nav>
    </footer>
  )
}

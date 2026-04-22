import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import { useGameStore } from '@/store/gameStore'

interface LayoutProps {
  children: ReactNode
}

// Routes where footer should be hidden
const noFooterRoutes = ['/truco', '/poker', '/multiplayer']
// Routes where navbar should be hidden
const noNavbarRoutes = ['/truco', '/poker', '/multiplayer']

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const { isLoggedIn, dailyReward } = useGameStore()

  const showFooter = !noFooterRoutes.some(route => location.pathname.startsWith(route))
  const showNavbar = !noNavbarRoutes.some(route => location.pathname.startsWith(route))

  // Check daily reward on mount
  useEffect(() => {
    if (!isLoggedIn) return
    const lastClaimed = dailyReward.lastClaimed
    if (!lastClaimed) {
      useGameStore.setState({ showDailyReward: true })
      return
    }
    const lastDate = new Date(lastClaimed).setHours(0, 0, 0, 0)
    const today = new Date().setHours(0, 0, 0, 0)
    if (today > lastDate) {
      useGameStore.setState({ showDailyReward: true })
    }
  }, [isLoggedIn, dailyReward.lastClaimed])

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <div className="min-h-[100dvh] flex flex-col" style={{ background: 'var(--bg-dark)' }}>
      {showNavbar && <Navbar />}

      <main
        className={`flex-1 ${showNavbar ? 'pt-14' : ''} ${showFooter ? 'pb-20' : ''}`}
      >
        {children}
      </main>

      {showFooter && <Footer />}
    </div>
  )
}

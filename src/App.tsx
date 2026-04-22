import { HashRouter, Routes, Route } from 'react-router-dom'

import Layout from '@/components/Layout'
import Home from '@/pages/Home'
import Lobby from '@/pages/Lobby'
import Auth from '@/pages/Auth'
import Settings from '@/pages/Settings'
import Tutorial from '@/pages/Tutorial'
import Multiplayer from '@/pages/Multiplayer'
import Store from '@/pages/Store'
import Profile from '@/pages/Profile'
import Leaderboard from '@/pages/Leaderboard'
import PokerGame from '@/pages/PokerGame'
import TrucoGame from '@/pages/TrucoGame'

export default function App() {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/lobby" element={<Lobby />} />
          <Route path="/truco" element={<TrucoGame />} />
          <Route path="/poker" element={<PokerGame />} />
          <Route path="/store" element={<Store />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/tutorial" element={<Tutorial />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/multiplayer" element={<Multiplayer />} />
        </Routes>
      </Layout>
    </HashRouter>
  )
}

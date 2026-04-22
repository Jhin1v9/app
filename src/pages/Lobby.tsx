import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import type { GameMode, Difficulty } from '@/store/gameStore'
import {
  ArrowLeft,
  Users,
  Clock,
  Bot,
  Plus,
  DoorOpen,
  Globe,
  Play,
  RefreshCw,
  X,
  ChevronRight,
  Lock,
  Unlock,
  Search,
  Zap,
  Heart,
  Spade,
  Diamond,
  Club,
  Check,
  
  
} from 'lucide-react'

// ===== Types =====
interface Room {
  id: string
  name: string
  mode: string
  players: number
  maxPlayers: number
  bet: string
  status: 'waiting' | 'playing'
  host: string
}

interface ModeConfig {
  id: GameMode
  title: string
  description: string
  badge: string
  badgeColor: string
  borderColor: string
  tintColor: string
  icon: React.ReactNode
  players: string
  time: string
  featured?: boolean
}

// ===== Data =====
const GAME_MODES: ModeConfig[] = [
  {
    id: 'truco-mineiro',
    title: 'Truco Mineiro',
    description: 'Manilhas fixas: Zap, Copeta, Espadilha, Pica-Fumo. Jogo rapido e emocionante!',
    badge: 'MODO PRINCIPAL',
    badgeColor: 'bg-emerald-600',
    borderColor: 'border-emerald-500/40 hover:border-emerald-500',
    tintColor: 'from-emerald-500/10',
    icon: <Club className="w-6 h-6" />,
    players: '4 jogadores',
    time: '~10 min',
    featured: true,
  },
  {
    id: 'truco-paulista',
    title: 'Truco Paulista',
    description: 'Manilhas variaveis baseadas no vira. Estrategia dinamica!',
    badge: 'CLASSICO',
    badgeColor: 'bg-ruby',
    borderColor: 'border-ruby/40 hover:border-ruby',
    tintColor: 'from-red-500/10',
    icon: <Heart className="w-6 h-6" />,
    players: '4 jogadores',
    time: '~12 min',
  },
  {
    id: 'poker',
    title: 'Poker Texas Hold\'em',
    description: 'O poker mais famoso do mundo. Cash game e torneios!',
    badge: 'POKER',
    badgeColor: 'bg-gold',
    borderColor: 'border-gold/40 hover:border-gold',
    tintColor: 'from-yellow-500/10',
    icon: <Spade className="w-6 h-6" />,
    players: '2-9 jogadores',
    time: '~20 min',
  },
]

const INITIAL_ROOMS: Room[] = [
  { id: '1', name: 'Sala do Joao', mode: 'Mineiro', players: 3, maxPlayers: 4, bet: '1K', status: 'waiting', host: 'Joao' },
  { id: '2', name: 'Poker High Stakes', mode: 'Hold\'em', players: 5, maxPlayers: 6, bet: '10K', status: 'playing', host: 'Maria' },
  { id: '3', name: 'Truco Classico', mode: 'Paulista', players: 2, maxPlayers: 4, bet: '500', status: 'waiting', host: 'Pedro' },
  { id: '4', name: 'Noite de Poker', mode: 'Hold\'em', players: 4, maxPlayers: 6, bet: '5K', status: 'waiting', host: 'Ana' },
  { id: '5', name: 'Mineiro Turbo', mode: 'Mineiro', players: 1, maxPlayers: 4, bet: 'Free', status: 'waiting', host: 'Carlos' },
  { id: '6', name: 'Truco da Galera', mode: 'Mineiro', players: 4, maxPlayers: 4, bet: '2K', status: 'playing', host: 'Lucas' },
]

const DIFFICULTIES: { id: Difficulty; label: string; desc: string; color: string; borderColor: string }[] = [
  { id: 'easy', label: 'Facil', desc: 'Bot joga cartas aleatoriamente. Perfeito para aprender.', color: 'text-emerald-400', borderColor: 'border-l-emerald-500' },
  { id: 'medium', label: 'Medio', desc: 'Bot usa estrategia basica.', color: 'text-yellow-400', borderColor: 'border-l-yellow-500' },
  { id: 'hard', label: 'Dificil', desc: 'Bot calcula probabilidades e blefa.', color: 'text-orange-400', borderColor: 'border-l-orange-500' },
  { id: 'expert', label: 'Expert', desc: 'Bot usa estrategia otima. Desafio maximo!', color: 'text-ruby', borderColor: 'border-l-ruby' },
]

// ===== Sub-components =====

function ModeCard({ mode, index, onSelect }: { mode: ModeConfig; index: number; onSelect: () => void }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const rotateX = useTransform(mouseY, [-200, 200], [8, -8])
  const rotateY = useTransform(mouseX, [-200, 200], [-8, 8])

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    mouseX.set(e.clientX - centerX)
    mouseY.set(e.clientY - centerY)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
  }

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onSelect}
      style={{ perspective: 800, rotateX: mode.featured ? rotateX : 0, rotateY: mode.featured ? rotateY : 0 }}
      className={`relative flex-shrink-0 w-[320px] md:w-[380px] h-[420px] md:h-[480px] rounded-xl-game overflow-hidden cursor-pointer select-none
        bg-gradient-to-b ${mode.tintColor} to-bg-card
        border-2 ${mode.borderColor} transition-colors duration-300
        shadow-md-game hover:shadow-lg-game`}
    >
      {/* Badge */}
      <div className={`absolute top-4 right-0 ${mode.badgeColor} text-white text-xs font-bold px-3 py-1 rounded-l-sm z-10`}>
        {mode.badge}
      </div>

      {/* Illustration area */}
      <div className="h-[55%] relative flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 30% 40%, rgba(212,168,48,0.3) 0%, transparent 50%)' }} />
        </div>
        {/* Felt pattern background */}
        <div className="w-32 h-32 rounded-full bg-felt-green/30 border-2 border-gold/30 flex items-center justify-center">
          <div className="text-gold/60">{mode.icon}</div>
        </div>
        {/* Decorative cards */}
        <motion.div
          animate={mode.featured ? { scale: [1, 1.02, 1] } : {}}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-1"
        >
          <MiniCard suit="clubs" rank="4" rotate={-12} />
          <MiniCard suit="hearts" rank="7" rotate={-6} />
          <MiniCard suit="spades" rank="A" rotate={6} />
          <MiniCard suit="diamonds" rank="7" rotate={12} />
        </motion.div>
      </div>

      {/* Info area */}
      <div className="h-[45%] px-6 pb-6 flex flex-col justify-between">
        <div>
          <h3 className="font-display text-xl md:text-2xl font-bold text-text-primary mb-2">{mode.title}</h3>
          <p className="text-text-secondary text-sm leading-relaxed mb-3">{mode.description}</p>
          <div className="flex gap-4 text-text-secondary text-xs">
            <span className="flex items-center gap-1"><Users className="w-3 h-3" />{mode.players}</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{mode.time}</span>
          </div>
        </div>
        <button className="btn-gold w-full mt-4">
          <Play className="w-4 h-4" /> JOGAR
        </button>
      </div>
    </motion.div>
  )
}

function MiniCard({ suit, rank, rotate }: { suit: string; rank: string; rotate: number }) {
  const suitIcon = suit === 'clubs' ? <Club className="w-3 h-3" /> : suit === 'hearts' ? <Heart className="w-3 h-3 text-ruby" /> : suit === 'spades' ? <Spade className="w-3 h-3" /> : <Diamond className="w-3 h-3 text-ruby" />
  return (
    <div className="w-10 h-14 bg-white rounded-sm shadow-card flex flex-col items-center justify-center" style={{ transform: `rotate(${rotate}deg)` }}>
      <span className={`text-xs font-bold ${suit === 'hearts' || suit === 'diamonds' ? 'text-ruby' : 'text-suit-clubs'}`}>{rank}</span>
      {suitIcon}
    </div>
  )
}

function GameModeSelector({ mode, onBack, onPlayBots, onQuickMatch, onCreateRoom }: {
  mode: ModeConfig
  onBack: () => void
  onPlayBots: () => void
  onQuickMatch: () => void
  onCreateRoom: () => void
}) {
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      className="w-full max-w-2xl mx-auto game-panel p-6 md:p-8"
    >
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-bg-card hover:bg-bg-card-hover flex items-center justify-center transition-colors">
          <ArrowLeft className="w-5 h-5 text-text-secondary" />
        </button>
        <div>
          <h3 className="font-display text-xl font-bold text-text-primary">{mode.title}</h3>
          <p className="text-text-secondary text-sm">Escolha como jogar</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={onPlayBots}
          className="btn-dark flex flex-col items-start p-6 h-auto text-left gap-2"
        >
          <Bot className="w-8 h-8 text-text-secondary mb-1" />
          <span className="font-semibold text-text-primary">vs Bots</span>
          <span className="text-text-secondary text-xs">Pratique contra IA</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={onQuickMatch}
          className="btn-dark flex flex-col items-start p-6 h-auto text-left gap-2"
        >
          <Globe className="w-8 h-8 text-emerald-400 mb-1" />
          <span className="font-semibold text-text-primary">Partida Rapida</span>
          <span className="text-text-secondary text-xs">Partida ranqueada online</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={onCreateRoom}
          className="btn-dark flex flex-col items-start p-6 h-auto text-left gap-2"
        >
          <Plus className="w-8 h-8 text-gold mb-1" />
          <span className="font-semibold text-text-primary">Criar Sala Privada</span>
          <span className="text-text-secondary text-xs">Jogue com amigos</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/multiplayer')}
          className="btn-dark flex flex-col items-start p-6 h-auto text-left gap-2"
        >
          <DoorOpen className="w-8 h-8 text-team-blue mb-1" />
          <span className="font-semibold text-text-primary">Entrar em Sala</span>
          <span className="text-text-secondary text-xs">Entre com codigo</span>
        </motion.button>
      </div>
    </motion.div>
  )
}

function DifficultySelector({ onSelect, onBack }: { onSelect: (d: Difficulty) => void; onBack: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      className="w-full max-w-md mx-auto game-panel p-6 md:p-8"
    >
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-bg-card hover:bg-bg-card-hover flex items-center justify-center transition-colors">
          <ArrowLeft className="w-5 h-5 text-text-secondary" />
        </button>
        <h3 className="font-display text-xl font-bold text-text-primary">Escolha a Dificuldade</h3>
      </div>

      <div className="space-y-3">
        {DIFFICULTIES.map((d, i) => (
          <motion.button
            key={d.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08, duration: 0.3 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(d.id)}
            className={`w-full text-left bg-bg-card border border-border-subtle hover:border-gold/50 rounded-md-game p-4 border-l-4 ${d.borderColor} transition-all`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className={`font-semibold ${d.color}`}>{d.label}</h4>
                <p className="text-text-secondary text-xs mt-1">{d.desc}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-text-secondary" />
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}

function CreateRoomModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [selectedMode, setSelectedMode] = useState<GameMode>('truco-mineiro')
  const [roomName, setRoomName] = useState('')
  const [maxPlayers, setMaxPlayers] = useState(4)
  const [betAmount, setBetAmount] = useState('1K')
  const [isPrivate, setIsPrivate] = useState(false)
  const player = useGameStore((s) => s.player)

  const bets = ['Free', '100', '500', '1K', '5K', '10K']

  const handleCreate = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    alert(`Sala criada! Codigo: ${code}`)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(10,14,26,0.85)', backdropFilter: 'blur(4px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[480px] rounded-xl-game p-6 md:p-8"
            style={{ background: 'linear-gradient(180deg, #1E2945 0%, #141B2D 100%)', border: '1px solid #2A3655' }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-2xl font-bold text-text-primary">Criar Nova Sala</h3>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-bg-card hover:bg-bg-card-hover flex items-center justify-center">
                <X className="w-4 h-4 text-text-secondary" />
              </button>
            </div>

            {/* Room Name */}
            <div className="mb-4">
              <label className="text-text-secondary text-sm mb-1 block">Nome da Sala</label>
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder={`${player.username}'s Room`}
                className="w-full h-12 bg-bg-card border border-border-subtle rounded-md-game px-4 text-text-primary placeholder:text-text-secondary/50 focus:border-gold focus:outline-none transition-colors"
              />
            </div>

            {/* Mode Selector */}
            <div className="mb-4">
              <label className="text-text-secondary text-sm mb-2 block">Modo de Jogo</label>
              <div className="grid grid-cols-3 gap-2">
                {GAME_MODES.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => { setSelectedMode(m.id); if (m.id !== 'poker') setMaxPlayers(4) }}
                    className={`p-3 rounded-md-game border text-center transition-all ${selectedMode === m.id ? 'border-gold bg-gold/10 text-gold' : 'border-border-subtle text-text-secondary hover:border-gold/50'}`}
                  >
                    <div className="text-2xl mb-1">{m.icon}</div>
                    <span className="text-xs font-medium">{m.title.split(' ')[1] || m.title.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Max Players */}
            <div className="mb-4">
              <label className="text-text-secondary text-sm mb-2 block">Max Jogadores: {maxPlayers}</label>
              <input
                type="range"
                min={selectedMode === 'poker' ? 2 : 4}
                max={selectedMode === 'poker' ? 9 : 4}
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(Number(e.target.value))}
                className="w-full accent-gold"
              />
              <div className="flex justify-between text-text-secondary text-xs mt-1">
                <span>{selectedMode === 'poker' ? 2 : 4}</span>
                <span>{selectedMode === 'poker' ? 9 : 4}</span>
              </div>
            </div>

            {/* Bet Amount */}
            <div className="mb-4">
              <label className="text-text-secondary text-sm mb-2 block">Aposta</label>
              <div className="flex flex-wrap gap-2">
                {bets.map((b) => (
                  <button
                    key={b}
                    onClick={() => setBetAmount(b)}
                    className={`px-4 py-2 rounded-md-game text-sm font-medium transition-all ${betAmount === b ? 'bg-gold text-bg-dark' : 'bg-bg-card border border-border-subtle text-text-secondary hover:border-gold/50'}`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* Private Toggle */}
            <div className="mb-6 flex items-center justify-between">
              <span className="text-text-secondary text-sm flex items-center gap-2">
                {isPrivate ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                Sala privada (com senha)
              </span>
              <button
                onClick={() => setIsPrivate(!isPrivate)}
                className={`w-12 h-6 rounded-full transition-colors ${isPrivate ? 'bg-gold' : 'bg-border-subtle'}`}
              >
                <motion.div
                  animate={{ x: isPrivate ? 24 : 2 }}
                  className="w-5 h-5 rounded-full bg-white shadow"
                />
              </button>
            </div>

            {isPrivate && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-4">
                <input
                  type="password"
                  placeholder="Senha da sala"
                  className="w-full h-12 bg-bg-card border border-border-subtle rounded-md-game px-4 text-text-primary placeholder:text-text-secondary/50 focus:border-gold focus:outline-none"
                />
              </motion.div>
            )}

            <button onClick={handleCreate} className="btn-gold w-full">
              <Plus className="w-4 h-4" /> Criar Sala
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function JoinRoomModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [code, setCode] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  const handleJoin = () => {
    if (code.length === 6) {
      alert(`Entrando na sala: ${code.toUpperCase()}`)
      onClose()
      setCode('')
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(10,14,26,0.85)', backdropFilter: 'blur(4px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[400px] rounded-xl-game p-6 md:p-8"
            style={{ background: 'linear-gradient(180deg, #1E2945 0%, #141B2D 100%)', border: '1px solid #2A3655' }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-2xl font-bold text-text-primary">Entrar na Sala</h3>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-bg-card hover:bg-bg-card-hover flex items-center justify-center">
                <X className="w-4 h-4 text-text-secondary" />
              </button>
            </div>

            <div className="mb-6">
              <label className="text-text-secondary text-sm mb-3 block">Codigo da Sala (6 caracteres)</label>
              <input
                ref={inputRef}
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
                placeholder="ABC123"
                className="w-full h-14 bg-bg-card border-2 border-border-subtle rounded-md-game px-4 text-text-primary text-center text-2xl font-mono tracking-[8px] placeholder:tracking-normal placeholder:text-text-secondary/30 focus:border-gold focus:outline-none transition-colors"
              />
            </div>

            <button
              onClick={handleJoin}
              disabled={code.length !== 6}
              className="btn-gold w-full disabled:opacity-40 disabled:grayscale"
            >
              <DoorOpen className="w-4 h-4" /> Entrar
            </button>

            <p className="text-center text-text-secondary text-sm mt-4">
              Ou <button onClick={() => { onClose(); window.location.hash = '/multiplayer' }} className="text-gold hover:underline">entre em uma sala publica</button>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function MatchmakingOverlay({ isOpen, onCancel, mode }: { isOpen: boolean; onCancel: () => void; mode: string }) {
  const [playersFound, setPlayersFound] = useState(1)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!isOpen) { setPlayersFound(1); setElapsed(0); return }
    const timer = setInterval(() => setElapsed((e) => e + 1), 1000)
    const playerTimer = setInterval(() => {
      setPlayersFound((p) => {
        if (p >= 4) return 4
        return p + 1
      })
    }, 1500)
    return () => { clearInterval(timer); clearInterval(playerTimer) }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(10,14,26,0.95)' }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center"
          >
            {/* Spinner */}
            <div className="relative w-24 h-24 mx-auto mb-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-full border-4 border-transparent border-t-gold border-r-gold/30"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Search className="w-8 h-8 text-gold" />
              </div>
            </div>

            <h3 className="font-display text-2xl font-bold text-text-primary mb-2">Procurando oponentes...</h3>
            <p className="text-text-secondary mb-6">Modo: {mode}</p>

            {/* Player slots */}
            <div className="flex justify-center gap-3 mb-6">
              {[1, 2, 3, 4].map((slot) => (
                <motion.div
                  key={slot}
                  initial={false}
                  animate={{
                    scale: playersFound >= slot ? 1 : 0.9,
                    opacity: playersFound >= slot ? 1 : 0.4,
                  }}
                  className={`w-14 h-14 rounded-full flex items-center justify-center border-2 ${playersFound >= slot ? 'border-gold bg-gold/20' : 'border-border-subtle bg-bg-card'}`}
                >
                  {playersFound >= slot ? (
                    <Check className="w-6 h-6 text-gold" />
                  ) : (
                    <Users className="w-5 h-5 text-text-secondary" />
                  )}
                </motion.div>
              ))}
            </div>

            <p className="text-text-secondary text-sm mb-2">{playersFound}/4 jogadores encontrados</p>
            <p className="text-text-secondary text-xs mb-6">Tempo: {elapsed}s</p>

            <button onClick={onCancel} className="btn-dark">Cancelar</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ===== Main Component =====

export default function Lobby() {
  const navigate = useNavigate()
  const player = useGameStore((s) => s.player)
  const [selectedMode, setSelectedMode] = useState<ModeConfig | null>(null)
  const [showDifficulty, setShowDifficulty] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [matchmakingMode, setMatchmakingMode] = useState<string | null>(null)
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS)
  const [filter, setFilter] = useState<'all' | 'truco' | 'poker'>('all')

  const filteredRooms = rooms.filter((r) => {
    if (filter === 'truco') return r.mode === 'Mineiro' || r.mode === 'Paulista'
    if (filter === 'poker') return r.mode === 'Hold\'em'
    return true
  })

  const handlePlayBots = () => {
    if (selectedMode) {
      setShowDifficulty(true)
    }
  }

  const handleDifficultySelect = (_difficulty: Difficulty) => {
    if (selectedMode) {
      navigate(`/${selectedMode.id === 'poker' ? 'poker' : 'truco'}`)
    }
  }

  const handleQuickMatch = () => {
    if (selectedMode) {
      setMatchmakingMode(selectedMode.title)
    }
  }

  const refreshRooms = () => {
    setRooms((prev) => prev.map((r) => ({ ...r, players: Math.min(r.players + (Math.random() > 0.5 ? 1 : 0), r.maxPlayers) })))
  }

  return (
    <div className="min-h-[100dvh] bg-bg-dark pb-20">
      {/* Header */}
      <div className="h-[100px] md:h-[120px] game-panel border-b border-border-subtle flex items-center px-4 md:px-8 relative overflow-hidden">
        <div className="flex items-center gap-4 flex-1">
          <button onClick={() => navigate('/')} className="w-10 h-10 rounded-full bg-bg-card hover:bg-bg-card-hover flex items-center justify-center transition-colors">
            <ArrowLeft className="w-5 h-5 text-text-secondary" />
          </button>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="font-display text-2xl md:text-4xl font-bold text-gold"
          >
            SALA DE JOGOS
          </motion.h1>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center gap-4"
        >
          <div className="hidden md:flex items-center gap-2">
            <div className="flex items-center gap-1 text-gold">
              <Zap className="w-4 h-4" />
              <span className="font-mono-game text-sm font-semibold">{player.coins.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1 text-blue-400">
              <Diamond className="w-4 h-4" />
              <span className="font-mono-game text-sm font-semibold">{player.diamonds}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-felt-green border-2 border-gold/50 flex items-center justify-center text-gold font-bold text-sm">
              {player.username[0]?.toUpperCase() || '?'}
            </div>
            <span className="hidden md:block text-text-primary text-sm font-medium">{player.username}</span>
          </div>
        </motion.div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 md:py-8">
        <AnimatePresence mode="wait">
          {selectedMode ? (
            showDifficulty ? (
              <DifficultySelector
                key="difficulty"
                onSelect={handleDifficultySelect}
                onBack={() => setShowDifficulty(false)}
              />
            ) : (
              <GameModeSelector
                key="mode-selector"
                mode={selectedMode}
                onBack={() => setSelectedMode(null)}
                onPlayBots={handlePlayBots}
                onQuickMatch={handleQuickMatch}
                onCreateRoom={() => setShowCreateModal(true)}
              />
            )
          ) : (
            <motion.div
              key="lobby-main"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Mode Cards */}
              <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory mb-8">
                {GAME_MODES.map((mode, index) => (
                  <div key={mode.id} className="snap-center">
                    <ModeCard
                      mode={mode}
                      index={index}
                      onSelect={() => setSelectedMode(mode)}
                    />
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex gap-4 overflow-x-auto pb-4 mb-8"
              >
                {[
                  { icon: <Bot className="w-5 h-5" />, title: 'Jogar vs Bots', subtitle: 'Pratique contra IA', onClick: () => { setSelectedMode(GAME_MODES[0]); setShowDifficulty(true) } },
                  { icon: <Plus className="w-5 h-5" />, title: 'Criar Sala', subtitle: 'Jogue com amigos', onClick: () => setShowCreateModal(true) },
                  { icon: <DoorOpen className="w-5 h-5" />, title: 'Entrar na Sala', subtitle: 'Codigo da sala', onClick: () => setShowJoinModal(true) },
                  { icon: <Globe className="w-5 h-5 text-emerald-400" />, title: 'Online', subtitle: 'Partida ranqueada', onClick: () => { setSelectedMode(GAME_MODES[0]); handleQuickMatch() }, live: true },
                ].map((action, i) => (
                  <motion.button
                    key={action.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + i * 0.08 }}
                    whileHover={{ y: -4, borderColor: 'rgba(212,168,48,0.5)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={action.onClick}
                    className="btn-dark flex-shrink-0 flex flex-col items-start min-w-[160px] p-4 h-auto text-left"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {action.icon}
                      {action.live && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
                    </div>
                    <span className="font-semibold text-text-primary text-sm">{action.title}</span>
                    <span className="text-text-secondary text-xs">{action.subtitle}</span>
                  </motion.button>
                ))}
              </motion.div>

              {/* Active Rooms */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <h2 className="font-display text-xl font-bold text-text-primary">Salas Ativas</h2>
                    <div className="flex gap-1 bg-bg-card rounded-md-game p-1">
                      {(['all', 'truco', 'poker'] as const).map((f) => (
                        <button
                          key={f}
                          onClick={() => setFilter(f)}
                          className={`px-3 py-1 rounded-sm text-xs font-medium transition-all ${filter === f ? 'bg-gold text-bg-dark' : 'text-text-secondary hover:text-text-primary'}`}
                        >
                          {f === 'all' ? 'Todas' : f === 'truco' ? 'Truco' : 'Poker'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ rotate: 180 }}
                    transition={{ duration: 0.3 }}
                    onClick={refreshRooms}
                    className="w-8 h-8 rounded-full bg-bg-card hover:bg-bg-card-hover flex items-center justify-center"
                  >
                    <RefreshCw className="w-4 h-4 text-text-secondary" />
                  </motion.button>
                </div>

                <div className="space-y-2">
                  {filteredRooms.map((room, i) => (
                    <motion.div
                      key={room.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * i }}
                      whileHover={{ backgroundColor: 'rgba(28, 37, 64, 0.8)', borderColor: 'rgba(212,168,48,0.3)' }}
                      className="flex items-center gap-3 md:gap-4 bg-bg-card border border-border-subtle rounded-md-game px-4 py-3 transition-colors"
                    >
                      <div className="text-text-secondary">
                        {room.mode === 'Hold\'em' ? <Spade className="w-5 h-5" /> : <Club className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-text-primary text-sm font-semibold truncate">{room.name}</h4>
                      </div>
                      <span className={`hidden sm:block text-xs px-2 py-0.5 rounded-full ${room.mode === 'Mineiro' ? 'bg-emerald-500/20 text-emerald-400' : room.mode === 'Paulista' ? 'bg-ruby/20 text-ruby' : 'bg-gold/20 text-gold'}`}>
                        {room.mode}
                      </span>
                      <span className="text-text-secondary text-xs flex items-center gap-1">
                        <Users className="w-3 h-3" /> {room.players}/{room.maxPlayers}
                      </span>
                      <span className="text-gold text-xs flex items-center gap-1">
                        <Zap className="w-3 h-3" /> {room.bet}
                      </span>
                      <span className={`text-xs ${room.status === 'waiting' ? 'text-emerald-400' : 'text-text-secondary'}`}>
                        {room.status === 'waiting' ? 'Aguardando' : 'Em jogo'}
                      </span>
                      {room.status === 'waiting' ? (
                        <button className="btn-gold text-xs py-1.5 px-4">
                          Entrar
                        </button>
                      ) : (
                        <span className="text-text-secondary text-xs cursor-pointer hover:text-gold">Assistir</span>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <CreateRoomModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
      <JoinRoomModal isOpen={showJoinModal} onClose={() => setShowJoinModal(false)} />
      <MatchmakingOverlay
        isOpen={matchmakingMode !== null}
        onCancel={() => setMatchmakingMode(null)}
        mode={matchmakingMode || ''}
      />
    </div>
  )
}

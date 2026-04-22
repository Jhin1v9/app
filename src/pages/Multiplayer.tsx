import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

import {
  ArrowLeft,
  Search,
  Users,
  UserPlus,
  MessageCircle,
  Gamepad2,
  MoreHorizontal,
  Wifi,
  
  Globe,
  Zap,
  
  Check,
  
  
  Send,
  
  Radar,
  Plus,
  Trash2,
  Eye,
  Signal,
  Crown,
} from 'lucide-react'

type MultiplayerTab = 'play' | 'friends' | 'rooms'

interface Friend {
  id: string
  name: string
  status: 'online' | 'offline' | 'in-game'
  game?: string
  lastSeen?: string
  avatar: string
}

interface Room {
  id: string
  name: string
  mode: string
  players: number
  maxPlayers: number
  status: 'waiting' | 'playing'
  ping: number
  host: string
}

interface ChatMessage {
  id: string
  sender: string
  text: string
  timestamp: Date
  isSystem?: boolean
}

const INITIAL_FRIENDS: Friend[] = [
  { id: '1', name: 'Joao_Silva', status: 'online', avatar: 'JS' },
  { id: '2', name: 'Maria_Poker', status: 'in-game', game: 'Truco Mineiro', avatar: 'MP' },
  { id: '3', name: 'Pedro_T', status: 'online', avatar: 'PT' },
  { id: '4', name: 'Ana_Cards', status: 'offline', lastSeen: '2h', avatar: 'AC' },
  { id: '5', name: 'Lucas_Truqueiro', status: 'in-game', game: 'Poker', avatar: 'LT' },
  { id: '6', name: 'Carla_Bluff', status: 'online', avatar: 'CB' },
  { id: '7', name: 'Rafa_Mineiro', status: 'offline', lastSeen: '1d', avatar: 'RM' },
  { id: '8', name: 'Bia_Aces', status: 'online', avatar: 'BA' },
]

const INITIAL_ROOMS: Room[] = [
  { id: '1', name: 'Sala do Joao', mode: 'Truco Mineiro', players: 3, maxPlayers: 4, status: 'waiting', ping: 24, host: 'Joao' },
  { id: '2', name: 'Poker Night', mode: 'Poker', players: 5, maxPlayers: 6, status: 'playing', ping: 45, host: 'Maria' },
  { id: '3', name: 'Paulista Pro', mode: 'Truco Paulista', players: 2, maxPlayers: 4, status: 'waiting', ping: 32, host: 'Pedro' },
  { id: '4', name: 'Amigos Unidos', mode: 'Truco Mineiro', players: 1, maxPlayers: 4, status: 'waiting', ping: 18, host: 'Ana' },
  { id: '5', name: 'High Stakes', mode: 'Poker', players: 4, maxPlayers: 6, status: 'waiting', ping: 55, host: 'Lucas' },
]

const QUICK_PHRASES = ['Boa sorte!', 'Boa jogada!', 'Truco!', 'Valeu!', 'Ai sim!', 'Boa!', 'Obrigado!', 'Nossa!']

const TABS = [
  { id: 'play' as const, label: 'Jogar', icon: <Gamepad2 className="w-4 h-4" /> },
  { id: 'friends' as const, label: 'Amigos', icon: <Users className="w-4 h-4" /> },
  { id: 'rooms' as const, label: 'Salas', icon: <Globe className="w-4 h-4" /> },
]

// ===== Quick Play Tab =====
function QuickPlayTab() {
  const navigate = useNavigate()
  const [selectedMode, setSelectedMode] = useState<'truco-mineiro' | 'truco-paulista' | 'poker'>('truco-mineiro')
  const [isSearching, setIsSearching] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [playersInQueue, setPlayersInQueue] = useState(42)
  const [matchFound, setMatchFound] = useState(false)

  const modes = [
    { id: 'truco-mineiro' as const, name: 'Truco Mineiro', players: 128, icon: <Zap className="w-6 h-6" /> },
    { id: 'truco-paulista' as const, name: 'Truco Paulista', players: 86, icon: <Crown className="w-6 h-6" /> },
    { id: 'poker' as const, name: 'Poker Hold\'em', players: 245, icon: <Globe className="w-6 h-6" /> },
  ]

  useEffect(() => {
    if (!isSearching) return
    const timer = setInterval(() => setElapsedTime((e) => e + 1), 1000)
    const queueTimer = setInterval(() => setPlayersInQueue((p) => p + Math.floor(Math.random() * 3) - 1), 2000)

    const matchTimer = setTimeout(() => {
      setMatchFound(true)
    }, 5000)

    return () => {
      clearInterval(timer)
      clearInterval(queueTimer)
      clearTimeout(matchTimer)
    }
  }, [isSearching])

  const handleSearch = () => {
    setIsSearching(true)
    setElapsedTime(0)
    setMatchFound(false)
  }

  const handleCancel = () => {
    setIsSearching(false)
    setElapsedTime(0)
    setMatchFound(false)
  }

  const handleAccept = () => {
    setMatchFound(false)
    setIsSearching(false)
    navigate('/lobby')
  }

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

  return (
    <div className="max-w-[600px] mx-auto">
      <div className="game-panel rounded-xl-game p-6 md:p-8">
        <h3 className="font-display text-xl font-bold text-text-primary mb-4 text-center">Encontre uma Partida</h3>

        {/* Mode Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {modes.map((mode) => (
            <motion.button
              key={mode.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedMode(mode.id)}
              className={`p-4 rounded-xl-game border-2 text-center transition-all ${
                selectedMode === mode.id
                  ? 'border-gold bg-gold/10'
                  : 'border-border-subtle bg-bg-card hover:border-gold/50'
              }`}
            >
              <div className={`mx-auto mb-2 ${selectedMode === mode.id ? 'text-gold' : 'text-text-secondary'}`}>{mode.icon}</div>
              <p className={`text-sm font-semibold ${selectedMode === mode.id ? 'text-gold' : 'text-text-primary'}`}>{mode.name}</p>
              <p className="text-emerald-400 text-xs mt-1">{mode.players} jogando</p>
            </motion.button>
          ))}
        </div>

        {/* Match Type Toggle */}
        <div className="flex gap-2 mb-6 justify-center">
          <button className="px-4 py-2 rounded-md-game bg-gold text-bg-dark text-sm font-semibold">Casual</button>
          <button className="px-4 py-2 rounded-md-game bg-bg-card border border-border-subtle text-text-secondary text-sm font-medium hover:border-gold/50">Ranqueada</button>
        </div>

        {/* Search Button / Searching State */}
        {!isSearching ? (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSearch}
            className="btn-gold w-full h-14 text-lg"
          >
            <Search className="w-5 h-5" /> Buscar Partida
          </motion.button>
        ) : (
          <div className="text-center">
            {!matchFound ? (
              <>
                {/* Radar Animation */}
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 rounded-full border-4 border-transparent border-t-gold border-r-gold/30"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Radar className="w-8 h-8 text-gold" />
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-full border border-gold/30"
                  />
                </div>

                <p className="text-text-primary font-semibold mb-1">Buscando jogadores...</p>
                <p className="text-text-secondary text-sm mb-1">Modo: {modes.find((m) => m.id === selectedMode)?.name}</p>
                <p className="text-text-secondary text-xs mb-1">Tempo: {formatTime(elapsedTime)}</p>
                <p className="text-emerald-400 text-xs mb-4">Jogadores na fila: {playersInQueue}</p>

                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 30, ease: 'linear' }}
                  className="h-1 bg-gold/30 rounded-full mb-4 overflow-hidden"
                >
                  <motion.div
                    animate={{ width: ['0%', '100%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    className="h-full bg-gold rounded-full"
                  />
                </motion.div>

                <button onClick={handleCancel} className="btn-dark">Cancelar</button>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-emerald-400" />
                </div>
                <h4 className="font-display text-xl font-bold text-text-primary mb-2">Partida encontrada!</h4>
                <p className="text-text-secondary text-sm mb-4">4 jogadores prontos</p>
                <div className="flex gap-3 justify-center">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleAccept}
                    className="btn-gold px-8"
                  >
                    Aceitar
                  </motion.button>
                  <button onClick={handleCancel} className="btn-dark">Recusar</button>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* WiFi Local Play Section */}
      <div className="mt-6 game-panel rounded-xl-game p-6">
        <h3 className="font-display text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
          <Wifi className="w-5 h-5 text-emerald-400" /> Jogar na mesma rede
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn-dark flex flex-col items-start p-5 h-auto text-left gap-2">
            <Wifi className="w-8 h-8 text-emerald-400" />
            <span className="font-semibold text-text-primary text-sm">Criar Sala Local</span>
            <span className="text-text-secondary text-xs">Seu dispositivo sera o servidor</span>
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn-dark flex flex-col items-start p-5 h-auto text-left gap-2">
            <Search className="w-8 h-8 text-team-blue" />
            <span className="font-semibold text-text-primary text-sm">Buscar Salas</span>
            <span className="text-text-secondary text-xs">Procure salas na sua rede WiFi</span>
          </motion.button>
        </div>
      </div>
    </div>
  )
}

// ===== Friends Tab =====
function FriendsTab() {
  const [friends, setFriends] = useState<Friend[]>(INITIAL_FRIENDS)
  const [showAddFriend, setShowAddFriend] = useState(false)
  const [friendUsername, setFriendUsername] = useState('')
  const [menuOpen, setMenuOpen] = useState<string | null>(null)

  const onlineCount = friends.filter((f) => f.status === 'online').length

  const statusConfig = {
    online: { color: 'bg-emerald-400', label: 'Online' },
    'in-game': { color: 'bg-yellow-400', label: 'Em jogo' },
    offline: { color: 'bg-gray-500', label: 'Offline' },
  }

  const handleRemove = (id: string) => {
    setFriends((prev) => prev.filter((f) => f.id !== id))
    setMenuOpen(null)
  }

  const handleAddFriend = () => {
    if (!friendUsername.trim()) return
    const newFriend: Friend = {
      id: `new_${Date.now()}`,
      name: friendUsername,
      status: 'offline',
      lastSeen: 'agora',
      avatar: friendUsername.slice(0, 2).toUpperCase(),
    }
    setFriends((prev) => [newFriend, ...prev])
    setFriendUsername('')
    setShowAddFriend(false)
  }

  return (
    <div className="max-w-[600px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-xl font-bold text-text-primary">Amigos</h3>
          <p className="text-emerald-400 text-sm">({onlineCount} online)</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowAddFriend(!showAddFriend)}
          className="btn-gold text-sm py-2 px-4"
        >
          <UserPlus className="w-4 h-4" /> Adicionar
        </motion.button>
      </div>

      {/* Add Friend Input */}
      <AnimatePresence>
        {showAddFriend && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 overflow-hidden"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={friendUsername}
                onChange={(e) => setFriendUsername(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddFriend()}
                placeholder="Nome de usuario ou ID"
                className="flex-1 h-10 bg-bg-card border border-border-subtle rounded-md-game px-4 text-text-primary text-sm placeholder:text-text-secondary/50 focus:border-gold focus:outline-none"
              />
              <button onClick={handleAddFriend} className="btn-gold text-sm py-2 px-4">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Friend List */}
      <div className="space-y-2">
        {friends.map((friend, i) => (
          <motion.div
            key={friend.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ delay: i * 0.05 }}
            className="relative flex items-center gap-3 bg-bg-card border border-border-subtle rounded-md-game p-3 hover:border-gold/30 transition-colors"
          >
            {/* Avatar with status */}
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-felt-green border-2 border-gold/30 flex items-center justify-center text-gold font-bold text-xs">
                {friend.avatar}
              </div>
              <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-bg-card ${statusConfig[friend.status].color}`}>
                {friend.status === 'online' && (
                  <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-full h-full rounded-full bg-emerald-400"
                  />
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-text-primary text-sm font-semibold truncate">{friend.name}</p>
              <p className="text-text-secondary text-xs">
                {friend.status === 'in-game' ? `Em jogo - ${friend.game}` : friend.status === 'offline' ? `Offline ha ${friend.lastSeen}` : 'Online'}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <button className="w-8 h-8 rounded-full hover:bg-bg-card-hover flex items-center justify-center text-text-secondary hover:text-gold transition-colors">
                <MessageCircle className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 rounded-full hover:bg-bg-card-hover flex items-center justify-center text-text-secondary hover:text-emerald-400 transition-colors">
                <Gamepad2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setMenuOpen(menuOpen === friend.id ? null : friend.id)}
                className="w-8 h-8 rounded-full hover:bg-bg-card-hover flex items-center justify-center text-text-secondary transition-colors"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* Dropdown menu */}
            <AnimatePresence>
              {menuOpen === friend.id && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute right-2 top-12 z-20 bg-bg-elevated border border-border-subtle rounded-md-game shadow-lg overflow-hidden min-w-[160px]"
                  >
                    <button className="w-full text-left px-4 py-2 text-text-secondary text-sm hover:bg-bg-card-hover hover:text-text-primary flex items-center gap-2">
                      <Eye className="w-4 h-4" /> Ver perfil
                    </button>
                    <button className="w-full text-left px-4 py-2 text-text-secondary text-sm hover:bg-bg-card-hover hover:text-text-primary flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" /> Enviar mensagem
                    </button>
                    <button className="w-full text-left px-4 py-2 text-text-secondary text-sm hover:bg-bg-card-hover hover:text-text-primary flex items-center gap-2">
                      <Gamepad2 className="w-4 h-4" /> Convidar para jogar
                    </button>
                    <button
                      onClick={() => handleRemove(friend.id)}
                      className="w-full text-left px-4 py-2 text-ruby text-sm hover:bg-ruby/10 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" /> Remover amigo
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ===== Rooms Tab =====
function RoomsTab() {
  const [rooms] = useState<Room[]>(INITIAL_ROOMS)
  const [filter, setFilter] = useState<'all' | 'truco' | 'poker'>('all')

  const filteredRooms = rooms.filter((r) => {
    if (filter === 'truco') return r.mode.includes('Truco')
    if (filter === 'poker') return r.mode.includes('Poker')
    return true
  })

  const getPingColor = (ping: number) => {
    if (ping < 30) return 'text-emerald-400'
    if (ping < 60) return 'text-yellow-400'
    return 'text-ruby'
  }

  return (
    <div className="max-w-[700px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h3 className="font-display text-xl font-bold text-text-primary">Salas Publicas</h3>
        <div className="flex gap-1 bg-bg-card rounded-md-game p-1">
          {(['all', 'truco', 'poker'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-sm text-xs font-medium transition-all ${filter === f ? 'bg-gold text-bg-dark' : 'text-text-secondary hover:text-text-primary'}`}
            >
              {f === 'all' ? 'Todas' : f === 'truco' ? 'Truco' : 'Poker'}
            </button>
          ))}
        </div>
      </div>

      {/* Room List */}
      <div className="space-y-2">
        {filteredRooms.map((room, i) => (
          <motion.div
            key={room.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="bg-bg-card border border-border-subtle rounded-md-game p-4 hover:border-gold/30 transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-text-primary font-semibold text-sm">{room.name}</h4>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${room.mode.includes('Mineiro') ? 'bg-emerald-500/20 text-emerald-400' : room.mode.includes('Paulista') ? 'bg-ruby/20 text-ruby' : 'bg-gold/20 text-gold'}`}>
                    {room.mode.replace('Truco ', '').replace('Texas ', '')}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-text-secondary text-xs">
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {room.players}/{room.maxPlayers}</span>
                  <span className="flex items-center gap-1"><Signal className={`w-3 h-3 ${getPingColor(room.ping)}`} /> {room.ping}ms</span>
                  <span>Host: {room.host}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs ${room.status === 'waiting' ? 'text-emerald-400' : 'text-text-secondary'}`}>
                  {room.status === 'waiting' ? 'Aguardando' : 'Em jogo'}
                </span>
                {room.status === 'waiting' && room.players < room.maxPlayers ? (
                  <button className="btn-gold text-xs py-1.5 px-4">Entrar</button>
                ) : (
                  <button className="btn-dark text-xs py-1.5 px-4">Assistir</button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ===== Chat Panel =====
function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'Sistema', text: 'Bem-vindo ao chat!', timestamp: new Date(), isSystem: true },
    { id: '2', sender: 'Joao_Silva', text: 'Boa sorte a todos!', timestamp: new Date(Date.now() - 60000) },
    { id: '3', sender: 'Maria_Poker', text: 'Vamos jogar!', timestamp: new Date(Date.now() - 30000) },
  ])
  const [inputText, setInputText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const sendMessage = (text: string) => {
    if (!text.trim()) return
    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'Voce',
      text,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, newMsg])
    setInputText('')
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="mt-6 game-panel rounded-xl-game p-4">
      <h4 className="text-text-primary font-semibold text-sm mb-3 flex items-center gap-2">
        <MessageCircle className="w-4 h-4 text-gold" /> Chat Rápido
      </h4>

      {/* Messages */}
      <div className="h-32 overflow-y-auto mb-3 space-y-2 scrollbar-hide">
        {messages.map((msg) => (
          <div key={msg.id} className={msg.isSystem ? 'text-center' : ''}>
            {msg.isSystem ? (
              <span className="text-text-secondary text-xs italic">{msg.text}</span>
            ) : (
              <div className="flex gap-2">
                <span className={`text-xs font-semibold flex-shrink-0 ${msg.sender === 'Voce' ? 'text-gold' : 'text-team-blue'}`}>
                  {msg.sender}:
                </span>
                <span className="text-text-primary text-xs">{msg.text}</span>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Phrases */}
      <div className="flex gap-1 overflow-x-auto pb-2 mb-2 scrollbar-hide">
        {QUICK_PHRASES.map((phrase) => (
          <motion.button
            key={phrase}
            whileTap={{ scale: 0.95 }}
            onClick={() => sendMessage(phrase)}
            className="flex-shrink-0 px-3 py-1 bg-bg-card border border-border-subtle rounded-full text-text-secondary text-xs hover:border-gold/50 hover:text-text-primary transition-colors"
          >
            {phrase}
          </motion.button>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage(inputText)}
          placeholder="Digite uma mensagem..."
          className="flex-1 h-9 bg-bg-card border border-border-subtle rounded-md-game px-3 text-text-primary text-sm placeholder:text-text-secondary/50 focus:border-gold focus:outline-none"
        />
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => sendMessage(inputText)}
          className="w-9 h-9 rounded-md-game bg-gold text-bg-dark flex items-center justify-center hover:bg-gold-light transition-colors"
        >
          <Send className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  )
}

// ===== Main Multiplayer Page =====
export default function Multiplayer() {
  const [activeTab, setActiveTab] = useState<MultiplayerTab>('play')
  const navigate = useNavigate()

  return (
    <div className="min-h-[100dvh] bg-bg-dark pb-8">
      {/* Header */}
      <div className="h-14 game-panel border-b border-border-subtle flex items-center px-4 sticky top-0 z-30">
        <button onClick={() => navigate('/')} className="w-8 h-8 rounded-full bg-bg-card hover:bg-bg-card-hover flex items-center justify-center transition-colors mr-4">
          <ArrowLeft className="w-4 h-4 text-text-secondary" />
        </button>
        <h1 className="font-display text-lg font-bold text-text-primary">Multiplayer</h1>
      </div>

      <div className="max-w-[800px] mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-md-game text-sm font-semibold transition-all ${
                activeTab === tab.id ? 'bg-gold text-bg-dark' : 'bg-bg-card text-text-secondary border border-border-subtle'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'play' && <QuickPlayTab />}
            {activeTab === 'friends' && <FriendsTab />}
            {activeTab === 'rooms' && <RoomsTab />}
          </motion.div>
        </AnimatePresence>

        {/* Chat - visible on all tabs */}
        <ChatPanel />
      </div>
    </div>
  )
}

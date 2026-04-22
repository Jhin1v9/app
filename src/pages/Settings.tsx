import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import type { Difficulty, CardStyle } from '@/store/gameStore'
import {
  ArrowLeft,
  Volume2,
  Music,
  Monitor,
  SlidersHorizontal,
  Globe,
  User,
  Bell,
  Info,
  Check,
  LogOut,
  Trash2,
  AlertTriangle,
  RefreshCw,
  Bug,
  Shield,
  FileText,
  Star,
  ChevronRight,
  
  Lock,
} from 'lucide-react'

type SettingsTab = 'audio' | 'graphics' | 'gameplay' | 'language' | 'account' | 'notifications' | 'about'

interface TabConfig {
  id: SettingsTab
  label: string
  icon: React.ReactNode
}

const TABS: TabConfig[] = [
  { id: 'audio', label: 'Audio', icon: <Volume2 className="w-5 h-5" /> },
  { id: 'graphics', label: 'Graficos', icon: <Monitor className="w-5 h-5" /> },
  { id: 'gameplay', label: 'Gameplay', icon: <SlidersHorizontal className="w-5 h-5" /> },
  { id: 'language', label: 'Idioma', icon: <Globe className="w-5 h-5" /> },
  { id: 'account', label: 'Conta', icon: <User className="w-5 h-5" /> },
  { id: 'notifications', label: 'Notificacoes', icon: <Bell className="w-5 h-5" /> },
  { id: 'about', label: 'Sobre', icon: <Info className="w-5 h-5" /> },
]

// ===== Reusable Components =====

function ToggleSwitch({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative w-12 h-6 rounded-full transition-colors ${checked ? 'bg-gold' : 'bg-border-subtle'} ${disabled ? 'opacity-40' : ''}`}
    >
      <motion.div
        animate={{ x: checked ? 26 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow"
      />
    </button>
  )
}

function SettingRow({ label, subtext, children }: { label: string; subtext?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-border-subtle/50">
      <div className="flex-1 pr-4">
        <p className="text-text-primary text-sm font-medium">{label}</p>
        {subtext && <p className="text-text-secondary text-xs mt-0.5">{subtext}</p>}
      </div>
      {children}
    </div>
  )
}

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h2 className="font-display text-xl font-bold text-text-primary">{title}</h2>
      {subtitle && <p className="text-text-secondary text-sm mt-1">{subtitle}</p>}
    </div>
  )
}

function CustomSlider({ value, onChange, icon }: { value: number; onChange: (v: number) => void; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 flex-1">
      <span className="text-text-secondary">{icon}</span>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 h-1.5 bg-border-subtle rounded-full appearance-none cursor-pointer accent-gold"
        style={{ background: `linear-gradient(to right, #D4A830 ${value}%, #2A3655 ${value}%)` }}
      />
      <span className="text-text-primary text-sm font-mono w-10 text-right">{value}%</span>
    </div>
  )
}

// ===== Section Components =====

function AudioSection() {
  const [masterVolume, setMasterVolume] = useState(80)
  const [musicVolume, setMusicVolume] = useState(60)
  const [sfxVolume, setSfxVolume] = useState(70)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [voiceChat, setVoiceChat] = useState(false)

  return (
    <div>
      <SectionTitle title="Audio" subtitle="Configure sons e musica do jogo" />

      <SettingRow label="Som ligado/desligado">
        <ToggleSwitch checked={soundEnabled} onChange={setSoundEnabled} />
      </SettingRow>

      <div className="py-4 border-b border-border-subtle/50">
        <p className="text-text-primary text-sm font-medium mb-3">Volume Principal</p>
        <CustomSlider value={masterVolume} onChange={setMasterVolume} icon={soundEnabled ? <Volume2 className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />} />
      </div>

      <div className="py-4 border-b border-border-subtle/50">
        <div className="flex items-center justify-between mb-3">
          <p className="text-text-primary text-sm font-medium">Musica</p>
          <ToggleSwitch checked={masterVolume > 0} onChange={(v) => setMusicVolume(v ? 60 : 0)} />
        </div>
        <CustomSlider value={musicVolume} onChange={setMusicVolume} icon={<Music className="w-4 h-4" />} />
      </div>

      <div className="py-4 border-b border-border-subtle/50">
        <div className="flex items-center justify-between mb-3">
          <p className="text-text-primary text-sm font-medium">Efeitos Sonoros</p>
          <ToggleSwitch checked={sfxVolume > 0} onChange={(v) => setSfxVolume(v ? 70 : 0)} />
        </div>
        <CustomSlider value={sfxVolume} onChange={setSfxVolume} icon={<Volume2 className="w-4 h-4" />} />
      </div>

      <SettingRow label="Chat de Voz" subtext="Permitir voz em partidas multiplayer">
        <ToggleSwitch checked={voiceChat} onChange={setVoiceChat} />
      </SettingRow>

      <div className="mt-4">
        <button className="btn-dark text-sm py-2 px-4">
          <RefreshCw className="w-4 h-4" /> Testar Som
        </button>
      </div>
    </div>
  )
}

function GraphicsSection() {
  const [cardStyle, setCardStyle] = useState<CardStyle>('classic')
  const [tableTheme, setTableTheme] = useState('green')
  const [animQuality, setAnimQuality] = useState('medium')
  const [showFps, setShowFps] = useState(false)
  const [particles, setParticles] = useState(true)

  const cardStyles: { id: CardStyle; label: string; preview: string }[] = [
    { id: 'classic', label: 'Classico', preview: 'from-red-800 to-red-900' },
    { id: 'modern', label: 'Moderno', preview: 'from-blue-800 to-blue-900' },
    { id: 'gold', label: 'Dourado', preview: 'from-yellow-700 to-yellow-800' },
  ]

  const themes = [
    { id: 'green', label: 'Verde Classico', color: '#0B3D2E' },
    { id: 'blue', label: 'Azul Royal', color: '#0D2240' },
    { id: 'red', label: 'Vermelho Cassino', color: '#3D0D0D' },
  ]

  const qualities = [
    { id: 'low', label: 'Baixa' },
    { id: 'medium', label: 'Media' },
    { id: 'high', label: 'Alta' },
  ]

  return (
    <div>
      <SectionTitle title="Graficos" subtitle="Ajuste a qualidade visual" />

      {/* Card Style */}
      <div className="py-4 border-b border-border-subtle/50">
        <p className="text-text-primary text-sm font-medium mb-3">Estilo das Cartas</p>
        <div className="grid grid-cols-3 gap-3">
          {cardStyles.map((s) => (
            <button
              key={s.id}
              onClick={() => setCardStyle(s.id)}
              className={`relative p-3 rounded-md-game border-2 transition-all ${cardStyle === s.id ? 'border-gold bg-gold/10' : 'border-border-subtle hover:border-gold/50'}`}
            >
              <div className={`w-full h-16 rounded bg-gradient-to-br ${s.preview} mb-2 flex items-center justify-center`}>
                <div className="w-8 h-12 bg-white rounded shadow-card flex items-center justify-center">
                  <span className="text-red-600 font-bold text-xs">A♥</span>
                </div>
              </div>
              <p className={`text-xs font-medium ${cardStyle === s.id ? 'text-gold' : 'text-text-secondary'}`}>{s.label}</p>
              {cardStyle === s.id && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-gold flex items-center justify-center">
                  <Check className="w-3 h-3 text-bg-dark" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Table Theme */}
      <div className="py-4 border-b border-border-subtle/50">
        <p className="text-text-primary text-sm font-medium mb-3">Tema da Mesa</p>
        <div className="flex gap-3">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => setTableTheme(t.id)}
              className={`relative flex items-center gap-3 p-3 rounded-md-game border-2 transition-all ${tableTheme === t.id ? 'border-gold bg-gold/10' : 'border-border-subtle hover:border-gold/50'}`}
            >
              <div className="w-10 h-10 rounded-full border-2 border-white/20" style={{ backgroundColor: t.color }} />
              <span className={`text-sm font-medium ${tableTheme === t.id ? 'text-gold' : 'text-text-secondary'}`}>{t.label}</span>
              {tableTheme === t.id && (
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gold flex items-center justify-center">
                  <Check className="w-3 h-3 text-bg-dark" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Animation Quality */}
      <div className="py-4 border-b border-border-subtle/50">
        <p className="text-text-primary text-sm font-medium mb-3">Qualidade das Animacoes</p>
        <div className="grid grid-cols-3 gap-3">
          {qualities.map((q) => (
            <button
              key={q.id}
              onClick={() => setAnimQuality(q.id)}
              className={`py-2 px-4 rounded-md-game text-sm font-medium transition-all ${animQuality === q.id ? 'bg-gold text-bg-dark' : 'bg-bg-card border border-border-subtle text-text-secondary hover:border-gold/50'}`}
            >
              {q.label}
            </button>
          ))}
        </div>
      </div>

      <SettingRow label="Mostrar FPS" subtext="Exibe contador de frames por segundo">
        <ToggleSwitch checked={showFps} onChange={setShowFps} />
      </SettingRow>

      <SettingRow label="Efeitos de Particulas" subtext="Confetes, brilhos, efeitos especiais">
        <ToggleSwitch checked={particles} onChange={setParticles} />
      </SettingRow>
    </div>
  )
}

function GameplaySection() {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [autoSort, setAutoSort] = useState(true)
  const [quickPlay, setQuickPlay] = useState(false)
  const [confirmTruco, setConfirmTruco] = useState(true)
  const [showHandStrength, setShowHandStrength] = useState(true)
  const [gameSpeed, setGameSpeed] = useState(50)

  const difficulties: { id: Difficulty; label: string }[] = [
    { id: 'easy', label: 'Facil' },
    { id: 'medium', label: 'Medio' },
    { id: 'hard', label: 'Dificil' },
    { id: 'expert', label: 'Expert' },
  ]

  return (
    <div>
      <SectionTitle title="Gameplay" subtitle="Preferencias de jogo" />

      {/* Difficulty */}
      <div className="py-4 border-b border-border-subtle/50">
        <p className="text-text-primary text-sm font-medium mb-3">Dificuldade dos Bots (padrao)</p>
        <div className="grid grid-cols-4 gap-2">
          {difficulties.map((d) => (
            <button
              key={d.id}
              onClick={() => setDifficulty(d.id)}
              className={`py-2 px-3 rounded-md-game text-sm font-medium transition-all ${difficulty === d.id ? 'bg-gold text-bg-dark' : 'bg-bg-card border border-border-subtle text-text-secondary hover:border-gold/50'}`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <SettingRow label="Auto-organizar cartas" subtext="Organiza suas cartas por valor">
        <ToggleSwitch checked={autoSort} onChange={setAutoSort} />
      </SettingRow>

      <SettingRow label="Jogada rapida" subtext="Toque duplo para jogar carta imediatamente">
        <ToggleSwitch checked={quickPlay} onChange={setQuickPlay} />
      </SettingRow>

      <SettingRow label="Confirmar truco" subtext="Evita pedidos de Truco acidentais">
        <ToggleSwitch checked={confirmTruco} onChange={setConfirmTruco} />
      </SettingRow>

      <SettingRow label="Mostrar forca da mao" subtext="Exibe indicador visual da forca da sua mao">
        <ToggleSwitch checked={showHandStrength} onChange={setShowHandStrength} />
      </SettingRow>

      <div className="py-4 border-b border-border-subtle/50">
        <p className="text-text-primary text-sm font-medium mb-1">Velocidade do Jogo</p>
        <p className="text-text-secondary text-xs mb-3">Afeta o tempo de resposta dos bots</p>
        <div className="flex items-center gap-3">
          <span className="text-text-secondary text-xs">Lento</span>
          <CustomSlider value={gameSpeed} onChange={setGameSpeed} icon={<SlidersHorizontal className="w-4 h-4" />} />
          <span className="text-text-secondary text-xs">Rapido</span>
        </div>
      </div>
    </div>
  )
}

function LanguageSection() {
  const { settings, updateSettings } = useGameStore()
  const [selectedLang, setSelectedLang] = useState(settings.language)

  const languages = [
    { id: 'pt-BR' as const, label: 'Portugues (Brasil)', flag: '🇧🇷', native: true },
    { id: 'en' as const, label: 'English (US)', flag: '🇺🇸', native: false },
  ]

  const handleSelect = (langId: 'pt-BR' | 'en') => {
    setSelectedLang(langId)
    updateSettings({ language: langId })
  }

  return (
    <div>
      <SectionTitle title="Idioma" subtitle="Escolha seu idioma" />

      <div className="space-y-3">
        {languages.map((lang) => (
          <motion.button
            key={lang.id}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => handleSelect(lang.id)}
            className={`w-full flex items-center gap-4 p-4 rounded-md-game border-2 transition-all ${selectedLang === lang.id ? 'border-gold bg-gold/10' : 'border-border-subtle hover:border-gold/50 bg-bg-card'}`}
          >
            <div className="w-12 h-12 rounded-full bg-bg-dark flex items-center justify-center text-2xl overflow-hidden">
              {lang.id === 'pt-BR' ? (
                <div className="w-full h-full bg-green-600 flex items-center justify-center">
                  <div className="w-full h-6 bg-yellow-400 flex items-center justify-center">
                    <div className="w-5 h-5 rounded-full bg-blue-600" />
                  </div>
                </div>
              ) : (
                <div className="w-full h-full bg-blue-700 flex items-center justify-center relative">
                  <div className="absolute inset-2 flex flex-col justify-between">
                    <div className="h-1 bg-white/30" /><div className="h-1 bg-white/30" /><div className="h-1 bg-white/30" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 bg-red-600 rounded-full" />
                  </div>
                </div>
              )}
            </div>
            <div className="flex-1 text-left">
              <p className={`font-medium ${selectedLang === lang.id ? 'text-gold' : 'text-text-primary'}`}>{lang.label}</p>
              <p className="text-text-secondary text-xs">{lang.native ? 'Nativo' : 'Beta - 85% traduzido'}</p>
            </div>
            {selectedLang === lang.id && (
              <div className="w-6 h-6 rounded-full bg-gold flex items-center justify-center">
                <Check className="w-4 h-4 text-bg-dark" />
              </div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  )
}

function AccountSection() {
  const navigate = useNavigate()
  const { player, logout } = useGameStore()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [editName, setEditName] = useState(player.username)
  const [editEmail, setEditEmail] = useState((player as any).email || '')
  const [isEditing, setIsEditing] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleDelete = () => {
    logout()
    localStorage.clear()
    navigate('/')
  }

  return (
    <div>
      <SectionTitle title="Conta" subtitle="Gerencie sua conta" />

      {/* Profile Info */}
      <div className="py-4 border-b border-border-subtle/50">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-felt-green border-2 border-gold/50 flex items-center justify-center text-gold font-bold text-xl">
            {player.username[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <p className="text-text-primary font-semibold">{player.username}</p>
            <p className="text-text-secondary text-sm">ID: {player.id || 'N/A'}</p>
          </div>
        </div>

        {isEditing ? (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3">
            <div>
              <label className="text-text-secondary text-xs mb-1 block">Nome de usuario</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full h-10 bg-bg-card border border-border-subtle rounded-md-game px-3 text-text-primary text-sm focus:border-gold focus:outline-none"
              />
            </div>
            <div>
              <label className="text-text-secondary text-xs mb-1 block">Email</label>
              <input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="w-full h-10 bg-bg-card border border-border-subtle rounded-md-game px-3 text-text-primary text-sm focus:border-gold focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setIsEditing(false)} className="btn-gold text-sm py-2 px-4">Salvar</button>
              <button onClick={() => setIsEditing(false)} className="btn-dark text-sm py-2 px-4">Cancelar</button>
            </div>
          </motion.div>
        ) : (
          <button onClick={() => setIsEditing(true)} className="btn-dark text-sm py-2 px-4">
            <User className="w-4 h-4" /> Editar Perfil
          </button>
        )}
      </div>

      {/* Connected Accounts */}
      <div className="py-4 border-b border-border-subtle/50">
        <p className="text-text-primary text-sm font-medium mb-3">Contas Conectadas</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between bg-bg-card rounded-md-game p-3">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="white" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              <span className="text-text-secondary text-sm">Google</span>
            </div>
            <span className="text-text-secondary text-xs">Nao conectado</span>
          </div>
          <div className="flex items-center justify-between bg-bg-card rounded-md-game p-3">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              <span className="text-text-secondary text-sm">Facebook</span>
            </div>
            <span className="text-text-secondary text-xs">Nao conectado</span>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="py-4 border-b border-border-subtle/50">
        <button className="btn-dark text-sm py-2 px-4">
          <Lock className="w-4 h-4" /> Alterar Senha
        </button>
      </div>

      {/* Danger Zone */}
      <div className="mt-6 pt-6 border-t-2 border-ruby/50 rounded-t-lg">
        <p className="text-ruby text-sm font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> Zona de Perigo
        </p>

        <div className="space-y-3">
          <button onClick={handleLogout} className="btn-dark text-sm py-2 px-4 w-full justify-center text-ruby border-ruby/30 hover:border-ruby">
            <LogOut className="w-4 h-4" /> Sair da conta
          </button>

          {!showDeleteConfirm ? (
            <button onClick={() => setShowDeleteConfirm(true)} className="btn-dark text-sm py-2 px-4 w-full justify-center text-ruby border-ruby/30 hover:border-ruby hover:bg-ruby/10">
              <Trash2 className="w-4 h-4" /> Excluir conta
            </button>
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-ruby/10 border border-ruby rounded-md-game p-4">
              <p className="text-text-primary text-sm mb-3">Tem certeza? Esta acao nao pode ser desfeita!</p>
              <div className="flex gap-2">
                <button onClick={handleDelete} className="btn-dark text-sm py-2 px-4 flex-1 bg-ruby text-white hover:bg-ruby-dark">Excluir</button>
                <button onClick={() => setShowDeleteConfirm(false)} className="btn-dark text-sm py-2 px-4 flex-1">Cancelar</button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

function NotificationsSection() {
  const [pushEnabled, setPushEnabled] = useState(true)
  const [dailyReward, setDailyReward] = useState(true)
  const [matchInvites, setMatchInvites] = useState(true)
  const [matchStarting, setMatchStarting] = useState(true)
  const [chatMessages, setChatMessages] = useState(true)
  const [updates, setUpdates] = useState(false)
  const [promotions, setPromotions] = useState(true)

  return (
    <div>
      <SectionTitle title="Notificacoes" />

      <SettingRow label="Notificacoes Push" subtext="Ativar/desativar todas">
        <ToggleSwitch checked={pushEnabled} onChange={setPushEnabled} />
      </SettingRow>

      <div className={`space-y-0 ${!pushEnabled ? 'opacity-40 pointer-events-none' : ''}`}>
        <SettingRow label="Recompensa diaria disponivel">
          <ToggleSwitch checked={dailyReward} onChange={setDailyReward} disabled={!pushEnabled} />
        </SettingRow>
        <SettingRow label="Convite de amigo">
          <ToggleSwitch checked={matchInvites} onChange={setMatchInvites} disabled={!pushEnabled} />
        </SettingRow>
        <SettingRow label="Partida prestes a comecar">
          <ToggleSwitch checked={matchStarting} onChange={setMatchStarting} disabled={!pushEnabled} />
        </SettingRow>
        <SettingRow label="Mensagem no chat">
          <ToggleSwitch checked={chatMessages} onChange={setChatMessages} disabled={!pushEnabled} />
        </SettingRow>
        <SettingRow label="Atualizacoes e novidades">
          <ToggleSwitch checked={updates} onChange={setUpdates} disabled={!pushEnabled} />
        </SettingRow>
        <SettingRow label="Promocoes da loja">
          <ToggleSwitch checked={promotions} onChange={setPromotions} disabled={!pushEnabled} />
        </SettingRow>
      </div>
    </div>
  )
}

function AboutSection() {
  return (
    <div>
      <SectionTitle title="Sobre" />

      <div className="text-center py-6">
        <motion.div
          animate={{ boxShadow: ['0 0 20px rgba(212,168,48,0.1)', '0 0 40px rgba(212,168,48,0.3)', '0 0 20px rgba(212,168,48,0.1)'] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4"
        >
          <div className="font-display text-2xl font-bold text-gold">TPA</div>
        </motion.div>
        <h3 className="font-display text-lg font-bold text-text-primary">TRUCO POKER ARENA</h3>
        <p className="text-text-secondary text-sm mt-1">Versao 1.0.0</p>
        <p className="text-text-secondary text-xs mt-1">Feito com ♥ no Brasil</p>
      </div>

      <div className="space-y-2 py-4 border-t border-border-subtle/50">
        <button className="w-full flex items-center justify-between p-3 rounded-md-game hover:bg-bg-card transition-colors text-left">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-text-secondary" />
            <span className="text-text-primary text-sm">Termos de Servico</span>
          </div>
          <ChevronRight className="w-4 h-4 text-text-secondary" />
        </button>
        <button className="w-full flex items-center justify-between p-3 rounded-md-game hover:bg-bg-card transition-colors text-left">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-text-secondary" />
            <span className="text-text-primary text-sm">Politica de Privacidade</span>
          </div>
          <ChevronRight className="w-4 h-4 text-text-secondary" />
        </button>
        <button className="w-full flex items-center justify-between p-3 rounded-md-game hover:bg-bg-card transition-colors text-left">
          <div className="flex items-center gap-3">
            <Bug className="w-5 h-5 text-text-secondary" />
            <span className="text-text-primary text-sm">Reportar Bug</span>
          </div>
          <ChevronRight className="w-4 h-4 text-text-secondary" />
        </button>
        <button className="w-full flex items-center justify-between p-3 rounded-md-game hover:bg-bg-card transition-colors text-left">
          <div className="flex items-center gap-3">
            <Star className="w-5 h-5 text-gold" />
            <span className="text-text-primary text-sm">Avaliar o Jogo</span>
          </div>
          <ChevronRight className="w-4 h-4 text-text-secondary" />
        </button>
      </div>

      <div className="pt-4 border-t border-border-subtle/50 text-center">
        <p className="text-text-secondary text-xs">Desenvolvido por Truco Poker Arena Team</p>
        <p className="text-text-secondary text-xs mt-1">© 2025 Todos os direitos reservados</p>
      </div>
    </div>
  )
}

// ===== Main Settings Page =====
export default function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('audio')
  const navigate = useNavigate()
  // responsive check removed

  const renderContent = () => {
    switch (activeTab) {
      case 'audio': return <AudioSection />
      case 'graphics': return <GraphicsSection />
      case 'gameplay': return <GameplaySection />
      case 'language': return <LanguageSection />
      case 'account': return <AccountSection />
      case 'notifications': return <NotificationsSection />
      case 'about': return <AboutSection />
      default: return null
    }
  }

  return (
    <div className="min-h-[100dvh] bg-bg-dark pb-8">
      {/* Header */}
      <div className="h-14 game-panel border-b border-border-subtle flex items-center px-4 sticky top-0 z-30">
        <button onClick={() => navigate('/')} className="w-8 h-8 rounded-full bg-bg-card hover:bg-bg-card-hover flex items-center justify-center transition-colors mr-4">
          <ArrowLeft className="w-4 h-4 text-text-secondary" />
        </button>
        <h1 className="font-display text-lg font-bold text-text-primary">Configuracoes</h1>
      </div>

      <div className="max-w-[1000px] mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
        {/* Sidebar (desktop) / Tab bar (mobile) */}
        <div className="lg:w-[260px] flex-shrink-0">
          {/* Mobile: horizontal scroll */}
          <div className="lg:hidden flex gap-1 overflow-x-auto pb-2 scrollbar-hide mb-4">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-md-game text-sm font-medium transition-all ${
                  activeTab === tab.id ? 'bg-gold text-bg-dark' : 'bg-bg-card text-text-secondary border border-border-subtle'
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Desktop: sidebar */}
          <div className="hidden lg:block sticky top-20">
            <div className="bg-bg-card border border-border-subtle rounded-xl-game p-3">
              {TABS.map((tab, i) => (
                <motion.button
                  key={tab.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative w-full flex items-center gap-3 h-11 px-4 rounded-md-game text-sm font-medium transition-all mb-1 ${
                    activeTab === tab.id
                      ? 'bg-bg-card-hover text-gold'
                      : 'text-text-secondary hover:bg-bg-card-hover hover:text-text-primary'
                  }`}
                >
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-gold rounded-r-full"
                    />
                  )}
                  {tab.icon}
                  {tab.label}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="game-panel p-5 md:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

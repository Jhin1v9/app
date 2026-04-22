import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowLeft,
  Check,
  X,
  AlertCircle,
  Info,
  Shield,
} from 'lucide-react'

type AuthView = 'login' | 'register' | 'guest' | 'recovery'

interface FormErrors {
  [key: string]: string
}

// ===== Validation =====
const validateEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
const validatePassword = (pwd: string): boolean => pwd.length >= 6
const validateName = (name: string): boolean => name.trim().length >= 3

// ===== Password Strength =====
function getPasswordStrength(password: string): { strength: number; label: string; color: string } {
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  const labels = ['Fraca', 'Fraca', 'Media', 'Forte', 'Muito Forte']
  const colors = ['bg-ruby', 'bg-ruby', 'bg-yellow-500', 'bg-emerald-500', 'bg-emerald-500']
  return { strength: score, label: labels[score], color: colors[score] }
}

// ===== Animated Input =====
function FormInput({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  icon,
  rightElement,
  maxLength,
}: {
  label: string
  type?: string
  value: string
  onChange: (val: string) => void
  placeholder: string
  error?: string
  icon: React.ReactNode
  rightElement?: React.ReactNode
  maxLength?: number
}) {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <div className="mb-4">
      <label className="text-text-secondary text-sm mb-1.5 block">{label}</label>
      <div
        className={`relative flex items-center h-12 bg-bg-card border-2 rounded-md-game transition-colors ${
          error ? 'border-ruby' : isFocused ? 'border-gold shadow-[0_0_8px_rgba(212,168,48,0.15)]' : 'border-border-subtle'
        }`}
      >
        <div className="absolute left-3 text-text-secondary">{icon}</div>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          maxLength={maxLength}
          className="w-full h-full bg-transparent text-text-primary text-sm pl-10 pr-10 placeholder:text-text-secondary/40 focus:outline-none"
        />
        {rightElement && <div className="absolute right-3">{rightElement}</div>}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-ruby text-xs mt-1 flex items-center gap-1"
          >
            <AlertCircle className="w-3 h-3" /> {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

// ===== Login Form =====
function LoginForm({ onSwitchView }: { onSwitchView: (v: AuthView) => void }) {
  const navigate = useNavigate()
  const login = useGameStore((s) => s.login)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [shake, setShake] = useState(false)

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      const newErrors: FormErrors = {}
      if (!validateEmail(email)) newErrors.email = 'Email invalido'
      if (!validatePassword(password)) newErrors.password = 'Senha deve ter no minimo 6 caracteres'

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors)
        setShake(true)
        setTimeout(() => setShake(false), 300)
        return
      }

      setErrors({})
      setIsLoading(true)

      // Simulate API call
      await new Promise((r) => setTimeout(r, 1200))

      login(`token_${Date.now()}`, {
        id: `user_${Date.now()}`,
        username: email.split('@')[0],
        email,
        avatar: '/avatar-default-1.png',
        coins: 5000,
        diamonds: 10,
      })

      setIsLoading(false)
      navigate('/')
    },
    [email, password, login, navigate]
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] }}
    >
      <motion.form
        onSubmit={handleSubmit}
        animate={shake ? { x: [0, -4, 4, -4, 4, 0] } : {}}
        transition={{ duration: 0.3 }}
      >
        <FormInput
          label="Email"
          type="email"
          value={email}
          onChange={(v) => { setEmail(v); setErrors((p) => ({ ...p, email: '' })) }}
          placeholder="seu@email.com"
          error={errors.email}
          icon={<Mail className="w-5 h-5" />}
        />
        <FormInput
          label="Senha"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(v) => { setPassword(v); setErrors((p) => ({ ...p, password: '' })) }}
          placeholder="••••••••"
          error={errors.password}
          icon={<Lock className="w-5 h-5" />}
          rightElement={
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-text-secondary hover:text-text-primary">
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          }
        />

        <div className="flex items-center justify-between mb-6">
          <label className="flex items-center gap-2 text-text-secondary text-sm cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded border-border-subtle bg-bg-card accent-gold" />
            Lembrar de mim
          </label>
          <button type="button" onClick={() => onSwitchView('recovery')} className="text-gold text-sm hover:underline">
            Esqueceu a senha?
          </button>
        </div>

        <motion.button
          type="submit"
          disabled={isLoading}
          whileTap={{ scale: 0.97 }}
          className="btn-gold w-full disabled:opacity-50"
        >
          {isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-5 h-5 border-2 border-bg-dark border-t-transparent rounded-full"
            />
          ) : (
            'Entrar'
          )}
        </motion.button>
      </motion.form>

      {/* Divider */}
      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-border-subtle" />
        <span className="text-text-secondary text-sm">ou</span>
        <div className="flex-1 h-px bg-border-subtle" />
      </div>

      {/* Social login */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button className="flex items-center justify-center gap-2 h-10 bg-white text-gray-800 rounded-md-game text-sm font-medium hover:bg-gray-100 transition-colors">
          <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Google
        </button>
        <button className="flex items-center justify-center gap-2 h-10 bg-[#1877F2] text-white rounded-md-game text-sm font-medium hover:bg-[#166fe5] transition-colors">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          Facebook
        </button>
      </div>

      <p className="text-center text-text-secondary text-sm">
        Nao tem conta?{' '}
        <button onClick={() => onSwitchView('register')} className="text-gold hover:underline font-medium">
          Cadastre-se
        </button>
      </p>
    </motion.div>
  )
}

// ===== Register Form =====
function RegisterForm({ onSwitchView }: { onSwitchView: (v: AuthView) => void }) {
  const navigate = useNavigate()
  const login = useGameStore((s) => s.login)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [shake, setShake] = useState(false)

  const pwdStrength = getPasswordStrength(password)

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      const newErrors: FormErrors = {}
      if (!validateName(name)) newErrors.name = 'Nome deve ter no minimo 3 caracteres'
      if (!validateEmail(email)) newErrors.email = 'Email invalido'
      if (!validatePassword(password)) newErrors.password = 'Senha deve ter no minimo 6 caracteres'
      if (password !== confirmPassword) newErrors.confirmPassword = 'Senhas nao coincidem'
      if (!acceptTerms) newErrors.terms = 'Aceite os termos para continuar'

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors)
        setShake(true)
        setTimeout(() => setShake(false), 300)
        return
      }

      setErrors({})
      setIsLoading(true)
      await new Promise((r) => setTimeout(r, 1200))

      login(`token_${Date.now()}`, {
        id: `user_${Date.now()}`,
        username: name,
        email,
        avatar: '/avatar-default-1.png',
        coins: 5000,
        diamonds: 10,
      })

      setIsLoading(false)
      navigate('/')
    },
    [name, email, password, confirmPassword, acceptTerms, login, navigate]
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] }}
    >
      <motion.form
        onSubmit={handleSubmit}
        animate={shake ? { x: [0, -4, 4, -4, 4, 0] } : {}}
        transition={{ duration: 0.3 }}
      >
        <FormInput
          label="Nome de usuario"
          value={name}
          onChange={(v) => { setName(v); setErrors((p) => ({ ...p, name: '' })) }}
          placeholder="Seu nome de jogador"
          error={errors.name}
          icon={<User className="w-5 h-5" />}
          maxLength={20}
        />
        <FormInput
          label="Email"
          type="email"
          value={email}
          onChange={(v) => { setEmail(v); setErrors((p) => ({ ...p, email: '' })) }}
          placeholder="seu@email.com"
          error={errors.email}
          icon={<Mail className="w-5 h-5" />}
        />
        <FormInput
          label="Senha"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(v) => { setPassword(v); setErrors((p) => ({ ...p, password: '' })) }}
          placeholder="••••••••"
          error={errors.password}
          icon={<Lock className="w-5 h-5" />}
          rightElement={
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-text-secondary hover:text-text-primary">
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          }
        />

        {/* Password strength */}
        {password.length > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-4">
            <div className="flex gap-1 mb-1">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className={`flex-1 h-1.5 rounded-full transition-colors ${i < pwdStrength.strength ? pwdStrength.color : 'bg-border-subtle'}`} />
              ))}
            </div>
            <p className={`text-xs ${pwdStrength.color.replace('bg-', 'text-')}`}>{pwdStrength.label}</p>
          </motion.div>
        )}

        <FormInput
          label="Confirmar senha"
          type={showPassword ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(v) => { setConfirmPassword(v); setErrors((p) => ({ ...p, confirmPassword: '' })) }}
          placeholder="••••••••"
          error={errors.confirmPassword}
          icon={<Lock className="w-5 h-5" />}
        />

        {/* Terms checkbox */}
        <div className="mb-6">
          <label className="flex items-start gap-2 text-text-secondary text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => { setAcceptTerms(e.target.checked); setErrors((p) => ({ ...p, terms: '' })) }}
              className="w-4 h-4 mt-0.5 rounded border-border-subtle bg-bg-card accent-gold"
            />
            <span>
              Aceito os{' '}
              <button type="button" className="text-gold hover:underline">Termos de Servico</button>{' '}
              e{' '}
              <button type="button" className="text-gold hover:underline">Politica de Privacidade</button>
            </span>
          </label>
          {errors.terms && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-ruby text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.terms}
            </motion.p>
          )}
        </div>

        <motion.button
          type="submit"
          disabled={isLoading}
          whileTap={{ scale: 0.97 }}
          className="btn-gold w-full disabled:opacity-50"
        >
          {isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-5 h-5 border-2 border-bg-dark border-t-transparent rounded-full"
            />
          ) : (
            'Criar Conta'
          )}
        </motion.button>
      </motion.form>

      <p className="text-center text-text-secondary text-sm mt-6">
        Ja tem conta?{' '}
        <button onClick={() => onSwitchView('login')} className="text-gold hover:underline font-medium">
          Entrar
        </button>
      </p>
    </motion.div>
  )
}

// ===== Guest Form =====
function GuestForm({ onSwitchView }: { onSwitchView: (v: AuthView) => void }) {
  const navigate = useNavigate()
  const guestLogin = useGameStore((s) => s.guestLogin)
  const [name, setName] = useState(`Jogador_${Math.floor(Math.random() * 999)}`)
  const [isLoading, setIsLoading] = useState(false)

  const handlePlay = async () => {
    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 600))
    guestLogin(name || 'Convidado')
    setIsLoading(false)
    navigate('/')
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] }}
      className="text-center"
    >
      <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
        <Info className="w-8 h-8 text-gold" />
      </div>

      <h3 className="font-display text-xl font-bold text-text-primary mb-2">Jogar como Convidado</h3>
      <p className="text-text-secondary text-sm mb-6">
        Voce pode jogar sem criar uma conta, mas seu progresso so sera salvo neste dispositivo.
      </p>

      <div className="mb-6 text-left">
        <label className="text-text-secondary text-sm mb-1.5 block">Seu nome temporario</label>
        <div className="relative flex items-center h-12 bg-bg-card border border-border-subtle rounded-md-game focus-within:border-gold transition-colors">
          <div className="absolute left-3 text-text-secondary"><User className="w-5 h-5" /></div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jogador Convidado"
            className="w-full h-full bg-transparent text-text-primary text-sm pl-10 pr-4 placeholder:text-text-secondary/40 focus:outline-none"
          />
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handlePlay}
        disabled={isLoading}
        className="btn-gold w-full disabled:opacity-50 mb-4"
      >
        {isLoading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-5 h-5 border-2 border-bg-dark border-t-transparent rounded-full"
          />
        ) : (
          'Jogar Agora'
        )}
      </motion.button>

      <p className="text-text-secondary text-sm">
        Quer salvar seu progresso?{' '}
        <button onClick={() => onSwitchView('register')} className="text-gold hover:underline font-medium">
          Criar conta
        </button>
      </p>
    </motion.div>
  )
}

// ===== Recovery Form =====
function RecoveryForm({ onSwitchView }: { onSwitchView: (v: AuthView) => void }) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = async () => {
    if (!validateEmail(email)) {
      setError('Email invalido')
      return
    }
    setError('')
    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 1000))
    setIsLoading(false)
    setSent(true)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] }}
    >
      <AnimatePresence mode="wait">
        {!sent ? (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <p className="text-text-secondary text-sm mb-6">
              Digite seu email e enviaremos um link para redefinir sua senha.
            </p>
            <FormInput
              label="Email"
              type="email"
              value={email}
              onChange={(v) => { setEmail(v); setError('') }}
              placeholder="seu@email.com"
              error={error}
              icon={<Mail className="w-5 h-5" />}
            />
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSend}
              disabled={isLoading}
              className="btn-gold w-full disabled:opacity-50"
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-bg-dark border-t-transparent rounded-full"
                />
              ) : (
                'Enviar Link'
              )}
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-4"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-emerald-400" />
            </div>
            <h4 className="text-text-primary font-semibold mb-2">Email enviado!</h4>
            <p className="text-emerald-400 text-sm mb-4">Verifique sua caixa de entrada.</p>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => { setSent(false); onSwitchView('login') }}
        className="text-gold text-sm hover:underline w-full text-center mt-6"
      >
        Voltar para o login
      </button>
    </motion.div>
  )
}

// ===== Main Auth Page =====
export default function Auth() {
  const [view, setView] = useState<AuthView>('login')
  const navigate = useNavigate()

  const titles: Record<AuthView, { title: string; subtitle: string }> = {
    login: { title: 'Entrar', subtitle: 'Bem-vindo de volta!' },
    register: { title: 'Criar Conta', subtitle: 'Comece sua jornada!' },
    guest: { title: '', subtitle: '' },
    recovery: { title: 'Recuperar Senha', subtitle: '' },
  }

  return (
    <div
      className="min-h-[100dvh] flex items-center justify-center px-4 py-8"
      style={{ background: 'rgba(10,14,26,0.95)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] }}
        className="w-full max-w-[420px] rounded-xl-game p-8 md:p-10"
        style={{ background: 'linear-gradient(180deg, #1E2945 0%, #141B2D 100%)', border: '1px solid #2A3655', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}
      >
        {/* Close button */}
        <button
          onClick={() => navigate('/')}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-bg-card hover:bg-bg-card-hover flex items-center justify-center transition-colors"
          style={{ position: 'relative', float: 'right', marginTop: -32, marginRight: -32 }}
        >
          <X className="w-4 h-4 text-text-secondary" />
        </button>

        {/* Header */}
        {view !== 'guest' && (
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-4"
            >
              <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-2">
                <Shield className="w-8 h-8 text-gold" />
              </div>
            </motion.div>
            <AnimatePresence mode="wait">
              <motion.div
                key={view}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <h1 className="font-display text-2xl md:text-3xl font-bold text-text-primary mb-2">
                  {titles[view].title}
                </h1>
                {titles[view].subtitle && (
                  <p className="text-text-secondary text-sm">{titles[view].subtitle}</p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {/* Forms */}
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {view === 'login' && <LoginForm onSwitchView={setView} />}
            {view === 'register' && <RegisterForm onSwitchView={setView} />}
            {view === 'guest' && <GuestForm onSwitchView={setView} />}
            {view === 'recovery' && <RecoveryForm onSwitchView={setView} />}
          </motion.div>
        </AnimatePresence>

        {/* Bottom actions */}
        {view === 'login' && (
          <div className="mt-6 pt-6 border-t border-border-subtle text-center">
            <button
              onClick={() => setView('guest')}
              className="text-text-secondary text-sm hover:text-text-primary transition-colors flex items-center gap-2 mx-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              Entrar como Convidado
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}

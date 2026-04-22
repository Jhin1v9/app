import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  ChevronRight,
  Play,
  BookOpen,
  Trophy,
  Coins,
  Lightbulb,
  Star,
  Club,
  Heart,
  Spade,
  Diamond,
  Swords,
  Shield,
  Target,
  Crown,
  Hand,
  Check,
  X,
  AlertTriangle,
  TrendingUp,
  Bot,
  Eye,
} from 'lucide-react'

type MainTab = 'truco' | 'poker'
type TrucoSubTab = 'mineiro' | 'paulista'

// ===== Card Components =====
function TutorialCard({ suit, rank, glow, label, large }: { suit: 'clubs' | 'hearts' | 'spades' | 'diamonds'; rank: string; glow?: string; label?: string; large?: boolean }) {
  const isRed = suit === 'hearts' || suit === 'diamonds'
  const suitIcon = suit === 'clubs' ? <Club className={large ? "w-6 h-6" : "w-4 h-4"} /> : suit === 'hearts' ? <Heart className={large ? "w-6 h-6" : "w-4 h-4"} /> : suit === 'spades' ? <Spade className={large ? "w-6 h-6" : "w-4 h-4"} /> : <Diamond className={large ? "w-6 h-6" : "w-4 h-4"} />

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.05 }}
      className={`relative bg-white rounded-card shadow-card flex flex-col items-center justify-center ${large ? 'w-20 h-28 md:w-24 md:h-36' : 'w-14 h-20 md:w-16 md:h-24'}`}
      style={glow ? { boxShadow: `0 0 20px ${glow}` } : {}}
    >
      <span className={`font-bold ${large ? 'text-xl' : 'text-lg'} ${isRed ? 'text-ruby' : 'text-suit-clubs'}`}>{rank}</span>
      <span className={isRed ? 'text-ruby' : 'text-suit-clubs'}>{suitIcon}</span>
      {label && (
        <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-bold text-gold whitespace-nowrap">{label}</span>
      )}
    </motion.div>
  )
}

function MiniCardBack() {
  return (
    <div className="w-14 h-20 md:w-16 md:h-24 bg-felt-green rounded-card shadow-card border border-gold/30 flex items-center justify-center">
      <div className="w-10 h-16 border border-gold/40 rounded-sm flex items-center justify-center">
        <Diamond className="w-5 h-5 text-gold/60" />
      </div>
    </div>
  )
}

// ===== Escalation Ladder =====
function EscalationLadder({ steps }: { steps: { value: string; label: string }[] }) {
  return (
    <div className="flex items-center gap-1 md:gap-2 flex-wrap justify-center">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center gap-1 md:gap-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
            className={`w-12 h-12 md:w-14 md:h-14 rounded-lg flex flex-col items-center justify-center border-2 ${
              i === steps.length - 1 ? 'bg-gold/20 border-gold' : 'bg-bg-card border-border-subtle'
            }`}
          >
            <span className={`font-bold text-sm md:text-base ${i === steps.length - 1 ? 'text-gold' : 'text-text-primary'}`}>{step.value}</span>
          </motion.div>
          {i < steps.length - 1 && (
            <ChevronRight className="w-4 h-4 text-text-secondary flex-shrink-0" />
          )}
        </div>
      ))}
    </div>
  )
}

// ===== Truco Tutorial =====
function TrucoTutorial({ subTab }: { subTab: TrucoSubTab }) {
  const isMineiro = subTab === 'mineiro'

  const manilhasMineiro = [
    { suit: 'clubs' as const, rank: '4', label: 'ZAP', glow: 'rgba(16,185,129,0.6)' },
    { suit: 'hearts' as const, rank: '7', label: 'COPETA', glow: 'rgba(212,168,48,0.6)' },
    { suit: 'spades' as const, rank: 'A', label: 'ESPADILHA', glow: 'rgba(59,130,246,0.6)' },
    { suit: 'diamonds' as const, rank: '7', label: 'PICA-FUMO', glow: 'rgba(220,38,38,0.6)' },
  ]

  const cardOrder = [
    { suit: 'diamonds' as const, rank: '4' },
    { suit: 'hearts' as const, rank: '5' },
    { suit: 'clubs' as const, rank: '6' },
    { suit: 'spades' as const, rank: '7' },
    { suit: 'hearts' as const, rank: 'Q' },
    { suit: 'clubs' as const, rank: 'J' },
    { suit: 'spades' as const, rank: 'K' },
    { suit: 'hearts' as const, rank: 'A' },
    { suit: 'clubs' as const, rank: '2' },
    { suit: 'spades' as const, rank: '3' },
  ]

  const tips = [
    { icon: <Shield className="w-5 h-5" />, title: 'Guarde suas manilhas', text: 'Use as manilhas em momentos importantes, nao na primeira rodada.' },
    { icon: <Target className="w-5 h-5" />, title: 'Preste atencao nas cartas', text: 'Memorize as cartas ja jogadas para calcular probabilidades.' },
    { icon: <Swords className="w-5 h-5" />, title: 'Comunique-se com seu parceiro', text: 'Os pedidos de Truco sao uma forma de comunicacao.' },
    { icon: <Hand className="w-5 h-5" />, title: 'Na Mao de Ferro, confie', text: 'Jogue com confianca na Mao de Ferro - e tudo ou nada!' },
    { icon: <Lightbulb className="w-5 h-5" />, title: 'Blefe ocasionalmente', text: 'Um blefe bem colocado pode confundir os adversarios.' },
  ]

  return (
    <div className="space-y-10">
      {/* Section 1: Objetivo */}
      <section>
        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <h3 className="font-display text-xl font-bold text-gold mb-3 flex items-center gap-2">
            <Target className="w-6 h-6" /> Objetivo do Jogo
          </h3>
          <p className="text-text-primary text-sm md:text-base leading-relaxed mb-4">
            Truco e um jogo de cartas jogado em duas duplas. O objetivo e fazer 12 pontos antes da dupla adversaria.
            Cada &quot;mao&quot; vale {isMineiro ? '2' : '1'} ponto inicialmente, mas pode valer mais se alguem pedir Truco!
          </p>
        </motion.div>

        <div className="bg-bg-card rounded-xl-game p-4 md:p-6 flex flex-col md:flex-row items-center gap-4 justify-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-team-blue/20 border-2 border-team-blue flex items-center justify-center text-team-blue font-bold text-sm">NOS</div>
            <span className="text-text-secondary text-sm">0</span>
          </div>
          <span className="text-text-secondary font-bold">vs</span>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-team-red/20 border-2 border-team-red flex items-center justify-center text-team-red font-bold text-sm">ELES</div>
            <span className="text-text-secondary text-sm">0</span>
          </div>
          <span className="text-text-secondary text-xs ml-2">Primeiro a 12 vence!</span>
        </div>
      </section>

      {/* Section 2: Manilhas */}
      <section>
        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <h3 className="font-display text-xl font-bold text-gold mb-3 flex items-center gap-2">
            <Crown className="w-6 h-6" /> {isMineiro ? 'As Manilhas (Fixas)' : 'As Manilhas (Variaveis)'}
          </h3>
          <p className="text-text-primary text-sm md:text-base leading-relaxed mb-4">
            {isMineiro
              ? 'No Truco Mineiro, as manilhas sao fixas e sempre na mesma ordem:'
              : 'No Truco Paulista, a manilha muda a cada rodada baseada no vira:'}
          </p>
        </motion.div>

        {isMineiro ? (
          <div className="flex flex-wrap justify-center gap-6 md:gap-8 py-4">
            {manilhasMineiro.map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
              >
                <TutorialCard suit={m.suit} rank={m.rank} glow={m.glow} label={m.label} large />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-bg-card rounded-xl-game p-4 md:p-6">
            <p className="text-text-primary text-sm mb-4">
              A carta &quot;vira&quot; e a ultima carta do baralho. A manilha e a proxima carta na sequencia:
              4 → 5 → 6 → 7 → Q → J → K → A → 2 → 3
            </p>
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="text-center">
                <TutorialCard suit="hearts" rank="7" />
                <p className="text-text-secondary text-xs mt-2">Vira (7♥)</p>
              </div>
              <ChevronRight className="w-8 h-8 text-gold" />
              <div className="text-center">
                <TutorialCard suit="diamonds" rank="Q" glow="rgba(212,168,48,0.6)" />
                <p className="text-gold text-xs mt-2 font-bold">Manilha (Q)</p>
              </div>
            </div>
            <p className="text-text-secondary text-xs text-center">
              Ordem dos naipes: ♣ &gt; ♥ &gt; ♠ &gt; ♦
            </p>
          </div>
        )}
      </section>

      {/* Section 3: Card Hierarchy */}
      <section>
        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <h3 className="font-display text-xl font-bold text-gold mb-3 flex items-center gap-2">
            <BookOpen className="w-6 h-6" /> Ordem das Cartas
          </h3>
          <p className="text-text-primary text-sm md:text-base leading-relaxed mb-4">
            Das mais fracas para as mais fortes (exceto manilhas):
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-1 md:gap-2 py-4">
          {cardOrder.map((c, i) => (
            <motion.div
              key={`${c.rank}-${c.suit}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <TutorialCard suit={c.suit} rank={c.rank} />
              <p className="text-center text-text-secondary text-[10px] mt-1">{i + 1}</p>
            </motion.div>
          ))}
        </div>
        <p className="text-gold text-sm text-center font-semibold mt-2">3 e a carta mais forte (exceto manilhas)</p>
      </section>

      {/* Section 4: How to Play */}
      <section>
        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <h3 className="font-display text-xl font-bold text-gold mb-3 flex items-center gap-2">
            <Play className="w-6 h-6" /> Jogando uma Mao
          </h3>
        </motion.div>

        <div className="space-y-4">
          {[
            { step: '1', title: 'Distribuicao', desc: 'Cada jogador recebe 3 cartas.' },
            { step: '2', title: 'Primeira Rodada', desc: 'O jogador a direita do baralheiro comeca. Jogue sua carta mais forte se quiser vencer!' },
            { step: '3', title: 'Segunda Rodada', desc: 'Quem ganhou a primeira rodada joga primeiro na segunda. Voce pode jogar uma carta coberta!' },
            { step: '4', title: 'Terceira Rodada', desc: 'Se necessario, a terceira rodada decide a mao.' },
            { step: '5', title: 'Pontuacao', desc: `Quem ganhar 2 das 3 rodadas ganha a mao e marca ${isMineiro ? '2' : '1'} ponto(s).` },
          ].map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, x: -15 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex gap-4 bg-bg-card rounded-md-game p-4"
            >
              <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                <span className="text-gold font-bold text-sm">{s.step}</span>
              </div>
              <div>
                <h4 className="text-text-primary font-semibold text-sm">{s.title}</h4>
                <p className="text-text-secondary text-sm mt-0.5">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Section 5: Truco Escalation */}
      <section>
        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <h3 className="font-display text-xl font-bold text-gold mb-3 flex items-center gap-2">
            <Swords className="w-6 h-6" /> O Truco!
          </h3>
          <p className="text-text-primary text-sm md:text-base leading-relaxed mb-4">
            Antes de jogar uma carta, voce pode pedir Truco para aumentar o valor da mao. A mao pode valer ate 12 pontos!
          </p>
        </motion.div>

        <div className="bg-bg-card rounded-xl-game p-4 md:p-6 mb-4">
          <p className="text-text-secondary text-sm mb-3 text-center">{isMineiro ? 'Escalada (Mineiro):' : 'Escalada (Paulista):'}</p>
          <EscalationLadder
            steps={isMineiro
              ? [{ value: '2', label: 'normal' }, { value: '4', label: 'Truco' }, { value: '6', label: '' }, { value: '10', label: '' }, { value: '12', label: 'max' }]
              : [{ value: '1', label: 'normal' }, { value: '3', label: 'Truco' }, { value: '6', label: '' }, { value: '9', label: '' }, { value: '12', label: 'max' }]
            }
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: 'Aceitar', desc: 'Continua para a pontuacao maior', color: 'text-emerald-400 border-emerald-500/40' },
            { label: isMineiro ? 'Pedir 6' : 'Pedir 6', desc: 'Aumenta ainda mais', color: 'text-gold border-gold/40' },
            { label: 'Correr', desc: 'O adversario ganha os pontos', color: 'text-ruby border-ruby/40' },
          ].map((opt) => (
            <div key={opt.label} className={`bg-bg-card rounded-md-game p-4 border ${opt.color}`}>
              <h4 className={`font-semibold text-sm ${opt.color.split(' ')[0]}`}>{opt.label}</h4>
              <p className="text-text-secondary text-xs mt-1">{opt.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Section 6: Mao de 10/11 & Mao de Ferro */}
      <section>
        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <h3 className="font-display text-xl font-bold text-gold mb-3 flex items-center gap-2">
            <Trophy className="w-6 h-6" /> Momentos Especiais
          </h3>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-bg-card rounded-xl-game p-4 border border-gold/30">
            <h4 className="text-gold font-semibold text-sm mb-2">{isMineiro ? 'Mao de 10' : 'Mao de 11'}</h4>
            <p className="text-text-primary text-sm mb-2">
              Quando uma dupla chega a {isMineiro ? '10' : '11'} pontos:
            </p>
            <ul className="text-text-secondary text-xs space-y-1">
              <li className="flex items-start gap-2">
                <Check className="w-3 h-3 text-gold mt-0.5 flex-shrink-0" />
                Voce pode ver as cartas do seu parceiro!
              </li>
              <li className="flex items-start gap-2">
                <X className="w-3 h-3 text-ruby mt-0.5 flex-shrink-0" />
                Nao pode pedir Truco nesta mao.
              </li>
            </ul>
          </div>

          <div className="bg-bg-card rounded-xl-game p-4 border border-ruby/30">
            <h4 className="text-ruby font-semibold text-sm mb-2">Mao de Ferro</h4>
            <p className="text-text-primary text-sm mb-2">
              Se ambas as duplas estao em {isMineiro ? '10' : '11'} pontos:
            </p>
            <ul className="text-text-secondary text-xs space-y-1">
              <li className="flex items-start gap-2">
                <AlertTriangle className="w-3 h-3 text-ruby mt-0.5 flex-shrink-0" />
                Todos jogam as cartas COBERTAS!
              </li>
              <li className="flex items-start gap-2">
                <Crown className="w-3 h-3 text-gold mt-0.5 flex-shrink-0" />
                Quem ganhar esta mao, ganha o jogo!
              </li>
            </ul>
            <div className="flex justify-center gap-2 mt-3">
              <MiniCardBack />
              <MiniCardBack />
              <MiniCardBack />
            </div>
          </div>
        </div>
      </section>

      {/* Section 7: Tips */}
      <section>
        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <h3 className="font-display text-xl font-bold text-gold mb-3 flex items-center gap-2">
            <Lightbulb className="w-6 h-6" /> Dicas de Estrategia
          </h3>
        </motion.div>

        <div className="space-y-3">
          {tips.map((tip, i) => (
            <motion.div
              key={tip.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex gap-3 bg-bg-card rounded-md-game p-4"
            >
              <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold flex-shrink-0">
                {tip.icon}
              </div>
              <div>
                <h4 className="text-text-primary font-semibold text-sm">{tip.title}</h4>
                <p className="text-text-secondary text-xs mt-0.5">{tip.text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
}

// ===== Poker Tutorial =====
function PokerTutorial() {
  const handRankings = [
    { name: 'Royal Flush', desc: 'A melhor mao possivel!', cards: [{ s: 'spades' as const, r: 'A' }, { s: 'spades' as const, r: 'K' }, { s: 'spades' as const, r: 'Q' }, { s: 'spades' as const, r: 'J' }, { s: 'spades' as const, r: '10' }], gold: true },
    { name: 'Straight Flush', desc: '5 cartas seguidas do mesmo naipe', cards: [{ s: 'hearts' as const, r: '8' }, { s: 'hearts' as const, r: '9' }, { s: 'hearts' as const, r: '10' }, { s: 'hearts' as const, r: 'J' }, { s: 'hearts' as const, r: 'Q' }] },
    { name: 'Quadra', desc: '4 cartas iguais', cards: [{ s: 'clubs' as const, r: 'K' }, { s: 'diamonds' as const, r: 'K' }, { s: 'hearts' as const, r: 'K' }, { s: 'spades' as const, r: 'K' }, { s: 'clubs' as const, r: '5' }] },
    { name: 'Full House', desc: 'Trinca + Par', cards: [{ s: 'hearts' as const, r: 'J' }, { s: 'diamonds' as const, r: 'J' }, { s: 'spades' as const, r: 'J' }, { s: 'clubs' as const, r: '8' }, { s: 'hearts' as const, r: '8' }] },
    { name: 'Flush', desc: '5 cartas do mesmo naipe', cards: [{ s: 'diamonds' as const, r: 'A' }, { s: 'diamonds' as const, r: '10' }, { s: 'diamonds' as const, r: '7' }, { s: 'diamonds' as const, r: '4' }, { s: 'diamonds' as const, r: '2' }] },
    { name: 'Sequencia (Straight)', desc: '5 cartas em sequencia', cards: [{ s: 'spades' as const, r: '5' }, { s: 'hearts' as const, r: '6' }, { s: 'diamonds' as const, r: '7' }, { s: 'clubs' as const, r: '8' }, { s: 'spades' as const, r: '9' }] },
    { name: 'Trinca', desc: '3 cartas iguais', cards: [{ s: 'hearts' as const, r: 'Q' }, { s: 'diamonds' as const, r: 'Q' }, { s: 'spades' as const, r: 'Q' }, { s: 'clubs' as const, r: '4' }, { s: 'diamonds' as const, r: '9' }] },
    { name: 'Dois Pares', desc: '2 pares diferentes', cards: [{ s: 'clubs' as const, r: 'A' }, { s: 'hearts' as const, r: 'A' }, { s: 'diamonds' as const, r: '7' }, { s: 'spades' as const, r: '7' }, { s: 'clubs' as const, r: '2' }] },
    { name: 'Par', desc: '2 cartas iguais', cards: [{ s: 'spades' as const, r: 'K' }, { s: 'hearts' as const, r: 'K' }, { s: 'diamonds' as const, r: '9' }, { s: 'clubs' as const, r: '5' }, { s: 'hearts' as const, r: '3' }] },
    { name: 'Carta Alta', desc: 'Nenhuma combinacao', cards: [{ s: 'diamonds' as const, r: 'A' }, { s: 'spades' as const, r: 'J' }, { s: 'clubs' as const, r: '8' }, { s: 'hearts' as const, r: '5' }, { s: 'diamonds' as const, r: '2' }] },
  ]

  const pokerTips = [
    { icon: <Hand className="w-5 h-5" />, title: 'Seja seletivo', text: 'Nao jogue todas as maos. Espere cartas boas para entrar.' },
    { icon: <Eye className="w-5 h-5" />, title: 'Leia os oponentes', text: 'Observe os padroes de aposta dos adversarios.' },
    { icon: <Shield className="w-5 h-5" />, title: 'Blefe com moderacao', text: 'Nao blefe demais no inicio. Construa sua imagem primeiro.' },
    { icon: <Target className="w-5 h-5" />, title: 'Gerencie suas fichas', text: 'Nao aposte tudo em uma mao so. Controle seu bankroll.' },
    { icon: <Star className="w-5 h-5" />, title: 'Posicao importa', text: 'Jogar por ultimo e uma vantagem enorme. Aproveite!' },
  ]

  const actions = [
    { name: 'Check', desc: 'Passar a vez sem apostar', color: 'text-emerald-400 border-emerald-500/40', icon: <Hand className="w-6 h-6" /> },
    { name: 'Bet', desc: 'Apostar fichas', color: 'text-gold border-gold/40', icon: <Diamond className="w-6 h-6" /> },
    { name: 'Call', desc: 'Igualar a aposta atual', color: 'text-team-blue border-team-blue/40', icon: <ChevronRight className="w-6 h-6" /> },
    { name: 'Raise', desc: 'Aumentar a aposta', color: 'text-orange-400 border-orange-500/40', icon: <TrendingUp className="w-6 h-6" /> },
    { name: 'Fold', desc: 'Desistir da mao', color: 'text-ruby border-ruby/40', icon: <X className="w-6 h-6" /> },
  ]

  return (
    <div className="space-y-10">
      {/* Objective */}
      <section>
        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <h3 className="font-display text-xl font-bold text-gold mb-3 flex items-center gap-2">
            <Target className="w-6 h-6" /> Objetivo do Poker
          </h3>
          <p className="text-text-primary text-sm md:text-base leading-relaxed">
            O objetivo e ganhar fichas formando a melhor mao de 5 cartas ou fazendo os outros desistirem.
          </p>
        </motion.div>
      </section>

      {/* Hand Rankings */}
      <section>
        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <h3 className="font-display text-xl font-bold text-gold mb-3 flex items-center gap-2">
            <Crown className="w-6 h-6" /> Ordem das Maos
          </h3>
        </motion.div>

        <div className="space-y-2">
          {handRankings.map((hand, i) => (
            <motion.div
              key={hand.name}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ scale: 1.01, backgroundColor: 'rgba(28, 37, 64, 0.8)' }}
              className={`flex flex-col sm:flex-row sm:items-center gap-3 bg-bg-card rounded-md-game p-3 border ${hand.gold ? 'border-gold/50' : 'border-transparent'}`}
            >
              <div className="flex items-center gap-1 flex-shrink-0">
                {hand.cards.map((c, j) => (
                  <div key={j} className={`w-8 h-11 bg-white rounded-sm shadow-card flex flex-col items-center justify-center ${c.s === 'hearts' || c.s === 'diamonds' ? 'text-ruby' : 'text-suit-clubs'}`}>
                    <span className="text-[10px] font-bold">{c.r}</span>
                    {c.s === 'clubs' ? <Club className="w-2.5 h-2.5" /> : c.s === 'hearts' ? <Heart className="w-2.5 h-2.5" /> : c.s === 'spades' ? <Spade className="w-2.5 h-2.5" /> : <Diamond className="w-2.5 h-2.5" />}
                  </div>
                ))}
              </div>
              <div className="flex-1">
                <h4 className={`font-semibold text-sm ${hand.gold ? 'text-gold' : 'text-text-primary'}`}>{hand.name}</h4>
                <p className="text-text-secondary text-xs">{hand.desc}</p>
              </div>
              <span className="text-text-secondary text-xs font-mono hidden lg:block">#{i + 1}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Betting Rounds */}
      <section>
        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <h3 className="font-display text-xl font-bold text-gold mb-3 flex items-center gap-2">
            <BookOpen className="w-6 h-6" /> As 4 Rodadas
          </h3>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { phase: 'Pre-Flop', desc: 'Cada jogador recebe 2 cartas fechadas', num: '2' },
            { phase: 'Flop', desc: '3 cartas comunitarias sao reveladas', num: '3' },
            { phase: 'Turn', desc: 'A 4a carta comunitaria e revelada', num: '4' },
            { phase: 'River', desc: 'A 5a e ultima carta comunitaria', num: '5' },
          ].map((round, i) => (
            <motion.div
              key={round.phase}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-bg-card rounded-xl-game p-4 text-center border border-border-subtle"
            >
              <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-2">
                <span className="text-gold font-bold">{round.num}</span>
              </div>
              <h4 className="text-text-primary font-semibold text-sm mb-1">{round.phase}</h4>
              <p className="text-text-secondary text-xs">{round.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Actions */}
      <section>
        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <h3 className="font-display text-xl font-bold text-gold mb-3 flex items-center gap-2">
            <Swords className="w-6 h-6" /> O que voce pode fazer
          </h3>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {actions.map((action) => (
            <motion.div
              key={action.name}
              whileHover={{ y: -4 }}
              className={`bg-bg-card rounded-xl-game p-4 text-center border ${action.color.split(' ')[1]}`}
            >
              <div className={`mx-auto mb-2 ${action.color.split(' ')[0]}`}>{action.icon}</div>
              <h4 className={`font-semibold text-sm ${action.color.split(' ')[0]}`}>{action.name}</h4>
              <p className="text-text-secondary text-xs mt-1">{action.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Blinds */}
      <section>
        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <h3 className="font-display text-xl font-bold text-gold mb-3 flex items-center gap-2">
            <Coins className="w-6 h-6" /> Os Blinds
          </h3>
        </motion.div>

        <div className="bg-bg-card rounded-xl-game p-4 md:p-6">
          <p className="text-text-primary text-sm mb-4">
            Dois jogadores apostam forcadas a cada mao:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-team-blue/20 border-2 border-team-blue flex items-center justify-center text-team-blue font-bold text-xs">
                SB
              </div>
              <div>
                <h4 className="text-text-primary font-semibold text-sm">Small Blind</h4>
                <p className="text-text-secondary text-xs">Metade da aposta minima</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-team-red/20 border-2 border-team-red flex items-center justify-center text-team-red font-bold text-xs">
                BB
              </div>
              <div>
                <h4 className="text-text-primary font-semibold text-sm">Big Blind</h4>
                <p className="text-text-secondary text-xs">Aposta minima completa</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Poker Tips */}
      <section>
        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <h3 className="font-display text-xl font-bold text-gold mb-3 flex items-center gap-2">
            <Lightbulb className="w-6 h-6" /> Dicas para Iniciantes
          </h3>
        </motion.div>

        <div className="space-y-3">
          {pokerTips.map((tip, i) => (
            <motion.div
              key={tip.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex gap-3 bg-bg-card rounded-md-game p-4"
            >
              <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold flex-shrink-0">
                {tip.icon}
              </div>
              <div>
                <h4 className="text-text-primary font-semibold text-sm">{tip.title}</h4>
                <p className="text-text-secondary text-xs mt-0.5">{tip.text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
}

// ===== Main Tutorial Page =====
export default function Tutorial() {
  const [mainTab, setMainTab] = useState<MainTab>('truco')
  const [trucoSubTab, setTrucoSubTab] = useState<TrucoSubTab>('mineiro')
  const navigate = useNavigate()

  return (
    <div className="min-h-[100dvh] bg-bg-dark pb-8">
      {/* Header */}
      <div className="h-14 game-panel border-b border-border-subtle flex items-center px-4 sticky top-0 z-30">
        <button onClick={() => navigate('/')} className="w-8 h-8 rounded-full bg-bg-card hover:bg-bg-card-hover flex items-center justify-center transition-colors mr-4">
          <ArrowLeft className="w-4 h-4 text-text-secondary" />
        </button>
        <h1 className="font-display text-lg font-bold text-text-primary">Como Jogar</h1>
      </div>

      <div className="max-w-[800px] mx-auto px-4 py-6">
        {/* Main Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setMainTab('truco')}
            className={`flex-1 py-3 rounded-md-game text-sm font-semibold transition-all ${mainTab === 'truco' ? 'bg-gold text-bg-dark' : 'bg-bg-card text-text-secondary border border-border-subtle'}`}
          >
            Truco
          </button>
          <button
            onClick={() => setMainTab('poker')}
            className={`flex-1 py-3 rounded-md-game text-sm font-semibold transition-all ${mainTab === 'poker' ? 'bg-gold text-bg-dark' : 'bg-bg-card text-text-secondary border border-border-subtle'}`}
          >
            Poker
          </button>
        </div>

        {/* Truco Sub-Tabs */}
        {mainTab === 'truco' && (
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setTrucoSubTab('mineiro')}
              className={`px-4 py-2 rounded-md-game text-sm font-medium transition-all ${trucoSubTab === 'mineiro' ? 'bg-gold/20 text-gold border border-gold/50' : 'bg-bg-card text-text-secondary border border-border-subtle'}`}
            >
              Mineiro
            </button>
            <button
              onClick={() => setTrucoSubTab('paulista')}
              className={`px-4 py-2 rounded-md-game text-sm font-medium transition-all ${trucoSubTab === 'paulista' ? 'bg-gold/20 text-gold border border-gold/50' : 'bg-bg-card text-text-secondary border border-border-subtle'}`}
            >
              Paulista
            </button>
          </div>
        )}

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${mainTab}-${trucoSubTab}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {mainTab === 'truco' ? <TrucoTutorial subTab={trucoSubTab} /> : <PokerTutorial />}
          </motion.div>
        </AnimatePresence>

        {/* Practice CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 text-center bg-bg-card rounded-xl-game p-6 border border-gold/30"
        >
          <h3 className="font-display text-lg font-bold text-gold mb-2">Pronto para praticar?</h3>
          <p className="text-text-secondary text-sm mb-4">Jogue contra bots para treinar sem risco!</p>
          <button onClick={() => navigate('/lobby')} className="btn-gold">
            <Bot className="w-4 h-4" /> Jogar vs Bots
          </button>
        </motion.div>
      </div>
    </div>
  )
}

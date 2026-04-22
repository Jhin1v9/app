// ===== PokerTable Component =====
// Oval casino table with players, community cards, pot

import { memo } from 'react'
import type { PokerGameState } from '@/engine/pokerEngine'
import PlayerSeat from './PlayerSeat'
import CommunityCards from './CommunityCards'
import PotDisplay from './PotDisplay'

interface PokerTableProps {
  gameState: PokerGameState
  showdownRevealed: boolean
}

/**
 * Get player position on the oval table based on player count and index
 * Returns CSS position values
 */
function getPlayerPosition(
  playerIndex: number,
  totalPlayers: number,
  humanIndex: number,
): {
  position: 'bottom' | 'top' | 'left' | 'right' | 'topLeft' | 'topRight'
  style: React.CSSProperties
} {
  // Human is always at bottom center
  // Others are arranged around the oval
  const positions: Record<number, Array<{ position: 'bottom' | 'top' | 'left' | 'right' | 'topLeft' | 'topRight'; style: React.CSSProperties }>> = {
    2: [
      { position: 'bottom', style: { bottom: '5%', left: '50%', transform: 'translateX(-50%)' } },
      { position: 'top', style: { top: '5%', left: '50%', transform: 'translateX(-50%)' } },
    ],
    3: [
      { position: 'bottom', style: { bottom: '5%', left: '50%', transform: 'translateX(-50%)' } },
      { position: 'topLeft', style: { top: '15%', left: '8%' } },
      { position: 'topRight', style: { top: '15%', right: '8%' } },
    ],
    4: [
      { position: 'bottom', style: { bottom: '5%', left: '50%', transform: 'translateX(-50%)' } },
      { position: 'left', style: { top: '50%', left: '3%', transform: 'translateY(-50%)' } },
      { position: 'top', style: { top: '5%', left: '50%', transform: 'translateX(-50%)' } },
      { position: 'right', style: { top: '50%', right: '3%', transform: 'translateY(-50%)' } },
    ],
    5: [
      { position: 'bottom', style: { bottom: '5%', left: '50%', transform: 'translateX(-50%)' } },
      { position: 'left', style: { top: '45%', left: '3%' } },
      { position: 'topLeft', style: { top: '12%', left: '15%' } },
      { position: 'topRight', style: { top: '12%', right: '15%' } },
      { position: 'right', style: { top: '45%', right: '3%' } },
    ],
    6: [
      { position: 'bottom', style: { bottom: '5%', left: '50%', transform: 'translateX(-50%)' } },
      { position: 'left', style: { top: '50%', left: '3%', transform: 'translateY(-50%)' } },
      { position: 'topLeft', style: { top: '10%', left: '12%' } },
      { position: 'top', style: { top: '5%', left: '50%', transform: 'translateX(-50%)' } },
      { position: 'topRight', style: { top: '10%', right: '12%' } },
      { position: 'right', style: { top: '50%', right: '3%', transform: 'translateY(-50%)' } },
    ],
  }

  // Map player index to position around the table
  // Player 0 (human) is always at position 0 (bottom)
  // Other players fill in clockwise order
  const layout = positions[totalPlayers] || positions[6]!

  // Find where this player sits in the visual layout
  // Human is always index 0 in the layout
  if (playerIndex === humanIndex) {
    return layout[0]!
  }

  // Other players: arrange clockwise starting from human's left
  const nonHumanPlayers = Array.from({ length: totalPlayers }, (_, i) => i)
    .filter(i => i !== humanIndex)

  const playerLayoutIndex = nonHumanPlayers.indexOf(playerIndex)
  const layoutIndex = playerLayoutIndex + 1

  if (layoutIndex < layout.length) {
    return layout[layoutIndex]!
  }

  // Fallback
  return { position: 'top', style: { top: '10%', left: '50%', transform: 'translateX(-50%)' } }
}

function PokerTableComponent({ gameState, showdownRevealed }: PokerTableProps) {
  const { players, communityCards, pot, phase, activePlayerIndex } = gameState
  const activePlayers = players.filter(p => p.status !== 'ELIMINATED')
  const humanIndex = players.findIndex(p => p.isHuman)

  return (
    <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] lg:aspect-[2/1] max-h-[70vh]">
      {/* Table surface */}
      <div
        className="absolute inset-0 rounded-[50%] sm:rounded-[45%] shadow-2xl"
        style={{
          background: 'radial-gradient(ellipse at center, #1A5C42 0%, #0B3D2E 50%, #072A1F 100%)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.8), inset 0 0 60px rgba(0,0,0,0.3), 0 0 0 8px #2D1B00, 0 0 0 9px #D4A83040',
        }}
      >
        {/* Inner felt texture pattern */}
        <div
          className="absolute inset-4 sm:inset-8 rounded-[48%] sm:rounded-[42%] opacity-10"
          style={{
            backgroundImage: `
              repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.03) 10px, rgba(255,255,255,0.03) 20px),
              repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(255,255,255,0.03) 10px, rgba(255,255,255,0.03) 20px)
            `,
          }}
        />

        {/* Center area - community cards + pot */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 sm:gap-3 z-20">
          <CommunityCards
            cards={communityCards}
            phase={phase}
            highlighted={phase === 'SHOWDOWN' || phase === 'HAND_END'}
          />
          <PotDisplay
            mainPot={pot.mainPot}
            sidePots={pot.sidePots}
            currentBet={pot.currentBet}
          />
        </div>

        {/* Phase indicator */}
        <div className="absolute top-[12%] left-1/2 -translate-x-1/2 z-20">
          <span className="text-[10px] sm:text-xs text-text-secondary/60 uppercase tracking-widest font-medium bg-black/30 px-2 py-1 rounded-full">
            {getPhaseLabel(phase)}
          </span>
        </div>

        {/* Hand number */}
        {gameState.handNumber > 0 && (
          <div className="absolute top-[12%] right-[15%] z-20">
            <span className="text-[9px] sm:text-[10px] text-text-secondary/40 font-mono-game">
              #{gameState.handNumber}
            </span>
          </div>
        )}
      </div>

      {/* Player seats positioned around the table */}
      {activePlayers.map((player) => {
        const playerGlobalIndex = players.findIndex(p => p.id === player.id)
        const { position, style } = getPlayerPosition(
          playerGlobalIndex,
          players.length,
          humanIndex,
        )
        const isActive = playerGlobalIndex === activePlayerIndex && phase !== 'HAND_END'

        return (
          <div
            key={player.id}
            className="absolute z-30"
            style={style}
          >
            <PlayerSeat
              player={player}
              isActive={isActive}
              showdownRevealed={showdownRevealed}
              position={position}
            />
          </div>
        )
      })}
    </div>
  )
}

function getPhaseLabel(phase: string): string {
  const labels: Record<string, string> = {
    WAITING: 'Aguardando',
    DEALING: 'Distribuindo',
    PRE_FLOP: 'Pre-Flop',
    FLOP: 'Flop',
    TURN: 'Turn',
    RIVER: 'River',
    SHOWDOWN: 'Showdown',
    HAND_END: 'Fim da Mao',
  }
  return labels[phase] || phase
}

export default memo(PokerTableComponent)

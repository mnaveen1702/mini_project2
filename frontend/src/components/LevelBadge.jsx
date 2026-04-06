import React from 'react'

export const LEVELS = [
  { min: 0,     max: 99,       rank: 'CIVILIAN',   emoji: '👤', color: '#64748b', bg: 'rgba(100,116,139,0.15)' },
  { min: 100,   max: 299,      rank: 'APPRENTICE', emoji: '🥷', color: '#38bdf8', bg: 'rgba(56,189,248,0.15)' },
  { min: 300,   max: 699,      rank: 'OPERATIVE',  emoji: '🗡️', color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
  { min: 700,   max: 1499,     rank: 'ENFORCER',   emoji: '⚔️', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  { min: 1500,  max: 2999,     rank: 'VILLAIN',    emoji: '💀', color: '#f43f5e', bg: 'rgba(244,63,94,0.15)' },
  { min: 3000,  max: 9999,     rank: 'OVERLORD',   emoji: '👑', color: '#a855f7', bg: 'rgba(168,85,247,0.15)' },
  { min: 10000, max: Infinity, rank: 'LEGEND',     emoji: '🔱', color: '#fbbf24', bg: 'rgba(251,191,36,0.2)' },
]

export function getLevel(xp) {
  return LEVELS.find(l => xp >= l.min && xp <= l.max) || LEVELS[0]
}

export default function LevelBadge({ xp, showBar = false, large = false }) {
  const lvl  = getLevel(xp)
  const idx  = LEVELS.indexOf(lvl)
  const next = LEVELS[idx + 1]
  const pct  = next ? Math.round(((xp - lvl.min) / (next.min - lvl.min)) * 100) : 100

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <div style={{
        ...styles.badge,
        color: lvl.color, background: lvl.bg,
        border: `1px solid ${lvl.color}50`,
        fontSize: large ? '0.8rem' : '0.62rem',
        padding: large ? '5px 14px' : '3px 9px',
      }}>
        {lvl.emoji} {lvl.rank}
      </div>
      {showBar && next && (
        <div style={styles.barWrap}>
          <div style={styles.barTrack}>
            <div style={{ ...styles.barFill, width: `${pct}%`, background: lvl.color }} />
          </div>
          <span style={{ ...styles.nextTxt, color: lvl.color }}>{next.rank} {pct}%</span>
        </div>
      )}
    </div>
  )
}

const styles = {
  badge: {
    display: 'inline-flex', alignItems: 'center', gap: '5px',
    fontFamily: 'var(--font-mono)', fontWeight: 700,
    letterSpacing: '0.12em', borderRadius: '4px',
    userSelect: 'none', whiteSpace: 'nowrap',
  },
  barWrap: { display: 'flex', alignItems: 'center', gap: '6px' },
  barTrack: { flex: 1, height: '3px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: '2px', transition: 'width 0.6s ease' },
  nextTxt: { fontFamily: 'var(--font-mono)', fontSize: '0.55rem', whiteSpace: 'nowrap', letterSpacing: '0.08em' },
}

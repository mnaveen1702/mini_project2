import React from 'react'
import LevelBadge from './LevelBadge'

export default function Navbar({ user, xp, theme, onToggleTheme, onLogout, onReset, onLeaderboard, activeView }) {
  return (
    <nav style={styles.nav}>
      {/* Left: Logo */}
      <div style={styles.left}>
        <span style={styles.bolt}>⚡</span>
        <span style={styles.brand} className={activeView === 'dashboard' ? 'glow-text' : ''}>VILTR</span>
        <span style={styles.v}>v2</span>
      </div>

      {/* Center: Level */}
      <div style={styles.center}>
        <LevelBadge xp={xp} showBar />
      </div>

      {/* Right: Actions */}
      <div style={styles.right}>
        <div style={styles.userPill}>
          <span style={styles.userDot} />
          {user.username}
        </div>

        <NavBtn onClick={onLeaderboard} title="Leaderboard">🏆</NavBtn>
        <NavBtn onClick={onToggleTheme} title="Toggle theme">{theme === 'dark' ? '☀️' : '🌙'}</NavBtn>
        <NavBtn onClick={onReset}       title="Reconfigure habits">⚙️</NavBtn>

        <button style={styles.logoutBtn} onClick={onLogout}>
          LOGOUT
        </button>
      </div>
    </nav>
  )
}

function NavBtn({ onClick, title, children }) {
  return (
    <button style={styles.iconBtn} onClick={onClick} title={title}>
      {children}
    </button>
  )
}

const styles = {
  nav: {
    height: '50px', minHeight: '50px',
    background: 'var(--card)', borderBottom: '1px solid var(--border)',
    display: 'flex', alignItems: 'center',
    padding: '0 18px', gap: '12px', flexShrink: 0, zIndex: 10, position: 'relative',
  },
  left:  { display: 'flex', alignItems: 'center', gap: '8px', minWidth: '120px' },
  bolt:  { fontSize: '1.1rem' },
  brand: { fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--accent)', letterSpacing: '0.2em', lineHeight: 1 },
  v:     { fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--text3)', marginTop: '6px', letterSpacing: '0.1em' },
  center:{ flex: 1, display: 'flex', justifyContent: 'center' },
  right: { display: 'flex', alignItems: 'center', gap: '8px', minWidth: '120px', justifyContent: 'flex-end' },
  userPill: {
    display: 'flex', alignItems: 'center', gap: '6px',
    fontFamily: 'var(--font-mono)', fontSize: '0.68rem',
    color: 'var(--text2)', background: 'var(--bg2)',
    border: '1px solid var(--border)', padding: '3px 10px',
    borderRadius: '20px', letterSpacing: '0.08em',
  },
  userDot: {
    width: '6px', height: '6px', borderRadius: '50%',
    background: 'var(--green)', boxShadow: '0 0 6px var(--green)',
    flexShrink: 0,
  },
  iconBtn: {
    background: 'var(--bg2)', border: '1px solid var(--border)',
    borderRadius: '6px', padding: '5px 8px', cursor: 'pointer',
    fontSize: '0.9rem', transition: 'var(--transition)',
    color: 'var(--text2)', lineHeight: 1,
  },
  logoutBtn: {
    background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.3)',
    color: 'var(--red)', padding: '5px 12px', borderRadius: '6px',
    cursor: 'pointer', fontFamily: 'var(--font-mono)',
    fontSize: '0.62rem', letterSpacing: '0.12em', transition: 'var(--transition)',
  },
}

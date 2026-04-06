import React, { useState, useEffect, useCallback } from 'react'
import { getHabits } from '../api/api'
import Navbar from '../components/Navbar'
import HabitGrid from '../components/HabitGrid'
import AnalyticsPanel from '../components/AnalyticsPanel'
import Leaderboard from '../components/Leaderboard'
import Toast from '../components/Toast'

export default function Dashboard({ user, onLogout, onReset, theme, onToggleTheme }) {
  const [habits, setHabits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    getHabits(user.id)
      .then(r => setHabits(r.data))
      .catch(() => setError('Cannot reach backend. Is Flask running on port 5000?'))
      .finally(() => setLoading(false))
  }, [user.id])

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now()
    setToasts(p => [...p, { id, message, type }])
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(p => p.filter(t => t.id !== id))
  }, [])

  const handleUpdate = useCallback((habitId, newDays, newNotes) => {
    setHabits(prev => prev.map(h =>
      h.id === habitId
        ? { ...h, ...(newDays  ? { days: newDays }   : {}),
                   ...(newNotes ? { notes: newNotes } : {}) }
        : h
    ))
  }, [])

  const handleDelete = useCallback((habitId) => {
    setHabits(prev => prev.filter(h => h.id !== habitId))
  }, [])

  const totalXP = habits.reduce((s, h) => s + h.days.filter(Boolean).length * 10, 0)

  if (loading) return (
    <div style={styles.center}>
      <span style={styles.loadText}>LOADING REGIME...</span>
      <div style={styles.loadBar}><div style={styles.loadFill} /></div>
    </div>
  )

  if (error) return (
    <div style={styles.center}>
      <div style={{ color: 'var(--red)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', textAlign: 'center' }}>{error}</div>
      <button style={styles.retryBtn} onClick={() => window.location.reload()}>RETRY</button>
    </div>
  )

  return (
    <div style={styles.wrapper}>
      <div className="grid-bg" />

      <Navbar
        user={user} xp={totalXP} theme={theme}
        onToggleTheme={onToggleTheme} onLogout={onLogout}
        onReset={onReset} onLeaderboard={() => setShowLeaderboard(true)}
        activeView="dashboard"
      />

      <div style={styles.body}>
        {/* LEFT 70% — Grid */}
        <div style={styles.left}>
          <div style={styles.panelBar}>
            <span style={styles.panelTitle}>HABIT MATRIX</span>
            <span style={styles.panelSub}>
              {habits.length} habits · {habits[0]?.days?.length || 0}-day challenge · click cell to complete
            </span>
          </div>
          <div style={styles.gridArea}>
            <HabitGrid
              habits={habits}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onToast={addToast}
            />
          </div>
        </div>

        {/* RIGHT 30% — Analytics */}
        <div style={styles.right}>
          <div style={styles.panelBar}>
            <span style={styles.panelTitle}>ANALYTICS</span>
            <span style={styles.panelSub}>LIVE</span>
          </div>
          <div style={styles.analyticsArea}>
            <AnalyticsPanel habits={habits} />
          </div>
        </div>
      </div>

      {showLeaderboard && (
        <Leaderboard onClose={() => setShowLeaderboard(false)} currentUser={user.username} />
      )}

      {/* Toast stack */}
      <div style={styles.toastStack}>
        {toasts.map(t => (
          <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
        ))}
      </div>
    </div>
  )
}

const styles = {
  wrapper: {
    height: '100vh', display: 'flex', flexDirection: 'column',
    background: 'var(--bg)', overflow: 'hidden', position: 'relative',
  },
  body: { flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0, position: 'relative', zIndex: 1 },

  left: {
    flex: '0 0 70%', display: 'flex', flexDirection: 'column',
    borderRight: '1px solid var(--border)', overflow: 'hidden',
  },
  right: {
    flex: '0 0 30%', display: 'flex', flexDirection: 'column', overflow: 'hidden',
  },
  panelBar: {
    height: '38px', minHeight: '38px', flexShrink: 0,
    background: 'var(--card2)', borderBottom: '1px solid var(--border)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 16px',
  },
  panelTitle: { fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.25em', color: 'var(--text2)', fontWeight: 700 },
  panelSub:   { fontFamily: 'var(--font-mono)', fontSize: '0.54rem', letterSpacing: '0.1em', color: 'var(--text3)' },

  gridArea:      { flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '12px', minHeight: 0 },
  analyticsArea: { flex: 1, overflow: 'hidden', padding: '12px', overflowY: 'auto' },

  center: {
    height: '100vh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    background: 'var(--bg)', gap: '16px',
  },
  loadText:  { fontFamily: 'var(--font-mono)', fontSize: '0.75rem', letterSpacing: '0.3em', color: 'var(--accent)' },
  loadBar:   { width: '180px', height: '2px', background: 'var(--border)', borderRadius: '1px', overflow: 'hidden' },
  loadFill:  { height: '100%', width: '50%', background: 'var(--accent)', animation: 'shimmer 1.4s ease-in-out infinite', backgroundSize: '400% 100%' },
  retryBtn:  {
    padding: '10px 24px', background: 'var(--red)', color: '#fff',
    border: 'none', borderRadius: '6px', cursor: 'pointer',
    fontFamily: 'var(--font-mono)', fontSize: '0.72rem', letterSpacing: '0.1em',
  },
  toastStack: { position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '8px' },
}

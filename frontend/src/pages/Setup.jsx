import React, { useState } from 'react'
import { createHabits } from '../api/api'

const PRESETS = [
  { name:'Gym',           icon:'🏋️', desc:'Strength training' },
  { name:'Running',       icon:'🏃', desc:'Cardio & endurance' },
  { name:'Reading',       icon:'📖', desc:'30 mins daily' },
  { name:'Coding',        icon:'💻', desc:'Build something' },
  { name:'Meditation',    icon:'🧘', desc:'Focus & clarity' },
  { name:'Cold Shower',   icon:'🚿', desc:'Mental toughness' },
  { name:'No Social Media',icon:'📵', desc:'Deep work mode' },
  { name:'Sleep 10pm',    icon:'😴', desc:'Recovery first' },
  { name:'Journaling',    icon:'✍️', desc:'Reflect & grow' },
  { name:'Walk 10k Steps',icon:'🚶', desc:'Move every day' },
  { name:'No Junk Food',  icon:'🥗', desc:'Fuel your body' },
  { name:'Drink 3L Water',icon:'💧', desc:'Hydration habit' },
]

const DURATIONS = [
  { d:7,  label:'7 Days',  sub:'Starter' },
  { d:14, label:'14 Days', sub:'Builder' },
  { d:21, label:'21 Days', sub:'Classic' },
  { d:30, label:'30 Days', sub:'Standard' },
  { d:60, label:'60 Days', sub:'Advanced' },
  { d:90, label:'90 Days', sub:'Elite' },
]

export default function Setup({ user, onComplete }) {
  const [selected, setSelected] = useState(['Gym', 'Coding', 'Reading'])
  const [custom, setCustom] = useState('')
  const [customList, setCustomList] = useState([])
  const [duration, setDuration] = useState(30)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const toggle = (name) => setSelected(p =>
    p.includes(name) ? p.filter(h => h !== name) : [...p, name]
  )

  const addCustom = () => {
    const t = custom.trim()
    if (!t) return
    if (selected.includes(t) || customList.includes(t)) { setCustom(''); return }
    setCustomList(p => [...p, t])
    setSelected(p => [...p, t])
    setCustom('')
  }

  const handleStart = async () => {
    if (!selected.length) { setError('Select at least 1 habit'); return }
    setLoading(true); setError('')
    try {
      await createHabits(user.id, selected, duration)
      onComplete()
    } catch (e) {
      setError(e.response?.data?.error || 'Failed — is Flask running on port 5000?')
    } finally { setLoading(false) }
  }

  const xpPotential = selected.length * duration * 10

  return (
    <div style={styles.page}>
      <div className="grid-bg" />
      <div style={styles.container} className="anim-fadeup">

        {/* Header */}
        <div style={styles.header}>
          <div style={styles.step}>STEP 01 / 02</div>
          <h1 style={styles.title}>CONFIGURE YOUR REGIME</h1>
          <p style={styles.sub}>Select habits. The weak choose comfort. You choose dominance.</p>
        </div>

        {/* Preset habits */}
        <div style={styles.card}>
          <div style={styles.cardLabel}>⚡ CHOOSE YOUR BATTLES</div>
          <div style={styles.presetGrid}>
            {PRESETS.map(({ name, icon, desc }) => {
              const active = selected.includes(name)
              return (
                <button key={name} onClick={() => toggle(name)}
                  style={active ? styles.presetOn : styles.presetOff}>
                  <span style={styles.presetIcon}>{icon}</span>
                  <span style={styles.presetName}>{name}</span>
                  <span style={styles.presetDesc}>{desc}</span>
                  {active && <span style={styles.check}>✓</span>}
                </button>
              )
            })}
            {customList.map(name => {
              const active = selected.includes(name)
              return (
                <button key={name} onClick={() => toggle(name)}
                  style={active ? { ...styles.presetOn, borderStyle:'dashed' } : { ...styles.presetOff, borderStyle:'dashed' }}>
                  <span style={styles.presetIcon}>🎯</span>
                  <span style={styles.presetName}>{name}</span>
                  <span style={styles.presetDesc}>Custom</span>
                  {active && <span style={styles.check}>✓</span>}
                </button>
              )
            })}
          </div>
        </div>

        {/* Custom habit */}
        <div style={styles.card}>
          <div style={styles.cardLabel}>➕ ADD CUSTOM HABIT</div>
          <div style={styles.customRow}>
            <input
              style={styles.customInput}
              value={custom}
              onChange={e => setCustom(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addCustom()}
              placeholder="e.g. No Sugar, Stretching, Foreign Language..."
            />
            <button style={styles.addBtn} onClick={addCustom}>ADD</button>
          </div>
        </div>

        {/* Duration */}
        <div style={styles.card}>
          <div style={styles.cardLabel}>📅 CHALLENGE DURATION</div>
          <div style={styles.durGrid}>
            {DURATIONS.map(({ d, label, sub }) => (
              <button key={d} onClick={() => setDuration(d)}
                style={duration === d ? styles.durOn : styles.durOff}>
                <span style={styles.durNum}>{d}</span>
                <span style={styles.durLabel}>{sub}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div style={styles.summary}>
          <div style={styles.summaryItem}>
            <span style={styles.summaryVal}>{selected.length}</span>
            <span style={styles.summaryKey}>HABITS</span>
          </div>
          <span style={styles.summaryX}>×</span>
          <div style={styles.summaryItem}>
            <span style={styles.summaryVal}>{duration}</span>
            <span style={styles.summaryKey}>DAYS</span>
          </div>
          <span style={styles.summaryX}>=</span>
          <div style={styles.summaryItem}>
            <span style={{ ...styles.summaryVal, color: 'var(--gold)' }}>{xpPotential}</span>
            <span style={styles.summaryKey}>MAX XP</span>
          </div>
        </div>

        {error && <div style={styles.errBox}>⚠ {error}</div>}

        <button
          style={loading || !selected.length ? styles.startDisabled : styles.start}
          onClick={handleStart}
          disabled={loading || !selected.length}
        >
          {loading ? 'INITIALIZING REGIME...' : `⚡ LAUNCH ${duration}-DAY CHALLENGE`}
        </button>

        <p style={styles.loggedAs}>
          Logged in as <span style={{ color: 'var(--accent)' }}>{user.username}</span>
          {' '}— existing habits will be replaced
        </p>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh', overflow: 'auto', background: 'var(--bg)',
    display: 'flex', justifyContent: 'center',
    padding: '24px', position: 'relative',
  },
  container: {
    width: '640px', maxWidth: '100%', position: 'relative', zIndex: 1,
    display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '24px',
  },
  header:  { textAlign: 'center' },
  step:    { fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.3em', color: 'var(--red)', marginBottom: '8px' },
  title:   { fontFamily: 'var(--font-display)', fontSize: '2.8rem', letterSpacing: '0.1em', lineHeight: 1 },
  sub:     { color: 'var(--text2)', fontSize: '0.85rem', marginTop: '8px' },

  card: {
    background: 'var(--card)', border: '1px solid var(--border)',
    borderRadius: '12px', padding: '18px',
    display: 'flex', flexDirection: 'column', gap: '14px',
  },
  cardLabel: { fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.2em', color: 'var(--text3)' },

  presetGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(132px, 1fr))', gap: '8px' },
  presetOff: {
    background: 'var(--bg2)', border: '1px solid var(--border)',
    borderRadius: '8px', padding: '12px 8px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
    cursor: 'pointer', transition: 'var(--transition)', position: 'relative',
  },
  presetOn: {
    background: 'rgba(244,63,94,0.1)', border: '1px solid var(--red)',
    borderRadius: '8px', padding: '12px 8px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
    cursor: 'pointer', position: 'relative',
  },
  presetIcon: { fontSize: '1.5rem' },
  presetName: { fontSize: '0.75rem', fontWeight: 500, color: 'var(--text)', textAlign: 'center' },
  presetDesc: { fontSize: '0.62rem', color: 'var(--text3)', textAlign: 'center' },
  check:      { position: 'absolute', top: '6px', right: '8px', color: 'var(--red)', fontSize: '0.75rem', fontWeight: 700 },

  customRow: { display: 'flex', gap: '8px' },
  customInput: {
    flex: 1, background: 'var(--bg2)', border: '1px solid var(--border)',
    borderRadius: '6px', padding: '10px 14px',
    color: 'var(--text)', fontSize: '0.9rem',
  },
  addBtn: {
    background: 'var(--accent)', color: '#000', border: 'none',
    borderRadius: '6px', padding: '10px 18px', cursor: 'pointer',
    fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
    fontWeight: 700, letterSpacing: '0.1em',
  },

  durGrid:  { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  durOff: {
    background: 'var(--bg2)', border: '1px solid var(--border)',
    borderRadius: '8px', padding: '10px 14px', cursor: 'pointer',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
    transition: 'var(--transition)', minWidth: '64px',
  },
  durOn: {
    background: 'rgba(245,158,11,0.12)', border: '1px solid var(--gold)',
    borderRadius: '8px', padding: '10px 14px', cursor: 'pointer',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
    minWidth: '64px',
  },
  durNum:   { fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--gold)', lineHeight: 1 },
  durLabel: { fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--text3)', letterSpacing: '0.1em' },

  summary: {
    background: 'var(--card)', border: '1px solid var(--border)',
    borderRadius: '10px', padding: '16px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px',
  },
  summaryItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' },
  summaryVal: { fontFamily: 'var(--font-display)', fontSize: '2.2rem', color: 'var(--accent)', lineHeight: 1 },
  summaryKey: { fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--text3)', letterSpacing: '0.2em' },
  summaryX:   { fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--text3)' },

  errBox: {
    background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)',
    borderRadius: '6px', padding: '10px 14px',
    fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--red)',
  },
  start: {
    padding: '15px', background: 'var(--red)', color: '#fff', border: 'none',
    borderRadius: '8px', cursor: 'pointer', fontFamily: 'var(--font-mono)',
    fontSize: '0.88rem', fontWeight: 700, letterSpacing: '0.15em',
    transition: 'var(--transition)',
  },
  startDisabled: {
    padding: '15px', background: 'var(--border)', color: 'var(--text3)', border: 'none',
    borderRadius: '8px', cursor: 'not-allowed', fontFamily: 'var(--font-mono)',
    fontSize: '0.88rem', letterSpacing: '0.15em',
  },
  loggedAs: { textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text3)', letterSpacing: '0.1em' },
}

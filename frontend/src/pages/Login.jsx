import React, { useState, useEffect } from 'react'
import { login, register } from '../api/api'

const QUOTES = [
  "The villain trains while the hero rests.",
  "Discipline is choosing between what you want now and what you want most.",
  "Pain is temporary. Glory is permanent.",
  "Your future self is watching you right now.",
  "While they scroll, you build. While they sleep, you rise.",
  "The most dangerous creature alive: a disciplined mind.",
  "They will ask how you did it. Tell them: every single day.",
]

export default function Login({ onLogin }) {
  const [mode, setMode] = useState('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [quoteIdx] = useState(() => Math.floor(Math.random() * QUOTES.length))
  const [scanPos, setScanPos] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setScanPos(p => (p + 1) % 100), 80)
    return () => clearInterval(t)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!username.trim() || !password.trim()) { setError('All fields required'); return }
    setLoading(true)
    try {
      const fn = mode === 'register' ? register : login
      const res = await fn(username.trim(), password.trim())
      localStorage.setItem('user', JSON.stringify(res.data))
      onLogin(res.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Could not connect to server. Is Flask running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div className="grid-bg" />

      {/* Animated scan line */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: '1px', zIndex: 1,
        background: 'linear-gradient(90deg, transparent, rgba(56,189,248,0.4), transparent)',
        transform: `translateY(${scanPos}vh)`,
        transition: 'transform 0.08s linear',
      }} />

      <div style={styles.content} className="anim-fadeup">
        {/* Logo */}
        <div style={styles.logoWrap}>
          <div style={styles.logoIcon}>⚡</div>
          <h1 style={styles.logo} className="glow-text">VILTR</h1>
          <p style={styles.logoTagline}>HABIT DOMINATION SYSTEM</p>
        </div>

        {/* Quote */}
        <div style={styles.quote}>
          <span style={styles.quoteL}>❝</span>
          <p style={styles.quoteBody}>{QUOTES[quoteIdx]}</p>
        </div>

        {/* Form card */}
        <div style={styles.card}>
          {/* Mode tabs */}
          <div style={styles.modeTabs}>
            <button style={mode === 'login' ? styles.modeOn : styles.modeOff} onClick={() => { setMode('login'); setError('') }}>
              LOGIN
            </button>
            <button style={mode === 'register' ? styles.modeOn : styles.modeOff} onClick={() => { setMode('register'); setError('') }}>
              REGISTER
            </button>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            <Field label="USERNAME" type="text"     value={username} onChange={setUsername} placeholder="Enter username"     autoFocus />
            <Field label="PASSWORD" type="password" value={password} onChange={setPassword} placeholder="Enter password" />

            {error && (
              <div style={styles.errorBox}>
                <span style={{ color: 'var(--red)' }}>⚠</span>
                {error}
              </div>
            )}

            <button type="submit" style={loading ? styles.submitLoading : styles.submit} disabled={loading}>
              {loading ? '...' : mode === 'register' ? 'CREATE ACCOUNT' : 'ENTER THE DOMAIN'}
            </button>
          </form>
        </div>

        {/* Feature tags */}
        <div style={styles.tags}>
          {['⚡ XP System', '🔥 Streaks', '📊 Analytics', '🏆 Leaderboard', '📝 Notes', '↓ Export'].map(t => (
            <span key={t} style={styles.tag}>{t}</span>
          ))}
        </div>

        <p style={styles.footer}>VILTR © 2025 — NO EXCUSES. ONLY EXECUTION.</p>
      </div>
    </div>
  )
}

function Field({ label, type, value, onChange, placeholder, autoFocus }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.2em', color: 'var(--text3)' }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        style={{
          background: 'var(--bg2)', border: '1px solid var(--border)',
          borderRadius: '6px', padding: '11px 14px',
          color: 'var(--text)', fontSize: '0.9rem',
          transition: 'border-color 0.2s',
        }}
        required
      />
    </div>
  )
}

const styles = {
  page: {
    height: '100vh', width: '100vw', overflow: 'auto',
    background: 'var(--bg)', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    padding: '24px', position: 'relative',
  },
  content: {
    width: '420px', maxWidth: '100%', position: 'relative', zIndex: 1,
    display: 'flex', flexDirection: 'column', gap: '18px',
  },
  logoWrap: { textAlign: 'center' },
  logoIcon: { fontSize: '2.5rem', marginBottom: '4px' },
  logo: {
    fontFamily: 'var(--font-display)', fontSize: '5rem',
    letterSpacing: '0.2em', color: 'var(--accent)', lineHeight: 1,
    display: 'block',
  },
  logoTagline: {
    fontFamily: 'var(--font-mono)', fontSize: '0.58rem',
    letterSpacing: '0.35em', color: 'var(--text3)', marginTop: '6px',
  },
  quote: {
    background: 'var(--card)', border: '1px solid var(--border)',
    borderLeft: '3px solid var(--red)', borderRadius: '6px',
    padding: '12px 14px', display: 'flex', gap: '8px',
  },
  quoteL:    { color: 'var(--red)', fontSize: '1.3rem', lineHeight: 1, flexShrink: 0 },
  quoteBody: { color: 'var(--text2)', fontSize: '0.8rem', fontStyle: 'italic', lineHeight: 1.5 },
  card: {
    background: 'var(--card)', border: '1px solid var(--border)',
    borderRadius: '12px', padding: '22px',
    display: 'flex', flexDirection: 'column', gap: '16px',
  },
  modeTabs: { display: 'flex', gap: '6px' },
  modeOn: {
    flex: 1, padding: '8px', background: 'var(--accent)', color: '#000',
    border: 'none', borderRadius: '6px', cursor: 'pointer',
    fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
    fontWeight: 700, letterSpacing: '0.12em',
  },
  modeOff: {
    flex: 1, padding: '8px', background: 'transparent', color: 'var(--text3)',
    border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer',
    fontFamily: 'var(--font-mono)', fontSize: '0.72rem', letterSpacing: '0.12em',
    transition: 'var(--transition)',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '14px' },
  errorBox: {
    display: 'flex', alignItems: 'center', gap: '8px',
    background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)',
    borderRadius: '6px', padding: '10px 12px',
    fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text)',
  },
  submit: {
    padding: '13px', background: 'var(--red)', color: '#fff',
    border: 'none', borderRadius: '6px', cursor: 'pointer',
    fontFamily: 'var(--font-mono)', fontSize: '0.78rem',
    fontWeight: 700, letterSpacing: '0.15em', transition: 'var(--transition)',
  },
  submitLoading: {
    padding: '13px', background: 'var(--border)', color: 'var(--text3)',
    border: 'none', borderRadius: '6px', cursor: 'not-allowed',
    fontFamily: 'var(--font-mono)', fontSize: '0.78rem', letterSpacing: '0.15em',
  },
  tags: { display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' },
  tag: {
    fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.08em',
    color: 'var(--text3)', background: 'var(--card)',
    border: '1px solid var(--border)', borderRadius: '4px', padding: '3px 8px',
  },
  footer: {
    textAlign: 'center', fontFamily: 'var(--font-mono)',
    fontSize: '0.55rem', letterSpacing: '0.2em', color: 'var(--text3)',
  },
}

import React, { useEffect, useState } from 'react'

export default function Toast({ message, type = 'success', onClose }) {
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setLeaving(true), 2500)
    const t2 = setTimeout(onClose, 3000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [onClose])

  const colors = {
    success: { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.4)', color: '#10b981', icon: '✓' },
    error:   { bg: 'rgba(244,63,94,0.15)',  border: 'rgba(244,63,94,0.4)',  color: '#f43f5e', icon: '✗' },
    info:    { bg: 'rgba(56,189,248,0.15)', border: 'rgba(56,189,248,0.4)', color: '#38bdf8', icon: '⚡' },
  }
  const c = colors[type] || colors.info

  return (
    <div style={{
      ...styles.toast,
      background: c.bg, border: `1px solid ${c.border}`,
      animation: leaving ? 'toastOut 0.4s ease forwards' : 'slideIn 0.3s ease both',
    }}>
      <span style={{ color: c.color, fontSize: '1rem' }}>{c.icon}</span>
      <span style={styles.msg}>{message}</span>
    </div>
  )
}

const styles = {
  toast: {
    position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '12px 18px', borderRadius: '8px',
    backdropFilter: 'blur(8px)',
    fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
    letterSpacing: '0.05em', maxWidth: '320px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  },
  msg: { color: 'var(--text)', lineHeight: 1.4 },
}

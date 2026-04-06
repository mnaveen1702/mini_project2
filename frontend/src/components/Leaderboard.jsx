import React, { useEffect, useState } from 'react'
import { getStats } from '../api/api'
import { getLevel } from './LevelBadge'

export default function Leaderboard({ onClose, currentUser }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getStats()
      .then(r => setData(r.data))
      .catch(() => setData([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()} className="anim-popin">
        <div style={styles.header}>
          <span style={styles.title}>🏆 LEADERBOARD</span>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {loading
          ? <div style={styles.loading}>LOADING...</div>
          : data.length === 0
            ? <div style={styles.loading}>No data yet</div>
            : (
              <div style={styles.list}>
                {data.map((u, i) => {
                  const lvl = getLevel(u.xp)
                  const isMe = u.username === currentUser
                  const medals = ['🥇','🥈','🥉']
                  return (
                    <div key={u.username} style={{ ...styles.row, ...(isMe ? styles.rowMe : {}) }}>
                      <span style={styles.rank}>{medals[i] || `#${i+1}`}</span>
                      <div style={styles.info}>
                        <span style={{ ...styles.name, color: isMe ? 'var(--accent)' : 'var(--text)' }}>
                          {u.username}{isMe ? ' (you)' : ''}
                        </span>
                        <span style={{ ...styles.rankBadge, color: lvl.color }}>{lvl.emoji} {lvl.rank}</span>
                      </div>
                      <div style={styles.right}>
                        <span style={styles.xp}>{u.xp} XP</span>
                        <span style={styles.completed}>{u.completed} tasks</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
        }

        <p style={styles.note}>Rankings update live based on completed habits</p>
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position:'fixed', inset:0, zIndex:2000,
    background:'rgba(0,0,0,0.75)', backdropFilter:'blur(6px)',
    display:'flex', alignItems:'center', justifyContent:'center',
  },
  modal: {
    background:'var(--card)', border:'1px solid var(--border)',
    borderRadius:'14px', padding:'24px', width:'420px', maxWidth:'95vw',
    display:'flex', flexDirection:'column', gap:'14px',
    boxShadow:'0 32px 64px rgba(0,0,0,0.6)',
  },
  header: { display:'flex', justifyContent:'space-between', alignItems:'center' },
  title: { fontFamily:'var(--font-display)', fontSize:'1.6rem', letterSpacing:'0.12em', color:'var(--gold)' },
  closeBtn: {
    background:'transparent', border:'1px solid var(--border)',
    color:'var(--text3)', borderRadius:'6px', padding:'4px 10px',
    cursor:'pointer', fontFamily:'var(--font-mono)', fontSize:'0.7rem',
  },
  loading: { textAlign:'center', fontFamily:'var(--font-mono)', fontSize:'0.75rem', color:'var(--text3)', padding:'20px 0' },
  list: { display:'flex', flexDirection:'column', gap:'8px', maxHeight:'340px', overflowY:'auto' },
  row: {
    display:'flex', alignItems:'center', gap:'12px',
    background:'var(--bg2)', border:'1px solid var(--border)',
    borderRadius:'8px', padding:'12px',
  },
  rowMe: { border:'1px solid var(--accent)', background:'rgba(56,189,248,0.05)' },
  rank:  { fontSize:'1.3rem', width:'28px', flexShrink:0, textAlign:'center' },
  info:  { flex:1, display:'flex', flexDirection:'column', gap:'2px' },
  name:  { fontWeight:600, fontSize:'0.88rem' },
  rankBadge: { fontFamily:'var(--font-mono)', fontSize:'0.6rem', letterSpacing:'0.1em' },
  right: { display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'2px' },
  xp:   { fontFamily:'var(--font-mono)', fontSize:'0.8rem', color:'var(--accent)', fontWeight:700 },
  completed: { fontFamily:'var(--font-mono)', fontSize:'0.58rem', color:'var(--text3)' },
  note: { textAlign:'center', fontFamily:'var(--font-mono)', fontSize:'0.58rem', color:'var(--text3)', letterSpacing:'0.1em' },
}

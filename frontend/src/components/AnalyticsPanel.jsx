import React, { useMemo, useState } from 'react'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis,
} from 'recharts'
import LevelBadge, { getLevel } from './LevelBadge'

const QUOTES = [
  "The villain trains while the hero rests.",
  "Discipline is choosing your future over your feelings.",
  "Pain is temporary. Regret is forever.",
  "Your future self is watching you right now.",
  "The dark side of discipline: no days off.",
  "While they celebrate, you dominate.",
  "Champions are built in the dark.",
  "You don't rise to your goals. You fall to your systems.",
  "The wolf doesn't perform for the sheep.",
  "Obsession is a gift the mediocre will never understand.",
  "Average is a choice. Excellence is a decision.",
  "The most dangerous person is the one who never stops.",
  "Rest if you must. But never quit.",
  "They fear what they don't understand: your consistency.",
]

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--border)',
      borderRadius: '6px', padding: '8px 12px',
      fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text)',
    }}>
      <div style={{ color: 'var(--text2)', marginBottom: '2px' }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || 'var(--red)' }}>
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  )
}

export default function AnalyticsPanel({ habits }) {
  const [tab, setTab] = useState('today')
  const quote = useMemo(() => QUOTES[Math.floor(Math.random() * QUOTES.length)], [])

  const stats = useMemo(() => {
    if (!habits.length) return { total:0, completed:0, xp:0, streak:0, pct:0, todayDone:0, todayTotal:0, bestStreak:0 }
    const duration = habits[0]?.days?.length || 30
    const todayIdx = Math.min(new Date().getDate() - 1, duration - 1)
    const total = habits.reduce((s, h) => s + h.days.length, 0)
    const completed = habits.reduce((s, h) => s + h.days.filter(Boolean).length, 0)
    const xp = completed * 10
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0
    const todayDone = habits.filter(h => h.days[todayIdx]).length

    // current streak
    let streak = 0
    for (let i = todayIdx; i >= 0; i--) {
      if (habits.every(h => h.days[i])) streak++
      else break
    }
    // best streak
    let bestStreak = 0, cur = 0
    for (let i = 0; i < duration; i++) {
      if (habits.every(h => h.days[i])) { cur++; bestStreak = Math.max(bestStreak, cur) }
      else cur = 0
    }
    return { total, completed, xp, streak, pct, todayDone, todayTotal: habits.length, bestStreak }
  }, [habits])

  const weekData = useMemo(() => {
    if (!habits.length) return []
    const duration = habits[0]?.days?.length || 30
    const todayIdx = Math.min(new Date().getDate() - 1, duration - 1)
    const labels = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
    return Array.from({ length: 7 }, (_, i) => {
      const di = todayIdx - 6 + i
      if (di < 0) return { day: labels[i], done: 0 }
      return { day: labels[i], done: habits.filter(h => h.days[di]).length }
    })
  }, [habits])

  const level = getLevel(stats.xp)
  const pieData = [
    { name: 'Done',      value: stats.completed },
    { name: 'Remaining', value: stats.total - stats.completed },
  ]

  const TABS = ['today','stats','chart','habits']

  return (
    <div style={styles.panel}>

      {/* Quote banner */}
      <div style={styles.quoteBanner}>
        <span style={styles.quoteQ}>❝</span>
        <p style={styles.quoteText}>{quote}</p>
      </div>

      {/* XP / Level card */}
      <div style={styles.xpCard}>
        <div style={styles.xpTop}>
          <LevelBadge xp={stats.xp} showBar large />
          <div style={styles.xpNum}>{stats.xp}<span style={styles.xpLabel}> XP</span></div>
        </div>
        <div style={styles.xpTrack}>
          <div style={{
            ...styles.xpFill,
            width: `${Math.min(stats.pct, 100)}%`,
            background: `linear-gradient(90deg, ${level.color}, var(--red))`,
          }} />
        </div>
        <div style={styles.xpSub}>{stats.pct}% overall domination</div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={tab === t ? styles.tabOn : styles.tabOff}>
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* ── TAB: TODAY ── */}
      {tab === 'today' && (
        <div style={styles.section}>
          <div style={styles.secLabel}>TODAY'S FOCUS</div>
          <div style={styles.todayBig}>
            <span style={{ color: 'var(--red)', fontFamily: 'var(--font-display)', fontSize: '3.2rem', lineHeight: 1 }}>
              {stats.todayDone}
            </span>
            <span style={{ color: 'var(--text3)', fontFamily: 'var(--font-mono)', fontSize: '1rem' }}>
              /{stats.todayTotal}
            </span>
          </div>
          <div style={styles.todayTrack}>
            <div style={{
              ...styles.todayFill,
              width: stats.todayTotal > 0 ? `${(stats.todayDone / stats.todayTotal) * 100}%` : '0%',
            }} />
          </div>
          <div style={styles.todayMsg}>
            {stats.todayDone === stats.todayTotal && stats.todayTotal > 0
              ? '🔥 PERFECT DAY! All habits complete!'
              : stats.todayDone === 0
                ? "⚡ Start today's habits. Don't break the chain."
                : `💪 ${stats.todayTotal - stats.todayDone} habits left today. Keep going.`
            }
          </div>

          {/* Streak */}
          <div style={styles.streakRow}>
            <div style={styles.streakBox}>
              <span style={{ fontSize: '1.6rem', animation: stats.streak > 2 ? 'streakBounce 0.5s ease' : 'none' }}>🔥</span>
              <div>
                <div style={styles.streakNum}>{stats.streak}</div>
                <div style={styles.streakLabel}>CURRENT</div>
              </div>
            </div>
            <div style={styles.streakBox}>
              <span style={{ fontSize: '1.6rem' }}>🏆</span>
              <div>
                <div style={styles.streakNum}>{stats.bestStreak}</div>
                <div style={styles.streakLabel}>BEST</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: STATS ── */}
      {tab === 'stats' && (
        <div style={styles.statsGrid}>
          {[
            { label: 'COMPLETED',  value: stats.completed,              color: 'var(--red)' },
            { label: 'REMAINING',  value: stats.total - stats.completed, color: 'var(--text3)' },
            { label: 'STREAK',     value: `${stats.streak}🔥`,          color: 'var(--gold)' },
            { label: 'BEST STREAK',value: `${stats.bestStreak}🔥`,      color: 'var(--gold)' },
            { label: 'TOTAL XP',   value: stats.xp,                     color: 'var(--accent)' },
            { label: 'HABITS',     value: habits.length,                 color: 'var(--green)' },
          ].map(({ label, value, color }) => (
            <div key={label} style={styles.statCard}>
              <div style={{ ...styles.statVal, color }}>{value}</div>
              <div style={styles.statLbl}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── TAB: CHART ── */}
      {tab === 'chart' && (
        <>
          <div style={styles.section}>
            <div style={styles.secLabel}>LAST 7 DAYS</div>
            <ResponsiveContainer width="100%" height={130}>
              <BarChart data={weekData} margin={{ top: 4, right: 0, bottom: 0, left: -28 }}>
                <XAxis dataKey="day" tick={{ fill: 'var(--text3)', fontSize: 10, fontFamily: 'Space Mono' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text3)', fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="done" name="Habits done" fill="var(--red)" radius={[4,4,0,0]} maxBarSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {stats.total > 0 && (
            <div style={styles.section}>
              <div style={styles.secLabel}>OVERALL SPLIT</div>
              <ResponsiveContainer width="100%" height={130}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={35} outerRadius={52} dataKey="value" strokeWidth={0}>
                    <Cell fill="var(--red)" />
                    <Cell fill="var(--card2)" />
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={styles.pieLegend}>
                <span><span style={styles.ldot('#f43f5e')} />Done ({stats.completed})</span>
                <span><span style={styles.ldot('var(--card2)')} />Remaining ({stats.total - stats.completed})</span>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── TAB: HABITS ── */}
      {tab === 'habits' && (
        <div style={styles.section}>
          <div style={styles.secLabel}>PER-HABIT BREAKDOWN</div>
          {habits.map(h => {
            const done = h.days.filter(Boolean).length
            const pct  = Math.round((done / h.days.length) * 100)
            return (
              <div key={h.id} style={styles.habitRow}>
                <span style={{ ...styles.habitDot, background: h.color }} />
                <span style={styles.habitName}>{h.name}</span>
                <div style={styles.miniTrack}>
                  <div style={{ ...styles.miniFill, width: `${pct}%`, background: h.color }} />
                </div>
                <span style={styles.habitPct}>{pct}%</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Export */}
      <ExportCSV habits={habits} />
    </div>
  )
}

// ── Inline CSV Export ─────────────────────────────────────────────────────────
function ExportCSV({ habits }) {
  const [done, setDone] = useState(false)
  const handleExport = () => {
    if (!habits.length) return
    const dur = habits[0].days.length
    const header = ['Habit', ...Array.from({length:dur},(_,i)=>`Day ${i+1}`), 'Total', '%'].join(',')
    const rows = habits.map(h => {
      const total = h.days.filter(Boolean).length
      return [h.name, ...h.days.map(d=>d?'1':'0'), total, Math.round(total/dur*100)+'%'].join(',')
    })
    const blob = new Blob([[header,...rows].join('\n')], { type:'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `viltr-${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    setDone(true); setTimeout(()=>setDone(false), 2500)
  }
  return (
    <button onClick={handleExport} style={done ? styles.exportDone : styles.exportBtn}>
      {done ? '✓ DOWNLOADED' : '↓ EXPORT CSV REPORT'}
    </button>
  )
}

const styles = {
  panel: { display:'flex', flexDirection:'column', gap:'10px', height:'100%', overflowY:'auto', paddingRight:'2px' },

  quoteBanner: {
    background:'var(--card)', border:'1px solid var(--border)', borderLeft:'3px solid var(--red)',
    borderRadius:'8px', padding:'12px 14px', display:'flex', gap:'8px',
  },
  quoteQ:    { color:'var(--red)', fontSize:'1.3rem', flexShrink:0, lineHeight:1 },
  quoteText: { color:'var(--text2)', fontSize:'0.77rem', fontStyle:'italic', lineHeight:1.5 },

  xpCard: {
    background:'var(--card)', border:'1px solid var(--border)',
    borderRadius:'8px', padding:'14px', display:'flex', flexDirection:'column', gap:'8px',
  },
  xpTop:   { display:'flex', justifyContent:'space-between', alignItems:'center' },
  xpNum:   { fontFamily:'var(--font-display)', fontSize:'2rem', color:'var(--accent)', lineHeight:1 },
  xpLabel: { fontFamily:'var(--font-mono)', fontSize:'0.7rem', color:'var(--text3)' },
  xpTrack: { height:'5px', background:'var(--bg2)', borderRadius:'3px', overflow:'hidden' },
  xpFill:  { height:'100%', borderRadius:'3px', transition:'width 0.6s ease' },
  xpSub:   { fontFamily:'var(--font-mono)', fontSize:'0.58rem', color:'var(--text3)', textAlign:'right', letterSpacing:'0.1em' },

  tabs: { display:'flex', gap:'4px' },
  tabOn: {
    flex:1, padding:'6px 2px', background:'var(--red)', color:'#fff',
    border:'none', borderRadius:'4px', cursor:'pointer',
    fontFamily:'var(--font-mono)', fontSize:'0.58rem', letterSpacing:'0.1em',
  },
  tabOff: {
    flex:1, padding:'6px 2px', background:'transparent', color:'var(--text3)',
    border:'1px solid var(--border)', borderRadius:'4px', cursor:'pointer',
    fontFamily:'var(--font-mono)', fontSize:'0.58rem', letterSpacing:'0.1em', transition:'var(--transition)',
  },

  section: {
    background:'var(--card)', border:'1px solid var(--border)',
    borderRadius:'8px', padding:'14px', display:'flex', flexDirection:'column', gap:'10px',
  },
  secLabel: { fontFamily:'var(--font-mono)', fontSize:'0.58rem', letterSpacing:'0.2em', color:'var(--text3)' },

  todayBig: { display:'flex', alignItems:'baseline', gap:'4px', justifyContent:'center' },
  todayTrack: { height:'8px', background:'var(--bg2)', borderRadius:'4px', overflow:'hidden' },
  todayFill:  { height:'100%', background:'var(--red)', borderRadius:'4px', transition:'width 0.6s ease' },
  todayMsg:   { fontSize:'0.8rem', color:'var(--text2)', textAlign:'center', lineHeight:1.4 },

  streakRow: { display:'flex', gap:'10px' },
  streakBox: {
    flex:1, background:'var(--bg2)', border:'1px solid var(--border)',
    borderRadius:'8px', padding:'12px', display:'flex', alignItems:'center', gap:'10px',
  },
  streakNum:   { fontFamily:'var(--font-display)', fontSize:'1.8rem', color:'var(--gold)', lineHeight:1 },
  streakLabel: { fontFamily:'var(--font-mono)', fontSize:'0.55rem', color:'var(--text3)', letterSpacing:'0.15em' },

  statsGrid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' },
  statCard: {
    background:'var(--card)', border:'1px solid var(--border)',
    borderRadius:'8px', padding:'12px', textAlign:'center',
  },
  statVal: { fontFamily:'var(--font-display)', fontSize:'1.7rem', lineHeight:1 },
  statLbl: { fontFamily:'var(--font-mono)', fontSize:'0.52rem', color:'var(--text3)', letterSpacing:'0.15em', marginTop:'3px' },

  pieLegend: {
    display:'flex', justifyContent:'center', gap:'16px',
    fontFamily:'var(--font-mono)', fontSize:'0.62rem', color:'var(--text3)',
  },
  ldot: (c) => ({
    display:'inline-block', width:'8px', height:'8px',
    borderRadius:'50%', background:c, marginRight:'5px',
  }),

  habitRow: { display:'flex', alignItems:'center', gap:'8px' },
  habitDot: { width:'8px', height:'8px', borderRadius:'50%', flexShrink:0 },
  habitName: { fontSize:'0.75rem', color:'var(--text2)', width:'72px', flexShrink:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' },
  miniTrack: { flex:1, height:'4px', background:'var(--bg2)', borderRadius:'2px', overflow:'hidden' },
  miniFill:  { height:'100%', borderRadius:'2px', transition:'width 0.4s ease' },
  habitPct:  { fontFamily:'var(--font-mono)', fontSize:'0.58rem', color:'var(--text3)', width:'30px', textAlign:'right' },

  exportBtn: {
    padding:'10px', background:'transparent',
    border:'1px solid var(--border)', color:'var(--text3)',
    borderRadius:'6px', cursor:'pointer', fontFamily:'var(--font-mono)',
    fontSize:'0.65rem', letterSpacing:'0.12em', transition:'var(--transition)',
    flexShrink:0,
  },
  exportDone: {
    padding:'10px', background:'rgba(16,185,129,0.1)',
    border:'1px solid rgba(16,185,129,0.4)', color:'var(--green)',
    borderRadius:'6px', cursor:'default', fontFamily:'var(--font-mono)',
    fontSize:'0.65rem', letterSpacing:'0.12em', flexShrink:0,
  },
}

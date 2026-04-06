import React, { useCallback, useState, useRef } from 'react'
import { toggleHabit, deleteHabit, saveNote } from '../api/api'

const TODAY = new Date().getDate() - 1  // 0-indexed

export default function HabitGrid({ habits, onUpdate, onDelete, onToast }) {
  const [noteModal, setNoteModal] = useState(null)  // {habitId, dayIndex, note}
  const [noteText, setNoteText] = useState('')
  const [animCell, setAnimCell] = useState(null)    // "habitId-dayIdx"
  const noteRef = useRef()

  const handleToggle = useCallback(async (habitId, dayIndex) => {
    try {
      const res = await toggleHabit(habitId, dayIndex)
      onUpdate(habitId, res.data.days)
      setAnimCell(`${habitId}-${dayIndex}`)
      setTimeout(() => setAnimCell(null), 400)
      if (res.data.days[dayIndex]) onToast('Habit completed! +10 XP ⚡', 'success')
    } catch {
      onToast('Connection error — is the backend running?', 'error')
    }
  }, [onUpdate, onToast])

  const openNote = (habitId, dayIndex, currentNote) => {
    setNoteModal({ habitId, dayIndex })
    setNoteText(currentNote || '')
    setTimeout(() => noteRef.current?.focus(), 50)
  }

  const handleSaveNote = async () => {
    if (!noteModal) return
    try {
      const res = await saveNote(noteModal.habitId, noteModal.dayIndex, noteText)
      onUpdate(noteModal.habitId, null, res.data.notes)
      onToast('Note saved!', 'info')
    } catch {
      onToast('Failed to save note', 'error')
    }
    setNoteModal(null)
  }

  const handleDelete = async (habitId, name) => {
    if (!window.confirm(`Delete habit "${name}"? This cannot be undone.`)) return
    try {
      await deleteHabit(habitId)
      onDelete(habitId)
      onToast(`"${name}" deleted`, 'error')
    } catch {
      onToast('Failed to delete', 'error')
    }
  }

  if (!habits.length) return (
    <div style={styles.empty}>
      <div style={styles.emptyIcon}>🎯</div>
      <div style={styles.emptyText}>NO HABITS CONFIGURED</div>
      <div style={styles.emptySub}>Reset and add your habits to begin</div>
    </div>
  )

  const duration = habits[0]?.days?.length || 30

  return (
    <div style={styles.wrapper}>
      {/* Scrollable grid */}
      <div style={styles.scroll}>
        <div style={{ minWidth: 'max-content' }}>

          {/* Header row */}
          <div style={styles.headerRow}>
            <div style={styles.stickyHeader}>HABIT</div>
            {Array.from({ length: duration }, (_, i) => (
              <div key={i} style={i === TODAY ? styles.dayHdrToday : styles.dayHdr}>
                {String(i + 1).padStart(2, '0')}
              </div>
            ))}
            <div style={styles.actionsHeader}>DEL</div>
          </div>

          {/* Data rows */}
          {habits.map((habit) => {
            const done  = habit.days.filter(Boolean).length
            const pct   = Math.round((done / duration) * 100)
            return (
              <div key={habit.id} style={styles.row}>
                {/* Sticky name cell */}
                <div style={styles.stickyCell}>
                  <div style={{ ...styles.colorDot, background: habit.color }} />
                  <div style={styles.nameWrap}>
                    <div style={styles.habitName}>{habit.name}</div>
                    <div style={styles.habitMeta}>{done}/{duration} · {pct}%</div>
                  </div>
                </div>

                {/* Day cells */}
                {habit.days.map((done, i) => {
                  const isToday  = i === TODAY
                  const isPast   = i < TODAY
                  const cellKey  = `${habit.id}-${i}`
                  const isAnim   = animCell === cellKey
                  const hasNote  = habit.notes?.[i]

                  return (
                    <div
                      key={i}
                      style={{
                        ...styles.cell,
                        ...(done      ? { ...styles.cellDone, background: habit.color + '28', borderColor: habit.color + '60' } : {}),
                        ...(isToday && !done ? styles.cellToday : {}),
                        ...(isPast && !done  ? styles.cellPast  : {}),
                        animation: isAnim ? 'cellComplete 0.4s ease' : 'none',
                      }}
                      onClick={() => handleToggle(habit.id, i)}
                      onContextMenu={(e) => { e.preventDefault(); openNote(habit.id, i, habit.notes?.[i]) }}
                      title={`Day ${i + 1}${hasNote ? ' · has note' : ''} — right-click to add note`}
                    >
                      {done
                        ? <span style={{ ...styles.zapIcon, color: habit.color }}>⚡</span>
                        : hasNote
                          ? <span style={styles.noteIndicator}>•</span>
                          : isToday
                            ? <span style={styles.todayDot} />
                            : null
                      }
                    </div>
                  )
                })}

                {/* Delete cell */}
                <div style={styles.deleteCell}>
                  <button
                    style={styles.deleteBtn}
                    onClick={() => handleDelete(habit.id, habit.name)}
                    title={`Delete ${habit.name}`}
                  >✕</button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div style={styles.legend}>
        <span style={styles.legendItem}><span style={styles.legendDot('#f43f5e')} /> Completed</span>
        <span style={styles.legendItem}><span style={styles.legendDot('#38bdf8')} /> Today</span>
        <span style={styles.legendItem}><span style={{ ...styles.legendDot('#475569'), opacity: 0.5 }} /> Past</span>
        <span style={styles.legendItem}><span style={styles.legendBullet}>•</span> Has note</span>
        <span style={{ ...styles.legendItem, marginLeft: 'auto', color: 'var(--text3)', fontStyle: 'italic' }}>
          Right-click a cell to add a note
        </span>
      </div>

      {/* Note Modal */}
      {noteModal && (
        <div style={styles.modalOverlay} onClick={() => setNoteModal(null)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()} className="anim-popin">
            <div style={styles.modalTitle}>
              📝 NOTE — DAY {noteModal.dayIndex + 1}
            </div>
            <textarea
              ref={noteRef}
              style={styles.noteArea}
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              placeholder="Add a reflection, how you felt, what you did..."
              rows={4}
            />
            <div style={styles.modalBtns}>
              <button style={styles.cancelBtn} onClick={() => setNoteModal(null)}>CANCEL</button>
              <button style={styles.saveBtn}   onClick={handleSaveNote}>SAVE NOTE</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const CELL = '32px'
const STICKY_W = '160px'
const ACTIONS_W = '40px'

const styles = {
  wrapper: { flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '8px' },
  scroll:  { flex: 1, overflow: 'auto' },

  headerRow: { display: 'flex', position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg)' },
  stickyHeader: {
    width: STICKY_W, minWidth: STICKY_W, height: '28px',
    position: 'sticky', left: 0, zIndex: 20, background: 'var(--bg)',
    display: 'flex', alignItems: 'center', paddingLeft: '10px',
    fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.2em', color: 'var(--text3)',
    borderBottom: '1px solid var(--border)', borderRight: '1px solid var(--border)',
  },
  dayHdr: {
    width: CELL, minWidth: CELL, height: '28px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'var(--font-mono)', fontSize: '0.52rem', color: 'var(--text3)',
    borderBottom: '1px solid var(--border)',
    borderRight: '1px solid rgba(30,58,95,0.2)',
  },
  dayHdrToday: {
    width: CELL, minWidth: CELL, height: '28px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'var(--font-mono)', fontSize: '0.52rem', color: 'var(--accent)',
    borderBottom: '2px solid var(--accent)',
    borderRight: '1px solid rgba(56,189,248,0.2)',
    background: 'rgba(56,189,248,0.06)',
  },
  actionsHeader: {
    width: ACTIONS_W, minWidth: ACTIONS_W, height: '28px',
    position: 'sticky', right: 0, zIndex: 20, background: 'var(--bg)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'var(--font-mono)', fontSize: '0.52rem', color: 'var(--text3)',
    borderBottom: '1px solid var(--border)', borderLeft: '1px solid var(--border)',
  },
  row: { display: 'flex', borderBottom: '1px solid rgba(30,58,95,0.35)' },
  stickyCell: {
    width: STICKY_W, minWidth: STICKY_W, height: '38px',
    position: 'sticky', left: 0, zIndex: 5, background: 'var(--bg)',
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '0 10px', borderRight: '1px solid var(--border)',
  },
  colorDot: { width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0 },
  nameWrap: { display: 'flex', flexDirection: 'column', gap: '1px', overflow: 'hidden' },
  habitName: {
    fontSize: '0.8rem', fontWeight: 500, color: 'var(--text)',
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  },
  habitMeta: { fontFamily: 'var(--font-mono)', fontSize: '0.52rem', color: 'var(--text3)' },

  cell: {
    width: CELL, minWidth: CELL, height: '38px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', transition: 'background 0.15s',
    borderRight: '1px solid rgba(30,58,95,0.15)',
    background: 'transparent',
  },
  cellDone:  { border: '1px solid' },
  cellToday: { background: 'rgba(56,189,248,0.06)' },
  cellPast:  { opacity: 0.4 },

  zapIcon:       { fontSize: '0.9rem', animation: 'none' },
  noteIndicator: { fontSize: '1rem', color: 'var(--accent)', lineHeight: 1 },
  todayDot: {
    width: '5px', height: '5px', borderRadius: '50%',
    background: 'var(--accent)', opacity: 0.7,
  },
  deleteCell: {
    width: ACTIONS_W, minWidth: ACTIONS_W, height: '38px',
    position: 'sticky', right: 0, zIndex: 5, background: 'var(--bg)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderLeft: '1px solid var(--border)',
  },
  deleteBtn: {
    background: 'transparent', border: 'none', color: 'var(--text3)',
    cursor: 'pointer', fontSize: '0.75rem', padding: '4px 6px',
    borderRadius: '4px', transition: 'var(--transition)',
    fontFamily: 'var(--font-mono)',
  },

  legend: {
    display: 'flex', alignItems: 'center', gap: '14px',
    padding: '6px 4px', flexShrink: 0, flexWrap: 'wrap',
  },
  legendItem: {
    display: 'flex', alignItems: 'center', gap: '5px',
    fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--text3)',
  },
  legendDot: (color) => ({
    display: 'inline-block', width: '8px', height: '8px',
    borderRadius: '50%', background: color, flexShrink: 0,
  }),
  legendBullet: { color: 'var(--accent)', fontSize: '1rem', lineHeight: 1 },

  empty: {
    flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: '10px',
  },
  emptyIcon: { fontSize: '2.5rem' },
  emptyText: { fontFamily: 'var(--font-mono)', fontSize: '0.8rem', letterSpacing: '0.2em', color: 'var(--text3)' },
  emptySub:  { fontSize: '0.8rem', color: 'var(--text3)' },

  modalOverlay: {
    position: 'fixed', inset: 0, zIndex: 1000,
    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  modal: {
    background: 'var(--card)', border: '1px solid var(--border)',
    borderRadius: '12px', padding: '24px', width: '380px', maxWidth: '95vw',
    display: 'flex', flexDirection: 'column', gap: '14px',
    boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
  },
  modalTitle: {
    fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
    letterSpacing: '0.2em', color: 'var(--accent)',
  },
  noteArea: {
    background: 'var(--bg2)', border: '1px solid var(--border)',
    borderRadius: '8px', padding: '12px', color: 'var(--text)',
    fontSize: '0.9rem', resize: 'none', fontFamily: 'var(--font-body)',
    lineHeight: 1.6,
  },
  modalBtns: { display: 'flex', gap: '8px' },
  cancelBtn: {
    flex: 1, padding: '10px', background: 'transparent',
    border: '1px solid var(--border)', color: 'var(--text3)',
    borderRadius: '6px', cursor: 'pointer',
    fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.1em',
  },
  saveBtn: {
    flex: 2, padding: '10px', background: 'var(--accent)',
    border: 'none', color: '#000', borderRadius: '6px', cursor: 'pointer',
    fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
    fontWeight: 700, letterSpacing: '0.1em',
  },
}

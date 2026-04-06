import React, { useState, useEffect } from 'react'
import Login from './pages/Login'
import Setup from './pages/Setup'
import Dashboard from './pages/Dashboard'
import { getHabits } from './api/api'

export default function App() {
  const [user,     setUser]     = useState(null)
  const [view,     setView]     = useState('login')   // login | setup | dashboard
  const [booting,  setBooting]  = useState(true)
  const [theme,    setTheme]    = useState(() => localStorage.getItem('viltr-theme') || 'dark')

  // Apply theme class to <body>
  useEffect(() => {
    document.body.classList.toggle('light', theme === 'light')
    localStorage.setItem('viltr-theme', theme)
  }, [theme])

  // Auto-login from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('viltr-user')
    if (!stored) { setBooting(false); return }
    const u = JSON.parse(stored)
    setUser(u)
    getHabits(u.id)
      .then(r => setView(r.data.length > 0 ? 'dashboard' : 'setup'))
      .catch(() => setView('setup'))
      .finally(() => setBooting(false))
  }, [])

  const handleLogin = async (userData) => {
    localStorage.setItem('viltr-user', JSON.stringify(userData))
    setUser(userData)
    try {
      const r = await getHabits(userData.id)
      setView(r.data.length > 0 ? 'dashboard' : 'setup')
    } catch {
      setView('setup')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('viltr-user')
    setUser(null)
    setView('login')
  }

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  if (booting) return (
    <div style={{
      height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)',
    }}>
      <span style={{
        fontFamily: 'var(--font-display)', fontSize: '3rem',
        color: 'var(--accent)', letterSpacing: '0.3em',
        animation: 'pulse 1s ease-in-out infinite',
      }}>
        VILTR
      </span>
    </div>
  )

  if (view === 'login')     return <Login onLogin={handleLogin} />
  if (view === 'setup')     return <Setup user={user} onComplete={() => setView('dashboard')} />
  return (
    <Dashboard
      user={user}
      theme={theme}
      onToggleTheme={toggleTheme}
      onLogout={handleLogout}
      onReset={() => setView('setup')}
    />
  )
}

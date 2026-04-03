import { useState, useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV = [
  { to: '/dashboard',         icon: HomeIcon,         label: 'Overview' },
  { to: '/dashboard/live',         icon: LiveIcon,         label: 'Live Detection' },
  { to: '/dashboard/conversation', icon: ConvoIcon,        label: 'Conversation' },
  { to: '/dashboard/learn',        icon: LearnIcon,        label: 'Learn Signs' },
  { to: '/dashboard/history',      icon: HistoryIcon,      label: 'History' },
  { to: '/dashboard/settings',     icon: SettingsIcon,     label: 'Settings' },
]

function HomeIcon()     { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> }
function LiveIcon()     { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg> }
function ConvoIcon()    { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> }
function LearnIcon()    { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg> }
function HistoryIcon()  { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> }
function SettingsIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> }

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate          = useNavigate()
  const [time, setTime]   = useState(new Date())
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const handleLogout = () => { logout(); navigate('/login') }

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  const hour = time.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div style={{
      display: 'flex', height: '100vh', overflow: 'hidden',
      background: '#f0f4f8',
      fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
    }}>

      {/* ── SIDEBAR ─────────────────────────────────────────────── */}
      <aside style={{
        width: collapsed ? '72px' : '240px',
        transition: 'width 0.3s cubic-bezier(.4,0,.2,1)',
        height: '100vh',
        background: '#0a1628',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        position: 'relative',
        zIndex: 10,
        overflow: 'hidden',
      }}>

        {/* Top accent line */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, #00d4ff, #0066ff)',
        }} />

        {/* Logo */}
        <div style={{
          padding: collapsed ? '28px 0 20px' : '28px 20px 20px',
          display: 'flex', alignItems: 'center',
          gap: '10px', justifyContent: collapsed ? 'center' : 'flex-start',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          marginBottom: '8px',
        }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #00d4ff, #0066ff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', flexShrink: 0,
          }}>🤟</div>
          {!collapsed && (
            <div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.3px' }}>
                Signova
              </div>
              <div style={{ fontSize: '10px', color: '#00d4ff', letterSpacing: '1.5px', fontWeight: 500 }}>
                AI SIGN LANGUAGE
              </div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '4px 10px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center',
              gap: '12px',
              padding: collapsed ? '11px 0' : '11px 12px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              borderRadius: '10px',
              textDecoration: 'none',
              transition: 'all 0.15s',
              color: isActive ? '#ffffff' : 'rgba(255,255,255,0.45)',
              background: isActive
                ? 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(0,102,255,0.15))'
                : 'transparent',
              borderLeft: isActive ? '2px solid #00d4ff' : '2px solid transparent',
              fontWeight: isActive ? 600 : 400,
              fontSize: '13.5px',
            })}>
              <span style={{ flexShrink: 0 }}><Icon /></span>
              {!collapsed && <span style={{ whiteSpace: 'nowrap' }}>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: collapsed ? '16px 0' : '16px',
          display: 'flex', alignItems: 'center',
          gap: '10px', justifyContent: collapsed ? 'center' : 'flex-start',
        }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #00d4ff, #0066ff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '12px', fontWeight: 700, color: '#fff', flexShrink: 0,
          }}>{initials}</div>
          {!collapsed && (
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name || 'User'}
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.email || ''}
              </div>
            </div>
          )}
          {!collapsed && (
            <button onClick={handleLogout} title="Logout" style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,0.3)', padding: '4px',
              borderRadius: '6px', display: 'flex', alignItems: 'center',
              transition: 'color 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.color = '#ff6b6b'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          )}
        </div>

        {/* Collapse toggle */}
        <button onClick={() => setCollapsed(!collapsed)} style={{
          position: 'absolute', top: '50%', right: '-12px',
          transform: 'translateY(-50%)',
          width: '24px', height: '24px', borderRadius: '50%',
          background: '#0a1628', border: '1px solid rgba(255,255,255,0.12)',
          cursor: 'pointer', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 20, color: 'rgba(255,255,255,0.5)',
          transition: 'all 0.2s',
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            {collapsed
              ? <polyline points="9 18 15 12 9 6"/>
              : <polyline points="15 18 9 12 15 6"/>}
          </svg>
        </button>
      </aside>

      {/* ── MAIN AREA ───────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Top bar */}
        <header style={{
          height: '64px', flexShrink: 0,
          background: '#ffffff',
          borderBottom: '1px solid #e8edf2',
          display: 'flex', alignItems: 'center',
          padding: '0 28px', gap: '16px',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#0a1628' }}>
              {greeting}, {user?.name?.split(' ')[0] || 'there'} 👋
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>
              {time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* Live clock */}
            <div style={{
              fontSize: '13px', fontWeight: 600,
              color: '#0a1628', letterSpacing: '0.5px',
              fontVariantNumeric: 'tabular-nums',
              background: '#f0f4f8', padding: '6px 14px', borderRadius: '8px',
            }}>
              {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </div>

            {/* Status pill */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 14px', borderRadius: '20px',
              background: 'rgba(0,200,120,0.08)',
              border: '1px solid rgba(0,200,120,0.2)',
            }}>
              <div style={{
                width: '6px', height: '6px', borderRadius: '50%',
                background: '#00c878',
                boxShadow: '0 0 6px #00c878',
                animation: 'pulse 2s infinite',
              }} />
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#00a864' }}>
                System Online
              </span>
            </div>

            {/* Avatar */}
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #00d4ff, #0066ff)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '13px', fontWeight: 700, color: '#fff', cursor: 'pointer',
            }}>{initials}</div>
          </div>
        </header>

        {/* Page content */}
        <main style={{
          flex: 1, overflow: 'auto',
          padding: '28px',
          background: '#f0f4f8',
        }}>
          <Outlet />
        </main>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.2); }
        }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        a { text-decoration: none; }
      `}</style>
    </div>
  )
}
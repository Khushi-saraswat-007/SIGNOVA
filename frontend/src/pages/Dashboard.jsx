import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/dashboard', icon: '🏠', label: 'Home', end: true },
  { to: '/dashboard/live', icon: '📸', label: 'Live Detection' },
  { to: '/dashboard/conversation', icon: '💬', label: 'Conversation' },
  { to: '/dashboard/learn', icon: '📚', label: 'Learn Signs' },
  { to: '/dashboard/history', icon: '📋', label: 'History' },
  { to: '/dashboard/settings', icon: '⚙️', label: 'Settings' },
]

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div style={{
      height: '100vh', width: '100vw', overflow: 'hidden',
      display: 'flex',
      background: 'linear-gradient(135deg, #0f0a1e 0%, #0d1117 50%, #0a0f1e 100%)',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      color: '#e2d9f3'
    }}>

      {/* SIDEBAR */}
      <aside style={{
        width: '240px', minWidth: '240px',
        height: '100vh',
        display: 'flex', flexDirection: 'column',
        background: 'rgba(255,255,255,0.02)',
        borderRight: '1px solid rgba(139,92,246,0.12)',
        backdropFilter: 'blur(20px)',
        position: 'relative', zIndex: 10
      }}>

        {/* Logo */}
        <div style={{
          padding: '28px 24px 20px',
          borderBottom: '1px solid rgba(139,92,246,0.1)'
        }}>
          <div style={{
            fontSize: '1.2rem', fontWeight: 900,
            background: 'linear-gradient(135deg, #a78bfa, #38bdf8)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>🤟 SIGNOVA</div>
          <div style={{ fontSize: '0.72rem', color: '#4a3f6b', marginTop: '4px', letterSpacing: '1px' }}>
            AI SIGN LANGUAGE
          </div>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '11px 14px', borderRadius: '12px',
                textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500,
                transition: 'all 0.2s',
                background: isActive ? 'linear-gradient(135deg, rgba(124,58,237,0.25), rgba(37,99,235,0.15))' : 'transparent',
                color: isActive ? '#c4b5fd' : '#7c6d9c',
                border: isActive ? '1px solid rgba(139,92,246,0.3)' : '1px solid transparent',
                boxShadow: isActive ? '0 0 20px rgba(124,58,237,0.1)' : 'none'
              })}
            >
              <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div style={{
          padding: '16px 12px',
          borderTop: '1px solid rgba(139,92,246,0.1)'
        }}>
          {/* User info */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 12px', marginBottom: '8px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(139,92,246,0.12)',
            borderRadius: '12px'
          }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.9rem', fontWeight: 700, color: 'white'
            }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2d9f3', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#4a3f6b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.email}
              </div>
            </div>
          </div>

          {/* Logout */}
          <button onClick={handleLogout} style={{
            width: '100%', padding: '10px 14px',
            background: 'rgba(239,68,68,0.06)',
            border: '1px solid rgba(239,68,68,0.15)',
            borderRadius: '10px', color: '#f87171',
            cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: '8px',
            transition: 'all 0.2s'
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.12)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.06)'}
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main style={{
        flex: 1, height: '100vh',
        overflow: 'auto', position: 'relative'
      }}>
        {/* Top bar */}
        <div style={{
          padding: '20px 32px',
          borderBottom: '1px solid rgba(139,92,246,0.08)',
          background: 'rgba(255,255,255,0.01)',
          backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#4a3f6b', letterSpacing: '1px' }}>DASHBOARD</div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: '#c4b5fd' }}>
              Welcome back, {user?.name?.split(' ')[0]} 👋
            </div>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '7px 14px',
            background: 'rgba(52,211,153,0.08)',
            border: '1px solid rgba(52,211,153,0.2)',
            borderRadius: '20px'
          }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#34d399', boxShadow: '0 0 6px #34d399' }} />
            <span style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: 600 }}>System Online</span>
          </div>
        </div>

        {/* Page content */}
        <div style={{ padding: '32px' }}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
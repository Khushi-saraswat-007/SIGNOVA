import { useNavigate } from 'react-router-dom'

export default function DashboardHome() {
  const navigate = useNavigate()

  const stats = [
    { icon: '🤟', label: 'Signs Detected', value: '0', sub: 'Start detecting to see stats', color: '#a78bfa', glow: 'rgba(167,139,250,0.2)' },
    { icon: '💬', label: 'Conversations', value: '0', sub: 'No conversations yet', color: '#38bdf8', glow: 'rgba(56,189,248,0.2)' },
    { icon: '📚', label: 'Signs Learned', value: '0', sub: 'Start learning today', color: '#34d399', glow: 'rgba(52,211,153,0.2)' },
    { icon: '⏱️', label: 'Time Active', value: '0m', sub: 'Total usage time', color: '#fbbf24', glow: 'rgba(251,191,36,0.2)' },
  ]

  const quickActions = [
    {
      icon: '📸', title: 'Live Detection',
      desc: 'Start real-time sign language recognition using your camera',
      color: '#a78bfa', border: 'rgba(167,139,250,0.25)',
      bg: 'rgba(167,139,250,0.06)', route: '/dashboard/live',
      btn: 'Start Detecting'
    },
    {
      icon: '💬', title: 'Conversation Mode',
      desc: 'Two-way communication between sign and non-sign language users',
      color: '#38bdf8', border: 'rgba(56,189,248,0.25)',
      bg: 'rgba(56,189,248,0.06)', route: '/dashboard/conversation',
      btn: 'Start Conversation'
    },
    {
      icon: '📚', title: 'Learn Sign Language',
      desc: 'Interactive lessons and practice with AI feedback',
      color: '#34d399', border: 'rgba(52,211,153,0.25)',
      bg: 'rgba(52,211,153,0.06)', route: '/dashboard/learn',
      btn: 'Start Learning'
    },
  ]

  const recentActivity = [
    { icon: '🤟', text: 'No recent activity yet', time: '', empty: true },
  ]

  const tips = [
    { icon: '💡', text: 'Make sure your hand is clearly visible in the camera frame' },
    { icon: '🌟', text: 'Use good lighting for better gesture detection accuracy' },
    { icon: '📏', text: 'Keep your hand about 30-60cm away from the camera' },
  ]

  return (
    <div style={{ color: '#e2d9f3', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '6px' }}>
          Dashboard Overview
        </h1>
        <p style={{ color: '#7c6d9c', fontSize: '0.9rem' }}>
          Welcome to Signova! Here's everything at a glance.
        </p>
      </div>

      {/* Stats row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px', marginBottom: '28px'
      }}>
        {stats.map((s, i) => (
          <div key={i} style={{
            padding: '20px',
            background: 'rgba(255,255,255,0.03)',
            border: `1px solid ${s.border || 'rgba(139,92,246,0.15)'}`,
            borderRadius: '16px',
            backdropFilter: 'blur(10px)',
            position: 'relative', overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute', top: '-20px', right: '-20px',
              width: '80px', height: '80px',
              background: `radial-gradient(circle, ${s.glow} 0%, transparent 70%)`,
              pointerEvents: 'none'
            }} />
            <div style={{ fontSize: '1.8rem', marginBottom: '10px' }}>{s.icon}</div>
            <div style={{
              fontSize: '1.8rem', fontWeight: 800,
              color: s.color, marginBottom: '4px'
            }}>{s.value}</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#c4b5fd', marginBottom: '4px' }}>{s.label}</div>
            <div style={{ fontSize: '0.75rem', color: '#4a3f6b' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions + Tips row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px', marginBottom: '28px' }}>

        {/* Quick Actions */}
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px', color: '#a89bc2', letterSpacing: '0.5px' }}>
            ⚡ QUICK ACTIONS
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {quickActions.map((a, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '16px',
                padding: '18px 20px',
                background: a.bg,
                border: `1px solid ${a.border}`,
                borderRadius: '16px', backdropFilter: 'blur(10px)',
                transition: 'transform 0.2s', cursor: 'default'
              }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateX(4px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}
              >
                <div style={{
                  width: '48px', height: '48px', borderRadius: '14px', flexShrink: 0,
                  background: `rgba(${a.color === '#a78bfa' ? '167,139,250' : a.color === '#38bdf8' ? '56,189,248' : '52,211,153'},0.15)`,
                  border: `1px solid ${a.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.4rem'
                }}>{a.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#e2d9f3', marginBottom: '3px' }}>{a.title}</div>
                  <div style={{ fontSize: '0.8rem', color: '#7c6d9c' }}>{a.desc}</div>
                </div>
                <button onClick={() => navigate(a.route)} style={{
                  padding: '8px 18px', flexShrink: 0,
                  background: `rgba(${a.color === '#a78bfa' ? '167,139,250' : a.color === '#38bdf8' ? '56,189,248' : '52,211,153'},0.15)`,
                  border: `1px solid ${a.border}`,
                  borderRadius: '10px', color: a.color,
                  cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
                  whiteSpace: 'nowrap'
                }}>
                  {a.btn} →
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Tips panel */}
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px', color: '#a89bc2', letterSpacing: '0.5px' }}>
            🎯 TIPS FOR BEST RESULTS
          </h2>
          <div style={{
            padding: '20px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(139,92,246,0.15)',
            borderRadius: '16px', height: 'calc(100% - 34px)',
            display: 'flex', flexDirection: 'column', gap: '14px'
          }}>
            {tips.map((t, i) => (
              <div key={i} style={{
                display: 'flex', gap: '12px', alignItems: 'flex-start',
                padding: '12px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(139,92,246,0.1)',
                borderRadius: '10px'
              }}>
                <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{t.icon}</span>
                <span style={{ fontSize: '0.82rem', color: '#9d8ec0', lineHeight: 1.6 }}>{t.text}</span>
              </div>
            ))}

            {/* Status */}
            <div style={{
              marginTop: 'auto', padding: '14px',
              background: 'linear-gradient(135deg, rgba(52,211,153,0.08), rgba(56,189,248,0.06))',
              border: '1px solid rgba(52,211,153,0.2)',
              borderRadius: '12px', textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>🤖</div>
              <div style={{ fontSize: '0.82rem', color: '#34d399', fontWeight: 600, marginBottom: '4px' }}>AI Model Ready</div>
              <div style={{ fontSize: '0.75rem', color: '#4a3f6b' }}>System is online and ready to detect</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px', color: '#a89bc2', letterSpacing: '0.5px' }}>
          🕐 RECENT ACTIVITY
        </h2>
        <div style={{
          padding: '24px',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(139,92,246,0.12)',
          borderRadius: '16px', textAlign: 'center'
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📭</div>
          <div style={{ color: '#7c6d9c', fontSize: '0.9rem', marginBottom: '16px' }}>
            No activity yet. Start using Signova to see your history here!
          </div>
          <button onClick={() => navigate('/dashboard/live')} style={{
            padding: '10px 24px',
            background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
            color: 'white', border: 'none', borderRadius: '10px',
            cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600,
            boxShadow: '0 0 20px rgba(124,58,237,0.3)'
          }}>
            Start Live Detection →
          </button>
        </div>
      </div>

    </div>
  )
}
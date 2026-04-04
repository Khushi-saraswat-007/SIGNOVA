import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const TIPS = [
  "Show your hand clearly in good lighting for best detection accuracy.",
  "Emergency mode uses 30-frame sequences — hold each gesture for 1 second.",
  "Collect more samples for signs that are frequently misdetected.",
  "Keep your hand within the camera frame at all times during detection.",
  "Use the quiz mode to practice and improve your signing accuracy.",
]

const typeConfig = {
  detection:    { icon: '🎥', label: 'Detection',    color: '#0066ff', bg: 'rgba(0,102,255,0.08)'   },
  conversation: { icon: '💬', label: 'Conversation', color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)' },
  emergency:    { icon: '🆘', label: 'Emergency',    color: '#ef4444', bg: 'rgba(239,68,68,0.08)'  },
  learning:     { icon: '📚', label: 'Learning',     color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
}

function toLocalDate(created_at) {
  if (!created_at) return null
  const str = created_at.includes('Z') ? created_at : created_at + 'Z'
  return new Date(str)
}
function formatTime(created_at) {
  const d = toLocalDate(created_at)
  return d ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
}
function formatDate(created_at) {
  const d = toLocalDate(created_at)
  if (!d) return ''
  const today     = new Date().toLocaleDateString('en-CA')
  const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('en-CA')
  const local     = d.toLocaleDateString('en-CA')
  if (local === today)     return 'Today'
  if (local === yesterday) return 'Yesterday'
  return d.toLocaleDateString('en-IN')
}

export default function DashboardHome() {
  const { user }      = useAuth()
  const navigate      = useNavigate()
  const location      = useLocation()
  const [tip, setTip] = useState(0)
  const [history,  setHistory]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [aiStatus, setAiStatus] = useState({ rf: false, lstm: false, mediapipe: false })

  useEffect(() => {
    const t = setInterval(() => setTip(p => (p + 1) % TIPS.length), 5000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return
      setLoading(true)
      try {
        const token = localStorage.getItem('token')
        const [histRes, statusRes] = await Promise.all([
          axios.get(`${API}/api/history/user/${user.id}`,
            { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API}/api/status`).catch(() => ({ data: {} }))
        ])
        setHistory(histRes.data || [])
        setAiStatus({
          rf:        statusRes.data?.rf_model_loaded   || false,
          lstm:      statusRes.data?.lstm_model_loaded || false,
          mediapipe: statusRes.data?.mediapipe_loaded  || false,
        })
      } catch (err) {
        console.error('Dashboard fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user, location.key])

  const parseSigns = (str) =>
    str ? str.split(',').map(s => s.trim()).filter(Boolean) : []

  // Stats
  const totalSessions  = history.length
  const totalSigns     = history.reduce((a, h) => a + parseSigns(h.detected_signs).length, 0)
  const emergencyCount = history.filter(h => h.session_type === 'emergency').length
  const allSigns       = history.flatMap(h => parseSigns(h.detected_signs))
  const signFreq       = allSigns.reduce((acc, s) => { acc[s] = (acc[s] || 0) + 1; return acc }, {})
  const topSign        = Object.keys(signFreq).sort((a, b) => signFreq[b] - signFreq[a])[0] || '—'
  const topCount       = signFreq[topSign] || 0
  const topSigns       = Object.entries(signFreq).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const maxCount       = topSigns[0]?.[1] || 1
  const recentSessions = history.slice(0, 6)
  const allOnline      = aiStatus.rf && aiStatus.lstm && aiStatus.mediapipe

  const card = {
    background: '#ffffff', border: '1px solid #e8edf2',
    borderRadius: '14px',
  }

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',system-ui,sans-serif", color: '#0a1628', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* ── SECTION 1 — Stats row ──────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px' }}>
        {[
          { icon: '🤟', label: 'TOTAL SIGNS',   value: loading ? '...' : totalSigns,    sub: 'All sessions combined',    color: '#0066ff' },
          { icon: '📋', label: 'SESSIONS',       value: loading ? '...' : totalSessions, sub: 'Detection + conversation', color: '#8b5cf6' },
          { icon: '🆘', label: 'EMERGENCY',      value: loading ? '...' : emergencyCount,sub: 'Emergency mode uses',       color: '#ef4444' },
          { icon: '⭐', label: 'TOP SIGN',        value: loading ? '...' : topSign,       sub: loading ? '' : `${topCount} detections`,color: '#f59e0b' },
        ].map((s, i) => (
          <div key={i} style={{ ...card, padding: '18px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: s.color }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', letterSpacing: '1px' }}>{s.label}</div>
              <div style={{ fontSize: '18px' }}>{s.icon}</div>
            </div>
            <div style={{ fontSize: s.label === 'TOP SIGN' ? '18px' : '28px', fontWeight: 900, color: '#0a1628', letterSpacing: '-0.5px', marginBottom: '4px' }}>{s.value}</div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── SECTION 2 — Main 2-col ─────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: '14px', alignItems: 'start' }}>

        {/* Sessions table */}
        <div style={{ ...card, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f4f8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0a1628' }}>Recent Sessions</div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>Auto-saved after each session</div>
            </div>
            <button onClick={() => navigate('/dashboard/history')} style={{ fontSize: '12px', fontWeight: 600, color: '#0066ff', background: 'rgba(0,102,255,0.06)', border: '1px solid rgba(0,102,255,0.15)', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer' }}>
              View all →
            </button>
          </div>

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>Loading sessions...</div>
          ) : recentSessions.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center' }}>
              <div style={{ fontSize: '36px', marginBottom: '10px' }}>📭</div>
              <div style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '14px' }}>No sessions yet</div>
              <button onClick={() => navigate('/dashboard/live')} style={{ padding: '8px 20px', background: '#0066ff', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                Start Detection →
              </button>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['SESSION', 'TYPE', 'SIGNS', 'DURATION', 'DATE / TIME'].map((h, i) => (
                    <td key={i} style={{ padding: '8px ' + (i === 0 ? '20px 8px' : i === 4 ? '8px 20px' : '8px'), fontSize: '10px', fontWeight: 700, color: '#94a3b8', letterSpacing: '1px', whiteSpace: 'nowrap' }}>{h}</td>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentSessions.map((item, i) => {
                  const tc    = typeConfig[item.session_type] || typeConfig.detection
                  const signs = parseSigns(item.detected_signs)
                  return (
                    <tr key={item.id} onClick={() => navigate('/dashboard/history')} style={{ borderTop: '1px solid #f0f4f8', cursor: 'pointer', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '12px 8px 12px 20px' }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#0a1628' }}>{item.session_name}</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                          {signs.slice(0, 3).join(', ')}{signs.length > 3 ? ` +${signs.length - 3}` : ''}
                        </div>
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, background: tc.bg, color: tc.color }}>
                          {tc.icon} {tc.label}
                        </span>
                      </td>
                      <td style={{ padding: '12px 8px', fontSize: '16px', fontWeight: 900, color: tc.color }}>{signs.length}</td>
                      <td style={{ padding: '12px 8px', fontSize: '13px', color: '#64748b' }}>{item.duration}</td>
                      <td style={{ padding: '12px 20px 12px 8px', textAlign: 'right' }}>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>{formatTime(item.created_at)}</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>{formatDate(item.created_at)}</div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Quick launch 2x2 */}
          <div style={{ ...card, padding: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0a1628', marginBottom: '12px' }}>Quick Launch</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {[
                { icon: '🎥', label: 'Detect',    to: '/dashboard/live',         color: '#0066ff', bg: 'rgba(0,102,255,0.06)',   border: 'rgba(0,102,255,0.15)'  },
                { icon: '🆘', label: 'Emergency', to: '/dashboard/live',         color: '#ef4444', bg: 'rgba(239,68,68,0.06)',   border: 'rgba(239,68,68,0.15)'  },
                { icon: '💬', label: 'Converse',  to: '/dashboard/conversation', color: '#8b5cf6', bg: 'rgba(139,92,246,0.06)', border: 'rgba(139,92,246,0.15)' },
                { icon: '📚', label: 'Learn',     to: '/dashboard/learn',        color: '#10b981', bg: 'rgba(16,185,129,0.06)', border: 'rgba(16,185,129,0.15)' },
              ].map((a, i) => (
                <button key={i} onClick={() => navigate(a.to)} style={{ padding: '12px 8px', background: a.bg, border: `1px solid ${a.border}`, borderRadius: '10px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{ fontSize: '20px', marginBottom: '5px' }}>{a.icon}</div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: a.color }}>{a.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Dark system status */}
          <div style={{ background: '#0a1628', borderRadius: '14px', padding: '16px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: allOnline ? 'linear-gradient(90deg,#00d4ff,#0066ff)' : 'linear-gradient(90deg,#ef4444,#f59e0b)' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '1px' }}>SYSTEM</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '20px', background: allOnline ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${allOnline ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
                <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: allOnline ? '#10b981' : '#ef4444', animation: 'blink 2s infinite' }} />
                <span style={{ fontSize: '10px', fontWeight: 700, color: allOnline ? '#10b981' : '#ef4444' }}>{allOnline ? 'All Online' : 'Partial'}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { label: '👁️ MediaPipe', ok: aiStatus.mediapipe },
                { label: '🤟 RF Model',  ok: aiStatus.rf        },
                { label: '🧠 LSTM',      ok: aiStatus.lstm      },
                { label: '⚡ WebSocket', ok: true               },
                { label: '💾 Database',  ok: true               },
              ].map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{m.label}</span>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: m.ok ? '#10b981' : '#ef4444' }}>
                    {m.ok ? '● Active' : '● Offline'}
                  </span>
                </div>
              ))}
            </div>

            {/* Tip */}
            <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '1px' }}>💡 TIP</div>
                <div style={{ display: 'flex', gap: '3px' }}>
                  {TIPS.map((_, i) => (
                    <div key={i} style={{ width: i === tip ? '12px' : '4px', height: '4px', borderRadius: '2px', background: i === tip ? '#00d4ff' : 'rgba(255,255,255,0.15)', transition: 'all 0.3s' }} />
                  ))}
                </div>
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7 }}>{TIPS[tip]}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 3 — Top signs bar chart ───────────────────── */}
      <div style={{ ...card, padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#0a1628' }}>Top Detected Signs</div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>Frequency across all your sessions</div>
          </div>
          <button onClick={() => navigate('/dashboard/learn')} style={{ fontSize: '12px', fontWeight: 600, color: '#8b5cf6', background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer' }}>
            Practice →
          </button>
        </div>

        {topSigns.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px', color: '#94a3b8', fontSize: '13px' }}>
            No signs detected yet — start a session!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {topSigns.map(([sign, count], i) => {
              const pct    = Math.round((count / maxCount) * 100)
              const colors = ['#0066ff', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444']
              const color  = colors[i] || '#94a3b8'
              return (
                <div key={sign} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: `${color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, color, flexShrink: 0 }}>
                    {i + 1}
                  </div>
                  <div style={{ width: '110px', fontSize: '13px', fontWeight: 700, color: '#0a1628', flexShrink: 0 }}>{sign}</div>
                  <div style={{ flex: 1, height: '8px', background: '#f0f4f8', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '4px', transition: 'width 0.5s ease' }} />
                  </div>
                  <div style={{ width: '40px', textAlign: 'right', fontSize: '13px', fontWeight: 800, color, flexShrink: 0 }}>{count}</div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── SECTION 4 — Model info row ─────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px' }}>
        {[
          { icon: '🧠', label: 'Model Stack',     value: 'RF + LSTM Ensemble',     sub: 'Dual AI model system',        color: '#8b5cf6' },
          { icon: '✋', label: 'Signs Supported',  value: '9 Static + 10 Emergency', sub: 'Total 19 gestures',           color: '#0066ff' },
          { icon: '⚡', label: 'Detection Speed',  value: '~50ms per frame',         sub: '150ms frame interval',        color: '#10b981' },
        ].map((info, i) => (
          <div key={i} style={{ ...card, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0, background: `${info.color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>{info.icon}</div>
            <div>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', letterSpacing: '1px', marginBottom: '3px' }}>{info.label.toUpperCase()}</div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#0a1628' }}>{info.value}</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>{info.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        * { box-sizing: border-box; }
        tr:hover td { background: #f8fafc; }
      `}</style>
    </div>
  )
}
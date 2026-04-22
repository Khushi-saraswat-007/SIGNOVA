import { useState, useEffect } from 'react'
import { useNavigate, useLocation, useOutletContext } from 'react-router-dom'
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
  detection:    { icon: '🎥', label: 'Detection',    color: '#6366f1', bg: 'rgba(99,102,241,0.1)'   },
  conversation: { icon: '💬', label: 'Conversation', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)'  },
  emergency:    { icon: '🆘', label: 'Emergency',    color: '#ef4444', bg: 'rgba(239,68,68,0.1)'   },
  learning:     { icon: '📚', label: 'Learning',     color: '#10b981', bg: 'rgba(16,185,129,0.1)'  },
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
  const ctx           = useOutletContext?.() || {}
  const dark          = ctx.dark ?? (localStorage.getItem('signova_theme') !== 'light')
  const [isMobile, setIsMobile] = useState(false)

  const [tip,      setTip]      = useState(0)
  const [history,  setHistory]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [aiStatus, setAiStatus] = useState({ rf: false, lstm: false, mediapipe: false })

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

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
          axios.get(`${API}/api/history/user/${user.id}`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API}/api/status`).catch(() => ({ data: {} }))
        ])
        setHistory(Array.isArray(histRes.data) ? histRes.data : [])
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

  const parseSigns = (str) => str ? str.split(',').map(s => s.trim()).filter(Boolean) : []

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

  // Theme
  const cardBg     = dark ? '#0d1035' : '#ffffff'
  const cardBorder = dark ? '#1e2448' : '#e8edf2'
  const textColor  = dark ? '#f1f5f9' : '#0a1628'
  const textMuted  = dark ? '#64748b' : '#94a3b8'
  const rowHover   = dark ? '#111442' : '#f8fafc'
  const subBg      = dark ? '#111442' : '#f8fafc'
  const subBorder  = dark ? '#1e2448' : '#f0f4f8'

  const card = {
    background: cardBg,
    border: `1px solid ${cardBorder}`,
    borderRadius: '14px',
    transition: 'background .4s, border-color .4s',
  }

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',system-ui,sans-serif", color: textColor, display: 'flex', flexDirection: 'column', gap: '14px' }}>

      {/* ── STATS ROW ──────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: '12px' }}>
        {[
          { icon: '🤟', label: 'TOTAL SIGNS',  value: loading ? '...' : totalSigns,     sub: 'All sessions combined',    color: '#6366f1' },
          { icon: '📋', label: 'SESSIONS',      value: loading ? '...' : totalSessions,  sub: 'Detection + conversation', color: '#8b5cf6' },
          { icon: '🆘', label: 'EMERGENCY',     value: loading ? '...' : emergencyCount, sub: 'Emergency mode uses',       color: '#ef4444' },
          { icon: '⭐', label: 'TOP SIGN',       value: loading ? '...' : topSign,        sub: loading ? '' : `${topCount} detections`, color: '#f59e0b' },
        ].map((s, i) => (
          <div key={i} style={{ ...card, padding: '16px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: s.color }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: textMuted, letterSpacing: '1px' }}>{s.label}</div>
              <div style={{ fontSize: '16px' }}>{s.icon}</div>
            </div>
            <div style={{ fontSize: s.label === 'TOP SIGN' ? '16px' : '26px', fontWeight: 900, color: textColor, letterSpacing: '-.5px', marginBottom: '3px' }}>{s.value}</div>
            <div style={{ fontSize: '11px', color: textMuted }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── MAIN 2-COL ─────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 260px', gap: '14px', alignItems: 'start' }}>

        {/* Sessions table */}
        <div style={{ ...card, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: `1px solid ${cardBorder}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: textColor }}>Recent Sessions</div>
              <div style={{ fontSize: '12px', color: textMuted }}>Auto-saved after each session</div>
            </div>
            <button onClick={() => navigate('/dashboard/history')} style={{
              fontSize: '12px', fontWeight: 600, color: '#6366f1',
              background: 'rgba(99,102,241,.08)', border: '1px solid rgba(99,102,241,.2)',
              padding: '6px 14px', borderRadius: '8px', cursor: 'pointer',
            }}>View all →</button>
          </div>

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: textMuted, fontSize: '13px' }}>Loading sessions...</div>
          ) : recentSessions.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center' }}>
              <div style={{ fontSize: '36px', marginBottom: '10px' }}>📭</div>
              <div style={{ color: textMuted, fontSize: '14px', marginBottom: '14px' }}>No sessions yet</div>
              <button onClick={() => navigate('/dashboard/live')} style={{
                padding: '8px 20px', background: '#6366f1', border: 'none',
                borderRadius: '8px', color: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
              }}>Start Detection →</button>
            </div>
          ) : isMobile ? (
            // Mobile: card list instead of table
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {recentSessions.map((item, i) => {
                const tc    = typeConfig[item.session_type] || typeConfig.detection
                const signs = parseSigns(item.detected_signs)
                return (
                  <div key={item.id} onClick={() => navigate('/dashboard/history')}
                    style={{ padding: '12px 16px', borderTop: i === 0 ? 'none' : `1px solid ${cardBorder}`, cursor: 'pointer', transition: 'background .15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = rowHover}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: textColor }}>{item.session_name}</div>
                      <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, background: tc.bg, color: tc.color }}>{tc.icon} {tc.label}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <span style={{ fontSize: '11px', color: textMuted }}>{signs.length} signs</span>
                      <span style={{ fontSize: '11px', color: textMuted }}>{item.duration}</span>
                      <span style={{ fontSize: '11px', color: textMuted }}>{formatTime(item.created_at)} · {formatDate(item.created_at)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: subBg }}>
                  {['SESSION', 'TYPE', 'SIGNS', 'DURATION', 'DATE / TIME'].map((h, i) => (
                    <td key={i} style={{ padding: '8px ' + (i === 0 ? '18px 8px' : i === 4 ? '8px 18px' : '8px'), fontSize: '10px', fontWeight: 700, color: textMuted, letterSpacing: '1px', whiteSpace: 'nowrap' }}>{h}</td>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentSessions.map((item, i) => {
                  const tc    = typeConfig[item.session_type] || typeConfig.detection
                  const signs = parseSigns(item.detected_signs)
                  return (
                    <tr key={item.id} onClick={() => navigate('/dashboard/history')}
                      style={{ borderTop: `1px solid ${subBorder}`, cursor: 'pointer', transition: 'background .15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = rowHover}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '11px 8px 11px 18px' }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: textColor }}>{item.session_name}</div>
                        <div style={{ fontSize: '11px', color: textMuted, marginTop: '2px' }}>
                          {signs.slice(0, 3).join(', ')}{signs.length > 3 ? ` +${signs.length - 3}` : ''}
                        </div>
                      </td>
                      <td style={{ padding: '11px 8px' }}>
                        <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, background: tc.bg, color: tc.color }}>
                          {tc.icon} {tc.label}
                        </span>
                      </td>
                      <td style={{ padding: '11px 8px', fontSize: '16px', fontWeight: 900, color: tc.color }}>{signs.length}</td>
                      <td style={{ padding: '11px 8px', fontSize: '13px', color: textMuted }}>{item.duration}</td>
                      <td style={{ padding: '11px 18px 11px 8px', textAlign: 'right' }}>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: textColor }}>{formatTime(item.created_at)}</div>
                        <div style={{ fontSize: '11px', color: textMuted }}>{formatDate(item.created_at)}</div>
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

          {/* Quick launch */}
          <div style={{ ...card, padding: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: textColor, marginBottom: '12px' }}>Quick Launch</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {[
                { icon: '🎥', label: 'Detect',    to: '/dashboard/live',         color: '#6366f1', bg: 'rgba(99,102,241,.08)',  border: 'rgba(99,102,241,.2)'  },
                { icon: '🆘', label: 'Emergency', to: '/dashboard/live',         color: '#ef4444', bg: 'rgba(239,68,68,.08)',   border: 'rgba(239,68,68,.2)'   },
                { icon: '💬', label: 'Converse',  to: '/dashboard/conversation', color: '#8b5cf6', bg: 'rgba(139,92,246,.08)', border: 'rgba(139,92,246,.2)'  },
                { icon: '📚', label: 'Learn',     to: '/dashboard/learn',        color: '#10b981', bg: 'rgba(16,185,129,.08)', border: 'rgba(16,185,129,.2)'  },
              ].map((a, i) => (
                <button key={i} onClick={() => navigate(a.to)} style={{
                  padding: '12px 8px', background: a.bg, border: `1px solid ${a.border}`,
                  borderRadius: '10px', cursor: 'pointer', textAlign: 'center', transition: 'all .15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{ fontSize: '20px', marginBottom: '5px' }}>{a.icon}</div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: a.color }}>{a.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* System status */}
          <div style={{ background: dark ? '#0a0f1e' : '#06091a', borderRadius: '14px', padding: '16px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: allOnline ? 'linear-gradient(90deg,#6366f1,#06b6d4)' : 'linear-gradient(90deg,#ef4444,#f59e0b)' }} />
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(99,102,241,0.06) 1px, transparent 1px)', backgroundSize: '24px 24px', pointerEvents: 'none' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,.35)', letterSpacing: '1px' }}>SYSTEM</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '20px', background: allOnline ? 'rgba(16,185,129,.1)' : 'rgba(239,68,68,.1)', border: `1px solid ${allOnline ? 'rgba(16,185,129,.2)' : 'rgba(239,68,68,.2)'}` }}>
                <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: allOnline ? '#10b981' : '#ef4444', animation: 'blink 2s infinite' }} />
                <span style={{ fontSize: '10px', fontWeight: 700, color: allOnline ? '#10b981' : '#ef4444' }}>{allOnline ? 'All Online' : 'Partial'}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative', zIndex: 1 }}>
              {[
                { label: '👁️ MediaPipe', ok: aiStatus.mediapipe },
                { label: '🤟 RF Model',  ok: aiStatus.rf        },
                { label: '🧠 LSTM',      ok: aiStatus.lstm      },
                { label: '⚡ WebSocket', ok: true               },
                { label: '💾 Database',  ok: true               },
              ].map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,.5)' }}>{m.label}</span>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: m.ok ? '#10b981' : '#ef4444' }}>
                    {m.ok ? '● Active' : '● Offline'}
                  </span>
                </div>
              ))}
            </div>

            {/* Tip */}
            <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,.06)', position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,.35)', letterSpacing: '1px' }}>💡 TIP</div>
                <div style={{ display: 'flex', gap: '3px' }}>
                  {TIPS.map((_, i) => (
                    <div key={i} style={{ width: i === tip ? '12px' : '4px', height: '4px', borderRadius: '2px', background: i === tip ? '#6366f1' : 'rgba(255,255,255,.15)', transition: 'all .3s' }} />
                  ))}
                </div>
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.4)', lineHeight: 1.7 }}>{TIPS[tip]}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── TOP SIGNS CHART ────────────────────────────────────── */}
      <div style={{ ...card, padding: '18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: textColor }}>Top Detected Signs</div>
            <div style={{ fontSize: '12px', color: textMuted }}>Frequency across all your sessions</div>
          </div>
          <button onClick={() => navigate('/dashboard/learn')} style={{
            fontSize: '12px', fontWeight: 600, color: '#8b5cf6',
            background: 'rgba(139,92,246,.08)', border: '1px solid rgba(139,92,246,.2)',
            padding: '6px 14px', borderRadius: '8px', cursor: 'pointer',
          }}>Practice →</button>
        </div>

        {topSigns.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px', color: textMuted, fontSize: '13px' }}>
            No signs detected yet — start a session!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {topSigns.map(([sign, count], i) => {
              const pct    = Math.round((count / maxCount) * 100)
              const colors = ['#6366f1','#8b5cf6','#10b981','#f59e0b','#ef4444']
              const color  = colors[i] || textMuted
              return (
                <div key={sign} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '26px', height: '26px', borderRadius: '7px', flexShrink: 0, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, color }}>
                    {i + 1}
                  </div>
                  <div style={{ width: isMobile ? '80px' : '110px', fontSize: '13px', fontWeight: 700, color: textColor, flexShrink: 0 }}>{sign}</div>
                  <div style={{ flex: 1, height: '7px', background: dark ? '#1e2448' : '#f0f4f8', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: `linear-gradient(90deg,${color},${color}99)`, borderRadius: '4px', transition: 'width .5s ease' }} />
                  </div>
                  <div style={{ width: '36px', textAlign: 'right', fontSize: '13px', fontWeight: 800, color, flexShrink: 0 }}>{count}</div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── MODEL INFO ROW ─────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: '12px' }}>
        {[
          { icon: '🧠', label: 'Model Stack',    value: 'RF + LSTM Ensemble',      sub: 'Dual AI model system',   color: '#8b5cf6' },
          { icon: '✋', label: 'Signs Supported', value: '9 Static + 10 Emergency', sub: 'Total 19 gestures',      color: '#6366f1' },
          { icon: '⚡', label: 'Detection Speed', value: '~50ms per frame',          sub: '150ms frame interval',   color: '#10b981' },
        ].map((info, i) => (
          <div key={i} style={{ ...card, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', flexShrink: 0, background: `${info.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>{info.icon}</div>
            <div>
              <div style={{ fontSize: '10px', fontWeight: 700, color: textMuted, letterSpacing: '1px', marginBottom: '2px' }}>{info.label.toUpperCase()}</div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: textColor }}>{info.value}</div>
              <div style={{ fontSize: '11px', color: textMuted }}>{info.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }
        * { box-sizing:border-box; }
      `}</style>
    </div>
  )
}
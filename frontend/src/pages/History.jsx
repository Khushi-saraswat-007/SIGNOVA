import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLocation, useOutletContext } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const typeConfig = {
  detection:    { icon: '🎥', label: 'Live Detection', color: '#6366f1', bg: 'rgba(99,102,241,0.08)',  border: 'rgba(99,102,241,0.2)'  },
  conversation: { icon: '💬', label: 'Conversation',   color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.2)' },
  emergency:    { icon: '🆘', label: 'Emergency',      color: '#ef4444', bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.2)'  },
  learning:     { icon: '📚', label: 'Learning',       color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)' },
}

const filters = ['All', 'detection', 'conversation', 'emergency']

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
  if (!d) return 'Unknown'
  const localDateStr = d.toLocaleDateString('en-CA')
  const today        = new Date().toLocaleDateString('en-CA')
  const yesterday    = new Date(Date.now() - 86400000).toLocaleDateString('en-CA')
  if (localDateStr === today)     return 'Today'
  if (localDateStr === yesterday) return 'Yesterday'
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
}
function getLocalDateKey(created_at) {
  const d = toLocalDate(created_at)
  return d ? d.toLocaleDateString('en-CA') : 'Unknown'
}

export default function History() {
  const { user }    = useAuth()
  const location    = useLocation()
  const ctx         = useOutletContext?.() || {}
  const dark        = ctx.dark ?? (localStorage.getItem('signova_theme') !== 'light')
  const [isMobile, setIsMobile] = useState(false)

  const [history,    setHistory]    = useState([])
  const [loading,    setLoading]    = useState(true)
  const [filter,     setFilter]     = useState('All')
  const [selected,   setSelected]   = useState(null)
  const [search,     setSearch]     = useState('')
  const [deleting,   setDeleting]   = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const fetchHistory = async (isRefresh = false) => {
    if (!user?.id) return
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res   = await axios.get(`${API}/api/history/user/${user.id}`, { headers: { Authorization: `Bearer ${token}` } })
      setHistory(Array.isArray(res.data) ? res.data : [])
    } catch {
      toast.error('Failed to load history')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { fetchHistory() }, [user, location.key])

  const handleDelete = async (id) => {
    setDeleting(id)
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`${API}/api/history/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      setHistory(prev => prev.filter(h => h.id !== id))
      if (selected?.id === id) setSelected(null)
      toast.success('Session deleted!')
    } catch {
      toast.error('Failed to delete session')
    } finally {
      setDeleting(null)
    }
  }

  const parseSigns = (str) => str ? str.split(',').map(s => s.trim()).filter(Boolean) : []

  const filtered = history.filter(h => {
    const matchF = filter === 'All' || h.session_type === filter
    const signs  = parseSigns(h.detected_signs)
    const matchS = h.session_name?.toLowerCase().includes(search.toLowerCase()) ||
                   signs.some(s => s.toLowerCase().includes(search.toLowerCase()))
    return matchF && matchS
  })

  const totalSigns     = history.reduce((a, h) => a + parseSigns(h.detected_signs).length, 0)
  const totalSessions  = history.length
  const totalTime      = history.reduce((a, h) => a + (parseInt(h.duration) || 0), 0)
  const emergencyCount = history.filter(h => h.session_type === 'emergency').length

  const grouped = filtered.reduce((acc, item) => {
    const key = getLocalDateKey(item.created_at)
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {})

  // Theme
  const text      = dark ? '#f1f5f9' : '#0a1628'
  const textMuted = dark ? '#64748b' : '#94a3b8'
  const cardBg    = dark ? '#0d1035' : '#ffffff'
  const border    = dark ? '#1e2448' : '#e8edf2'
  const subBg     = dark ? '#111442' : '#f8fafc'
  const inputBg   = dark ? '#111442' : '#ffffff'
  const divider   = dark ? '#1e2448' : '#f0f4f8'

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',system-ui,sans-serif", color: text }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: text, letterSpacing: '-.5px', marginBottom: '4px' }}>
            Session History
          </h1>
          <p style={{ color: textMuted, fontSize: '13px' }}>All your past detection and conversation sessions</p>
        </div>
        <button onClick={() => fetchHistory(true)} style={{
          padding: '8px 16px',
          background: dark ? 'rgba(99,102,241,.08)' : subBg,
          border: `1.5px solid ${dark ? 'rgba(99,102,241,.2)' : border}`,
          borderRadius: '10px', color: textMuted,
          cursor: 'pointer', fontSize: '13px', fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: '6px', transition: 'all .15s',
        }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#6366f1'}
          onMouseLeave={e => e.currentTarget.style.borderColor = dark ? 'rgba(99,102,241,.2)' : border}
        >
          <span style={{ display: 'inline-block', animation: refreshing ? 'spin 1s linear infinite' : 'none' }}>🔄</span>
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* ── Stats ──────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: '12px', marginBottom: '20px' }}>
        {[
          { icon: '🤟', label: 'Total Signs',   value: loading ? '...' : totalSigns,      color: '#6366f1' },
          { icon: '📋', label: 'Sessions',       value: loading ? '...' : totalSessions,   color: '#8b5cf6' },
          { icon: '⏱️', label: 'Minutes Used',  value: loading ? '...' : `${totalTime}m`, color: '#10b981' },
          { icon: '🆘', label: 'Emergency Uses', value: loading ? '...' : emergencyCount,  color: '#ef4444' },
        ].map((s, i) => (
          <div key={i} style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: '14px', padding: '16px', position: 'relative', overflow: 'hidden', transition: 'background .4s, border-color .4s' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: s.color, opacity: .8 }} />
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', marginBottom: '8px' }}>{s.icon}</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: text, letterSpacing: '-.5px', marginBottom: '2px' }}>{s.value}</div>
            <div style={{ fontSize: '12px', color: textMuted }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Filters ────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
          <input type="text" placeholder="Search sessions or signs..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '10px 16px 10px 36px', background: inputBg, border: `1.5px solid ${border}`, borderRadius: '10px', color: text, fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontFamily: "'DM Sans','Segoe UI',system-ui", transition: 'border-color .2s' }}
            onFocus={e => e.target.style.borderColor = '#6366f1'}
            onBlur={e => e.target.style.borderColor = border}
          />
          <span style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: textMuted, fontSize: '14px' }}>🔍</span>
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {filters.map(f => {
            const tc = typeConfig[f]
            const active = filter === f
            return (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: '8px 14px',
                background: active ? (f === 'All' ? 'rgba(99,102,241,.12)' : tc.bg) : (dark ? 'rgba(255,255,255,.04)' : '#ffffff'),
                border: `1.5px solid ${active ? (f === 'All' ? '#6366f1' : tc.color) : border}`,
                borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 600,
                color: active ? (f === 'All' ? '#6366f1' : tc.color) : textMuted,
                transition: 'all .15s', display: 'flex', alignItems: 'center', gap: '5px',
              }}>
                {f === 'All' ? 'All Sessions' : `${tc.icon} ${tc.label}`}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Main Grid ──────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: selected && !isMobile ? '1fr 300px' : '1fr', gap: '16px', alignItems: 'start' }}>

        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px', background: cardBg, border: `1px solid ${border}`, borderRadius: '16px' }}>
              <div style={{ fontSize: '30px', marginBottom: '10px', animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</div>
              <div style={{ color: textMuted, marginTop: '10px' }}>Loading sessions...</div>
            </div>
          ) : Object.keys(grouped).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', background: cardBg, border: `1px solid ${border}`, borderRadius: '16px' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
              <div style={{ color: textMuted, fontSize: '14px' }}>
                {history.length === 0 ? 'No sessions yet — start detecting!' : 'No sessions match your filters'}
              </div>
            </div>
          ) : Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a)).map(dateKey => (
            <div key={dateKey} style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: dark ? '#818cf8' : '#334155' }}>
                  {formatDate(grouped[dateKey][0]?.created_at)}
                </div>
                <div style={{ flex: 1, height: '1px', background: divider }} />
                <div style={{ fontSize: '11px', color: textMuted }}>
                  {grouped[dateKey].length} session{grouped[dateKey].length > 1 ? 's' : ''}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {grouped[dateKey].map(item => {
                  const tc         = typeConfig[item.session_type] || typeConfig.detection
                  const signs      = parseSigns(item.detected_signs)
                  const isSelected = selected?.id === item.id
                  return (
                    <div key={item.id} onClick={() => setSelected(isSelected ? null : item)} style={{
                      background: cardBg,
                      border: `1.5px solid ${isSelected ? tc.color : border}`,
                      borderRadius: '14px', padding: '14px 18px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '12px',
                      transition: 'all .15s',
                      boxShadow: isSelected ? `0 0 0 3px ${tc.color}15` : 'none',
                    }}
                      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = '#6366f1' }}
                      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = border }}
                    >
                      <div style={{ width: '42px', height: '42px', borderRadius: '12px', flexShrink: 0, background: tc.bg, border: `1px solid ${tc.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>{tc.icon}</div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: text }}>{item.session_name}</span>
                          <span style={{ padding: '1px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, background: tc.bg, color: tc.color, border: `1px solid ${tc.border}`, flexShrink: 0 }}>{tc.label}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '12px', color: textMuted }}>🕐 {formatTime(item.created_at)}</span>
                          <span style={{ fontSize: '12px', color: textMuted }}>⏱ {item.duration}</span>
                          <span style={{ fontSize: '12px', color: tc.color, fontWeight: 600 }}>🤟 {signs.length} signs</span>
                        </div>
                      </div>

                      {!isMobile && (
                        <div style={{ display: 'flex', gap: '5px', flexShrink: 0, flexWrap: 'wrap', maxWidth: '160px', justifyContent: 'flex-end' }}>
                          {signs.slice(0, 3).map((s, i) => (
                            <span key={i} style={{ padding: '3px 9px', background: subBg, border: `1px solid ${border}`, borderRadius: '20px', fontSize: '11px', color: textMuted, fontWeight: 500 }}>{s}</span>
                          ))}
                          {signs.length > 3 && <span style={{ fontSize: '11px', color: textMuted, padding: '3px 4px', alignSelf: 'center' }}>+{signs.length - 3}</span>}
                        </div>
                      )}

                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={textMuted} strokeWidth="2" style={{ flexShrink: 0 }}>
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Detail panel */}
        {selected && (() => {
          const tc    = typeConfig[selected.session_type] || typeConfig.detection
          const signs = parseSigns(selected.detected_signs)
          return (
            <div style={{
              background: cardBg, border: `1.5px solid ${tc.color}40`,
              borderRadius: '16px', padding: '20px',
              position: isMobile ? 'fixed' : 'sticky',
              ...(isMobile ? { bottom: 0, left: 0, right: 0, zIndex: 50, borderRadius: '16px 16px 0 0', maxHeight: '70vh', overflowY: 'auto' } : { top: '0' }),
              boxShadow: `0 0 0 3px ${tc.color}08`,
              transition: 'background .4s',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: textMuted, letterSpacing: '1px' }}>SESSION DETAIL</div>
                <button onClick={() => setSelected(null)} style={{ background: subBg, border: `1px solid ${border}`, width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer', color: textMuted, fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
              </div>

              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 12px', marginBottom: '12px', background: tc.bg, border: `1px solid ${tc.border}`, borderRadius: '20px' }}>
                <span>{tc.icon}</span>
                <span style={{ fontSize: '12px', color: tc.color, fontWeight: 700 }}>{tc.label}</span>
              </div>

              <h3 style={{ fontSize: '15px', fontWeight: 800, color: text, marginBottom: '14px' }}>{selected.session_name}</h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                {[
                  { label: 'Date',     value: toLocalDate(selected.created_at)?.toLocaleDateString('en-IN') || '—' },
                  { label: 'Time',     value: formatTime(selected.created_at) },
                  { label: 'Duration', value: selected.duration },
                  { label: 'Signs',    value: `${signs.length} detected` },
                ].map((m, i) => (
                  <div key={i} style={{ padding: '10px 12px', background: subBg, border: `1px solid ${divider}`, borderRadius: '10px' }}>
                    <div style={{ fontSize: '10px', color: textMuted, fontWeight: 600, marginBottom: '3px', letterSpacing: '.5px' }}>{m.label.toUpperCase()}</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: text }}>{m.value}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: textMuted, letterSpacing: '1px', marginBottom: '8px' }}>SIGNS DETECTED</div>
                {signs.length === 0 ? (
                  <div style={{ fontSize: '13px', color: textMuted }}>No signs recorded</div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {signs.map((s, i) => (
                      <span key={i} style={{ padding: '4px 12px', background: tc.bg, border: `1px solid ${tc.border}`, borderRadius: '20px', fontSize: '12px', color: tc.color, fontWeight: 700 }}>{s}</span>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button onClick={() => { navigator.clipboard.writeText(signs.join(', ')); toast.success('Transcript copied!') }} style={{
                  width: '100%', padding: '10px', background: subBg, border: `1.5px solid ${border}`,
                  borderRadius: '10px', color: text, cursor: 'pointer', fontWeight: 600, fontSize: '13px',
                  transition: 'all .15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.color = '#6366f1' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = border; e.currentTarget.style.color = text }}
                >📋 Copy Transcript</button>
                <button onClick={() => handleDelete(selected.id)} disabled={deleting === selected.id} style={{
                  width: '100%', padding: '10px', background: 'rgba(239,68,68,.06)',
                  border: '1.5px solid rgba(239,68,68,.2)', borderRadius: '10px', color: '#ef4444',
                  cursor: deleting === selected.id ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '13px',
                  opacity: deleting === selected.id ? .6 : 1,
                }}
                  onMouseEnter={e => { if (deleting !== selected.id) e.currentTarget.style.background = 'rgba(239,68,68,.12)' }}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,.06)'}
                >
                  {deleting === selected.id ? '⏳ Deleting...' : '🗑 Delete Session'}
                </button>
              </div>
            </div>
          )
        })()}
      </div>

      {/* Mobile backdrop for detail panel */}
      {selected && isMobile && (
        <div onClick={() => setSelected(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 40 }} />
      )}

      <style>{`
        * { box-sizing:border-box; }
        input::placeholder { color:#64748b; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background:${dark ? '#1e2448' : '#e2e8f0'}; border-radius:2px; }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>
    </div>
  )
}
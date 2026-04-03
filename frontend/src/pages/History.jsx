import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLocation } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'

const typeConfig = {
  detection:    { icon: '🎥', label: 'Live Detection', color: '#0066ff', bg: 'rgba(0,102,255,0.06)',   border: 'rgba(0,102,255,0.2)'   },
  conversation: { icon: '💬', label: 'Conversation',   color: '#8b5cf6', bg: 'rgba(139,92,246,0.06)', border: 'rgba(139,92,246,0.2)' },
  emergency:    { icon: '🆘', label: 'Emergency',      color: '#ef4444', bg: 'rgba(239,68,68,0.06)',  border: 'rgba(239,68,68,0.2)'  },
  learning:     { icon: '📚', label: 'Learning',       color: '#10b981', bg: 'rgba(16,185,129,0.06)', border: 'rgba(16,185,129,0.2)' },
}

const filters = ['All', 'detection', 'conversation', 'emergency']

function toLocalDate(created_at) {
  if (!created_at) return null
  const str = created_at.includes('Z') ? created_at : created_at + 'Z'
  return new Date(str)
}

function formatTime(created_at) {
  const d = toLocalDate(created_at)
  if (!d) return ''
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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
  if (!d) return 'Unknown'
  return d.toLocaleDateString('en-CA')
}

export default function History() {
  const { user }    = useAuth()
  const location    = useLocation()
  const [history,   setHistory]  = useState([])
  const [loading,   setLoading]  = useState(true)
  const [filter,    setFilter]   = useState('All')
  const [selected,  setSelected] = useState(null)
  const [search,    setSearch]   = useState('')
  const [deleting,  setDeleting] = useState(null)
  const [refreshing,setRefreshing]= useState(false)

  const fetchHistory = async (isRefresh = false) => {
    if (!user?.id) return
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res   = await axios.get(
        `http://localhost:8000/api/history/user/${user.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setHistory(res.data || [])
    } catch {
      toast.error('Failed to load history')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // ← Refetch every time this page is visited
  useEffect(() => { fetchHistory() }, [user, location.key])

  const handleDelete = async (id) => {
    setDeleting(id)
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`http://localhost:8000/api/history/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setHistory(prev => prev.filter(h => h.id !== id))
      if (selected?.id === id) setSelected(null)
      toast.success('Session deleted!')
    } catch {
      toast.error('Failed to delete session')
    } finally {
      setDeleting(null)
    }
  }

  const parseSigns = (str) =>
    str ? str.split(',').map(s => s.trim()).filter(Boolean) : []

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

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',system-ui,sans-serif", color: '#0a1628' }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0a1628', letterSpacing: '-0.5px', marginBottom: '4px' }}>
            Session History
          </h1>
          <p style={{ color: '#64748b', fontSize: '13px' }}>All your past detection and conversation sessions</p>
        </div>
        <button onClick={() => fetchHistory(true)} style={{
          padding: '9px 18px',
          background: '#f8fafc', border: '1.5px solid #e2e8f0',
          borderRadius: '10px', color: '#64748b',
          cursor: 'pointer', fontSize: '13px', fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: '6px',
          transition: 'all 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#0066ff'}
          onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}
        >
          <span style={{ display: 'inline-block', animation: refreshing ? 'spin 1s linear infinite' : 'none' }}>🔄</span>
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* ── Stats ──────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '24px' }}>
        {[
          { icon: '🤟', label: 'Total Signs',   value: loading ? '...' : totalSigns,      color: '#0066ff' },
          { icon: '📋', label: 'Sessions',       value: loading ? '...' : totalSessions,   color: '#8b5cf6' },
          { icon: '⏱️', label: 'Minutes Used',  value: loading ? '...' : `${totalTime}m`, color: '#10b981' },
          { icon: '🆘', label: 'Emergency Uses', value: loading ? '...' : emergencyCount,  color: '#ef4444' },
        ].map((s, i) => (
          <div key={i} style={{ background: '#ffffff', border: '1px solid #e8edf2', borderRadius: '14px', padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: s.color, opacity: 0.7 }} />
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: `${s.color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '10px' }}>{s.icon}</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#0a1628', letterSpacing: '-0.5px', marginBottom: '2px' }}>{s.value}</div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Filters ────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <input type="text" placeholder="Search sessions or signs..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '10px 16px 10px 38px', background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '10px', color: '#0a1628', fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontFamily: "'DM Sans','Segoe UI',system-ui" }}
            onFocus={e => e.target.style.borderColor = '#0066ff'}
            onBlur={e => e.target.style.borderColor = '#e2e8f0'}
          />
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '15px' }}>🔍</span>
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {filters.map(f => {
            const tc = typeConfig[f]
            return (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: '8px 16px',
                background: filter === f ? f === 'All' ? 'rgba(0,102,255,0.08)' : tc.bg : '#ffffff',
                border: `1.5px solid ${filter === f ? f === 'All' ? '#0066ff' : tc.color : '#e2e8f0'}`,
                borderRadius: '8px',
                color: filter === f ? f === 'All' ? '#0066ff' : tc.color : '#64748b',
                cursor: 'pointer', fontSize: '12px', fontWeight: 600, transition: 'all 0.15s',
                display: 'flex', alignItems: 'center', gap: '5px',
              }}>
                {f === 'All' ? 'All Sessions' : `${tc.icon} ${tc.label}`}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Main Grid ──────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 320px' : '1fr', gap: '16px', alignItems: 'start' }}>

        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '56px', background: '#ffffff', border: '1px solid #e8edf2', borderRadius: '16px' }}>
              <div style={{ fontSize: '32px', marginBottom: '10px', animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</div>
              <div style={{ color: '#94a3b8', marginTop: '10px' }}>Loading sessions...</div>
            </div>
          ) : Object.keys(grouped).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '56px', background: '#ffffff', border: '1px solid #e8edf2', borderRadius: '16px' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
              <div style={{ color: '#94a3b8', fontSize: '14px' }}>
                {history.length === 0 ? 'No sessions yet — start detecting!' : 'No sessions match your filters'}
              </div>
            </div>
          ) : Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a)).map(dateKey => (
            <div key={dateKey} style={{ marginBottom: '20px' }}>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                  {formatDate(grouped[dateKey][0]?.created_at)}
                </div>
                <div style={{ flex: 1, height: '1px', background: '#f0f4f8' }} />
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                  {grouped[dateKey].length} session{grouped[dateKey].length > 1 ? 's' : ''}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {grouped[dateKey].map(item => {
                  const tc         = typeConfig[item.session_type] || typeConfig.detection
                  const signs      = parseSigns(item.detected_signs)
                  const isSelected = selected?.id === item.id
                  return (
                    <div key={item.id}
                      onClick={() => setSelected(isSelected ? null : item)}
                      style={{ background: '#ffffff', border: `1.5px solid ${isSelected ? tc.color : '#e8edf2'}`, borderRadius: '14px', padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '14px', transition: 'all 0.15s', boxShadow: isSelected ? `0 0 0 3px ${tc.color}15` : 'none' }}
                      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = '#0066ff' }}
                      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = '#e8edf2' }}
                    >
                      <div style={{ width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0, background: tc.bg, border: `1px solid ${tc.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>{tc.icon}</div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                          <span style={{ fontSize: '14px', fontWeight: 700, color: '#0a1628' }}>{item.session_name}</span>
                          <span style={{ padding: '1px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, background: tc.bg, color: tc.color, border: `1px solid ${tc.border}`, flexShrink: 0 }}>{tc.label}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '12px', color: '#94a3b8' }}>🕐 {formatTime(item.created_at)}</span>
                          <span style={{ fontSize: '12px', color: '#94a3b8' }}>⏱ {item.duration}</span>
                          <span style={{ fontSize: '12px', color: tc.color, fontWeight: 600 }}>🤟 {signs.length} signs</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '5px', flexShrink: 0, flexWrap: 'wrap', maxWidth: '180px', justifyContent: 'flex-end' }}>
                        {signs.slice(0, 3).map((s, i) => (
                          <span key={i} style={{ padding: '3px 10px', background: '#f8fafc', border: '1px solid #e8edf2', borderRadius: '20px', fontSize: '11px', color: '#64748b', fontWeight: 500 }}>{s}</span>
                        ))}
                        {signs.length > 3 && <span style={{ fontSize: '11px', color: '#94a3b8', padding: '3px 6px', alignSelf: 'center' }}>+{signs.length - 3}</span>}
                      </div>

                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ flexShrink: 0 }}>
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
            <div style={{ background: '#ffffff', border: `1.5px solid ${tc.color}40`, borderRadius: '16px', padding: '24px', position: 'sticky', top: '0', boxShadow: `0 0 0 4px ${tc.color}08` }}>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', letterSpacing: '1px' }}>SESSION DETAIL</div>
                <button onClick={() => setSelected(null)} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer', color: '#64748b', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
              </div>

              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', marginBottom: '14px', background: tc.bg, border: `1px solid ${tc.border}`, borderRadius: '20px' }}>
                <span>{tc.icon}</span>
                <span style={{ fontSize: '12px', color: tc.color, fontWeight: 700 }}>{tc.label}</span>
              </div>

              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0a1628', marginBottom: '16px' }}>{selected.session_name}</h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '20px' }}>
                {[
                  { label: 'Date',     value: toLocalDate(selected.created_at)?.toLocaleDateString('en-IN') || '—' },
                  { label: 'Time',     value: formatTime(selected.created_at) },
                  { label: 'Duration', value: selected.duration },
                  { label: 'Signs',    value: `${signs.length} detected` },
                ].map((m, i) => (
                  <div key={i} style={{ padding: '10px 12px', background: '#f8fafc', border: '1px solid #f0f4f8', borderRadius: '10px' }}>
                    <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600, marginBottom: '4px', letterSpacing: '0.5px' }}>{m.label.toUpperCase()}</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#0a1628' }}>{m.value}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', letterSpacing: '1px', marginBottom: '10px' }}>SIGNS DETECTED</div>
                {signs.length === 0 ? (
                  <div style={{ fontSize: '13px', color: '#94a3b8' }}>No signs recorded</div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {signs.map((s, i) => (
                      <span key={i} style={{ padding: '5px 14px', background: tc.bg, border: `1px solid ${tc.border}`, borderRadius: '20px', fontSize: '12px', color: tc.color, fontWeight: 700 }}>{s}</span>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  onClick={() => { navigator.clipboard.writeText(signs.join(', ')); toast.success('Transcript copied!') }}
                  style={{ width: '100%', padding: '11px', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '10px', color: '#334155', cursor: 'pointer', fontWeight: 600, fontSize: '13px', transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#0066ff'; e.currentTarget.style.color = '#0066ff' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#334155' }}
                >📋 Copy Transcript</button>
                <button
                  onClick={() => handleDelete(selected.id)}
                  disabled={deleting === selected.id}
                  style={{ width: '100%', padding: '11px', background: 'rgba(239,68,68,0.04)', border: '1.5px solid rgba(239,68,68,0.15)', borderRadius: '10px', color: '#ef4444', cursor: deleting === selected.id ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '13px', opacity: deleting === selected.id ? 0.6 : 1 }}
                  onMouseEnter={e => { if (deleting !== selected.id) e.currentTarget.style.background = 'rgba(239,68,68,0.08)' }}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.04)'}
                >
                  {deleting === selected.id ? '⏳ Deleting...' : '🗑 Delete Session'}
                </button>
              </div>
            </div>
          )
        })()}
      </div>

      <style>{`
        * { box-sizing: border-box; }
        input::placeholder { color: #94a3b8; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 2px; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
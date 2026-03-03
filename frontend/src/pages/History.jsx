import { useState } from 'react'

const dummyHistory = [
  { id: 1, type: 'detection', title: 'Live Detection Session', signs: ['Hello', 'Thank You', 'Yes', 'Good', 'I Love You'], duration: '5 mins', date: '2025-03-01', time: '10:30 AM', count: 5 },
  { id: 2, type: 'conversation', title: 'Conversation Session', signs: ['Help', 'Please', 'Stop', 'Good'], duration: '8 mins', date: '2025-03-01', time: '11:15 AM', count: 4 },
  { id: 3, type: 'learning', title: 'Learning Session', signs: ['I Love You', 'Hello', 'Thank You'], duration: '12 mins', date: '2025-02-28', time: '03:45 PM', count: 3 },
  { id: 4, type: 'detection', title: 'Live Detection Session', signs: ['No', 'Stop', 'Help', 'Please', 'Yes', 'Good'], duration: '6 mins', date: '2025-02-28', time: '06:20 PM', count: 6 },
  { id: 5, type: 'conversation', title: 'Conversation Session', signs: ['Hello', 'Good', 'Thank You'], duration: '4 mins', date: '2025-02-27', time: '09:00 AM', count: 3 },
]

export default function History() {
  const [filter, setFilter] = useState('All')
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')

  const filters = ['All', 'detection', 'conversation', 'learning']

  const filtered = dummyHistory.filter(h => {
    const matchFilter = filter === 'All' || h.type === filter
    const matchSearch = h.title.toLowerCase().includes(search.toLowerCase()) ||
      h.signs.some(s => s.toLowerCase().includes(search.toLowerCase()))
    return matchFilter && matchSearch
  })

  const totalSigns = dummyHistory.reduce((acc, h) => acc + h.count, 0)
  const totalSessions = dummyHistory.length
  const totalTime = dummyHistory.reduce((acc, h) => acc + parseInt(h.duration), 0)

  const typeConfig = {
    detection: { icon: '📸', label: 'Live Detection', color: '#a78bfa', border: 'rgba(167,139,250,0.25)', bg: 'rgba(167,139,250,0.08)' },
    conversation: { icon: '💬', label: 'Conversation', color: '#38bdf8', border: 'rgba(56,189,248,0.25)', bg: 'rgba(56,189,248,0.08)' },
    learning: { icon: '📚', label: 'Learning', color: '#34d399', border: 'rgba(52,211,153,0.25)', bg: 'rgba(52,211,153,0.08)' },
  }

  return (
    <div style={{ color: '#e2d9f3', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '6px' }}>History</h1>
        <p style={{ color: '#7c6d9c', fontSize: '0.88rem' }}>All your past sessions and detected signs</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '24px' }}>
        {[
          { icon: '🤟', label: 'Total Signs', value: totalSigns, color: '#a78bfa' },
          { icon: '📋', label: 'Total Sessions', value: totalSessions, color: '#38bdf8' },
          { icon: '⏱️', label: 'Total Time', value: `${totalTime}m`, color: '#34d399' },
        ].map((s, i) => (
          <div key={i} style={{
            padding: '18px 20px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(139,92,246,0.12)',
            borderRadius: '16px',
            display: 'flex', alignItems: 'center', gap: '16px'
          }}>
            <div style={{ fontSize: '1.8rem' }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.78rem', color: '#7c6d9c', fontWeight: 500 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters + Search */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="🔍 Search history..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: 1, minWidth: '200px', padding: '9px 16px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(139,92,246,0.2)',
            borderRadius: '10px', color: '#e2d9f3',
            fontSize: '0.88rem', outline: 'none'
          }}
          onFocus={e => e.target.style.borderColor = 'rgba(139,92,246,0.6)'}
          onBlur={e => e.target.style.borderColor = 'rgba(139,92,246,0.2)'}
        />
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '9px 18px',
            background: filter === f ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${filter === f ? 'rgba(167,139,250,0.4)' : 'rgba(139,92,246,0.15)'}`,
            borderRadius: '10px',
            color: filter === f ? '#c4b5fd' : '#7c6d9c',
            cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
            textTransform: 'capitalize'
          }}>
            {f === 'All' ? 'All' : typeConfig[f]?.icon + ' ' + typeConfig[f]?.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 320px' : '1fr', gap: '16px' }}>

        {/* History list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.length === 0 ? (
            <div style={{
              padding: '48px', textAlign: 'center',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(139,92,246,0.12)',
              borderRadius: '16px'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📭</div>
              <div style={{ color: '#7c6d9c', fontSize: '0.9rem' }}>No history found</div>
            </div>
          ) : filtered.map(item => {
            const tc = typeConfig[item.type]
            return (
              <div key={item.id} onClick={() => setSelected(selected?.id === item.id ? null : item)}
                style={{
                  padding: '18px 20px',
                  background: selected?.id === item.id ? tc.bg : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${selected?.id === item.id ? tc.border : 'rgba(139,92,246,0.12)'}`,
                  borderRadius: '16px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '16px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => { if (selected?.id !== item.id) e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)' }}
                onMouseLeave={e => { if (selected?.id !== item.id) e.currentTarget.style.borderColor = 'rgba(139,92,246,0.12)' }}
              >
                {/* Type icon */}
                <div style={{
                  width: '46px', height: '46px', borderRadius: '14px', flexShrink: 0,
                  background: tc.bg, border: `1px solid ${tc.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.4rem'
                }}>{tc.icon}</div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#e2d9f3', marginBottom: '4px' }}>
                    {item.title}
                  </div>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.78rem', color: '#7c6d9c' }}>📅 {item.date}</span>
                    <span style={{ fontSize: '0.78rem', color: '#7c6d9c' }}>🕐 {item.time}</span>
                    <span style={{ fontSize: '0.78rem', color: '#7c6d9c' }}>⏱ {item.duration}</span>
                    <span style={{ fontSize: '0.78rem', color: tc.color }}>🤟 {item.count} signs</span>
                  </div>
                </div>

                {/* Signs preview */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', maxWidth: '200px', justifyContent: 'flex-end' }}>
                  {item.signs.slice(0, 3).map((s, i) => (
                    <span key={i} style={{
                      padding: '3px 10px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(139,92,246,0.15)',
                      borderRadius: '20px', fontSize: '0.72rem', color: '#9d8ec0'
                    }}>{s}</span>
                  ))}
                  {item.signs.length > 3 && (
                    <span style={{ fontSize: '0.72rem', color: '#4a3f6b', padding: '3px 6px' }}>
                      +{item.signs.length - 3}
                    </span>
                  )}
                </div>

                <div style={{ color: '#4a3f6b', fontSize: '1rem', flexShrink: 0 }}>›</div>
              </div>
            )
          })}
        </div>

        {/* Detail panel */}
        {selected && (() => {
          const tc = typeConfig[selected.type]
          return (
            <div style={{
              padding: '24px',
              background: 'rgba(255,255,255,0.02)',
              border: `1px solid ${tc.border}`,
              borderRadius: '20px', height: 'fit-content',
              position: 'sticky', top: 0
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <span style={{ fontSize: '0.72rem', color: '#7c6d9c', letterSpacing: '1px' }}>SESSION DETAIL</span>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#4a3f6b', cursor: 'pointer', fontSize: '1.1rem' }}>✕</button>
              </div>

              {/* Type badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '6px 14px', marginBottom: '16px',
                background: tc.bg, border: `1px solid ${tc.border}`,
                borderRadius: '20px'
              }}>
                <span>{tc.icon}</span>
                <span style={{ fontSize: '0.82rem', color: tc.color, fontWeight: 600 }}>{tc.label}</span>
              </div>

              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>{selected.title}</h3>

              {/* Meta info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                {[
                  { label: 'Date', value: selected.date },
                  { label: 'Time', value: selected.time },
                  { label: 'Duration', value: selected.duration },
                  { label: 'Signs', value: `${selected.count} detected` },
                ].map((m, i) => (
                  <div key={i} style={{
                    padding: '10px 12px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(139,92,246,0.1)',
                    borderRadius: '10px'
                  }}>
                    <div style={{ fontSize: '0.7rem', color: '#4a3f6b', marginBottom: '4px' }}>{m.label}</div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#c4b5fd' }}>{m.value}</div>
                  </div>
                ))}
              </div>

              {/* Signs detected */}
              <div>
                <div style={{ fontSize: '0.72rem', color: '#7c6d9c', letterSpacing: '1px', marginBottom: '10px' }}>
                  SIGNS DETECTED
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {selected.signs.map((s, i) => (
                    <span key={i} style={{
                      padding: '6px 14px',
                      background: tc.bg, border: `1px solid ${tc.border}`,
                      borderRadius: '20px', fontSize: '0.82rem',
                      color: tc.color, fontWeight: 600
                    }}>{s}</span>
                  ))}
                </div>
              </div>
            </div>
          )
        })()}
      </div>
    </div>
  )
}
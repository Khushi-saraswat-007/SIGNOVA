import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'

const DEFAULTS = {
  voiceOutput: true, voiceSpeed: 1, voicePitch: 1,
  voiceGender: 'female', confidenceThreshold: 75,
  detectionSpeed: 150, showConfidence: true,
  autoSaveHistory: true, language: 'en', notifications: true,
}

const tabs = [
  { id: 'voice',     icon: '🔊', label: 'Voice'     },
  { id: 'detection', icon: '🎥', label: 'Detection' },
  { id: 'general',   icon: '⚙️', label: 'General'   },
  { id: 'account',   icon: '👤', label: 'Account'   },
]

function Toggle({ value, onChange }) {
  return (
    <div onClick={() => onChange(!value)} style={{ width: '44px', height: '24px', borderRadius: '12px', background: value ? '#0066ff' : '#e2e8f0', cursor: 'pointer', position: 'relative', transition: 'all 0.25s', flexShrink: 0 }}>
      <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'white', position: 'absolute', top: '3px', left: value ? '23px' : '3px', transition: 'left 0.25s', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }} />
    </div>
  )
}

function SettingRow({ label, desc, children, last }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: last ? 'none' : '1px solid #f0f4f8' }}>
      <div style={{ flex: 1, marginRight: '24px' }}>
        <div style={{ fontSize: '14px', fontWeight: 600, color: '#0a1628', marginBottom: '2px' }}>{label}</div>
        {desc && <div style={{ fontSize: '12px', color: '#94a3b8' }}>{desc}</div>}
      </div>
      {children}
    </div>
  )
}

function Card({ title, icon, children }) {
  return (
    <div style={{ background: '#ffffff', border: '1px solid #e8edf2', borderRadius: '16px', marginBottom: '16px', overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f4f8', display: 'flex', alignItems: 'center', gap: '8px' }}>
        {icon && <span style={{ fontSize: '16px' }}>{icon}</span>}
        <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155', letterSpacing: '0.5px' }}>{title}</span>
      </div>
      <div style={{ padding: '4px 20px 8px' }}>{children}</div>
    </div>
  )
}

function SliderRow({ label, desc, value, min, max, step, onChange, leftLabel, rightLabel, unit, last }) {
  return (
    <div style={{ padding: '16px 0', borderBottom: last ? 'none' : '1px solid #f0f4f8' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#0a1628' }}>{label}</div>
          {desc && <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{desc}</div>}
        </div>
        <div style={{ padding: '3px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 700, background: 'rgba(0,102,255,0.06)', color: '#0066ff', border: '1px solid rgba(0,102,255,0.15)', minWidth: '52px', textAlign: 'center' }}>{value}{unit}</div>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(parseFloat(e.target.value))}
        style={{ width: '100%', accentColor: '#0066ff', cursor: 'pointer', height: '4px' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
        <span style={{ fontSize: '11px', color: '#94a3b8' }}>{leftLabel}</span>
        <span style={{ fontSize: '11px', color: '#94a3b8' }}>{rightLabel}</span>
      </div>
    </div>
  )
}

export default function Settings() {
  const { user, logout } = useAuth()
  const navigate          = useNavigate()
  const [settings, setSettings] = useState(() => {
    try { const s = localStorage.getItem('signova_settings'); return s ? { ...DEFAULTS, ...JSON.parse(s) } : DEFAULTS }
    catch { return DEFAULTS }
  })
  const [activeTab, setActiveTab] = useState('voice')
  const [saved,     setSaved]     = useState(false)
  const [aiStatus,  setAiStatus]  = useState({ rf: false, lstm: false, mediapipe: false })
  const [userStats, setUserStats] = useState({ sessions: 0, signs: 0, joined: '' })

  const update = (key, value) => setSettings(prev => ({ ...prev, [key]: value }))

  // Fetch real AI status + user stats
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const [statusRes, histRes] = await Promise.all([
          axios.get('http://localhost:8000/api/status'),
          user?.id ? axios.get(`http://localhost:8000/api/history/user/${user.id}`,
            { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
          : Promise.resolve({ data: [] })
        ])
        setAiStatus({
          rf:        statusRes.data?.rf_model_loaded   || false,
          lstm:      statusRes.data?.lstm_model_loaded || false,
          mediapipe: statusRes.data?.mediapipe_loaded  || false,
        })
        const hist  = histRes.data || []
        const signs = hist.reduce((a, h) => a + (h.detected_signs ? h.detected_signs.split(',').filter(s => s.trim()).length : 0), 0)
        setUserStats({ sessions: hist.length, signs, joined: user?.id ? 'April 2026' : '—' })
      } catch {}
    }
    fetchStatus()
  }, [user])

  const saveSettings = () => {
    localStorage.setItem('signova_settings', JSON.stringify(settings))
    setSaved(true); setTimeout(() => setSaved(false), 2000)
    toast.success('Settings saved!')
  }

  const resetSettings = () => {
    setSettings(DEFAULTS)
    localStorage.setItem('signova_settings', JSON.stringify(DEFAULTS))
    toast.success('Reset to defaults!')
  }

  const testVoice = () => {
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance('Hello! This is Signova voice output test.')
    u.rate = settings.voiceSpeed; u.pitch = settings.voicePitch
    window.speechSynthesis.speak(u)
  }

  const initials = user?.name ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : 'U'

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',system-ui,sans-serif", color: '#0a1628' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0a1628', letterSpacing: '-0.5px', marginBottom: '4px' }}>Settings</h1>
          <p style={{ color: '#64748b', fontSize: '13px' }}>Customize your Signova experience</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={resetSettings} style={{ padding: '9px 18px', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '10px', color: '#64748b', cursor: 'pointer', fontSize: '13px', fontWeight: 600, transition: 'all 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#94a3b8'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}
          >Reset Defaults</button>
          <button onClick={saveSettings} style={{ padding: '9px 22px', background: saved ? '#10b981' : '#0066ff', border: 'none', borderRadius: '10px', color: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: 700, transition: 'all 0.3s' }}>
            {saved ? '✓ Saved!' : 'Save Settings'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '20px', alignItems: 'start' }}>

        {/* Sidebar */}
        <div style={{ background: '#ffffff', border: '1px solid #e8edf2', borderRadius: '16px', overflow: 'hidden', position: 'sticky', top: 0 }}>
          {tabs.map((tab, i) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              width: '100%', padding: '14px 18px', background: activeTab === tab.id ? 'rgba(0,102,255,0.06)' : 'transparent',
              border: 'none', borderLeft: `3px solid ${activeTab === tab.id ? '#0066ff' : 'transparent'}`,
              borderBottom: i < tabs.length - 1 ? '1px solid #f0f4f8' : 'none',
              color: activeTab === tab.id ? '#0066ff' : '#64748b',
              cursor: 'pointer', fontSize: '13px', fontWeight: activeTab === tab.id ? 700 : 500,
              display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left', transition: 'all 0.15s',
            }}>
              <span style={{ fontSize: '16px' }}>{tab.icon}</span>{tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div>

          {/* VOICE */}
          {activeTab === 'voice' && <>
            <Card title="VOICE OUTPUT" icon="🔊">
              <SettingRow label="Enable Voice Output" desc="Read detected signs aloud automatically">
                <Toggle value={settings.voiceOutput} onChange={v => update('voiceOutput', v)} />
              </SettingRow>
              <SettingRow label="Voice Gender" desc="Choose preferred voice type" last>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {['female','male'].map(g => (
                    <button key={g} onClick={() => update('voiceGender', g)} style={{ padding: '6px 16px', background: settings.voiceGender === g ? 'rgba(0,102,255,0.08)' : '#f8fafc', border: `1.5px solid ${settings.voiceGender === g ? '#0066ff' : '#e2e8f0'}`, borderRadius: '8px', color: settings.voiceGender === g ? '#0066ff' : '#64748b', cursor: 'pointer', fontSize: '12px', fontWeight: 600, textTransform: 'capitalize', transition: 'all 0.15s' }}>{g}</button>
                  ))}
                </div>
              </SettingRow>
            </Card>
            <Card title="VOICE CONTROLS" icon="🎚️">
              <SliderRow label="Speech Speed" desc="How fast the voice speaks" value={settings.voiceSpeed} min={0.5} max={2} step={0.1} onChange={v => update('voiceSpeed', v)} leftLabel="Slow" rightLabel="Fast" unit="x" />
              <SliderRow label="Voice Pitch" desc="How high or low the voice sounds" value={settings.voicePitch} min={0.5} max={2} step={0.1} onChange={v => update('voicePitch', v)} leftLabel="Low" rightLabel="High" unit="" last />
              <div style={{ paddingBottom: '16px' }}>
                <button onClick={testVoice} style={{ padding: '10px 24px', background: 'rgba(0,102,255,0.06)', border: '1.5px solid rgba(0,102,255,0.2)', borderRadius: '10px', color: '#0066ff', cursor: 'pointer', fontSize: '13px', fontWeight: 700 }}>🔊 Test Voice</button>
              </div>
            </Card>
          </>}

          {/* DETECTION */}
          {activeTab === 'detection' && <>
            <Card title="AI DETECTION" icon="🧠">
              <SettingRow label="Show Confidence Score" desc="Display percentage confidence for each sign" last>
                <Toggle value={settings.showConfidence} onChange={v => update('showConfidence', v)} />
              </SettingRow>
            </Card>
            <Card title="SENSITIVITY CONTROLS" icon="🎯">
              <SliderRow label="Confidence Threshold" desc="Higher = more accurate but may miss some signs" value={settings.confidenceThreshold} min={50} max={95} step={5} onChange={v => update('confidenceThreshold', v)} leftLabel="Sensitive (50%)" rightLabel="Strict (95%)" unit="%" />
              <SliderRow label="Detection Speed" desc="How often frames are sent to the AI model" value={settings.detectionSpeed} min={50} max={500} step={50} onChange={v => update('detectionSpeed', v)} leftLabel="Fast (50ms)" rightLabel="Slow (500ms)" unit="ms" last />
            </Card>
            <Card title="LIVE MODEL STATUS" icon="📊">
              <div style={{ padding: '8px 0 4px' }}>
                {[
                  { label: 'MediaPipe Engine',    value: aiStatus.mediapipe ? 'Online' : 'Offline',     ok: aiStatus.mediapipe },
                  { label: 'RF Sign Model',       value: aiStatus.rf        ? 'Loaded' : 'Not loaded',  ok: aiStatus.rf        },
                  { label: 'LSTM Sentence Model', value: aiStatus.lstm      ? 'Loaded' : 'Not loaded',  ok: aiStatus.lstm      },
                  { label: 'Signs Trained',       value: '9 Static Signs',    ok: true },
                  { label: 'Emergency Sentences', value: '10 Sentences',      ok: true },
                ].map((item, i, arr) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: i < arr.length - 1 ? '1px solid #f0f4f8' : 'none' }}>
                    <span style={{ fontSize: '13px', color: '#64748b' }}>{item.label}</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, padding: '2px 10px', background: item.ok ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', color: item.ok ? '#10b981' : '#ef4444', borderRadius: '20px', border: `1px solid ${item.ok ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}` }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </Card>
          </>}

          {/* GENERAL */}
          {activeTab === 'general' && <>
            <Card title="PREFERENCES" icon="⚙️">
              <SettingRow label="Auto Save History" desc="Automatically save all detection sessions">
                <Toggle value={settings.autoSaveHistory} onChange={v => update('autoSaveHistory', v)} />
              </SettingRow>
              <SettingRow label="Notifications" desc="Get notified about system updates">
                <Toggle value={settings.notifications} onChange={v => update('notifications', v)} />
              </SettingRow>
              <SettingRow label="Language" desc="Voice output language" last>
                <select value={settings.language} onChange={e => update('language', e.target.value)} style={{ padding: '8px 14px', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '8px', color: '#0a1628', fontSize: '13px', outline: 'none', cursor: 'pointer', fontFamily: "'DM Sans','Segoe UI',system-ui" }}>
                  <option value="en">🇺🇸 English</option>
                  <option value="hi">🇮🇳 Hindi</option>
                  <option value="es">🇪🇸 Spanish</option>
                  <option value="fr">🇫🇷 French</option>
                </select>
              </SettingRow>
            </Card>
            <Card title="ABOUT SIGNOVA" icon="ℹ️">
              <div style={{ padding: '4px 0 4px' }}>
                {[
                  { label: 'Version',    value: '2.0.0'                             },
                  { label: 'Frontend',   value: 'React 18 + Vite'                   },
                  { label: 'Backend',    value: 'FastAPI + Python 3.10'              },
                  { label: 'AI Stack',   value: 'MediaPipe + scikit-learn + PyTorch' },
                  { label: 'Database',   value: 'SQLite + SQLAlchemy'                },
                  { label: 'Auth',       value: 'JWT + bcrypt'                       },
                ].map((item, i, arr) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid #f0f4f8' : 'none' }}>
                    <span style={{ fontSize: '13px', color: '#64748b' }}>{item.label}</span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </Card>
          </>}

          {/* ACCOUNT */}
          {activeTab === 'account' && <>
            <Card title="YOUR PROFILE" icon="👤">
              <div style={{ padding: '16px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #00d4ff, #0066ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 800, color: 'white', flexShrink: 0 }}>{initials}</div>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#0a1628', marginBottom: '3px' }}>{user?.name || 'Signova User'}</div>
                    <div style={{ fontSize: '13px', color: '#94a3b8' }}>{user?.email || '—'}</div>
                    <div style={{ marginTop: '6px', display: 'inline-block', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, background: 'rgba(16,185,129,0.08)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>✓ Free Plan</div>
                  </div>
                </div>
                {[
                  { label: 'Member Since',   value: userStats.joined },
                  { label: 'Total Sessions', value: `${userStats.sessions} sessions` },
                  { label: 'Signs Detected', value: `${userStats.signs} signs` },
                ].map((item, i, arr) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 0', borderBottom: i < arr.length - 1 ? '1px solid #f0f4f8' : 'none' }}>
                    <span style={{ fontSize: '13px', color: '#64748b' }}>{item.label}</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#0a1628' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </Card>
            <Card title="SESSION" icon="🔒">
              <div style={{ padding: '12px 0' }}>
                <button onClick={() => { logout(); navigate('/login') }} style={{ width: '100%', padding: '12px 20px', background: 'rgba(0,102,255,0.04)', border: '1.5px solid rgba(0,102,255,0.15)', borderRadius: '10px', color: '#0066ff', cursor: 'pointer', fontSize: '13px', fontWeight: 700, textAlign: 'center' }}>→ Sign Out</button>
              </div>
            </Card>
            <Card title="DANGER ZONE" icon="⚠️">
              <div style={{ padding: '12px 0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button onClick={() => toast('Clear history? This cannot be undone.', { icon: '⚠️' })} style={{ padding: '11px 20px', textAlign: 'left', background: 'rgba(245,158,11,0.04)', border: '1.5px solid rgba(245,158,11,0.2)', borderRadius: '10px', color: '#f59e0b', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>🗑 Clear All History</button>
                <button onClick={() => toast.error('Contact support to delete your account.')} style={{ padding: '11px 20px', textAlign: 'left', background: 'rgba(239,68,68,0.04)', border: '1.5px solid rgba(239,68,68,0.2)', borderRadius: '10px', color: '#ef4444', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>⚠️ Delete Account</button>
              </div>
            </Card>
          </>}
        </div>
      </div>

      <style>{`
        * { box-sizing: border-box; }
        input[type=range] { -webkit-appearance: none; appearance: none; height: 4px; border-radius: 2px; background: #e2e8f0; outline: none; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: #0066ff; cursor: pointer; border: 2px solid white; box-shadow: 0 1px 4px rgba(0,0,0,0.2); }
        select option { background: white; color: #0a1628; }
      `}</style>
    </div>
  )
}
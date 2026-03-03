import { useState } from 'react'
import toast from 'react-hot-toast'

export default function Settings() {
  const [settings, setSettings] = useState({
    voiceOutput: true,
    voiceSpeed: 1,
    voicePitch: 1,
    voiceGender: 'female',
    confidenceThreshold: 70,
    detectionSpeed: 150,
    showConfidence: true,
    autoSaveHistory: true,
    language: 'en',
    notifications: true,
  })

  const [activeTab, setActiveTab] = useState('voice')

  const update = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const saveSettings = () => {
    localStorage.setItem('signova_settings', JSON.stringify(settings))
    toast.success('Settings saved successfully!')
  }

  const resetSettings = () => {
    setSettings({
      voiceOutput: true,
      voiceSpeed: 1,
      voicePitch: 1,
      voiceGender: 'female',
      confidenceThreshold: 70,
      detectionSpeed: 150,
      showConfidence: true,
      autoSaveHistory: true,
      language: 'en',
      notifications: true,
    })
    toast.success('Settings reset to defaults!')
  }

  const testVoice = () => {
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance('Hello! This is Signova voice output test.')
    u.rate = settings.voiceSpeed
    u.pitch = settings.voicePitch
    window.speechSynthesis.speak(u)
  }

  const tabs = [
    { id: 'voice', icon: '🔊', label: 'Voice' },
    { id: 'detection', icon: '📸', label: 'Detection' },
    { id: 'general', icon: '⚙️', label: 'General' },
    { id: 'account', icon: '👤', label: 'Account' },
  ]

  const Toggle = ({ value, onChange }) => (
    <div onClick={() => onChange(!value)} style={{
      width: '44px', height: '24px', borderRadius: '12px',
      background: value ? 'linear-gradient(135deg, #7c3aed, #2563eb)' : 'rgba(255,255,255,0.08)',
      border: `1px solid ${value ? 'rgba(167,139,250,0.5)' : 'rgba(139,92,246,0.2)'}`,
      cursor: 'pointer', position: 'relative', transition: 'all 0.3s',
      flexShrink: 0,
      boxShadow: value ? '0 0 12px rgba(124,58,237,0.4)' : 'none'
    }}>
      <div style={{
        width: '18px', height: '18px', borderRadius: '50%',
        background: 'white', position: 'absolute',
        top: '2px', left: value ? '22px' : '2px',
        transition: 'left 0.3s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)'
      }} />
    </div>
  )

  const Slider = ({ value, min, max, step, onChange, label, leftLabel, rightLabel }) => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontSize: '0.78rem', color: '#7c6d9c' }}>{leftLabel}</span>
        <span style={{ fontSize: '0.82rem', color: '#a78bfa', fontWeight: 700 }}>{value}{label}</span>
        <span style={{ fontSize: '0.78rem', color: '#7c6d9c' }}>{rightLabel}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{ width: '100%', accentColor: '#7c3aed', cursor: 'pointer', height: '4px' }}
      />
    </div>
  )

  const SettingRow = ({ label, desc, children }) => (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '16px 0',
      borderBottom: '1px solid rgba(139,92,246,0.08)'
    }}>
      <div style={{ flex: 1, marginRight: '20px' }}>
        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#e2d9f3', marginBottom: '2px' }}>{label}</div>
        {desc && <div style={{ fontSize: '0.78rem', color: '#4a3f6b' }}>{desc}</div>}
      </div>
      {children}
    </div>
  )

  const Card = ({ title, children }) => (
    <div style={{
      padding: '20px 24px',
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(139,92,246,0.12)',
      borderRadius: '18px', marginBottom: '16px'
    }}>
      <div style={{ fontSize: '0.72rem', color: '#7c6d9c', letterSpacing: '1px', marginBottom: '4px' }}>{title}</div>
      {children}
    </div>
  )

  return (
    <div style={{ color: '#e2d9f3', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '6px' }}>Settings</h1>
          <p style={{ color: '#7c6d9c', fontSize: '0.88rem' }}>Customize your Signova experience</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={resetSettings} style={{
            padding: '9px 18px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(139,92,246,0.2)',
            borderRadius: '10px', color: '#9d8ec0',
            cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600
          }}>
            Reset Defaults
          </button>
          <button onClick={saveSettings} style={{
            padding: '9px 22px',
            background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
            border: 'none', borderRadius: '10px', color: 'white',
            cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700,
            boxShadow: '0 0 20px rgba(124,58,237,0.4)'
          }}>
            Save Settings
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '20px' }}>

        {/* Tabs sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              padding: '12px 16px',
              background: activeTab === tab.id
                ? 'linear-gradient(135deg, rgba(124,58,237,0.25), rgba(37,99,235,0.15))'
                : 'rgba(255,255,255,0.02)',
              border: `1px solid ${activeTab === tab.id ? 'rgba(167,139,250,0.35)' : 'rgba(139,92,246,0.1)'}`,
              borderRadius: '12px',
              color: activeTab === tab.id ? '#c4b5fd' : '#7c6d9c',
              cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '10px',
              textAlign: 'left', transition: 'all 0.2s'
            }}>
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div>

          {/* VOICE TAB */}
          {activeTab === 'voice' && (
            <div>
              <Card title="VOICE OUTPUT">
                <SettingRow label="Enable Voice Output" desc="Read detected signs aloud automatically">
                  <Toggle value={settings.voiceOutput} onChange={v => update('voiceOutput', v)} />
                </SettingRow>
                <SettingRow label="Voice Gender" desc="Choose preferred voice type">
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['female', 'male'].map(g => (
                      <button key={g} onClick={() => update('voiceGender', g)} style={{
                        padding: '6px 16px',
                        background: settings.voiceGender === g ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${settings.voiceGender === g ? 'rgba(167,139,250,0.4)' : 'rgba(139,92,246,0.2)'}`,
                        borderRadius: '8px', color: settings.voiceGender === g ? '#c4b5fd' : '#7c6d9c',
                        cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
                        textTransform: 'capitalize'
                      }}>{g}</button>
                    ))}
                  </div>
                </SettingRow>
              </Card>

              <Card title="VOICE CONTROLS">
                <div style={{ padding: '8px 0 16px' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2d9f3', marginBottom: '12px' }}>Speech Speed</div>
                  <Slider value={settings.voiceSpeed} min={0.5} max={2} step={0.1}
                    onChange={v => update('voiceSpeed', v)}
                    leftLabel="Slow" rightLabel="Fast" label="x"
                  />
                </div>
                <div style={{ padding: '8px 0 16px' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2d9f3', marginBottom: '12px' }}>Voice Pitch</div>
                  <Slider value={settings.voicePitch} min={0.5} max={2} step={0.1}
                    onChange={v => update('voicePitch', v)}
                    leftLabel="Low" rightLabel="High" label=""
                  />
                </div>
                <button onClick={testVoice} style={{
                  padding: '10px 24px', marginTop: '8px',
                  background: 'rgba(56,189,248,0.1)',
                  border: '1px solid rgba(56,189,248,0.3)',
                  borderRadius: '10px', color: '#38bdf8',
                  cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600
                }}>
                  🔊 Test Voice
                </button>
              </Card>
            </div>
          )}

          {/* DETECTION TAB */}
          {activeTab === 'detection' && (
            <div>
              <Card title="AI DETECTION">
                <SettingRow label="Show Confidence Score" desc="Display percentage confidence for each detection">
                  <Toggle value={settings.showConfidence} onChange={v => update('showConfidence', v)} />
                </SettingRow>
              </Card>

              <Card title="DETECTION SENSITIVITY">
                <div style={{ padding: '8px 0 16px' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2d9f3', marginBottom: '12px' }}>
                    Confidence Threshold
                  </div>
                  <Slider value={settings.confidenceThreshold} min={50} max={95} step={5}
                    onChange={v => update('confidenceThreshold', v)}
                    leftLabel="Sensitive" rightLabel="Strict" label="%"
                  />
                  <div style={{ fontSize: '0.78rem', color: '#4a3f6b', marginTop: '8px' }}>
                    Higher = more accurate but may miss some signs. Lower = detects more but may have false positives.
                  </div>
                </div>

                <div style={{ padding: '8px 0' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2d9f3', marginBottom: '12px' }}>
                    Detection Speed
                  </div>
                  <Slider value={settings.detectionSpeed} min={50} max={500} step={50}
                    onChange={v => update('detectionSpeed', v)}
                    leftLabel="Fast" rightLabel="Slow" label="ms"
                  />
                  <div style={{ fontSize: '0.78rem', color: '#4a3f6b', marginTop: '8px' }}>
                    How often frames are sent to the AI model. Lower = faster but uses more resources.
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* GENERAL TAB */}
          {activeTab === 'general' && (
            <div>
              <Card title="GENERAL">
                <SettingRow label="Auto Save History" desc="Automatically save all detection sessions">
                  <Toggle value={settings.autoSaveHistory} onChange={v => update('autoSaveHistory', v)} />
                </SettingRow>
                <SettingRow label="Notifications" desc="Get notified about system updates">
                  <Toggle value={settings.notifications} onChange={v => update('notifications', v)} />
                </SettingRow>
                <SettingRow label="Language" desc="App interface language">
                  <select value={settings.language} onChange={e => update('language', e.target.value)} style={{
                    padding: '8px 14px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(139,92,246,0.2)',
                    borderRadius: '8px', color: '#e2d9f3',
                    fontSize: '0.85rem', outline: 'none', cursor: 'pointer'
                  }}>
                    <option value="en" style={{ background: '#0d1117' }}>English</option>
                    <option value="hi" style={{ background: '#0d1117' }}>Hindi</option>
                    <option value="es" style={{ background: '#0d1117' }}>Spanish</option>
                    <option value="fr" style={{ background: '#0d1117' }}>French</option>
                  </select>
                </SettingRow>
              </Card>

              <Card title="ABOUT SIGNOVA">
                <div style={{ padding: '8px 0' }}>
                  {[
                    { label: 'Version', value: '1.0.0' },
                    { label: 'AI Model', value: 'MediaPipe + Random Forest' },
                    { label: 'Backend', value: 'FastAPI + Python' },
                    { label: 'Frontend', value: 'React + Vite' },
                  ].map((item, i) => (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between',
                      padding: '10px 0',
                      borderBottom: i < 3 ? '1px solid rgba(139,92,246,0.08)' : 'none'
                    }}>
                      <span style={{ fontSize: '0.85rem', color: '#7c6d9c' }}>{item.label}</span>
                      <span style={{ fontSize: '0.85rem', color: '#a78bfa', fontWeight: 600 }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* ACCOUNT TAB */}
          {activeTab === 'account' && (
            <div>
              <Card title="ACCOUNT INFO">
                <div style={{ padding: '12px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                    <div style={{
                      width: '56px', height: '56px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.4rem', fontWeight: 800, color: 'white'
                    }}>S</div>
                    <div>
                      <div style={{ fontSize: '1rem', fontWeight: 700 }}>Signova User</div>
                      <div style={{ fontSize: '0.82rem', color: '#7c6d9c' }}>user@example.com</div>
                    </div>
                  </div>

                  {[
                    { label: 'Member Since', value: 'March 2025' },
                    { label: 'Plan', value: 'Free' },
                    { label: 'Sessions', value: '5 sessions' },
                  ].map((item, i) => (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between',
                      padding: '10px 0',
                      borderBottom: '1px solid rgba(139,92,246,0.08)'
                    }}>
                      <span style={{ fontSize: '0.85rem', color: '#7c6d9c' }}>{item.label}</span>
                      <span style={{ fontSize: '0.85rem', color: '#c4b5fd', fontWeight: 600 }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card title="DANGER ZONE">
                <div style={{ padding: '8px 0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button style={{
                    padding: '11px 20px', textAlign: 'left',
                    background: 'rgba(251,191,36,0.06)',
                    border: '1px solid rgba(251,191,36,0.2)',
                    borderRadius: '10px', color: '#fbbf24',
                    cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600
                  }}>
                    🗑 Clear All History
                  </button>
                  <button style={{
                    padding: '11px 20px', textAlign: 'left',
                    background: 'rgba(239,68,68,0.06)',
                    border: '1px solid rgba(239,68,68,0.2)',
                    borderRadius: '10px', color: '#f87171',
                    cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600
                  }}>
                    ⚠️ Delete Account
                  </button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useOutletContext } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { getSettings, speakText } from '../utils/settings'
const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const WS  = import.meta.env.VITE_WS_URL  || 'ws://localhost:8000'

const PICTOGRAMS = {
  'are you okay':{'emoji':'🙋','word':'You OK?'},'okay':{'emoji':'✅','word':'OK'},
  'do you need water':{'emoji':'💧','word':'Water?'},'need water':{'emoji':'💧','word':'Water?'},
  'water':{'emoji':'💧','word':'Water'},'call doctor':{'emoji':'👨‍⚕️','word':'Doctor'},
  'doctor':{'emoji':'👨‍⚕️','word':'Doctor'},'i am sorry':{'emoji':'🙏','word':'Sorry'},
  'sorry':{'emoji':'🙏','word':'Sorry'},'thank you':{'emoji':'🤝','word':'Thank you'},
  'thanks':{'emoji':'🤝','word':'Thanks'},'yes':{'emoji':'✅','word':'Yes'},
  'no':{'emoji':'❌','word':'No'},'wait please':{'emoji':'✋','word':'Wait'},
  'wait':{'emoji':'✋','word':'Wait'},'help':{'emoji':'🆘','word':'Help!'},
  'ambulance':{'emoji':'🚑','word':'Ambulance'},'police':{'emoji':'🚔','word':'Police'},
  'food':{'emoji':'🍽️','word':'Food'},'eat':{'emoji':'🍽️','word':'Eat'},
  'medicine':{'emoji':'💊','word':'Medicine'},'pain':{'emoji':'😣','word':'Pain'},
  'good':{'emoji':'👍','word':'Good'},'bad':{'emoji':'👎','word':'Bad'},
  'hospital':{'emoji':'🏥','word':'Hospital'},'family':{'emoji':'👨‍👩‍👧','word':'Family'},
  'call':{'emoji':'📞','word':'Call'},'stop':{'emoji':'🛑','word':'Stop'},
  'bathroom':{'emoji':'🚻','word':'Bathroom'},'i am fine':{'emoji':'😊','word':'I am fine'},
  'breathe':{'emoji':'😮‍💨','word':'Breathe'},'where':{'emoji':'📍','word':'Where?'},
  'come here':{'emoji':'👋','word':'Come here'},'sit':{'emoji':'🪑','word':'Sit down'},
  'sleep':{'emoji':'😴','word':'Sleep'},'money':{'emoji':'💰','word':'Money'},
  'home':{'emoji':'🏠','word':'Home'},'i love you':{'emoji':'❤️','word':'I love you'},
  'danger':{'emoji':'⚠️','word':'Danger'},'fire':{'emoji':'🔥','word':'Fire!'},
  'cold':{'emoji':'🥶','word':'Cold'},'hot':{'emoji':'🥵','word':'Hot'},
}

function getPictogram(text) {
  const lower = text.toLowerCase().trim()
  if (PICTOGRAMS[lower]) return PICTOGRAMS[lower]
  for (const key of Object.keys(PICTOGRAMS)) {
    if (lower.includes(key)) return PICTOGRAMS[key]
  }
  return null
}

const QUICK_REPLIES = ['Are you okay?','Need water?','Call doctor','Yes','No','Wait','Thank you','Sorry']

export default function Conversation() {
  const { user } = useAuth()
  const ctx      = useOutletContext?.() || {}
  const dark     = ctx.dark ?? (localStorage.getItem('signova_theme') !== 'light')
  const [isMobile, setIsMobile] = useState(false)

  const [messages,     setMessages]     = useState([{ id: 1, type: 'system', text: 'Conversation ready. Sign users use camera — hearing users type below.' }])
  const [inputText,    setInputText]    = useState('')
  const [isDetecting,  setIsDetecting]  = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(() => getSettings().voiceOutput)
  const [wsStatus,     setWsStatus]     = useState('idle')
  const [showPicto,    setShowPicto]    = useState(true)
  const [saving,       setSaving]       = useState(false)

  const videoRef       = useRef(null)
  const canvasRef      = useRef(null)
  const wsRef          = useRef(null)
  const intervalRef    = useRef(null)
  const messagesEndRef = useRef(null)
  const lastSignRef    = useRef('')
  const inputRef       = useRef(null)
  const startTimeRef   = useRef(null)
  const signsRef       = useRef([])

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => { setVoiceEnabled(getSettings().voiceOutput) }, [])

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })

  const addMessage = (type, text, sender) => {
    const msg = { id: Date.now() + Math.random(), type, text, sender, time: new Date().toLocaleTimeString() }
    setMessages(prev => [...prev, msg])
    if (type === 'sign') signsRef.current = [...signsRef.current, text]
    setTimeout(scrollToBottom, 100)
  }

  const saveSession = async () => {
    const signs = signsRef.current
    if (signs.length === 0) return
    if (!user?.id) return
    setSaving(true)
    try {
      const token    = localStorage.getItem('token')
      const duration = startTimeRef.current ? Math.max(1, Math.ceil((Date.now() - startTimeRef.current) / 60000)) : 1
      await axios.post(`${API}/api/history/save?user_id=${user.id}`,
        { session_name: 'Conversation Session', detected_signs: signs.join(','), session_type: 'conversation', duration: `${duration} mins` },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success(`Conversation saved! ${signs.length} signs recorded.`)
    } catch { toast.error('Could not save conversation.') }
    finally { setSaving(false) }
  }

  const startSigning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } })
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play() }
      signsRef.current = []; startTimeRef.current = Date.now()
      wsRef.current = new WebSocket(`${WS}/ws/detect`)
      setWsStatus('connecting')
      wsRef.current.onopen = () => {
        setIsDetecting(true); setWsStatus('connected')
        addMessage('system', 'Camera started. Begin signing...')
        const s = getSettings()
        intervalRef.current = setInterval(() => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            const canvas = canvasRef.current, video = videoRef.current
            if (canvas && video && video.videoWidth) {
              canvas.width = video.videoWidth; canvas.height = video.videoHeight
              canvas.getContext('2d').drawImage(video, 0, 0)
              wsRef.current.send(canvas.toDataURL('image/jpeg', 0.8))
            }
          }
        }, s.detectionSpeed)
      }
      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === 'mode_confirmed') return
          const s = getSettings()
          const threshold = (s.confidenceThreshold || 75) / 100
          if (data.sign && data.confidence > 0 && data.is_new && data.confidence >= threshold) {
            if (lastSignRef.current !== data.sign) {
              lastSignRef.current = data.sign
              addMessage('sign', data.sign, 'Sign User')
              speakText(data.sign)
            }
          }
        } catch {}
      }
      wsRef.current.onerror = () => setWsStatus('error')
      wsRef.current.onclose = () => setWsStatus('idle')
    } catch {
      addMessage('system', 'Camera access denied. Please allow camera permission.')
    }
  }

  const stopSigning = async () => {
    clearInterval(intervalRef.current)
    wsRef.current?.close()
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop())
      videoRef.current.srcObject = null
    }
    setIsDetecting(false); setWsStatus('idle'); lastSignRef.current = ''
    await saveSession()
    addMessage('system', 'Camera stopped. Session saved to History.')
  }

  const sendText = (e) => {
    e?.preventDefault()
    if (!inputText.trim()) return
    const text = inputText.trim()
    addMessage('text', text, 'You')
    if (voiceEnabled) speakText(text)
    if (showPicto) { const pic = getPictogram(text); if (pic) setTimeout(() => addMessage('pictogram', text, pic), 350) }
    setInputText(''); inputRef.current?.focus()
  }

  const sendQuick = (text) => {
    addMessage('text', text, 'You')
    if (voiceEnabled) speakText(text)
    if (showPicto) { const pic = getPictogram(text); if (pic) setTimeout(() => addMessage('pictogram', text, pic), 350) }
  }

  const clearAll = () => {
    setMessages([{ id: 1, type: 'system', text: 'Conversation cleared. Ready to start again.' }])
    lastSignRef.current = ''; signsRef.current = []
  }

  useEffect(() => () => {
    clearInterval(intervalRef.current); wsRef.current?.close()
    if (videoRef.current?.srcObject) videoRef.current.srcObject.getTracks().forEach(t => t.stop())
  }, [])

  const signCount = messages.filter(m => m.type === 'sign').length
  const textCount = messages.filter(m => m.type === 'text').length
  const s         = getSettings()

  // Theme
  const text      = dark ? '#f1f5f9' : '#0a1628'
  const textMuted = dark ? '#64748b' : '#94a3b8'
  const cardBg    = dark ? '#0d1035' : '#ffffff'
  const border    = dark ? '#1e2448' : '#e8edf2'
  const subBg     = dark ? '#111442' : '#f8fafc'
  const divider   = dark ? '#1e2448' : '#f0f4f8'
  const inputBg   = dark ? '#111442' : '#f8fafc'
  const accent    = '#6366f1'

  return (
    <div style={{ height: isMobile ? 'auto' : 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', fontFamily: "'DM Sans','Segoe UI',system-ui,sans-serif", color: text, gap: '14px', minHeight: 0 }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0, flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: text, letterSpacing: '-.5px', marginBottom: '4px' }}>Conversation Mode</h1>
          <p style={{ color: textMuted, fontSize: '13px' }}>Two-way communication between sign and non-sign language users</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Stats */}
          <div style={{ display: 'flex', gap: '10px', padding: '7px 14px', background: cardBg, border: `1px solid ${border}`, borderRadius: '10px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '15px', fontWeight: 800, color: accent }}>{signCount}</div>
              <div style={{ fontSize: '10px', color: textMuted }}>Signs</div>
            </div>
            <div style={{ width: '1px', background: divider }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#8b5cf6' }}>{textCount}</div>
              <div style={{ fontSize: '10px', color: textMuted }}>Messages</div>
            </div>
          </div>
          <button onClick={() => setShowPicto(!showPicto)} style={{ padding: '7px 14px', background: showPicto ? 'rgba(245,158,11,.08)' : (dark ? 'rgba(255,255,255,.04)' : subBg), border: `1px solid ${showPicto ? 'rgba(245,158,11,.3)' : border}`, borderRadius: '10px', color: showPicto ? '#f59e0b' : textMuted, cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
            {showPicto ? '🖼️ Picto On' : '🖼️ Picto Off'}
          </button>
          <button onClick={() => setVoiceEnabled(!voiceEnabled)} style={{ padding: '7px 14px', background: voiceEnabled ? 'rgba(16,185,129,.06)' : (dark ? 'rgba(255,255,255,.04)' : subBg), border: `1px solid ${voiceEnabled ? 'rgba(16,185,129,.25)' : border}`, borderRadius: '10px', color: voiceEnabled ? '#10b981' : textMuted, cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
            {voiceEnabled ? '🔊' : '🔇'}
          </button>
          <button onClick={clearAll} style={{ padding: '7px 14px', background: dark ? 'rgba(255,255,255,.04)' : subBg, border: `1px solid ${border}`, borderRadius: '10px', color: textMuted, cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>🗑</button>
        </div>
      </div>

      {/* ── Main Grid ──────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 280px', gap: '14px', flex: 1, overflow: isMobile ? 'visible' : 'hidden', minHeight: 0 }}>

        {/* ── LEFT — Chat ───────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0, background: cardBg, border: `1px solid ${border}`, borderRadius: '16px', transition: 'background .4s' }}>

          {/* Chat header */}
          <div style={{ padding: '12px 16px', borderBottom: `1px solid ${divider}`, display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0, flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: text }}>Live Transcript</div>
              <div style={{ fontSize: '12px', color: textMuted }}>Signs + messages + visual translations</div>
            </div>
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
              <div style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, background: dark ? 'rgba(255,255,255,.06)' : subBg, color: textMuted, border: `1px solid ${border}` }}>
                {s.voiceGender} · {s.voiceSpeed}x
              </div>
              {wsStatus === 'connected' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '20px', background: 'rgba(16,185,129,.08)', border: '1px solid rgba(16,185,129,.2)' }}>
                  <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10b981', animation: 'pulse 1.5s infinite' }} />
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#10b981' }}>AI Active</span>
                </div>
              )}
              {wsStatus === 'error' && (
                <div style={{ padding: '3px 10px', borderRadius: '20px', background: 'rgba(245,158,11,.08)', border: '1px solid rgba(245,158,11,.2)', fontSize: '10px', fontWeight: 700, color: '#f59e0b' }}>⚠️ No Backend</div>
              )}
            </div>
          </div>

          {/* Quick replies */}
          <div style={{ padding: '8px 14px', borderBottom: `1px solid ${divider}`, display: 'flex', gap: '5px', flexWrap: 'wrap', flexShrink: 0 }}>
            {QUICK_REPLIES.map((qr, i) => (
              <button key={i} onClick={() => sendQuick(qr)} style={{
                padding: '4px 11px', fontSize: '11px', fontWeight: 600,
                background: dark ? 'rgba(255,255,255,.05)' : subBg,
                border: `1px solid ${border}`, borderRadius: '20px', cursor: 'pointer', color: textMuted, transition: 'all .15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,.1)'; e.currentTarget.style.color = accent; e.currentTarget.style.borderColor = accent }}
                onMouseLeave={e => { e.currentTarget.style.background = dark ? 'rgba(255,255,255,.05)' : subBg; e.currentTarget.style.color = textMuted; e.currentTarget.style.borderColor = border }}
              >{qr}</button>
            ))}
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px', minHeight: isMobile ? '300px' : 0 }}>
            {messages.map(msg => (
              <div key={msg.id} style={{ display: 'flex', flexDirection: 'column' }}>
                {msg.type === 'system' && (
                  <div style={{ alignSelf: 'center', padding: '5px 12px', background: dark ? 'rgba(255,255,255,.05)' : subBg, border: `1px solid ${divider}`, borderRadius: '20px', fontSize: '12px', color: textMuted, textAlign: 'center' }}>{msg.text}</div>
                )}
                {msg.type === 'sign' && (
                  <div style={{ alignSelf: 'flex-start', maxWidth: '70%' }}>
                    <div style={{ fontSize: '11px', color: textMuted, marginBottom: '4px', paddingLeft: '4px' }}>🤟 Sign User · {msg.time}</div>
                    <div style={{ background: 'rgba(99,102,241,.08)', border: '1px solid rgba(99,102,241,.2)', borderRadius: '4px 14px 14px 14px', padding: '10px 14px' }}>
                      <div style={{ fontSize: '10px', fontWeight: 700, color: accent, letterSpacing: '.5px', marginBottom: '3px' }}>SIGN DETECTED</div>
                      <div style={{ fontSize: '17px', fontWeight: 800, color: text }}>{msg.text}</div>
                    </div>
                  </div>
                )}
                {msg.type === 'text' && (
                  <div style={{ alignSelf: 'flex-end', maxWidth: '70%' }}>
                    <div style={{ fontSize: '11px', color: textMuted, marginBottom: '4px', textAlign: 'right', paddingRight: '4px' }}>You · {msg.time}</div>
                    <div style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius: '14px 4px 14px 14px', padding: '10px 14px' }}>
                      <div style={{ fontSize: '14px', color: '#fff', lineHeight: 1.5 }}>{msg.text}</div>
                    </div>
                  </div>
                )}
                {msg.type === 'pictogram' && (
                  <div style={{ alignSelf: 'flex-start', maxWidth: '75%' }}>
                    <div style={{ fontSize: '11px', color: textMuted, marginBottom: '4px', paddingLeft: '4px' }}>🖼️ Visual translation · {msg.time}</div>
                    <div style={{ background: dark ? 'rgba(245,158,11,.08)' : '#fffbeb', border: '1.5px solid rgba(245,158,11,.3)', borderRadius: '4px 14px 14px 14px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', animation: 'popIn .3s ease' }}>
                      <div style={{ fontSize: '40px', lineHeight: 1, flexShrink: 0 }}>{msg.sender.emoji}</div>
                      <div>
                        <div style={{ fontSize: '18px', fontWeight: 900, color: '#f59e0b', marginBottom: '2px' }}>{msg.sender.word}</div>
                        <div style={{ fontSize: '11px', color: dark ? '#92400e' : '#92400e' }}>{msg.text}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '12px 14px', borderTop: `1px solid ${divider}`, flexShrink: 0 }}>
            <form onSubmit={sendText} style={{ display: 'flex', gap: '8px' }}>
              <input ref={inputRef} type="text" value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder="Type a message..."
                style={{ flex: 1, padding: '10px 14px', background: inputBg, border: `1.5px solid ${border}`, borderRadius: '10px', color: text, fontSize: '13px', outline: 'none', fontFamily: "'DM Sans','Segoe UI',system-ui", transition: 'border-color .15s' }}
                onFocus={e => e.target.style.borderColor = accent}
                onBlur={e => e.target.style.borderColor = border}
              />
              <button type="submit" style={{ padding: '10px 18px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', borderRadius: '10px', color: 'white', cursor: 'pointer', fontWeight: 700, fontSize: '13px', boxShadow: '0 4px 12px rgba(99,102,241,.35)', transition: 'all .15s' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 18px rgba(99,102,241,.5)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(99,102,241,.35)'}
              >Send →</button>
            </form>
          </div>
        </div>

        {/* ── RIGHT — Camera ────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minHeight: 0, overflowY: isMobile ? 'visible' : 'auto' }}>

          {/* Camera card */}
          <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: '16px', overflow: 'hidden', flexShrink: 0, transition: 'background .4s' }}>
            <div style={{ padding: '12px 14px', borderBottom: `1px solid ${divider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: text }}>Sign Camera</div>
              {isDetecting && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '20px', background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)' }}>
                  <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 1.5s infinite' }} />
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#ef4444' }}>LIVE</span>
                </div>
              )}
            </div>

            <div style={{ position: 'relative', aspectRatio: '4/3', background: '#06091a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <video ref={videoRef} autoPlay muted playsInline style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)', opacity: isDetecting ? 1 : 0, transition: 'opacity .3s' }} />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              {isDetecting && <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(99,102,241,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,.03) 1px, transparent 1px)', backgroundSize: '36px 36px', pointerEvents: 'none' }} />}
              {!isDetecting && (
                <div style={{ textAlign: 'center', zIndex: 1 }}>
                  <div style={{ fontSize: '32px', opacity: .15, marginBottom: '6px' }}>📷</div>
                  <div style={{ color: '#475569', fontSize: '12px' }}>Camera off</div>
                </div>
              )}
            </div>

            <div style={{ padding: '12px' }}>
              <button onClick={isDetecting ? stopSigning : startSigning} disabled={saving} style={{
                width: '100%', padding: '10px',
                background: isDetecting ? 'rgba(239,68,68,.08)' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                border: isDetecting ? '1.5px solid rgba(239,68,68,.25)' : 'none',
                borderRadius: '10px', color: isDetecting ? '#ef4444' : 'white',
                cursor: saving ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 700,
                transition: 'all .15s', opacity: saving ? .7 : 1,
                boxShadow: isDetecting ? 'none' : '0 4px 14px rgba(99,102,241,.35)',
              }}>
                {saving ? '💾 Saving...' : isDetecting ? '⏹ Stop & Save' : '📷 Start Signing'}
              </button>
            </div>
          </div>

          {/* Auto-save notice */}
          <div style={{ padding: '9px 12px', background: 'rgba(16,185,129,.05)', border: '1px solid rgba(16,185,129,.15)', borderRadius: '10px', fontSize: '12px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            💾 Signs auto-save to History when camera stops
          </div>

          {/* How it works */}
          <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: '16px', padding: '14px', flexShrink: 0, transition: 'background .4s' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: textMuted, letterSpacing: '.3px', marginBottom: '12px' }}>HOW IT WORKS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { color: accent,     icon: '🤟', title: 'Sign User',        desc: 'Use camera to sign — AI detects and speaks'    },
                { color: '#8b5cf6',  icon: '⌨️', title: 'Hearing User',     desc: 'Type below — message is read aloud'            },
                { color: '#f59e0b',  icon: '🖼️', title: 'Pictogram (NEW)', desc: 'Emoji + visual word for deaf person'            },
                { color: '#10b981',  icon: '💾', title: 'Auto Save',        desc: 'Signs saved to History automatically'           },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '9px 10px', background: dark ? 'rgba(255,255,255,.04)' : subBg, borderRadius: '10px', border: `1px solid ${divider}` }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0, background: `${item.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px' }}>{item.icon}</div>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: item.color, marginBottom: '2px' }}>{item.title}</div>
                    <div style={{ fontSize: '11px', color: textMuted, lineHeight: 1.5 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(1.3)}}
        @keyframes popIn{0%{transform:scale(.85);opacity:0}100%{transform:scale(1);opacity:1}}
        *{box-sizing:border-box;}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-thumb{background:${dark ? '#1e2448' : '#e2e8f0'};border-radius:2px;}
        input::placeholder{color:#64748b;}
      `}</style>
    </div>
  )
}
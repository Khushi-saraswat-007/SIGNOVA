import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import toast from 'react-hot-toast'
import { getSettings, speakText } from '../utils/settings'

const PICTOGRAMS = {
  'are you okay':      { emoji: '🙋', word: 'You OK?'    },
  'okay':              { emoji: '✅', word: 'OK'          },
  'do you need water': { emoji: '💧', word: 'Water?'     },
  'need water':        { emoji: '💧', word: 'Water?'     },
  'water':             { emoji: '💧', word: 'Water'       },
  'call doctor':       { emoji: '👨‍⚕️', word: 'Doctor' },
  'doctor':            { emoji: '👨‍⚕️', word: 'Doctor' },
  'i am sorry':        { emoji: '🙏', word: 'Sorry'       },
  'sorry':             { emoji: '🙏', word: 'Sorry'       },
  'thank you':         { emoji: '🤝', word: 'Thank you'   },
  'thanks':            { emoji: '🤝', word: 'Thanks'      },
  'yes':               { emoji: '✅', word: 'Yes'          },
  'no':                { emoji: '❌', word: 'No'           },
  'wait please':       { emoji: '✋', word: 'Wait'        },
  'wait':              { emoji: '✋', word: 'Wait'        },
  'help':              { emoji: '🆘', word: 'Help!'       },
  'ambulance':         { emoji: '🚑', word: 'Ambulance'   },
  'police':            { emoji: '🚔', word: 'Police'      },
  'food':              { emoji: '🍽️', word: 'Food'       },
  'eat':               { emoji: '🍽️', word: 'Eat'        },
  'medicine':          { emoji: '💊', word: 'Medicine'    },
  'pain':              { emoji: '😣', word: 'Pain'        },
  'good':              { emoji: '👍', word: 'Good'        },
  'bad':               { emoji: '👎', word: 'Bad'         },
  'hospital':          { emoji: '🏥', word: 'Hospital'    },
  'family':            { emoji: '👨‍👩‍👧', word: 'Family'},
  'call':              { emoji: '📞', word: 'Call'        },
  'stop':              { emoji: '🛑', word: 'Stop'        },
  'bathroom':          { emoji: '🚻', word: 'Bathroom'    },
  'i am fine':         { emoji: '😊', word: 'I am fine'  },
  'breathe':           { emoji: '😮‍💨', word: 'Breathe'},
  'where':             { emoji: '📍', word: 'Where?'      },
  'come here':         { emoji: '👋', word: 'Come here'   },
  'sit':               { emoji: '🪑', word: 'Sit down'    },
  'sleep':             { emoji: '😴', word: 'Sleep'       },
  'money':             { emoji: '💰', word: 'Money'       },
  'home':              { emoji: '🏠', word: 'Home'        },
  'i love you':        { emoji: '❤️', word: 'I love you' },
  'danger':            { emoji: '⚠️', word: 'Danger'     },
  'fire':              { emoji: '🔥', word: 'Fire!'       },
  'cold':              { emoji: '🥶', word: 'Cold'        },
  'hot':               { emoji: '🥵', word: 'Hot'         },
}

function getPictogram(text) {
  const lower = text.toLowerCase().trim()
  if (PICTOGRAMS[lower]) return PICTOGRAMS[lower]
  for (const key of Object.keys(PICTOGRAMS)) {
    if (lower.includes(key)) return PICTOGRAMS[key]
  }
  return null
}

const QUICK_REPLIES = [
  'Are you okay?', 'Need water?', 'Call doctor',
  'Yes', 'No', 'Wait', 'Thank you', 'Sorry',
]

export default function Conversation() {
  const { user } = useAuth()

  const [messages,      setMessages]     = useState([
    { id: 1, type: 'system', text: 'Conversation ready. Sign users use camera — hearing users type below.' }
  ])
  const [inputText,     setInputText]    = useState('')
  const [isDetecting,   setIsDetecting]  = useState(false)
  const [voiceEnabled,  setVoiceEnabled] = useState(() => getSettings().voiceOutput)
  const [wsStatus,      setWsStatus]     = useState('idle')
  const [showPicto,     setShowPicto]    = useState(true)
  const [saving,        setSaving]       = useState(false)

  const videoRef       = useRef(null)
  const canvasRef      = useRef(null)
  const wsRef          = useRef(null)
  const intervalRef    = useRef(null)
  const messagesEndRef = useRef(null)
  const lastSignRef    = useRef('')
  const inputRef       = useRef(null)
  const startTimeRef   = useRef(null)
  // ← Use ref to track signs (avoids stale closure in save)
  const signsRef       = useRef([])

  useEffect(() => {
    const s = getSettings()
    setVoiceEnabled(s.voiceOutput)
  }, [])

  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })

  const speak = (text) => {
    if (!voiceEnabled || !text) return
    speakText(text)
  }

  const addMessage = (type, text, sender) => {
    const msg = { id: Date.now() + Math.random(), type, text, sender, time: new Date().toLocaleTimeString() }
    setMessages(prev => [...prev, msg])
    // Track signs in ref for reliable save
    if (type === 'sign') {
      signsRef.current = [...signsRef.current, text]
    }
    setTimeout(scrollToBottom, 100)
  }

  // ── Save session using ref (always up to date) ────────────────
  const saveSession = async () => {
    const signs = signsRef.current
    if (signs.length === 0) return
    if (!user?.id) return
    setSaving(true)
    try {
      const token    = localStorage.getItem('token')
      const duration = startTimeRef.current
        ? Math.max(1, Math.ceil((Date.now() - startTimeRef.current) / 60000))
        : 1
      await axios.post(
        `http://localhost:8000/api/history/save?user_id=${user.id}`,
        {
          session_name:   'Conversation Session',
          detected_signs: signs.join(','),
          session_type:   'conversation',
          duration:       `${duration} mins`,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success(`Conversation saved! ${signs.length} signs recorded.`)
    } catch (err) {
      console.error('Save failed:', err)
      toast.error('Could not save conversation.')
    } finally {
      setSaving(false)
    }
  }

  const startSigning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      // Reset signs tracker
      signsRef.current = []
      startTimeRef.current = Date.now()

      wsRef.current = new WebSocket('ws://localhost:8000/ws/detect')
      setWsStatus('connecting')

      wsRef.current.onopen = () => {
        setIsDetecting(true)
        setWsStatus('connected')
        addMessage('system', 'Camera started. Begin signing...')

        const s = getSettings()
        intervalRef.current = setInterval(() => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            const canvas = canvasRef.current
            const video  = videoRef.current
            if (canvas && video && video.videoWidth) {
              canvas.width  = video.videoWidth
              canvas.height = video.videoHeight
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

          // Use saved confidence threshold
          const s = getSettings()
          const threshold = (s.confidenceThreshold || 75) / 100

          if (data.sign && data.confidence > 0 && data.is_new) {
            // Only accept if meets threshold
            if (data.confidence >= threshold) {
              if (lastSignRef.current !== data.sign) {
                lastSignRef.current = data.sign
                addMessage('sign', data.sign, 'Sign User')
                speakText(data.sign) // always use speakText directly
              }
            }
          }
        } catch (e) {
          console.error('WS message error:', e)
        }
      }

      wsRef.current.onerror = (e) => {
        console.error('WS error:', e)
        setWsStatus('error')
      }
      wsRef.current.onclose = () => setWsStatus('idle')

    } catch (err) {
      console.error('Camera error:', err)
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
    setIsDetecting(false)
    setWsStatus('idle')
    lastSignRef.current = ''

    // Save using ref — always has latest signs
    await saveSession()
    addMessage('system', 'Camera stopped. Session saved to History.')
  }

  const sendText = (e) => {
    e?.preventDefault()
    if (!inputText.trim()) return
    const text = inputText.trim()
    addMessage('text', text, 'You')
    speak(text)
    if (showPicto) {
      const pic = getPictogram(text)
      if (pic) setTimeout(() => addMessage('pictogram', text, pic), 350)
    }
    setInputText('')
    inputRef.current?.focus()
  }

  const sendQuick = (text) => {
    addMessage('text', text, 'You')
    speak(text)
    if (showPicto) {
      const pic = getPictogram(text)
      if (pic) setTimeout(() => addMessage('pictogram', text, pic), 350)
    }
  }

  const clearAll = () => {
    setMessages([{ id: 1, type: 'system', text: 'Conversation cleared. Ready to start again.' }])
    lastSignRef.current = ''
    signsRef.current    = []
  }

  useEffect(() => () => {
    clearInterval(intervalRef.current)
    wsRef.current?.close()
    if (videoRef.current?.srcObject)
      videoRef.current.srcObject.getTracks().forEach(t => t.stop())
  }, [])

  const signCount = messages.filter(m => m.type === 'sign').length
  const textCount = messages.filter(m => m.type === 'text').length
  const s         = getSettings()

  return (
    <div style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', fontFamily: "'DM Sans','Segoe UI',system-ui,sans-serif", color: '#0a1628', gap: '16px', minHeight: 0 }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0a1628', letterSpacing: '-0.5px', marginBottom: '4px' }}>Conversation Mode</h1>
          <p style={{ color: '#64748b', fontSize: '13px' }}>Two-way communication between sign and non-sign language users</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '12px', padding: '8px 16px', background: '#ffffff', border: '1px solid #e8edf2', borderRadius: '10px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#0066ff' }}>{signCount}</div>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>Signs</div>
            </div>
            <div style={{ width: '1px', background: '#f0f4f8' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#8b5cf6' }}>{textCount}</div>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>Messages</div>
            </div>
          </div>
          <button onClick={() => setShowPicto(!showPicto)} style={{ padding: '8px 16px', background: showPicto ? 'rgba(245,158,11,0.08)' : '#f8fafc', border: `1px solid ${showPicto ? 'rgba(245,158,11,0.3)' : '#e2e8f0'}`, borderRadius: '10px', color: showPicto ? '#f59e0b' : '#94a3b8', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
            {showPicto ? '🖼️ Picto On' : '🖼️ Picto Off'}
          </button>
          <button onClick={() => setVoiceEnabled(!voiceEnabled)} style={{ padding: '8px 16px', background: voiceEnabled ? 'rgba(16,185,129,0.06)' : '#f8fafc', border: `1px solid ${voiceEnabled ? 'rgba(16,185,129,0.25)' : '#e2e8f0'}`, borderRadius: '10px', color: voiceEnabled ? '#10b981' : '#94a3b8', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
            {voiceEnabled ? '🔊 Voice On' : '🔇 Voice Off'}
          </button>
          <button onClick={clearAll} style={{ padding: '8px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', color: '#64748b', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>🗑 Clear</button>
        </div>
      </div>

      {/* ── Main Grid ──────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '16px', flex: 1, overflow: 'hidden', minHeight: 0 }}>

        {/* ── LEFT — Chat ───────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0, background: '#ffffff', border: '1px solid #e8edf2', borderRadius: '16px' }}>

          {/* Header */}
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #f0f4f8', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0a1628' }}>Live Transcript</div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>Signs + messages + visual translations</div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <div style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0' }}>
                {s.voiceGender} · {s.voiceSpeed}x
              </div>
              {wsStatus === 'connected' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '20px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', animation: 'pulse 1.5s infinite' }} />
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#10b981' }}>AI Active</span>
                </div>
              )}
              {wsStatus === 'error' && (
                <div style={{ padding: '4px 12px', borderRadius: '20px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', fontSize: '11px', fontWeight: 700, color: '#f59e0b' }}>
                  ⚠️ No Backend
                </div>
              )}
              {showPicto && (
                <div style={{ padding: '4px 10px', borderRadius: '20px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', fontSize: '11px', fontWeight: 700, color: '#f59e0b' }}>🖼️ Pictogram</div>
              )}
            </div>
          </div>

          {/* Quick replies */}
          <div style={{ padding: '8px 16px', borderBottom: '1px solid #f0f4f8', display: 'flex', gap: '6px', flexWrap: 'wrap', flexShrink: 0 }}>
            {QUICK_REPLIES.map((qr, i) => (
              <button key={i} onClick={() => sendQuick(qr)}
                style={{ padding: '4px 12px', fontSize: '11px', fontWeight: 600, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '20px', cursor: 'pointer', color: '#64748b', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#e8f0fe'; e.currentTarget.style.color = '#0066ff'; e.currentTarget.style.borderColor = '#0066ff' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = '#e2e8f0' }}
              >{qr}</button>
            ))}
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px', minHeight: 0 }}>
            {messages.map(msg => (
              <div key={msg.id} style={{ display: 'flex', flexDirection: 'column' }}>
                {msg.type === 'system' && (
                  <div style={{ alignSelf: 'center', padding: '6px 14px', background: '#f8fafc', border: '1px solid #f0f4f8', borderRadius: '20px', fontSize: '12px', color: '#94a3b8', textAlign: 'center' }}>{msg.text}</div>
                )}
                {msg.type === 'sign' && (
                  <div style={{ alignSelf: 'flex-start', maxWidth: '70%' }}>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px', paddingLeft: '4px' }}>🤟 Sign User · {msg.time}</div>
                    <div style={{ background: 'rgba(0,102,255,0.06)', border: '1px solid rgba(0,102,255,0.15)', borderRadius: '4px 14px 14px 14px', padding: '12px 16px' }}>
                      <div style={{ fontSize: '10px', fontWeight: 700, color: '#0066ff', letterSpacing: '0.5px', marginBottom: '4px' }}>SIGN DETECTED</div>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: '#0a1628' }}>{msg.text}</div>
                    </div>
                  </div>
                )}
                {msg.type === 'text' && (
                  <div style={{ alignSelf: 'flex-end', maxWidth: '70%' }}>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px', textAlign: 'right', paddingRight: '4px' }}>You · {msg.time}</div>
                    <div style={{ background: '#0066ff', borderRadius: '14px 4px 14px 14px', padding: '12px 16px' }}>
                      <div style={{ fontSize: '14px', color: '#ffffff', lineHeight: 1.5 }}>{msg.text}</div>
                    </div>
                  </div>
                )}
                {msg.type === 'pictogram' && (
                  <div style={{ alignSelf: 'flex-start', maxWidth: '75%' }}>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px', paddingLeft: '4px' }}>🖼️ Visual translation · {msg.time}</div>
                    <div style={{ background: '#fffbeb', border: '1.5px solid rgba(245,158,11,0.3)', borderRadius: '4px 14px 14px 14px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '14px', animation: 'popIn 0.3s ease' }}>
                      <div style={{ fontSize: '44px', lineHeight: 1, flexShrink: 0 }}>{msg.sender.emoji}</div>
                      <div>
                        <div style={{ fontSize: '20px', fontWeight: 900, color: '#b45309', marginBottom: '3px' }}>{msg.sender.word}</div>
                        <div style={{ fontSize: '11px', color: '#92400e' }}>{msg.text}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '14px 16px', borderTop: '1px solid #f0f4f8', flexShrink: 0 }}>
            <form onSubmit={sendText} style={{ display: 'flex', gap: '10px' }}>
              <input ref={inputRef} type="text" value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder="Type a message — pictogram auto-shows for deaf person..."
                style={{ flex: 1, padding: '11px 16px', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '10px', color: '#0a1628', fontSize: '14px', outline: 'none', fontFamily: "'DM Sans','Segoe UI',system-ui", transition: 'border-color 0.15s' }}
                onFocus={e => e.target.style.borderColor = '#0066ff'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              />
              <button type="submit" style={{ padding: '11px 20px', background: '#0066ff', border: 'none', borderRadius: '10px', color: 'white', cursor: 'pointer', fontWeight: 700, fontSize: '14px', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#0052cc'}
                onMouseLeave={e => e.currentTarget.style.background = '#0066ff'}
              >Send →</button>
            </form>
          </div>
        </div>

        {/* ── RIGHT — Camera ────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minHeight: 0, overflowY: 'auto' }}>

          {/* Camera card */}
          <div style={{ background: '#ffffff', border: '1px solid #e8edf2', borderRadius: '16px', overflow: 'hidden', flexShrink: 0 }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0a1628' }}>Sign Camera</div>
              {isDetecting && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '20px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 1.5s infinite' }} />
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#ef4444' }}>LIVE</span>
                </div>
              )}
            </div>

            <div style={{ position: 'relative', aspectRatio: '4/3', background: '#0a1628', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <video ref={videoRef} autoPlay muted playsInline style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)', opacity: isDetecting ? 1 : 0, transition: 'opacity 0.3s' }} />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              {!isDetecting && (
                <div style={{ textAlign: 'center', zIndex: 1 }}>
                  <div style={{ fontSize: '36px', opacity: 0.2, marginBottom: '8px' }}>📷</div>
                  <div style={{ color: '#475569', fontSize: '12px' }}>Camera off</div>
                </div>
              )}
            </div>

            <div style={{ padding: '14px' }}>
              <button onClick={isDetecting ? stopSigning : startSigning} disabled={saving}
                style={{ width: '100%', padding: '11px', background: isDetecting ? 'rgba(239,68,68,0.06)' : '#0066ff', border: isDetecting ? '1.5px solid rgba(239,68,68,0.25)' : 'none', borderRadius: '10px', color: isDetecting ? '#ef4444' : 'white', cursor: saving ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 700, transition: 'all 0.15s', opacity: saving ? 0.7 : 1 }}>
                {saving ? '💾 Saving...' : isDetecting ? '⏹ Stop & Save' : '📷 Start Signing'}
              </button>
            </div>
          </div>

          {/* Auto-save notice */}
          <div style={{ padding: '10px 14px', background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: '10px', fontSize: '12px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            💾 Signs auto-save to History when camera stops
          </div>

          {/* How it works */}
          <div style={{ background: '#ffffff', border: '1px solid #e8edf2', borderRadius: '16px', padding: '16px', flexShrink: 0 }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#334155', letterSpacing: '0.3px', marginBottom: '14px' }}>HOW IT WORKS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { color: '#0066ff', icon: '🤟', title: 'Sign User',        desc: 'Use camera to sign — AI detects and speaks' },
                { color: '#8b5cf6', icon: '⌨️', title: 'Hearing User',     desc: 'Type below — message is read aloud' },
                { color: '#f59e0b', icon: '🖼️', title: 'Pictogram (NEW)', desc: 'Emoji + visual word for deaf person' },
                { color: '#10b981', icon: '💾', title: 'Auto Save',        desc: 'Signs saved to History automatically' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '10px 12px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #f0f4f8' }}>
                  <div style={{ width: '30px', height: '30px', borderRadius: '8px', flexShrink: 0, background: `${item.color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>{item.icon}</div>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: item.color, marginBottom: '2px' }}>{item.title}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', lineHeight: 1.5 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(1.3)}}
        @keyframes popIn{0%{transform:scale(0.85);opacity:0}100%{transform:scale(1);opacity:1}}
        *{box-sizing:border-box;}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-thumb{background:#e2e8f0;border-radius:2px;}
        input::placeholder{color:#94a3b8;}
      `}</style>
    </div>
  )
}
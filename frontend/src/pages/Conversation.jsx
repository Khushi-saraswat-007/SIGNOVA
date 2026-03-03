import { useState, useRef } from 'react'

export default function Conversation() {
  const [messages, setMessages] = useState([
    { id: 1, type: 'system', text: 'Conversation mode started. Sign users can use camera, non-sign users can type.' }
  ])
  const [inputText, setInputText] = useState('')
  const [isDetecting, setIsDetecting] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const wsRef = useRef(null)
  const intervalRef = useRef(null)
  const messagesEndRef = useRef(null)
  const lastSignRef = useRef('')

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const speak = (text) => {
    if (!voiceEnabled || !text) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.rate = 0.9
    window.speechSynthesis.speak(u)
  }

  const addMessage = (type, text, sender) => {
    const msg = { id: Date.now(), type, text, sender, time: new Date().toLocaleTimeString() }
    setMessages(prev => [...prev, msg])
    setTimeout(scrollToBottom, 100)
    return msg
  }

  const startSigning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      wsRef.current = new WebSocket('ws://localhost:8000/ws/detect')

      wsRef.current.onopen = () => {
        setIsDetecting(true)
        addMessage('system', 'Camera started. Begin signing...')
        intervalRef.current = setInterval(() => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            const canvas = canvasRef.current
            const video = videoRef.current
            if (canvas && video && video.videoWidth) {
              canvas.width = video.videoWidth
              canvas.height = video.videoHeight
              canvas.getContext('2d').drawImage(video, 0, 0)
              wsRef.current.send(canvas.toDataURL('image/jpeg', 0.8))
            }
          }
        }, 150)
      }

      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (data.sign && data.confidence > 0.65 && data.is_new) {
          if (lastSignRef.current !== data.sign) {
            lastSignRef.current = data.sign
            addMessage('sign', data.sign, 'Sign User')
            speak(data.sign)
          }
        }
      }

      wsRef.current.onerror = () => {
        setIsDetecting(true) // keep camera on even without backend
        addMessage('system', 'Camera on. Connect backend for AI detection.')
      }

    } catch (err) {
      addMessage('system', 'Camera access denied. Please allow camera permission.')
    }
  }

  const stopSigning = () => {
    clearInterval(intervalRef.current)
    wsRef.current?.close()
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop())
      videoRef.current.srcObject = null
    }
    setIsDetecting(false)
    addMessage('system', 'Camera stopped.')
    lastSignRef.current = ''
  }

  const sendTextMessage = (e) => {
    e.preventDefault()
    if (!inputText.trim()) return
    addMessage('text', inputText.trim(), 'You')
    speak(inputText.trim())
    setInputText('')
  }

  const clearConversation = () => {
    setMessages([{ id: 1, type: 'system', text: 'Conversation cleared. Ready to start again.' }])
    lastSignRef.current = ''
  }

  const getMsgStyle = (msg) => {
    if (msg.type === 'system') return {
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(139,92,246,0.1)',
      color: '#4a3f6b', fontSize: '0.78rem',
      textAlign: 'center', borderRadius: '8px',
      padding: '7px 14px', alignSelf: 'center'
    }
    if (msg.type === 'sign') return {
      background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(37,99,235,0.1))',
      border: '1px solid rgba(167,139,250,0.25)',
      color: '#e2d9f3', borderRadius: '14px 14px 14px 4px',
      padding: '12px 16px', alignSelf: 'flex-start', maxWidth: '70%'
    }
    return {
      background: 'linear-gradient(135deg, rgba(56,189,248,0.15), rgba(52,211,153,0.08))',
      border: '1px solid rgba(56,189,248,0.25)',
      color: '#e2d9f3', borderRadius: '14px 14px 4px 14px',
      padding: '12px 16px', alignSelf: 'flex-end', maxWidth: '70%'
    }
  }

  return (
    <div style={{ color: '#e2d9f3', fontFamily: "'Segoe UI', system-ui, sans-serif", height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '6px' }}>Conversation Mode</h1>
          <p style={{ color: '#7c6d9c', fontSize: '0.88rem' }}>Two-way communication between sign and non-sign language users</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setVoiceEnabled(!voiceEnabled)} style={{
            padding: '8px 16px',
            background: voiceEnabled ? 'rgba(52,211,153,0.1)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${voiceEnabled ? 'rgba(52,211,153,0.3)' : 'rgba(139,92,246,0.2)'}`,
            borderRadius: '10px', color: voiceEnabled ? '#34d399' : '#7c6d9c',
            cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600
          }}>
            {voiceEnabled ? '🔊 Voice On' : '🔇 Voice Off'}
          </button>
          <button onClick={clearConversation} style={{
            padding: '8px 16px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(139,92,246,0.2)',
            borderRadius: '10px', color: '#9d8ec0',
            cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600
          }}>
            🗑 Clear
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '16px', flex: 1, overflow: 'hidden' }}>

        {/* LEFT — Chat */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflow: 'hidden' }}>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '16px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(139,92,246,0.12)',
            borderRadius: '18px',
            display: 'flex', flexDirection: 'column', gap: '10px'
          }}>
            {messages.map(msg => (
              <div key={msg.id} style={{ display: 'flex', flexDirection: 'column' }}>
                {msg.sender && (
                  <div style={{
                    fontSize: '0.7rem', color: '#4a3f6b', marginBottom: '4px',
                    alignSelf: msg.type === 'text' ? 'flex-end' : 'flex-start',
                    paddingLeft: msg.type === 'sign' ? '4px' : '0',
                    paddingRight: msg.type === 'text' ? '4px' : '0'
                  }}>
                    {msg.sender} • {msg.time}
                  </div>
                )}
                <div style={getMsgStyle(msg)}>
                  {msg.type === 'sign' && (
                    <div style={{ fontSize: '0.7rem', color: '#a78bfa', fontWeight: 700, marginBottom: '4px', letterSpacing: '0.5px' }}>
                      🤟 SIGN DETECTED
                    </div>
                  )}
                  <div style={{ fontSize: msg.type === 'sign' ? '1.2rem' : '0.92rem', fontWeight: msg.type === 'sign' ? 700 : 400 }}>
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Text input */}
          <form onSubmit={sendTextMessage} style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Type a message (non-sign user)..."
              style={{
                flex: 1, padding: '13px 18px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(139,92,246,0.2)',
                borderRadius: '12px', color: '#e2d9f3',
                fontSize: '0.92rem', outline: 'none'
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(139,92,246,0.6)'}
              onBlur={e => e.target.style.borderColor = 'rgba(139,92,246,0.2)'}
            />
            <button type="submit" style={{
              padding: '13px 22px',
              background: 'linear-gradient(135deg, #38bdf8, #34d399)',
              border: 'none', borderRadius: '12px', color: 'white',
              cursor: 'pointer', fontWeight: 700, fontSize: '0.92rem',
              boxShadow: '0 0 20px rgba(56,189,248,0.3)'
            }}>
              Send →
            </button>
          </form>
        </div>

        {/* RIGHT — Camera */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Camera view */}
          <div style={{
            position: 'relative', borderRadius: '16px', overflow: 'hidden',
            background: '#07050f',
            border: `1px solid ${isDetecting ? 'rgba(167,139,250,0.35)' : 'rgba(139,92,246,0.15)'}`,
            aspectRatio: '4/3',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <video ref={videoRef} autoPlay muted playsInline style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%',
              objectFit: 'cover', transform: 'scaleX(-1)',
              opacity: isDetecting ? 1 : 0, transition: 'opacity 0.3s'
            }} />
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {!isDetecting && (
              <div style={{ textAlign: 'center', zIndex: 1 }}>
                <div style={{ fontSize: '2.5rem', opacity: 0.2, marginBottom: '8px' }}>📷</div>
                <div style={{ color: '#4a3f6b', fontSize: '0.78rem' }}>Camera Off</div>
              </div>
            )}

            {isDetecting && (
              <div style={{
                position: 'absolute', top: '10px', left: '10px', zIndex: 10,
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '4px 10px',
                background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)',
                border: '1px solid rgba(52,211,153,0.3)', borderRadius: '20px'
              }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399', animation: 'blink 1.5s infinite', boxShadow: '0 0 6px #34d399' }} />
                <span style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: 600 }}>LIVE</span>
              </div>
            )}
          </div>

          {/* Camera controls */}
          <button onClick={isDetecting ? stopSigning : startSigning} style={{
            width: '100%', padding: '12px',
            background: isDetecting ? 'rgba(239,68,68,0.1)' : 'linear-gradient(135deg, #7c3aed, #2563eb)',
            border: isDetecting ? '1px solid rgba(239,68,68,0.3)' : 'none',
            borderRadius: '12px',
            color: isDetecting ? '#f87171' : 'white',
            cursor: 'pointer', fontSize: '0.88rem', fontWeight: 700,
            boxShadow: isDetecting ? 'none' : '0 0 20px rgba(124,58,237,0.4)'
          }}>
            {isDetecting ? '⏹ Stop Camera' : '📷 Start Signing'}
          </button>

          {/* Legend */}
          <div style={{
            padding: '14px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(139,92,246,0.12)',
            borderRadius: '14px'
          }}>
            <div style={{ fontSize: '0.72rem', color: '#7c6d9c', letterSpacing: '1px', marginBottom: '10px' }}>HOW IT WORKS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { color: '#a78bfa', icon: '🤟', text: 'Sign user uses camera' },
                { color: '#38bdf8', icon: '⌨️', text: 'Non-sign user types below' },
                { color: '#34d399', icon: '🔊', text: 'Voice reads all messages' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.9rem' }}>{item.icon}</span>
                  <span style={{ fontSize: '0.78rem', color: '#7c6d9c' }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  )
}
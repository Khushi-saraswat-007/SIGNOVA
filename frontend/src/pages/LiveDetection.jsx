import { useState, useRef, useEffect, useCallback } from 'react'

export default function LiveDetection() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const wsRef = useRef(null)
  const intervalRef = useRef(null)
  const [cameraOn, setCameraOn] = useState(false)
  const [detecting, setDetecting] = useState(false)
  const [currentSign, setCurrentSign] = useState('')
  const [confidence, setConfidence] = useState(0)
  const [transcript, setTranscript] = useState([])
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [cameraError, setCameraError] = useState('')
  const [wsStatus, setWsStatus] = useState('idle')

  const speak = useCallback((text) => {
    if (!voiceEnabled || !text) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.rate = 0.9
    window.speechSynthesis.speak(u)
  }, [voiceEnabled])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setCameraError('')
      setCameraOn(true)
      return true
    } catch (err) {
      setCameraError('Camera access denied. Please allow camera permission and try again.')
      return false
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop())
      videoRef.current.srcObject = null
    }
    setCameraOn(false)
  }

  const captureFrame = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || !video.videoWidth) return null
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    return canvas.toDataURL('image/jpeg', 0.8)
  }

  const connectWebSocket = () => {
    try {
      wsRef.current = new WebSocket('ws://localhost:8000/ws/detect')

      wsRef.current.onopen = () => {
        setWsStatus('connected')
        setDetecting(true)
        intervalRef.current = setInterval(() => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            const frame = captureFrame()
            if (frame) wsRef.current.send(frame)
          }
        }, 150)
      }

      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (data.sign && data.confidence > 0.6) {
          setCurrentSign(data.sign)
          setConfidence(Math.round(data.confidence * 100))
          if (data.is_new) {
            setTranscript(prev => [
              { sign: data.sign, confidence: Math.round(data.confidence * 100), time: new Date().toLocaleTimeString() },
              ...prev.slice(0, 19)
            ])
            speak(data.sign)
          }
        }
      }

      wsRef.current.onerror = () => setWsStatus('error')
      wsRef.current.onclose = () => { setWsStatus('idle'); setDetecting(false) }

    } catch (err) {
      setWsStatus('error')
    }
  }

  const handleStart = async () => {
    const ok = await startCamera()
    if (!ok) return
    setWsStatus('connecting')
    connectWebSocket()
  }

  const handleStop = () => {
    clearInterval(intervalRef.current)
    wsRef.current?.close()
    stopCamera()
    setDetecting(false)
    setCurrentSign('')
    setConfidence(0)
    setWsStatus('idle')
  }

  useEffect(() => () => handleStop(), [])

  const getStatusBadge = () => {
    if (!cameraOn) return { text: 'Camera Off', color: '#4a3f6b', dot: '#4a3f6b', pulse: false }
    if (wsStatus === 'connecting') return { text: 'Connecting AI...', color: '#fbbf24', dot: '#fbbf24', pulse: true }
    if (wsStatus === 'connected' && detecting) return { text: 'AI Detecting', color: '#34d399', dot: '#34d399', pulse: true }
    if (wsStatus === 'error') return { text: 'Camera On • No AI', color: '#fbbf24', dot: '#fbbf24', pulse: false }
    return { text: 'Camera On', color: '#38bdf8', dot: '#38bdf8', pulse: false }
  }

  const badge = getStatusBadge()

  return (
    <div style={{ color: '#e2d9f3', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '6px' }}>Live Sign Detection</h1>
        <p style={{ color: '#7c6d9c', fontSize: '0.88rem' }}>
          Point your camera at your hands to detect sign language in real time
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px' }}>

        {/* LEFT — Camera */}
        <div>
          {/* Camera box */}
          <div style={{
            position: 'relative', borderRadius: '20px', overflow: 'hidden',
            background: '#07050f',
            border: `1px solid ${cameraOn ? 'rgba(167,139,250,0.35)' : 'rgba(139,92,246,0.15)'}`,
            aspectRatio: '16/9',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'border-color 0.3s'
          }}>

            {/* Video — always in DOM, visibility controlled by opacity */}
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              style={{
                position: 'absolute', inset: 0,
                width: '100%', height: '100%',
                objectFit: 'cover',
                transform: 'scaleX(-1)',
                opacity: cameraOn ? 1 : 0,
                transition: 'opacity 0.3s'
              }}
            />

            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {/* Idle placeholder */}
            {!cameraOn && (
              <div style={{ textAlign: 'center', padding: '40px', zIndex: 1 }}>
                <div style={{ fontSize: '5rem', marginBottom: '16px', opacity: 0.15 }}>📷</div>
                <div style={{ color: '#4a3f6b', fontSize: '0.9rem' }}>
                  {cameraError || 'Click "Start Detection" to begin'}
                </div>
              </div>
            )}

            {/* Status badge */}
            <div style={{
              position: 'absolute', top: '14px', left: '14px', zIndex: 10,
              display: 'flex', alignItems: 'center', gap: '7px',
              padding: '6px 14px',
              background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(10px)',
              border: `1px solid ${badge.dot}40`, borderRadius: '20px'
            }}>
              <div style={{
                width: '7px', height: '7px', borderRadius: '50%',
                background: badge.dot,
                boxShadow: badge.pulse ? `0 0 8px ${badge.dot}` : 'none',
                animation: badge.pulse ? 'blink 1.5s infinite' : 'none'
              }} />
              <span style={{ fontSize: '0.78rem', color: badge.color, fontWeight: 600 }}>
                {badge.text}
              </span>
            </div>

            {/* Detected sign overlay */}
            {currentSign && cameraOn && (
              <div style={{
                position: 'absolute', bottom: '16px', left: '50%',
                transform: 'translateX(-50%)', zIndex: 10,
                padding: '12px 32px',
                background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)',
                border: '1px solid rgba(167,139,250,0.5)',
                borderRadius: '14px', textAlign: 'center',
                boxShadow: '0 0 30px rgba(167,139,250,0.2)'
              }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#a78bfa', marginBottom: '2px' }}>
                  {currentSign}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#7c6d9c' }}>{confidence}% confidence</div>
              </div>
            )}

            {/* Corner brackets when camera is on */}
            {cameraOn && (
              <>
                <div style={{ position: 'absolute', top: '14px', right: '14px', width: '22px', height: '22px', borderTop: '2px solid #a78bfa', borderRight: '2px solid #a78bfa', borderRadius: '0 4px 0 0', zIndex: 10 }} />
                <div style={{ position: 'absolute', bottom: '14px', left: '14px', width: '22px', height: '22px', borderBottom: '2px solid #a78bfa', borderLeft: '2px solid #a78bfa', borderRadius: '0 0 0 4px', zIndex: 10 }} />
                <div style={{ position: 'absolute', top: '14px', left: '14px', width: '22px', height: '22px', borderTop: '2px solid #a78bfa', borderLeft: '2px solid #a78bfa', borderRadius: '4px 0 0 0', zIndex: 10 }} />
                <div style={{ position: 'absolute', bottom: '14px', right: '14px', width: '22px', height: '22px', borderBottom: '2px solid #a78bfa', borderRight: '2px solid #a78bfa', borderRadius: '0 0 4px 0', zIndex: 10 }} />
              </>
            )}
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '14px' }}>
            <button onClick={cameraOn ? handleStop : handleStart} style={{
              flex: 1, padding: '13px',
              background: cameraOn
                ? 'rgba(239,68,68,0.1)'
                : 'linear-gradient(135deg, #7c3aed, #2563eb)',
              border: cameraOn ? '1px solid rgba(239,68,68,0.3)' : 'none',
              borderRadius: '12px',
              color: cameraOn ? '#f87171' : 'white',
              cursor: 'pointer', fontSize: '0.92rem', fontWeight: 700,
              boxShadow: cameraOn ? 'none' : '0 0 25px rgba(124,58,237,0.4)'
            }}>
              {cameraOn ? '⏹ Stop' : '▶ Start Detection'}
            </button>

            <button onClick={() => setVoiceEnabled(!voiceEnabled)} style={{
              padding: '13px 18px',
              background: voiceEnabled ? 'rgba(52,211,153,0.1)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${voiceEnabled ? 'rgba(52,211,153,0.3)' : 'rgba(139,92,246,0.2)'}`,
              borderRadius: '12px',
              color: voiceEnabled ? '#34d399' : '#7c6d9c',
              cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600
            }}>
              {voiceEnabled ? '🔊 Voice On' : '🔇 Voice Off'}
            </button>

            <button onClick={() => { setTranscript([]); setCurrentSign(''); }} style={{
              padding: '13px 18px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(139,92,246,0.2)',
              borderRadius: '12px', color: '#9d8ec0',
              cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600
            }}>
              🗑 Clear
            </button>
          </div>

          {/* Warnings */}
          {cameraError && (
            <div style={{ marginTop: '12px', padding: '12px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', color: '#f87171', fontSize: '0.85rem' }}>
              ⚠️ {cameraError}
            </div>
          )}
          {cameraOn && wsStatus === 'error' && (
            <div style={{ marginTop: '12px', padding: '12px 16px', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '10px', color: '#fbbf24', fontSize: '0.85rem' }}>
              ⚠️ Camera is working! AI detection needs the FastAPI backend running at <strong>localhost:8000</strong>
            </div>
          )}
        </div>

        {/* RIGHT — Output */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {/* Current sign */}
          <div style={{
            padding: '20px', textAlign: 'center',
            background: 'rgba(167,139,250,0.05)',
            border: '1px solid rgba(167,139,250,0.2)',
            borderRadius: '16px'
          }}>
            <div style={{ fontSize: '0.72rem', color: '#7c6d9c', letterSpacing: '1px', marginBottom: '10px' }}>CURRENT SIGN</div>
            <div style={{
              fontSize: '2.5rem', fontWeight: 900,
              color: currentSign ? '#a78bfa' : '#1e1635',
              marginBottom: '8px', minHeight: '56px',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {currentSign || '—'}
            </div>
            {currentSign && (
              <div style={{ display: 'inline-block', padding: '3px 12px', background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.3)', borderRadius: '20px', fontSize: '0.78rem', color: '#c4b5fd' }}>
                {confidence}% match
              </div>
            )}
          </div>

          {/* Transcript */}
          <div style={{
            flex: 1, padding: '16px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(139,92,246,0.12)',
            borderRadius: '16px'
          }}>
            <div style={{ fontSize: '0.72rem', color: '#7c6d9c', letterSpacing: '1px', marginBottom: '12px' }}>TRANSCRIPT</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
              {transcript.length === 0 ? (
                <div style={{ color: '#4a3f6b', fontSize: '0.82rem', textAlign: 'center', padding: '16px' }}>
                  Signs will appear here...
                </div>
              ) : transcript.map((item, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '7px 10px',
                  background: i === 0 ? 'rgba(167,139,250,0.1)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${i === 0 ? 'rgba(167,139,250,0.25)' : 'rgba(139,92,246,0.08)'}`,
                  borderRadius: '8px'
                }}>
                  <span style={{ fontWeight: 700, color: '#c4b5fd', fontSize: '0.88rem' }}>{item.sign}</span>
                  <span style={{ fontSize: '0.7rem', color: '#4a3f6b' }}>{item.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Full text */}
          <div style={{
            padding: '14px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(139,92,246,0.12)',
            borderRadius: '14px'
          }}>
            <div style={{ fontSize: '0.72rem', color: '#7c6d9c', letterSpacing: '1px', marginBottom: '8px' }}>FULL TEXT</div>
            <div style={{ fontSize: '0.92rem', lineHeight: 1.7, color: transcript.length ? '#e2d9f3' : '#4a3f6b' }}>
              {transcript.length
                ? [...transcript].reverse().map(t => t.sign).join(' ')
                : 'Translated text will appear here...'}
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
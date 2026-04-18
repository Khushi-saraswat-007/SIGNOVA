import { useState, useRef, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import toast from 'react-hot-toast'
import { getSettings, speakText } from '../utils/settings'
const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const WS  = import.meta.env.VITE_WS_URL  || 'ws://localhost:8000'
export default function LiveDetection() {
  const { user }    = useAuth()
  const videoRef    = useRef(null)
  const canvasRef   = useRef(null)
  const wsRef       = useRef(null)
  const intervalRef = useRef(null)
  const startTimeRef= useRef(null)

  const [cameraOn,     setCameraOn]     = useState(false)
  const [detecting,    setDetecting]    = useState(false)
  const [currentSign,  setCurrentSign]  = useState('')
  const [confidence,   setConfidence]   = useState(0)
  const [transcript,   setTranscript]   = useState([])
  const [voiceEnabled, setVoiceEnabled] = useState(() => getSettings().voiceOutput)
  const [cameraError,  setCameraError]  = useState('')
  const [wsStatus,     setWsStatus]     = useState('idle')
  const [mode,         setMode]         = useState('sign')
  const [frameCount,   setFrameCount]   = useState(0)
  const [saving,       setSaving]       = useState(false)

  useEffect(() => {
    const s = getSettings()
    setVoiceEnabled(s.voiceOutput)
  }, [])

  const speak = useCallback((text) => {
    if (!voiceEnabled) return
    speakText(text)
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
      setCameraError(''); setCameraOn(true); return true
    } catch {
      setCameraError('Camera access denied. Please allow camera permission.')
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
    const video = videoRef.current, canvas = canvasRef.current
    if (!video || !canvas || !video.videoWidth) return null
    canvas.width = video.videoWidth; canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    return canvas.toDataURL('image/jpeg', 0.8)
  }

  const sendModeSwitch = (newMode) => {
    if (wsRef.current?.readyState === WebSocket.OPEN)
      wsRef.current.send(JSON.stringify({ type: 'mode', mode: newMode }))
  }

  const handleModeSwitch = (newMode) => {
    if (newMode === mode) return
    setMode(newMode); setCurrentSign(''); setConfidence(0)
    sendModeSwitch(newMode)
  }

  // ── Auto-save session to backend ──────────────────────────────
  const saveSession = async (transcriptData, currentMode) => {
    if (!transcriptData || transcriptData.length === 0) return
    if (!user?.id) return
    setSaving(true)
    try {
      const token       = localStorage.getItem('token')
      const signs       = [...transcriptData].reverse().map(t => t.sign).join(',')
      const sessionType = currentMode === 'sentence' ? 'emergency' : 'detection'
      const sessionName = currentMode === 'sentence' ? 'Emergency Mode Session' : 'Live Detection Session'
      const durationMs  = startTimeRef.current ? Date.now() - startTimeRef.current : 0
      const durationMin = Math.max(1, Math.ceil(durationMs / 60000))

      await axios.post(
        `${API}/api/history/save?user_id=${user.id}`,
        {
          session_name:   sessionName,
          detected_signs: signs,
          session_type:   sessionType,
          duration:       `${durationMin} mins`,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success(`Session saved! ${transcriptData.length} signs recorded.`)
    } catch (err) {
      console.error('Failed to save session:', err)
      toast.error('Could not save session.')
    } finally {
      setSaving(false)
    }
  }

  const connectWebSocket = (initialMode) => {
    try {
      const s = getSettings()
      const confidenceThreshold = s.confidenceThreshold / 100
      const detectionSpeed      = s.detectionSpeed

      wsRef.current = new WebSocket(`${WS}/ws/detect`)
      wsRef.current.onopen = () => {
        setWsStatus('connected'); setDetecting(true)
        startTimeRef.current = Date.now()
        wsRef.current.send(JSON.stringify({ type: 'mode', mode: initialMode }))
        intervalRef.current = setInterval(() => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            const frame = captureFrame()
            if (frame) { wsRef.current.send(frame); setFrameCount(p => p + 1) }
          }
        }, detectionSpeed)
      }
      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (data.type === 'mode_confirmed') return
        if (data.sign && data.confidence > 0) {
          setCurrentSign(data.sign)
          setConfidence(Math.round(data.confidence * 100))
          if (data.is_new && data.confidence >= confidenceThreshold) {
            setTranscript(prev => {
              const updated = [
                { sign: data.sign, confidence: Math.round(data.confidence * 100), time: new Date().toLocaleTimeString(), mode: data.mode || initialMode },
                ...prev.slice(0, 19)
              ]
              return updated
            })
            speak(data.sign)
          }
        } else if (!data.sign) {
          setCurrentSign(''); setConfidence(0)
        }
      }
      wsRef.current.onerror   = () => setWsStatus('error')
      wsRef.current.onclose   = () => { setWsStatus('idle'); setDetecting(false) }
    } catch { setWsStatus('error') }
  }

  const handleStart = async () => {
    const ok = await startCamera()
    if (!ok) return
    setTranscript([])
    setWsStatus('connecting'); setFrameCount(0)
    connectWebSocket(mode)
  }

  const handleStop = async () => {
    clearInterval(intervalRef.current)
    wsRef.current?.close()
    stopCamera()
    setDetecting(false); setCurrentSign(''); setConfidence(0); setWsStatus('idle')

    // Auto-save — use functional update to get latest transcript
    setTranscript(prev => {
      saveSession(prev, mode)
      return prev
    })
  }

  useEffect(() => () => {
    clearInterval(intervalRef.current)
    wsRef.current?.close()
    stopCamera()
  }, [])

  const badge = !cameraOn
    ? { text: 'Camera Off',      color: '#94a3b8', dot: '#94a3b8', pulse: false }
    : wsStatus === 'connecting'
      ? { text: 'Connecting...', color: '#f59e0b', dot: '#f59e0b', pulse: true  }
      : wsStatus === 'connected'
        ? { text: 'AI Active',   color: '#10b981', dot: '#10b981', pulse: true  }
        : wsStatus === 'error'
          ? { text: 'No Backend',color: '#f59e0b', dot: '#f59e0b', pulse: false }
          : { text: 'Camera On', color: '#0066ff', dot: '#0066ff', pulse: false }

  const isEmergency  = mode === 'sentence'
  const accentColor  = isEmergency ? '#ef4444' : '#0066ff'
  const accentBg     = isEmergency ? 'rgba(239,68,68,0.06)'  : 'rgba(0,102,255,0.06)'
  const accentBorder = isEmergency ? 'rgba(239,68,68,0.2)'   : 'rgba(0,102,255,0.2)'
  const s            = getSettings()

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',system-ui,sans-serif", color: '#0a1628' }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0a1628', letterSpacing: '-0.5px', marginBottom: '4px' }}>
            Live Sign Detection
          </h1>
          <p style={{ color: '#64748b', fontSize: '13px' }}>
            Point your camera at your hands to detect sign language in real time
          </p>
        </div>
        <div style={{ display: 'flex', gap: '4px', padding: '4px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
          <button onClick={() => handleModeSwitch('sign')} style={{ padding: '8px 18px', borderRadius: '9px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '13px', transition: 'all 0.2s', background: !isEmergency ? '#0066ff' : 'transparent', color: !isEmergency ? 'white' : '#94a3b8' }}>🤟 Signs</button>
          <button onClick={() => handleModeSwitch('sentence')} style={{ padding: '8px 18px', borderRadius: '9px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '13px', transition: 'all 0.2s', background: isEmergency ? '#ef4444' : 'transparent', color: isEmergency ? 'white' : '#94a3b8' }}>🆘 Emergency</button>
        </div>
      </div>

      {/* Mode banner */}
      <div style={{ marginBottom: '16px', padding: '10px 16px', background: accentBg, border: `1px solid ${accentBorder}`, borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '16px' }}>{isEmergency ? '🆘' : '🤟'}</span>
        <div style={{ flex: 1 }}>
          <span style={{ fontWeight: 700, color: accentColor, fontSize: '13px' }}>
            {isEmergency ? 'Emergency Sentence Mode' : 'Sign Language Mode'}
          </span>
          <span style={{ color: '#94a3b8', fontSize: '12px', marginLeft: '8px' }}>
            {isEmergency ? 'Detecting: Call Ambulance, I Need Help, Call Police...' : 'Detecting: Good, Bad, Yes, No, Stop, Help, I Love You...'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <div style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0' }}>{s.detectionSpeed}ms</div>
          <div style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0' }}>{s.confidenceThreshold}% thresh</div>
        </div>
        {detecting && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: accentColor, animation: 'pulse 1.5s infinite' }} />
            <span style={{ fontSize: '11px', color: accentColor, fontWeight: 700 }}>LIVE</span>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px' }}>

        {/* ── LEFT — Camera ──────────────────────────────────────── */}
        <div>
          <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', background: '#0a1628', aspectRatio: '16/9', border: `2px solid ${cameraOn ? accentColor + '50' : '#e8edf2'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'border-color 0.3s' }}>
            <video ref={videoRef} autoPlay muted playsInline style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)', opacity: cameraOn ? 1 : 0, transition: 'opacity 0.3s' }} />
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {!cameraOn && (
              <div style={{ textAlign: 'center', zIndex: 1 }}>
                <div style={{ fontSize: '56px', marginBottom: '12px', opacity: 0.15 }}>{isEmergency ? '🆘' : '📷'}</div>
                <div style={{ color: '#475569', fontSize: '13px' }}>{cameraError || 'Click Start to begin'}</div>
              </div>
            )}

            {/* Status badge */}
            <div style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 10, display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 12px', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', border: `1px solid ${badge.dot}40`, borderRadius: '20px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: badge.dot, animation: badge.pulse ? 'pulse 1.5s infinite' : 'none' }} />
              <span style={{ fontSize: '11px', color: badge.color, fontWeight: 700 }}>{badge.text}</span>
            </div>

            {/* Mode badge */}
            {cameraOn && (
              <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 10, padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, color: 'white', background: isEmergency ? 'rgba(239,68,68,0.85)' : 'rgba(0,102,255,0.85)', backdropFilter: 'blur(10px)' }}>
                {isEmergency ? '🆘 Emergency' : '🤟 Signs'}
              </div>
            )}

            {/* Sign overlay */}
            {currentSign && cameraOn && (
              <div style={{ position: 'absolute', bottom: '14px', left: '50%', transform: 'translateX(-50%)', zIndex: 10, padding: '10px 28px', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', border: `1px solid ${accentColor}50`, borderRadius: '12px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                <div style={{ fontSize: isEmergency ? '16px' : '22px', fontWeight: 900, color: accentColor, marginBottom: '2px' }}>{currentSign}</div>
                {s.showConfidence && <div style={{ fontSize: '11px', color: '#94a3b8' }}>{confidence}% confidence</div>}
              </div>
            )}

            {/* Corner brackets */}
            {cameraOn && ['tl','tr','bl','br'].map(pos => (
              <div key={pos} style={{ position: 'absolute', zIndex: 10, width: '20px', height: '20px',
                ...(pos==='tl' && { top:'12px',    left:'12px',  borderTop:`2px solid ${accentColor}`,    borderLeft:`2px solid ${accentColor}`,   borderRadius:'3px 0 0 0' }),
                ...(pos==='tr' && { top:'12px',    right:'12px', borderTop:`2px solid ${accentColor}`,    borderRight:`2px solid ${accentColor}`,  borderRadius:'0 3px 0 0' }),
                ...(pos==='bl' && { bottom:'12px', left:'12px',  borderBottom:`2px solid ${accentColor}`, borderLeft:`2px solid ${accentColor}`,   borderRadius:'0 0 0 3px' }),
                ...(pos==='br' && { bottom:'12px', right:'12px', borderBottom:`2px solid ${accentColor}`, borderRight:`2px solid ${accentColor}`,  borderRadius:'0 0 3px 0' }),
              }} />
            ))}
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
            <button onClick={cameraOn ? handleStop : handleStart} disabled={saving} style={{ flex: 1, padding: '12px', background: cameraOn ? 'rgba(239,68,68,0.06)' : isEmergency ? '#ef4444' : '#0066ff', border: cameraOn ? '1.5px solid rgba(239,68,68,0.25)' : 'none', borderRadius: '10px', color: cameraOn ? '#ef4444' : 'white', cursor: saving ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: 700, transition: 'all 0.15s', opacity: saving ? 0.7 : 1 }}>
              {saving ? '💾 Saving...' : cameraOn ? '⏹ Stop & Save' : `▶ Start ${isEmergency ? 'Emergency' : 'Detection'}`}
            </button>
            <button onClick={() => setVoiceEnabled(!voiceEnabled)} style={{ padding: '12px 16px', background: voiceEnabled ? 'rgba(16,185,129,0.06)' : '#f8fafc', border: `1.5px solid ${voiceEnabled ? 'rgba(16,185,129,0.25)' : '#e2e8f0'}`, borderRadius: '10px', color: voiceEnabled ? '#10b981' : '#94a3b8', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
              {voiceEnabled ? '🔊 Voice' : '🔇 Muted'}
            </button>
            <button onClick={() => { setTranscript([]); setCurrentSign(''); setConfidence(0) }} style={{ padding: '12px 16px', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '10px', color: '#64748b', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
              🗑 Clear
            </button>
          </div>

          {cameraError && <div style={{ marginTop: '10px', padding: '10px 14px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', color: '#ef4444', fontSize: '13px' }}>⚠️ {cameraError}</div>}
          {cameraOn && wsStatus === 'error' && <div style={{ marginTop: '10px', padding: '10px 14px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '8px', color: '#f59e0b', fontSize: '13px' }}>⚠️ Backend not running! Start FastAPI at <strong>localhost:8000</strong></div>}
          {isEmergency && <div style={{ marginTop: '10px', padding: '10px 14px', background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '8px', fontSize: '12px', color: '#f87171' }}>🆘 <strong>Emergency Mode:</strong> Perform full gesture as one flowing motion. Hold ~1 second.</div>}

          {/* Auto-save notice */}
          <div style={{ marginTop: '10px', padding: '8px 14px', background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: '8px', fontSize: '12px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
            💾 Sessions auto-save to History when you click Stop
          </div>

          {detecting && (
            <div style={{ marginTop: '10px', padding: '8px 14px', background: '#f8fafc', border: '1px solid #f0f4f8', borderRadius: '8px', display: 'flex', gap: '16px' }}>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>Frames: <strong style={{ color: '#0a1628' }}>{frameCount}</strong></span>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>Detected: <strong style={{ color: accentColor }}>{transcript.length}</strong></span>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>Speed: <strong style={{ color: '#0a1628' }}>{s.detectionSpeed}ms</strong></span>
            </div>
          )}
        </div>

        {/* ── RIGHT — Output ─────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Current sign */}
          <div style={{ background: '#ffffff', border: `1.5px solid ${currentSign ? accentColor + '40' : '#e8edf2'}`, borderRadius: '14px', padding: '20px', textAlign: 'center', transition: 'border-color 0.3s' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', letterSpacing: '1.5px', marginBottom: '12px' }}>
              {isEmergency ? 'DETECTED SENTENCE' : 'CURRENT SIGN'}
            </div>
            <div style={{ fontSize: isEmergency ? '18px' : '32px', fontWeight: 900, color: currentSign ? accentColor : '#e2e8f0', minHeight: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', lineHeight: 1.2, marginBottom: '10px' }}>
              {currentSign || '—'}
            </div>
            {currentSign && s.showConfidence ? (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, background: accentBg, color: accentColor, border: `1px solid ${accentBorder}` }}>
                <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: accentColor }} />
                {confidence}% match
              </div>
            ) : (
              !currentSign && <div style={{ fontSize: '12px', color: '#94a3b8' }}>Waiting for sign...</div>
            )}
          </div>

          {/* Active settings */}
          <div style={{ background: '#ffffff', border: '1px solid #e8edf2', borderRadius: '14px', padding: '14px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#334155', letterSpacing: '1px', marginBottom: '10px' }}>ACTIVE SETTINGS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                { label: 'Voice',     value: s.voiceOutput ? `${s.voiceGender} · ${s.voiceSpeed}x` : 'Off', color: s.voiceOutput ? '#10b981' : '#94a3b8' },
                { label: 'Threshold',value: `${s.confidenceThreshold}%`, color: '#0066ff' },
                { label: 'Speed',    value: `${s.detectionSpeed}ms`,     color: '#8b5cf6' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', background: '#f8fafc', borderRadius: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>{item.label}</span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: item.color }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Transcript */}
          <div style={{ background: '#ffffff', border: '1px solid #e8edf2', borderRadius: '14px', padding: '16px', flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#334155', letterSpacing: '1px' }}>TRANSCRIPT</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>{transcript.length} signs</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
              {transcript.length === 0 ? (
                <div style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', padding: '16px' }}>
                  {isEmergency ? 'Emergency sentences appear here...' : 'Signs will appear here...'}
                </div>
              ) : transcript.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 10px', background: i === 0 ? accentBg : '#f8fafc', border: `1px solid ${i === 0 ? accentBorder : '#f0f4f8'}`, borderRadius: '8px', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '12px' }}>{item.mode === 'sentence' ? '🆘' : '🤟'}</span>
                    <span style={{ fontWeight: 700, fontSize: '13px', color: item.mode === 'sentence' ? '#ef4444' : '#0066ff' }}>{item.sign}</span>
                  </div>
                  <span style={{ fontSize: '10px', color: '#94a3b8', flexShrink: 0 }}>{item.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Full text */}
          <div style={{ background: '#ffffff', border: '1px solid #e8edf2', borderRadius: '14px', padding: '14px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#334155', letterSpacing: '1px', marginBottom: '8px' }}>FULL TEXT</div>
            <div style={{ fontSize: '14px', lineHeight: 1.7, color: transcript.length ? '#0a1628' : '#94a3b8' }}>
              {transcript.length ? [...transcript].reverse().map(t => t.sign).join(' ') : 'Translated text will appear here...'}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(1.3)}}
        *{box-sizing:border-box;}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-thumb{background:#e2e8f0;border-radius:2px;}
      `}</style>
    </div>
  )
}
import { useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState, useCallback } from 'react'

export default function LandingPage() {
  const navigate    = useNavigate()
  const canvasRef   = useRef(null)
  const animRef     = useRef(null)
  const [scrolled,  setScrolled]  = useState(false)
  const [dark,      setDark]      = useState(true)
  const [count,     setCount]     = useState({ signs: 0, users: 0, acc: 0 })
  const [visible,   setVisible]   = useState({})
  const [menuOpen,  setMenuOpen]  = useState(false)
  const [isMobile,  setIsMobile]  = useState(false)
  const [isTablet,  setIsTablet]  = useState(false)
  const sectionRefs = useRef({})

  // Responsive breakpoints
  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 640)
      setIsTablet(window.innerWidth < 1024)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const theme = {
    bg:        dark ? '#06091a' : '#f8faff',
    bg2:       dark ? '#0d1035' : '#ffffff',
    bg3:       dark ? '#111442' : '#f0f5ff',
    text:      dark ? '#f1f5f9' : '#0a1628',
    textMuted: dark ? '#64748b' : '#64748b',
    border:    dark ? '#1e2448' : '#e2e8f0',
    navBg:     dark ? 'rgba(6,9,26,.95)' : 'rgba(248,250,255,.97)',
    card:      dark ? '#0d1035' : '#ffffff',
  }

  useEffect(() => {
    const saved = localStorage.getItem('signova_theme')
    if (saved === 'light') setDark(false)
    else setDark(true)
  }, [])

  const handleToggle = () => {
    if (dark) { setDark(false); localStorage.setItem('signova_theme', 'light') }
    else { setDark(true); localStorage.setItem('signova_theme', 'dark') }
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const targets = { signs: 19, users: 500, acc: 94 }
    const dur = 2000, steps = 60
    let step = 0
    const t = setInterval(() => {
      step++
      const ease = 1 - Math.pow(1 - step / steps, 3)
      setCount({
        signs: Math.round(targets.signs * ease),
        users: Math.round(targets.users * ease),
        acc:   Math.round(targets.acc   * ease),
      })
      if (step >= steps) clearInterval(t)
    }, dur / steps)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) setVisible(v => ({ ...v, [e.target.dataset.key]: true }))
      }),
      { threshold: 0.1 }
    )
    Object.values(sectionRefs.current).forEach(el => el && obs.observe(el))
    return () => obs.disconnect()
  }, [])

  const revealRef = useCallback((key) => (el) => {
    if (el) { el.dataset.key = key; sectionRefs.current[key] = el }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let pts = [], w, h

    const resize = () => {
      w = canvas.width  = canvas.offsetWidth
      h = canvas.height = canvas.offsetHeight
      pts = Array.from({ length: isMobile ? 30 : 55 }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - .5) * .45, vy: (Math.random() - .5) * .45,
      }))
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      const col = dark ? '99,102,241' : '0,102,255'
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0 || p.x > w) p.vx *= -1
        if (p.y < 0 || p.y > h) p.vy *= -1
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.8, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${col},.5)`; ctx.fill()
      })
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < 110) {
            ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y)
            ctx.strokeStyle = `rgba(${col},${.18 * (1 - d / 110)})`
            ctx.lineWidth = .6; ctx.stroke()
          }
        }
      }
      animRef.current = requestAnimationFrame(draw)
    }

    resize(); draw()
    window.addEventListener('resize', resize)
    return () => { window.removeEventListener('resize', resize); if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [dark, isMobile])

  const features = [
    { icon: '🎥', title: 'Real-time Detection',   desc: 'MediaPipe + Random Forest detects signs with ~50ms latency using just your webcam.', color: '#6366f1' },
    { icon: '🔊', title: 'Voice Output',           desc: 'Detected signs are instantly spoken aloud using browser speech synthesis API.',       color: '#8b5cf6' },
    { icon: '🆘', title: 'Emergency Sentences',    desc: 'LSTM neural network recognizes full emergency phrases like "Call Ambulance".',         color: '#ef4444' },
    { icon: '📚', title: 'Learn Sign Language',    desc: 'Interactive sign cards with AI-powered quiz and instant gesture verification.',        color: '#10b981' },
    { icon: '💬', title: 'Two-way Conversation',   desc: 'Deaf users sign, hearing users speak — full two-way bridge in one interface.',        color: '#f59e0b' },
    { icon: '📊', title: 'Session Analytics',      desc: 'Track detection history, confidence trends, and your most used signs over time.',     color: '#06b6d4' },
  ]

  const steps = [
    { n: '01', icon: '📷', title: 'Open Your Camera',    desc: 'Allow camera access — Signova uses your webcam only, no video is stored.' },
    { n: '02', icon: '🤟', title: 'Perform a Sign',       desc: 'Hold your hand clearly in frame. AI detects in under 50ms.' },
    { n: '03', icon: '🔊', title: 'Hear the Translation', desc: 'Sign converts to text and speech instantly — no typing needed.' },
  ]

  const techPills = ['MediaPipe', 'PyTorch LSTM', 'Random Forest', 'FastAPI', 'PostgreSQL', 'Docker', 'WebSocket', 'React + Vite']

  const toggleBtn = (
    <button onClick={handleToggle} style={{
      width: '48px', height: '26px', borderRadius: '13px',
      background: dark ? '#6366f1' : '#cbd5e1',
      border: 'none', cursor: 'pointer',
      position: 'relative', transition: 'background .3s',
      flexShrink: 0, zIndex: 200,
    }}>
      <div style={{
        position: 'absolute', top: '3px', left: dark ? '24px' : '3px',
        width: '20px', height: '20px', borderRadius: '50%',
        background: '#fff', transition: 'left .3s',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '11px', pointerEvents: 'none',
      }}>{dark ? '🌙' : '☀️'}</div>
    </button>
  )

  return (
    <div style={{
      minHeight: '100vh', background: theme.bg, color: theme.text,
      fontFamily: "'DM Sans','Segoe UI',system-ui,sans-serif",
      overflowX: 'hidden', transition: 'background .4s, color .4s',
    }}>

      {/* ── TICKER TAPE ─────────────────────────────────────────── */}
      <div style={{
        background: dark ? '#0d1035' : '#6366f1',
        borderBottom: `1px solid ${dark ? '#1e2448' : '#4f46e5'}`,
        overflow: 'hidden', padding: '7px 0',
      }}>
        <div style={{ display: 'flex', animation: 'ticker 25s linear infinite', width: 'max-content' }}>
          {[...techPills, ...techPills, ...techPills].map((t, i) => (
            <span key={i} style={{
              whiteSpace: 'nowrap', color: dark ? '#6366f1' : '#fff',
              fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', padding: '0 28px',
            }}>{t} &nbsp;·</span>
          ))}
        </div>
      </div>

      {/* ── NAVBAR ──────────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: '28px', left: 0, right: 0, zIndex: 100,
        background: scrolled || menuOpen ? theme.navBg : 'transparent',
        backdropFilter: scrolled || menuOpen ? 'blur(20px)' : 'none',
        borderBottom: scrolled || menuOpen ? `1px solid ${theme.border}` : '1px solid transparent',
        padding: isMobile ? '0 20px' : '0 48px', height: '64px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        transition: 'all .3s', boxSizing: 'border-box',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', boxShadow: '0 0 16px rgba(99,102,241,.4)',
          }}>🤟</div>
          <div>
            <div style={{ fontSize: isMobile ? '15px' : '17px', fontWeight: 800, color: theme.text, letterSpacing: '-.3px' }}>Signova</div>
            {!isMobile && <div style={{ fontSize: '9px', color: '#6366f1', letterSpacing: '2px', fontWeight: 700 }}>AI SIGN LANGUAGE</div>}
          </div>
        </div>

        {/* Desktop nav */}
        {!isMobile && (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {toggleBtn}
            <button onClick={() => navigate('/login')} style={{
              padding: '8px 20px', background: 'transparent',
              color: theme.textMuted, border: `1px solid ${theme.border}`,
              borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 500, transition: 'all .15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.color = '#6366f1' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.textMuted }}
            >Sign In</button>
            <button onClick={() => navigate('/signup')} style={{
              padding: '8px 20px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer',
              fontSize: '13px', fontWeight: 700, transition: 'all .15s',
              boxShadow: '0 4px 16px rgba(99,102,241,.35)',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
            >Get Started Free →</button>
          </div>
        )}

        {/* Mobile nav */}
        {isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {toggleBtn}
            <button onClick={() => setMenuOpen(!menuOpen)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: theme.text, fontSize: '22px', zIndex: 200,
            }}>
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        )}
      </nav>

      {/* Mobile Menu */}
      {isMobile && menuOpen && (
        <div style={{
          position: 'fixed', top: '92px', left: 0, right: 0, zIndex: 99,
          background: theme.navBg, backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${theme.border}`,
          padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px',
        }}>
          <button onClick={() => { navigate('/login'); setMenuOpen(false) }} style={{
            padding: '12px', background: 'transparent',
            color: theme.textMuted, border: `1px solid ${theme.border}`,
            borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 500,
          }}>Sign In</button>
          <button onClick={() => { navigate('/signup'); setMenuOpen(false) }} style={{
            padding: '12px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer',
            fontSize: '14px', fontWeight: 700,
          }}>Get Started Free →</button>
        </div>
      )}

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        position: 'relative', overflow: 'hidden',
        padding: isMobile ? '110px 20px 60px' : isTablet ? '110px 32px 80px' : '120px 48px 80px',
        boxSizing: 'border-box',
      }}>
        <canvas ref={canvasRef} style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: .5,
        }} />
        <div style={{
          position: 'absolute', top: '-80px', right: '-80px', width: '500px', height: '500px', borderRadius: '50%',
          background: `radial-gradient(circle, rgba(99,102,241,${dark ? '.12' : '.06'}) 0%, transparent 70%)`,
          pointerEvents: 'none', animation: 'orbFloat 10s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '-60px', left: '-60px', width: '400px', height: '400px', borderRadius: '50%',
          background: `radial-gradient(circle, rgba(139,92,246,${dark ? '.1' : '.05'}) 0%, transparent 70%)`,
          pointerEvents: 'none', animation: 'orbFloat 13s ease-in-out infinite reverse',
        }} />

        <div style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isTablet ? '1fr' : '1fr 1fr',
            gap: isTablet ? '40px' : '60px',
            alignItems: 'center',
          }}>

            {/* Left */}
            <div style={{ animation: 'slideInLeft .8s ease forwards', textAlign: isTablet ? 'center' : 'left' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: dark ? 'rgba(99,102,241,.1)' : 'rgba(99,102,241,.08)',
                border: '1px solid rgba(99,102,241,.25)',
                color: '#818cf8', padding: '6px 16px', borderRadius: '20px',
                fontSize: '11px', fontWeight: 700, letterSpacing: '1px', marginBottom: '24px',
              }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#6366f1', animation: 'blink 1.5s infinite' }} />
                AI-POWERED · REAL-TIME · FREE
              </div>

              <h1 style={{
                fontSize: isMobile ? '2.4rem' : isTablet ? '3rem' : 'clamp(2.6rem,4.5vw,3.8rem)',
                fontWeight: 900, lineHeight: 1.06, letterSpacing: '-2px', color: theme.text, marginBottom: '20px',
              }}>
                Sign Language<br />
                <span style={{
                  background: 'linear-gradient(135deg,#6366f1,#a78bfa,#06b6d4)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>Understood.</span>
                <br />Instantly.
              </h1>

              <p style={{
                fontSize: '15px', color: theme.textMuted, lineHeight: 1.8, marginBottom: '32px',
                maxWidth: isTablet ? '100%' : '440px',
                margin: isTablet ? '0 auto 32px' : '0 0 32px',
              }}>
                Signova uses computer vision and machine learning to detect hand signs through your camera and translate them to text and voice — in real time, no special hardware needed.
              </p>

              <div style={{
                display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '36px',
                justifyContent: isTablet ? 'center' : 'flex-start',
              }}>
                <button onClick={() => navigate('/signup')} style={{
                  padding: '13px 28px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                  color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer',
                  fontSize: '14px', fontWeight: 700, transition: 'all .2s',
                  boxShadow: '0 4px 20px rgba(99,102,241,.4)',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
                >Start for Free →</button>
                <button onClick={() => navigate('/login')} style={{
                  padding: '13px 28px',
                  background: dark ? 'rgba(255,255,255,.05)' : 'white',
                  color: theme.textMuted, border: `1px solid ${theme.border}`,
                  borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: 500, transition: 'all .15s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.color = '#6366f1' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.textMuted }}
                >Already have account</button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', justifyContent: isTablet ? 'center' : 'flex-start' }}>
                <div style={{ display: 'flex' }}>
                  {['#6366f1','#8b5cf6','#10b981','#f59e0b'].map((c, i) => (
                    <div key={i} style={{
                      width: '28px', height: '28px', borderRadius: '50%',
                      background: c, border: `2px solid ${theme.bg}`,
                      marginLeft: i === 0 ? 0 : '-8px', fontSize: '11px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: 700, zIndex: 4 - i,
                    }}>{['K','M','R','A'][i]}</div>
                  ))}
                </div>
                <div style={{ fontSize: '13px', color: theme.textMuted }}>
                  <strong style={{ color: theme.text }}>500+</strong> users communicating without barriers
                </div>
              </div>
            </div>

            {/* Right — Hero card */}
            <div style={{ position: 'relative', animation: 'slideInRight .8s ease forwards', maxWidth: isTablet ? '500px' : '100%', margin: isTablet ? '0 auto' : '0' }}>
              <div style={{
                background: dark ? 'rgba(13,16,53,.7)' : 'rgba(255,255,255,.85)',
                border: `1px solid ${dark ? 'rgba(99,102,241,.2)' : 'rgba(99,102,241,.15)'}`,
                borderRadius: '22px', padding: isMobile ? '16px' : '24px',
                backdropFilter: 'blur(20px)',
                boxShadow: dark ? '0 24px 64px rgba(0,0,0,.4)' : '0 24px 64px rgba(0,0,0,.1)',
              }}>
                <div style={{
                  background: '#06091a', borderRadius: '14px', aspectRatio: '16/9', marginBottom: '16px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative', overflow: 'hidden', border: '1px solid rgba(99,102,241,.2)',
                }}>
                  <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: 'linear-gradient(rgba(99,102,241,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,.04) 1px, transparent 1px)',
                    backgroundSize: '28px 28px',
                  }} />
                  <div style={{
                    position: 'absolute', left: 0, right: 0, height: '1.5px',
                    background: 'rgba(99,102,241,.5)', animation: 'scanLine 2.5s linear infinite',
                  }} />
                  <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: .12 }} viewBox="0 0 320 180">
                    <g stroke="#6366f1" strokeWidth="1.2" fill="none">
                      <line x1="160" y1="160" x2="145" y2="110"/><line x1="145" y1="110" x2="138" y2="70"/><line x1="138" y1="70" x2="135" y2="40"/>
                      <line x1="160" y1="160" x2="160" y2="105"/><line x1="160" y1="105" x2="160" y2="62"/><line x1="160" y1="62" x2="160" y2="32"/>
                      <line x1="160" y1="160" x2="175" y2="108"/><line x1="175" y1="108" x2="180" y2="65"/><line x1="180" y1="65" x2="182" y2="36"/>
                      <line x1="160" y1="160" x2="188" y2="114"/><line x1="188" y1="114" x2="194" y2="74"/>
                      <line x1="160" y1="160" x2="132" y2="128"/><line x1="132" y1="128" x2="118" y2="108"/>
                    </g>
                    <g fill="#6366f1">
                      <circle cx="160" cy="160" r="4"/><circle cx="145" cy="110" r="2.5"/><circle cx="138" cy="70" r="2.5"/><circle cx="135" cy="40" r="2.5"/>
                      <circle cx="160" cy="105" r="2.5"/><circle cx="160" cy="62" r="2.5"/><circle cx="160" cy="32" r="2.5"/>
                      <circle cx="175" cy="108" r="2.5"/><circle cx="180" cy="65" r="2.5"/><circle cx="182" cy="36" r="2.5"/>
                      <circle cx="188" cy="114" r="2.5"/><circle cx="194" cy="74" r="2.5"/>
                      <circle cx="132" cy="128" r="2.5"/><circle cx="118" cy="108" r="2.5"/>
                    </g>
                  </svg>
                  {['tl','tr','bl','br'].map(p => (
                    <div key={p} style={{
                      position: 'absolute', width: '14px', height: '14px',
                      ...(p==='tl' && { top:'8px', left:'8px', borderTop:'2px solid #6366f1', borderLeft:'2px solid #6366f1', borderRadius:'2px 0 0 0' }),
                      ...(p==='tr' && { top:'8px', right:'8px', borderTop:'2px solid #6366f1', borderRight:'2px solid #6366f1', borderRadius:'0 2px 0 0' }),
                      ...(p==='bl' && { bottom:'8px', left:'8px', borderBottom:'2px solid #6366f1', borderLeft:'2px solid #6366f1', borderRadius:'0 0 0 2px' }),
                      ...(p==='br' && { bottom:'8px', right:'8px', borderBottom:'2px solid #6366f1', borderRight:'2px solid #6366f1', borderRadius:'0 0 2px 0' }),
                    }} />
                  ))}
                  <div style={{
                    position: 'absolute', top: '8px', left: '50%', transform: 'translateX(-50%)',
                    display: 'flex', alignItems: 'center', gap: '5px',
                    background: 'rgba(0,0,0,.7)', padding: '4px 10px', borderRadius: '20px',
                    border: '1px solid rgba(16,185,129,.3)',
                  }}>
                    <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10b981', animation: 'blink 1.5s infinite' }} />
                    <span style={{ fontSize: '10px', color: '#10b981', fontWeight: 700 }}>AI Detecting</span>
                  </div>
                  <div style={{ fontSize: isMobile ? '44px' : '58px', animation: 'handFloat 4s ease-in-out infinite', position: 'relative', zIndex: 2 }}>🤟</div>
                  <div style={{
                    position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)',
                    background: 'rgba(6,9,26,.9)', padding: '7px 18px', borderRadius: '10px', textAlign: 'center',
                    border: '1px solid rgba(99,102,241,.35)', whiteSpace: 'nowrap',
                  }}>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#818cf8' }}>I Love You</div>
                    <div style={{ fontSize: '10px', color: '#475569' }}>97% confidence · 48ms</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px' }}>
                  {[
                    { label: 'Signs', value: count.signs + '+', color: '#6366f1', bg: dark ? 'rgba(99,102,241,.1)' : '#eff6ff' },
                    { label: 'Users', value: count.users + '+', color: '#8b5cf6', bg: dark ? 'rgba(139,92,246,.1)' : '#f5f3ff' },
                    { label: 'Accuracy', value: count.acc + '%', color: '#10b981', bg: dark ? 'rgba(16,185,129,.1)' : '#ecfdf5' },
                  ].map((s, i) => (
                    <div key={i} style={{
                      background: s.bg, borderRadius: '10px', padding: isMobile ? '10px 6px' : '12px',
                      textAlign: 'center', border: `1px solid ${s.color}25`,
                    }}>
                      <div style={{ fontSize: isMobile ? '16px' : '20px', fontWeight: 900, color: s.color }}>{s.value}</div>
                      <div style={{ fontSize: '10px', color: theme.textMuted, marginTop: '2px', fontWeight: 600 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {!isMobile && <>
                <div style={{
                  position: 'absolute', top: '-14px', right: '-14px',
                  background: 'linear-gradient(135deg,#ef4444,#dc2626)',
                  color: 'white', padding: '8px 14px', borderRadius: '20px',
                  fontSize: '11px', fontWeight: 700, boxShadow: '0 4px 20px rgba(239,68,68,.4)',
                  animation: 'badgeFloat 3s ease-in-out infinite',
                }}>🆘 Emergency Mode</div>
                <div style={{
                  position: 'absolute', bottom: '-14px', left: '-14px',
                  background: dark ? '#0d1035' : '#fff',
                  color: '#10b981', padding: '8px 14px', borderRadius: '20px',
                  fontSize: '11px', fontWeight: 700, border: `1px solid ${theme.border}`,
                  boxShadow: dark ? '0 4px 20px rgba(0,0,0,.4)' : '0 4px 20px rgba(0,0,0,.08)',
                  animation: 'badgeFloat 3.5s ease-in-out infinite reverse',
                }}>⚡ ~50ms Detection</div>
              </>}
            </div>
          </div>
        </div>
      </section>

      {/* ── TECH PILLS ──────────────────────────────────────────── */}
      <div ref={revealRef('tech')} style={{
        padding: isMobile ? '32px 20px' : '48px',
        opacity: visible.tech ? 1 : 0,
        transform: visible.tech ? 'translateY(0)' : 'translateY(30px)',
        transition: 'all .7s ease',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '11px', color: theme.textMuted, letterSpacing: '2px', fontWeight: 700 }}>POWERED BY</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
            {[
              { label: 'MediaPipe', color: '#6366f1' }, { label: 'PyTorch LSTM', color: '#ef4444' },
              { label: 'Random Forest', color: '#10b981' }, { label: 'FastAPI', color: '#f59e0b' },
              { label: 'PostgreSQL', color: '#06b6d4' }, { label: 'Docker', color: '#8b5cf6' },
              { label: 'WebSocket', color: '#6366f1' }, { label: 'OpenCV', color: '#10b981' },
              { label: 'React + Vite', color: '#06b6d4' },
            ].map((p, i) => (
              <div key={i} style={{
                padding: '6px 14px',
                background: dark ? `${p.color}15` : `${p.color}10`,
                border: `1px solid ${p.color}30`, borderRadius: '20px',
                fontSize: '12px', color: p.color, fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: '5px',
                transition: 'transform .2s', cursor: 'default',
              }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: p.color, animation: 'blink 2s infinite' }} />
                {p.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FEATURES ─────────────────────────────────────────────── */}
      <section ref={revealRef('features')} style={{
        padding: isMobile ? '60px 20px' : isTablet ? '60px 32px' : '80px 48px',
        background: theme.bg3,
        opacity: visible.features ? 1 : 0,
        transform: visible.features ? 'translateY(0)' : 'translateY(40px)',
        transition: 'all .8s ease',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{
              display: 'inline-block',
              background: dark ? 'rgba(99,102,241,.1)' : 'rgba(99,102,241,.08)',
              border: '1px solid rgba(99,102,241,.2)', color: '#818cf8',
              padding: '5px 16px', borderRadius: '20px',
              fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', marginBottom: '14px',
            }}>FEATURES</div>
            <h2 style={{ fontSize: isMobile ? '1.8rem' : '2.2rem', fontWeight: 900, color: theme.text, letterSpacing: '-1px', marginBottom: '10px' }}>
              Built for real communication
            </h2>
            <p style={{ color: theme.textMuted, fontSize: '14px', maxWidth: '480px', margin: '0 auto' }}>
              Every feature designed with deaf and hard-of-hearing users at the center
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2,1fr)' : 'repeat(3,1fr)',
            gap: '16px',
          }}>
            {features.map((f, i) => (
              <div key={i} style={{
                background: theme.card, border: `1px solid ${theme.border}`,
                borderRadius: '16px', padding: '24px', transition: 'all .25s', cursor: 'default',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.borderColor = f.color + '50'; e.currentTarget.style.boxShadow = `0 12px 40px ${f.color}15` }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.boxShadow = 'none' }}
              >
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px',
                  background: f.color + (dark ? '18' : '12'),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '20px', marginBottom: '12px',
                }}>{f.icon}</div>
                <div style={{ width: '26px', height: '3px', background: f.color, borderRadius: '2px', marginBottom: '10px', opacity: .7 }} />
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: theme.text, marginBottom: '7px' }}>{f.title}</h3>
                <p style={{ fontSize: '13px', color: theme.textMuted, lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
      <section ref={revealRef('steps')} style={{
        padding: isMobile ? '60px 20px' : isTablet ? '60px 32px' : '80px 48px',
        background: theme.bg,
        opacity: visible.steps ? 1 : 0,
        transform: visible.steps ? 'translateY(0)' : 'translateY(40px)',
        transition: 'all .8s ease',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            display: 'inline-block',
            background: dark ? 'rgba(99,102,241,.1)' : 'rgba(99,102,241,.08)',
            border: '1px solid rgba(99,102,241,.2)', color: '#818cf8',
            padding: '5px 16px', borderRadius: '20px',
            fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', marginBottom: '14px',
          }}>HOW IT WORKS</div>
          <h2 style={{ fontSize: isMobile ? '1.8rem' : '2.2rem', fontWeight: 900, color: theme.text, letterSpacing: '-1px', marginBottom: '10px' }}>
            Three steps to communicate
          </h2>
          <p style={{ color: theme.textMuted, marginBottom: '48px', fontSize: '14px' }}>No setup, no hardware, no expertise needed</p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)',
            gap: '16px', position: 'relative',
          }}>
            {!isMobile && <div style={{
              position: 'absolute', top: '36px', left: '22%', right: '22%',
              height: '1px', background: 'linear-gradient(90deg,#6366f1,#06b6d4)', opacity: .25,
            }} />}
            {steps.map((s, i) => (
              <div key={i} style={{
                background: theme.card, border: `1px solid ${theme.border}`,
                borderRadius: '16px', padding: '24px 20px', position: 'relative', transition: 'all .2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f150'; e.currentTarget.style.transform = 'translateY(-4px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                <div style={{
                  width: '48px', height: '48px', borderRadius: '50%',
                  background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '20px', margin: '0 auto 16px', boxShadow: '0 4px 16px rgba(99,102,241,.35)',
                }}>{s.icon}</div>
                <div style={{
                  position: 'absolute', top: '12px', right: '12px',
                  fontSize: '28px', fontWeight: 900, color: dark ? 'rgba(99,102,241,.08)' : 'rgba(99,102,241,.06)',
                }}>{s.n}</div>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#6366f1', letterSpacing: '1.5px', marginBottom: '7px' }}>STEP {s.n}</div>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: theme.text, marginBottom: '7px' }}>{s.title}</h3>
                <p style={{ fontSize: '13px', color: theme.textMuted, lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────────── */}
      <section ref={revealRef('cta')} style={{
        padding: isMobile ? '60px 20px' : '80px 48px',
        background: dark ? '#0d1035' : '#06091a',
        position: 'relative', overflow: 'hidden',
        opacity: visible.cta ? 1 : 0,
        transform: visible.cta ? 'translateY(0)' : 'translateY(30px)',
        transition: 'all .8s ease',
      }}>
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          width: '600px', height: '300px',
          background: 'radial-gradient(ellipse, rgba(99,102,241,.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{ maxWidth: '680px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '40px', marginBottom: '16px', animation: 'handFloat 3s ease-in-out infinite' }}>🤟</div>
          <h2 style={{ fontSize: isMobile ? '1.8rem' : '2.4rem', fontWeight: 900, color: '#fff', letterSpacing: '-1px', marginBottom: '14px' }}>
            Start communicating today
          </h2>
          <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.8, marginBottom: '32px' }}>
            Join hundreds of users who use Signova every day to communicate without barriers. Free forever.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/signup')} style={{
              padding: '13px 32px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer',
              fontSize: '14px', fontWeight: 700, transition: 'all .2s',
              boxShadow: '0 4px 24px rgba(99,102,241,.5)',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
            >Create Free Account →</button>
            <button onClick={() => navigate('/login')} style={{
              padding: '13px 32px', background: 'rgba(255,255,255,.06)', color: '#94a3b8',
              border: '1px solid rgba(255,255,255,.1)', borderRadius: '10px',
              cursor: 'pointer', fontSize: '14px', fontWeight: 500,
            }}>Sign In</button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer style={{
        background: '#060e1e', borderTop: '1px solid rgba(255,255,255,.06)',
        padding: isMobile ? '20px' : '24px 48px',
        display: 'flex', flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between', alignItems: 'center',
        gap: '10px', textAlign: isMobile ? 'center' : 'left',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
          <div style={{
            width: '26px', height: '26px', borderRadius: '7px',
            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px',
          }}>🤟</div>
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>Signova</span>
        </div>
        <div style={{ fontSize: '12px', color: '#475569' }}>© 2026 Signova · GLA University · B.Tech CSE</div>
        <div style={{ fontSize: '12px', color: '#475569' }}>Built with ❤️ for the deaf community</div>
      </footer>

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }
        @keyframes ticker { 0%{transform:translateX(0)} 100%{transform:translateX(-33.33%)} }
        @keyframes slideInLeft { from{opacity:0;transform:translateX(-40px)} to{opacity:1;transform:translateX(0)} }
        @keyframes slideInRight { from{opacity:0;transform:translateX(40px)} to{opacity:1;transform:translateX(0)} }
        @keyframes handFloat { 0%,100%{transform:translateY(0) rotate(-5deg)} 50%{transform:translateY(-14px) rotate(5deg)} }
        @keyframes badgeFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes scanLine { 0%{top:-2px} 100%{top:100%} }
        @keyframes orbFloat { 0%,100%{transform:translate(0,0)} 50%{transform:translate(20px,-20px)} }
        * { box-sizing:border-box; margin:0; padding:0; }
        html { scroll-behavior:smooth; }
        ::-webkit-scrollbar { width:5px; }
        ::-webkit-scrollbar-thumb { background:#4b5563; border-radius:3px; }
      `}</style>
    </div>
  )
}
import { useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'

export default function LandingPage() {
  const navigate   = useNavigate()
  const canvasRef  = useRef(null)
  const [scrolled, setScrolled] = useState(false)
  const [count, setCount]       = useState({ signs: 0, users: 0, acc: 0 })

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Animated counters
  useEffect(() => {
    const targets = { signs: 19, users: 500, acc: 94 }
    const dur = 1800
    const steps = 60
    const interval = dur / steps
    let step = 0
    const t = setInterval(() => {
      step++
      const p = step / steps
      const ease = 1 - Math.pow(1 - p, 3)
      setCount({
        signs: Math.round(targets.signs * ease),
        users: Math.round(targets.users * ease),
        acc:   Math.round(targets.acc   * ease),
      })
      if (step >= steps) clearInterval(t)
    }, interval)
    return () => clearInterval(t)
  }, [])

  // Grid dot canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const resize = () => {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      drawGrid()
    }
    const drawGrid = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const gap = 36
      for (let x = 0; x < canvas.width; x += gap) {
        for (let y = 0; y < canvas.height; y += gap) {
          ctx.beginPath()
          ctx.arc(x, y, 1, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(0,102,255,0.12)'
          ctx.fill()
        }
      }
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  const features = [
    { icon: '🎥', title: 'Real-time Detection',    desc: 'MediaPipe + ML ensemble detects signs with ~50ms latency using just your webcam.',   color: '#0066ff' },
    { icon: '🔊', title: 'Voice Output',            desc: 'Detected signs are instantly spoken aloud using browser speech synthesis.',           color: '#8b5cf6' },
    { icon: '🆘', title: 'Emergency Sentences',     desc: 'LSTM model recognizes full emergency phrases like "Call Ambulance" in real time.',    color: '#ef4444' },
    { icon: '📚', title: 'Learn Sign Language',     desc: 'Interactive sign cards with AI-powered quiz and instant gesture verification.',       color: '#10b981' },
    { icon: '💬', title: 'Two-way Conversation',    desc: 'Deaf users sign, hearing users speak — full two-way bridge in one interface.',       color: '#f59e0b' },
    { icon: '📊', title: 'Session Analytics',       desc: 'Track detection history, confidence trends, and your most used signs over time.',    color: '#06b6d4' },
  ]

  const steps = [
    { n: '01', icon: '📷', title: 'Open Your Camera',      desc: 'Allow camera access — Signova uses your webcam only, no data is stored.' },
    { n: '02', icon: '🤟', title: 'Perform a Sign',         desc: 'Hold your hand clearly in frame. AI detects in under 50ms.' },
    { n: '03', icon: '🔊', title: 'Hear the Translation',   desc: 'Sign converts to text and speech instantly — no typing needed.' },
  ]

  return (
    <div style={{
      minHeight: '100vh',
      background: '#ffffff',
      color: '#0a1628',
      fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
      overflowX: 'hidden',
    }}>

      {/* ── NAVBAR ──────────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? 'rgba(255,255,255,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid #e8edf2' : '1px solid transparent',
        padding: '0 48px', height: '68px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        transition: 'all 0.3s',
        boxSizing: 'border-box',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #00d4ff, #0066ff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px',
          }}>🤟</div>
          <div>
            <div style={{ fontSize: '17px', fontWeight: 800, color: '#0a1628', letterSpacing: '-0.3px' }}>Signova</div>
            <div style={{ fontSize: '9px', color: '#0066ff', letterSpacing: '2px', fontWeight: 600 }}>AI SIGN LANGUAGE</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button onClick={() => navigate('/login')} style={{
            padding: '8px 22px', background: 'transparent',
            color: '#64748b', border: '1px solid #e2e8f0',
            borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 500,
            transition: 'all 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#0066ff'; e.currentTarget.style.color = '#0066ff' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b' }}
          >
            Sign In
          </button>
          <button onClick={() => navigate('/signup')} style={{
            padding: '8px 22px',
            background: '#0066ff', color: 'white', border: 'none',
            borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600,
            transition: 'all 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = '#0052cc'}
            onMouseLeave={e => e.currentTarget.style.background = '#0066ff'}
          >
            Get Started Free →
          </button>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(160deg, #f8faff 0%, #ffffff 50%, #f0f7ff 100%)',
        padding: '100px 48px 80px',
        boxSizing: 'border-box',
      }}>

        {/* Dot grid bg */}
        <canvas ref={canvasRef} style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none',
        }} />

        {/* Blue accent blob */}
        <div style={{
          position: 'absolute', top: '-100px', right: '-100px',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,102,255,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>

            {/* Left */}
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'rgba(0,102,255,0.06)', border: '1px solid rgba(0,102,255,0.15)',
                color: '#0066ff', padding: '6px 16px', borderRadius: '20px',
                fontSize: '12px', fontWeight: 700, letterSpacing: '1px', marginBottom: '28px',
              }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0066ff', animation: 'blink 1.5s infinite' }} />
                AI-POWERED · REAL-TIME · FREE
              </div>

              <h1 style={{
                fontSize: 'clamp(2.4rem, 4vw, 3.6rem)',
                fontWeight: 900, lineHeight: 1.08,
                letterSpacing: '-1.5px', color: '#0a1628',
                marginBottom: '24px',
              }}>
                Sign Language<br />
                <span style={{
                  background: 'linear-gradient(135deg, #0066ff, #00d4ff)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>
                  Understood.
                </span>
                <br />Instantly.
              </h1>

              <p style={{
                fontSize: '16px', color: '#64748b', lineHeight: 1.8,
                marginBottom: '36px', maxWidth: '440px',
              }}>
                Signova uses computer vision and machine learning to detect hand signs through your camera and translate them to text and voice — in real time, with no special hardware.
              </p>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '48px' }}>
                <button onClick={() => navigate('/signup')} style={{
                  padding: '14px 32px',
                  background: '#0066ff', color: 'white', border: 'none',
                  borderRadius: '10px', cursor: 'pointer', fontSize: '15px', fontWeight: 700,
                  transition: 'all 0.15s', letterSpacing: '-0.2px',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#0052cc'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#0066ff'; e.currentTarget.style.transform = 'translateY(0)' }}
                >
                  Start for Free →
                </button>
                <button onClick={() => navigate('/login')} style={{
                  padding: '14px 32px',
                  background: 'white', color: '#334155',
                  border: '1px solid #e2e8f0', borderRadius: '10px',
                  cursor: 'pointer', fontSize: '15px', fontWeight: 500,
                  transition: 'all 0.15s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#0066ff'; e.currentTarget.style.color = '#0066ff' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#334155' }}
                >
                  Already have account
                </button>
              </div>

              {/* Social proof */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex' }}>
                  {['#0066ff','#8b5cf6','#10b981','#f59e0b'].map((c, i) => (
                    <div key={i} style={{
                      width: '28px', height: '28px', borderRadius: '50%',
                      background: c, border: '2px solid white',
                      marginLeft: i === 0 ? 0 : '-8px', fontSize: '12px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700,
                    }}>
                      {['K','M','R','A'][i]}
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>
                  <strong style={{ color: '#0a1628' }}>500+</strong> users communicating without barriers
                </div>
              </div>
            </div>

            {/* Right — Feature preview card */}
            <div style={{ position: 'relative' }}>
              <div style={{
                background: '#ffffff', border: '1px solid #e8edf2',
                borderRadius: '20px', padding: '28px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
              }}>
                {/* Fake camera view */}
                <div style={{
                  background: '#0a1628', borderRadius: '14px',
                  aspectRatio: '16/9', marginBottom: '20px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative', overflow: 'hidden',
                }}>
                  <div style={{ fontSize: '64px' }}>🤟</div>
                  {/* Status badge */}
                  <div style={{
                    position: 'absolute', top: '12px', left: '12px',
                    display: 'flex', alignItems: 'center', gap: '6px',
                    background: 'rgba(0,0,0,0.6)', padding: '5px 12px', borderRadius: '20px',
                  }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00c878', animation: 'blink 1.5s infinite' }} />
                    <span style={{ fontSize: '11px', color: '#00c878', fontWeight: 600 }}>AI Detecting</span>
                  </div>
                  {/* Detection result */}
                  <div style={{
                    position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)',
                    background: 'rgba(0,0,0,0.8)', padding: '10px 24px', borderRadius: '10px', textAlign: 'center',
                    border: '1px solid rgba(0,102,255,0.4)',
                  }}>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#00d4ff' }}>I Love You</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>97% confidence</div>
                  </div>
                </div>

                {/* Bottom stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  {[
                    { label: 'Signs', value: count.signs + '+', color: '#0066ff' },
                    { label: 'Users',  value: count.users + '+', color: '#8b5cf6' },
                    { label: 'Accuracy', value: count.acc + '%', color: '#10b981' },
                  ].map((s, i) => (
                    <div key={i} style={{
                      background: '#f8fafc', borderRadius: '10px', padding: '14px',
                      textAlign: 'center', border: '1px solid #f0f4f8',
                    }}>
                      <div style={{ fontSize: '20px', fontWeight: 800, color: s.color, letterSpacing: '-0.5px' }}>{s.value}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating tags */}
              <div style={{
                position: 'absolute', top: '-16px', right: '-16px',
                background: '#0066ff', color: 'white',
                padding: '8px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 700,
                boxShadow: '0 4px 20px rgba(0,102,255,0.3)',
              }}>🆘 Emergency Mode</div>
              <div style={{
                position: 'absolute', bottom: '-16px', left: '-16px',
                background: '#ffffff', color: '#10b981',
                padding: '8px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 700,
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
              }}>⚡ ~50ms Detection</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────── */}
      <section style={{ padding: '100px 48px', background: '#f8faff' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <div style={{
              display: 'inline-block', background: 'rgba(0,102,255,0.06)',
              border: '1px solid rgba(0,102,255,0.15)', color: '#0066ff',
              padding: '5px 16px', borderRadius: '20px',
              fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', marginBottom: '16px',
            }}>FEATURES</div>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 900, color: '#0a1628', letterSpacing: '-1px', marginBottom: '12px' }}>
              Built for real communication
            </h2>
            <p style={{ color: '#64748b', fontSize: '16px', maxWidth: '500px', margin: '0 auto' }}>
              Every feature designed with deaf and hard-of-hearing users at the center
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            {features.map((f, i) => (
              <div key={i} style={{
                background: '#ffffff', border: '1px solid #e8edf2',
                borderRadius: '16px', padding: '28px',
                transition: 'all 0.2s', cursor: 'default',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.08)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <div style={{
                  width: '48px', height: '48px', borderRadius: '12px',
                  background: `${f.color}10`, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: '22px', marginBottom: '16px',
                }}>{f.icon}</div>
                <div style={{ fontSize: '4px', height: '3px', width: '32px', background: f.color, borderRadius: '2px', marginBottom: '14px', opacity: 0.6 }} />
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0a1628', marginBottom: '8px' }}>{f.title}</h3>
                <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
      <section style={{ padding: '100px 48px', background: '#ffffff' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            display: 'inline-block', background: 'rgba(0,102,255,0.06)',
            border: '1px solid rgba(0,102,255,0.15)', color: '#0066ff',
            padding: '5px 16px', borderRadius: '20px',
            fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', marginBottom: '16px',
          }}>HOW IT WORKS</div>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 900, color: '#0a1628', letterSpacing: '-1px', marginBottom: '12px' }}>
            Three steps to communicate
          </h2>
          <p style={{ color: '#64748b', marginBottom: '60px' }}>No setup, no hardware, no expertise needed</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', position: 'relative' }}>
            {/* Connector line */}
            <div style={{
              position: 'absolute', top: '40px', left: '20%', right: '20%',
              height: '1px', background: 'linear-gradient(90deg, #0066ff, #00d4ff)',
              opacity: 0.2,
            }} />
            {steps.map((s, i) => (
              <div key={i} style={{
                background: '#f8faff', border: '1px solid #e8edf2',
                borderRadius: '16px', padding: '32px 24px',
                position: 'relative',
              }}>
                <div style={{
                  width: '52px', height: '52px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0066ff, #00d4ff)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '22px', margin: '0 auto 20px', color: 'white',
                }}>{s.icon}</div>
                <div style={{
                  position: 'absolute', top: '16px', right: '16px',
                  fontSize: '32px', fontWeight: 900, color: 'rgba(0,102,255,0.06)',
                }}>{s.n}</div>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#0066ff', letterSpacing: '1.5px', marginBottom: '8px' }}>
                  STEP {s.n}
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0a1628', marginBottom: '8px' }}>{s.title}</h3>
                <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────────── */}
      <section style={{ padding: '80px 48px', background: '#0a1628' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '20px' }}>🤟</div>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-1px', marginBottom: '16px' }}>
            Start communicating today
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '16px', lineHeight: 1.7, marginBottom: '36px' }}>
            Join hundreds of users who use Signova every day to communicate without barriers. Free forever.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/signup')} style={{
              padding: '14px 36px',
              background: 'linear-gradient(135deg, #00d4ff, #0066ff)',
              color: 'white', border: 'none', borderRadius: '10px',
              cursor: 'pointer', fontSize: '15px', fontWeight: 700,
              transition: 'all 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              Create Free Account →
            </button>
            <button onClick={() => navigate('/login')} style={{
              padding: '14px 36px',
              background: 'rgba(255,255,255,0.06)',
              color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px', cursor: 'pointer', fontSize: '15px', fontWeight: 500,
            }}>
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer style={{
        background: '#060e1e', borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '28px 48px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '7px',
            background: 'linear-gradient(135deg, #00d4ff, #0066ff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px',
          }}>🤟</div>
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>Signova</span>
        </div>
        <div style={{ fontSize: '13px', color: '#475569' }}>
          © 2026 Signova · GLA University · B.Tech CSE · AI Sign Language Recognition
        </div>
        <div style={{ fontSize: '13px', color: '#475569' }}>
          Built with ❤️ for the deaf community
        </div>
      </footer>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
      `}</style>
    </div>
  )
}
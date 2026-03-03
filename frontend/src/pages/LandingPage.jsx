import { useNavigate } from 'react-router-dom'
import { useEffect, useRef } from 'react'

export default function LandingPage() {
  const navigate = useNavigate()
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.5,
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.5 + 0.1
    }))

    let animId
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.x += p.dx; p.y += p.dy
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(139, 92, 246, ${p.opacity})`
        ctx.fill()
      })
      animId = requestAnimationFrame(animate)
    }
    animate()
    return () => cancelAnimationFrame(animId)
  }, [])

  const features = [
    { icon: '📸', title: 'Real-time Detection', desc: 'AI gesture recognition using your camera with near-zero delay', color: '#a78bfa' },
    { icon: '🔊', title: 'Voice Output', desc: 'Instantly convert detected signs to speech for seamless communication', color: '#38bdf8' },
    { icon: '📚', title: 'Learn Signs', desc: 'Interactive modules with AI feedback to practice sign language', color: '#34d399' },
    { icon: '💬', title: 'Two-way Conversation', desc: 'Bridge between sign users and non-sign users effortlessly', color: '#fbbf24' },
    { icon: '📋', title: 'Session History', desc: 'Review past sessions and track your progress over time', color: '#f87171' },
    { icon: '⚙️', title: 'Customizable', desc: 'Dark mode, voice settings, language and accessibility options', color: '#c084fc' },
  ]

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0a1e 0%, #0d1117 30%, #0a0f1e 60%, #100a1a 100%)',
      color: '#e2d9f3',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      overflowX: 'hidden',
      position: 'relative'
    }}>

      {/* Particle canvas */}
      <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, pointerEvents: 'none', zIndex: 0 }} />

      {/* Background glow orbs */}
      <div style={{ position: 'fixed', top: '-200px', left: '-200px', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', top: '30%', right: '-150px', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(56,189,248,0.08) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-100px', left: '30%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(167,139,250,0.1) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      {/* NAVBAR */}
      <nav style={{
        position: 'fixed', top: 0, width: '100%', zIndex: 100,
        background: 'rgba(15,10,30,0.7)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(139,92,246,0.15)',
        padding: '18px 48px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        boxSizing: 'border-box'
      }}>
        <div style={{
          fontSize: '1.6rem', fontWeight: 900,
          background: 'linear-gradient(135deg, #a78bfa, #38bdf8)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
        }}>
          🤟 SIGNOVA
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button onClick={() => navigate('/login')} style={{
            padding: '9px 22px', background: 'transparent',
            color: '#a89bc2', border: '1px solid rgba(139,92,246,0.3)',
            borderRadius: '10px', cursor: 'pointer', fontSize: '0.9rem',
            transition: 'all 0.2s'
          }}>Login</button>
          <button onClick={() => navigate('/signup')} style={{
            padding: '9px 22px',
            background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
            color: 'white', border: 'none', borderRadius: '10px',
            cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600,
            boxShadow: '0 0 20px rgba(124,58,237,0.4)'
          }}>Get Started</button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        position: 'relative', zIndex: 1,
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '120px 24px 80px'
      }}>
        <div style={{
          display: 'inline-block',
          background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(56,189,248,0.1))',
          border: '1px solid rgba(139,92,246,0.4)',
          color: '#a78bfa', padding: '7px 20px',
          borderRadius: '50px', fontSize: '0.82rem',
          letterSpacing: '1px', fontWeight: 600,
          marginBottom: '32px',
          boxShadow: '0 0 20px rgba(124,58,237,0.2)'
        }}>
          ✦ AI-POWERED SIGN LANGUAGE RECOGNITION ✦
        </div>

        <h1 style={{
          fontSize: 'clamp(2.8rem, 6vw, 5rem)',
          fontWeight: 900, lineHeight: 1.05,
          marginBottom: '28px', maxWidth: '850px'
        }}>
          Breaking the{' '}
          <span style={{
            background: 'linear-gradient(135deg, #a78bfa 0%, #38bdf8 50%, #34d399 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            display: 'block'
          }}>
            Silence Barrier
          </span>
        </h1>

        <p style={{
          fontSize: '1.15rem', color: '#9d8ec0',
          maxWidth: '580px', lineHeight: 1.8, marginBottom: '48px'
        }}>
          Signova uses advanced computer vision and machine learning to recognize hand gestures and translate sign language into text or speech — in real time.
        </p>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button onClick={() => navigate('/signup')} style={{
            padding: '15px 36px',
            background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
            color: 'white', border: 'none', borderRadius: '14px',
            cursor: 'pointer', fontSize: '1rem', fontWeight: 700,
            boxShadow: '0 0 30px rgba(124,58,237,0.5)',
            letterSpacing: '0.3px'
          }}>
            Start for Free →
          </button>
          <button onClick={() => navigate('/login')} style={{
            padding: '15px 36px',
            background: 'rgba(255,255,255,0.04)',
            color: '#c4b5fd', border: '1px solid rgba(139,92,246,0.35)',
            borderRadius: '14px', cursor: 'pointer', fontSize: '1rem',
            backdropFilter: 'blur(10px)'
          }}>
            Sign In
          </button>
        </div>

        {/* Stats */}
        <div style={{
          display: 'flex', gap: '48px', marginTop: '72px',
          padding: '24px 48px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(139,92,246,0.15)',
          borderRadius: '20px', backdropFilter: 'blur(10px)',
          flexWrap: 'wrap', justifyContent: 'center'
        }}>
          {[['10+', 'Sign Gestures'], ['Real-time', 'AI Detection'], ['100%', 'Free to Use']].map(([val, label]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, background: 'linear-gradient(135deg, #a78bfa, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{val}</div>
              <div style={{ fontSize: '0.8rem', color: '#7c6d9c', marginTop: '4px' }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ position: 'relative', zIndex: 1, padding: '80px 40px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '12px' }}>
            Everything You <span style={{ background: 'linear-gradient(135deg, #a78bfa, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Need</span>
          </h2>
          <p style={{ color: '#7c6d9c', fontSize: '1rem' }}>A complete communication platform built for the deaf and hard-of-hearing community</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {features.map((f, i) => (
            <div key={i} style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(124,58,237,0.05) 100%)',
              border: '1px solid rgba(139,92,246,0.15)',
              borderRadius: '20px', padding: '28px',
              backdropFilter: 'blur(10px)',
              transition: 'transform 0.2s, border-color 0.2s',
              cursor: 'default'
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.4)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.15)' }}
            >
              <div style={{ fontSize: '2.2rem', marginBottom: '16px' }}>{f.icon}</div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '8px', color: f.color }}>{f.title}</h3>
              <p style={{ color: '#7c6d9c', fontSize: '0.9rem', lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ position: 'relative', zIndex: 1, padding: '80px 40px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '12px' }}>How It <span style={{ background: 'linear-gradient(135deg, #a78bfa, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Works</span></h2>
        <p style={{ color: '#7c6d9c', marginBottom: '52px' }}>Three simple steps to bridge the communication gap</p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap', maxWidth: '900px', margin: '0 auto' }}>
          {[
            { step: '01', icon: '📷', title: 'Open Camera', desc: 'Allow Signova to access your webcam' },
            { step: '02', icon: '🤟', title: 'Perform Signs', desc: 'Show your hand gestures in front of the camera' },
            { step: '03', icon: '✨', title: 'Get Translation', desc: 'See instant text output and hear voice translation' },
          ].map((s, i) => (
            <div key={i} style={{
              flex: '1', minWidth: '230px', maxWidth: '260px',
              padding: '36px 24px',
              background: 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(56,189,248,0.04))',
              border: '1px solid rgba(139,92,246,0.2)',
              borderRadius: '20px', backdropFilter: 'blur(10px)',
              position: 'relative', overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', top: '16px', right: '20px', fontSize: '3rem', fontWeight: 900, color: 'rgba(124,58,237,0.08)', lineHeight: 1 }}>{s.step}</div>
              <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>{s.icon}</div>
              <div style={{ color: '#a78bfa', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '2px', marginBottom: '10px' }}>STEP {s.step}</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '10px' }}>{s.title}</h3>
              <p style={{ color: '#7c6d9c', fontSize: '0.9rem', lineHeight: 1.6 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ position: 'relative', zIndex: 1, padding: '80px 40px', textAlign: 'center' }}>
        <div style={{
          maxWidth: '650px', margin: '0 auto',
          padding: '60px 40px',
          background: 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(56,189,248,0.06))',
          border: '1px solid rgba(139,92,246,0.25)',
          borderRadius: '28px', backdropFilter: 'blur(20px)',
          boxShadow: '0 0 60px rgba(124,58,237,0.1)'
        }}>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '16px' }}>Ready to Connect?</h2>
          <p style={{ color: '#9d8ec0', marginBottom: '36px', fontSize: '1rem', lineHeight: 1.7 }}>
            Join Signova and experience communication without barriers. Free forever.
          </p>
          <button onClick={() => navigate('/signup')} style={{
            padding: '16px 44px',
            background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
            color: 'white', border: 'none', borderRadius: '14px',
            cursor: 'pointer', fontSize: '1.05rem', fontWeight: 700,
            boxShadow: '0 0 40px rgba(124,58,237,0.5)'
          }}>
            Create Free Account →
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        position: 'relative', zIndex: 1,
        borderTop: '1px solid rgba(139,92,246,0.12)',
        padding: '28px 40px', textAlign: 'center',
        color: '#4a3f6b', fontSize: '0.85rem'
      }}>
        © 2025 Signova — Empowering communication for everyone 🤟
      </footer>

    </div>
  )
}
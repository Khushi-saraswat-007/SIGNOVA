import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import toast from 'react-hot-toast'
const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function Login() {
  const [form,     setForm]     = useState({ email: '', password: '' })
  const [loading,  setLoading]  = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [focused,  setFocused]  = useState('')
  const [dark,     setDark]     = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const { login } = useAuth()
  const navigate  = useNavigate()

  useEffect(() => {
    const saved = localStorage.getItem('signova_theme')
    if (saved === 'light') setDark(false)
    else setDark(true)
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleToggle = () => {
    if (dark) {
      setDark(false)
      localStorage.setItem('signova_theme', 'light')
    } else {
      setDark(true)
      localStorage.setItem('signova_theme', 'dark')
    }
  }

  const bg         = dark ? '#06091a' : '#f8faff'
  const formBg     = dark ? '#0d1035' : '#ffffff'
  const panelBg    = dark ? '#0d1035' : '#06091a'
  const text       = dark ? '#f1f5f9' : '#0a1628'
  const textMuted  = dark ? '#94a3b8' : '#64748b'
  const border     = dark ? '#1e2448' : '#e2e8f0'
  const inputBg    = dark ? '#111442' : '#f8fafc'
  const inputFocBg = dark ? '#141852' : '#f0f6ff'
  const label      = dark ? '#94a3b8' : '#334155'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    toast.loading('Signing in...', { id: 'login' })
    try {
      const res = await axios.post(`${API}/api/auth/login`, form)
      login(res.data.user, res.data.token)
      toast.success('Welcome back!', { id: 'login' })
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Login failed.', { id: 'login' })
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = (field) => ({
    width: '100%', padding: '12px 16px',
    background: focused === field ? inputFocBg : inputBg,
    border: `1.5px solid ${focused === field ? '#6366f1' : border}`,
    borderRadius: '10px', color: text,
    fontSize: '14px', outline: 'none',
    boxSizing: 'border-box', transition: 'all 0.2s',
    fontFamily: "'DM Sans','Segoe UI',system-ui,sans-serif",
  })

  const features = [
    { icon: '🎥', text: 'Real-time gesture detection', color: '#6366f1' },
    { icon: '🔊', text: 'Instant voice output',         color: '#8b5cf6' },
    { icon: '🆘', text: 'Emergency sentence detection', color: '#ef4444' },
    { icon: '📚', text: 'Learn sign language with AI',  color: '#10b981' },
  ]

  return (
    <div style={{
      minHeight: '100vh', width: '100%',
      display: 'flex', flexDirection: isMobile ? 'column' : 'row',
      background: bg, fontFamily: "'DM Sans','Segoe UI',system-ui,sans-serif",
      color: text, transition: 'background .4s, color .4s',
    }}>

      {/* ── MOBILE TOP BAR ─────────────────────────────────────── */}
      {isMobile && (
        <div style={{
          background: panelBg, padding: '14px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid rgba(99,102,241,.2)',
          position: 'relative', zIndex: 100,
        }}>
          <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <div style={{
              width: '30px', height: '30px', borderRadius: '8px',
              background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px',
            }}>🤟</div>
            <span style={{ fontSize: '15px', fontWeight: 800, color: '#fff' }}>Signova</span>
          </div>
          <button onClick={handleToggle} style={{
            width: '48px', height: '26px', borderRadius: '13px',
            background: dark ? '#6366f1' : '#cbd5e1',
            border: 'none', cursor: 'pointer',
            position: 'relative', transition: 'background .3s',
            zIndex: 100, flexShrink: 0,
          }}>
            <div style={{
              position: 'absolute', top: '3px',
              left: dark ? '24px' : '3px',
              width: '20px', height: '20px', borderRadius: '50%',
              background: '#fff', transition: 'left .3s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px',
            }}>{dark ? '🌙' : '☀️'}</div>
          </button>
        </div>
      )}

      {/* ── LEFT PANEL (desktop only) ───────────────────────────── */}
      {!isMobile && (
        <div style={{
          flex: '0 0 44%', background: panelBg,
          display: 'flex', flexDirection: 'column',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Top accent line */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
            background: 'linear-gradient(90deg,#6366f1,#8b5cf6,#06b6d4)',
            zIndex: 1,
          }} />

          {/* Grid dots — pointer events none so it never blocks clicks */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'radial-gradient(rgba(99,102,241,0.12) 1px, transparent 1px)',
            backgroundSize: '32px 32px', pointerEvents: 'none',
          }} />

          {/* Glow orbs — pointer events none */}
          <div style={{
            position: 'absolute', top: '15%', left: '-80px',
            width: '360px', height: '360px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
            pointerEvents: 'none', animation: 'orbFloat 8s ease-in-out infinite',
          }} />
          <div style={{
            position: 'absolute', bottom: '10%', right: '-60px',
            width: '260px', height: '260px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)',
            pointerEvents: 'none', animation: 'orbFloat 11s ease-in-out infinite reverse',
          }} />

          {/* Logo + toggle — zIndex 10 to sit above everything */}
          <div style={{
            position: 'absolute', top: '24px', left: '28px', right: '28px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            zIndex: 10,
          }}>
            <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px',
              }}>🤟</div>
              <span style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>Signova</span>
            </div>

            {/* Toggle button — fully clickable */}
            <button onClick={handleToggle} style={{
              width: '48px', height: '26px', borderRadius: '13px',
              background: dark ? '#6366f1' : '#cbd5e1',
              border: 'none', cursor: 'pointer',
              position: 'relative', transition: 'background .3s',
              zIndex: 10, flexShrink: 0, pointerEvents: 'all',
            }}>
              <div style={{
                position: 'absolute', top: '3px',
                left: dark ? '24px' : '3px',
                width: '20px', height: '20px', borderRadius: '50%',
                background: '#fff', transition: 'left .3s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px',
                pointerEvents: 'none',
              }}>{dark ? '🌙' : '☀️'}</div>
            </button>
          </div>

          {/* Center content */}
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            justifyContent: 'center', padding: '80px 44px 60px',
            position: 'relative', zIndex: 2,
          }}>
            <div style={{
              width: '72px', height: '72px', borderRadius: '20px',
              background: 'rgba(99,102,241,0.15)',
              border: '1px solid rgba(99,102,241,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '34px', marginBottom: '24px',
              animation: 'handFloat 4s ease-in-out infinite',
            }}>🤟</div>

            <h2 style={{
              fontSize: '2rem', fontWeight: 900, color: '#fff',
              lineHeight: 1.1, letterSpacing: '-1px', marginBottom: '12px',
            }}>
              Communicate<br />
              <span style={{
                background: 'linear-gradient(135deg,#818cf8,#06b6d4)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>Without Limits</span>
            </h2>

            <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: 1.8, marginBottom: '28px', maxWidth: '300px' }}>
              AI-powered sign language recognition that bridges the gap between deaf and hearing communities in real time.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {features.map((f, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '10px 14px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '10px', transition: 'all .2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.25)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)' }}
                >
                  <div style={{
                    width: '30px', height: '30px', borderRadius: '8px', flexShrink: 0,
                    background: `${f.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px',
                  }}>{f.icon}</div>
                  <span style={{ color: '#cbd5e1', fontSize: '12px', fontWeight: 500 }}>{f.text}</span>
                  <div style={{
                    marginLeft: 'auto', width: '5px', height: '5px',
                    borderRadius: '50%', background: f.color, flexShrink: 0, animation: 'blink 2s infinite',
                  }} />
                </div>
              ))}
            </div>
          </div>

          <div style={{
            padding: '16px 28px', borderTop: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', gap: '8px', position: 'relative', zIndex: 2,
          }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', animation: 'blink 1.5s infinite' }} />
            <span style={{ fontSize: '11px', color: '#64748b' }}>GLA University · B.Tech CSE · AI Sign Language</span>
          </div>
        </div>
      )}

      {/* ── RIGHT — Form ────────────────────────────────────────── */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        padding: isMobile ? '32px 20px 40px' : '40px 60px',
        background: formBg, position: 'relative', transition: 'background .4s',
      }}>

        {!isMobile && (
          <div style={{ position: 'absolute', top: '24px', right: '28px', fontSize: '13px', color: textMuted }}>
            New to Signova?{' '}
            <Link to="/signup" style={{ color: '#6366f1', fontWeight: 700, textDecoration: 'none' }}>Create account →</Link>
          </div>
        )}

        <div style={{ width: '100%', maxWidth: '380px', animation: 'slideUp .6s ease forwards' }}>

          <div style={{ marginBottom: '28px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: dark ? 'rgba(99,102,241,.1)' : 'rgba(99,102,241,.08)',
              border: '1px solid rgba(99,102,241,.2)',
              color: '#818cf8', padding: '4px 12px', borderRadius: '20px',
              fontSize: '11px', fontWeight: 700, letterSpacing: '1px', marginBottom: '14px',
            }}>🔐 SECURE LOGIN</div>
            <h1 style={{ fontSize: '26px', fontWeight: 900, color: text, letterSpacing: '-.8px', marginBottom: '5px' }}>
              Welcome back
            </h1>
            <p style={{ color: textMuted, fontSize: '13px' }}>Sign in to continue to your dashboard</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: label, marginBottom: '7px', fontWeight: 700 }}>
                Email Address
              </label>
              <input
                type="email" placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                onFocus={() => setFocused('email')} onBlur={() => setFocused('')}
                required style={inputStyle('email')}
              />
            </div>

            <div style={{ marginBottom: '22px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: label, marginBottom: '7px', fontWeight: 700 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'} placeholder="Enter your password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  onFocus={() => setFocused('password')} onBlur={() => setFocused('')}
                  required style={{ ...inputStyle('password'), paddingRight: '44px' }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '15px',
                }}>{showPass ? '🙈' : '👁️'}</button>
              </div>
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '13px',
              background: loading ? '#4b5563' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              color: 'white', border: 'none', borderRadius: '10px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px', fontWeight: 700, transition: 'all .2s',
              boxShadow: loading ? 'none' : '0 4px 16px rgba(99,102,241,.4)',
            }}>
              {loading
                ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</span> Signing in...
                  </span>
                : 'Sign In →'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '18px 0' }}>
            <div style={{ flex: 1, height: '1px', background: border }} />
            <span style={{ color: textMuted, fontSize: '12px' }}>or</span>
            <div style={{ flex: 1, height: '1px', background: border }} />
          </div>

          <Link to="/signup" style={{
            display: 'block', textAlign: 'center', padding: '12px',
            background: dark ? 'rgba(99,102,241,.06)' : '#f8fafc',
            border: `1.5px solid ${border}`,
            borderRadius: '10px', color: textMuted,
            textDecoration: 'none', fontSize: '13px', fontWeight: 600, transition: 'all .15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.color = '#6366f1' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = border; e.currentTarget.style.color = textMuted }}
          >Create a free account</Link>

          {isMobile && (
            <div style={{ textAlign: 'center', marginTop: '14px', fontSize: '13px', color: textMuted }}>
              New to Signova?{' '}
              <Link to="/signup" style={{ color: '#6366f1', fontWeight: 700, textDecoration: 'none' }}>Create account →</Link>
            </div>
          )}

          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            marginTop: '20px', padding: '12px 14px',
            background: dark ? 'rgba(255,255,255,.03)' : '#f8fafc',
            borderRadius: '10px', border: `1px solid ${border}`,
          }}>
            <span style={{ fontSize: '13px' }}>🔒</span>
            <span style={{ fontSize: '11px', color: textMuted, lineHeight: 1.5 }}>
              Your data is secure. Passwords are encrypted with bcrypt — never stored in plain text.
            </span>
          </div>
        </div>

        <div style={{ marginTop: '28px', fontSize: '11px', color: textMuted, textAlign: 'center' }}>
          © 2026 Signova · Empowering communication for everyone
        </div>
      </div>

      <style>{`
        @keyframes handFloat { 0%,100%{transform:translateY(0) rotate(-5deg)} 50%{transform:translateY(-10px) rotate(5deg)} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes orbFloat { 0%,100%{transform:translate(0,0)} 50%{transform:translate(16px,-16px)} }
        * { box-sizing:border-box; }
        input::placeholder { color:#64748b; }
      `}</style>
    </div>
  )
}
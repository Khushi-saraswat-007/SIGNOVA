import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import toast from 'react-hot-toast'
const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function SignUp() {
  const [form,     setForm]     = useState({ name: '', email: '', password: '' })
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
    if (dark) { setDark(false); localStorage.setItem('signova_theme', 'light') }
    else { setDark(true); localStorage.setItem('signova_theme', 'dark') }
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

  const strength = form.password.length === 0 ? 0
    : form.password.length < 6 ? 1
    : form.password.length < 10 ? 2
    : 3
  const strengthLabel = ['', 'Weak', 'Good', 'Strong']
  const strengthColor = ['', '#ef4444', '#f59e0b', '#10b981']

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setLoading(true)
    toast.loading('Creating your account...', { id: 'signup' })
    try {
      const res = await axios.post(`${API}/api/auth/register`, form)
      login(res.data.user, res.data.token)
      toast.success('Welcome to Signova! 🤟', { id: 'signup' })
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed.', { id: 'signup' })
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

  const steps = [
    { step: '01', text: 'Create your free account', color: '#6366f1' },
    { step: '02', text: 'Allow camera access',       color: '#8b5cf6' },
    { step: '03', text: 'Start signing instantly',   color: '#10b981' },
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
          {toggleBtn}
        </div>
      )}

      {/* ── LEFT PANEL (desktop only) ───────────────────────────── */}
      {!isMobile && (
        <div style={{
          flex: '0 0 44%', background: panelBg,
          display: 'flex', flexDirection: 'column',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Top accent */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
            background: 'linear-gradient(90deg,#10b981,#6366f1,#8b5cf6)',
            zIndex: 1,
          }} />

          {/* Grid dots */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'radial-gradient(rgba(99,102,241,0.12) 1px, transparent 1px)',
            backgroundSize: '32px 32px', pointerEvents: 'none',
          }} />

          {/* Glow orbs */}
          <div style={{
            position: 'absolute', top: '10%', left: '-80px',
            width: '340px', height: '340px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
            pointerEvents: 'none', animation: 'orbFloat 9s ease-in-out infinite',
          }} />
          <div style={{
            position: 'absolute', bottom: '10%', right: '-60px',
            width: '280px', height: '280px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)',
            pointerEvents: 'none', animation: 'orbFloat 12s ease-in-out infinite reverse',
          }} />

          {/* Logo + toggle */}
          <div style={{
            position: 'absolute', top: '24px', left: '28px', right: '28px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10,
          }}>
            <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px',
                boxShadow: '0 0 16px rgba(99,102,241,.4)',
              }}>🤟</div>
              <span style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>Signova</span>
            </div>
            {toggleBtn}
          </div>

          {/* Center content */}
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            justifyContent: 'center', padding: '80px 44px 60px', position: 'relative', zIndex: 2,
          }}>
            <div style={{
              width: '72px', height: '72px', borderRadius: '20px',
              background: 'rgba(16,185,129,0.12)',
              border: '1px solid rgba(16,185,129,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '34px', marginBottom: '24px',
              animation: 'handFloat 4s ease-in-out infinite',
            }}>✋</div>

            <h2 style={{
              fontSize: '2rem', fontWeight: 900, color: '#fff',
              lineHeight: 1.1, letterSpacing: '-1px', marginBottom: '12px',
            }}>
              Join the<br />
              <span style={{
                background: 'linear-gradient(135deg,#10b981,#06b6d4)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>Community</span>
            </h2>

            <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: 1.8, marginBottom: '28px', maxWidth: '300px' }}>
              Create your free account and start breaking communication barriers with AI-powered sign language recognition.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              {steps.map((s, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '10px 14px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '10px', transition: 'all .2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.25)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)' }}
                >
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                    background: `${s.color}18`, border: `1.5px solid ${s.color}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '10px', fontWeight: 800, color: s.color,
                  }}>{s.step}</div>
                  <span style={{ color: '#cbd5e1', fontSize: '12px', fontWeight: 500 }}>{s.text}</span>
                </div>
              ))}
            </div>

            <div style={{
              padding: '12px 14px',
              background: 'rgba(16,185,129,0.08)',
              border: '1px solid rgba(16,185,129,0.2)',
              borderRadius: '10px',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <span style={{ fontSize: '13px' }}>✅</span>
              <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 600 }}>
                100% Free · No credit card required
              </span>
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

      {/* ── RIGHT — Signup Form ────────────────────────────────── */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        padding: isMobile ? '32px 20px 40px' : '40px 60px',
        background: formBg, position: 'relative', transition: 'background .4s',
      }}>

        {!isMobile && (
          <div style={{ position: 'absolute', top: '24px', right: '28px', fontSize: '13px', color: textMuted }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#6366f1', fontWeight: 700, textDecoration: 'none' }}>Sign in →</Link>
          </div>
        )}

        <div style={{ width: '100%', maxWidth: '380px', animation: 'slideUp .6s ease forwards' }}>

          {/* Header */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: dark ? 'rgba(16,185,129,.1)' : 'rgba(16,185,129,.08)',
              border: '1px solid rgba(16,185,129,.25)',
              color: '#10b981', padding: '4px 12px', borderRadius: '20px',
              fontSize: '11px', fontWeight: 700, letterSpacing: '1px', marginBottom: '14px',
            }}>🤟 FREE ACCOUNT</div>
            <h1 style={{ fontSize: '26px', fontWeight: 900, color: text, letterSpacing: '-.8px', marginBottom: '5px' }}>
              Create account
            </h1>
            <p style={{ color: textMuted, fontSize: '13px' }}>Join Signova for free and start communicating</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>

            {/* Name */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: label, marginBottom: '7px', fontWeight: 700 }}>
                Full Name
              </label>
              <input
                type="text" placeholder="Your full name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                onFocus={() => setFocused('name')} onBlur={() => setFocused('')}
                required style={inputStyle('name')}
              />
            </div>

            {/* Email */}
            <div style={{ marginBottom: '14px' }}>
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

            {/* Password */}
            <div style={{ marginBottom: '8px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: label, marginBottom: '7px', fontWeight: 700 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'} placeholder="Min. 6 characters"
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

            {/* Password strength */}
            {form.password.length > 0 && (
              <div style={{ marginBottom: '18px' }}>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                  {[1, 2, 3].map(i => (
                    <div key={i} style={{
                      flex: 1, height: '3px', borderRadius: '2px',
                      background: i <= strength ? strengthColor[strength] : (dark ? '#1e2448' : '#f0f4f8'),
                      transition: 'all 0.3s',
                    }} />
                  ))}
                </div>
                <div style={{ fontSize: '11px', color: strengthColor[strength], fontWeight: 600 }}>
                  {strengthLabel[strength]} password
                </div>
              </div>
            )}

            {!form.password.length && <div style={{ marginBottom: '18px' }} />}

            {/* Submit */}
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '13px',
              background: loading ? '#4b5563' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              color: 'white', border: 'none', borderRadius: '10px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px', fontWeight: 700, transition: 'all .2s',
              boxShadow: loading ? 'none' : '0 4px 16px rgba(99,102,241,.4)',
              marginBottom: '16px',
            }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.boxShadow = '0 6px 24px rgba(99,102,241,.55)' }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.boxShadow = '0 4px 16px rgba(99,102,241,.4)' }}
            >
              {loading
                ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</span> Creating account...
                  </span>
                : 'Create Free Account →'}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <div style={{ flex: 1, height: '1px', background: border }} />
            <span style={{ color: textMuted, fontSize: '12px' }}>or</span>
            <div style={{ flex: 1, height: '1px', background: border }} />
          </div>

          {/* Sign in link */}
          <Link to="/login" style={{
            display: 'block', textAlign: 'center', padding: '12px',
            background: dark ? 'rgba(99,102,241,.06)' : '#f8fafc',
            border: `1.5px solid ${border}`,
            borderRadius: '10px', color: textMuted,
            textDecoration: 'none', fontSize: '13px', fontWeight: 600, transition: 'all .15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.color = '#6366f1' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = border; e.currentTarget.style.color = textMuted }}
          >Sign in instead</Link>

          {isMobile && (
            <div style={{ textAlign: 'center', marginTop: '14px', fontSize: '13px', color: textMuted }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#6366f1', fontWeight: 700, textDecoration: 'none' }}>Sign in →</Link>
            </div>
          )}

          <p style={{ textAlign: 'center', fontSize: '11px', color: textMuted, marginTop: '18px', lineHeight: 1.6 }}>
            By creating an account you agree to our terms of service.<br />
            Your password is encrypted with bcrypt — never stored in plain text.
          </p>
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
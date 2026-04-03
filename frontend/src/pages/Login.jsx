import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function Login() {
  const [form,     setForm]     = useState({ email: '', password: '' })
  const [loading,  setLoading]  = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [focused,  setFocused]  = useState('')
  const { login } = useAuth()
  const navigate  = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await axios.post('http://localhost:8000/api/auth/login', form)
      login(res.data.user, res.data.token)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Login failed.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = (field) => ({
    width: '100%', padding: '12px 16px',
    background: focused === field ? '#f0f6ff' : '#f8fafc',
    border: `1.5px solid ${focused === field ? '#0066ff' : '#e2e8f0'}`,
    borderRadius: '10px', color: '#0a1628',
    fontSize: '14px', outline: 'none',
    boxSizing: 'border-box', transition: 'all 0.2s',
    fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
  })

  return (
    <div style={{
      height: '100vh', width: '100vw', overflow: 'hidden',
      display: 'flex',
      background: '#ffffff',
      fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
      color: '#0a1628',
    }}>

      {/* ── LEFT — Brand Panel ─────────────────────────────────── */}
      <div style={{
        flex: '0 0 44%',
        background: '#0a1628',
        display: 'flex', flexDirection: 'column',
        position: 'relative', overflow: 'hidden',
      }}>

        {/* Top accent */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
          background: 'linear-gradient(90deg, #00d4ff, #0066ff)',
        }} />

        {/* Subtle grid pattern */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `radial-gradient(rgba(0,102,255,0.12) 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
          pointerEvents: 'none',
        }} />

        {/* Glow orb */}
        <div style={{
          position: 'absolute', top: '20%', left: '-100px',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,102,255,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Logo */}
        <div onClick={() => navigate('/')} style={{
          position: 'absolute', top: '28px', left: '32px',
          display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', zIndex: 1,
        }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'linear-gradient(135deg, #00d4ff, #0066ff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px',
          }}>🤟</div>
          <span style={{ fontSize: '16px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.3px' }}>Signova</span>
        </div>

        {/* Center content */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          justifyContent: 'center', padding: '60px 48px', position: 'relative', zIndex: 1,
        }}>
          {/* Big icon */}
          <div style={{
            width: '80px', height: '80px', borderRadius: '20px',
            background: 'rgba(0,102,255,0.15)',
            border: '1px solid rgba(0,102,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '38px', marginBottom: '32px',
            animation: 'float 4s ease-in-out infinite',
          }}>🤟</div>

          <h2 style={{
            fontSize: '2.2rem', fontWeight: 900, color: '#ffffff',
            lineHeight: 1.1, letterSpacing: '-1px', marginBottom: '16px',
          }}>
            Communicate<br />
            <span style={{
              background: 'linear-gradient(135deg, #00d4ff, #0066ff)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>Without Limits</span>
          </h2>

          <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.8, marginBottom: '40px', maxWidth: '300px' }}>
            AI-powered sign language recognition that bridges the gap between deaf and hearing communities in real time.
          </p>

          {/* Feature list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { icon: '🎥', text: 'Real-time gesture detection',  color: '#00d4ff' },
              { icon: '🔊', text: 'Instant voice output',          color: '#0066ff' },
              { icon: '🆘', text: 'Emergency sentence detection',  color: '#ef4444' },
              { icon: '📚', text: 'Learn sign language with AI',   color: '#10b981' },
            ].map((f, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '10px',
              }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
                  background: `${f.color}18`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '14px',
                }}>{f.icon}</div>
                <span style={{ color: '#cbd5e1', fontSize: '13px', fontWeight: 500 }}>{f.text}</span>
                <div style={{
                  marginLeft: 'auto', width: '6px', height: '6px',
                  borderRadius: '50%', background: f.color, flexShrink: 0,
                }} />
              </div>
            ))}
          </div>
        </div>

        {/* Bottom tag */}
        <div style={{
          padding: '20px 32px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', gap: '8px',
          position: 'relative', zIndex: 1,
        }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', animation: 'blink 1.5s infinite' }} />
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            GLA University · B.Tech CSE · AI Sign Language Recognition
          </span>
        </div>
      </div>

      {/* ── RIGHT — Login Form ─────────────────────────────────── */}
      <div style={{
        flex: 1,
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        padding: '40px 60px',
        background: '#ffffff',
        position: 'relative',
      }}>

        {/* Top right corner link */}
        <div style={{ position: 'absolute', top: '28px', right: '32px', fontSize: '13px', color: '#64748b' }}>
          New to Signova?{' '}
          <Link to="/signup" style={{ color: '#0066ff', fontWeight: 700, textDecoration: 'none' }}>
            Create account →
          </Link>
        </div>

        <div style={{ width: '100%', maxWidth: '380px' }}>

          {/* Header */}
          <div style={{ marginBottom: '36px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: 'rgba(0,102,255,0.06)', border: '1px solid rgba(0,102,255,0.15)',
              color: '#0066ff', padding: '4px 12px', borderRadius: '20px',
              fontSize: '11px', fontWeight: 700, letterSpacing: '1px', marginBottom: '16px',
            }}>
              🔐 SECURE LOGIN
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#0a1628', letterSpacing: '-0.8px', marginBottom: '6px' }}>
              Welcome back
            </h1>
            <p style={{ color: '#64748b', fontSize: '14px' }}>
              Sign in to continue to your dashboard
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>

            {/* Email */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{
                display: 'block', fontSize: '12px', color: '#334155',
                marginBottom: '8px', fontWeight: 700, letterSpacing: '0.3px',
              }}>
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused('')}
                required
                style={inputStyle('email')}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '12px', color: '#334155', fontWeight: 700, letterSpacing: '0.3px' }}>
                  Password
                </label>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused('')}
                  required
                  style={{ ...inputStyle('password'), paddingRight: '44px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute', right: '14px', top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#94a3b8', fontSize: '16px', padding: '2px',
                  }}
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '13px',
                background: loading ? '#94a3b8' : '#0066ff',
                color: 'white', border: 'none',
                borderRadius: '10px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '15px', fontWeight: 700,
                transition: 'all 0.2s', letterSpacing: '-0.2px',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#0052cc' }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#0066ff' }}
            >
              {loading
                ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</span>
                    Signing in...
                  </span>
                : 'Sign In →'}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '24px 0' }}>
            <div style={{ flex: 1, height: '1px', background: '#f0f4f8' }} />
            <span style={{ color: '#94a3b8', fontSize: '12px' }}>or</span>
            <div style={{ flex: 1, height: '1px', background: '#f0f4f8' }} />
          </div>

          {/* Create account */}
          <Link to="/signup" style={{
            display: 'block', textAlign: 'center', padding: '12px',
            background: '#f8fafc',
            border: '1.5px solid #e2e8f0',
            borderRadius: '10px', color: '#334155',
            textDecoration: 'none', fontSize: '14px', fontWeight: 600,
            transition: 'all 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#0066ff'; e.currentTarget.style.color = '#0066ff' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#334155' }}
          >
            Create a free account
          </Link>

          {/* Security note */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            marginTop: '28px', padding: '12px 16px',
            background: '#f8fafc', borderRadius: '10px',
            border: '1px solid #f0f4f8',
          }}>
            <span style={{ fontSize: '14px' }}>🔒</span>
            <span style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.5 }}>
              Your data is secure. Passwords are encrypted with bcrypt — never stored in plain text.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div style={{ position: 'absolute', bottom: '20px', fontSize: '12px', color: '#cbd5e1' }}>
          © 2026 Signova · Empowering communication for everyone
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-8px); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        * { box-sizing: border-box; }
        input::placeholder { color: #94a3b8; }
      `}</style>
    </div>
  )
}
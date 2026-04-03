import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function SignUp() {
  const [form,     setForm]     = useState({ name: '', email: '', password: '' })
  const [loading,  setLoading]  = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [focused,  setFocused]  = useState('')
  const { login } = useAuth()
  const navigate  = useNavigate()

  const strength = form.password.length === 0 ? 0
    : form.password.length < 6 ? 1
    : form.password.length < 10 ? 2
    : 3

  const strengthLabel = ['', 'Weak', 'Good', 'Strong']
  const strengthColor = ['', '#ef4444', '#f59e0b', '#10b981']

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      const res = await axios.post('http://localhost:8000/api/auth/register', form)
      login(res.data.user, res.data.token)
      toast.success('Account created! Welcome to Signova 🤟')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed.')
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
          background: 'linear-gradient(90deg, #10b981, #00d4ff, #0066ff)',
        }} />

        {/* Dot grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `radial-gradient(rgba(0,102,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
          pointerEvents: 'none',
        }} />

        {/* Glow */}
        <div style={{
          position: 'absolute', bottom: '10%', right: '-80px',
          width: '350px', height: '350px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)',
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

        {/* Center */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          justifyContent: 'center', padding: '60px 48px', position: 'relative', zIndex: 1,
        }}>

          {/* Icon */}
          <div style={{
            width: '80px', height: '80px', borderRadius: '20px',
            background: 'rgba(16,185,129,0.12)',
            border: '1px solid rgba(16,185,129,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '38px', marginBottom: '32px',
            animation: 'float 4s ease-in-out infinite',
          }}>✋</div>

          <h2 style={{
            fontSize: '2.2rem', fontWeight: 900, color: '#ffffff',
            lineHeight: 1.1, letterSpacing: '-1px', marginBottom: '16px',
          }}>
            Join the<br />
            <span style={{
              background: 'linear-gradient(135deg, #10b981, #00d4ff)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>Community</span>
          </h2>

          <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.8, marginBottom: '36px', maxWidth: '300px' }}>
            Create your free account and start breaking communication barriers with AI-powered sign language recognition.
          </p>

          {/* Steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { step: '01', text: 'Create your free account',  color: '#00d4ff' },
              { step: '02', text: 'Allow camera access',        color: '#0066ff' },
              { step: '03', text: 'Start signing instantly',    color: '#10b981' },
            ].map((s, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '10px',
              }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                  background: `${s.color}18`,
                  border: `1.5px solid ${s.color}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '10px', fontWeight: 800, color: s.color,
                }}>{s.step}</div>
                <span style={{ color: '#cbd5e1', fontSize: '13px', fontWeight: 500 }}>{s.text}</span>
              </div>
            ))}
          </div>

          {/* Free badge */}
          <div style={{
            marginTop: '24px', padding: '12px 16px',
            background: 'rgba(16,185,129,0.08)',
            border: '1px solid rgba(16,185,129,0.2)',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <span style={{ fontSize: '14px' }}>✅</span>
            <span style={{ fontSize: '13px', color: '#10b981', fontWeight: 600 }}>
              100% Free · No credit card required
            </span>
          </div>
        </div>

        {/* Bottom */}
        <div style={{
          padding: '20px 32px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', gap: '8px',
          position: 'relative', zIndex: 1,
        }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', animation: 'blink 1.5s infinite' }} />
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            GLA University · B.Tech CSE · AI Sign Language
          </span>
        </div>
      </div>

      {/* ── RIGHT — Signup Form ────────────────────────────────── */}
      <div style={{
        flex: 1,
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        padding: '40px 60px',
        background: '#ffffff',
        position: 'relative',
      }}>

        {/* Top right */}
        <div style={{ position: 'absolute', top: '28px', right: '32px', fontSize: '13px', color: '#64748b' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#0066ff', fontWeight: 700, textDecoration: 'none' }}>
            Sign in →
          </Link>
        </div>

        <div style={{ width: '100%', maxWidth: '380px' }}>

          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)',
              color: '#10b981', padding: '4px 12px', borderRadius: '20px',
              fontSize: '11px', fontWeight: 700, letterSpacing: '1px', marginBottom: '16px',
            }}>
              🤟 FREE ACCOUNT
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#0a1628', letterSpacing: '-0.8px', marginBottom: '6px' }}>
              Create account
            </h1>
            <p style={{ color: '#64748b', fontSize: '14px' }}>
              Join Signova for free and start communicating
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>

            {/* Name */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#334155', marginBottom: '8px', fontWeight: 700 }}>
                Full Name
              </label>
              <input
                type="text"
                placeholder="Your full name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                onFocus={() => setFocused('name')}
                onBlur={() => setFocused('')}
                required
                style={inputStyle('name')}
              />
            </div>

            {/* Email */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#334155', marginBottom: '8px', fontWeight: 700 }}>
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
            <div style={{ marginBottom: '8px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#334155', marginBottom: '8px', fontWeight: 700 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
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

            {/* Password strength */}
            {form.password.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                  {[1, 2, 3].map(i => (
                    <div key={i} style={{
                      flex: 1, height: '3px', borderRadius: '2px',
                      background: i <= strength ? strengthColor[strength] : '#f0f4f8',
                      transition: 'all 0.3s',
                    }} />
                  ))}
                </div>
                <div style={{ fontSize: '11px', color: strengthColor[strength], fontWeight: 600 }}>
                  {strengthLabel[strength]} password
                </div>
              </div>
            )}

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
                marginBottom: '16px',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#0052cc' }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#0066ff' }}
            >
              {loading
                ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</span>
                    Creating account...
                  </span>
                : 'Create Free Account →'}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ flex: 1, height: '1px', background: '#f0f4f8' }} />
            <span style={{ color: '#94a3b8', fontSize: '12px' }}>or</span>
            <div style={{ flex: 1, height: '1px', background: '#f0f4f8' }} />
          </div>

          {/* Sign in link */}
          <Link to="/login" style={{
            display: 'block', textAlign: 'center', padding: '12px',
            background: '#f8fafc', border: '1.5px solid #e2e8f0',
            borderRadius: '10px', color: '#334155',
            textDecoration: 'none', fontSize: '14px', fontWeight: 600,
            transition: 'all 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#0066ff'; e.currentTarget.style.color = '#0066ff' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#334155' }}
          >
            Sign in instead
          </Link>

          {/* Terms */}
          <p style={{ textAlign: 'center', fontSize: '11px', color: '#94a3b8', marginTop: '20px', lineHeight: 1.6 }}>
            By creating an account you agree to our terms of service.<br />
            Your password is encrypted with bcrypt — never stored in plain text.
          </p>
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
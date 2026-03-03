import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function SignUp() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

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

  return (
    <div style={{
      height: '100vh', width: '100vw', overflow: 'hidden',
      display: 'flex',
      background: 'linear-gradient(135deg, #0f0a1e 0%, #0d1117 50%, #0a0f1e 100%)',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      color: '#e2d9f3'
    }}>

      {/* LEFT SIDE */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        padding: '40px',
        borderRight: '1px solid rgba(139,92,246,0.12)',
        position: 'relative', overflow: 'hidden'
      }}>

        {/* Glow */}
        <div style={{ position: 'absolute', top: '-100px', left: '-100px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Logo */}
        <div onClick={() => navigate('/')} style={{
          position: 'absolute', top: '28px', left: '32px',
          fontSize: '1.2rem', fontWeight: 900, cursor: 'pointer',
          background: 'linear-gradient(135deg, #a78bfa, #38bdf8)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
        }}>🤟 SIGNOVA</div>

        {/* Center content */}
        <div style={{ textAlign: 'center', maxWidth: '360px' }}>
          <div style={{
            fontSize: '5rem', marginBottom: '24px',
            filter: 'drop-shadow(0 0 30px rgba(56,189,248,0.7))',
            animation: 'float 3s ease-in-out infinite'
          }}>✋</div>

          <h2 style={{
            fontSize: '1.7rem', fontWeight: 800, marginBottom: '12px',
            background: 'linear-gradient(135deg, #38bdf8, #34d399)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>
            Join the Community
          </h2>

          <p style={{ color: '#7c6d9c', fontSize: '0.88rem', lineHeight: 1.75, marginBottom: '32px' }}>
            Create your free account and start breaking communication barriers with AI-powered sign language recognition.
          </p>

          {/* Steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { step: '01', text: 'Create your free account', color: '#a78bfa' },
              { step: '02', text: 'Allow camera access', color: '#38bdf8' },
              { step: '03', text: 'Start signing instantly', color: '#34d399' },
            ].map((s, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '11px 16px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(139,92,246,0.15)',
                borderRadius: '10px', textAlign: 'left'
              }}>
                <div style={{
                  width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0,
                  background: `rgba(${s.color === '#a78bfa' ? '167,139,250' : s.color === '#38bdf8' ? '56,189,248' : '52,211,153'},0.15)`,
                  border: `1px solid ${s.color}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.7rem', fontWeight: 700, color: s.color
                }}>{s.step}</div>
                <span style={{ color: '#c4b5fd', fontSize: '0.85rem', fontWeight: 500 }}>{s.text}</span>
              </div>
            ))}
          </div>

          {/* Free badge */}
          <div style={{
            marginTop: '24px', padding: '12px 20px',
            background: 'linear-gradient(135deg, rgba(52,211,153,0.08), rgba(56,189,248,0.06))',
            border: '1px solid rgba(52,211,153,0.2)',
            borderRadius: '12px', fontSize: '0.85rem', color: '#34d399',
            fontWeight: 600
          }}>
            ✦ 100% Free — No credit card required
          </div>
        </div>

        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
        `}</style>
      </div>

      {/* RIGHT SIDE — FORM */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        padding: '40px', position: 'relative', overflow: 'hidden'
      }}>

        {/* Glow */}
        <div style={{ position: 'absolute', bottom: '-100px', right: '-100px', width: '350px', height: '350px', background: 'radial-gradient(circle, rgba(56,189,248,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ width: '100%', maxWidth: '360px' }}>

          <h1 style={{ fontSize: '1.7rem', fontWeight: 800, marginBottom: '6px' }}>Create account</h1>
          <p style={{ color: '#7c6d9c', fontSize: '0.88rem', marginBottom: '28px' }}>Join Signova for free and start communicating</p>

          {/* Form card */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(56,189,248,0.03))',
            border: '1px solid rgba(139,92,246,0.2)',
            borderRadius: '20px', padding: '28px',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 0 40px rgba(56,189,248,0.05)'
          }}>
            <form onSubmit={handleSubmit}>

              {/* Name */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#a89bc2', marginBottom: '7px', fontWeight: 600, letterSpacing: '0.5px' }}>
                  FULL NAME
                </label>
                <input
                  type="text"
                  placeholder="Your name"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                  style={{
                    width: '100%', padding: '11px 14px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(139,92,246,0.2)',
                    borderRadius: '10px', color: '#e2d9f3',
                    fontSize: '0.92rem', outline: 'none',
                    boxSizing: 'border-box', transition: 'border-color 0.2s'
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(139,92,246,0.7)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(139,92,246,0.2)'}
                />
              </div>

              {/* Email */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#a89bc2', marginBottom: '7px', fontWeight: 600, letterSpacing: '0.5px' }}>
                  EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                  style={{
                    width: '100%', padding: '11px 14px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(139,92,246,0.2)',
                    borderRadius: '10px', color: '#e2d9f3',
                    fontSize: '0.92rem', outline: 'none',
                    boxSizing: 'border-box', transition: 'border-color 0.2s'
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(139,92,246,0.7)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(139,92,246,0.2)'}
                />
              </div>

              {/* Password */}
              <div style={{ marginBottom: '22px' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#a89bc2', marginBottom: '7px', fontWeight: 600, letterSpacing: '0.5px' }}>
                  PASSWORD
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Min. 6 characters"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    required
                    style={{
                      width: '100%', padding: '11px 44px 11px 14px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(139,92,246,0.2)',
                      borderRadius: '10px', color: '#e2d9f3',
                      fontSize: '0.92rem', outline: 'none',
                      boxSizing: 'border-box', transition: 'border-color 0.2s'
                    }}
                    onFocus={e => e.target.style.borderColor = 'rgba(139,92,246,0.7)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(139,92,246,0.2)'}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{
                    position: 'absolute', right: '12px', top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none',
                    cursor: 'pointer', color: '#7c6d9c', fontSize: '0.95rem'
                  }}>
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '12px',
                background: loading ? 'rgba(56,189,248,0.3)' : 'linear-gradient(135deg, #2563eb, #0891b2)',
                color: 'white', border: 'none', borderRadius: '10px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '0.95rem', fontWeight: 700,
                boxShadow: loading ? 'none' : '0 0 25px rgba(56,189,248,0.3)',
                transition: 'all 0.2s'
              }}>
                {loading ? 'Creating account...' : 'Create Account →'}
              </button>
            </form>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '18px 0' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(139,92,246,0.15)' }} />
              <span style={{ color: '#4a3f6b', fontSize: '0.75rem' }}>already have an account?</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(139,92,246,0.15)' }} />
            </div>

            <Link to="/login" style={{
              display: 'block', textAlign: 'center', padding: '11px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(139,92,246,0.2)',
              borderRadius: '10px', color: '#a78bfa',
              textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600
            }}>
              Sign in instead
            </Link>
          </div>

          <p style={{ textAlign: 'center', color: '#4a3f6b', fontSize: '0.75rem', marginTop: '20px' }}>
            © 2025 Signova — Empowering communication for everyone
          </p>
        </div>
      </div>
    </div>
  )
}
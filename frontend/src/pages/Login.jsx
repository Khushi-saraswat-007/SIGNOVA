import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

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

        {/* Logo top left */}
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
            filter: 'drop-shadow(0 0 30px rgba(124,58,237,0.7))',
            animation: 'float 3s ease-in-out infinite'
          }}>🤟</div>

          <h2 style={{
            fontSize: '1.7rem', fontWeight: 800, marginBottom: '12px',
            background: 'linear-gradient(135deg, #a78bfa, #38bdf8)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>
            Communicate Without Limits
          </h2>

          <p style={{ color: '#7c6d9c', fontSize: '0.88rem', lineHeight: 1.75, marginBottom: '32px' }}>
            AI-powered sign language recognition that bridges the gap between deaf and hearing communities in real time.
          </p>

          {/* 3 feature pills */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { icon: '📸', text: 'Real-time gesture detection', dot: '#a78bfa' },
              { icon: '🔊', text: 'Instant voice output', dot: '#38bdf8' },
              { icon: '📚', text: 'Learn sign language with AI', dot: '#34d399' },
            ].map((f, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '11px 16px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(139,92,246,0.15)',
                borderRadius: '10px', textAlign: 'left'
              }}>
                <span style={{ fontSize: '1rem' }}>{f.icon}</span>
                <span style={{ color: '#c4b5fd', fontSize: '0.85rem', fontWeight: 500, flex: 1 }}>{f.text}</span>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: f.dot, boxShadow: `0 0 6px ${f.dot}`, flexShrink: 0 }} />
              </div>
            ))}
          </div>
        </div>

        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
        `}</style>
      </div>

      {/* RIGHT SIDE */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        padding: '40px', position: 'relative', overflow: 'hidden'
      }}>

        {/* Glow */}
        <div style={{ position: 'absolute', bottom: '-100px', right: '-100px', width: '350px', height: '350px', background: 'radial-gradient(circle, rgba(56,189,248,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ width: '100%', maxWidth: '360px' }}>

          <h1 style={{ fontSize: '1.7rem', fontWeight: 800, marginBottom: '6px' }}>Welcome back</h1>
          <p style={{ color: '#7c6d9c', fontSize: '0.88rem', marginBottom: '28px' }}>Sign in to continue to your dashboard</p>

          {/* Form card */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(124,58,237,0.04))',
            border: '1px solid rgba(139,92,246,0.2)',
            borderRadius: '20px', padding: '28px',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 0 40px rgba(124,58,237,0.07)'
          }}>
            <form onSubmit={handleSubmit}>

              {/* Email */}
              <div style={{ marginBottom: '16px' }}>
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
                    placeholder="••••••••"
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
                background: loading ? 'rgba(124,58,237,0.4)' : 'linear-gradient(135deg, #7c3aed, #2563eb)',
                color: 'white', border: 'none', borderRadius: '10px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '0.95rem', fontWeight: 700,
                boxShadow: loading ? 'none' : '0 0 25px rgba(124,58,237,0.4)',
                transition: 'all 0.2s'
              }}>
                {loading ? 'Signing in...' : 'Sign In →'}
              </button>
            </form>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '18px 0' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(139,92,246,0.15)' }} />
              <span style={{ color: '#4a3f6b', fontSize: '0.75rem' }}>new here?</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(139,92,246,0.15)' }} />
            </div>

            <Link to="/signup" style={{
              display: 'block', textAlign: 'center', padding: '11px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(139,92,246,0.2)',
              borderRadius: '10px', color: '#a78bfa',
              textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600
            }}>
              Create a free account
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
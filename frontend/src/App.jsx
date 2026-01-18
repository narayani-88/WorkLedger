import { useState } from 'react'
import { login, register } from './api/auth'

const Logo = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="10" fill="url(#logo-grad)" />
    <path d="M10 20L15 25L30 15" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    <defs>
      <linearGradient id="logo-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
        <stop stopColor="#6366F1" />
        <stop offset="1" stopColor="#A855F7" />
      </linearGradient>
    </defs>
  </svg>
)

function App() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [user, setUser] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      if (isLogin) {
        const data = await login(email, password)
        localStorage.setItem('token', data.token)
        setUser(data)
        setSuccess('Authentication successful')
      } else {
        await register(email, password)
        setSuccess('Account created. You can now sign in.')
        setIsLogin(true)
        setPassword('')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setUser(null)
    setSuccess('Signed out')
    setEmail('')
    setPassword('')
  }

  if (user) {
    return (
      <div className="mnc-layout">
        <aside className="branding-side">
          <div className="branding-content">
            <div className="logo-wrapper">
              <Logo />
              <span className="logo-text">WorkLedger</span>
            </div>
            <h1 className="hero-heading">Welcome Back,<br />{user.email.split('@')[0]}</h1>
            <p className="hero-subtext">Focus on what matters most. Your enterprise ledger is ready for the day's tasks.</p>
          </div>
        </aside>
        <main className="auth-side">
          <div className="auth-form-container">
            <div className="status-box success">
              🎉 {success}
            </div>
            <div className="auth-header">
              <h2>Dashboard</h2>
              <p>You have successfully authenticated with WorkLedger Secure.</p>
            </div>
            <button onClick={handleLogout} className="mnc-btn" style={{ width: '100%' }}>Sign Out from Session</button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="mnc-layout">
      <aside className="branding-side">
        <div className="branding-content">
          <div className="logo-wrapper">
            <Logo />
            <span className="logo-text">WorkLedger</span>
          </div>
          <h1 className="hero-heading">The Ledger for<br />Modern Enterprise</h1>
          <p className="hero-subtext">Experience high-performance multi-tenant architecture designed for massive scale.</p>
        </div>
      </aside>

      <main className="auth-side">
        <div className="auth-form-container">
          <div className="auth-header">
            <h2>{isLogin ? 'Sign In' : 'Get Started'}</h2>
            <p>{isLogin ? 'Access your WorkLedger workspace' : 'Create your secure enterprise account'}</p>
          </div>

          {error && <div className="status-box error">⚠️ {error}</div>}
          {success && <div className="status-box success">✓ {success}</div>}

          <form onSubmit={handleSubmit} className="form-stack">
            <div className="input-container">
              <label>Professional Email</label>
              <input
                type="email"
                className="mnc-input"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="input-container">
              <label>Secure Password</label>
              <input
                type="password"
                className="mnc-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="mnc-btn" disabled={loading}>
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  <div className="spinner"></div>
                  <span>Processing...</span>
                </div>
              ) : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="social-divider">OR CONTINUE WITH</div>

          {/* Social buttons placeholder for MNC feel */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <button className="mnc-input" style={{ padding: '0.75rem', cursor: 'not-allowed', opacity: 0.5 }} disabled>Google</button>
            <button className="mnc-input" style={{ padding: '0.75rem', cursor: 'not-allowed', opacity: 0.5 }} disabled>GitHub</button>
          </div>

          <div className="footer-action">
            {isLogin ? (
              <>New to WorkLedger? <a href="#" onClick={(e) => { e.preventDefault(); setIsLogin(false); setError(''); setSuccess(''); }}>Create account</a></>
            ) : (
              <>Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); setIsLogin(true); setError(''); setSuccess(''); }}>Sign in</a></>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default App

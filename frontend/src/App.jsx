import { useState, useEffect } from 'react'
import { login, register } from './api/auth'
import { registerTenant, listTenants } from './api/tenant'
import { getServices, logService } from './api/core'

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
  const [companyName, setCompanyName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [user, setUser] = useState(null)
  const [showTenantOnboarding, setShowTenantOnboarding] = useState(false)

  // Zoho-style Onboarding State
  const [industry, setIndustry] = useState('')
  const [companySize, setCompanySize] = useState('1-10')
  const [employees, setEmployees] = useState(0)
  const [freelancers, setFreelancers] = useState(0)
  const [website, setWebsite] = useState('')
  const [bizDesc, setBizDesc] = useState('')

  // Service Logging State
  const [services, setServices] = useState([])
  const [showServiceForm, setShowServiceForm] = useState(false)
  const [serviceName, setServiceName] = useState('')
  const [serviceType, setServiceType] = useState('Website Mockup')
  const [serviceDesc, setServiceDesc] = useState('')

  // Tenant Discovery State
  const [activeTenantId, setActiveTenantId] = useState('')
  const [registeredTenants, setRegisteredTenants] = useState([])

  useEffect(() => {
    if (user) {
      loadRegisteredTenants()
    }
  }, [user])

  useEffect(() => {
    if (user && activeTenantId) {
      loadTenantServices()
    }
  }, [user, activeTenantId])

  const loadRegisteredTenants = async () => {
    try {
      const data = await listTenants()
      setRegisteredTenants(data)
    } catch (err) {
      console.error('Error loading tenants:', err)
    }
  }

  const loadTenantServices = async () => {
    try {
      const data = await getServices(activeTenantId)
      setServices(data)
    } catch (err) {
      console.error('Error loading services:', err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      if (showTenantOnboarding) {
        // 1. Register rich company metadata
        const companyData = {
          companyName,
          industry,
          companySize,
          employeeCount: parseInt(employees),
          freelancerCount: parseInt(freelancers),
          website,
          description: bizDesc
        }
        const tenant = await registerTenant(companyData)

        // 2. Link this user account to the new company
        await linkTenant(user.userId, tenant.schemaName)

        // 3. Update local user state
        const updatedUser = { ...user, tenantId: tenant.schemaName }
        setUser(updatedUser)
        setActiveTenantId(tenant.schemaName)

        setSuccess(`Enterprise schema "${tenant.schemaName}" provisioned. Welcome to ${companyName}!`)
        setShowTenantOnboarding(false)
        loadRegisteredTenants()
      } else if (showServiceForm) {
        await logService(activeTenantId, {
          serviceName,
          serviceType,
          description: serviceDesc
        })
        setSuccess('Business service logged successfully.')
        setServiceName('')
        setServiceDesc('')
        setShowServiceForm(false)
        loadTenantServices()
      } else {
        if (isLogin) {
          const data = await login(email, password)
          localStorage.setItem('token', data.token)
          setUser(data)
          setSuccess('Authentication successful')

          if (data.tenantId) {
            setActiveTenantId(data.tenantId)
          } else {
            setShowTenantOnboarding(true)
          }
        } else {
          await register(email, password)
          setSuccess('Account created. You can now sign in.')
          setIsLogin(true)
          setPassword('')
        }
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
    setShowTenantOnboarding(false)
    setShowServiceForm(false)
    setServices([])
    setRegisteredTenants([])
    setActiveTenantId('')
  }

  if (user) {
    return (
      <div className="mnc-layout">
        <aside className="branding-side">
          <div className="branding-content">
            <div className="logo-wrapper">
              <Logo />
              <span className="logo-text">WorkLedger Hub</span>
            </div>
            <h1 className="hero-heading">{showServiceForm ? 'Service' : 'Workspace'}<br />Management</h1>
            <p className="hero-subtext">Operating {activeTenantId ? `as [${activeTenantId}]` : 'in Global Mode'}</p>

            <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {!activeTenantId && !showTenantOnboarding && (
                <button
                  className="mnc-btn"
                  style={{ background: 'var(--accent)' }}
                  onClick={() => { setShowTenantOnboarding(true); setShowServiceForm(false); setError(''); setSuccess(''); }}
                >
                  + Setup Business Profile
                </button>
              )}

              {activeTenantId && (
                <button
                  className="mnc-btn"
                  style={{ background: 'transparent', border: '1px solid var(--accent)', color: 'var(--accent)' }}
                  onClick={() => { setShowServiceForm(!showServiceForm); setShowTenantOnboarding(false); setError(''); setSuccess(''); }}
                >
                  {showServiceForm ? '← View Services' : '+ Log New Service'}
                </button>
              )}
            </div>
          </div>
        </aside>

        <main className="auth-side">
          <div className="auth-form-container">
            {success && <div className="status-box success" style={{ marginBottom: '1.5rem' }}>🎉 {success}</div>}
            {error && <div className="status-box error" style={{ marginBottom: '1.5rem' }}>⚠️ {error}</div>}

            {showTenantOnboarding ? (
              <>
                <div className="auth-header" style={{ marginBottom: '2rem' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0.5rem' }}>Zoho-Style Setup Wizard</div>
                  <h2>Onboard Your Company</h2>
                  <p>Initialize your private enterprise environment and analytics.</p>
                </div>
                <form onSubmit={handleSubmit} className="form-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div className="input-container" style={{ gridColumn: 'span 2' }}>
                    <label>Company Legal Name</label>
                    <input type="text" className="mnc-input" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="e.g. Acme Corp" required />
                  </div>
                  <div className="input-container">
                    <label>Industry Category</label>
                    <input type="text" className="mnc-input" value={industry} onChange={e => setIndustry(e.target.value)} placeholder="e.g. Technology" required />
                  </div>
                  <div className="input-container">
                    <label>Website</label>
                    <input type="url" className="mnc-input" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://" />
                  </div>
                  <div className="input-container">
                    <label>Company Size</label>
                    <select className="mnc-input" value={companySize} onChange={e => setCompanySize(e.target.value)} style={{ appearance: 'none' }}>
                      <option>1-10</option>
                      <option>11-50</option>
                      <option>51-200</option>
                      <option>201-500</option>
                      <option>500+</option>
                    </select>
                  </div>
                  <div className="input-container">
                    <label>Local Employees</label>
                    <input type="number" className="mnc-input" value={employees} onChange={e => setEmployees(e.target.value)} required />
                  </div>
                  <div className="input-container">
                    <label>Freelancers / Contractors</label>
                    <input type="number" className="mnc-input" value={freelancers} onChange={e => setFreelancers(e.target.value)} required />
                  </div>
                  <div className="input-container" style={{ gridColumn: 'span 2' }}>
                    <label>Brief Business Description</label>
                    <textarea className="mnc-input" value={bizDesc} onChange={e => setBizDesc(e.target.value)} style={{ minHeight: '80px' }}></textarea>
                  </div>
                  <button type="submit" className="mnc-btn" style={{ gridColumn: 'span 2' }} disabled={loading}>Initialize Enterprise Workspace</button>
                </form>
              </>
            ) : showServiceForm ? (
              <>
                <div className="auth-header">
                  <h2>Log Business Activity</h2>
                  <p>Recording in schema: <strong>{activeTenantId}</strong></p>
                </div>
                <form onSubmit={handleSubmit} className="form-stack">
                  <div className="input-container">
                    <label>Service/Project Name</label>
                    <input type="text" className="mnc-input" value={serviceName} onChange={e => setServiceName(e.target.value)} required />
                  </div>
                  <div className="input-container">
                    <label>Category (Custom Input)</label>
                    <input
                      type="text"
                      className="mnc-input"
                      value={serviceType}
                      onChange={e => setServiceType(e.target.value)}
                      placeholder="e.g. Website Mockup, SEO Audit"
                      required
                    />
                  </div>
                  <div className="input-container">
                    <label>Notes (Optional)</label>
                    <textarea className="mnc-input" value={serviceDesc} onChange={e => setServiceDesc(e.target.value)} style={{ minHeight: '100px' }}></textarea>
                  </div>
                  <button type="submit" className="mnc-btn" disabled={loading}>Log Implementation</button>
                </form>
              </>
            ) : (
              <>
                <div className="auth-header">
                  <h2>{activeTenantId ? 'Business Workspace' : 'Setup Required'}</h2>
                  <p>{activeTenantId ? `Authenticated Workspace: [${activeTenantId}]` : `Welcome ${user.email}, let's setup your company.`}</p>
                </div>

                {activeTenantId && (
                  <div className="analytics-overview" style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1rem',
                    marginBottom: '2rem',
                    padding: '1.5rem',
                    background: 'rgba(99, 102, 241, 0.05)',
                    borderRadius: '16px',
                    border: '1px solid rgba(99, 102, 241, 0.1)'
                  }}>
                    <div className="stat-card">
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginBottom: '0.25rem' }}>Total Workforce</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent)' }}>
                        {parseInt(employees) + parseInt(freelancers)}
                      </div>
                    </div>
                    <div className="stat-card">
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginBottom: '0.25rem' }}>Service Category</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>{industry}</div>
                    </div>
                    <div style={{ gridColumn: 'span 2', marginTop: '0.5rem', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
                      <div style={{ width: `${(employees / (parseInt(employees) + parseInt(freelancers) || 1)) * 100}%`, background: 'var(--accent)' }}></div>
                      <div style={{ width: `${(freelancers / (parseInt(employees) + parseInt(freelancers) || 1)) * 100}%`, background: '#A855F7' }}></div>
                    </div>
                    <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-dim)' }}>
                      <span>● Employees ({employees})</span>
                      <span>● Freelancers ({freelancers})</span>
                    </div>
                  </div>
                )}

                {activeTenantId ? (
                  <div className="services-grid" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '400px', overflowY: 'auto' }}>
                    <div className="section-title" style={{ fontSize: '0.8rem', fontWeight: '600', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '1px' }}>Service Implementation Ledger</div>
                    {services.length === 0 ? (
                      <p style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '2rem' }}>No implementations recorded yet.</p>
                    ) : (
                      services.map(s => (
                        <div key={s.id} style={{ border: '1px solid rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.02)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ fontWeight: '600', color: 'var(--accent)' }}>{s.serviceName}</span>
                            <span style={{ fontSize: '0.7rem', padding: '2px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>{s.serviceType}</span>
                          </div>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>{s.description || 'No description provided.'}</p>
                          <div style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)' }}>
                            Status: {s.status} • Implementation ID: {s.id}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="status-box error" style={{ padding: '2rem', textAlign: 'center' }}>
                    <p>No business profile detected for this account.</p>
                    <button className="mnc-btn" style={{ marginTop: '1rem' }} onClick={() => setShowTenantOnboarding(true)}>Initialize Setup</button>
                  </div>
                )}

                <button onClick={handleLogout} className="mnc-btn" style={{ width: '100%', marginTop: '2rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)' }}>Sign Out Securely</button>
              </>
            )}
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

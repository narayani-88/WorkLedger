import { useState, useEffect } from 'react'
import { login, register, linkTenant } from './api/auth'
import { registerTenant, listTenants, getTenantProfile } from './api/tenant'
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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [user, setUser] = useState(null)
  const [showTenantOnboarding, setShowTenantOnboarding] = useState(false)
  const [wizardStep, setWizardStep] = useState(1)

  // Company Info (Step 1)
  const [companyName, setCompanyName] = useState('')
  const [industry, setIndustry] = useState('')
  const [companySize, setCompanySize] = useState('1-10')
  const [website, setWebsite] = useState('')

  // Location & Contact (Step 2)
  const [country, setCountry] = useState('')
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')

  // Business Details (Step 3)
  const [employees, setEmployees] = useState(0)
  const [freelancers, setFreelancers] = useState(0)
  const [foundingYear, setFoundingYear] = useState('')
  const [revenueRange, setRevenueRange] = useState('0-100K')
  const [bizDesc, setBizDesc] = useState('')
  const [servicesOffered, setServicesOffered] = useState([])
  const [serviceInput, setServiceInput] = useState('')

  // Service Logging State
  const [services, setServices] = useState([])
  const [showServiceForm, setShowServiceForm] = useState(false)
  const [serviceName, setServiceName] = useState('')
  const [serviceType, setServiceType] = useState('Website Mockup')
  const [serviceDesc, setServiceDesc] = useState('')

  // Tenant State
  const [activeTenantId, setActiveTenantId] = useState('')
  const [tenantProfile, setTenantProfile] = useState(null)
  const [registeredTenants, setRegisteredTenants] = useState([])

  useEffect(() => {
    if (user) {
      loadRegisteredTenants()
    }
  }, [user])

  useEffect(() => {
    if (user && activeTenantId) {
      loadTenantServices()
      loadTenantProfile()
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

  const loadTenantProfile = async () => {
    try {
      const profile = await getTenantProfile(activeTenantId.replace('tenant_', ''))
      setTenantProfile(profile)
    } catch (err) {
      console.error('Error loading tenant profile:', err)
    }
  }

  const addService = () => {
    if (serviceInput.trim()) {
      setServicesOffered([...servicesOffered, serviceInput.trim()])
      setServiceInput('')
    }
  }

  const removeService = (index) => {
    setServicesOffered(servicesOffered.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      if (showTenantOnboarding && wizardStep < 4) {
        // Navigate wizard steps
        setWizardStep(wizardStep + 1)
        setLoading(false)
        return
      }

      if (showTenantOnboarding && wizardStep === 4) {
        // Final submission
        const companyData = {
          companyName,
          industry,
          companySize,
          website,
          country,
          city,
          address,
          contactEmail,
          contactPhone,
          employeeCount: parseInt(employees) || 0,
          freelancerCount: parseInt(freelancers) || 0,
          foundingYear: parseInt(foundingYear) || null,
          revenueRange,
          description: bizDesc,
          servicesOffered: servicesOffered.join(', ')
        }
        const tenant = await registerTenant(companyData)

        await linkTenant(user.userId, tenant.schemaName)

        const updatedUser = { ...user, tenantId: tenant.schemaName }
        setUser(updatedUser)
        setActiveTenantId(tenant.schemaName)

        setSuccess(`Enterprise schema "${tenant.schemaName}" provisioned. Welcome to ${companyName}!`)
        setShowTenantOnboarding(false)
        setWizardStep(1)
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
    setTenantProfile(null)
    setWizardStep(1)
  }

  const renderWizardStep = () => {
    switch (wizardStep) {
      case 1:
        return (
          <>
            <div className="wizard-header">
              <div className="step-indicator">Step 1 of 4</div>
              <h2>Company Information</h2>
              <p>Tell us about your organization</p>
            </div>
            <div className="form-stack">
              <div className="input-container">
                <label>Company Legal Name *</label>
                <input type="text" className="mnc-input" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="e.g. Acme Corp" required />
              </div>
              <div className="input-container">
                <label>Industry Category *</label>
                <input type="text" className="mnc-input" value={industry} onChange={e => setIndustry(e.target.value)} placeholder="e.g. Technology, Healthcare" required />
              </div>
              <div className="input-container">
                <label>Company Size *</label>
                <select className="mnc-input" value={companySize} onChange={e => setCompanySize(e.target.value)}>
                  <option>1-10</option>
                  <option>11-50</option>
                  <option>51-200</option>
                  <option>201-500</option>
                  <option>500+</option>
                </select>
              </div>
              <div className="input-container">
                <label>Website</label>
                <input type="url" className="mnc-input" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://" />
              </div>
            </div>
          </>
        )
      case 2:
        return (
          <>
            <div className="wizard-header">
              <div className="step-indicator">Step 2 of 4</div>
              <h2>Location & Contact</h2>
              <p>Where are you based?</p>
            </div>
            <div className="form-stack">
              <div className="input-container">
                <label>Country *</label>
                <input type="text" className="mnc-input" value={country} onChange={e => setCountry(e.target.value)} placeholder="e.g. United States" required />
              </div>
              <div className="input-container">
                <label>City *</label>
                <input type="text" className="mnc-input" value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. San Francisco" required />
              </div>
              <div className="input-container">
                <label>Address</label>
                <input type="text" className="mnc-input" value={address} onChange={e => setAddress(e.target.value)} placeholder="Street address" />
              </div>
              <div className="input-container">
                <label>Contact Email *</label>
                <input type="email" className="mnc-input" value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="contact@company.com" required />
              </div>
              <div className="input-container">
                <label>Contact Phone</label>
                <input type="tel" className="mnc-input" value={contactPhone} onChange={e => setContactPhone(e.target.value)} placeholder="+1 (555) 000-0000" />
              </div>
            </div>
          </>
        )
      case 3:
        return (
          <>
            <div className="wizard-header">
              <div className="step-indicator">Step 3 of 4</div>
              <h2>Business Details</h2>
              <p>Help us understand your operations</p>
            </div>
            <div className="form-stack">
              <div className="input-container">
                <label>Number of Employees *</label>
                <input type="number" className="mnc-input" value={employees} onChange={e => setEmployees(e.target.value)} required />
              </div>
              <div className="input-container">
                <label>Freelancers / Contractors *</label>
                <input type="number" className="mnc-input" value={freelancers} onChange={e => setFreelancers(e.target.value)} required />
              </div>
              <div className="input-container">
                <label>Founding Year</label>
                <input type="number" className="mnc-input" value={foundingYear} onChange={e => setFoundingYear(e.target.value)} placeholder="e.g. 2020" />
              </div>
              <div className="input-container">
                <label>Annual Revenue Range</label>
                <select className="mnc-input" value={revenueRange} onChange={e => setRevenueRange(e.target.value)}>
                  <option>0-100K</option>
                  <option>100K-1M</option>
                  <option>1M-10M</option>
                  <option>10M+</option>
                </select>
              </div>
              <div className="input-container">
                <label>Services Offered</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    className="mnc-input"
                    value={serviceInput}
                    onChange={e => setServiceInput(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addService())}
                    placeholder="Type and press Enter"
                  />
                  <button type="button" onClick={addService} className="mnc-btn" style={{ padding: '0 1.5rem' }}>Add</button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {servicesOffered.map((service, idx) => (
                    <span key={idx} className="service-badge">
                      {service}
                      <button type="button" onClick={() => removeService(idx)} style={{ marginLeft: '0.5rem', cursor: 'pointer', background: 'none', border: 'none', color: 'inherit' }}>×</button>
                    </span>
                  ))}
                </div>
              </div>
              <div className="input-container">
                <label>Business Description</label>
                <textarea className="mnc-input" value={bizDesc} onChange={e => setBizDesc(e.target.value)} style={{ minHeight: '80px' }} placeholder="Brief description of your business"></textarea>
              </div>
            </div>
          </>
        )
      case 4:
        return (
          <>
            <div className="wizard-header">
              <div className="step-indicator">Step 4 of 4</div>
              <h2>Review & Confirm</h2>
              <p>Please review your information</p>
            </div>
            <div className="review-section">
              <div className="review-group">
                <h4>Company Information</h4>
                <p><strong>Name:</strong> {companyName}</p>
                <p><strong>Industry:</strong> {industry}</p>
                <p><strong>Size:</strong> {companySize}</p>
                {website && <p><strong>Website:</strong> {website}</p>}
              </div>
              <div className="review-group">
                <h4>Location & Contact</h4>
                <p><strong>Location:</strong> {city}, {country}</p>
                {address && <p><strong>Address:</strong> {address}</p>}
                <p><strong>Email:</strong> {contactEmail}</p>
                {contactPhone && <p><strong>Phone:</strong> {contactPhone}</p>}
              </div>
              <div className="review-group">
                <h4>Business Details</h4>
                <p><strong>Workforce:</strong> {employees} employees, {freelancers} freelancers</p>
                {foundingYear && <p><strong>Founded:</strong> {foundingYear}</p>}
                <p><strong>Revenue:</strong> {revenueRange}</p>
                {servicesOffered.length > 0 && <p><strong>Services:</strong> {servicesOffered.join(', ')}</p>}
              </div>
            </div>
          </>
        )
      default:
        return null
    }
  }

  if (user) {
    return (
      <div className={`mnc-layout ${user ? 'dashboard-mode' : ''}`}>
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
                <div className="wizard-progress">
                  {[1, 2, 3, 4].map(step => (
                    <div key={step} className={`progress-step ${wizardStep >= step ? 'active' : ''}`}></div>
                  ))}
                </div>
                <form onSubmit={handleSubmit}>
                  {renderWizardStep()}
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                    {wizardStep > 1 && (
                      <button type="button" onClick={() => setWizardStep(wizardStep - 1)} className="mnc-btn" style={{ flex: 1, background: 'transparent', border: '1px solid rgba(255,255,255,0.2)' }}>
                        ← Back
                      </button>
                    )}
                    <button type="submit" className="mnc-btn" style={{ flex: 1 }} disabled={loading}>
                      {wizardStep === 4 ? 'Create Workspace' : 'Next →'}
                    </button>
                  </div>
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
                  <h2>{activeTenantId ? 'Business Dashboard' : 'Setup Required'}</h2>
                  <p>{activeTenantId ? `Workspace: [${activeTenantId}]` : `Welcome ${user.email}, let's setup your company.`}</p>
                </div>

                {activeTenantId && tenantProfile ? (
                  <div className="comprehensive-dashboard">
                    {/* Company Overview Card */}
                    <div className="dashboard-card company-overview">
                      <div className="card-header">
                        <h3>🏢 Company Profile</h3>
                      </div>
                      <div className="profile-grid">
                        <div className="profile-item">
                          <span className="label">Company</span>
                          <span className="value">{tenantProfile.companyName}</span>
                        </div>
                        <div className="profile-item">
                          <span className="label">Industry</span>
                          <span className="value">{tenantProfile.industry}</span>
                        </div>
                        <div className="profile-item">
                          <span className="label">Location</span>
                          <span className="value">{tenantProfile.city}, {tenantProfile.country}</span>
                        </div>
                        <div className="profile-item">
                          <span className="label">Size</span>
                          <span className="value">{tenantProfile.companySize} employees</span>
                        </div>
                        {tenantProfile.website && (
                          <div className="profile-item">
                            <span className="label">Website</span>
                            <span className="value"><a href={tenantProfile.website} target="_blank" rel="noopener noreferrer">{tenantProfile.website}</a></span>
                          </div>
                        )}
                        {tenantProfile.contactEmail && (
                          <div className="profile-item">
                            <span className="label">Contact</span>
                            <span className="value">{tenantProfile.contactEmail}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Workforce Analytics */}
                    <div className="dashboard-card workforce-analytics">
                      <div className="card-header">
                        <h3>👥 Workforce Analytics</h3>
                      </div>
                      <div className="stats-grid">
                        <div className="stat-box">
                          <div className="stat-value">{tenantProfile.employeeCount + tenantProfile.freelancerCount}</div>
                          <div className="stat-label">Total Workforce</div>
                        </div>
                        <div className="stat-box">
                          <div className="stat-value">{tenantProfile.employeeCount}</div>
                          <div className="stat-label">Employees</div>
                        </div>
                        <div className="stat-box">
                          <div className="stat-value">{tenantProfile.freelancerCount}</div>
                          <div className="stat-label">Freelancers</div>
                        </div>
                      </div>
                      <div className="progress-bar-container">
                        <div className="progress-bar">
                          <div className="progress-fill employees" style={{ width: `${(tenantProfile.employeeCount / (tenantProfile.employeeCount + tenantProfile.freelancerCount || 1)) * 100}%` }}></div>
                          <div className="progress-fill freelancers" style={{ width: `${(tenantProfile.freelancerCount / (tenantProfile.employeeCount + tenantProfile.freelancerCount || 1)) * 100}%` }}></div>
                        </div>
                        <div className="progress-legend">
                          <span>● Employees ({tenantProfile.employeeCount})</span>
                          <span>● Freelancers ({tenantProfile.freelancerCount})</span>
                        </div>
                      </div>
                    </div>

                    {/* Services Offered */}
                    {tenantProfile.servicesOffered && (
                      <div className="dashboard-card services-offered">
                        <div className="card-header">
                          <h3>🎯 Services Offered</h3>
                        </div>
                        <div className="services-badges">
                          {tenantProfile.servicesOffered.split(',').map((service, idx) => (
                            <span key={idx} className="service-badge">{service.trim()}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Financial Overview */}
                    <div className="dashboard-card financial-overview">
                      <div className="card-header">
                        <h3>💰 Financial Overview</h3>
                      </div>
                      <div className="stats-grid">
                        <div className="stat-box">
                          <div className="stat-value">{tenantProfile.revenueRange}</div>
                          <div className="stat-label">Annual Revenue</div>
                        </div>
                        {tenantProfile.foundingYear && (
                          <div className="stat-box">
                            <div className="stat-value">{new Date().getFullYear() - tenantProfile.foundingYear}</div>
                            <div className="stat-label">Years in Business</div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Active Projects */}
                    <div className="dashboard-card active-projects">
                      <div className="card-header">
                        <h3>📊 Active Implementations</h3>
                        <span className="badge">{services.length}</span>
                      </div>
                      {services.length === 0 ? (
                        <div className="empty-state">
                          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏗️</div>
                          <p>No implementations yet</p>
                          <button className="mnc-btn" onClick={() => setShowServiceForm(true)} style={{ marginTop: '1rem' }}>Create First Project</button>
                        </div>
                      ) : (
                        <div className="services-list">
                          {services.map(s => (
                            <div key={s.id} className="service-item">
                              <div className="service-header">
                                <span className="service-name">{s.serviceName}</span>
                                <span className="service-type-badge">{s.serviceType}</span>
                              </div>
                              <p className="service-description">{s.description || 'No description'}</p>
                              <div className="service-footer">
                                <span className="service-id">ID: {s.id}</span>
                                <span className={`status-badge ${s.status.toLowerCase()}`}>{s.status}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : activeTenantId ? (
                  <div className="empty-state">
                    <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⏳</div>
                    <h3>Loading Profile...</h3>
                  </div>
                ) : (
                  <div className="empty-state">
                    <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🏢</div>
                    <h3>Setup Required</h3>
                    <p style={{ maxWidth: '300px', margin: '0.5rem auto 1.5rem', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                      To access the management dashboard, you must first onboard your enterprise profile.
                    </p>
                    <button className="mnc-btn" onClick={() => setShowTenantOnboarding(true)}>Initialize Setup</button>
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

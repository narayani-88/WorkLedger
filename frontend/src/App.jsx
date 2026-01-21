import { useState, useEffect } from 'react'
import { login, register, registerEmployee, linkTenant } from './api/auth'
import { registerTenant, listTenants, getTenantProfile } from './api/tenant'
import { getServices, logService } from './api/core'
import { getEmployees, createEmployee, updateEmployee, deleteEmployee, getEmployeeAnalytics } from './api/employee'
import { getProjects, createProject, updateProject, deleteProject, getProjectAnalytics, getActiveProjects } from './api/project'
import { getTasks, getTasksByAssignee, createTask, updateTask } from './api/task'
import { logTime, getLogsByEmployee, getLogsByProject } from './api/timeLog'

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
  // Auth state
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [user, setUser] = useState(null)

  // Navigation
  const [currentPage, setCurrentPage] = useState('dashboard')

  // Tenant state
  const [showTenantOnboarding, setShowTenantOnboarding] = useState(false)
  const [wizardStep, setWizardStep] = useState(1)
  const [activeTenantId, setActiveTenantId] = useState('')
  const [tenantProfile, setTenantProfile] = useState(null)

  // Onboarding fields
  const [companyName, setCompanyName] = useState('')
  const [industry, setIndustry] = useState('')
  const [companySize, setCompanySize] = useState('1-10')
  const [website, setWebsite] = useState('')
  const [country, setCountry] = useState('')
  const [city, setCity] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [employees, setEmployees] = useState(0)
  const [freelancers, setFreelancers] = useState(0)

  // Data state
  const [employeeList, setEmployeeList] = useState([])
  const [services, setServices] = useState([])
  const [projects, setProjects] = useState([])
  const [activeProjectsDetailed, setActiveProjectsDetailed] = useState([])
  const [employeeAnalytics, setEmployeeAnalytics] = useState(null)
  const [projectAnalytics, setProjectAnalytics] = useState(null)

  // Form state
  const [showEmployeeForm, setShowEmployeeForm] = useState(false)
  const [showServiceForm, setShowServiceForm] = useState(false)
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState(null)
  const [editingProject, setEditingProject] = useState(null)

  // Employee form
  const [empName, setEmpName] = useState('')
  const [empEmail, setEmpEmail] = useState('')
  const [empPosition, setEmpPosition] = useState('')
  const [empDepartment, setEmpDepartment] = useState('')
  const [empSalary, setEmpSalary] = useState('')
  const [empHireDate, setEmpHireDate] = useState('')
  const [empCreateAccount, setEmpCreateAccount] = useState(false)
  const [empPassword, setEmpPassword] = useState('')

  // Service form
  const [serviceName, setServiceName] = useState('')
  const [serviceType, setServiceType] = useState('')
  const [serviceDesc, setServiceDesc] = useState('')

  // Project form
  const [projName, setProjName] = useState('')
  const [projServiceId, setProjServiceId] = useState('')
  const [projStatus, setProjStatus] = useState('PLANNING')
  const [projBudget, setProjBudget] = useState('')
  const [projStartDate, setProjStartDate] = useState('')
  const [projDesc, setProjDesc] = useState('')
  const [projEmployees, setProjEmployees] = useState([])

  // Task & Time state
  const [taskList, setTaskList] = useState([])
  const [myTasks, setMyTasks] = useState([])
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDesc, setTaskDesc] = useState('')
  const [taskPriority, setTaskPriority] = useState('MEDIUM')
  const [taskDueDate, setTaskDueDate] = useState('')
  const [taskProjectId, setTaskProjectId] = useState('')
  const [taskAssigneeId, setTaskAssigneeId] = useState('')

  const [showLogTimeModal, setShowLogTimeModal] = useState(false)
  const [logHours, setLogHours] = useState('')
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0])
  const [logDesc, setLogDesc] = useState('')
  const [selectedTaskId, setSelectedTaskId] = useState('')
  const [selectedProjectId, setSelectedProjectId] = useState('')

  useEffect(() => {
    if (user && activeTenantId) {
      loadAllData()
      const role = (user.role || 'ADMIN').toUpperCase()
      if (role === 'EMPLOYEE' && currentPage === 'dashboard') {
        setCurrentPage('my-work')
      }
    }
  }, [user, activeTenantId])

  const loadAllData = async () => {
    try {
      const role = (user?.role || 'ADMIN').toUpperCase()
      await Promise.all([
        loadEmployees(),
        loadServices(),
        loadProjects(),
        loadActiveProjectsDetailed(),
        loadTenantProfile(),
        loadEmployeeAnalytics(),
        loadProjectAnalytics(),
        role === 'ADMIN' ? loadTasks() : loadMyTasks()
      ])
    } catch (err) {
      console.error('Error loading data:', err)
    }
  }

  const loadEmployees = async () => {
    try {
      const data = await getEmployees(activeTenantId)
      setEmployeeList(data)
    } catch (err) {
      console.error('Error loading employees:', err)
    }
  }

  const loadServices = async () => {
    try {
      const data = await getServices(activeTenantId)
      setServices(data)
    } catch (err) {
      console.error('Error loading services:', err)
    }
  }

  const loadProjects = async () => {
    try {
      const data = await getProjects(activeTenantId)
      console.log('Projects Loaded:', data)
      setProjects(data)
    } catch (err) {
      console.error('Error loading projects:', err)
    }
  }

  const loadActiveProjectsDetailed = async () => {
    try {
      const data = await getActiveProjects(activeTenantId)
      console.log('Active Projects Detailed Loaded:', data)
      setActiveProjectsDetailed(data)
    } catch (err) {
      console.error('Error loading active projects detailed:', err)
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

  const loadEmployeeAnalytics = async () => {
    try {
      const data = await getEmployeeAnalytics(activeTenantId)
      setEmployeeAnalytics(data)
    } catch (err) {
      console.error('Error loading employee analytics:', err)
    }
  }

  const loadProjectAnalytics = async () => {
    try {
      const data = await getProjectAnalytics(activeTenantId)
      setProjectAnalytics(data)
    } catch (err) {
      console.error('Error loading project analytics:', err)
    }
  }

  const loadTasks = async () => {
    try {
      const data = await getTasks(activeTenantId)
      setTaskList(data)
    } catch (err) {
      console.error('Error loading tasks:', err)
    }
  }

  const loadMyTasks = async () => {
    try {
      if (!user?.employeeId) return
      const data = await getTasksByAssignee(activeTenantId, user.employeeId)
      setMyTasks(data)
    } catch (err) {
      console.error('Error loading my tasks:', err)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      if (isLogin) {
        const trimmedEmail = email.trim()
        console.log('Attempting login with:', { email: trimmedEmail, passwordLength: password.length })
        const data = await login(trimmedEmail, password)
        console.log('Login Response Data:', data) // Diagnostic log
        localStorage.setItem('token', data.token)

        // If role is missing, default to ADMIN
        if (!data.role) {
          data.role = 'ADMIN'
          console.warn('Backend sent empty role. Defaulting to ADMIN.')
        }

        setUser(data)
        setSuccess('Authentication successful')

        if (data.tenantId) {
          setActiveTenantId(data.tenantId)
        } else {
          setShowTenantOnboarding(true)
        }
      } else {
        const trimmedEmail = email.trim()
        await register(trimmedEmail, password)
        setSuccess('Account created for ' + trimmedEmail + '. You can now sign in.')
        setIsLogin(true)
        setPassword('')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleTenantOnboarding = async (e) => {
    e.preventDefault()
    if (wizardStep < 3) {
      setWizardStep(wizardStep + 1)
      return
    }

    setLoading(true)
    setError('')

    try {
      const companyData = {
        companyName: companyName.trim(),
        industry: industry.trim(),
        companySize,
        website: website.trim(),
        country: country.trim(),
        city: city.trim(),
        contactEmail: contactEmail.trim(),
        employeeCount: parseInt(employees) || 0,
        freelancerCount: parseInt(freelancers) || 0
      }
      const tenant = await registerTenant(companyData)
      await linkTenant(user.userId, tenant.schemaName)

      const updatedUser = { ...user, tenantId: tenant.schemaName }
      setUser(updatedUser)
      setActiveTenantId(tenant.schemaName)

      setSuccess(`Workspace "${tenant.schemaName}" created successfully!`)
      setShowTenantOnboarding(false)
      setWizardStep(1)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEmployeeSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const empData = {
        name: empName.trim(),
        email: empEmail.trim(),
        position: empPosition.trim(),
        department: empDepartment.trim(),
        salary: parseFloat(empSalary),
        hireDate: empHireDate,
        status: 'ACTIVE'
      }

      if (editingEmployee) {
        await updateEmployee(activeTenantId, editingEmployee.id, empData)
        setSuccess('Employee updated successfully')
      } else {
        const emp = await createEmployee(activeTenantId, empData)
        setSuccess('Employee added successfully')

        // Handle account creation for employee
        if (empCreateAccount && emp.id) {
          try {
            console.log('Triggering account creation for:', empEmail)
            const trimmedEmail = empEmail.trim()
            const userAccount = await registerEmployee(trimmedEmail, empPassword, emp.id)
            console.log('Account created for user:', userAccount.id)
            await linkTenant(userAccount.id, activeTenantId)
            console.log('Tenant linked successfully')
            setSuccess(`Employee added and account created: ${trimmedEmail}`)
          } catch (accountErr) {
            console.error('Failed to create account:', accountErr)
            setError(`Employee added, but account creation failed: ${accountErr.message}`)
          }
        }
      }

      resetEmployeeForm()
      await loadEmployees()
      await loadEmployeeAnalytics()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleServiceSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await logService(activeTenantId, {
        serviceName,
        serviceType,
        description: serviceDesc
      })
      setSuccess('Service added successfully')
      resetServiceForm()
      await loadServices()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleProjectSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const projData = {
        projectName: projName,
        serviceId: parseInt(projServiceId),
        status: projStatus,
        budget: parseFloat(projBudget),
        startDate: projStartDate,
        description: projDesc,
        employees: projEmployees.map(id => ({ id: parseInt(id) }))
      }

      if (editingProject) {
        await updateProject(activeTenantId, editingProject.id, projData)
        setSuccess('Project updated successfully')
      } else {
        await createProject(activeTenantId, projData)
        setSuccess('Project created successfully')
      }

      resetProjectForm()
      await loadProjects()
      await loadProjectAnalytics()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteEmployee = async (id) => {
    if (!confirm('Are you sure you want to delete this employee?')) return

    try {
      await deleteEmployee(activeTenantId, id)
      setSuccess('Employee deleted')
      await loadEmployees()
      await loadEmployeeAnalytics()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDeleteProject = async (id) => {
    if (!confirm('Are you sure you want to delete this project?')) return

    try {
      await deleteProject(activeTenantId, id)
      setSuccess('Project deleted')
      await loadProjects()
      await loadProjectAnalytics()
    } catch (err) {
      setError(err.message)
    }
  }

  const resetEmployeeForm = () => {
    setEmpName('')
    setEmpEmail('')
    setEmpPosition('')
    setEmpDepartment('')
    setEmpSalary('')
    setEmpHireDate('')
    setEditingEmployee(null)
    setShowEmployeeForm(false)
  }

  const resetServiceForm = () => {
    setServiceName('')
    setServiceType('')
    setServiceDesc('')
    setShowServiceForm(false)
  }

  const resetProjectForm = () => {
    setProjName('')
    setProjServiceId('')
    setProjStatus('PLANNING')
    setProjBudget('')
    setProjStartDate('')
    setProjDesc('')
    setProjEmployees([])
    setEditingProject(null)
    setShowProjectForm(false)
  }

  const editEmployee = (emp) => {
    setEmpName(emp.name)
    setEmpEmail(emp.email)
    setEmpPosition(emp.position)
    setEmpDepartment(emp.department)
    setEmpSalary(emp.salary)
    setEmpHireDate(emp.hireDate)
    setEditingEmployee(emp)
    setShowEmployeeForm(true)
  }

  const editProject = (proj) => {
    setProjName(proj.projectName)
    setProjServiceId(proj.serviceId)
    setProjStatus(proj.status)
    setProjBudget(proj.budget)
    setProjStartDate(proj.startDate)
    setProjDesc(proj.description)
    setProjEmployees(proj.employees ? proj.employees.map(e => e.id) : [])
    setEditingProject(proj)
    setShowProjectForm(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setUser(null)
    setActiveTenantId('')
    setCurrentPage('dashboard')
    setEmail('')
    setPassword('')
    setSuccess('Signed out')
  }

  const renderWizardStep = () => {
    switch (wizardStep) {
      case 1:
        return (
          <>
            <h3>Company Information</h3>
            <div className="input-container">
              <label>Company Name *</label>
              <input type="text" className="mnc-input" value={companyName} onChange={e => setCompanyName(e.target.value)} required />
            </div>
            <div className="input-container">
              <label>Industry *</label>
              <input type="text" className="mnc-input" value={industry} onChange={e => setIndustry(e.target.value)} required />
            </div>
            <div className="input-container">
              <label>Company Size</label>
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
              <input type="url" className="mnc-input" value={website} onChange={e => setWebsite(e.target.value)} />
            </div>
          </>
        )
      case 2:
        return (
          <>
            <h3>Location & Contact</h3>
            <div className="input-container">
              <label>Country *</label>
              <input type="text" className="mnc-input" value={country} onChange={e => setCountry(e.target.value)} required />
            </div>
            <div className="input-container">
              <label>City *</label>
              <input type="text" className="mnc-input" value={city} onChange={e => setCity(e.target.value)} required />
            </div>
            <div className="input-container">
              <label>Contact Email *</label>
              <input type="email" className="mnc-input" value={contactEmail} onChange={e => setContactEmail(e.target.value)} required />
            </div>
          </>
        )
      case 3:
        return (
          <>
            <h3>Team Size</h3>
            <div className="input-container">
              <label>Employees *</label>
              <input type="number" className="mnc-input" value={employees} onChange={e => setEmployees(e.target.value)} required />
            </div>
            <div className="input-container">
              <label>Freelancers *</label>
              <input type="number" className="mnc-input" value={freelancers} onChange={e => setFreelancers(e.target.value)} required />
            </div>
          </>
        )
    }
  }

  const renderDashboard = () => (
    <div className="page-content">
      <h2>Dashboard Overview</h2>
      {success && <div className="status-box success">{success}</div>}
      {error && <div className="status-box error">{error}</div>}

      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-label">Total Employees</div>
          <div className="stat-value">{employeeAnalytics?.totalEmployees || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Projects</div>
          <div className="stat-value">{projects.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Monthly Payroll</div>
          <div className="stat-value">${employeeAnalytics?.totalPayroll || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Budget</div>
          <div className="stat-value">${projectAnalytics?.totalBudget || 0}</div>
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="section">
          <h3>Recent Employees</h3>
          {employeeList.slice(0, 5).map(emp => (
            <div key={emp.id} className="list-item">
              <span>{emp.name} - {emp.position}</span>
              <span className="badge">{emp.department}</span>
            </div>
          ))}
        </div>

        <div className="section">
          <h3>Recent Projects</h3>
          {projects.slice(0, 5).map(proj => (
            <div key={proj.id} className="list-item">
              <span>{proj.projectName}</span>
              <span className="badge">{proj.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderTeams = () => (
    <div className="page-content">
      <div className="page-header">
        <h2>Team Management</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="mnc-btn" onClick={() => setCurrentPage('projects')}>Manage Projects</button>
          <button className="mnc-btn" onClick={() => setCurrentPage('employees')}>Register Employee</button>
        </div>
      </div>

      {success && <div className="status-box success">{success}</div>}
      {error && <div className="status-box error">{error}</div>}

      <div className="comprehensive-dashboard" style={{ marginTop: '2rem' }}>
        <div className="dashboard-card company-overview" style={{ gridColumn: 'span 3' }}>
          <div className="card-header">
            <h3>Project Workforce Insights</h3>
            <span className="badge">LIVE DATA</span>
          </div>
          <p className="hero-subtext" style={{ fontSize: '0.9rem', marginBottom: '2rem' }}>
            Detailed breakdown of team payroll, member allocation, and project budget utilization.
          </p>

          <div className="services-list" style={{ maxHeight: 'none' }}>
            {activeProjectsDetailed.length === 0 && <p className="empty-text">No active projects found. Set a project to ACTIVE to see it here.</p>}
            {activeProjectsDetailed.map(proj => (
              <div key={proj.id} className="insight-item" style={{ background: 'rgba(255,255,255,0.02)', padding: '2rem' }}>
                <div className="insight-left" style={{ flex: 2 }}>
                  <h3 style={{ margin: 0, color: 'var(--primary)', fontSize: '1.5rem' }}>{proj.projectName}</h3>
                  <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>{proj.description || 'No description provided'}</p>

                  <div className="insight-meta" style={{ marginTop: '1.5rem' }}>
                    <div className="stat-box" style={{ background: 'rgba(99, 102, 241, 0.05)', padding: '1rem' }}>
                      <div className="stat-value">{proj.employees?.length || 0}</div>
                      <div className="stat-label">Members</div>
                    </div>
                    <div className="stat-box" style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '1rem' }}>
                      <div className="stat-value">${proj.totalTeamPayroll || 0}</div>
                      <div className="stat-label">Team Payroll</div>
                    </div>
                    <div className="stat-box" style={{ background: 'rgba(14, 165, 233, 0.05)', padding: '1rem' }}>
                      <div className="stat-value">${proj.budget}</div>
                      <div className="stat-label">Project Budget</div>
                    </div>
                  </div>

                  <div style={{ marginTop: '1.5rem' }}>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>Assigned Team:</h4>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {proj.employees?.length > 0 ? proj.employees.map(e => (
                        <span key={e.id} className="meta-tag" style={{ padding: '4px 12px', borderRadius: '20px' }}>
                          {e.name} ({e.position})
                        </span>
                      )) : <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>No members assigned yet</span>}
                    </div>
                  </div>
                </div>

                <div className="insight-right" style={{ flex: 1, borderLeft: '1px solid var(--border-light)', paddingLeft: '2rem' }}>
                  <div className="stat-box" style={{ marginBottom: '1rem', border: 'none', textAlign: 'right' }}>
                    <div className="stat-label">Budget Spent</div>
                    <div className="stat-value" style={{ color: 'var(--success)', fontSize: '1.5rem' }}>${proj.spent}</div>
                  </div>
                  <div className="progress-bar-container">
                    <div className="progress-legend">
                      <span>Utilization</span>
                      <span>{proj.budget > 0 ? Math.round((proj.spent / proj.budget) * 100) : 0}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill employees" style={{ width: `${proj.budget > 0 ? (proj.spent / proj.budget) * 100 : 0}%` }}></div>
                    </div>
                  </div>
                  <button className="mnc-btn" style={{ width: '100%', marginTop: '2rem' }} onClick={() => editProject(proj)}>
                    Update Team / Edit Project
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  const renderEmployees = () => (
    <div className="page-content">
      <div className="page-header">
        <h2>Employee Management</h2>
        <button className="mnc-btn" onClick={() => setShowEmployeeForm(true)}>+ Add Employee</button>
      </div>

      {success && <div className="status-box success">{success}</div>}
      {error && <div className="status-box error">{error}</div>}

      {showEmployeeForm && (
        <div className="modal-overlay" onClick={() => resetEmployeeForm()}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>{editingEmployee ? 'Edit Employee' : 'Add Employee'}</h3>
            <form onSubmit={handleEmployeeSubmit} className="form-stack">
              <div className="input-container">
                <label>Name *</label>
                <input type="text" className="mnc-input" value={empName} onChange={e => setEmpName(e.target.value)} required />
              </div>
              <div className="input-container">
                <label>Email *</label>
                <input type="email" className="mnc-input" value={empEmail} onChange={e => setEmpEmail(e.target.value)} required />
              </div>
              <div className="input-container">
                <label>Position</label>
                <input type="text" className="mnc-input" value={empPosition} onChange={e => setEmpPosition(e.target.value)} />
              </div>
              <div className="input-container">
                <label>Department</label>
                <input type="text" className="mnc-input" value={empDepartment} onChange={e => setEmpDepartment(e.target.value)} />
              </div>
              <div className="input-container">
                <label>Salary</label>
                <input type="number" className="mnc-input" value={empSalary} onChange={e => setEmpSalary(e.target.value)} />
              </div>
              <div className="input-container">
                <label>Hire Date</label>
                <input type="date" className="mnc-input" value={empHireDate} onChange={e => setEmpHireDate(e.target.value)} />
              </div>
              {!editingEmployee && (
                <div className="section" style={{ border: '1px solid var(--border-light)', padding: '1rem', marginTop: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={empCreateAccount} onChange={e => setEmpCreateAccount(e.target.checked)} />
                    Create login account for this employee?
                  </label>
                  {empCreateAccount && (
                    <div className="input-container" style={{ marginTop: '1rem' }}>
                      <label>Set Password</label>
                      <input type="password" title="At least 6 characters" className="mnc-input" value={empPassword} onChange={e => setEmpPassword(e.target.value)} minLength={6} required />
                      <small style={{ color: 'var(--text-dim)' }}>Employee will log in using their email and this password.</small>
                    </div>
                  )}
                </div>
              )}
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="mnc-btn" disabled={loading}>Save</button>
                <button type="button" className="mnc-btn" onClick={resetEmployeeForm} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Position</th>
              <th>Department</th>
              <th>Salary</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employeeList.map(emp => (
              <tr key={emp.id}>
                <td>{emp.name}</td>
                <td>{emp.email}</td>
                <td>{emp.position}</td>
                <td>{emp.department}</td>
                <td>${emp.salary}</td>
                <td><span className="badge">{emp.status}</span></td>
                <td>
                  <button className="btn-small" onClick={() => editEmployee(emp)}>Edit</button>
                  <button className="btn-small btn-danger" onClick={() => handleDeleteEmployee(emp.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderServices = () => (
    <div className="page-content">
      <div className="page-header">
        <h2>Service Management</h2>
        <button className="mnc-btn" onClick={() => setShowServiceForm(true)}>+ Add Service</button>
      </div>

      {success && <div className="status-box success">{success}</div>}
      {error && <div className="status-box error">{error}</div>}

      {showServiceForm && (
        <div className="modal-overlay" onClick={() => resetServiceForm()}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Add Service</h3>
            <form onSubmit={handleServiceSubmit} className="form-stack">
              <div className="input-container">
                <label>Service Name *</label>
                <input type="text" className="mnc-input" value={serviceName} onChange={e => setServiceName(e.target.value)} required />
              </div>
              <div className="input-container">
                <label>Service Type *</label>
                <input type="text" className="mnc-input" value={serviceType} onChange={e => setServiceType(e.target.value)} required />
              </div>
              <div className="input-container">
                <label>Description</label>
                <textarea className="mnc-input" value={serviceDesc} onChange={e => setServiceDesc(e.target.value)} style={{ minHeight: '100px' }}></textarea>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="mnc-btn" disabled={loading}>Save</button>
                <button type="button" className="mnc-btn" onClick={resetServiceForm} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="services-grid">
        {services.map(service => (
          <div key={service.id} className="service-card">
            <h4>{service.serviceName}</h4>
            <p className="service-type">{service.serviceType}</p>
            <p>{service.description}</p>
            <span className="badge">{service.status}</span>
          </div>
        ))}
      </div>
    </div>
  )

  const renderProjects = () => (
    <div className="page-content">
      <div className="page-header">
        <h2>Project Management</h2>
        <button className="mnc-btn" onClick={() => setShowProjectForm(true)}>+ Add Project</button>
      </div>

      {success && <div className="status-box success">{success}</div>}
      {error && <div className="status-box error">{error}</div>}

      {showProjectForm && (
        <div className="modal-overlay" onClick={() => resetProjectForm()}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>{editingProject ? 'Edit Project' : 'Add Project'}</h3>
            <form onSubmit={handleProjectSubmit} className="form-stack">
              <div className="input-container">
                <label>Project Name *</label>
                <input type="text" className="mnc-input" value={projName} onChange={e => setProjName(e.target.value)} required />
              </div>
              <div className="input-container">
                <label>Service *</label>
                <select className="mnc-input" value={projServiceId} onChange={e => setProjServiceId(e.target.value)} required>
                  <option value="">Select Service</option>
                  {services.map(s => (
                    <option key={s.id} value={s.id}>{s.serviceName}</option>
                  ))}
                </select>
              </div>
              <div className="input-container">
                <label>Status</label>
                <select className="mnc-input" value={projStatus} onChange={e => setProjStatus(e.target.value)}>
                  <option>PLANNING</option>
                  <option>ACTIVE</option>
                  <option>COMPLETED</option>
                  <option>ON_HOLD</option>
                </select>
              </div>
              <div className="input-container">
                <label>Budget</label>
                <input type="number" className="mnc-input" value={projBudget} onChange={e => setProjBudget(e.target.value)} />
              </div>
              <div className="input-container">
                <label>Start Date</label>
                <input type="date" className="mnc-input" value={projStartDate} onChange={e => setProjStartDate(e.target.value)} />
              </div>
              <div className="input-container">
                <label>Description</label>
                <textarea className="mnc-input" value={projDesc} onChange={e => setProjDesc(e.target.value)} style={{ minHeight: '100px' }}></textarea>
              </div>
              <div className="input-container">
                <label>Assign Team (Hold Ctrl/Cmd to select multiple)</label>
                <select
                  multiple
                  className="mnc-input"
                  value={projEmployees}
                  onChange={e => setProjEmployees(Array.from(e.target.selectedOptions, option => option.value))}
                  style={{ minHeight: '120px' }}
                >
                  {employeeList.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.department})</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="mnc-btn" disabled={loading}>Save</button>
                <button type="button" className="mnc-btn" onClick={resetProjectForm} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>Project Name</th>
              <th>Service</th>
              <th>Status</th>
              <th>Budget</th>
              <th>Spent</th>
              <th>Team</th>
              <th>Start Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map(proj => (
              <tr key={proj.id}>
                <td>{proj.projectName}</td>
                <td>{services.find(s => s.id === proj.serviceId)?.serviceName || 'N/A'}</td>
                <td><span className="badge">{proj.status}</span></td>
                <td>${proj.budget}</td>
                <td>${proj.spent}</td>
                <td>
                  <span className="badge" title={proj.employees?.map(e => e.name).join(', ')}>
                    {proj.employees?.length || 0} Members
                  </span>
                </td>
                <td>{proj.startDate}</td>
                <td>
                  <button className="btn-small" onClick={() => editProject(proj)}>Edit</button>
                  <button className="btn-small btn-danger" onClick={() => handleDeleteProject(proj.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  if (!user) {
    return (
      <div className="mnc-layout">
        <aside className="branding-side">
          <div className="branding-content">
            <div className="logo-wrapper">
              <Logo />
              <span className="logo-text">WorkLedger</span>
            </div>
            <h1 className="hero-heading">Enterprise<br />Management</h1>
            <p className="hero-subtext">Multi-tenant SaaS platform for modern businesses</p>
          </div>
        </aside>

        <main className="auth-side">
          <div className="auth-form-container">
            <div className="auth-header">
              <h2>{isLogin ? 'Sign In' : 'Get Started'}</h2>
              <p>{isLogin ? 'Access your workspace' : 'Create your account'}</p>
            </div>

            {error && <div className="status-box error">{error}</div>}
            {success && <div className="status-box success">{success}</div>}

            <form onSubmit={handleLogin} className="form-stack">
              <div className="input-container">
                <label>Email</label>
                <input type="email" className="mnc-input" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="input-container">
                <label>Password</label>
                <input type="password" className="mnc-input" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <button type="submit" className="mnc-btn" disabled={loading}>
                {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
              </button>
            </form>

            <div className="footer-action">
              {isLogin ? (
                <>New user? <a href="#" onClick={(e) => { e.preventDefault(); setIsLogin(false); }}>Create account</a></>
              ) : (
                <>Have an account? <a href="#" onClick={(e) => { e.preventDefault(); setIsLogin(true); }}>Sign in</a></>
              )}
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (showTenantOnboarding) {
    return (
      <div className="mnc-layout dashboard-mode">
        <aside className="branding-side">
          <div className="branding-content">
            <div className="logo-wrapper">
              <Logo />
              <span className="logo-text">WorkLedger</span>
            </div>
            <h1 className="hero-heading">Setup<br />Workspace</h1>
            <p className="hero-subtext">Step {wizardStep} of 3</p>
          </div>
        </aside>

        <main className="auth-side">
          <div className="auth-form-container">
            <h2>Company Onboarding</h2>
            {error && <div className="status-box error">{error}</div>}
            <form onSubmit={handleTenantOnboarding} className="form-stack">
              {renderWizardStep()}
              <div style={{ display: 'flex', gap: '1rem' }}>
                {wizardStep > 1 && (
                  <button type="button" onClick={() => setWizardStep(wizardStep - 1)} className="mnc-btn" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)' }}>Back</button>
                )}
                <button type="submit" className="mnc-btn" disabled={loading}>
                  {wizardStep === 3 ? 'Create Workspace' : 'Next'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    )
  }


  const renderEmployeeDashboard = () => (
    <div className="page-content">
      <div className="page-header">
        <h2>Welcome Back, {user?.email}</h2>
        <button className="mnc-btn" onClick={() => setShowLogTimeModal(true)}>Log Daily Work</button>
      </div>

      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-label">Assigned Tasks</div>
          <div className="stat-value">{myTasks.filter(t => t.status !== 'DONE').length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Hours Logged (Week)</div>
          <div className="stat-value">24.5</div>
        </div>
      </div>

      {success && <div className="status-box success">{success}</div>}
      {error && <div className="status-box error">{error}</div>}

      <div className="dashboard-sections">
        <div className="section">
          <h3>My Tasks</h3>
          {myTasks.length === 0 && <p className="empty-text">No tasks assigned to you.</p>}
          {myTasks.map(task => (
            <div key={task.id} className="list-item insight-item">
              <div className="insight-left">
                <strong>{task.title}</strong>
                <div className="insight-meta">
                  <span className={`meta-tag ${task.priority.toLowerCase()}`}>{task.priority}</span>
                  <span className="meta-tag">{task.project?.projectName}</span>
                </div>
              </div>
              <div className="insight-right">
                <span className="badge">{task.status}</span>
                <button className="btn-small" style={{ marginTop: '0.5rem' }} onClick={() => {
                  setSelectedTaskId(task.id);
                  setSelectedProjectId(task.project?.id);
                  setShowLogTimeModal(true);
                }}>Log Time</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showLogTimeModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Log Work Hours</h3>
            <form className="form-stack" onSubmit={handleLogTime}>
              <div className="input-container">
                <label>Task (Optional)</label>
                <select className="mnc-input" value={selectedTaskId} onChange={e => setSelectedTaskId(e.target.value)}>
                  <option value="">Select Task</option>
                  {myTasks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                </select>
              </div>
              <div className="input-container">
                <label>Date</label>
                <input type="date" className="mnc-input" value={logDate} onChange={e => setLogDate(e.target.value)} required />
              </div>
              <div className="input-container">
                <label>Hours Spent</label>
                <input type="number" step="0.5" className="mnc-input" value={logHours} onChange={e => setLogHours(e.target.value)} required />
              </div>
              <div className="input-container">
                <label>Notes</label>
                <textarea className="mnc-input" value={logDesc} onChange={e => setLogDesc(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="mnc-btn">Save Log</button>
                <button type="button" className="mnc-btn" style={{ background: '#444' }} onClick={() => setShowLogTimeModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )

  const handleLogTime = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await logTime(activeTenantId, {
        hours: parseFloat(logHours),
        date: logDate,
        description: logDesc,
        taskId: selectedTaskId ? parseInt(selectedTaskId) : null,
        projectId: selectedProjectId ? parseInt(selectedProjectId) : (myTasks.find(t => t.id == selectedTaskId)?.project?.id),
        employeeId: user.employeeId
      });
      setSuccess('Time logged successfully and Admin notified via email!');
      setShowLogTimeModal(false);
      setLogHours('');
      setLogDesc('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const taskData = {
        title: taskTitle,
        description: taskDesc,
        priority: taskPriority,
        dueDate: taskDueDate,
        project: { id: parseInt(taskProjectId) },
        assignee: taskAssigneeId ? { id: parseInt(taskAssigneeId) } : null,
        status: 'TODO'
      };
      await createTask(activeTenantId, taskData);
      setSuccess('Task created and employee notified!');
      setShowTaskForm(false);
      resetTaskForm();
      await loadTasks();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const resetTaskForm = () => {
    setTaskTitle('');
    setTaskDesc('');
    setTaskPriority('MEDIUM');
    setTaskDueDate('');
    setTaskProjectId('');
    setTaskAssigneeId('');
  }

  const renderTasksPage = () => (
    <div className="page-content">
      <div className="page-header">
        <h2>Task Management</h2>
        <button className="mnc-btn" onClick={() => setShowTaskForm(true)}>+ Create Task</button>
      </div>

      {success && <div className="status-box success">{success}</div>}
      {error && <div className="status-box error">{error}</div>}

      {showTaskForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Create New Task</h3>
            <form className="form-stack" onSubmit={handleTaskSubmit}>
              <div className="input-container">
                <label>Task Title *</label>
                <input type="text" className="mnc-input" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} required />
              </div>
              <div className="input-container">
                <label>Project *</label>
                <select className="mnc-input" value={taskProjectId} onChange={e => setTaskProjectId(e.target.value)} required>
                  <option value="">Select Project</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.projectName}</option>)}
                </select>
              </div>
              <div className="input-container">
                <label>Assignee</label>
                <select className="mnc-input" value={taskAssigneeId} onChange={e => setTaskAssigneeId(e.target.value)}>
                  <option value="">Assign Employee</option>
                  {employeeList.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                </select>
              </div>
              <div className="input-container">
                <label>Priority</label>
                <select className="mnc-input" value={taskPriority} onChange={e => setTaskPriority(e.target.value)}>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
              <div className="input-container">
                <label>Due Date</label>
                <input type="date" className="mnc-input" value={taskDueDate} onChange={e => setTaskDueDate(e.target.value)} />
              </div>
              <div className="input-container">
                <label>Description</label>
                <textarea className="mnc-input" value={taskDesc} onChange={e => setTaskDesc(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="mnc-btn">Assign Task</button>
                <button type="button" className="mnc-btn" style={{ background: '#444' }} onClick={() => setShowTaskForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>Task</th>
              <th>Project</th>
              <th>Assignee</th>
              <th>Priority</th>
              <th>Due Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {taskList.map(task => (
              <tr key={task.id}>
                <td>{task.title}</td>
                <td>{task.project?.projectName}</td>
                <td>{task.assignee?.name || 'Unassigned'}</td>
                <td><span className={`meta-tag ${task.priority.toLowerCase()}`}>{task.priority}</span></td>
                <td>{task.dueDate}</td>
                <td><span className="badge">{task.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  return (
    <div className="mnc-layout dashboard-mode">
      <aside className="sidebar">
        <div className="sidebar-header">
          <Logo />
          <span className="logo-text">WorkLedger</span>
        </div>

        <nav className="sidebar-nav">
          {(user?.role || 'ADMIN').toUpperCase() === 'ADMIN' ? (
            <>
              <button className={`nav-item ${currentPage === 'dashboard' ? 'active' : ''}`} onClick={() => setCurrentPage('dashboard')}>
                📊 Dashboard
              </button>
              <button className={`nav-item ${currentPage === 'employees' ? 'active' : ''}`} onClick={() => setCurrentPage('employees')}>
                👥 Employees
              </button>
              <button className={`nav-item ${currentPage === 'services' ? 'active' : ''}`} onClick={() => setCurrentPage('services')}>
                🎯 Services
              </button>
              <button className={`nav-item ${currentPage === 'projects' ? 'active' : ''}`} onClick={() => setCurrentPage('projects')}>
                📁 Projects
              </button>
              <button className={`nav-item ${currentPage === 'teams' ? 'active' : ''}`} onClick={() => setCurrentPage('teams')}>
                🎖️ Team Management
              </button>
              <button className={`nav-item ${currentPage === 'tasks' ? 'active' : ''}`} onClick={() => setCurrentPage('tasks')}>
                📝 Tasks
              </button>
            </>
          ) : (
            <>
              <button className={`nav-item ${currentPage === 'my-work' ? 'active' : ''}`} onClick={() => setCurrentPage('my-work')}>
                💼 My Work
              </button>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="tenant-info">
            <small>Workspace</small>
            <div>{activeTenantId}</div>
            <small style={{ marginTop: '0.5rem', display: 'block' }}>Account Role</small>
            <div style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{user?.role}</div>
          </div>
          <button className="mnc-btn" onClick={handleLogout} style={{ width: '100%', marginTop: '1rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)' }}>
            Sign Out
          </button>
        </div>
      </aside>

      <main className="main-content">
        {(user?.role || 'ADMIN').toUpperCase() === 'ADMIN' ? (
          <>
            {currentPage === 'dashboard' && renderDashboard()}
            {currentPage === 'employees' && renderEmployees()}
            {currentPage === 'services' && renderServices()}
            {currentPage === 'projects' && renderProjects()}
            {currentPage === 'teams' && renderTeams()}
            {currentPage === 'tasks' && renderTasksPage()}
          </>
        ) : (
          <>
            {renderEmployeeDashboard()}
          </>
        )}
      </main>
    </div>
  )
}

export default App

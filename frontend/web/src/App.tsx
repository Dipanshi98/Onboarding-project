
import { useEffect, useMemo, useState } from 'react'
import './App.css'

const API = 'http://localhost:8080/api'

type Employee = {
  employeeId: number
  firstName: string
  lastName: string
  email: string
  phone: string
  department: string
  designation: string
  joiningDate: string
  onboardingStatus: string
}

type Step = {
  id: number
  stepName: string
  description: string
  status: string
}

type ChecklistItem = {
  id: number
  itemName: string
  status: string
}

type Tab = 'dashboard' | 'employees' | 'onboarding' | 'checklist'

const initialForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  department: '',
  designation: '',
  joiningDate: '',
  onboardingStatus: 'PENDING',
}

function App() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [steps, setSteps] = useState<Step[]>([])
  const [checklist, setChecklist] = useState<ChecklistItem[]>([])
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [form, setForm] = useState(initialForm)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const loadEmployees = async () => {
    try {
      const response = await fetch(`${API}/employees`)
      if (!response.ok) throw new Error('Unable to load employees')
      setEmployees(await response.json())
    } catch {
      setMessage('Backend connection failed. Please start Spring Boot.')
    }
  }

  useEffect(() => {
    loadEmployees()
  }, [])

  const loadDashboard = async (employee: Employee) => {
    setSelectedEmployee(employee)
    setMessage('')

    try {
      const [stepResponse, checklistResponse] = await Promise.all([
        fetch(`${API}/onboarding/${employee.employeeId}/steps`),
        fetch(`${API}/checklist/${employee.employeeId}`),
      ])

      if (!stepResponse.ok || !checklistResponse.ok) {
        throw new Error('Could not load onboarding data')
      }

      setSteps(await stepResponse.json())
      setChecklist(await checklistResponse.json())
    } catch {
      setSteps([])
      setChecklist([])
      setMessage('Could not load employee onboarding information.')
    }
  }

  const registerEmployee = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setMessage('Registering employee...')

    try {
      const response = await fetch(`${API}/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!response.ok) throw new Error('Employee registration failed')

      const employee: Employee = await response.json()

      const stepsResponse = await fetch(
        `${API}/onboarding/${employee.employeeId}/steps`,
        { method: 'POST' },
      )
      if (!stepsResponse.ok) throw new Error('Could not create onboarding steps')

      const checklistResponse = await fetch(
        `${API}/checklist/${employee.employeeId}`,
        { method: 'POST' },
      )
      if (!checklistResponse.ok) throw new Error('Could not create joining checklist')

      await loadEmployees()
      await loadDashboard(employee)

      setForm(initialForm)
      setShowForm(false)
      setActiveTab('onboarding')
      setMessage('Employee registered successfully!')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const updateStep = async (id: number) => {
    try {
      const response = await fetch(
        `${API}/onboarding/steps/${id}?status=COMPLETED`,
        { method: 'PUT' },
      )
      if (!response.ok) throw new Error()
      if (selectedEmployee) await loadDashboard(selectedEmployee)
      setMessage('Onboarding step updated.')
    } catch {
      setMessage('Unable to update onboarding step.')
    }
  }

  const updateChecklist = async (id: number) => {
    try {
      const response = await fetch(
        `${API}/checklist/item/${id}?status=COMPLETED`,
        { method: 'PUT' },
      )
      if (!response.ok) throw new Error()
      if (selectedEmployee) await loadDashboard(selectedEmployee)
      setMessage('Checklist item updated.')
    } catch {
      setMessage('Unable to update checklist item.')
    }
  }

  const filteredEmployees = useMemo(() => {
    const term = search.toLowerCase()
    return employees.filter(employee =>
      `${employee.firstName} ${employee.lastName} ${employee.email} ${employee.department}`
        .toLowerCase()
        .includes(term),
    )
  }, [employees, search])

  const completedSteps = steps.filter(s => s.status === 'COMPLETED').length
  const pendingSteps = steps.length - completedSteps
  const completedChecklist = checklist.filter(i => i.status === 'COMPLETED').length
  const pendingChecklist = checklist.length - completedChecklist
  const progress = steps.length
    ? Math.round((completedSteps / steps.length) * 100)
    : 0

  const onboardingComplete =
    steps.length > 0 &&
    progress === 100 &&
    checklist.length > 0 &&
    pendingChecklist === 0

  const selectEmployee = async (employee: Employee) => {
    await loadDashboard(employee)
    setActiveTab('onboarding')
  }

  return (
    <div className="portal">

      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">S</div>
          <div>
            <strong>SumPositive</strong>
            <span>HR PORTAL</span>
          </div>
        </div>

        <div className="nav-label">MAIN MENU</div>

        <nav className="navigation">
          <button className={activeTab === 'dashboard' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActiveTab('dashboard')}>
            <span>▦</span> Dashboard
          </button>

          <button className={activeTab === 'employees' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActiveTab('employees')}>
            <span>♙</span> Employees
          </button>

          <button className={activeTab === 'onboarding' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActiveTab('onboarding')}>
            <span>☑</span> Onboarding
          </button>

          <button className={activeTab === 'checklist' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActiveTab('checklist')}>
            <span>☷</span> Joining Checklist
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="admin-avatar">HR</div>
          <div>
            <strong>HR Administrator</strong>
            <span>Management Portal</span>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">

        <header className="topbar">
          <div>
            <span className="breadcrumb">Workspace / {activeTab}</span>
            <h1>
              {activeTab === 'dashboard' && 'Dashboard'}
              {activeTab === 'employees' && 'Employee Management'}
              {activeTab === 'onboarding' && 'Onboarding Management'}
              {activeTab === 'checklist' && 'Joining Checklist'}
            </h1>
          </div>

          <div className="topbar-right">
            <div className="today-label">Employee Management System</div>
            <div className="profile-circle">HR</div>
          </div>
        </header>

        {message && (
          <div className="message">
            <span>{message}</span>
            <button className="message-close" onClick={() => setMessage('')}>×</button>
          </div>
        )}

        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
          <>
            <section className="welcome-banner">
              <div>
                <span className="eyebrow">HR MANAGEMENT OVERVIEW</span>
                <h2>Welcome to Employee Onboarding</h2>
                <p>Manage employee records, onboarding activities and joining progress.</p>
              </div>
              <button onClick={() => {
                setShowForm(true)
                setActiveTab('employees')
              }}>
                + Add New Employee
              </button>
            </section>

            <section className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon blue">♙</div>
                <span>Total Employees</span>
                <strong>{employees.length}</strong>
                <small>Registered employees</small>
              </div>

              <div className="stat-card">
                <div className="stat-icon green">✓</div>
                <span>Completed Steps</span>
                <strong>{completedSteps}</strong>
                <small>Selected employee</small>
              </div>

              <div className="stat-card">
                <div className="stat-icon orange">◷</div>
                <span>Pending Steps</span>
                <strong>{pendingSteps}</strong>
                <small>Selected employee</small>
              </div>

              <div className="stat-card">
                <div className="stat-icon purple">☷</div>
                <span>Pending Checklist</span>
                <strong>{pendingChecklist}</strong>
                <small>Selected employee</small>
              </div>
            </section>

            <section className="content-card">
              <div className="section-heading">
                <div>
                  <h2>Recent Employees</h2>
                  <p>Select an employee to view their onboarding progress.</p>
                </div>
                <button className="secondary-button"
                  onClick={() => setActiveTab('employees')}>
                  View All
                </button>
              </div>

              {employees.length === 0 ? (
                <div className="empty-state">
                  <span>♙</span>
                  <h3>No employees yet</h3>
                  <p>Add your first employee to get started.</p>
                </div>
              ) : (
                <div className="employee-grid">
                  {employees.slice(0, 4).map(employee => (
                    <button className="employee-card" key={employee.employeeId}
                      onClick={() => selectEmployee(employee)}>
                      <div className="employee-avatar">
                        {employee.firstName.charAt(0).toUpperCase()}
                        {employee.lastName.charAt(0).toUpperCase()}
                      </div>
                      <div className="employee-info">
                        <strong>{employee.firstName} {employee.lastName}</strong>
                        <span>{employee.email}</span>
                        <small>{employee.department || 'Department not specified'}</small>
                      </div>
                      <span className="arrow">→</span>
                    </button>
                  ))}
                </div>
              )}
            </section>

            <section className="content-card">
              <div className="section-heading">
                <div>
                  <h2>Selected Employee Progress</h2>
                  <p>
                    {selectedEmployee
                      ? `${selectedEmployee.firstName} ${selectedEmployee.lastName}`
                      : 'Select an employee to view detailed progress.'}
                  </p>
                </div>
                {selectedEmployee && (
                  <button className="secondary-button"
                    onClick={() => setActiveTab('onboarding')}>
                    View Onboarding
                  </button>
                )}
              </div>

              {selectedEmployee ? (
                <div className="progress-overview">
                  <div className="progress-label">
                    <strong>Onboarding progress</strong>
                    <strong>{progress}%</strong>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${progress}%` }} />
                  </div>
                  <p>{completedSteps} of {steps.length} onboarding steps completed</p>
                </div>
              ) : (
                <div className="empty-state compact">
                  <p>Select an employee from Recent Employees.</p>
                </div>
              )}
            </section>
          </>
        )}

        {/* EMPLOYEES */}
        {activeTab === 'employees' && (
          <section className="content-card">
            <div className="section-heading">
              <div>
                <h2>All Employees</h2>
                <p>Register, search and manage employee records.</p>
              </div>
              <button onClick={() => setShowForm(!showForm)}>
                {showForm ? 'Close Form' : '+ Add Employee'}
              </button>
            </div>

            {showForm && (
              <form className="registration-form" onSubmit={registerEmployee}>
                <h3>New Employee Registration</h3>

                <div className="form-grid">
                  <label>First Name
                    <input required value={form.firstName}
                      onChange={e => setForm({ ...form, firstName: e.target.value })} />
                  </label>

                  <label>Last Name
                    <input required value={form.lastName}
                      onChange={e => setForm({ ...form, lastName: e.target.value })} />
                  </label>

                  <label>Email Address
                    <input type="email" required value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })} />
                  </label>

                  <label>Phone Number
                    <input value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })} />
                  </label>

                  <label>Department
                    <input value={form.department}
                      onChange={e => setForm({ ...form, department: e.target.value })} />
                  </label>

                  <label>Designation
                    <input value={form.designation}
                      onChange={e => setForm({ ...form, designation: e.target.value })} />
                  </label>

                  <label>Joining Date
                    <input type="date" value={form.joiningDate}
                      onChange={e => setForm({ ...form, joiningDate: e.target.value })} />
                  </label>
                </div>

                <button type="submit" disabled={loading}>
                  {loading ? 'Registering...' : 'Register Employee'}
                </button>
              </form>
            )}

            <div className="search-box">
              <span>⌕</span>
              <input placeholder="Search by name, email or department..."
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            <div className="table-wrap">
              <table className="employee-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Designation</th>
                    <th>Joining Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map(employee => (
                    <tr key={employee.employeeId}>
                      <td>
                        <div className="table-employee">
                          <div className="employee-avatar small">
                            {employee.firstName.charAt(0).toUpperCase()}
                          </div>
                          <strong>{employee.firstName} {employee.lastName}</strong>
                        </div>
                      </td>
                      <td>{employee.email}</td>
                      <td>{employee.department || '—'}</td>
                      <td>{employee.designation || '—'}</td>
                      <td>{employee.joiningDate || '—'}</td>
                      <td>
                        <button className="table-action"
                          onClick={() => selectEmployee(employee)}>
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredEmployees.length === 0 && (
                <div className="empty-state">
                  <h3>No matching employees</h3>
                  <p>Try a different search or register an employee.</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ONBOARDING */}
        {activeTab === 'onboarding' && (
          <section className="content-card">
            <div className="section-heading">
              <div>
                <h2>Employee Onboarding</h2>
                <p>Track the progress of each employee.</p>
              </div>
              <select className="employee-select"
                value={selectedEmployee?.employeeId || ''}
                onChange={e => {
                  const employee = employees.find(
                    item => item.employeeId === Number(e.target.value),
                  )
                  if (employee) loadDashboard(employee)
                }}>
                <option value="">Select Employee</option>
                {employees.map(employee => (
                  <option key={employee.employeeId} value={employee.employeeId}>
                    {employee.firstName} {employee.lastName}
                  </option>
                ))}
              </select>
            </div>

            {selectedEmployee ? (
              <>
                <div className="selected-profile">
                  <div className="employee-avatar large">
                    {selectedEmployee.firstName.charAt(0)}
                    {selectedEmployee.lastName.charAt(0)}
                  </div>
                  <div>
                    <h3>{selectedEmployee.firstName} {selectedEmployee.lastName}</h3>
                    <p>{selectedEmployee.email}</p>
                    <span>{selectedEmployee.designation || 'Employee'} · {selectedEmployee.department || 'Department not specified'}</span>
                  </div>
                  <span className={onboardingComplete ? 'status completed' : 'status pending'}>
                    {onboardingComplete ? 'Completed' : 'In Progress'}
                  </span>
                </div>

                <div className="progress-overview">
                  <div className="progress-label">
                    <strong>Overall Progress</strong>
                    <strong>{progress}%</strong>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${progress}%` }} />
                  </div>
                  <p>{completedSteps} completed · {pendingSteps} pending</p>
                </div>

                <h3 className="subheading">Onboarding Steps</h3>
                <div className="task-list">
                  {steps.map((step, index) => (
                    <div className="task-card" key={step.id}>
                      <div className="step-number">{index + 1}</div>
                      <div className="task-details">
                        <strong>{step.stepName}</strong>
                        <p>{step.description}</p>
                      </div>
                      <span className={step.status === 'COMPLETED'
                        ? 'status completed' : 'status pending'}>
                        {step.status}
                      </span>
                      {step.status !== 'COMPLETED' && (
                        <button className="complete-button"
                          onClick={() => updateStep(step.id)}>
                          Complete
                        </button>
                      )}
                    </div>
                  ))}
                  {steps.length === 0 && (
                    <div className="empty-state">
                      <p>No onboarding steps found for this employee.</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="empty-state">
                <span>♙</span>
                <h3>Select an employee</h3>
                <p>Choose an employee to see their onboarding details.</p>
              </div>
            )}
          </section>
        )}

        {/* CHECKLIST */}
        {activeTab === 'checklist' && (
          <section className="content-card">
            <div className="section-heading">
              <div>
                <h2>Joining Checklist</h2>
                <p>Manage the required joining formalities.</p>
              </div>
              <select className="employee-select"
                value={selectedEmployee?.employeeId || ''}
                onChange={e => {
                  const employee = employees.find(
                    item => item.employeeId === Number(e.target.value),
                  )
                  if (employee) loadDashboard(employee)
                }}>
                <option value="">Select Employee</option>
                {employees.map(employee => (
                  <option key={employee.employeeId} value={employee.employeeId}>
                    {employee.firstName} {employee.lastName}
                  </option>
                ))}
              </select>
            </div>

            {selectedEmployee ? (
              <>
                <div className="progress-overview">
                  <div className="progress-label">
                    <strong>Checklist Progress</strong>
                    <strong>{checklist.length
                      ? Math.round(completedChecklist / checklist.length * 100)
                      : 0}%</strong>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill"
                      style={{
                        width: `${checklist.length
                          ? completedChecklist / checklist.length * 100
                          : 0}%`,
                      }} />
                  </div>
                  <p>{completedChecklist} completed · {pendingChecklist} pending</p>
                </div>

                <div className="task-list">
                  {checklist.map(item => (
                    <div className="task-card" key={item.id}>
                      <div className="step-number">✓</div>
                      <div className="task-details">
                        <strong>{item.itemName}</strong>
                        <p>Joining requirement</p>
                      </div>
                      <span className={item.status === 'COMPLETED'
                        ? 'status completed' : 'status pending'}>
                        {item.status}
                      </span>
                      {item.status !== 'COMPLETED' && (
                        <button className="complete-button"
                          onClick={() => updateChecklist(item.id)}>
                          Complete
                        </button>
                      )}
                    </div>
                  ))}
                  {checklist.length === 0 && (
                    <div className="empty-state">
                      <p>No joining checklist found for this employee.</p>
                    </div>
                  )}
                </div>

                {onboardingComplete && (
                  <div className="success-banner">
                    <strong>✓ Employee Onboarding Completed!</strong>
                    <p>All onboarding steps and joining checklist items are complete.</p>
                  </div>
                )}
              </>
            ) : (
              <div className="empty-state">
                <h3>Select an employee</h3>
                <p>Choose an employee to see their joining checklist.</p>
              </div>
            )}
          </section>
        )}

        <footer className="footer">
          Employee Onboarding Management System · SumPositive
        </footer>
      </main>
    </div>
  )
}

export default App

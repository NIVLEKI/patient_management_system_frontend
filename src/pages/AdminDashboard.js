import React, { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [backendReady, setBackendReady] = useState(false);

  const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
  const adminToken = localStorage.getItem('adminToken');

  const API_BASE_URL = 'https://patient-management-system-in-python.onrender.com/api';

  // Mock data to show while backend is deploying
  const mockData = {
    stats: {
      totalUsers: 156,
      totalPatients: 423,
      totalDoctors: 0,
      totalAppointments: 892,
      todaysAppointments: 15,
      recentUsers: 12,
      recentAppointments: 45,
      systemUptime: '99.8%'
    },
    users: [
      { id: 1, name: 'John Doe', email: 'john@example.com', role: 'patient', created_at: '2024-01-15' },
      { id: 2, name: 'Dr. Smith', email: 'smith@hospital.com', role: 'doctor', created_at: '2024-01-10' },
      { id: 3, name: 'Alice Johnson', email: 'alice@example.com', role: 'patient', created_at: '2024-01-12' }
    ],
    patients: [
      { id: 1, name: 'Alice Johnson', email: 'alice@example.com', phone: '+1234567890', status: 'active' },
      { id: 2, name: 'Bob Wilson', email: 'bob@example.com', phone: '+1234567891', status: 'active' }
    ],
    appointments: [
      { id: 1, patient_name: 'Alice Johnson', doctor_name: 'Dr. Smith', appointment_date: '2024-01-20', status: 'scheduled' },
      { id: 2, patient_name: 'Bob Wilson', doctor_name: 'Dr. Brown', appointment_date: '2024-01-21', status: 'completed' }
    ]
  };

  // Check if backend is ready
  useEffect(() => {
    checkBackendStatus();
  }, []);

  const checkBackendStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      setBackendReady(response.ok);
    } catch (error) {
      setBackendReady(false);
    }
  };

 const fetchAdminData = async (endpoint) => {
  try {
    setLoading(true);
    setError('');
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      setBackendReady(true);
      return data; // Return the REAL data
    } else {
      // Only use demo data if backend returns error
      console.log('Backend returned error, using demo data');
      const endpointKey = endpoint.replace('/admin/', '');
      return mockData[endpointKey] || {};
    }
  } catch (err) {
    // Only use demo data if network error
    console.log('Network error, using demo data:', err);
    const endpointKey = endpoint.replace('/admin/', '');
    return mockData[endpointKey] || {};
  } finally {
    setLoading(false);
  }
};

  const loadStats = async () => {
  const data = await fetchAdminData('/admin/stats');
  if (data) setStats(data);
};

const loadUsers = async () => {
  const data = await fetchAdminData('/admin/users');
  console.log('Users data:', data); // Check what's returned
  if (data && data.users) {
    setUsers(data.users); // Use the real users array
  } else if (data && Array.isArray(data)) {
    setUsers(data); // If it returns array directly
  }
};

const loadPatients = async () => {
  const data = await fetchAdminData('/admin/patients');
  console.log('Patients data:', data); // Check what's returned
  if (data && data.patients) {
    setPatients(data.patients);
  } else if (data && Array.isArray(data)) {
    setPatients(data);
  }
};

const loadAppointments = async () => {
  const data = await fetchAdminData('/admin/appointments');
  console.log('Appointments data:', data); // Check what's returned
  if (data && data.appointments) {
    setAppointments(data.appointments);
  } else if (data && Array.isArray(data)) {
    setAppointments(data);
  }
};

  useEffect(() => {
    if (activeTab === 'overview') loadStats();
    if (activeTab === 'users') loadUsers();
    if (activeTab === 'patients') loadPatients();
    if (activeTab === 'appointments') loadAppointments();
  }, [activeTab]);

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminToken');
    window.location.href = '/admin-login';
  };

  const handleDeleteUser = async (userId) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        });

        if (response.ok) {
          alert('User deleted successfully');
          loadUsers(); // Refresh the list
        } else {
          alert('Failed to delete user');
        }
      } catch (err) {
        alert('Error deleting user');
      }
    }
  };

  if (!adminUser.name) {
    return React.createElement('div', { className: 'loading' }, 'Redirecting to admin login...');
  }

  return React.createElement('div', { className: 'page-container' },
    // Header with backend status
    React.createElement('div', { 
      style: { 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '32px',
        flexWrap: 'wrap',
        gap: '16px'
      } 
    },
      React.createElement('div', null,
        React.createElement('h1', { 
          style: { 
            fontSize: '32px',
            fontWeight: '700',
            color: 'var(--text)',
            marginBottom: '8px'
          } 
        }, 'Admin Dashboard'),
        React.createElement('p', { 
          style: { 
            color: 'var(--text-light)',
            fontSize: '16px'
          } 
        }, `Welcome, ${adminUser.name}`),
        !backendReady && React.createElement('div', {
          style: {
            padding: '8px 12px',
            backgroundColor: '#fef3c7',
            color: '#92400e',
            borderRadius: '6px',
            fontSize: '14px',
            marginTop: '8px'
          }
        }, '⚠️ Using demo data - Backend deploying...')
      ),
      React.createElement('button', {
        onClick: handleLogout,
        className: 'btn btn-outline',
        style: { whiteSpace: 'nowrap' }
      }, '🚪 Admin Logout')
    ),

    // Error message
    error && React.createElement('div', { 
      className: 'alert alert-error',
      style: { marginBottom: '24px' }
    }, error),

    // Admin Navigation Tabs
    React.createElement('div', { 
      className: 'admin-nav',
      style: { 
        display: 'flex', 
        gap: '8px', 
        marginBottom: '24px', 
        flexWrap: 'wrap',
        borderBottom: '1px solid var(--border)',
        paddingBottom: '16px'
      } 
    },
      ['overview', 'users', 'patients', 'appointments', 'system'].map(tab =>
        React.createElement('button', {
          key: tab,
          className: `admin-nav-btn ${activeTab === tab ? 'active' : ''}`,
          onClick: () => setActiveTab(tab),
          style: {
            padding: '12px 24px',
            border: 'none',
            background: activeTab === tab ? 'var(--primary)' : 'none',
            color: activeTab === tab ? 'white' : 'var(--text-light)',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            fontWeight: '500'
          }
        }, tab.charAt(0).toUpperCase() + tab.slice(1))
      )
    ),

    // Loading state
    loading && React.createElement('div', { className: 'loading' },
      React.createElement('div', { className: 'loading-spinner' }),
      'Loading data...'
    ),

    // Tab Content
    React.createElement('div', { className: 'admin-content' },
      activeTab === 'overview' && React.createElement('div', null,
        React.createElement('h2', { 
          style: { 
            fontSize: '24px',
            fontWeight: '600',
            marginBottom: '24px',
            color: 'var(--text)'
          } 
        }, 'System Overview'),
        React.createElement('div', { className: 'stats-grid' },
          Object.entries(stats).map(([key, value]) =>
            React.createElement('div', { 
              key: key,
              className: 'card stat-card',
              style: { 
                padding: '24px',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
              } 
            },
              React.createElement('div', { 
                className: 'stat-value',
                style: { 
                  fontSize: '2.5rem',
                  fontWeight: '700',
                  color: 'var(--primary)',
                  marginBottom: '8px'
                } 
              }, value),
              React.createElement('div', { 
                className: 'stat-label',
                style: { 
                  color: 'var(--text-light)',
                  fontSize: '14px',
                  fontWeight: '500',
                  textTransform: 'capitalize'
                } 
              }, key.replace(/([A-Z])/g, ' $1'))
            )
          )
        )
      ),

      activeTab === 'users' && React.createElement('div', null,
        React.createElement('h2', { 
          style: { 
            fontSize: '24px',
            fontWeight: '600',
            marginBottom: '24px',
            color: 'var(--text)'
          } 
        }, 'All Users'),
        React.createElement('div', { className: 'card' },
          React.createElement('div', { 
            style: { 
              padding: '24px',
              overflowX: 'auto'
            } 
          },
            users.length > 0 ? 
              React.createElement('table', { 
                style: { 
                  width: '100%',
                  borderCollapse: 'collapse'
                } 
              },
                React.createElement('thead', null,
                  React.createElement('tr', null,
                    ['ID', 'Name', 'Email', 'Role', 'Created', 'Actions'].map(header =>
                      React.createElement('th', {
                        key: header,
                        style: {
                          padding: '12px',
                          textAlign: 'left',
                          borderBottom: '2px solid var(--border)',
                          fontWeight: '600',
                          color: 'var(--text)'
                        }
                      }, header)
                    )
                  )
                ),
                React.createElement('tbody', null,
                  users.map(user =>
                    React.createElement('tr', { 
                      key: user.id,
                      style: { borderBottom: '1px solid var(--border)' }
                    },
                      React.createElement('td', { 
                        style: { padding: '12px' } 
                      }, user.id),
                      React.createElement('td', { 
                        style: { padding: '12px' } 
                      }, user.name),
                      React.createElement('td', { 
                        style: { padding: '12px' } 
                      }, user.email),
                      React.createElement('td', { 
                        style: { padding: '12px' } 
                      }, user.role),
                      React.createElement('td', { 
                        style: { padding: '12px' } 
                      }, user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'),
                      React.createElement('td', { 
                        style: { padding: '12px' } 
                      },
                        React.createElement('button', {
                          onClick: () => handleDeleteUser(user.id),
                          className: 'btn btn-outline',
                          style: { 
                            fontSize: '12px', 
                            padding: '4px 8px',
                            color: 'var(--error)',
                            borderColor: 'var(--error)'
                          }
                        }, 'Delete')
                      )
                    )
                  )
                )
              ) :
              React.createElement('div', { 
                style: { 
                  textAlign: 'center', 
                  padding: '40px', 
                  color: 'var(--text-light)'
                } 
              }, 'No users found')
          )
        )
      ),

      activeTab === 'patients' && React.createElement('div', null,
        React.createElement('h2', { 
          style: { 
            fontSize: '24px',
            fontWeight: '600',
            marginBottom: '24px',
            color: 'var(--text)'
          } 
        }, 'All Patients'),
        React.createElement('div', { className: 'card' },
          React.createElement('div', { 
            style: { 
              padding: '24px',
              overflowX: 'auto'
            } 
          },
            patients.length > 0 ? 
              React.createElement('table', { 
                style: { 
                  width: '100%',
                  borderCollapse: 'collapse'
                } 
              },
                React.createElement('thead', null,
                  React.createElement('tr', null,
                    ['ID', 'Name', 'Email', 'Phone', 'Status', 'Created'].map(header =>
                      React.createElement('th', {
                        key: header,
                        style: {
                          padding: '12px',
                          textAlign: 'left',
                          borderBottom: '2px solid var(--border)',
                          fontWeight: '600',
                          color: 'var(--text)'
                        }
                      }, header)
                    )
                  )
                ),
                React.createElement('tbody', null,
                  patients.map(patient =>
                    React.createElement('tr', { 
                      key: patient.id,
                      style: { borderBottom: '1px solid var(--border)' }
                    },
                      React.createElement('td', { 
                        style: { padding: '12px' } 
                      }, patient.id),
                      React.createElement('td', { 
                        style: { padding: '12px' } 
                      }, patient.name),
                      React.createElement('td', { 
                        style: { padding: '12px' } 
                      }, patient.email),
                      React.createElement('td', { 
                        style: { padding: '12px' } 
                      }, patient.phone || 'N/A'),
                      React.createElement('td', { 
                        style: { padding: '12px' } 
                      }, patient.status || 'active'),
                      React.createElement('td', { 
                        style: { padding: '12px' } 
                      }, patient.created_at ? new Date(patient.created_at).toLocaleDateString() : 'N/A')
                    )
                  )
                )
              ) :
              React.createElement('div', { 
                style: { 
                  textAlign: 'center', 
                  padding: '40px', 
                  color: 'var(--text-light)'
                } 
              }, 'No patients found')
          )
        )
      ),

      activeTab === 'appointments' && React.createElement('div', null,
        React.createElement('h2', { 
          style: { 
            fontSize: '24px',
            fontWeight: '600',
            marginBottom: '24px',
            color: 'var(--text)'
          } 
        }, 'All Appointments'),
        React.createElement('div', { className: 'card' },
          React.createElement('div', { 
            style: { 
              padding: '24px',
              overflowX: 'auto'
            } 
          },
            appointments.length > 0 ? 
              React.createElement('table', { 
                style: { 
                  width: '100%',
                  borderCollapse: 'collapse'
                } 
              },
                React.createElement('thead', null,
                  React.createElement('tr', null,
                    ['ID', 'Patient', 'Doctor', 'Date', 'Status', 'Type'].map(header =>
                      React.createElement('th', {
                        key: header,
                        style: {
                          padding: '12px',
                          textAlign: 'left',
                          borderBottom: '2px solid var(--border)',
                          fontWeight: '600',
                          color: 'var(--text)'
                        }
                      }, header)
                    )
                  )
                ),
                React.createElement('tbody', null,
                  appointments.map(appointment =>
                    React.createElement('tr', { 
                      key: appointment.id,
                      style: { borderBottom: '1px solid var(--border)' }
                    },
                      React.createElement('td', { 
                        style: { padding: '12px' } 
                      }, appointment.id),
                      React.createElement('td', { 
                        style: { padding: '12px' } 
                      }, appointment.patient_name),
                      React.createElement('td', { 
                        style: { padding: '12px' } 
                      }, appointment.doctor_name),
                      React.createElement('td', { 
                        style: { padding: '12px' } 
                      }, appointment.appointment_date ? new Date(appointment.appointment_date).toLocaleDateString() : 'N/A'),
                      React.createElement('td', { 
                        style: { padding: '12px' } 
                      }, appointment.status),
                      React.createElement('td', { 
                        style: { padding: '12px' } 
                      }, appointment.type || 'consultation')
                    )
                  )
                )
              ) :
              React.createElement('div', { 
                style: { 
                  textAlign: 'center', 
                  padding: '40px', 
                  color: 'var(--text-light)'
                } 
              }, 'No appointments found')
          )
        )
      ),

      activeTab === 'system' && React.createElement('div', null,
        React.createElement('h2', { 
          style: { 
            fontSize: '24px',
            fontWeight: '600',
            marginBottom: '24px',
            color: 'var(--text)'
          } 
        }, 'System Settings'),
        React.createElement('div', { className: 'card' },
          React.createElement('div', { 
            style: { 
              padding: '24px'
            } 
          },
            React.createElement('h3', { 
              style: { 
                marginBottom: '16px',
                color: 'var(--text)'
              } 
            }, 'Admin Tools'),
            React.createElement('div', { 
              style: { 
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap'
              } 
            },
              React.createElement('button', {
                className: 'btn btn-outline',
                onClick: () => alert('Database backup initiated')
              }, 'Backup Database'),
              React.createElement('button', {
                className: 'btn btn-outline',
                onClick: () => alert('System logs cleared')
              }, 'Clear Logs'),
              React.createElement('button', {
                className: 'btn btn-outline',
                style: { color: 'var(--error)', borderColor: 'var(--error)' },
                onClick: () => {
                  if (confirm('Are you sure you want to reset the system?')) {
                    alert('System reset initiated');
                  }
                }
              }, 'System Reset')
            )
          )
        )
      )
    )
  );
}
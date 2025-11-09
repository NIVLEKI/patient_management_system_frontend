import React, { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');

  const API_BASE_URL = 'https://patient-management-system-in-python.onrender.com/api';

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminToken');
    window.location.href = '/admin-login';
  };

  const fetchData = async (endpoint) => {
    try {
      setLoading(true);
      // For now, return mock data since we don't have admin endpoints
      // You'll need to create these endpoints in your backend
      return [];
    } catch (error) {
      console.error('Failed to fetch data:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Mock data for demonstration
  const mockStats = {
    totalUsers: 150,
    totalPatients: 450,
    totalDoctors: 25,
    todaysAppointments: 18,
    activeAppointments: 89,
    systemUptime: '99.8%'
  };

  const mockUsers = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'patient', created_at: '2024-01-15' },
    { id: 2, name: 'Dr. Smith', email: 'smith@hospital.com', role: 'doctor', created_at: '2024-01-10' }
  ];

  const mockPatients = [
    { id: 1, name: 'Alice Johnson', email: 'alice@example.com', phone: '+1234567890', status: 'active' },
    { id: 2, name: 'Bob Wilson', email: 'bob@example.com', phone: '+1234567891', status: 'active' }
  ];

  if (!adminUser.name) {
    return React.createElement('div', { className: 'loading' }, 'Redirecting to admin login...');
  }

  return React.createElement('div', { className: 'page-container' },
    // Header
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
        }, `Welcome, ${adminUser.name}`)
      ),
      React.createElement('button', {
        onClick: handleLogout,
        className: 'btn btn-outline',
        style: { whiteSpace: 'nowrap' }
      }, '🚪 Admin Logout')
    ),

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
      ['overview', 'users', 'patients', 'doctors', 'appointments', 'system'].map(tab =>
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
          Object.entries(mockStats).map(([key, value]) =>
            React.createElement('div', { 
              key: key,
              className: 'card stat-card',
              style: { 
                padding: '24px',
                textAlign: 'center'
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
            React.createElement('table', { 
              style: { 
                width: '100%',
                borderCollapse: 'collapse'
              } 
            },
              React.createElement('thead', null,
                React.createElement('tr', null,
                  ['ID', 'Name', 'Email', 'Role', 'Created'].map(header =>
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
                mockUsers.map(user =>
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
                    }, user.created_at)
                  )
                )
              )
            )
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
              textAlign: 'center',
              color: 'var(--text-light)'
            } 
          },
            'Patient management features coming soon...'
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
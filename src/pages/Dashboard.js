import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  // API Base URL for production
  const API_BASE_URL = 'https://patient-management-system-in-python.onrender.com/api';

  const fetchDashboardData = async () => {
    try {
      setError('');
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Fetch stats
      const statsResponse = await fetch(`${API_BASE_URL}/dashboard/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!statsResponse.ok) {
        throw new Error('Failed to fetch dashboard statistics');
      }

      const statsData = await statsResponse.json();
      setStats(statsData.stats || {});

      // Fetch recent appointments
      const appointmentsResponse = await fetch(`${API_BASE_URL}/dashboard/recent-appointments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!appointmentsResponse.ok) {
        throw new Error('Failed to fetch recent appointments');
      }

      const appointmentsData = await appointmentsResponse.json();
      setRecentAppointments(appointmentsData.appointments || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    setLoading(true);
    fetchDashboardData();
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Navigation handlers
  const navigateTo = (path) => {
    navigate(path);
  };

  const handleAppointmentClick = (appointment) => {
    // You can expand this to show appointment details
    console.log('Appointment clicked:', appointment);
  };

  if (!user) {
    return React.createElement('div', { className: 'loading' }, 'Please login to access dashboard');
  }

  // Format numbers with proper fallbacks
  const formatStat = (value) => {
    if (value === undefined || value === null) return '0';
    return value.toString();
  };

  return React.createElement('div', { 
    style: { 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '24px',
      minHeight: '100vh'
    } 
  },
    // Header with enhanced styling
    React.createElement('div', { 
      className: 'card',
      style: { 
        marginBottom: '32px',
        padding: '32px',
        background: 'linear-gradient(135deg, var(--surface) 0%, #f8fafc 100%)'
      } 
    },
      React.createElement('div', { 
        style: { 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start', 
          flexWrap: 'wrap', 
          gap: '16px' 
        } 
      },
        React.createElement('div', null,
          React.createElement('h1', { 
            style: { 
              fontSize: 'clamp(24px, 4vw, 32px)',
              fontWeight: '700',
              color: 'var(--text)',
              marginBottom: '8px',
              background: 'linear-gradient(135deg, var(--text) 0%, var(--text-light) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            } 
          }, `Welcome back, ${user.name || 'User'}!`),
          React.createElement('p', { 
            style: { 
              color: 'var(--text-light)',
              fontSize: '16px',
              maxWidth: '500px'
            } 
          }, `Here's what's happening with your patients today.`)
        ),
        React.createElement('button', {
          onClick: refreshData,
          className: 'btn btn-outline',
          disabled: loading,
          style: { 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            minWidth: '140px',
            justifyContent: 'center'
          }
        },
          loading ? React.createElement('div', { 
            style: { 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px' 
            } 
          }, 
            React.createElement('div', { className: 'loading-spinner' }),
            'Refreshing...'
          ) : React.createElement('div', { 
            style: { 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px' 
            } 
          }, 
            '🔄 Refresh Data'
          )
        )
      )
    ),

    // Error Alert
    error && React.createElement('div', { 
      className: 'alert alert-error',
      style: { 
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }
    }, 
      React.createElement('div', { 
        style: { display: 'flex', alignItems: 'center', gap: '8px' } 
      },
        '⚠️',
        error
      ),
      React.createElement('button', {
        onClick: () => setError(''),
        style: {
          background: 'none',
          border: 'none',
          fontSize: '18px',
          cursor: 'pointer',
          color: 'var(--error)'
        }
      }, '×')
    ),

    // Enhanced Stats Grid
    React.createElement('div', { 
      className: 'stats-grid',
      style: { 
        marginBottom: '32px'
      } 
    },
      // Total Patients
      React.createElement('div', { 
        className: 'card stat-card',
        style: { 
          position: 'relative',
          overflow: 'hidden',
          borderLeft: '4px solid var(--primary)'
        } 
      },
        React.createElement('div', { 
          style: { 
            display: 'flex', 
            alignItems: 'center', 
            gap: '16px' 
          } 
        },
          React.createElement('div', { 
            className: 'stat-icon',
            style: { 
              width: '56px',
              height: '56px',
              borderRadius: '12px',
              backgroundColor: 'rgba(37, 99, 235, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            } 
          }, '👥'),
          React.createElement('div', { className: 'stat-content' },
            React.createElement('div', { 
              className: 'stat-value',
              style: { fontSize: 'clamp(24px, 3vw, 32px)' } 
            }, 
              loading ? React.createElement('div', { 
                className: 'loading-spinner',
                style: { width: '24px', height: '24px' } 
              }) : formatStat(stats.total_patients)
            ),
            React.createElement('div', { 
              className: 'stat-label',
              style: { fontSize: '14px', fontWeight: '600' } 
            }, 'Total Patients')
          )
        )
      ),

      // Today's Appointments
      React.createElement('div', { 
        className: 'card stat-card',
        style: { 
          position: 'relative',
          overflow: 'hidden',
          borderLeft: '4px solid var(--success)'
        } 
      },
        React.createElement('div', { 
          style: { 
            display: 'flex', 
            alignItems: 'center', 
            gap: '16px' 
          } 
        },
          React.createElement('div', { 
            className: 'stat-icon',
            style: { 
              width: '56px',
              height: '56px',
              borderRadius: '12px',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            } 
          }, '📅'),
          React.createElement('div', { className: 'stat-content' },
            React.createElement('div', { 
              className: 'stat-value',
              style: { fontSize: 'clamp(24px, 3vw, 32px)' } 
            }, 
              loading ? React.createElement('div', { 
                className: 'loading-spinner',
                style: { width: '24px', height: '24px' } 
              }) : formatStat(stats.todays_appointments)
            ),
            React.createElement('div', { 
              className: 'stat-label',
              style: { fontSize: '14px', fontWeight: '600' } 
            }, "Today's Appointments")
          )
        )
      ),

      // Upcoming Appointments
      React.createElement('div', { 
        className: 'card stat-card',
        style: { 
          position: 'relative',
          overflow: 'hidden',
          borderLeft: '4px solid var(--warning)'
        } 
      },
        React.createElement('div', { 
          style: { 
            display: 'flex', 
            alignItems: 'center', 
            gap: '16px' 
          } 
        },
          React.createElement('div', { 
            className: 'stat-icon',
            style: { 
              width: '56px',
              height: '56px',
              borderRadius: '12px',
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            } 
          }, '⏰'),
          React.createElement('div', { className: 'stat-content' },
            React.createElement('div', { 
              className: 'stat-value',
              style: { fontSize: 'clamp(24px, 3vw, 32px)' } 
            }, 
              loading ? React.createElement('div', { 
                className: 'loading-spinner',
                style: { width: '24px', height: '24px' } 
              }) : formatStat(stats.upcoming_appointments)
            ),
            React.createElement('div', { 
              className: 'stat-label',
              style: { fontSize: '14px', fontWeight: '600' } 
            }, 'Upcoming Appointments')
          )
        )
      ),

      // Recent Activities
      React.createElement('div', { 
        className: 'card stat-card',
        style: { 
          position: 'relative',
          overflow: 'hidden',
          borderLeft: '4px solid #8b5cf6'
        } 
      },
        React.createElement('div', { 
          style: { 
            display: 'flex', 
            alignItems: 'center', 
            gap: '16px' 
          } 
        },
          React.createElement('div', { 
            className: 'stat-icon',
            style: { 
              width: '56px',
              height: '56px',
              borderRadius: '12px',
              backgroundColor: 'rgba(139, 92, 246, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            } 
          }, '📊'),
          React.createElement('div', { className: 'stat-content' },
            React.createElement('div', { 
              className: 'stat-value',
              style: { fontSize: 'clamp(24px, 3vw, 32px)' } 
            }, 
              loading ? React.createElement('div', { 
                className: 'loading-spinner',
                style: { width: '24px', height: '24px' } 
              }) : formatStat(recentAppointments.length)
            ),
            React.createElement('div', { 
              className: 'stat-label',
              style: { fontSize: '14px', fontWeight: '600' } 
            }, 'Recent Activities')
          )
        )
      )
    ),

    // Recent Appointments Section with Filters
    React.createElement('div', { 
      className: 'card', 
      style: { 
        padding: '24px', 
        marginBottom: '24px' 
      } 
    },
      React.createElement('div', { 
        style: { 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px'
        } 
      },
        React.createElement('h2', { 
          style: { 
            fontSize: '20px', 
            fontWeight: '600',
            color: 'var(--text)'
          } 
        }, 'Recent Appointments'),
        React.createElement('div', { 
          style: { 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            flexWrap: 'wrap'
          } 
        },
          // Filter Tabs
          React.createElement('div', { 
            style: { 
              display: 'flex', 
              background: '#f1f5f9', 
              padding: '4px', 
              borderRadius: '8px',
              gap: '4px'
            } 
          },
            ['all', 'today', 'scheduled', 'completed'].map(filter => 
              React.createElement('button', {
                key: filter,
                onClick: () => setActiveFilter(filter),
                style: {
                  padding: '6px 12px',
                  border: 'none',
                  background: activeFilter === filter ? 'white' : 'transparent',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: activeFilter === filter ? 'var(--primary)' : 'var(--text-light)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: activeFilter === filter ? 'var(--shadow)' : 'none'
                }
              }, filter.charAt(0).toUpperCase() + filter.slice(1))
            )
          ),
          React.createElement('button', {
            onClick: () => navigateTo('/appointments'),
            className: 'btn btn-outline',
            style: { fontSize: '14px', whiteSpace: 'nowrap' }
          }, 'View All →')
        )
      ),

      loading ? React.createElement('div', { 
        className: 'loading',
        style: { padding: '40px' } 
      }, 'Loading appointments...') :
      
      recentAppointments.length === 0 ? 
        React.createElement('div', { 
          style: { 
            textAlign: 'center', 
            padding: '40px', 
            color: 'var(--text-light)',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px'
          } 
        },
          React.createElement('div', { 
            style: { 
              fontSize: '48px', 
              marginBottom: '16px',
              opacity: '0.5'
            } 
          }, '📅'),
          React.createElement('h3', { 
            style: { 
              marginBottom: '8px', 
              color: 'var(--text)',
              fontSize: '18px',
              fontWeight: '600'
            } 
          }, 'No upcoming appointments'),
          React.createElement('p', { 
            style: { 
              marginBottom: '20px',
              maxWidth: '300px',
              margin: '0 auto 20px auto'
            } 
          }, 'Schedule your first appointment to get started'),
          React.createElement('button', {
            onClick: () => navigateTo('/appointments'),
            className: 'btn btn-primary'
          }, 'Schedule Appointment')
        ) :
        React.createElement('div', { 
          className: 'grid-container',
          style: {
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))'
          }
        },
          recentAppointments.slice(0, 6).map(appointment => {
            const appointmentDate = new Date(appointment.appointment_date);
            const isToday = appointmentDate.toDateString() === new Date().toDateString();
            
            return React.createElement('div', { 
              key: appointment.id,
              className: 'card appointment-card',
              style: { 
                cursor: 'pointer',
                borderLeft: isToday ? '4px solid var(--success)' : '4px solid transparent',
                transition: 'all 0.2s ease'
              },
              onClick: () => handleAppointmentClick(appointment),
              onMouseEnter: (e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
              },
              onMouseLeave: (e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow)';
              }
            },
              React.createElement('div', { className: 'card-header' },
                React.createElement('div', null,
                  React.createElement('div', { 
                    className: 'card-title',
                    style: { marginBottom: '4px' }
                  }, appointment.patient_name || 'Unknown Patient'),
                  React.createElement('div', { className: 'card-subtitle' }, 
                    `Dr. ${appointment.doctor_name || 'Unknown Doctor'} • ${isToday ? 'Today' : appointmentDate.toLocaleDateString()}`
                  )
                ),
                React.createElement('div', { 
                  className: `status-badge status-${appointment.status || 'scheduled'}`,
                  style: { fontSize: '11px' }
                }, appointment.status || 'scheduled')
              ),
              React.createElement('div', { 
                style: { 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  marginTop: '12px' 
                } 
              },
                React.createElement('span', { 
                  style: { 
                    color: 'var(--text)', 
                    fontSize: '14px', 
                    fontWeight: '600' 
                  } 
                },
                  appointmentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                ),
                React.createElement('span', { 
                  style: { 
                    padding: '4px 8px', 
                    backgroundColor: '#f1f5f9', 
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '500',
                    color: 'var(--text-light)',
                    textTransform: 'capitalize'
                  } 
                }, appointment.type || 'consultation')
              )
            );
          })
        )
    ),

    // Enhanced Quick Actions
    React.createElement('div', { 
      className: 'card', 
      style: { 
        padding: '24px' 
      } 
    },
      React.createElement('h2', { 
        style: { 
          fontSize: '20px', 
          fontWeight: '600', 
          marginBottom: '20px',
          color: 'var(--text)'
        } 
      }, 'Quick Actions'),
      React.createElement('div', { 
        style: { 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '16px' 
        } 
      },
        React.createElement('button', {
          onClick: () => navigateTo('/patients'),
          className: 'btn btn-primary',
          style: { 
            flexDirection: 'column', 
            height: '100px', 
            fontSize: '14px',
            gap: '12px'
          }
        }, 
          React.createElement('div', { 
            style: { 
              fontSize: '28px', 
              marginBottom: '4px' 
            } 
          }, '👥'),
          'Manage Patients'
        ),
        React.createElement('button', {
          onClick: () => navigateTo('/appointments'),
          className: 'btn btn-primary',
          style: { 
            flexDirection: 'column', 
            height: '100px', 
            fontSize: '14px',
            gap: '12px'
          }
        },
          React.createElement('div', { 
            style: { 
              fontSize: '28px', 
              marginBottom: '4px' 
            } 
          }, '📅'),
          'Schedule Appointment'
        ),
        React.createElement('button', {
          onClick: () => navigateTo('/reports'),
          className: 'btn btn-outline',
          style: { 
            flexDirection: 'column', 
            height: '100px', 
            fontSize: '14px',
            gap: '12px'
          }
        },
          React.createElement('div', { 
            style: { 
              fontSize: '28px', 
              marginBottom: '4px' 
            } 
          }, '📊'),
          'View Reports'
        ),
        React.createElement('button', {
          onClick: () => navigateTo('/medications'),
          className: 'btn btn-outline',
          style: { 
            flexDirection: 'column', 
            height: '100px', 
            fontSize: '14px',
            gap: '12px'
          }
        },
          React.createElement('div', { 
            style: { 
              fontSize: '28px', 
              marginBottom: '4px' 
            } 
          }, '💊'),
          ' Medications'
        )
      )
    )
  );
}
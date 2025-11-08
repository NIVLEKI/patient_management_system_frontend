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

  return React.createElement('div', { style: { maxWidth: '1200px', margin: '0 auto', padding: '24px' } },
    // Header
    React.createElement('div', { style: { marginBottom: '32px' } },
      React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' } },
        React.createElement('div', null,
          React.createElement('h1', { 
            style: { 
              fontSize: '32px',
              fontWeight: '700',
              color: 'var(--text)',
              marginBottom: '8px'
            } 
          }, `Welcome back, ${user.name || 'User'}!`),
          React.createElement('p', { 
            style: { 
              color: 'var(--text-light)',
              fontSize: '16px'
            } 
          }, `Here's what's happening with your patients today.`)
        ),
        React.createElement('button', {
          onClick: refreshData,
          className: 'btn btn-outline',
          disabled: loading,
          style: { display: 'flex', alignItems: 'center', gap: '8px' }
        },
          loading ? 'Refreshing...' : '⟳ Refresh Data'
        )
      )
    ),

    // Error Alert
    error && React.createElement('div', { 
      className: 'alert alert-error',
      style: { marginBottom: '24px' }
    }, error),

    // Stats Grid
    React.createElement('div', { className: 'stats-grid' },
      React.createElement('div', { className: 'card stat-card' },
        React.createElement('div', { className: 'stat-icon', style: { backgroundColor: '#e3f2fd' } }, '👥'),
        React.createElement('div', { className: 'stat-content' },
          React.createElement('div', { className: 'stat-value' }, 
            loading ? '...' : formatStat(stats.total_patients)
          ),
          React.createElement('div', { className: 'stat-label' }, 'Total Patients')
        )
      ),
      React.createElement('div', { className: 'card stat-card' },
        React.createElement('div', { className: 'stat-icon', style: { backgroundColor: '#e8f5e8' } }, '📅'),
        React.createElement('div', { className: 'stat-content' },
          React.createElement('div', { className: 'stat-value' }, 
            loading ? '...' : formatStat(stats.todays_appointments)
          ),
          React.createElement('div', { className: 'stat-label' }, "Today's Appointments")
        )
      ),
      React.createElement('div', { className: 'card stat-card' },
        React.createElement('div', { className: 'stat-icon', style: { backgroundColor: '#fff3e0' } }, '⏰'),
        React.createElement('div', { className: 'stat-content' },
          React.createElement('div', { className: 'stat-value' }, 
            loading ? '...' : formatStat(stats.upcoming_appointments)
          ),
          React.createElement('div', { className: 'stat-label' }, 'Upcoming Appointments')
        )
      ),
      React.createElement('div', { className: 'card stat-card' },
        React.createElement('div', { className: 'stat-icon', style: { backgroundColor: '#f3e5f5' } }, '📊'),
        React.createElement('div', { className: 'stat-content' },
          React.createElement('div', { className: 'stat-value' }, 
            loading ? '...' : formatStat(recentAppointments.length)
          ),
          React.createElement('div', { className: 'stat-label' }, 'Recent Activities')
        )
      )
    ),

    // Recent Appointments Section
    React.createElement('div', { className: 'card', style: { padding: '24px', marginBottom: '24px' } },
      React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' } },
        React.createElement('h2', { style: { fontSize: '20px', fontWeight: '600' } }, 'Recent Appointments'),
        React.createElement('button', {
          onClick: () => navigateTo('/appointments'),
          className: 'btn btn-outline',
          style: { fontSize: '14px' }
        }, 'View All')
      ),

      loading ? React.createElement('div', { className: 'loading' }, 'Loading appointments...') :
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
          React.createElement('div', { style: { fontSize: '48px', marginBottom: '16px' } }, '📅'),
          React.createElement('h3', { style: { marginBottom: '8px', color: 'var(--text)' } }, 'No upcoming appointments'),
          React.createElement('p', { style: { marginBottom: '20px' } }, 
            'Schedule your first appointment to get started'
          ),
          React.createElement('button', {
            onClick: () => navigateTo('/appointments'),
            className: 'btn btn-primary'
          }, 'Schedule Appointment')
        ) :
        React.createElement('div', { className: 'grid-container' },
          recentAppointments.slice(0, 6).map(appointment => {
            const appointmentDate = new Date(appointment.appointment_date);
            const isToday = appointmentDate.toDateString() === new Date().toDateString();
            
            return React.createElement('div', { 
              key: appointment.id,
              className: 'card appointment-card',
              style: { 
                cursor: 'pointer',
                borderLeft: isToday ? '4px solid var(--primary)' : '4px solid transparent'
              },
              onClick: () => handleAppointmentClick(appointment)
            },
              React.createElement('div', { className: 'card-header' },
                React.createElement('div', null,
                  React.createElement('div', { className: 'card-title' }, appointment.patient_name || 'Unknown Patient'),
                  React.createElement('div', { className: 'card-subtitle' }, 
                    `Dr. ${appointment.doctor_name || 'Unknown Doctor'} • ${isToday ? 'Today' : appointmentDate.toLocaleDateString()}`
                  )
                ),
                React.createElement('div', { 
                  className: `status-badge status-${appointment.status || 'scheduled'}` 
                }, appointment.status || 'scheduled')
              ),
              React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' } },
                React.createElement('span', { style: { color: 'var(--text-light)', fontSize: '14px', fontWeight: '500' } },
                  appointmentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                ),
                React.createElement('span', { style: { 
                  padding: '4px 8px', 
                  backgroundColor: '#f1f5f9', 
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: 'var(--text-light)'
                } }, appointment.type || 'consultation')
              )
            );
          })
        )
    ),

    // Quick Actions
    React.createElement('div', { className: 'card', style: { padding: '24px' } },
      React.createElement('h2', { style: { fontSize: '20px', fontWeight: '600', marginBottom: '20px' } }, 'Quick Actions'),
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' } },
        React.createElement('button', {
          onClick: () => navigateTo('/patients'),
          className: 'btn btn-primary',
          style: { flexDirection: 'column', height: '80px', fontSize: '14px' }
        }, 
          React.createElement('div', { style: { fontSize: '24px', marginBottom: '8px' } }, '👥'),
          'Manage Patients'
        ),
        React.createElement('button', {
          onClick: () => navigateTo('/appointments'),
          className: 'btn btn-primary',
          style: { flexDirection: 'column', height: '80px', fontSize: '14px' }
        },
          React.createElement('div', { style: { fontSize: '24px', marginBottom: '8px' } }, '📅'),
          'Schedule Appointment'
        ),
        React.createElement('button', {
          onClick: () => navigateTo('/reports'),
          className: 'btn btn-outline',
          style: { flexDirection: 'column', height: '80px', fontSize: '14px' }
        },
          React.createElement('div', { style: { fontSize: '24px', marginBottom: '8px' } }, '📊'),
          'View Reports'
        ),
        React.createElement('button', {
          onClick: () => navigateTo('/medications'),
          className: 'btn btn-outline',
          style: { flexDirection: 'column', height: '80px', fontSize: '14px' }
        },
          React.createElement('div', { style: { fontSize: '24px', marginBottom: '8px' } }, '💊'),
          'Medications'
        )
      )
    )
  );
}
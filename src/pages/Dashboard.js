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
  const [refreshing, setRefreshing] = useState(false);

  // API Base URL for production
  const API_BASE_URL = 'https://patient-management-system-in-python.onrender.com/api';

  const fetchDashboardData = async () => {
    try {
      setError('');
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Use Promise.all for parallel requests
      const [statsResponse, appointmentsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/dashboard/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/dashboard/recent-appointments`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
      
      if (!statsResponse.ok) {
        throw new Error('Failed to fetch dashboard statistics');
      }

      if (!appointmentsResponse.ok) {
        throw new Error('Failed to fetch recent appointments');
      }

      const statsData = await statsResponse.json();
      const appointmentsData = await appointmentsResponse.json();
      
      setStats(statsData.stats || {});
      setRecentAppointments(appointmentsData.appointments || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const refreshData = () => {
    setRefreshing(true);
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
    console.log('Appointment clicked:', appointment);
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: '#3b82f6',
      completed: '#10b981',
      cancelled: '#ef4444',
      pending: '#f59e0b'
    };
    return colors[status] || '#6b7280';
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      scheduled: 'status-scheduled',
      completed: 'status-completed',
      cancelled: 'status-cancelled',
      pending: 'status-pending'
    };
    return statusColors[status] || 'status-default';
  };

  const filteredAppointments = recentAppointments.filter(appointment => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'today') {
      const appointmentDate = new Date(appointment.appointment_date);
      return appointmentDate.toDateString() === new Date().toDateString();
    }
    return appointment.status === activeFilter;
  });

  if (!user) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Please login to access dashboard</p>
      </div>
    );
  }

  // Format numbers with proper fallbacks
  const formatStat = (value) => {
    if (value === undefined || value === null) return '0';
    return value.toString();
  };

  return (
    <div className="dashboard-container">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="welcome-section">
            <h1 className="welcome-title">
              Welcome back, {user.name || 'User'}!
            </h1>
            <p className="welcome-subtitle">
              Here's what's happening with your patients today.
            </p>
          </div>
          <button
            onClick={refreshData}
            className={`refresh-btn ${refreshing ? 'refreshing' : ''}`}
            disabled={refreshing}
          >
            <span className={`refresh-icon ${refreshing ? 'spinning' : ''}`}>
              🔄
            </span>
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-error slide-in">
          <div className="alert-content">
            <span className="alert-icon">⚠️</span>
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="alert-close">
            ×
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card fade-in">
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
            <span className="stat-icon">👥</span>
          </div>
          <div className="stat-content">
            <div className="stat-value">
              {loading ? (
                <div className="stat-skeleton"></div>
              ) : (
                formatStat(stats.total_patients)
              )}
            </div>
            <div className="stat-label">Total Patients</div>
            <div className="stat-trend">All time</div>
          </div>
        </div>

        <div className="stat-card fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
            <span className="stat-icon">📅</span>
          </div>
          <div className="stat-content">
            <div className="stat-value">
              {loading ? (
                <div className="stat-skeleton"></div>
              ) : (
                formatStat(stats.todays_appointments)
              )}
            </div>
            <div className="stat-label">Today's Appointments</div>
            <div className="stat-trend">Scheduled for today</div>
          </div>
        </div>

        <div className="stat-card fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
            <span className="stat-icon">⏰</span>
          </div>
          <div className="stat-content">
            <div className="stat-value">
              {loading ? (
                <div className="stat-skeleton"></div>
              ) : (
                formatStat(stats.upcoming_appointments)
              )}
            </div>
            <div className="stat-label">Upcoming</div>
            <div className="stat-trend">Next 7 days</div>
          </div>
        </div>

        <div className="stat-card fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)' }}>
            <span className="stat-icon">📊</span>
          </div>
          <div className="stat-content">
            <div className="stat-value">
              {loading ? (
                <div className="stat-skeleton"></div>
              ) : (
                formatStat(recentAppointments.length)
              )}
            </div>
            <div className="stat-label">Recent Activities</div>
            <div className="stat-trend">Last 30 days</div>
          </div>
        </div>
      </div>

      {/* Recent Appointments Section */}
      <div className="dashboard-card appointments-section">
        <div className="card-header">
          <h2 className="card-title">Recent Appointments</h2>
          <div className="header-actions">
            <div className="filter-tabs">
              {['all', 'today', 'scheduled', 'completed'].map(filter => (
                <button
                  key={filter}
                  className={`filter-tab ${activeFilter === filter ? 'active' : ''}`}
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
            <button
              onClick={() => navigateTo('/appointments')}
              className="view-all-btn"
            >
              View All →
            </button>
          </div>
        </div>

        <div className="card-content">
          {loading ? (
            <div className="loading-appointments">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="appointment-skeleton">
                  <div className="skeleton-avatar"></div>
                  <div className="skeleton-content">
                    <div className="skeleton-line"></div>
                    <div className="skeleton-line short"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <h3 className="empty-title">No appointments found</h3>
              <p className="empty-description">
                {activeFilter === 'all' 
                  ? "You don't have any appointments scheduled yet."
                  : `No ${activeFilter} appointments found.`
                }
              </p>
              <button
                onClick={() => navigateTo('/appointments')}
                className="btn-primary"
              >
                Schedule Appointment
              </button>
            </div>
          ) : (
            <div className="appointments-grid">
              {filteredAppointments.slice(0, 6).map((appointment, index) => {
                const appointmentDate = new Date(appointment.appointment_date);
                const isToday = appointmentDate.toDateString() === new Date().toDateString();
                const isUpcoming = appointmentDate > new Date();
                
                return (
                  <div
                    key={appointment.id}
                    className={`appointment-card ${isToday ? 'today' : ''} fade-in`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                    onClick={() => handleAppointmentClick(appointment)}
                  >
                    <div className="appointment-header">
                      <div className="patient-info">
                        <div className="patient-name">{appointment.patient_name || 'Unknown Patient'}</div>
                        <div className="appointment-meta">
                          Dr. {appointment.doctor_name || 'Unknown Doctor'} • {isToday ? 'Today' : appointmentDate.toLocaleDateString()}
                        </div>
                      </div>
                      <div className={`status-badge ${getStatusBadge(appointment.status)}`}>
                        {appointment.status || 'scheduled'}
                      </div>
                    </div>
                    <div className="appointment-footer">
                      <span className="appointment-time">
                        {appointmentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="appointment-type">
                        {appointment.type || 'consultation'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-card quick-actions-section">
        <h2 className="card-title">Quick Actions</h2>
        <div className="quick-actions-grid">
          <button
            onClick={() => navigateTo('/patients')}
            className="quick-action-btn primary"
          >
            <span className="action-icon">👥</span>
            <span className="action-label">Manage Patients</span>
          </button>
          
          <button
            onClick={() => navigateTo('/appointments')}
            className="quick-action-btn primary"
          >
            <span className="action-icon">📅</span>
            <span className="action-label">Schedule Appointment</span>
          </button>
          
          <button
            onClick={() => navigateTo('/reports')}
            className="quick-action-btn secondary"
          >
            <span className="action-icon">📊</span>
            <span className="action-label">View Reports</span>
          </button>
          
          <button
            onClick={() => navigateTo('/medications')}
            className="quick-action-btn secondary"
          >
            <span className="action-icon">💊</span>
            <span className="action-label">Medications</span>
          </button>
        </div>
      </div>

      {/* Add the CSS directly in the component for immediate use */}
      <style jsx>{`
        .dashboard-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px;
          min-height: 100vh;
          background: #f8fafc;
        }

        .dashboard-header {
          margin-bottom: 32px;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 16px;
        }

        .welcome-title {
          font-size: 32px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 8px;
          background: linear-gradient(135deg, #1f2937 0%, #4b5563 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .welcome-subtitle {
          color: #6b7280;
          font-size: 16px;
          margin: 0;
        }

        .refresh-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          color: #374151;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .refresh-btn:hover:not(:disabled) {
          background: #f9fafb;
          border-color: #d1d5db;
          transform: translateY(-1px);
        }

        .refresh-btn.refreshing {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .refresh-icon {
          transition: transform 0.3s ease;
        }

        .refresh-icon.spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .alert {
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
        }

        .alert-content {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .alert-close {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          color: #dc2626;
        }

        .slide-in {
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
          margin-bottom: 32px;
        }

        .stat-card {
          background: white;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
          border: 1px solid #e5e7eb;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }

        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6);
        }

        .stat-icon-wrapper {
          width: 48px;
          height: 48px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }

        .stat-icon {
          font-size: 20px;
        }

        .stat-value {
          font-size: 32px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 14px;
          color: #6b7280;
          font-weight: 500;
          margin-bottom: 2px;
        }

        .stat-trend {
          font-size: 12px;
          color: #9ca3af;
        }

        .stat-skeleton {
          width: 60px;
          height: 32px;
          background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 4px;
        }

        .fade-in {
          animation: fadeIn 0.6s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes loading {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }

        .dashboard-card {
          background: white;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
          border: 1px solid #e5e7eb;
          margin-bottom: 24px;
          transition: all 0.3s ease;
        }

        .dashboard-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .card-title {
          font-size: 20px;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .filter-tabs {
          display: flex;
          background: #f3f4f6;
          padding: 4px;
          border-radius: 8px;
        }

        .filter-tab {
          padding: 6px 12px;
          border: none;
          background: none;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .filter-tab.active {
          background: white;
          color: #1f2937;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        }

        .view-all-btn {
          padding: 8px 16px;
          border: 1px solid #e5e7eb;
          background: white;
          border-radius: 6px;
          color: #374151;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .view-all-btn:hover {
          border-color: #d1d5db;
          background: #f9fafb;
        }

        .loading-appointments {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .appointment-skeleton {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
        }

        .skeleton-avatar {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
        }

        .skeleton-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .skeleton-line {
          height: 12px;
          background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 4px;
        }

        .skeleton-line.short {
          width: 60%;
        }

        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: #6b7280;
        }

        .empty-icon {
          font-size: 48px;
          margin-bottom: 16px;
          opacity: 0.5;
        }

        .empty-title {
          font-size: 18px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 8px;
        }

        .empty-description {
          margin-bottom: 20px;
          max-width: 300px;
          margin-left: auto;
          margin-right: auto;
        }

        .btn-primary {
          padding: 10px 20px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-primary:hover {
          background: #2563eb;
          transform: translateY(-1px);
        }

        .appointments-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 16px;
        }

        .appointment-card {
          background: white;
          padding: 16px;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }

        .appointment-card:hover {
          border-color: #3b82f6;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
        }

        .appointment-card.today {
          border-left: 4px solid #10b981;
        }

        .appointment-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .patient-info {
          flex: 1;
        }

        .patient-name {
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 4px;
        }

        .appointment-meta {
          font-size: 12px;
          color: #6b7280;
        }

        .status-badge {
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          text-transform: capitalize;
        }

        .status-scheduled {
          background: #dbeafe;
          color: #1e40af;
        }

        .status-completed {
          background: #d1fae5;
          color: #065f46;
        }

        .status-cancelled {
          background: #fee2e2;
          color: #991b1b;
        }

        .status-pending {
          background: #fef3c7;
          color: #92400e;
        }

        .status-default {
          background: #f3f4f6;
          color: #374151;
        }

        .appointment-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .appointment-time {
          color: #374151;
          font-size: 14px;
          font-weight: 500;
        }

        .appointment-type {
          padding: 4px 8px;
          background: #f8fafc;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          color: #64748b;
          text-transform: capitalize;
        }

        .quick-actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .quick-action-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100px;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          gap: 8px;
          font-size: 14px;
          font-weight: 500;
        }

        .quick-action-btn.primary {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
        }

        .quick-action-btn.secondary {
          background: white;
          color: #374151;
          border: 1px solid #e5e7eb;
        }

        .quick-action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px -5px rgba(0, 0, 0, 0.2);
        }

        .quick-action-btn.primary:hover {
          background: linear-gradient(135deg, #2563eb, #1e40af);
        }

        .quick-action-btn.secondary:hover {
          border-color: #d1d5db;
          background: #f9fafb;
        }

        .action-icon {
          font-size: 24px;
        }

        .action-label {
          font-size: 14px;
          font-weight: 500;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .dashboard-container {
            padding: 16px;
          }

          .header-content {
            flex-direction: column;
            align-items: stretch;
          }

          .welcome-title {
            font-size: 24px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .card-header {
            flex-direction: column;
            align-items: stretch;
          }

          .header-actions {
            justify-content: space-between;
          }

          .appointments-grid {
            grid-template-columns: 1fr;
          }

          .quick-actions-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 480px) {
          .quick-actions-grid {
            grid-template-columns: 1fr;
          }

          .filter-tabs {
            width: 100%;
            justify-content: space-between;
          }

          .filter-tab {
            flex: 1;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Profile() {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // API Base URL for production
  const API_BASE_URL = 'https://patient-management-system-in-python.onrender.com/api';

  useEffect(() => {
    if (user) {
      setProfileData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear messages when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Prepare update data
      const updateData = {
        name: profileData.name,
        email: profileData.email
      };

      // Only include password fields if they are filled
      if (profileData.currentPassword && profileData.newPassword) {
        if (profileData.newPassword !== profileData.confirmPassword) {
          throw new Error('New passwords do not match');
        }
        if (profileData.newPassword.length < 8) {
          throw new Error('New password must be at least 8 characters long');
        }
        updateData.current_password = profileData.currentPassword;
        updateData.new_password = profileData.newPassword;
      }

      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      const data = await response.json();
      
      setSuccess('Profile updated successfully!');
      
      // Clear password fields
      setProfileData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setProfileData({
      name: user?.name || '',
      email: user?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setError('');
    setSuccess('');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatRole = (role) => {
    if (!role) return 'User';
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!user) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Please login to view profile</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="profile-header">
        <h1 className="profile-title">My Profile</h1>
        <p className="profile-subtitle">Manage your account settings and preferences</p>
      </div>

      <div className="profile-layout">
        {/* Profile Summary Card */}
        <div className="card profile-summary">
          <div className="profile-avatar-section">
            <div className="profile-avatar">
              {getInitials(user.name)}
            </div>
            <h2 className="profile-name">{user.name || 'User'}</h2>
            <p className="profile-email">{user.email || 'No email'}</p>
            <div className="role-badge">
              {formatRole(user.role)}
            </div>
          </div>

          <div className="profile-details">
            <div className="detail-item">
              <span className="detail-label">Member since</span>
              <span className="detail-value">{formatDate(user.created_at)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">User ID</span>
              <span className="detail-value user-id">{user.id || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Last login</span>
              <span className="detail-value">Just now</span>
            </div>
          </div>
        </div>

        {/* Profile Edit Form */}
        <div className="card profile-form">
          <div className="form-header">
            <h2 className="form-title">Edit Profile</h2>
            <button
              onClick={resetForm}
              className="btn btn-outline reset-btn"
              disabled={loading}
            >
              Reset Form
            </button>
          </div>

          {error && (
            <div className="alert alert-error fade-in">
              <span>⚠️</span>
              {error}
            </div>
          )}
          
          {success && (
            <div className="alert alert-success fade-in">
              <span>✅</span>
              {success}
            </div>
          )}

          <form onSubmit={updateProfile}>
            {/* Personal Information Section */}
            <div className="form-section">
              <h3 className="section-title">Personal Information</h3>

              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter your full name"
                  value={profileData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="Enter your email address"
                  value={profileData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Change Section */}
            <div className="form-section">
              <h3 className="section-title">Change Password</h3>
              <p className="section-description">
                Leave password fields blank if you don't want to change your password.
              </p>

              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Enter current password"
                  value={profileData.currentPassword}
                  onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Enter new password (min. 8 characters)"
                  value={profileData.newPassword}
                  onChange={(e) => handleInputChange('newPassword', e.target.value)}
                  disabled={loading}
                  minLength={8}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Confirm new password"
                  value={profileData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-outline logout-btn"
                onClick={logout}
                disabled={loading}
              >
                🚪 Logout
              </button>
              
              <div className="action-buttons">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={resetForm}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="loading-button">
                      <div className="loading-spinner-small"></div>
                      Updating...
                    </div>
                  ) : (
                    'Update Profile'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        .page-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px;
        }

        .profile-header {
          margin-bottom: 32px;
          text-align: center;
        }

        .profile-title {
          font-size: clamp(28px, 4vw, 36px);
          font-weight: 700;
          color: var(--text);
          margin-bottom: 8px;
          background: linear-gradient(135deg, var(--text) 0%, var(--text-light) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .profile-subtitle {
          color: var(--text-light);
          font-size: 16px;
          max-width: 500px;
          margin: 0 auto;
        }

        .profile-layout {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 32px;
          align-items: start;
        }

        /* Profile Summary Styles */
        .profile-summary {
          padding: 32px;
          height: fit-content;
          position: sticky;
          top: 100px;
        }

        .profile-avatar-section {
          text-align: center;
          margin-bottom: 24px;
        }

        .profile-avatar {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary), var(--primary-dark));
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          color: white;
          margin: 0 auto 20px auto;
          font-weight: 600;
          box-shadow: var(--shadow-lg);
        }

        .profile-name {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 4px;
          color: var(--text);
        }

        .profile-email {
          color: var(--text-light);
          font-size: 14px;
          margin-bottom: 12px;
        }

        .role-badge {
          padding: 6px 16px;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          display: inline-block;
          box-shadow: var(--shadow);
        }

        .profile-details {
          border-top: 1px solid var(--border);
          padding-top: 24px;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          padding: 12px 0;
        }

        .detail-item:not(:last-child) {
          border-bottom: 1px solid #f1f5f9;
        }

        .detail-label {
          color: var(--text-light);
          font-size: 14px;
          font-weight: 500;
        }

        .detail-value {
          font-weight: 600;
          font-size: 14px;
          color: var(--text);
        }

        .user-id {
          font-family: 'Monaco', 'Consolas', monospace;
          background: #f8fafc;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
        }

        /* Profile Form Styles */
        .profile-form {
          padding: 32px;
        }

        .form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .form-title {
          font-size: 24px;
          font-weight: 600;
          color: var(--text);
          margin: 0;
        }

        .reset-btn {
          font-size: 14px;
          padding: 8px 16px;
        }

        .form-section {
          margin-bottom: 32px;
        }

        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--text);
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 2px solid var(--border);
        }

        .section-description {
          color: var(--text-light);
          font-size: 14px;
          margin-bottom: 20px;
          line-height: 1.5;
        }

        .form-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          padding-top: 24px;
          border-top: 1px solid var(--border);
        }

        .logout-btn {
          color: var(--error);
          border-color: var(--error);
          padding: 10px 20px;
        }

        .logout-btn:hover {
          background: var(--error);
          color: white;
        }

        .action-buttons {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .loading-button {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .loading-spinner-small {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        /* Responsive Design */
        @media (max-width: 968px) {
          .profile-layout {
            grid-template-columns: 1fr;
            gap: 24px;
          }

          .profile-summary {
            position: static;
          }

          .form-header {
            flex-direction: column;
            align-items: stretch;
          }

          .reset-btn {
            align-self: flex-end;
          }
        }

        @media (max-width: 640px) {
          .page-container {
            padding: 16px;
          }

          .profile-summary,
          .profile-form {
            padding: 24px;
          }

          .profile-avatar {
            width: 80px;
            height: 80px;
            font-size: 24px;
          }

          .form-actions {
            flex-direction: column;
            align-items: stretch;
          }

          .action-buttons {
            justify-content: space-between;
          }

          .logout-btn {
            order: 2;
          }
        }

        @media (max-width: 480px) {
          .profile-summary,
          .profile-form {
            padding: 20px;
          }

          .action-buttons {
            flex-direction: column;
          }

          .detail-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .fade-in {
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
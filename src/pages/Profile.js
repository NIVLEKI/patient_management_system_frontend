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
      
      // Update user in context (we'll need to modify AuthContext for this)
      // For now, show success message and clear password fields
      setSuccess('Profile updated successfully!');
      
      // Clear password fields
      setProfileData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));

      // Show success message for a while before refreshing
      setTimeout(() => {
        const { navigate } = useNavigate();
        navigate('/profile'); // Or just remove the reload
      }, 2000);
      
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
    return React.createElement('div', { className: 'loading' }, 'Please login to view profile');
  }

  return React.createElement('div', { style: { maxWidth: '800px', margin: '0 auto', padding: '24px' } },
    // Header
    React.createElement('div', { style: { marginBottom: '32px' } },
      React.createElement('h1', { 
        style: { 
          fontSize: '32px',
          fontWeight: '700',
          color: 'var(--text)',
          marginBottom: '8px'
        } 
      }, 'My Profile'),
      React.createElement('p', { 
        style: { 
          color: 'var(--text-light)',
          fontSize: '16px'
        } 
      }, 'Manage your account settings and preferences')
    ),

    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px', alignItems: 'start' } },
      // Profile Summary Card
      React.createElement('div', { className: 'card', style: { padding: '24px', height: 'fit-content' } },
        React.createElement('div', { style: { textAlign: 'center', marginBottom: '24px' } },
          React.createElement('div', { 
            style: { 
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              color: 'white',
              margin: '0 auto 16px auto',
              fontWeight: '600'
            } 
          }, getInitials(user.name)),
          React.createElement('h2', { style: { fontSize: '20px', fontWeight: '600', marginBottom: '4px' } }, user.name || 'User'),
          React.createElement('p', { style: { color: 'var(--text-light)', fontSize: '14px', marginBottom: '8px' } }, user.email || 'No email'),
          React.createElement('div', { 
            style: { 
              padding: '4px 12px',
              backgroundColor: '#f0fdf4',
              color: '#166534',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '500',
              display: 'inline-block'
            } 
          }, formatRole(user.role))
        ),

        React.createElement('div', { style: { borderTop: '1px solid var(--border)', paddingTop: '20px' } },
          React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '12px' } },
            React.createElement('span', { style: { color: 'var(--text-light)', fontSize: '14px' } }, 'Member since'),
            React.createElement('span', { style: { fontWeight: '500', fontSize: '14px' } }, 
              formatDate(user.created_at)
            )
          ),
          React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '12px' } },
            React.createElement('span', { style: { color: 'var(--text-light)', fontSize: '14px' } }, 'User ID'),
            React.createElement('span', { style: { fontWeight: '500', fontSize: '14px', fontFamily: 'monospace' } }, 
              user.id || 'N/A'
            )
          ),
          React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between' } },
            React.createElement('span', { style: { color: 'var(--text-light)', fontSize: '14px' } }, 'Last login'),
            React.createElement('span', { style: { fontWeight: '500', fontSize: '14px' } }, 
              'Just now'
            )
          )
        )
      ),

      // Profile Edit Form
      React.createElement('div', { className: 'card', style: { padding: '32px' } },
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' } },
          React.createElement('h2', { style: { fontSize: '20px', fontWeight: '600' } }, 'Edit Profile'),
          React.createElement('button', {
            onClick: resetForm,
            className: 'btn btn-outline',
            style: { fontSize: '12px', padding: '6px 12px' },
            disabled: loading
          }, 'Reset Form')
        ),

        error && React.createElement('div', { className: 'alert alert-error' }, error),
        success && React.createElement('div', { className: 'alert alert-success' }, success),

        React.createElement('form', { onSubmit: updateProfile },
          // Personal Information Section
          React.createElement('div', { style: { marginBottom: '32px' } },
            React.createElement('h3', { 
              style: { 
                fontSize: '16px',
                fontWeight: '600',
                color: 'var(--text)',
                marginBottom: '16px',
                paddingBottom: '8px',
                borderBottom: '1px solid var(--border)'
              } 
            }, 'Personal Information'),

            React.createElement('div', { className: 'form-group' },
              React.createElement('label', { className: 'form-label' }, 'Full Name *'),
              React.createElement('input', {
                type: 'text',
                className: 'form-input',
                placeholder: 'Enter your full name',
                value: profileData.name,
                onChange: (e) => handleInputChange('name', e.target.value),
                required: true,
                disabled: loading
              })
            ),

            React.createElement('div', { className: 'form-group' },
              React.createElement('label', { className: 'form-label' }, 'Email Address *'),
              React.createElement('input', {
                type: 'email',
                className: 'form-input',
                placeholder: 'Enter your email address',
                value: profileData.email,
                onChange: (e) => handleInputChange('email', e.target.value),
                required: true,
                disabled: loading
              })
            )
          ),

          // Password Change Section
          React.createElement('div', { style: { marginBottom: '32px' } },
            React.createElement('h3', { 
              style: { 
                fontSize: '16px',
                fontWeight: '600',
                color: 'var(--text)',
                marginBottom: '16px',
                paddingBottom: '8px',
                borderBottom: '1px solid var(--border)'
              } 
            }, 'Change Password'),
            React.createElement('p', { 
              style: { 
                color: 'var(--text-light)',
                fontSize: '14px',
                marginBottom: '16px'
              } 
            }, 'Leave password fields blank if you don\'t want to change your password.'),

            React.createElement('div', { className: 'form-group' },
              React.createElement('label', { className: 'form-label' }, 'Current Password'),
              React.createElement('input', {
                type: 'password',
                className: 'form-input',
                placeholder: 'Enter current password',
                value: profileData.currentPassword,
                onChange: (e) => handleInputChange('currentPassword', e.target.value),
                disabled: loading
              })
            ),

            React.createElement('div', { className: 'form-group' },
              React.createElement('label', { className: 'form-label' }, 'New Password'),
              React.createElement('input', {
                type: 'password',
                className: 'form-input',
                placeholder: 'Enter new password (min. 8 characters)',
                value: profileData.newPassword,
                onChange: (e) => handleInputChange('newPassword', e.target.value),
                disabled: loading,
                minLength: 8
              })
            ),

            React.createElement('div', { className: 'form-group' },
              React.createElement('label', { className: 'form-label' }, 'Confirm New Password'),
              React.createElement('input', {
                type: 'password',
                className: 'form-input',
                placeholder: 'Confirm new password',
                value: profileData.confirmPassword,
                onChange: (e) => handleInputChange('confirmPassword', e.target.value),
                disabled: loading
              })
            )
          ),

          // Action Buttons
          React.createElement('div', { style: { display: 'flex', gap: '12px', justifyContent: 'space-between', alignItems: 'center' } },
            React.createElement('button', {
              type: 'button',
              className: 'btn btn-outline',
              onClick: logout,
              disabled: loading,
              style: { color: 'var(--error)', borderColor: 'var(--error)' }
            }, 'Logout'),
            
            React.createElement('div', { style: { display: 'flex', gap: '12px' } },
              React.createElement('button', {
                type: 'button',
                className: 'btn btn-outline',
                onClick: resetForm,
                disabled: loading
              }, 'Cancel'),
              React.createElement('button', {
                type: 'submit',
                className: 'btn btn-primary',
                disabled: loading
              }, loading ? 
                React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
                  React.createElement('div', { 
                    style: {
                      width: '16px',
                      height: '16px',
                      border: '2px solid transparent',
                      borderTop: '2px solid currentColor',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    } 
                  }),
                  'Updating...'
                ) : 
                'Update Profile'
              )
            )
          )
        )
      )
    )
  );
}
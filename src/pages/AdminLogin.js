import React, { useState } from 'react';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const API_BASE_URL = 'https://patient-management-system-in-python.onrender.com/api';

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok) {
        // Store admin data and token
        localStorage.setItem('adminUser', JSON.stringify(data.admin));
        localStorage.setItem('adminToken', data.access_token);
        
        // Redirect to admin dashboard
        window.location.href = '/admin-dashboard';
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return React.createElement('div', { 
    style: { 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%)',
      padding: '20px'
    } 
  },
    React.createElement('div', { 
      className: 'card',
      style: { 
        width: '100%',
        maxWidth: '400px',
        padding: '40px'
      } 
    },
      React.createElement('div', { style: { textAlign: 'center', marginBottom: '32px' } },
        React.createElement('h1', { 
          style: { 
            fontSize: '28px',
            fontWeight: '700',
            color: 'var(--text)',
            marginBottom: '8px'
          } 
        }, 'Admin Portal'),
        React.createElement('p', { 
          style: { 
            color: 'var(--text-light)',
            fontSize: '16px'
          } 
        }, 'Administrator access only')
      ),

      error && React.createElement('div', { 
        className: 'alert alert-error'
      }, error),

      React.createElement('form', { onSubmit: handleAdminLogin },
        React.createElement('div', { className: 'form-group' },
          React.createElement('label', { className: 'form-label' }, 'Admin Username'),
          React.createElement('input', {
            type: 'text',
            className: 'form-input',
            placeholder: 'Enter admin username',
            value: username,
            onChange: (e) => setUsername(e.target.value),
            required: true,
            disabled: isLoading
          })
        ),
        
        React.createElement('div', { className: 'form-group' },
          React.createElement('label', { className: 'form-label' }, 'Admin Password'),
          React.createElement('input', {
            type: 'password',
            className: 'form-input',
            placeholder: 'Enter admin password',
            value: password,
            onChange: (e) => setPassword(e.target.value),
            required: true,
            disabled: isLoading
          })
        ),
        
        React.createElement('button', {
          type: 'submit',
          className: 'btn btn-primary',
          disabled: isLoading,
          style: { width: '100%', marginBottom: '16px' }
        }, 
          isLoading 
            ? React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'center' } },
                React.createElement('div', { className: 'loading-spinner' }),
                'Authenticating...'
              )
            : 'Admin Login'
        )
      ),

      React.createElement('div', { style: { textAlign: 'center', marginTop: '24px' } },
        React.createElement('button', {
          onClick: () => window.location.href = '/login',
          style: {
            background: 'none',
            border: 'none',
            color: 'var(--primary)',
            cursor: 'pointer',
            fontWeight: '500',
            fontSize: '14px'
          }
        }, '← Back to User Login')
      )
    )
  );
}
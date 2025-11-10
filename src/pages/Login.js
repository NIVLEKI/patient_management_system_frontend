import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, register, error, clearError } = useAuth(); // Removed demoLogin

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    clearError();
    
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register({ name, email, password });
      }
    } catch (err) {
      // Error handled in context
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
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
        }, 'Nivlek Hospital Patient Management System'),
        React.createElement('p', { 
          style: { 
            color: 'var(--text-light)',
            fontSize: '16px'
          } 
        }, isLogin ? 'Sign in to your account' : 'Create your account')
      ),

      error && React.createElement('div', { 
        className: 'alert alert-error'
      }, error),

      React.createElement('form', { onSubmit: handleSubmit },
        !isLogin && React.createElement('div', { className: 'form-group' },
          React.createElement('label', { className: 'form-label' }, 'Full Name'),
          React.createElement('input', {
            type: 'text',
            className: 'form-input',
            placeholder: 'Enter your full name',
            value: name,
            onChange: (e) => setName(e.target.value),
            required: !isLogin,
            disabled: isLoading
          })
        ),
        
        React.createElement('div', { className: 'form-group' },
          React.createElement('label', { className: 'form-label' }, 'Email Address'),
          React.createElement('input', {
            type: 'email',
            className: 'form-input',
            placeholder: 'Enter your email',
            value: email,
            onChange: (e) => setEmail(e.target.value),
            required: true,
            disabled: isLoading
          })
        ),
        
        React.createElement('div', { className: 'form-group' },
          React.createElement('label', { className: 'form-label' }, 'Password'),
          React.createElement('input', {
            type: 'password',
            className: 'form-input',
            placeholder: 'Enter your password',
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
                'Loading...'
              )
            : (isLogin ? 'Sign In' : 'Create Account')
        )
      ),

      // Admin link section
      React.createElement('div', { 
        style: { 
          textAlign: 'center', 
          marginBottom: '24px',
          padding: '16px',
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        } 
      },
        React.createElement(Link, {
          to: '/admin-login',
          style: {
            color: 'var(--primary)',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '14px',
            display: 'block'
          }
        }, '🔐 Are you an admin? Click here to access admin panel')
      ),

      React.createElement('div', { style: { textAlign: 'center' } },
        React.createElement('p', { style: { color: 'var(--text-light)', fontSize: '14px' } },
          isLogin ? "Don't have an account? " : "Already have an account? ",
          React.createElement('button', {
            onClick: () => {
              setIsLogin(!isLogin);
              clearError();
            },
            style: {
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              cursor: 'pointer',
              fontWeight: '500'
            }
          }, isLogin ? 'Sign up' : 'Sign in')
        )
      )
    )
  );
}
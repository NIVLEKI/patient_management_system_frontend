import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Appointments from './pages/Appointments';
import Profile from './pages/Profile';
import Reports from './pages/Reports';
import Medications from './pages/medication';

function Loading() {
  return React.createElement('div', { className: 'loading' },
    React.createElement('div', { className: 'loading-spinner' }),
    'Loading...'
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) return React.createElement(Loading);
  return user ? children : React.createElement(Navigate, { to: '/login' });
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) return React.createElement(Loading);
  return !user ? children : React.createElement(Navigate, { to: '/dashboard' });
}

function Navigation() {
  const { user, logout } = useAuth();
  const location = useLocation();
  
  if (!user) return null;

  const isActive = (path) => location.pathname === path;

  return React.createElement('nav', { className: 'navbar' },
    React.createElement('div', { className: 'nav-content' },
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '32px' } },
        React.createElement('div', { 
          style: { 
            fontSize: '20px', 
            fontWeight: '700', 
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          } 
        },
          '🏥',
          'PMS'
        ),
        React.createElement('div', { className: 'nav-links' },
          React.createElement(Link, { 
            to: '/dashboard',
            className: `nav-link ${isActive('/dashboard') ? 'active' : ''}`
          }, 'Dashboard'),
          React.createElement(Link, { 
            to: '/patients',
            className: `nav-link ${isActive('/patients') ? 'active' : ''}`
          }, 'Patients'),
          React.createElement(Link, { 
            to: '/appointments', 
            className: `nav-link ${isActive('/appointments') ? 'active' : ''}`
          }, 'Appointments'),
          React.createElement(Link, { 
            to: '/reports', 
            className: `nav-link ${isActive('/reports') ? 'active' : ''}`
          }, 'Reports'),
          React.createElement(Link, { 
            to: '/medications', 
            className: `nav-link ${isActive('/medications') ? 'active' : ''}`
          }, 'Medications'),
          React.createElement(Link, { 
            to: '/profile', 
            className: `nav-link ${isActive('/profile') ? 'active' : ''}`
          }, 'Profile')
        )
      ),
      
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '16px' } },
        React.createElement('div', { style: { textAlign: 'right' } },
          React.createElement('div', { style: { fontSize: '14px', fontWeight: '500' } }, user.name),
          React.createElement('div', { style: { fontSize: '12px', color: 'var(--text-light)' } }, 
            user.role.charAt(0).toUpperCase() + user.role.slice(1)
          )
        ),
        React.createElement('button', {
          onClick: logout,
          className: 'btn btn-outline',
          style: { fontSize: '12px', padding: '8px 16px' }
        }, 'Logout')
      )
    )
  );
}

function AppContent() {
  return React.createElement('div', { className: 'app-layout' },
    React.createElement(Navigation),
    React.createElement('main', { className: 'main-content' },
      React.createElement(Routes, null,
        React.createElement(Route, { 
          path: '/login', 
          element: React.createElement(PublicRoute, null, React.createElement(Login))
        }),
        React.createElement(Route, { 
          path: '/dashboard', 
          element: React.createElement(ProtectedRoute, null, React.createElement(Dashboard))
        }),
        React.createElement(Route, { 
          path: '/patients', 
          element: React.createElement(ProtectedRoute, null, React.createElement(Patients))
        }),
        React.createElement(Route, { 
          path: '/appointments', 
          element: React.createElement(ProtectedRoute, null, React.createElement(Appointments))
        }),
        React.createElement(Route, { 
          path: '/reports', 
          element: React.createElement(ProtectedRoute, null, React.createElement(Reports))
        }),
        React.createElement(Route, { 
          path: '/medications', 
          element: React.createElement(ProtectedRoute, null, React.createElement(Medications))
        }),
        React.createElement(Route, { 
          path: '/profile', 
          element: React.createElement(ProtectedRoute, null, React.createElement(Profile))
        }),
        React.createElement(Route, { 
          path: '/', 
          element: React.createElement(Navigate, { to: '/dashboard' })
        })
      )
    )
  );
}

function App() {
  return React.createElement(AuthProvider, null,
    React.createElement(Router, null,
      React.createElement(AppContent)
    )
  );
}

export default App;
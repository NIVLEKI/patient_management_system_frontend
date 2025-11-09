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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  
  if (!user) return null;

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/patients', label: 'Patients', icon: '👥' },
    { to: '/appointments', label: 'Appointments', icon: '📅' },
    { to: '/reports', label: 'Reports', icon: '📈' },
    { to: '/medications', label: 'Medications', icon: '💊' },
    { to: '/profile', label: 'Profile', icon: '👤' }
  ];

  return React.createElement('nav', { className: 'navbar' },
    React.createElement('div', { className: 'nav-content' },
      // Left side - Logo
      React.createElement('div', { className: 'nav-section' },
        React.createElement('div', { className: 'nav-logo' },
          '🏥',
          React.createElement('span', null, 'PMS')
        )
      ),

      // Center - Navigation Links (Desktop)
      React.createElement('div', { className: 'nav-links desktop-nav' },
        navLinks.slice(0, -1).map(link =>  // All except profile
          React.createElement(Link, {
            key: link.to,
            to: link.to,
            className: `nav-link ${isActive(link.to) ? 'active' : ''}`,
            onClick: () => setIsMobileMenuOpen(false)
          }, link.label)
        )
      ),

      // Right side - User info and actions (Desktop)
      React.createElement('div', { className: 'nav-section nav-user-section' },
        React.createElement('div', { className: 'user-info desktop-user' },
          React.createElement('div', { className: 'user-name' }, user.name),
          React.createElement('div', { className: 'user-role' }, 
            user.role.charAt(0).toUpperCase() + user.role.slice(1)
          )
        ),
        React.createElement(Link, {
          to: '/profile',
          className: `nav-link profile-link desktop-profile ${isActive('/profile') ? 'active' : ''}`
        }, 'Profile'),
        React.createElement('button', {
          onClick: logout,
          className: 'btn btn-outline logout-btn desktop-logout',
          style: { fontSize: '12px', padding: '8px 16px', whiteSpace: 'nowrap' }
        }, 'Logout'),
        
        // Mobile menu button
        React.createElement('button', {
          className: 'mobile-menu-btn',
          onClick: () => setIsMobileMenuOpen(!isMobileMenuOpen),
          'aria-label': 'Toggle menu'
        }, isMobileMenuOpen ? '✕' : '☰')
      ),

      // Mobile menu overlay
      isMobileMenuOpen && React.createElement('div', { 
        className: 'mobile-menu-overlay',
        onClick: () => setIsMobileMenuOpen(false)
      }),

      // Mobile menu
      React.createElement('div', { 
        className: `mobile-menu ${isMobileMenuOpen ? 'mobile-menu-open' : ''}` 
      },
        // Mobile menu header with user info
        React.createElement('div', { className: 'mobile-menu-header' },
          React.createElement('div', { className: 'mobile-user-info' },
            React.createElement('div', { 
              className: 'user-avatar'
            }, user.name.charAt(0).toUpperCase()),
            React.createElement('div', { className: 'mobile-user-details' },
              React.createElement('div', { className: 'user-name' }, user.name),
              React.createElement('div', { className: 'user-role' }, 
                user.role.charAt(0).toUpperCase() + user.role.slice(1)
              )
            )
          )
        ),

        // Mobile navigation links
        React.createElement('div', { className: 'mobile-nav-links' },
          navLinks.map(link => 
            React.createElement(Link, {
              key: link.to,
              to: link.to,
              className: `mobile-nav-link ${isActive(link.to) ? 'mobile-nav-link-active' : ''}`,
              onClick: () => setIsMobileMenuOpen(false)
            },
              React.createElement('span', { className: 'nav-link-icon' }, link.icon),
              React.createElement('span', { className: 'nav-link-text' }, link.label),
              isActive(link.to) && React.createElement('span', { className: 'active-indicator' }, '•')
            )
          )
        ),

        // Mobile menu footer with logout
        React.createElement('div', { className: 'mobile-menu-footer' },
          React.createElement('button', {
            onClick: () => {
              setIsMobileMenuOpen(false);
              logout();
            },
            className: 'btn btn-outline mobile-logout-btn'
          }, '🚪 Logout')
        )
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
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
              className: 'user-avatar',
              style: { 
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: '700',
                fontSize: '18px'
              } 
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
            className: 'btn btn-outline mobile-logout-btn',
            style: { width: '100%', justifyContent: 'center' }
          }, '🚪 Logout')
        )
      )
    )
  );
}
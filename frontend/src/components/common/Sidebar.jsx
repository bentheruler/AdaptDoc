import React, { useEffect } from 'react';

/* ── Icons ────────────────────────────────────────────────── */
const icons = {
  home: (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  create: (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="12" y1="18" x2="12" y2="12" />
      <line x1="9" y1="15" x2="15" y2="15" />
    </svg>
  ),
  documents: (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  admin: (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
    </svg>
  ),
  settings: (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  logout: (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
};

const NAV_ITEMS = [
  { id: 'home',      label: 'Dashboard' },
  { id: 'create',   label: 'Create Document' },
  { id: 'documents',label: 'My Documents' },
  { id: 'settings', label: 'Settings' },
];

const Sidebar = ({ activeTab, onNavigate, isOpen, user, onLogout, isMobileOverlay = false, onClose }) => {
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  const items = [
    ...NAV_ITEMS,
    ...(user?.role === 'admin' ? [{ id: 'admin', label: 'Admin Panel' }] : []),
  ];

  // Close sidebar on nav when in mobile overlay mode
  const handleNav = (id) => {
    onNavigate(id);
    if (isMobileOverlay && onClose) onClose();
  };

  // Lock body scroll when overlay is open
  useEffect(() => {
    if (isMobileOverlay && isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileOverlay, isOpen]);

  const sidebarStyle = isMobileOverlay
    ? {
        ...s.sidebar,
        position: 'fixed',
        top: 0, left: 0,
        height: '100vh',
        width: 260,
        zIndex: 9000,
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.26s cubic-bezier(0.4,0,0.2,1)',
        boxShadow: isOpen ? '4px 0 32px rgba(0,0,0,0.6)' : 'none',
      }
    : { ...s.sidebar, width: isOpen ? 220 : 62 };

  return (
    <>
      {/* Backdrop for mobile overlay */}
      {isMobileOverlay && isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.55)',
            zIndex: 8999,
            backdropFilter: 'blur(2px)',
          }}
        />
      )}

      <div style={sidebarStyle}>
        {/* Logo */}
        <div style={s.logo}>
          <img src="/favicon.png" alt="AdaptDoc" style={{ width: 28, height: 28, flexShrink: 0, objectFit: 'contain' }} />
          {(isOpen || isMobileOverlay) && <span style={s.logoText}>AdaptDoc</span>}
        </div>

        {/* Nav */}
        <nav style={s.nav}>
          {items.map(item => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className="sidebar-item"
                title={!isOpen && !isMobileOverlay ? item.label : undefined}
                style={{
                  ...s.navItem,
                  background: active ? 'var(--accent-subtle)' : 'transparent',
                  borderLeft: `3px solid ${active ? 'var(--accent-color)' : 'transparent'}`,
                  color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: active ? 600 : 400,
                }}
              >
                <span style={{ ...s.navIcon, color: active ? 'var(--accent-color)' : 'inherit' }}>
                  {icons[item.id]}
                </span>
                {(isOpen || isMobileOverlay) && <span style={s.navLabel}>{item.label}</span>}
                {active && (isOpen || isMobileOverlay) && <span style={s.activeDot} />}
              </button>
            );
          })}

          <div style={{ flex: 1 }} />

          <button
            onClick={() => { if (onLogout) onLogout(); window.location.href = '/login'; }}
            className="sidebar-item"
            style={{ ...s.navItem, color: 'var(--danger-color)', borderLeft: '3px solid transparent', marginTop: 4 }}
            title={!isOpen && !isMobileOverlay ? 'Logout' : undefined}
          >
            <span style={s.navIcon}>{icons.logout}</span>
            {(isOpen || isMobileOverlay) && <span style={s.navLabel}>Logout</span>}
          </button>
        </nav>

        {/* User footer — shows avatar if available, else initials */}
        <div style={s.footer}>
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user?.name || 'User'}
              style={{
                width: 32, height: 32, borderRadius: '50%',
                objectFit: 'cover', flexShrink: 0,
                border: '2px solid var(--border-color)',
              }}
            />
          ) : (
            <div style={s.userAvatar}>{initials}</div>
          )}
          {(isOpen || isMobileOverlay) && (
            <div style={{ minWidth: 0 }}>
              <div style={s.userName} title={user?.name || user?.email || 'User'}>
                {user?.name || user?.email || 'User'}
              </div>
              <div style={s.userRole}>{user?.role === 'admin' ? 'Admin Access' : 'User Account'}</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const s = {
  sidebar: {
    background: 'var(--card-bg)',
    display: 'flex',
    flexDirection: 'column',
    transition: 'width 0.22s ease',
    overflow: 'hidden',
    flexShrink: 0,
    height: '100vh',
    borderRight: '1px solid var(--border-color)',
    position: 'sticky',
    top: 0,
  },
  logo: {
    padding: '16px 12px',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    borderBottom: '1px solid var(--border-color)',
    flexShrink: 0,
  },
  logoMark: {
    width: 34, height: 34,
    background: 'var(--accent-color)',
    borderRadius: 9,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: 800, fontSize: 12,
    fontFamily: "'DM Mono', monospace",
    flexShrink: 0,
    boxShadow: '0 2px 8px rgba(20,184,166,0.3)',
  },
  logoText: {
    color: 'var(--text-primary)',
    fontWeight: 800,
    fontSize: 14,
    whiteSpace: 'nowrap',
    letterSpacing: '-0.4px',
    fontFamily: "'Outfit', sans-serif",
  },
  nav: {
    flex: 1,
    padding: '10px 8px',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    overflowY: 'auto',
    overflowX: 'hidden',
  },
  navItem: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 10px',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 13,
    textAlign: 'left',
    whiteSpace: 'nowrap',
    transition: 'all 0.15s',
    fontFamily: 'inherit',
    position: 'relative',
  },
  navIcon: { display: 'flex', alignItems: 'center', flexShrink: 0 },
  navLabel: { flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' },
  activeDot: {
    width: 5, height: 5,
    borderRadius: '50%',
    background: 'var(--accent-color)',
    flexShrink: 0,
    marginLeft: 'auto',
  },
  footer: {
    padding: '12px 12px',
    borderTop: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flexShrink: 0,
  },
  userAvatar: {
    width: 30, height: 30,
    borderRadius: '50%',
    background: 'var(--accent-color)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontSize: 11, fontWeight: 700,
    flexShrink: 0,
  },
  userName: {
    color: 'var(--text-primary)',
    fontSize: 12, fontWeight: 600,
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
    maxWidth: 160,
  },
  userRole: { color: 'var(--text-muted)', fontSize: 10, marginTop: 1 },
};

export default Sidebar;
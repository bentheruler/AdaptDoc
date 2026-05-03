import { useEffect, useRef, useState } from 'react';

const MoonIcon = () => (
  <svg width={15} height={15} viewBox="0 0 24 24" fill="currentColor">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const SunIcon = () => (
  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MenuIcon = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const SaveIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);

const tabLabel = { home: 'dashboard', create: 'create', documents: 'documents', admin: 'admin', settings: 'settings' };

const Navbar = ({ onToggleSidebar, user, onLogout, activeTab = 'home', onSaveDraft, showSaveButton = false, onOpenSettings }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isDark, setIsDark] = useState(() => document.documentElement.getAttribute('data-theme') !== 'light');
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const toggleTheme = () => {
    const next = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    setIsDark(!isDark);
  };

  const userInitials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div style={s.nav}>
      <div style={s.left}>
        <button onClick={onToggleSidebar} style={s.iconBtn} title="Toggle sidebar">
          <MenuIcon />
        </button>
        {!isMobile && (
          <span style={s.breadcrumb}>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>adaptdoc</span>
            <span style={{ color: 'var(--text-muted)', margin: '0 4px' }}>/</span>
            <span style={{ color: 'var(--accent-color)' }}>{tabLabel[activeTab] || activeTab}</span>
          </span>
        )}
      </div>

      <div style={s.right}>
        {showSaveButton && (
          <button onClick={onSaveDraft} className="btn-ghost" style={{ ...s.saveBtn, ...(isMobile ? { padding: '7px 8px' } : {}) }}>
            <SaveIcon />
            {!isMobile && ' Save Draft'}
          </button>
        )}

        <button onClick={toggleTheme} style={s.iconBtn} title="Toggle dark/light mode">
          {isDark ? <SunIcon /> : <MoonIcon />}
        </button>

        <div style={{ position: 'relative' }} ref={menuRef}>
          <button
            onClick={() => {
              if (onOpenSettings) {
                onOpenSettings();
              } else {
                setShowUserMenu(p => !p);
              }
            }}
            style={s.avatarBtn}
            title="Open Settings"
          >
            <div style={s.avatar}>
              {user?.avatar
                ? <img src={user.avatar} alt={user?.name || 'User'} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                : userInitials
              }
            </div>
            {!isMobile && (
              <>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.name || user?.email || 'User'}
                </span>
                <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </>
            )}
          </button>

          {showUserMenu && (
            <div style={s.dropdown}>
              <div style={s.dropdownHeader}>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 13 }}>{user?.name || 'User'}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{user?.email}</div>
                <div style={{ fontSize: 11, color: 'var(--accent-color)', marginTop: 4, fontWeight: 600 }}>
                  {user?.role === 'admin' ? '⚡ Admin' : '● User Account'}
                </div>
              </div>
              {onOpenSettings && (
                <button
                  onClick={() => { setShowUserMenu(false); onOpenSettings(); }}
                  style={s.dropdownItem}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  ⚙️ Settings
                </button>
              )}
              <button
                onClick={() => { if (onLogout) onLogout(); window.location.href = '/login'; }}
                style={s.dropdownLogout}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const s = {
  nav: {
    background: 'var(--card-bg)',
    borderBottom: '1px solid var(--border-color)',
    padding: '0 12px',
    height: 54,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexShrink: 0,
  },
  left: { display: 'flex', alignItems: 'center', gap: 12 },
  right: { display: 'flex', gap: 8, alignItems: 'center' },
  breadcrumb: {
    fontSize: 13,
    fontFamily: "'DM Mono', monospace",
    letterSpacing: '-0.02em',
  },
  iconBtn: {
    width: 34, height: 34,
    borderRadius: 8,
    border: '1px solid var(--border-color)',
    background: 'var(--surface)',
    cursor: 'pointer',
    color: 'var(--text-secondary)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.15s',
    flexShrink: 0,
  },
  saveBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    background: 'var(--surface)',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border-color)',
    padding: '7px 12px',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 12, fontWeight: 500,
    fontFamily: 'inherit',
    whiteSpace: 'nowrap',
  },
  avatarBtn: {
    display: 'flex', alignItems: 'center', gap: 7,
    background: 'var(--surface)',
    border: '1px solid var(--border-color)',
    borderRadius: 20,
    cursor: 'pointer',
    padding: '4px 8px 4px 4px',
    transition: 'all 0.15s',
  },
  avatar: {
    width: 26, height: 26, borderRadius: '50%',
    background: 'var(--accent-color)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontSize: 10, fontWeight: 800,
    flexShrink: 0,
  },
  dropdown: {
    position: 'absolute', top: 44, right: 0,
    background: 'var(--card-bg)',
    border: '1px solid var(--border-color)',
    borderRadius: 12,
    boxShadow: 'var(--shadow-lg)',
    minWidth: 220, zIndex: 1000,
    overflow: 'hidden',
  },
  dropdownHeader: {
    padding: '14px 16px',
    borderBottom: '1px solid var(--border-color)',
  },
  dropdownItem: {
    width: '100%', padding: '11px 16px',
    background: 'transparent', border: 'none',
    textAlign: 'left', cursor: 'pointer',
    color: 'var(--text-secondary)',
    fontSize: 13, fontWeight: 500,
    transition: 'background 0.15s',
    borderBottom: '1px solid var(--border-color)',
  },
  dropdownLogout: {
    width: '100%', padding: '11px 16px',
    background: 'transparent', border: 'none',
    textAlign: 'left', cursor: 'pointer',
    color: 'var(--danger-color)',
    fontSize: 13, fontWeight: 500,
    transition: 'background 0.15s',
  },
};

export default Navbar;
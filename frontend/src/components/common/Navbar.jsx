import { useEffect, useRef, useState } from 'react';

const Navbar = ({
  onToggleSidebar,
  user,
  onLogout,
  activeTab = 'home',
  onSaveDraft,
  showSaveButton = false,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleLogout = () => {
    if (onLogout) onLogout();
    window.location.href = '/login';
  };

  const userInitials =
    user?.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';

  const readableTab =
    activeTab === 'home'
      ? 'dashboard'
      : activeTab === 'create'
      ? 'create'
      : activeTab === 'documents'
      ? 'documents'
      : activeTab === 'admin'
      ? 'admin'
      : 'settings';

  return (
    <div
      style={{
        background: 'var(--bg-color)',
        borderBottom: '1px solid var(--border-color)',
        padding: '0 20px',
        height: 54,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={onToggleSidebar}
          style={{
            width: 34,
            height: 34,
            borderRadius: 8,
            border: '1px solid var(--border-color)',
            background: 'var(--card-bg)',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s',
          }}
          title="Toggle sidebar"
        >
          <svg
            width={16}
            height={16}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <span
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--text-secondary)',
            fontFamily: "'DM Mono', monospace",
          }}
        >
          <span style={{ color: 'var(--text-primary)' }}>adaptdoc</span>
          <span style={{ color: 'var(--text-secondary)' }}> /</span>
          <span style={{ color: 'var(--accent-color)' }}> {readableTab}</span>
        </span>
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        {showSaveButton && (
          <button
            onClick={onSaveDraft}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'var(--card-bg)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-color)',
              padding: '8px 12px',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 500,
              fontFamily: 'inherit',
            }}
          >
            <svg
              width={14}
              height={14}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            Save Draft
          </button>
        )}

        <div style={{ position: 'relative' }} ref={menuRef}>
          <button
            onClick={() => setShowUserMenu((prev) => !prev)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'var(--card-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: 20,
              cursor: 'pointer',
              padding: '4px 12px 4px 5px',
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: 'var(--accent-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 10,
                fontWeight: 700,
              }}
            >
              {userInitials}
            </div>

            <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
              {user?.name || user?.email || 'User'}
            </span>
          </button>

          {showUserMenu && (
            <div
              style={{
                position: 'absolute',
                top: 44,
                right: 0,
                background: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: 10,
                boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
                minWidth: 220,
                zIndex: 1000,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '12px 14px',
                  borderBottom: '1px solid var(--border-color)',
                  fontSize: 13,
                  color: 'var(--text-secondary)',
                }}
              >
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {user?.name || 'User'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                  {user?.email}
                </div>
                <div style={{ fontSize: 11, color: 'var(--accent-color)', marginTop: 4 }}>
                  {user?.role === 'admin' ? 'Admin Account' : 'User Account'}
                </div>
              </div>

              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  background: 'none',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  color: 'var(--danger-color)',
                  fontSize: 13,
                  fontWeight: 500,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
import React from 'react';

const Sidebar = ({ activeTab, onNavigate, isOpen, user, onLogout }) => {
  const initials =
    user?.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    window.location.href = '/login';
  };

  const items = [
    { id: 'home', icon: '⊞', label: 'Dashboard' },
    { id: 'create', icon: '✦', label: 'Create Document' },
    { id: 'documents', icon: '📄', label: 'My Documents' },
    ...(user?.role === 'admin'
      ? [{ id: 'admin', icon: '🛠', label: 'Admin Panel' }]
      : []),
    { id: 'settings', icon: '⚙', label: 'Settings' },
  ];

  return (
    <div
      style={{
        width: isOpen ? 220 : 60,
        background: 'var(--card-bg)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.22s ease',
        overflow: 'hidden',
        flexShrink: 0,
        height: '100vh',
        borderRight: '1px solid var(--border-color)',
        position:'sticky',
        top:0,
      }}
    >
      <div
        style={{
          padding: '18px 14px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            background: 'linear-gradient(135deg, var(--accent-color), #2563eb)',
            borderRadius: 9,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 800,
            fontSize: 12,
            fontFamily: "'DM Mono', monospace",
            flexShrink: 0,
          }}
        >
          AD
        </div>

        {isOpen && (
          <span
            style={{
              color: 'var(--text-primary)',
              fontWeight: 700,
              fontSize: 15,
              whiteSpace: 'nowrap',
              letterSpacing: '-0.3px',
            }}
          >
            AdaptDoc
          </span>
        )}
      </div>

      <nav
        style={{
          flex: 1,
          padding: '12px 8px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 10px',
              marginBottom: 2,
              background: activeTab === item.id ? 'var(--border-color)' : 'transparent',
              border: 'none',
              borderLeft:
                activeTab === item.id
                  ? '3px solid var(--accent-color)'
                  : '3px solid transparent',
              borderRadius: 8,
              cursor: 'pointer',
              color: activeTab === item.id ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontSize: 13,
              fontWeight: activeTab === item.id ? 600 : 500,
              textAlign: 'left',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s',
            }}
          >
            <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
            {isOpen && item.label}
          </button>
        ))}

        <div style={{ flex: 1 }} />

        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 10px',
            background: 'transparent',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            color: 'var(--danger-color)',
            fontSize: 13,
            fontWeight: 600,
            textAlign: 'left',
            whiteSpace: 'nowrap',
            transition: 'all 0.15s',
          }}
        >
          <span style={{ fontSize: 16, flexShrink: 0 }}>⬅</span>
          {isOpen && 'Logout'}
        </button>
      </nav>

      <div
        style={{
          padding: '12px 10px',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent-color), #2563eb)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 12,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {initials}
        </div>

        {isOpen && (
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                color: 'var(--text-primary)',
                fontSize: 12,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: 140,
              }}
              title={user?.name || user?.email || 'User'}
            >
              {user?.name || user?.email || 'User'}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 10 }}>
              {user?.role === 'admin' ? 'Admin Access' : 'User Account'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
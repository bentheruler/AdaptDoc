import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const API_URL = `${API_BASE}/api`;

const SettingsTab = () => {
  const { user, token, updateUser, logoutUser } = useAuth();
  const navigate = useNavigate();

  // Profile State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });

  // Appearance State
  const [theme, setTheme] = useState(user?.settings?.appearance?.theme || 'dark');
  const [accentColor, setAccentColor] = useState(user?.settings?.appearance?.accentColor || '#57d572');
  const [appearanceMsg, setAppearanceMsg] = useState({ type: '', text: '' });

  // Security State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityMsg, setSecurityMsg] = useState({ type: '', text: '' });

  // Danger Zone State
  const [deletePassword, setDeletePassword] = useState('');

  const getHeaders = () => ({ headers: { Authorization: `Bearer ${token}` } });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg({ type: '', text: '' });
    
    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setProfileMsg({ type: 'error', text: 'Invalid email format' });
      return;
    }

    try {
      const res = await axios.put(`${API_URL}/user/profile`, { name, email }, getHeaders());
      // Update context
      updateUser({ ...user, name: res.data.user.name, email: res.data.user.email });
      setProfileMsg({ type: 'success', text: 'Profile updated successfully' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
    }
  };

  const handleUpdateAppearance = async (e) => {
    e.preventDefault();
    setAppearanceMsg({ type: '', text: '' });

    try {
      const res = await axios.put(`${API_URL}/user/settings/appearance`, { theme, accentColor }, getHeaders());
      updateUser({ ...user, settings: res.data.user.settings });
      setAppearanceMsg({ type: 'success', text: 'Appearance updated successfully' });
    } catch (err) {
      setAppearanceMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update appearance' });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setSecurityMsg({ type: '', text: '' });

    if (newPassword !== confirmPassword) {
      setSecurityMsg({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    if (newPassword.length < 6) {
      setSecurityMsg({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    try {
      await axios.put(`${API_URL}/user/change-password`, { oldPassword, newPassword }, getHeaders());
      setSecurityMsg({ type: 'success', text: 'Password changed successfully' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setSecurityMsg({ type: 'error', text: err.response?.data?.message || 'Failed to change password' });
    }
  };

  const handleDeleteDocuments = async () => {
    if (!window.confirm('Are you sure you want to delete all your documents? This action cannot be undone.')) {
      return;
    }
    try {
      const res = await axios.delete(`${API_URL}/user/documents`, getHeaders());
      alert(res.data.message);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete documents');
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      alert('Please enter your password to confirm account deletion.');
      return;
    }
    if (!window.confirm('Are you ABSOLUTELY sure you want to delete your account and all data?')) {
      return;
    }
    try {
      await axios.delete(`${API_URL}/user/account`, {
        data: { password: deletePassword },
        ...getHeaders()
      });
      logoutUser();
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete account');
    }
  };

  return (
    <div style={s.tabPage}>
      <div style={s.tabHeader}>
        <div>
          <h2 style={s.tabTitle}>Settings</h2>
          <p style={s.tabSubtitle}>Manage your account preferences, appearance, and security</p>
        </div>
        <button onClick={() => { logoutUser(); navigate('/login'); }} style={s.btnLogout}>
          Sign Out
        </button>
      </div>

      <div style={s.gridContainer}>
        {/* Profile Section */}
        <div style={s.settingsCard}>
          <h3 style={s.sectionTitle}>Profile Information</h3>
          {profileMsg.text && <div style={profileMsg.type === 'error' ? s.errorAlert : s.successAlert}>{profileMsg.text}</div>}
          
          <form onSubmit={handleUpdateProfile}>
            <div style={s.formGroup}>
              <label style={s.label}>Name</label>
              <input style={s.input} type="text" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Email</label>
              <input style={s.input} type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Role</label>
              <input style={s.inputReadOnly} type="text" value={user?.role} readOnly disabled />
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Account Status</label>
              <input style={s.inputReadOnly} type="text" value={user?.status || 'active'} readOnly disabled />
              <p style={s.hint}>Only administrators can change account status.</p>
            </div>
            <button type="submit" style={s.btnPrimary}>Save Profile</button>
          </form>
        </div>

        {/* Appearance Section */}
        <div style={s.settingsCard}>
          <h3 style={s.sectionTitle}>Appearance</h3>
          {appearanceMsg.text && <div style={appearanceMsg.type === 'error' ? s.errorAlert : s.successAlert}>{appearanceMsg.text}</div>}
          
          <form onSubmit={handleUpdateAppearance}>
            <div style={s.formGroup}>
              <label style={s.label}>Theme</label>
              <select style={s.input} value={theme} onChange={e => setTheme(e.target.value)}>
                <option value="dark">Dark Mode</option>
                <option value="light">Light Mode</option>
              </select>
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Accent Color</label>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <input 
                  type="color" 
                  value={accentColor} 
                  onChange={e => setAccentColor(e.target.value)} 
                  style={{ width: 40, height: 40, padding: 0, border: 'none', cursor: 'pointer', borderRadius: 4 }}
                />
                <input style={{...s.input, flex: 1}} type="text" value={accentColor} onChange={e => setAccentColor(e.target.value)} />
              </div>
            </div>
            <button type="submit" style={s.btnPrimary}>Save Appearance</button>
          </form>
        </div>

        {/* Security Section */}
        <div style={s.settingsCard}>
          <h3 style={s.sectionTitle}>Change Password</h3>
          {securityMsg.text && <div style={securityMsg.type === 'error' ? s.errorAlert : s.successAlert}>{securityMsg.text}</div>}
          
          <form onSubmit={handleChangePassword}>
            <div style={s.formGroup}>
              <label style={s.label}>Current Password</label>
              <input style={s.input} type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} required />
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>New Password</label>
              <input style={s.input} type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} />
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Confirm New Password</label>
              <input style={s.input} type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={6} />
            </div>
            <button type="submit" style={s.btnPrimary}>Update Password</button>
          </form>
        </div>

        {/* Danger Zone Section */}
        <div style={{...s.settingsCard, border: '1px solid var(--danger-color)'}}>
          <h3 style={{...s.sectionTitle, color: 'var(--danger-color)'}}>Danger Zone</h3>
          
          <div style={s.dangerBox}>
            <div style={{flex: 1}}>
              <h4 style={{margin: '0 0 4px', fontSize: 14, color: 'var(--text-primary)'}}>Delete All Documents</h4>
              <p style={{margin: 0, fontSize: 12, color: 'var(--text-secondary)'}}>This will permanently delete all your generated CVs, Cover Letters, and Proposals.</p>
            </div>
            <button type="button" style={s.btnDanger} onClick={handleDeleteDocuments}>Delete Documents</button>
          </div>

          <div style={{height: 1, background: 'var(--border-color)', margin: '20px 0'}} />

          <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
            <div>
              <h4 style={{margin: '0 0 4px', fontSize: 14, color: 'var(--text-primary)'}}>Delete Account</h4>
              <p style={{margin: 0, fontSize: 12, color: 'var(--text-secondary)'}}>Permanently delete your account and all associated data. Provide password to confirm.</p>
            </div>
            <div style={{display: 'flex', gap: 12}}>
              <input 
                style={{...s.input, flex: 1}} 
                type="password" 
                placeholder="Enter password to confirm" 
                value={deletePassword} 
                onChange={e => setDeletePassword(e.target.value)} 
              />
              <button type="button" style={s.btnDanger} onClick={handleDeleteAccount}>Delete Account</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const s = {
  tabPage: {
    padding: '32px 36px',
    flex: 1,
    overflow: 'auto',
  },
  tabHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 28,
    gap: 16,
    flexWrap: 'wrap',
  },
  tabTitle: {
    color: 'var(--text-primary)',
    fontSize: 22,
    fontWeight: 700,
    margin: '0 0 4px',
    letterSpacing: '-0.02em',
  },
  tabSubtitle: {
    color: 'var(--text-secondary)',
    fontSize: 13,
    margin: 0,
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: 24,
    alignItems: 'start'
  },
  settingsCard: {
    background: 'var(--card-bg)',
    border: '1px solid var(--border-color)',
    borderRadius: 14,
    padding: 24,
  },
  sectionTitle: {
    color: 'var(--text-primary)',
    fontWeight: 700,
    fontSize: 16,
    margin: '0 0 20px',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    display: 'block',
    marginBottom: 6,
    color: 'var(--text-secondary)',
    fontWeight: 600,
    fontSize: 12,
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid var(--border-color)',
    borderRadius: 8,
    fontSize: 14,
    color: 'var(--text-primary)',
    background: 'var(--bg-color)',
    boxSizing: 'border-box',
    outline: 'none',
  },
  inputReadOnly: {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid var(--border-color)',
    borderRadius: 8,
    fontSize: 14,
    color: 'var(--text-secondary)',
    background: 'var(--bg-color)',
    boxSizing: 'border-box',
    opacity: 0.7,
    cursor: 'not-allowed',
  },
  hint: {
    margin: '6px 0 0',
    fontSize: 11,
    color: 'var(--text-secondary)',
  },
  btnPrimary: {
    background: 'var(--accent-color)',
    color: '#fff',
    border: 'none',
    padding: '10px 16px',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    width: '100%',
    marginTop: 8,
  },
  btnLogout: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    background: 'transparent',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border-color)',
    padding: '9px 16px',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
  },
  dangerBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    flexWrap: 'wrap',
  },
  btnDanger: {
    background: 'rgba(239, 68, 68, 0.1)',
    color: 'var(--danger-color)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    padding: '10px 16px',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  errorAlert: {
    background: 'rgba(239, 68, 68, 0.1)',
    color: 'var(--danger-color)',
    padding: '10px 14px',
    borderRadius: 8,
    fontSize: 13,
    marginBottom: 16,
    border: '1px solid rgba(239, 68, 68, 0.2)',
  },
  successAlert: {
    background: 'rgba(16, 185, 129, 0.1)',
    color: '#10b981',
    padding: '10px 14px',
    borderRadius: 8,
    fontSize: 13,
    marginBottom: 16,
    border: '1px solid rgba(16, 185, 129, 0.2)',
  }
};

export default SettingsTab;

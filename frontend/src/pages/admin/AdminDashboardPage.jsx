import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell
} from 'recharts';

const UsersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
);

const DocsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
);

const ActivityIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
);

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
);

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AdminDashboardPage = () => {
  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [aiLogs, setAiLogs] = useState(null);
  const [settings, setSettings] = useState({ preferredProvider: 'gemini', fallbackEnabled: true, maintenanceMode: false });

  const [loading, setLoading] = useState(true);

  const getHeaders = () => ({ headers: { Authorization: `Bearer ${token}` } });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        const res = await axios.get(`${API_URL}/admin/stats`, getHeaders());
        setStats(res.data);
      } else if (activeTab === 'users') {
        const res = await axios.get(`${API_URL}/admin/users`, getHeaders());
        setUsers(res.data);
      } else if (activeTab === 'documents') {
        const res = await axios.get(`${API_URL}/admin/documents`, getHeaders());
        setDocuments(res.data);
      } else if (activeTab === 'ai-logs') {
        const res = await axios.get(`${API_URL}/admin/ai-logs`, getHeaders());
        setAiLogs(res.data);
      } else if (activeTab === 'settings') {
        const res = await axios.get(`${API_URL}/admin/settings`, getHeaders());
        setSettings(res.data);
      }
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'restricted' : 'active';
      await axios.put(`${API_URL}/admin/users/${userId}/status`, { status: newStatus }, getHeaders());
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user status');
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This will also delete all their documents.')) return;
    try {
      await axios.delete(`${API_URL}/admin/users/${userId}`, getHeaders());
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const deleteDocument = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      await axios.delete(`${API_URL}/admin/documents/${docId}`, getHeaders());
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete document');
    }
  };

  const saveSettings = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/admin/settings`, settings, getHeaders());
      alert('Settings saved successfully');
    } catch (err) {
      alert('Failed to save settings');
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <UsersIcon /> },
    { id: 'users', label: 'Users', icon: <UsersIcon /> },
    { id: 'documents', label: 'Documents', icon: <DocsIcon /> },
    { id: 'ai-logs', label: 'AI Logs', icon: <ActivityIcon /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon /> },
  ];

  const renderOverview = () => {
    if (!stats) return null;
    return (
      <div style={s.gridContainer}>
        <div style={s.statCard}>
          <div style={s.statTitle}>Total Users</div>
          <div style={s.statValue}>{stats.totalUsers}</div>
          <div style={s.statSub}>
            <span style={{color: '#4ade80'}}>{stats.activeUsers} Active</span> • <span style={{color: '#ef4444'}}>{stats.restrictedUsers} Restricted</span>
          </div>
        </div>
        <div style={s.statCard}>
          <div style={s.statTitle}>Total Documents</div>
          <div style={s.statValue}>{stats.totalDocuments}</div>
          <div style={s.statSub}>{stats.documentsToday} Created Today • {stats.documentsThisWeek} This Week</div>
        </div>
        <div style={s.statCard}>
          <div style={s.statTitle}>Document Types</div>
          <div style={s.statValue}>{stats.totalCVs} <span style={{fontSize: 16}}>CVs</span></div>
          <div style={s.statSub}>{stats.totalCoverLetters} Cover Letters • {stats.totalProposals} Proposals</div>
        </div>
      </div>
    );
  };

  const renderUsers = () => (
    <div style={s.tableCard}>
      <table style={s.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Docs</th>
            <th>Joined</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u._id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>
                <span style={{...s.badge, background: u.role === 'admin' ? '#1e3a8a' : '#1e293b', color: u.role === 'admin' ? '#93c5fd' : '#94a3b8'}}>{u.role}</span>
              </td>
              <td>
                <span style={{...s.badge, background: u.status === 'active' ? '#064e3b' : '#7f1d1d', color: u.status === 'active' ? '#6ee7b7' : '#fca5a5'}}>{u.status}</span>
              </td>
              <td>{u.documentCount || 0}</td>
              <td>{new Date(u.createdAt).toLocaleDateString()}</td>
              <td>
                {u._id !== user.id && (
                  <div style={{display: 'flex', gap: 6}}>
                    <button style={s.btnSmall} onClick={() => toggleUserStatus(u._id, u.status)}>
                      {u.status === 'active' ? 'Restrict' : 'Activate'}
                    </button>
                    <button style={{...s.btnSmall, color: '#ef4444', borderColor: '#7f1d1d'}} onClick={() => deleteUser(u._id)}>
                      Delete
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderDocuments = () => (
    <div style={s.tableCard}>
      <table style={s.table}>
        <thead>
          <tr>
            <th>Title</th>
            <th>Type</th>
            <th>Owner</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {documents.map(d => (
            <tr key={d._id}>
              <td style={{fontWeight: 500, color: '#e2e8f0'}}>{d.title}</td>
              <td>
                <span style={{...s.badge, background: '#1e293b', color: '#cbd5e1'}}>{d.type}</span>
              </td>
              <td>{d.user ? `${d.user.name} (${d.user.email})` : 'Unknown'}</td>
              <td>{new Date(d.createdAt).toLocaleDateString()}</td>
              <td>
                <button style={{...s.btnSmall, color: '#ef4444', borderColor: '#7f1d1d'}} onClick={() => deleteDocument(d._id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderAILogs = () => {
    if (!aiLogs || aiLogs.raw.length === 0) {
      return (
        <div style={s.emptyState}>
          <ActivityIcon />
          <h3>No AI usage has been recorded yet</h3>
          <p>Generate some documents using AI to see metrics here.</p>
        </div>
      );
    }

    const { stats } = aiLogs;
    
    const pieData = Object.keys(stats.byDocType).map(key => ({
      name: key.replace('_', ' '),
      value: stats.byDocType[key]
    }));
    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

    const providerData = [
      { name: 'Gemini', success: stats.gemini.successRate, latency: stats.gemini.avgLatency },
      { name: 'OpenAI', success: stats.openai.successRate, latency: stats.openai.avgLatency }
    ];

    return (
      <div style={{display: 'flex', flexDirection: 'column', gap: 24}}>
        <div style={s.gridContainer}>
          <div style={s.statCard}>
            <div style={s.statTitle}>Gemini Avg Latency</div>
            <div style={s.statValue}>{stats.gemini.avgLatency ? `${Math.round(stats.gemini.avgLatency)}ms` : 'N/A'}</div>
            <div style={s.statSub}>Success Rate: {stats.gemini.successRate.toFixed(1)}%</div>
          </div>
          <div style={s.statCard}>
            <div style={s.statTitle}>OpenAI Avg Latency</div>
            <div style={s.statValue}>{stats.openai.avgLatency ? `${Math.round(stats.openai.avgLatency)}ms` : 'N/A'}</div>
            <div style={s.statSub}>Success Rate: {stats.openai.successRate.toFixed(1)}%</div>
          </div>
        </div>

        <div style={{display: 'flex', gap: 24, flexWrap: 'wrap'}}>
          <div style={{...s.tableCard, flex: 1, minWidth: 300, padding: 24}}>
            <h3 style={s.chartTitle}>AI Usage by Document Type</h3>
            <div style={{height: 300}}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{background: '#0f172a', border: '1px solid #1e293b'}} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{...s.tableCard, flex: 1, minWidth: 300, padding: 24}}>
            <h3 style={s.chartTitle}>Provider Success Rate (%)</h3>
            <div style={{height: 300}}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={providerData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{background: '#0f172a', border: '1px solid #1e293b'}} />
                  <Bar dataKey="success" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div style={s.tableCard}>
          <h3 style={{...s.chartTitle, padding: '20px 20px 0'}}>Recent Request Logs</h3>
          <table style={s.table}>
            <thead>
              <tr>
                <th>Provider</th>
                <th>Type</th>
                <th>Success</th>
                <th>Latency (ms)</th>
                <th>Error</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {aiLogs.raw.slice(0, 15).map(log => (
                <tr key={log._id}>
                  <td><span style={{...s.badge, background: '#1e293b', color: '#e2e8f0'}}>{log.provider}</span></td>
                  <td>{log.documentType}</td>
                  <td>
                    {log.success 
                      ? <span style={{color: '#4ade80'}}>✓ Success</span> 
                      : <span style={{color: '#ef4444'}}>✗ Failed</span>}
                  </td>
                  <td>{log.latencyMs}</td>
                  <td style={{color: '#ef4444', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{log.errorMessage || '-'}</td>
                  <td>{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderSettings = () => (
    <div style={s.tableCard}>
      <form onSubmit={saveSettings} style={{padding: 24, maxWidth: 500}}>
        <div style={s.formGroup}>
          <label style={s.label}>Preferred AI Provider</label>
          <select 
            style={s.input} 
            value={settings.preferredProvider} 
            onChange={(e) => setSettings({...settings, preferredProvider: e.target.value})}
          >
            <option value="gemini">Gemini</option>
            <option value="openai">OpenAI</option>
          </select>
          <p style={s.hint}>The primary provider used for document generation.</p>
        </div>

        <div style={s.formGroup}>
          <label style={{display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer'}}>
            <input 
              type="checkbox" 
              checked={settings.fallbackEnabled} 
              onChange={(e) => setSettings({...settings, fallbackEnabled: e.target.checked})}
            />
            <span style={{fontWeight: 600, color: '#e2e8f0'}}>Enable Fallback</span>
          </label>
          <p style={s.hint} style={{marginLeft: 24, ...s.hint}}>If the preferred provider fails, attempt the other provider automatically.</p>
        </div>

        <div style={s.formGroup}>
          <label style={{display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer'}}>
            <input 
              type="checkbox" 
              checked={settings.maintenanceMode} 
              onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})}
            />
            <span style={{fontWeight: 600, color: '#ef4444'}}>Maintenance Mode</span>
          </label>
          <p style={s.hint} style={{marginLeft: 24, ...s.hint}}>Disable all AI functionality across the app. Users will see a maintenance message.</p>
        </div>

        <button type="submit" style={s.btnSave}>Save Settings</button>
      </form>
    </div>
  );

  return (
    <div style={s.container}>
      <div style={s.header}>
        <div>
          <h2 style={s.title}>Admin Panel</h2>
          <p style={s.subtitle}>System overview, user management, and AI configurations</p>
        </div>
      </div>

      <div style={s.tabs}>
        {tabs.map(t => (
          <button 
            key={t.id} 
            style={{...s.tab, ...(activeTab === t.id ? s.activeTab : {})}} 
            onClick={() => setActiveTab(t.id)}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div style={s.content}>
        {loading ? (
          <div style={s.loading}>Loading data...</div>
        ) : (
          <>
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'users' && renderUsers()}
            {activeTab === 'documents' && renderDocuments()}
            {activeTab === 'ai-logs' && renderAILogs()}
            {activeTab === 'settings' && renderSettings()}
          </>
        )}
      </div>
    </div>
  );
};

const s = {
  container: {
    padding: '32px 36px',
    flex: 1,
    overflow: 'auto',
    background: '#080c14',
    color: '#e2e8f0',
    minHeight: '100%',
  },
  header: {
    marginBottom: 28,
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    margin: '0 0 8px',
    color: '#f8fafc',
  },
  subtitle: {
    color: '#64748b',
    margin: 0,
    fontSize: 14,
  },
  tabs: {
    display: 'flex',
    gap: 8,
    borderBottom: '1px solid #1e293b',
    marginBottom: 24,
  },
  tab: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 16px',
    background: 'transparent',
    border: 'none',
    borderBottom: '2px solid transparent',
    color: '#64748b',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 500,
    transition: 'all 0.2s',
  },
  activeTab: {
    color: '#3b82f6',
    borderBottomColor: '#3b82f6',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 20,
  },
  statCard: {
    background: '#0f172a',
    border: '1px solid #1e293b',
    borderRadius: 12,
    padding: 24,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  statTitle: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: 12,
  },
  statValue: {
    color: '#f8fafc',
    fontSize: 36,
    fontWeight: 700,
    marginBottom: 8,
  },
  statSub: {
    color: '#64748b',
    fontSize: 13,
  },
  tableCard: {
    background: '#0f172a',
    border: '1px solid #1e293b',
    borderRadius: 12,
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  badge: {
    padding: '2px 8px',
    borderRadius: 12,
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase',
  },
  btnSmall: {
    background: 'transparent',
    border: '1px solid #334155',
    color: '#cbd5e1',
    padding: '4px 10px',
    borderRadius: 6,
    fontSize: 12,
    cursor: 'pointer',
    fontWeight: 500,
  },
  emptyState: {
    background: '#0f172a',
    border: '1px dashed #1e293b',
    borderRadius: 12,
    padding: 60,
    textAlign: 'center',
    color: '#64748b',
  },
  chartTitle: {
    margin: '0 0 20px',
    fontSize: 16,
    fontWeight: 600,
    color: '#e2e8f0',
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    display: 'block',
    marginBottom: 8,
    color: '#e2e8f0',
    fontWeight: 600,
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    background: '#080c14',
    border: '1px solid #1e293b',
    borderRadius: 8,
    color: '#f8fafc',
    fontSize: 14,
  },
  hint: {
    margin: '6px 0 0',
    fontSize: 12,
    color: '#64748b',
  },
  btnSave: {
    background: '#3b82f6',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: 8,
    fontWeight: 600,
    cursor: 'pointer',
  },
  loading: {
    padding: 40,
    textAlign: 'center',
    color: '#64748b',
  }
};

export default AdminDashboardPage;

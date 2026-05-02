import React from 'react';

const TYPE_LABEL = { cv: 'CV', cover_letter: 'Cover Letter', business_proposal: 'Proposal' };
const TYPE_COLOR = { cv: '#14b8a6', cover_letter: '#0891b2', business_proposal: '#f59e0b' };

const DocIcon = ({ type }) => {
  const color = TYPE_COLOR[type] || '#14b8a6';
  return (
    <div style={{ width: 36, height: 36, borderRadius: 9, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    </div>
  );
};

const StatCard = ({ label, value, icon, color }) => (
  <div style={s.statCard}>
    <div style={{ ...s.statIcon, background: `${color}18`, color }}>
      {icon}
    </div>
    <div>
      <div style={s.statValue}>{value}</div>
      <div style={s.statLabel}>{label}</div>
    </div>
  </div>
);

export default function HomeTab({ user, documents, onNavigate, loadingDocuments }) {
  const total = documents?.length || 0;
  const drafts = documents?.filter(d => !d.finalized)?.length || 0;
  const types = new Set(documents?.map(d => d.type))?.size || 0;
  const recentDocs = documents?.slice(0, 4) || [];

  return (
    <div style={s.page} className="page-fade">
      {/* Hero greeting */}
      <div style={s.hero}>
        <div>
          <h1 style={s.heroTitle}>
            Welcome back, <span style={{ color: 'var(--accent-color)' }}>{user?.name?.split(' ')[0] || 'there'}</span> 👋
          </h1>
          <p style={s.heroSub}>Your professional document workspace — create, manage, and export in minutes.</p>
        </div>
        <button onClick={() => onNavigate('create')} style={s.btnCreate}>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          New Document
        </button>
      </div>

      {/* Stats */}
      <div style={s.statsRow}>
        <StatCard label="Total Documents" value={total} color="#14b8a6"
          icon={<svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>}
        />
        <StatCard label="Drafts Saved" value={drafts} color="#f59e0b"
          icon={<svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /></svg>}
        />
        <StatCard label="Doc Types Used" value={types} color="#0891b2"
          icon={<svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>}
        />
      </div>

      {/* Recent docs */}
      <div style={s.section}>
        <div style={s.sectionHeader}>
          <div>
            <h2 style={s.sectionTitle}>Recent Documents</h2>
            <p style={s.sectionSub}>Pick up where you left off</p>
          </div>
          {total > 4 && (
            <button onClick={() => onNavigate('documents')} style={s.btnViewAll}>
              View all {total} →
            </button>
          )}
        </div>

        {loadingDocuments && (
          <div style={s.loadingRow}>
            {[1, 2, 3].map(i => <div key={i} style={s.skeleton} />)}
          </div>
        )}

        {!loadingDocuments && recentDocs.length === 0 && (
          <div style={s.empty}>
            <svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)' }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <p style={{ margin: '12px 0 4px', color: 'var(--text-secondary)', fontWeight: 600 }}>No documents yet</p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Create your first CV, cover letter, or proposal</p>
            <button onClick={() => onNavigate('create')} style={s.btnCreate}>Get Started →</button>
          </div>
        )}

        {!loadingDocuments && recentDocs.length > 0 && (
          <div style={s.docList}>
            {recentDocs.map((d, i) => (
              <div key={d._id || i} style={s.docRow}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--card-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--card-bg)'}
              >
                <DocIcon type={d.type} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={s.docTitle}>{d.title}</div>
                  <div style={s.docMeta}>
                    <span style={{ ...s.typeBadge, background: `${TYPE_COLOR[d.type] || '#3b82f6'}18`, color: TYPE_COLOR[d.type] || '#3b82f6' }}>
                      {TYPE_LABEL[d.type] || d.type}
                    </span>
                    <span>{d.updatedAt ? new Date(d.updatedAt).toLocaleDateString() : d.savedAt}</span>
                  </div>
                </div>
                <button style={s.btnOpen} onClick={() => onNavigate('documents')}>Open →</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div style={s.section}>
        <h2 style={{ ...s.sectionTitle, marginBottom: 14 }}>Quick Actions</h2>
        <div style={s.quickGrid}>
          {[
            { label: 'Build a CV', sub: 'Professional resume', color: '#14b8a6', tab: 'create' },
            { label: 'Write a Cover Letter', sub: 'Tailored to a role', color: '#0891b2', tab: 'create' },
            { label: 'Draft a Proposal', sub: 'Business proposal', color: '#f59e0b', tab: 'create' },
            { label: 'My Documents', sub: 'Manage saved files', color: '#0d9488', tab: 'documents' },
          ].map(q => (
            <button key={q.label} onClick={() => onNavigate(q.tab)} style={s.quickCard}
              onMouseEnter={e => { e.currentTarget.style.borderColor = q.color; e.currentTarget.style.background = `${q.color}08`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.background = 'var(--card-bg)'; }}
            >
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: q.color, flexShrink: 0 }} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{q.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{q.sub}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { padding: 'clamp(16px, 4vw, 36px)', overflow: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 32 },
  hero: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' },
  heroTitle: { fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6, letterSpacing: '-0.03em', fontFamily: "'Outfit', sans-serif" },
  heroSub: { fontSize: 14, color: 'var(--text-secondary)', margin: 0, maxWidth: 480 },
  btnCreate: {
    display: 'inline-flex', alignItems: 'center', gap: 7,
    background: 'var(--accent-color)',
    color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px',
    cursor: 'pointer', fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap',
    boxShadow: '0 4px 14px rgba(59,130,246,0.35)',
    fontFamily: 'inherit', transition: 'filter 0.15s',
  },
  statsRow: { display: 'flex', gap: 14, flexWrap: 'wrap' },
  statCard: {
    flex: '1 1 180px', background: 'var(--card-bg)', border: '1px solid var(--border-color)',
    borderRadius: 14, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14,
    boxShadow: 'var(--shadow-sm)',
  },
  statIcon: { width: 42, height: 42, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  statValue: { fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1, fontFamily: "'Outfit', sans-serif" },
  statLabel: { fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 },
  section: { display: 'flex', flexDirection: 'column', gap: 0 },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16, gap: 12 },
  sectionTitle: { fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', margin: 0 },
  sectionSub: { fontSize: 12, color: 'var(--text-muted)', marginTop: 2 },
  btnViewAll: { background: 'none', border: '1px solid var(--border-color)', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', fontFamily: 'inherit', whiteSpace: 'nowrap' },
  loadingRow: { display: 'flex', flexDirection: 'column', gap: 10 },
  skeleton: { height: 64, background: 'var(--card-bg)', borderRadius: 12, border: '1px solid var(--border-color)', animation: 'pulse 1.5s ease infinite' },
  empty: { background: 'var(--card-bg)', border: '1px dashed var(--border-color)', borderRadius: 16, padding: '48px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' },
  docList: { display: 'flex', flexDirection: 'column', gap: 8 },
  docRow: {
    background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 12,
    padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14,
    transition: 'background 0.15s', cursor: 'default',
  },
  docTitle: { fontWeight: 600, color: 'var(--text-primary)', fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  docMeta: { display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, fontSize: 11, color: 'var(--text-muted)' },
  typeBadge: { padding: '2px 8px', borderRadius: 20, fontWeight: 700, fontSize: 10, letterSpacing: '0.04em', textTransform: 'uppercase' },
  btnOpen: { background: 'var(--accent-subtle)', color: 'var(--accent-color)', border: 'none', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', fontFamily: 'inherit' },
  quickGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 },
  quickCard: {
    display: 'flex', alignItems: 'center', gap: 12,
    background: 'var(--card-bg)', border: '1px solid var(--border-color)',
    borderRadius: 12, padding: '14px 16px',
    cursor: 'pointer', textAlign: 'left',
    transition: 'border-color 0.18s, background 0.18s',
    fontFamily: 'inherit',
  },
};
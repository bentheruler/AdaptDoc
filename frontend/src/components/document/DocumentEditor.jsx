import { useState } from 'react';
import { CATEGORIES } from '../../constants';

const DocumentEditor = ({ category, onCategoryChange, onSaveDraft }) => {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSaveDraft();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={s.bar}>
      <div style={s.left}>
        <span style={s.label}>Document Type</span>
        <select value={category} onChange={e => onCategoryChange(e.target.value)} style={s.select}>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      <button onClick={handleSave} style={{ ...s.saveBtn, ...(saved ? s.savedBtn : {}) }}>
        {saved ? (
          <><span>✓</span> Saved!</>
        ) : (
          <><svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
          </svg> Save Draft</>
        )}
      </button>
    </div>
  );
};

const s = {
  bar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    gap: 16, background: 'var(--surface)',
    borderBottom: '1px solid var(--border-color)',
    padding: '10px 20px', flexShrink: 0,
  },
  left: { display: 'flex', alignItems: 'center', gap: 10 },
  label: { fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' },
  select: {
    padding: '6px 10px', borderRadius: 8,
    border: '1px solid var(--border-color)',
    background: 'var(--card-bg)', fontSize: 12,
    color: 'var(--text-primary)', cursor: 'pointer',
    outline: 'none', minWidth: 130, fontFamily: 'inherit',
  },
  saveBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    background: 'var(--accent-color)', color: '#fff',
    border: 'none', borderRadius: 8, padding: '7px 16px',
    cursor: 'pointer', fontSize: 12, fontWeight: 600,
    whiteSpace: 'nowrap', transition: 'all 0.25s', fontFamily: 'inherit',
  },
  savedBtn: { background: '#0d9488' },
};

export default DocumentEditor;

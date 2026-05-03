// client/src/components/document/DocumentEditor.jsx
import { useState } from 'react';
import { CATEGORIES } from '../../constants';

const DocumentEditor = ({ category, onCategoryChange, editMode, onToggleEditMode, onSaveDraft }) => {
  const [saveFeedback, setSaveFeedback] = useState(false);

  const handleSave = () => {
    onSaveDraft();
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 2000);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20, background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '10px 24px', flexShrink: 0 }}>
      <span style={{ fontSize: 11, color: '#94a3b8', whiteSpace: 'nowrap' }}>
        Dashboard /&nbsp;<span style={{ color: '#1e3a5f', fontWeight: 600 }}>Editing Document</span>
      </span>
      <div style={{ flex: 1 }} />

      {/* Category selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap' }}>Category</span>
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          style={{ padding: '6px 12px', borderRadius: 7, border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: 12, color: '#1e293b', cursor: 'pointer', minWidth: 120 }}
        >
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Save draft */}
      <button
        onClick={handleSave}
        style={{ background: saveFeedback ? '#0d9488' : '#1e3a5f', color: '#fff', border: 'none', borderRadius: 7, padding: '7px 18px', cursor: 'pointer', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', transition: 'background 0.3s', display: 'flex', alignItems: 'center', gap: 6 }}
      >
        {saveFeedback ? '✅ Saved!' : '💾 Save Draft'}
      </button>
    </div>
  );
};

export default DocumentEditor;

// client/src/components/document/ProposalPreview.jsx
import EditableField from '../common/EditableField';

/* ══════════════════════════════════════════════════
   NORMALISE — safe defaults so themes never crash
══════════════════════════════════════════════════ */
const normalise = (data = {}) => ({
  title:            data.title            || '',
  subtitle:         data.subtitle         || 'Technical Proposal',
  preparedBy:       data.preparedBy       || '',
  preparedFor:      data.preparedFor      || '',
  date:             data.date             || '',
  version:          data.version          || 'v1.0',
  executiveSummary: data.executiveSummary || '',
  problemStatement: data.problemStatement || '',
  proposedSolution: data.proposedSolution || '',
  deliverables:     Array.isArray(data.deliverables) ? data.deliverables : [],
  timeline:         Array.isArray(data.timeline)     ? data.timeline     : [],
  budget:           data.budget           || '',
  validity:         data.validity         || '',
  closingNote:      data.closingNote      || '',
  contactName:      data.contactName      || '',
  contactEmail:     data.contactEmail     || '',
});

/* ══════════════════════════════════════════════════
   DISPATCHER
══════════════════════════════════════════════════ */
const ProposalPreview = ({ data, onDataChange, theme, fontSize, accentColor, editMode }) => {
  const nd     = normalise(data);
  const accent = accentColor || '#1e3a5f';
  const fz     = parseInt(fontSize) || 12;
  const update = (f, v) => onDataChange({ ...data, [f]: v });
  const props  = { data: nd, update, accent, fz, editMode };

  const map = {
    Classic:     ClassicProposal,
    Minimal:     MinimalProposal,
    Bold:        BoldProposal,
    Executive:   ExecutiveProposal,
    Tech:        TechProposal,
    Creative:    CreativeProposal,
    Academic:    AcademicProposal,
    Corporate:   CorporateProposal,
    Timeline:    TimelineProposal,
    Infographic: InfographicProposal,
    Nordic:      NordicProposal,
    Elegant:     ElegantProposal,
    Chicago:     ChicagoProposal,
    Sunset:      SunsetProposal,
  };
  const Comp = map[theme] || ModernProposal;
  return <Comp {...props} />;
};

export default ProposalPreview;

/* ══════════════════════════════════════════════════
   SHARED HELPERS
══════════════════════════════════════════════════ */

/* Editable deliverable list */
const Deliverables = ({ items, update, editMode, accent, fz, bulletSx = {}, itemSx = {} }) => {
  if (!items.length && !editMode) return null;
  return (
    <div>
      {items.map((d, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
          <span style={{ flexShrink: 0, marginTop: 3, ...bulletSx }}>✓</span>
          <EditableField
            value={d}
            onChange={v => { const arr = [...items]; arr[i] = v; update('deliverables', arr); }}
            editMode={editMode}
            style={{ fontSize: fz * 0.88, lineHeight: 1.55, flex: 1, ...itemSx }}
          />
        </div>
      ))}
    </div>
  );
};

/* Editable timeline list */
const Timeline = ({ items, update, editMode, accent, fz, cardSx = {}, phaseSx = {}, descSx = {}, durationSx = {} }) => {
  if (!items.length && !editMode) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {items.map((t, i) => (
        <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', ...cardSx }}>
          <div style={{ flex: 1 }}>
            <EditableField value={t.phase} onChange={v => { const arr = [...items]; arr[i] = { ...arr[i], phase: v }; update('timeline', arr); }} editMode={editMode}
              style={{ fontWeight: 700, fontSize: fz * 0.88, display: 'block', marginBottom: 2, ...phaseSx }} />
            <EditableField value={t.desc} onChange={v => { const arr = [...items]; arr[i] = { ...arr[i], desc: v }; update('timeline', arr); }} editMode={editMode}
              style={{ fontSize: fz * 0.82, lineHeight: 1.5, ...descSx }} />
          </div>
          {t.duration && (
            <div style={{ flexShrink: 0, ...durationSx }}>
              <EditableField value={t.duration} onChange={v => { const arr = [...items]; arr[i] = { ...arr[i], duration: v }; update('timeline', arr); }} editMode={editMode}
                style={{ fontSize: fz * 0.78, fontWeight: 700, ...durationSx }} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

/* Meta row (Prepared by / for / date / version) */
const MetaGrid = ({ data, update, editMode, fz, labelSx = {}, valueSx = {} }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 28px' }}>
    {[
      ['Prepared by',  'preparedBy'],
      ['Prepared for', 'preparedFor'],
      ['Date',         'date'],
      ['Version',      'version'],
    ].map(([label, field]) => (editMode || data[field]) && (
      <div key={field}>
        <div style={{ fontSize: fz * 0.65, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 2, ...labelSx }}>{label}</div>
        <EditableField value={data[field]} onChange={v => update(field, v)} editMode={editMode}
          style={{ fontSize: fz * 0.82, fontWeight: 600, ...valueSx }} />
      </div>
    ))}
  </div>
);

/* ══════════════════════════════════════════════════
   1. MODERN
══════════════════════════════════════════════════ */
function ModernProposal({ data, update, accent, fz, editMode }) {
  const dark = '#0f172a';
  const S = ({ label, children }) => (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div style={{ width: 3, height: 16, background: accent, borderRadius: 2 }} />
        <span style={{ fontSize: fz * 0.72, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: accent }}>{label}</span>
      </div>
      {children}
    </div>
  );
  return (
    <div style={{ fontFamily: "'Lato',sans-serif", fontSize: fz, background: '#fff', minHeight: 700 }}>
      <div style={{ background: dark, padding: '30px 40px', color: '#fff', borderBottom: `4px solid ${accent}`, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -20, top: -20, width: 140, height: 140, borderRadius: '50%', background: `${accent}15`, pointerEvents: 'none' }} />
        <EditableField value={data.title}    onChange={v => update('title',    v)} editMode={editMode} style={{ fontSize: fz * 2, fontWeight: 800, color: '#fff', lineHeight: 1.1, display: 'block' }} inputStyle={{ color: '#fff', background: 'rgba(255,255,255,0.1)', border: '1px dashed rgba(255,255,255,0.4)' }} />
        <EditableField value={data.subtitle} onChange={v => update('subtitle', v)} editMode={editMode} style={{ fontSize: fz * 0.88, color: accent, fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', marginTop: 6, display: 'block' }} inputStyle={{ color: accent, background: 'rgba(255,255,255,0.05)', border: '1px dashed rgba(255,255,255,0.3)' }} />
        <div style={{ marginTop: 16 }}><MetaGrid data={data} update={update} editMode={editMode} fz={fz} labelSx={{ color: 'rgba(255,255,255,0.45)' }} valueSx={{ color: 'rgba(255,255,255,0.85)' }} /></div>
      </div>
      <div style={{ padding: '28px 40px' }}>
        {(editMode || data.executiveSummary) && <S label="Executive Summary"><EditableField value={data.executiveSummary} onChange={v => update('executiveSummary', v)} editMode={editMode} multiline style={{ fontSize: fz * 0.9, color: '#374151', lineHeight: 1.7 }} /></S>}
        {(editMode || data.problemStatement) && <S label="Problem Statement"><EditableField value={data.problemStatement} onChange={v => update('problemStatement', v)} editMode={editMode} multiline style={{ fontSize: fz * 0.9, color: '#374151', lineHeight: 1.7 }} /></S>}
        {(editMode || data.proposedSolution) && <S label="Proposed Solution"><EditableField value={data.proposedSolution} onChange={v => update('proposedSolution', v)} editMode={editMode} multiline style={{ fontSize: fz * 0.9, color: '#374151', lineHeight: 1.7 }} /></S>}
        {(editMode || data.deliverables.length > 0) && <S label="Deliverables"><Deliverables items={data.deliverables} update={update} editMode={editMode} accent={accent} fz={fz} bulletSx={{ color: accent, fontWeight: 700, fontSize: 12 }} itemSx={{ color: '#374151' }} /></S>}
        {(editMode || data.timeline.length > 0) && <S label="Timeline"><Timeline items={data.timeline} update={update} editMode={editMode} accent={accent} fz={fz} cardSx={{ background: '#f8fafc', borderLeft: `3px solid ${accent}`, borderRadius: '0 8px 8px 0', padding: '10px 14px' }} phaseSx={{ color: '#111' }} descSx={{ color: '#64748b' }} durationSx={{ background: accent, color: '#fff', borderRadius: 6, padding: '3px 10px', fontSize: fz * 0.76, fontWeight: 700, whiteSpace: 'nowrap' }} /></S>}
        {(editMode || data.budget) && <S label="Budget">
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1, background: `${accent}08`, border: `1.5px solid ${accent}30`, borderRadius: 10, padding: '14px 18px' }}>
              <div style={{ fontSize: fz * 0.7, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: accent, marginBottom: 4 }}>Total Budget</div>
              <EditableField value={data.budget} onChange={v => update('budget', v)} editMode={editMode} style={{ fontSize: fz * 1.2, fontWeight: 700, color: '#111' }} />
            </div>
            {(editMode || data.validity) && <div style={{ flex: 1, background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '14px 18px' }}>
              <div style={{ fontSize: fz * 0.7, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b', marginBottom: 4 }}>Validity</div>
              <EditableField value={data.validity} onChange={v => update('validity', v)} editMode={editMode} style={{ fontSize: fz * 0.9, fontWeight: 600, color: '#374151' }} />
            </div>}
          </div>
        </S>}
        {(editMode || data.closingNote) && <S label="Closing Note"><EditableField value={data.closingNote} onChange={v => update('closingNote', v)} editMode={editMode} multiline style={{ fontSize: fz * 0.9, color: '#374151', lineHeight: 1.7, fontStyle: 'italic' }} /></S>}
        {(editMode || data.contactName) && <div style={{ borderTop: `1px solid ${accent}30`, paddingTop: 14, marginTop: 8 }}>
          <EditableField value={data.contactName}  onChange={v => update('contactName',  v)} editMode={editMode} style={{ fontWeight: 700, fontSize: fz * 1.05, color: accent, display: 'block' }} />
          <EditableField value={data.contactEmail} onChange={v => update('contactEmail', v)} editMode={editMode} style={{ fontSize: fz * 0.85, color: '#64748b', display: 'block', marginTop: 2 }} />
        </div>}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   2. CLASSIC
══════════════════════════════════════════════════ */
function ClassicProposal({ data, update, accent, fz, editMode }) {
  const S = ({ label, children }) => (
    <div style={{ marginBottom: 22 }}>
      <div style={{ fontSize: fz, fontWeight: 400, fontVariant: 'small-caps', letterSpacing: '2px', color: accent, borderBottom: `1px solid ${accent}50`, paddingBottom: 3, marginBottom: 10 }}>{label}</div>
      {children}
    </div>
  );
  return (
    <div style={{ fontFamily: "'EB Garamond',Georgia,serif", fontSize: fz, background: '#fffef9', padding: '40px 48px', minHeight: 700, color: '#1a1a1a' }}>
      <div style={{ textAlign: 'center', borderBottom: `2px solid ${accent}`, paddingBottom: 20, marginBottom: 28 }}>
        <EditableField value={data.title}    onChange={v => update('title',    v)} editMode={editMode} style={{ fontSize: fz * 2.1, fontWeight: 400, color: '#1a1a1a', letterSpacing: '1px', fontVariant: 'small-caps', display: 'block' }} />
        <EditableField value={data.subtitle} onChange={v => update('subtitle', v)} editMode={editMode} style={{ fontSize: fz * 0.95, color: '#666', fontStyle: 'italic', display: 'block', marginTop: 6 }} />
        <div style={{ marginTop: 14, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '6px 24px', fontSize: fz * 0.82, color: '#888' }}>
          {[['preparedBy','preparedFor','date','version']].flat().map(f => (data[f] || editMode) && (
            <EditableField key={f} value={data[f] || ''} onChange={v => update(f, v)} editMode={editMode} style={{ color: '#888' }} />
          ))}
        </div>
      </div>
      {[['Executive Summary','executiveSummary'],['Problem Statement','problemStatement'],['Proposed Solution','proposedSolution']].map(([label,field]) =>
        (editMode || data[field]) && <S key={field} label={label}><EditableField value={data[field]} onChange={v=>update(field,v)} editMode={editMode} multiline style={{ fontSize: fz * 0.92, color: '#333', lineHeight: 1.75 }} /></S>
      )}
      {(editMode || data.deliverables.length > 0) && <S label="Deliverables"><Deliverables items={data.deliverables} update={update} editMode={editMode} accent={accent} fz={fz} bulletSx={{ color: accent, fontSize: 9 }} itemSx={{ color: '#333', fontStyle: 'italic' }} /></S>}
      {(editMode || data.timeline.length > 0) && <S label="Project Timeline"><Timeline items={data.timeline} update={update} editMode={editMode} accent={accent} fz={fz} cardSx={{ borderBottom: `0.5px solid ${accent}20`, paddingBottom: 8 }} phaseSx={{ color: '#1a1a1a', fontStyle: 'normal' }} descSx={{ color: '#555', fontStyle: 'italic' }} durationSx={{ color: accent, fontStyle: 'italic' }} /></S>}
      {(editMode || data.budget) && <S label="Budget & Validity">
        <div style={{ display: 'flex', gap: 20 }}>
          <div><div style={{ fontSize: fz * 0.8, color: '#888', marginBottom: 3 }}>Total Budget</div><EditableField value={data.budget} onChange={v=>update('budget',v)} editMode={editMode} style={{ fontSize: fz * 1.1, fontWeight: 600, color: accent }} /></div>
          {(editMode||data.validity)&&<div><div style={{ fontSize: fz * 0.8, color: '#888', marginBottom: 3 }}>Validity</div><EditableField value={data.validity} onChange={v=>update('validity',v)} editMode={editMode} style={{ fontSize: fz * 0.92, color: '#555' }} /></div>}
        </div>
      </S>}
      {(editMode || data.closingNote) && <S label="Closing Note"><EditableField value={data.closingNote} onChange={v=>update('closingNote',v)} editMode={editMode} multiline style={{ fontSize: fz * 0.9, color: '#333', lineHeight: 1.75, fontStyle: 'italic' }} /></S>}
      {(editMode || data.contactName) && <div style={{ borderTop: `1px solid ${accent}40`, paddingTop: 12, marginTop: 8, textAlign: 'center' }}>
        <EditableField value={data.contactName}  onChange={v=>update('contactName',v)}  editMode={editMode} style={{ fontWeight: 600, fontSize: fz, color: accent, display: 'block' }} />
        <EditableField value={data.contactEmail} onChange={v=>update('contactEmail',v)} editMode={editMode} style={{ fontSize: fz * 0.85, color: '#888', display: 'block', marginTop: 2 }} />
      </div>}
    </div>
  );
}

/* ══════════════════════════════════════════════════
   3. MINIMAL
══════════════════════════════════════════════════ */
function MinimalProposal({ data, update, accent, fz, editMode }) {
  const S = ({ label, children }) => (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <span style={{ fontSize: fz * 0.65, fontWeight: 600, letterSpacing: '3px', textTransform: 'uppercase', color: '#bbb' }}>{label}</span>
        <div style={{ flex: 1, height: '0.5px', background: '#e5e7eb' }} />
      </div>
      {children}
    </div>
  );
  return (
    <div style={{ fontFamily: "'DM Sans','Helvetica Neue',sans-serif", fontSize: fz, background: '#fafafa', padding: '48px 52px', minHeight: 700, color: '#111' }}>
      <div style={{ marginBottom: 40 }}>
        <EditableField value={data.title}    onChange={v=>update('title',    v)} editMode={editMode} style={{ fontSize: fz * 2.4, fontWeight: 200, color: '#111', letterSpacing: '-1.5px', lineHeight: 1, display: 'block' }} />
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 32, height: 1.5, background: accent }} />
          <EditableField value={data.subtitle} onChange={v=>update('subtitle',v)} editMode={editMode} style={{ fontSize: fz * 0.82, color: '#777', letterSpacing: '2px', textTransform: 'uppercase' }} />
        </div>
        <div style={{ marginTop: 14, display: 'flex', gap: 20, fontSize: fz * 0.76, color: '#aaa' }}>
          {['preparedBy','preparedFor','date'].map(f => (data[f]||editMode)&&<EditableField key={f} value={data[f]||''} onChange={v=>update(f,v)} editMode={editMode} style={{ color: '#aaa', fontSize: fz * 0.76 }} />)}
        </div>
      </div>
      {[['Executive Summary','executiveSummary'],['Problem Statement','problemStatement'],['Proposed Solution','proposedSolution']].map(([label,field]) =>
        (editMode||data[field])&&<S key={field} label={label}><EditableField value={data[field]} onChange={v=>update(field,v)} editMode={editMode} multiline style={{ fontSize: fz * 0.9, color: '#444', lineHeight: 1.85, fontWeight: 300 }} /></S>
      )}
      {(editMode||data.deliverables.length>0)&&<S label="Deliverables"><Deliverables items={data.deliverables} update={update} editMode={editMode} accent={accent} fz={fz} bulletSx={{ color: '#ccc', fontSize: 10 }} itemSx={{ color: '#555', fontWeight: 300 }} /></S>}
      {(editMode||data.timeline.length>0)&&<S label="Timeline"><Timeline items={data.timeline} update={update} editMode={editMode} accent={accent} fz={fz} cardSx={{ borderLeft: `1.5px solid #e5e7eb`, paddingLeft: 14 }} phaseSx={{ color: '#111' }} descSx={{ color: '#888', fontWeight: 300 }} durationSx={{ color: accent, fontWeight: 400 }} /></S>}
      {(editMode||data.budget)&&<S label="Budget"><EditableField value={data.budget} onChange={v=>update('budget',v)} editMode={editMode} style={{ fontSize: fz * 1.4, fontWeight: 200, color: accent, letterSpacing: '-0.5px' }} /></S>}
      {(editMode||data.closingNote)&&<S label="Closing"><EditableField value={data.closingNote} onChange={v=>update('closingNote',v)} editMode={editMode} multiline style={{ fontSize: fz * 0.88, color: '#555', lineHeight: 1.8, fontWeight: 300 }} /></S>}
      {(editMode||data.contactName)&&<div style={{ marginTop: 32, paddingTop: 16, borderTop: '0.5px solid #e5e7eb' }}>
        <EditableField value={data.contactName}  onChange={v=>update('contactName', v)}  editMode={editMode} style={{ fontWeight: 500, color: '#111', display: 'block' }} />
        <EditableField value={data.contactEmail} onChange={v=>update('contactEmail',v)} editMode={editMode} style={{ fontSize: fz * 0.82, color: '#aaa', display: 'block', marginTop: 2 }} />
      </div>}
    </div>
  );
}

/* ══════════════════════════════════════════════════
   4. BOLD
══════════════════════════════════════════════════ */
function BoldProposal({ data, update, accent, fz, editMode }) {
  const dark = '#0f172a';
  const S = ({ label, children }) => (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{ background: dark, color: '#fff', fontSize: fz * 0.68, fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', padding: '3px 10px', borderRadius: 3 }}>{label}</div>
        <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
      </div>
      {children}
    </div>
  );
  return (
    <div style={{ fontFamily: "'Barlow','Helvetica Neue',sans-serif", fontSize: fz, background: '#fff', minHeight: 700 }}>
      <div style={{ background: dark, padding: '28px 36px 22px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 5, background: accent }} />
        <EditableField value={data.title}    onChange={v=>update('title',    v)} editMode={editMode} style={{ fontSize: fz * 2.2, fontWeight: 800, color: '#fff', lineHeight: 1, textTransform: 'uppercase', letterSpacing: '-0.5px', display: 'block', fontFamily: "'Barlow Condensed','Barlow',sans-serif" }} inputStyle={{ color: '#fff', background: 'rgba(255,255,255,0.1)', border: '1px dashed rgba(255,255,255,0.4)' }} />
        <EditableField value={data.subtitle} onChange={v=>update('subtitle', v)} editMode={editMode} style={{ fontSize: fz * 0.88, color: accent, fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', marginTop: 8, display: 'block' }} inputStyle={{ color: accent }} />
        <div style={{ marginTop: 14 }}><MetaGrid data={data} update={update} editMode={editMode} fz={fz} labelSx={{ color: 'rgba(255,255,255,0.4)' }} valueSx={{ color: 'rgba(255,255,255,0.85)', fontWeight: 600 }} /></div>
      </div>
      <div style={{ padding: '24px 36px' }}>
        {[['Executive Summary','executiveSummary'],['Problem Statement','problemStatement'],['Proposed Solution','proposedSolution']].map(([label,field]) =>
          (editMode||data[field])&&<S key={field} label={label}><EditableField value={data[field]} onChange={v=>update(field,v)} editMode={editMode} multiline style={{ fontSize: fz * 0.9, color: '#374151', lineHeight: 1.7 }} /></S>
        )}
        {(editMode||data.deliverables.length>0)&&<S label="Deliverables"><Deliverables items={data.deliverables} update={update} editMode={editMode} accent={accent} fz={fz} bulletSx={{ background: accent, color: '#fff', borderRadius: 3, width: 16, height: 16, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700 }} itemSx={{ color: '#374151' }} /></S>}
        {(editMode||data.timeline.length>0)&&<S label="Timeline"><Timeline items={data.timeline} update={update} editMode={editMode} accent={accent} fz={fz} cardSx={{ background: '#f8fafc', borderLeft: `4px solid ${accent}`, borderRadius: '0 6px 6px 0', padding: '8px 14px' }} phaseSx={{ color: '#111', textTransform: 'uppercase', letterSpacing: '0.5px' }} descSx={{ color: '#64748b' }} durationSx={{ background: accent, color: '#fff', borderRadius: 4, padding: '2px 9px', fontSize: fz * 0.76, fontWeight: 700 }} /></S>}
        {(editMode||data.budget)&&<S label="Budget & Validity">
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1, background: dark, color: '#fff', borderRadius: 8, padding: '14px 18px' }}>
              <div style={{ fontSize: fz * 0.68, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>Total Budget</div>
              <EditableField value={data.budget} onChange={v=>update('budget',v)} editMode={editMode} style={{ fontSize: fz * 1.2, fontWeight: 700, color: accent }} inputStyle={{ color: accent }} />
            </div>
            {(editMode||data.validity)&&<div style={{ flex: 1, border: `1.5px solid ${accent}30`, borderRadius: 8, padding: '14px 18px' }}>
              <div style={{ fontSize: fz * 0.68, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>Validity</div>
              <EditableField value={data.validity} onChange={v=>update('validity',v)} editMode={editMode} style={{ fontSize: fz * 0.9, fontWeight: 600, color: '#374151' }} />
            </div>}
          </div>
        </S>}
        {(editMode||data.closingNote)&&<S label="Closing Note"><EditableField value={data.closingNote} onChange={v=>update('closingNote',v)} editMode={editMode} multiline style={{ fontSize: fz * 0.9, color: '#374151', lineHeight: 1.7, fontStyle: 'italic' }} /></S>}
        {(editMode||data.contactName)&&<div style={{ borderTop: `1px solid ${accent}30`, paddingTop: 12, marginTop: 4 }}>
          <EditableField value={data.contactName}  onChange={v=>update('contactName', v)}  editMode={editMode} style={{ fontWeight: 700, fontSize: fz * 1.05, color: accent, display: 'block' }} />
          <EditableField value={data.contactEmail} onChange={v=>update('contactEmail',v)} editMode={editMode} style={{ fontSize: fz * 0.85, color: '#64748b', display: 'block', marginTop: 2 }} />
        </div>}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   5. EXECUTIVE — luxury dark header, gold rules
══════════════════════════════════════════════════ */
function ExecutiveProposal({ data, update, accent, fz, editMode }) {
  const gold = accent;
  const S = ({ label, children }) => (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <div style={{ height: '0.5px', width: 20, background: gold, opacity: 0.7 }} />
        <span style={{ fontSize: fz * 0.68, fontWeight: 400, letterSpacing: '4px', textTransform: 'uppercase', color: gold }}>{label}</span>
        <div style={{ flex: 1, height: '0.5px', background: gold, opacity: 0.7 }} />
      </div>
      {children}
    </div>
  );
  return (
    <div style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: fz, background: '#fdfcf8', minHeight: 700, color: '#1a1510' }}>
      <div style={{ background: 'linear-gradient(135deg,#0f172a,#1e293b)', padding: '36px 48px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg,${gold},${gold}88)` }} />
        <EditableField value={data.title}    onChange={v=>update('title',    v)} editMode={editMode} style={{ fontSize: fz * 2.2, fontWeight: 300, color: '#fff', letterSpacing: '2px', display: 'block', fontFamily: "'Cormorant Garamond',serif" }} inputStyle={{ color: '#fff', background: 'rgba(255,255,255,0.1)', border: '1px dashed rgba(255,255,255,0.3)' }} />
        <EditableField value={data.subtitle} onChange={v=>update('subtitle', v)} editMode={editMode} style={{ fontSize: fz * 0.9, color: gold, fontWeight: 300, letterSpacing: '3px', textTransform: 'uppercase', marginTop: 8, display: 'block' }} inputStyle={{ color: gold }} />
        <div style={{ marginTop: 18, display: 'flex', gap: 28, flexWrap: 'wrap' }}>
          {[['Prepared by','preparedBy'],['Prepared for','preparedFor'],['Date','date']].map(([label,field])=>(editMode||data[field])&&(
            <div key={field}><div style={{ fontSize: fz * 0.62, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 3 }}>{label}</div><EditableField value={data[field]||''} onChange={v=>update(field,v)} editMode={editMode} style={{ fontSize: fz * 0.82, color: 'rgba(255,255,255,0.82)', fontWeight: 300 }} inputStyle={{ color: '#fff', background: 'rgba(255,255,255,0.08)', border: '1px dashed rgba(255,255,255,0.3)' }} /></div>
          ))}
        </div>
      </div>
      <div style={{ padding: '32px 48px' }}>
        {[['Executive Summary','executiveSummary'],['Problem Statement','problemStatement'],['Proposed Solution','proposedSolution']].map(([label,field])=>
          (editMode||data[field])&&<S key={field} label={label}><EditableField value={data[field]} onChange={v=>update(field,v)} editMode={editMode} multiline style={{ fontSize: fz * 0.92, color: '#3d3228', lineHeight: 1.85, fontWeight: 300 }} /></S>
        )}
        {(editMode||data.deliverables.length>0)&&<S label="Deliverables"><Deliverables items={data.deliverables} update={update} editMode={editMode} accent={gold} fz={fz} bulletSx={{ color: gold, opacity: 0.7, fontSize: 8 }} itemSx={{ color: '#3d3228', fontWeight: 300 }} /></S>}
        {(editMode||data.timeline.length>0)&&<S label="Project Timeline"><Timeline items={data.timeline} update={update} editMode={editMode} accent={gold} fz={fz} cardSx={{ borderBottom: `0.5px solid ${gold}20`, paddingBottom: 12 }} phaseSx={{ color: '#1a1510', fontWeight: 600 }} descSx={{ color: '#6b5a3e', fontWeight: 300 }} durationSx={{ color: gold, fontStyle: 'italic', fontWeight: 300 }} /></S>}
        {(editMode||data.budget)&&<S label="Investment">
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: fz * 0.7, letterSpacing: '3px', textTransform: 'uppercase', color: '#9a8b75', marginBottom: 6 }}>Total Budget</div>
            <EditableField value={data.budget} onChange={v=>update('budget',v)} editMode={editMode} style={{ fontSize: fz * 1.8, fontWeight: 300, color: gold, letterSpacing: '-0.5px' }} />
            {(editMode||data.validity)&&<div style={{ fontSize: fz * 0.8, color: '#9a8b75', marginTop: 6, fontStyle: 'italic' }}><EditableField value={data.validity} onChange={v=>update('validity',v)} editMode={editMode} style={{ color: '#9a8b75', fontSize: fz * 0.8 }} /></div>}
          </div>
        </S>}
        {(editMode||data.closingNote)&&<S label="Closing Note"><EditableField value={data.closingNote} onChange={v=>update('closingNote',v)} editMode={editMode} multiline style={{ fontSize: fz * 0.9, color: '#3d3228', lineHeight: 1.85, fontStyle: 'italic', textAlign: 'center' }} /></S>}
        {(editMode||data.contactName)&&<div style={{ textAlign: 'center', borderTop: `0.5px solid ${gold}40`, paddingTop: 16, marginTop: 12 }}>
          <EditableField value={data.contactName}  onChange={v=>update('contactName', v)}  editMode={editMode} style={{ fontWeight: 600, color: gold, display: 'block' }} />
          <EditableField value={data.contactEmail} onChange={v=>update('contactEmail',v)} editMode={editMode} style={{ fontSize: fz * 0.82, color: '#9a8b75', display: 'block', marginTop: 2, fontStyle: 'italic' }} />
        </div>}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   6. TECH — dark terminal
══════════════════════════════════════════════════ */
function TechProposal({ data, update, accent, fz, editMode }) {
  const bg = '#0d1117'; const bg2 = '#161b22'; const border = '#30363d'; const green = accent; const muted = '#8b949e';
  const S = ({ label, children }) => (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ color: green, fontSize: fz * 0.8 }}>{'>'}</span>
        <span style={{ fontSize: fz * 0.74, fontWeight: 500, letterSpacing: '1px', color: green, textTransform: 'uppercase' }}>{label}</span>
        <div style={{ flex: 1, height: '1px', background: border }} />
      </div>
      {children}
    </div>
  );
  const inputSx = { background: 'rgba(255,255,255,0.05)', border: `1px dashed ${green}60`, borderRadius: 3, color: '#e6edf3', fontFamily: "'Fira Code',monospace", outline: 'none', padding: '2px 6px' };
  return (
    <div style={{ fontFamily: "'Fira Code',Consolas,monospace", fontSize: fz, background: bg, minHeight: 700, color: '#e6edf3' }}>
      <div style={{ background: bg2, borderBottom: `1px solid ${border}`, padding: '24px 28px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}><span style={{ color: green }}>~/</span><EditableField value={data.title} onChange={v=>update('title',v)} editMode={editMode} style={{ fontSize: fz * 1.7, fontWeight: 600, color: '#e6edf3' }} inputStyle={inputSx} /></div>
        <div style={{ display: 'flex', gap: 8 }}><span style={{ color: muted }}>$</span><EditableField value={data.subtitle} onChange={v=>update('subtitle',v)} editMode={editMode} style={{ fontSize: fz * 0.85, color: green }} inputStyle={inputSx} /></div>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginTop: 12, fontSize: fz * 0.75, color: muted }}>
          {[['preparedBy','by:'],['preparedFor','for:'],['date','date:'],['version','ver:']].map(([f,prefix])=>(data[f]||editMode)&&<span key={f}><span style={{ color: green }}>{prefix}</span> {data[f]||'—'}</span>)}
        </div>
      </div>
      <div style={{ padding: '20px 28px' }}>
        {[['README.md','executiveSummary'],['PROBLEM.md','problemStatement'],['SOLUTION.md','proposedSolution']].map(([label,field])=>
          (editMode||data[field])&&<S key={field} label={label}><div style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 6, padding: '10px 14px' }}><EditableField value={data[field]} onChange={v=>update(field,v)} editMode={editMode} multiline style={{ fontSize: fz * 0.84, color: '#c9d1d9', lineHeight: 1.7, fontWeight: 300 }} /></div></S>
        )}
        {(editMode||data.deliverables.length>0)&&<S label="deliverables.json"><div style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 6, padding: '10px 14px' }}><Deliverables items={data.deliverables} update={update} editMode={editMode} accent={green} fz={fz} bulletSx={{ color: green, fontSize: fz * 0.8 }} itemSx={{ color: '#c9d1d9' }} /></div></S>}
        {(editMode||data.timeline.length>0)&&<S label="timeline.log"><Timeline items={data.timeline} update={update} editMode={editMode} accent={green} fz={fz} cardSx={{ background: bg2, border: `1px solid ${border}`, borderRadius: 6, padding: '8px 12px' }} phaseSx={{ color: '#e6edf3' }} descSx={{ color: muted }} durationSx={{ background: `${green}20`, color: green, borderRadius: 4, padding: '1px 8px', fontSize: fz * 0.75, fontFamily: 'inherit' }} /></S>}
        {(editMode||data.budget)&&<S label="budget.env">
          <div style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 6, padding: '10px 14px', display: 'flex', gap: 20 }}>
            <div><span style={{ color: green }}>BUDGET=</span><EditableField value={data.budget} onChange={v=>update('budget',v)} editMode={editMode} style={{ color: '#e6edf3', fontWeight: 600 }} inputStyle={inputSx} /></div>
            {(editMode||data.validity)&&<div><span style={{ color: green }}>VALIDITY=</span><EditableField value={data.validity} onChange={v=>update('validity',v)} editMode={editMode} style={{ color: muted }} inputStyle={inputSx} /></div>}
          </div>
        </S>}
        {(editMode||data.closingNote)&&<S label="CLOSING.md"><EditableField value={data.closingNote} onChange={v=>update('closingNote',v)} editMode={editMode} multiline style={{ fontSize: fz * 0.84, color: muted, lineHeight: 1.7 }} /></S>}
        {(editMode||data.contactName)&&<div style={{ borderTop: `1px solid ${border}`, paddingTop: 12, marginTop: 8, display: 'flex', gap: 8 }}>
          <span style={{ color: green }}>$</span>
          <div><EditableField value={data.contactName}  onChange={v=>update('contactName', v)}  editMode={editMode} style={{ color: '#e6edf3', fontWeight: 600, display: 'block' }} inputStyle={inputSx} />
          <EditableField value={data.contactEmail} onChange={v=>update('contactEmail',v)} editMode={editMode} style={{ color: muted, display: 'block', marginTop: 2 }} inputStyle={inputSx} /></div>
        </div>}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   7. CREATIVE — diagonal color block
══════════════════════════════════════════════════ */
function CreativeProposal({ data, update, accent, fz, editMode }) {
  const S = ({ label, children }) => (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 9 }}>
        <div style={{ width: 8, height: 8, borderRadius: 2, background: accent, transform: 'rotate(45deg)', flexShrink: 0 }} />
        <span style={{ fontSize: fz * 0.7, fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', color: accent }}>{label}</span>
      </div>
      {children}
    </div>
  );
  return (
    <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: fz, background: '#fff', minHeight: 700, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -30, right: -30, width: 200, height: 200, borderRadius: '50%', background: `${accent}10`, pointerEvents: 'none' }} />
      <div style={{ background: `linear-gradient(135deg,${accent},${accent}cc)`, padding: '28px 36px 22px', clipPath: 'polygon(0 0,100% 0,100% 82%,0 100%)', marginBottom: 8 }}>
        <EditableField value={data.title}    onChange={v=>update('title',    v)} editMode={editMode} style={{ fontSize: fz * 1.9, fontWeight: 800, color: '#fff', lineHeight: 1.15, display: 'block' }} inputStyle={{ color: '#fff', background: 'rgba(255,255,255,0.15)', border: '1px dashed rgba(255,255,255,0.4)' }} />
        <EditableField value={data.subtitle} onChange={v=>update('subtitle', v)} editMode={editMode} style={{ fontSize: fz * 0.82, color: 'rgba(255,255,255,0.8)', fontWeight: 600, letterSpacing: '1px', marginTop: 6, display: 'block' }} />
        <div style={{ marginTop: 14, display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: fz * 0.76, color: 'rgba(255,255,255,0.75)' }}>
          {['preparedBy','preparedFor','date'].map(f=>(data[f]||editMode)&&<EditableField key={f} value={data[f]||''} onChange={v=>update(f,v)} editMode={editMode} style={{ color: 'rgba(255,255,255,0.8)' }} />)}
        </div>
      </div>
      <div style={{ padding: '0 36px 28px' }}>
        {[['Executive Summary','executiveSummary'],['Problem','problemStatement'],['Solution','proposedSolution']].map(([label,field])=>
          (editMode||data[field])&&<S key={field} label={label}><EditableField value={data[field]} onChange={v=>update(field,v)} editMode={editMode} multiline style={{ fontSize: fz * 0.88, color: '#444', lineHeight: 1.7 }} /></S>
        )}
        {(editMode||data.deliverables.length>0)&&<S label="Deliverables"><Deliverables items={data.deliverables} update={update} editMode={editMode} accent={accent} fz={fz} bulletSx={{ background: accent, color: '#fff', borderRadius: '50%', width: 14, height: 14, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700 }} itemSx={{ color: '#444' }} /></S>}
        {(editMode||data.timeline.length>0)&&<S label="Timeline"><Timeline items={data.timeline} update={update} editMode={editMode} accent={accent} fz={fz} cardSx={{ background: `${accent}08`, borderRadius: 8, padding: '10px 14px', border: `1px solid ${accent}20` }} phaseSx={{ color: accent, fontWeight: 700 }} descSx={{ color: '#666' }} durationSx={{ background: accent, color: '#fff', borderRadius: 20, padding: '1px 10px', fontSize: fz * 0.76, fontWeight: 700 }} /></S>}
        {(editMode||data.budget)&&<S label="Budget">
          <div style={{ background: `linear-gradient(135deg,${accent}15,${accent}05)`, border: `1.5px solid ${accent}30`, borderRadius: 12, padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div><div style={{ fontSize: fz * 0.7, color: accent, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>Total Investment</div><EditableField value={data.budget} onChange={v=>update('budget',v)} editMode={editMode} style={{ fontSize: fz * 1.3, fontWeight: 800, color: accent }} /></div>
            {(editMode||data.validity)&&<div style={{ textAlign: 'right' }}><div style={{ fontSize: fz * 0.7, color: '#888', marginBottom: 4 }}>Valid for</div><EditableField value={data.validity} onChange={v=>update('validity',v)} editMode={editMode} style={{ fontSize: fz * 0.88, color: '#444', fontWeight: 600 }} /></div>}
          </div>
        </S>}
        {(editMode||data.closingNote)&&<S label="Closing"><EditableField value={data.closingNote} onChange={v=>update('closingNote',v)} editMode={editMode} multiline style={{ fontSize: fz * 0.88, color: '#444', lineHeight: 1.7 }} /></S>}
        {(editMode||data.contactName)&&<div style={{ marginTop: 20, background: `${accent}08`, borderRadius: 10, padding: '14px 18px', border: `1px solid ${accent}20` }}>
          <EditableField value={data.contactName}  onChange={v=>update('contactName', v)}  editMode={editMode} style={{ fontWeight: 700, color: accent, display: 'block' }} />
          <EditableField value={data.contactEmail} onChange={v=>update('contactEmail',v)} editMode={editMode} style={{ fontSize: fz * 0.82, color: '#666', display: 'block', marginTop: 2 }} />
        </div>}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   8. ACADEMIC — two-column layout
══════════════════════════════════════════════════ */
function AcademicProposal({ data, update, accent, fz, editMode }) {
  const S = ({ label, children }) => (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: fz * 0.76, fontWeight: 600, color: accent, textTransform: 'uppercase', letterSpacing: '1.5px', borderBottom: `0.5px solid ${accent}`, paddingBottom: 3, marginBottom: 8 }}>{label}</div>
      {children}
    </div>
  );
  return (
    <div style={{ fontFamily: "'Source Serif 4',Georgia,serif", fontSize: fz, background: '#fff', padding: '32px 36px', minHeight: 700, color: '#111' }}>
      <div style={{ textAlign: 'center', borderBottom: `2px solid ${accent}`, paddingBottom: 16, marginBottom: 24 }}>
        <EditableField value={data.title}    onChange={v=>update('title',    v)} editMode={editMode} style={{ fontSize: fz * 1.9, fontWeight: 600, color: '#111', display: 'block' }} />
        <EditableField value={data.subtitle} onChange={v=>update('subtitle', v)} editMode={editMode} style={{ fontSize: fz * 0.88, color: accent, fontStyle: 'italic', display: 'block', marginTop: 4 }} />
        <div style={{ marginTop: 10, fontSize: fz * 0.76, color: '#666', display: 'flex', justifyContent: 'center', gap: '0 20px', flexWrap: 'wrap' }}>
          {['preparedBy','preparedFor','date','version'].map(f=>(data[f]||editMode)&&<EditableField key={f} value={data[f]||''} onChange={v=>update(f,v)} editMode={editMode} style={{ color: '#666' }} />)}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 28 }}>
        <div style={{ flex: 2 }}>
          {[['Abstract','executiveSummary'],['Problem Statement','problemStatement'],['Proposed Methodology','proposedSolution']].map(([label,field])=>
            (editMode||data[field])&&<S key={field} label={label}><EditableField value={data[field]} onChange={v=>update(field,v)} editMode={editMode} multiline style={{ fontSize: fz * 0.9, color: '#333', lineHeight: 1.75 }} /></S>
          )}
          {(editMode||data.closingNote)&&<S label="Conclusion"><EditableField value={data.closingNote} onChange={v=>update('closingNote',v)} editMode={editMode} multiline style={{ fontSize: fz * 0.9, color: '#333', lineHeight: 1.75 }} /></S>}
        </div>
        <div style={{ flex: 1, borderLeft: `0.5px solid ${accent}25`, paddingLeft: 20 }}>
          {(editMode||data.deliverables.length>0)&&<S label="Outcomes"><Deliverables items={data.deliverables} update={update} editMode={editMode} accent={accent} fz={fz} bulletSx={{ color: accent, fontSize: fz * 0.7 }} itemSx={{ color: '#333', lineHeight: 1.5 }} /></S>}
          {(editMode||data.timeline.length>0)&&<S label="Timeline"><Timeline items={data.timeline} update={update} editMode={editMode} accent={accent} fz={fz} cardSx={{ borderBottom: `0.5px solid ${accent}15`, paddingBottom: 7 }} phaseSx={{ color: '#111' }} descSx={{ color: '#888', fontSize: fz * 0.78 + 'px' }} durationSx={{ color: accent, fontStyle: 'italic' }} /></S>}
          {(editMode||data.budget)&&<S label="Budget"><EditableField value={data.budget} onChange={v=>update('budget',v)} editMode={editMode} style={{ fontSize: fz * 1.05, fontWeight: 600, color: accent, display: 'block' }} />{(editMode||data.validity)&&<EditableField value={data.validity} onChange={v=>update('validity',v)} editMode={editMode} style={{ fontSize: fz * 0.8, color: '#888', fontStyle: 'italic', display: 'block', marginTop: 3 }} />}</S>}
          {(editMode||data.contactName)&&<S label="Contact"><EditableField value={data.contactName}  onChange={v=>update('contactName', v)}  editMode={editMode} style={{ fontWeight: 600, color: accent, display: 'block' }} /><EditableField value={data.contactEmail} onChange={v=>update('contactEmail',v)} editMode={editMode} style={{ fontSize: fz * 0.82, color: '#888', display: 'block', marginTop: 2 }} /></S>}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   9. CORPORATE — structured, colored accent bar
══════════════════════════════════════════════════ */
function CorporateProposal({ data, update, accent, fz, editMode }) {
  const S = ({ label, children }) => (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', alignItems: 'stretch', gap: 0, marginBottom: 10 }}>
        <div style={{ width: 4, background: accent, borderRadius: '2px 0 0 2px' }} />
        <div style={{ background: `${accent}10`, padding: '5px 12px', flex: 1 }}>
          <span style={{ fontSize: fz * 0.72, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: accent }}>{label}</span>
        </div>
      </div>
      {children}
    </div>
  );
  return (
    <div style={{ fontFamily: "'Roboto','Helvetica Neue',sans-serif", fontSize: fz, background: '#fff', padding: '0 0 28px', minHeight: 700 }}>
      <div style={{ background: accent, padding: '20px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <EditableField value={data.title}    onChange={v=>update('title',    v)} editMode={editMode} style={{ fontSize: fz * 1.7, fontWeight: 700, color: '#fff', display: 'block' }} inputStyle={{ color: '#fff', background: 'rgba(255,255,255,0.15)', border: '1px dashed rgba(255,255,255,0.4)' }} />
          <EditableField value={data.subtitle} onChange={v=>update('subtitle', v)} editMode={editMode} style={{ fontSize: fz * 0.82, color: 'rgba(255,255,255,0.82)', fontWeight: 300, letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginTop: 4 }} />
        </div>
        <div style={{ textAlign: 'right', fontSize: fz * 0.78, color: 'rgba(255,255,255,0.78)', display: 'flex', flexDirection: 'column', gap: 3 }}>
          {['preparedBy','preparedFor','date'].map(f=>(data[f]||editMode)&&<span key={f}>{data[f]||'—'}</span>)}
        </div>
      </div>
      <div style={{ padding: '24px 32px' }}>
        {[['Executive Summary','executiveSummary'],['Problem Statement','problemStatement'],['Proposed Solution','proposedSolution']].map(([label,field])=>
          (editMode||data[field])&&<S key={field} label={label}><EditableField value={data[field]} onChange={v=>update(field,v)} editMode={editMode} multiline style={{ fontSize: fz * 0.88, color: '#333', lineHeight: 1.65 }} /></S>
        )}
        {(editMode||data.deliverables.length>0)&&<S label="Deliverables"><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px' }}><Deliverables items={data.deliverables} update={update} editMode={editMode} accent={accent} fz={fz} bulletSx={{ color: accent, fontSize: 7 }} itemSx={{ color: '#333' }} /></div></S>}
        {(editMode||data.timeline.length>0)&&<S label="Project Timeline"><Timeline items={data.timeline} update={update} editMode={editMode} accent={accent} fz={fz} cardSx={{ background: '#f8fafc', borderLeft: `3px solid ${accent}`, borderRadius: '0 4px 4px 0', padding: '7px 12px' }} phaseSx={{ color: '#111' }} descSx={{ color: '#64748b' }} durationSx={{ background: accent, color: '#fff', borderRadius: 3, padding: '1px 8px', fontSize: fz * 0.75, fontWeight: 700 }} /></S>}
        {(editMode||data.budget)&&<S label="Budget">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ background: `${accent}08`, border: `1px solid ${accent}25`, borderRadius: 6, padding: '12px 16px' }}><div style={{ fontSize: fz * 0.68, textTransform: 'uppercase', letterSpacing: '1px', color: accent, marginBottom: 4 }}>Total Budget</div><EditableField value={data.budget} onChange={v=>update('budget',v)} editMode={editMode} style={{ fontSize: fz * 1.1, fontWeight: 700, color: '#111' }} /></div>
            {(editMode||data.validity)&&<div style={{ border: '1px solid #e2e8f0', borderRadius: 6, padding: '12px 16px' }}><div style={{ fontSize: fz * 0.68, textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b', marginBottom: 4 }}>Validity</div><EditableField value={data.validity} onChange={v=>update('validity',v)} editMode={editMode} style={{ fontSize: fz * 0.9, fontWeight: 600, color: '#374151' }} /></div>}
          </div>
        </S>}
        {(editMode||data.closingNote)&&<S label="Closing Note"><EditableField value={data.closingNote} onChange={v=>update('closingNote',v)} editMode={editMode} multiline style={{ fontSize: fz * 0.88, color: '#333', lineHeight: 1.65 }} /></S>}
        {(editMode||data.contactName)&&<div style={{ borderTop: `1px solid ${accent}25`, paddingTop: 12, marginTop: 4 }}><EditableField value={data.contactName}  onChange={v=>update('contactName', v)}  editMode={editMode} style={{ fontWeight: 600, color: accent, display: 'block' }} /><EditableField value={data.contactEmail} onChange={v=>update('contactEmail',v)} editMode={editMode} style={{ fontSize: fz * 0.85, color: '#64748b', display: 'block', marginTop: 2 }} /></div>}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   10. TIMELINE — vertical timeline spine
══════════════════════════════════════════════════ */
function TimelineProposal({ data, update, accent, fz, editMode }) {
  const S = ({ label, children }) => (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: fz * 0.68, fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: accent, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 18, height: 2, background: accent }} />{label}<div style={{ flex: 1, height: '1px', background: `${accent}20` }} />
      </div>
      {children}
    </div>
  );
  return (
    <div style={{ fontFamily: "'Mulish',sans-serif", fontSize: fz, background: '#fff', minHeight: 700, display: 'flex' }}>
      <div style={{ width: '30%', background: '#f8fafc', borderRight: '1px solid #e2e8f0', padding: '28px 18px' }}>
        <EditableField value={data.title}    onChange={v=>update('title',    v)} editMode={editMode} style={{ fontSize: fz * 1.45, fontWeight: 700, color: '#111', lineHeight: 1.2, display: 'block' }} />
        <EditableField value={data.subtitle} onChange={v=>update('subtitle', v)} editMode={editMode} style={{ fontSize: fz * 0.8, color: accent, fontWeight: 600, marginTop: 5, display: 'block', letterSpacing: '0.5px' }} />
        <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[['Prepared by','preparedBy'],['Prepared for','preparedFor'],['Date','date'],['Version','version']].map(([label,field])=>(data[field]||editMode)&&(
            <div key={field}><div style={{ fontSize: fz * 0.64, textTransform: 'uppercase', letterSpacing: '1px', color: '#94a3b8', marginBottom: 2 }}>{label}</div><EditableField value={data[field]||''} onChange={v=>update(field,v)} editMode={editMode} style={{ fontSize: fz * 0.82, color: '#374151', fontWeight: 600 }} /></div>
          ))}
        </div>
        {(editMode||data.budget)&&<div style={{ marginTop: 24, background: `${accent}12`, border: `1px solid ${accent}30`, borderRadius: 10, padding: '14px' }}>
          <div style={{ fontSize: fz * 0.65, textTransform: 'uppercase', letterSpacing: '1px', color: accent, marginBottom: 5 }}>Total Budget</div>
          <EditableField value={data.budget} onChange={v=>update('budget',v)} editMode={editMode} style={{ fontSize: fz * 1.15, fontWeight: 700, color: accent, display: 'block' }} />
          {(editMode||data.validity)&&<EditableField value={data.validity} onChange={v=>update('validity',v)} editMode={editMode} style={{ fontSize: fz * 0.78, color: '#64748b', display: 'block', marginTop: 4 }} />}
        </div>}
        {(editMode||data.contactName)&&<div style={{ marginTop: 20, borderTop: '1px solid #e2e8f0', paddingTop: 14 }}><EditableField value={data.contactName}  onChange={v=>update('contactName', v)}  editMode={editMode} style={{ fontWeight: 700, color: accent, display: 'block' }} /><EditableField value={data.contactEmail} onChange={v=>update('contactEmail',v)} editMode={editMode} style={{ fontSize: fz * 0.8, color: '#64748b', display: 'block', marginTop: 2 }} /></div>}
      </div>
      <div style={{ flex: 1, padding: '28px 24px' }}>
        {[['Executive Summary','executiveSummary'],['Problem','problemStatement'],['Solution','proposedSolution']].map(([label,field])=>
          (editMode||data[field])&&<S key={field} label={label}><EditableField value={data[field]} onChange={v=>update(field,v)} editMode={editMode} multiline style={{ fontSize: fz * 0.88, color: '#444', lineHeight: 1.65 }} /></S>
        )}
        {(editMode||data.deliverables.length>0)&&<S label="Deliverables"><Deliverables items={data.deliverables} update={update} editMode={editMode} accent={accent} fz={fz} bulletSx={{ color: accent, fontWeight: 700 }} itemSx={{ color: '#444' }} /></S>}
        {(editMode||data.timeline.length>0)&&<S label="Project Timeline">
          <div style={{ position: 'relative', paddingLeft: 20 }}>
            <div style={{ position: 'absolute', left: 7, top: 0, bottom: 0, width: '1.5px', background: `${accent}30` }} />
            {data.timeline.map((t, i) => (
              <div key={i} style={{ position: 'relative', marginBottom: 16 }}>
                <div style={{ position: 'absolute', left: -20, top: 4, width: 12, height: 12, borderRadius: '50%', background: '#fff', border: `2.5px solid ${accent}`, boxSizing: 'border-box' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <EditableField value={t.phase} onChange={v=>{ const arr=[...data.timeline]; arr[i]={...arr[i],phase:v}; update('timeline',arr); }} editMode={editMode} style={{ fontWeight: 700, fontSize: fz * 0.88, color: '#111' }} />
                  <EditableField value={t.duration} onChange={v=>{ const arr=[...data.timeline]; arr[i]={...arr[i],duration:v}; update('timeline',arr); }} editMode={editMode} style={{ fontSize: fz * 0.76, color: '#94a3b8', background: `${accent}10`, padding: '1px 6px', borderRadius: 4 }} />
                </div>
                <EditableField value={t.desc} onChange={v=>{ const arr=[...data.timeline]; arr[i]={...arr[i],desc:v}; update('timeline',arr); }} editMode={editMode} style={{ fontSize: fz * 0.82, color: '#64748b', display: 'block', marginTop: 2 }} />
              </div>
            ))}
          </div>
        </S>}
        {(editMode||data.closingNote)&&<S label="Closing"><EditableField value={data.closingNote} onChange={v=>update('closingNote',v)} editMode={editMode} multiline style={{ fontSize: fz * 0.88, color: '#444', lineHeight: 1.65 }} /></S>}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   11. INFOGRAPHIC — visual cards layout
══════════════════════════════════════════════════ */
function InfographicProposal({ data, update, accent, fz, editMode }) {
  const S = ({ label, icon, children }) => (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 9 }}>
        <span style={{ fontSize: 14 }}>{icon}</span>
        <span style={{ fontSize: fz * 0.7, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: accent }}>{label}</span>
        <div style={{ flex: 1, height: '1px', background: `${accent}20` }} />
      </div>
      {children}
    </div>
  );
  return (
    <div style={{ fontFamily: "'Poppins',sans-serif", fontSize: fz, background: '#fff', minHeight: 700 }}>
      <div style={{ background: accent, padding: '24px 32px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -30, top: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', pointerEvents: 'none' }} />
        <EditableField value={data.title}    onChange={v=>update('title',    v)} editMode={editMode} style={{ fontSize: fz * 1.8, fontWeight: 700, color: '#fff', display: 'block' }} inputStyle={{ color: '#fff', background: 'rgba(255,255,255,0.15)', border: '1px dashed rgba(255,255,255,0.4)' }} />
        <EditableField value={data.subtitle} onChange={v=>update('subtitle', v)} editMode={editMode} style={{ fontSize: fz * 0.82, color: 'rgba(255,255,255,0.8)', fontWeight: 400, marginTop: 5, display: 'block' }} />
        <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
          {[['👤','preparedBy'],['🏢','preparedFor'],['📅','date']].map(([icon,f])=>(data[f]||editMode)&&(
            <div key={f} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6, fontSize: fz * 0.78, color: '#fff' }}>
              <span>{icon}</span><EditableField value={data[f]||''} onChange={v=>update(f,v)} editMode={editMode} style={{ color: '#fff' }} inputStyle={{ color: '#fff', background: 'transparent', border: 'none' }} />
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: '22px 32px' }}>
        {[['📊','Executive Summary','executiveSummary'],['❓','Problem','problemStatement'],['💡','Solution','proposedSolution']].map(([icon,label,field])=>
          (editMode||data[field])&&<S key={field} label={label} icon={icon}><EditableField value={data[field]} onChange={v=>update(field,v)} editMode={editMode} multiline style={{ fontSize: fz * 0.88, color: '#444', lineHeight: 1.7 }} /></S>
        )}
        {(editMode||data.deliverables.length>0)&&<S label="Deliverables" icon="✅"><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px 16px' }}><Deliverables items={data.deliverables} update={update} editMode={editMode} accent={accent} fz={fz} bulletSx={{ color: '#16a34a', fontWeight: 700 }} itemSx={{ color: '#374151' }} /></div></S>}
        {(editMode||data.timeline.length>0)&&<S label="Timeline" icon="📅"><div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{data.timeline.map((t,i)=>(
          <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', background: '#f8fafc', borderRadius: 8, padding: '8px 12px' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: fz * 0.75, fontWeight: 700, flexShrink: 0 }}>{i+1}</div>
            <div style={{ flex: 1 }}>
              <EditableField value={t.phase} onChange={v=>{ const arr=[...data.timeline]; arr[i]={...arr[i],phase:v}; update('timeline',arr); }} editMode={editMode} style={{ fontWeight: 600, fontSize: fz * 0.85, color: '#111', display: 'block' }} />
              <EditableField value={t.desc} onChange={v=>{ const arr=[...data.timeline]; arr[i]={...arr[i],desc:v}; update('timeline',arr); }} editMode={editMode} style={{ fontSize: fz * 0.78, color: '#64748b', display: 'block' }} />
            </div>
            <EditableField value={t.duration} onChange={v=>{ const arr=[...data.timeline]; arr[i]={...arr[i],duration:v}; update('timeline',arr); }} editMode={editMode} style={{ fontSize: fz * 0.76, fontWeight: 700, color: accent, whiteSpace: 'nowrap', background: `${accent}15`, padding: '2px 8px', borderRadius: 20 }} />
          </div>
        ))}</div></S>}
        {(editMode||data.budget)&&<div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, background: `${accent}12`, border: `2px solid ${accent}30`, borderRadius: 12, padding: '16px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 20 }}>💰</div>
            <div style={{ fontSize: fz * 0.68, color: accent, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', margin: '4px 0' }}>Total Budget</div>
            <EditableField value={data.budget} onChange={v=>update('budget',v)} editMode={editMode} style={{ fontSize: fz * 1.2, fontWeight: 700, color: accent }} />
          </div>
          {(editMode||data.validity)&&<div style={{ flex: 1, border: '1.5px solid #e2e8f0', borderRadius: 12, padding: '16px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 20 }}>📋</div>
            <div style={{ fontSize: fz * 0.68, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', margin: '4px 0' }}>Valid For</div>
            <EditableField value={data.validity} onChange={v=>update('validity',v)} editMode={editMode} style={{ fontSize: fz * 0.92, fontWeight: 600, color: '#374151' }} />
          </div>}
        </div>}
        {(editMode||data.closingNote)&&<S label="Closing" icon="✍️"><EditableField value={data.closingNote} onChange={v=>update('closingNote',v)} editMode={editMode} multiline style={{ fontSize: fz * 0.88, color: '#444', lineHeight: 1.7, fontStyle: 'italic' }} /></S>}
        {(editMode||data.contactName)&&<div style={{ background: `${accent}08`, border: `1.5px solid ${accent}20`, borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: fz * 1.1, flexShrink: 0 }}>{data.contactName ? data.contactName[0].toUpperCase() : '?'}</div>
          <div><EditableField value={data.contactName}  onChange={v=>update('contactName', v)}  editMode={editMode} style={{ fontWeight: 700, color: accent, display: 'block' }} /><EditableField value={data.contactEmail} onChange={v=>update('contactEmail',v)} editMode={editMode} style={{ fontSize: fz * 0.82, color: '#64748b', display: 'block', marginTop: 1 }} /></div>
        </div>}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   12. NORDIC — ultra-minimal
══════════════════════════════════════════════════ */
function NordicProposal({ data, update, accent, fz, editMode }) {
  const S = ({ label, children }) => (
    <div style={{ marginBottom: 30 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{ width: 16, height: 2, background: accent }} />
        <span style={{ fontSize: fz * 0.65, fontWeight: 700, letterSpacing: '4px', textTransform: 'uppercase', color: '#999' }}>{label}</span>
      </div>
      {children}
    </div>
  );
  return (
    <div style={{ fontFamily: "'Inter','Helvetica Neue',sans-serif", fontSize: fz, background: '#fff', padding: '52px 56px', minHeight: 700, color: '#111' }}>
      <div style={{ marginBottom: 44 }}>
        <EditableField value={data.title}    onChange={v=>update('title',    v)} editMode={editMode} style={{ fontSize: fz * 2.8, fontWeight: 200, color: '#111', letterSpacing: '-2px', lineHeight: 1, display: 'block' }} />
        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 32, height: 1.5, background: accent }} />
          <EditableField value={data.subtitle} onChange={v=>update('subtitle',v)} editMode={editMode} style={{ fontSize: fz * 0.8, color: '#777', letterSpacing: '2px', textTransform: 'uppercase' }} />
        </div>
        <div style={{ marginTop: 14, display: 'flex', gap: 20, fontSize: fz * 0.74, color: '#aaa' }}>
          {['preparedBy','preparedFor','date'].map(f=>(data[f]||editMode)&&<EditableField key={f} value={data[f]||''} onChange={v=>update(f,v)} editMode={editMode} style={{ color: '#aaa', fontSize: fz * 0.74 }} />)}
        </div>
      </div>
      {[['Summary','executiveSummary'],['Problem','problemStatement'],['Solution','proposedSolution']].map(([label,field])=>
        (editMode||data[field])&&<S key={field} label={label}><EditableField value={data[field]} onChange={v=>update(field,v)} editMode={editMode} multiline style={{ fontSize: fz * 0.9, color: '#444', lineHeight: 1.9, fontWeight: 300, maxWidth: '80%' }} /></S>
      )}
      {(editMode||data.deliverables.length>0)&&<S label="Deliverables"><Deliverables items={data.deliverables} update={update} editMode={editMode} accent={accent} fz={fz} bulletSx={{ color: '#ddd', fontSize: fz * 0.7 }} itemSx={{ color: '#555', fontWeight: 300 }} /></S>}
      {(editMode||data.timeline.length>0)&&<S label="Timeline"><Timeline items={data.timeline} update={update} editMode={editMode} accent={accent} fz={fz} cardSx={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 16, borderBottom: '1px solid #f1f5f9', paddingBottom: 12 }} phaseSx={{ color: '#111', fontWeight: 500, gridColumn: 2 }} descSx={{ color: '#aaa', fontWeight: 300, gridColumn: 2 }} durationSx={{ color: accent, fontWeight: 300, fontSize: fz * 0.76, gridRow: '1 / 3' }} /></S>}
      {(editMode||data.budget)&&<S label="Budget"><EditableField value={data.budget} onChange={v=>update('budget',v)} editMode={editMode} style={{ fontSize: fz * 1.6, fontWeight: 200, color: accent, letterSpacing: '-0.5px', display: 'block' }} />{(editMode||data.validity)&&<EditableField value={data.validity} onChange={v=>update('validity',v)} editMode={editMode} style={{ fontSize: fz * 0.78, color: '#aaa', fontWeight: 300, display: 'block', marginTop: 4 }} />}</S>}
      {(editMode||data.closingNote)&&<S label="Closing"><EditableField value={data.closingNote} onChange={v=>update('closingNote',v)} editMode={editMode} multiline style={{ fontSize: fz * 0.9, color: '#555', lineHeight: 1.85, fontWeight: 300 }} /></S>}
      {(editMode||data.contactName)&&<div style={{ borderTop: '0.5px solid #f1f5f9', paddingTop: 16, marginTop: 8 }}><EditableField value={data.contactName}  onChange={v=>update('contactName', v)}  editMode={editMode} style={{ fontWeight: 400, color: '#111', display: 'block' }} /><EditableField value={data.contactEmail} onChange={v=>update('contactEmail',v)} editMode={editMode} style={{ fontSize: fz * 0.8, color: '#aaa', display: 'block', marginTop: 2 }} /></div>}
    </div>
  );
}

/* ══════════════════════════════════════════════════
   13. ELEGANT — centered, ornamental rules
══════════════════════════════════════════════════ */
function ElegantProposal({ data, update, accent, fz, editMode }) {
  const S = ({ label, children }) => (
    <div style={{ marginBottom: 24 }}>
      <div style={{ textAlign: 'center', position: 'relative', marginBottom: 14 }}>
        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '0.5px', background: `${accent}30` }} />
        <span style={{ position: 'relative', background: '#fff', padding: '0 16px', fontSize: fz * 0.68, fontWeight: 700, letterSpacing: '4px', textTransform: 'uppercase', color: accent }}>{label}</span>
      </div>
      {children}
    </div>
  );
  return (
    <div style={{ fontFamily: "'Libre Baskerville',Georgia,serif", fontSize: fz, background: '#fff', padding: '44px 52px', minHeight: 700, color: '#1a1a1a' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <EditableField value={data.title}    onChange={v=>update('title',    v)} editMode={editMode} style={{ fontSize: fz * 2.2, fontWeight: 700, color: '#1a1a1a', letterSpacing: '3px', textTransform: 'uppercase', display: 'block' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, margin: '10px 0 8px' }}>
          <div style={{ height: '0.5px', flex: 1, background: accent, opacity: 0.4 }} /><div style={{ width: 5, height: 5, borderRadius: '50%', background: accent }} /><div style={{ height: '0.5px', flex: 1, background: accent, opacity: 0.4 }} />
        </div>
        <EditableField value={data.subtitle} onChange={v=>update('subtitle',v)} editMode={editMode} style={{ fontSize: fz * 0.88, color: '#666', fontStyle: 'italic', display: 'block' }} />
        <div style={{ marginTop: 10, fontSize: fz * 0.76, color: '#888', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0 14px' }}>
          {['preparedBy','preparedFor','date'].map(f=>(data[f]||editMode)&&<EditableField key={f} value={data[f]||''} onChange={v=>update(f,v)} editMode={editMode} style={{ color: '#888' }} />)}
        </div>
      </div>
      {[['Executive Summary','executiveSummary'],['Problem Statement','problemStatement'],['Proposed Solution','proposedSolution']].map(([label,field])=>
        (editMode||data[field])&&<S key={field} label={label}><EditableField value={data[field]} onChange={v=>update(field,v)} editMode={editMode} multiline style={{ fontSize: fz * 0.92, color: '#333', lineHeight: 1.8, textAlign: 'center', fontStyle: 'italic' }} /></S>
      )}
      {(editMode||data.deliverables.length>0)&&<S label="Deliverables"><div style={{ textAlign: 'center' }}><Deliverables items={data.deliverables} update={update} editMode={editMode} accent={accent} fz={fz} bulletSx={{ color: accent, fontSize: 8, opacity: 0.7 }} itemSx={{ color: '#444', display: 'inline' }} /></div></S>}
      {(editMode||data.timeline.length>0)&&<S label="Timeline"><Timeline items={data.timeline} update={update} editMode={editMode} accent={accent} fz={fz} cardSx={{ textAlign: 'center', borderBottom: `0.5px solid ${accent}15`, paddingBottom: 12 }} phaseSx={{ color: '#1a1a1a', fontWeight: 700, letterSpacing: '0.5px' }} descSx={{ color: '#666', fontStyle: 'italic', fontSize: fz * 0.84 + 'px' }} durationSx={{ color: accent, fontStyle: 'italic' }} /></S>}
      {(editMode||data.budget)&&<S label="Investment">
        <div style={{ textAlign: 'center' }}>
          <EditableField value={data.budget} onChange={v=>update('budget',v)} editMode={editMode} style={{ fontSize: fz * 1.6, fontWeight: 700, color: accent, letterSpacing: '-0.5px' }} />
          {(editMode||data.validity)&&<div style={{ fontSize: fz * 0.82, color: '#888', fontStyle: 'italic', marginTop: 5 }}><EditableField value={data.validity} onChange={v=>update('validity',v)} editMode={editMode} style={{ color: '#888' }} /></div>}
        </div>
      </S>}
      {(editMode||data.closingNote)&&<S label="Closing Note"><EditableField value={data.closingNote} onChange={v=>update('closingNote',v)} editMode={editMode} multiline style={{ fontSize: fz * 0.9, color: '#444', lineHeight: 1.8, textAlign: 'center', fontStyle: 'italic' }} /></S>}
      {(editMode||data.contactName)&&<div style={{ textAlign: 'center', borderTop: `0.5px solid ${accent}40`, paddingTop: 16, marginTop: 12 }}><EditableField value={data.contactName}  onChange={v=>update('contactName', v)}  editMode={editMode} style={{ fontWeight: 700, color: accent, display: 'block' }} /><EditableField value={data.contactEmail} onChange={v=>update('contactEmail',v)} editMode={editMode} style={{ fontSize: fz * 0.82, color: '#888', fontStyle: 'italic', display: 'block', marginTop: 3 }} /></div>}
    </div>
  );
}

/* ══════════════════════════════════════════════════
   14. CHICAGO — newspaper two-column
══════════════════════════════════════════════════ */
function ChicagoProposal({ data, update, accent, fz, editMode }) {
  const S = ({ label, children }) => (
    <div style={{ marginBottom: 16 }}>
      <div style={{ borderTop: '3px solid #111', borderBottom: '1px solid #111', padding: '3px 0', marginBottom: 9 }}>
        <span style={{ fontSize: fz * 0.7, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#111' }}>{label}</span>
      </div>
      {children}
    </div>
  );
  return (
    <div style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: fz, background: '#fafaf8', minHeight: 700, border: '2px solid #111' }}>
      <div style={{ borderBottom: '3px solid #111', padding: '18px 28px', textAlign: 'center' }}>
        <EditableField value={data.title}    onChange={v=>update('title',    v)} editMode={editMode} style={{ fontSize: fz * 2.6, fontWeight: 900, color: '#111', lineHeight: 1, letterSpacing: '-1px', display: 'block' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, margin: '6px 0' }}>
          <div style={{ flex: 1, height: '1px', background: '#111' }} /><span style={{ fontSize: 11 }}>◆</span><div style={{ flex: 1, height: '1px', background: '#111' }} />
        </div>
        <EditableField value={data.subtitle} onChange={v=>update('subtitle',v)} editMode={editMode} style={{ fontSize: fz * 0.9, color: '#444', fontStyle: 'italic', display: 'block' }} />
        <div style={{ marginTop: 8, fontSize: fz * 0.72, color: '#666', display: 'flex', justifyContent: 'center', gap: '0 16px', flexWrap: 'wrap' }}>
          {['preparedBy','preparedFor','date'].map(f=>(data[f]||editMode)&&<EditableField key={f} value={data[f]||''} onChange={v=>update(f,v)} editMode={editMode} style={{ color: '#666' }} />)}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1px 1fr', gap: 0 }}>
        <div style={{ padding: '18px 22px' }}>
          {(editMode||data.executiveSummary)&&<S label="Summary"><EditableField value={data.executiveSummary} onChange={v=>update('executiveSummary',v)} editMode={editMode} multiline style={{ fontSize: fz * 0.86, color: '#333', lineHeight: 1.75, fontStyle: 'italic' }} /></S>}
          {(editMode||data.problemStatement)&&<S label="The Problem"><EditableField value={data.problemStatement} onChange={v=>update('problemStatement',v)} editMode={editMode} multiline style={{ fontSize: fz * 0.86, color: '#333', lineHeight: 1.75 }} /></S>}
          {(editMode||data.proposedSolution)&&<S label="The Solution"><EditableField value={data.proposedSolution} onChange={v=>update('proposedSolution',v)} editMode={editMode} multiline style={{ fontSize: fz * 0.86, color: '#333', lineHeight: 1.75 }} /></S>}
          {(editMode||data.closingNote)&&<S label="Conclusion"><EditableField value={data.closingNote} onChange={v=>update('closingNote',v)} editMode={editMode} multiline style={{ fontSize: fz * 0.86, color: '#333', lineHeight: 1.75 }} /></S>}
        </div>
        <div style={{ background: '#111' }} />
        <div style={{ padding: '18px 22px' }}>
          {(editMode||data.deliverables.length>0)&&<S label="Deliverables"><Deliverables items={data.deliverables} update={update} editMode={editMode} accent={accent} fz={fz} bulletSx={{ color: accent, fontSize: 8 }} itemSx={{ color: '#333' }} /></S>}
          {(editMode||data.timeline.length>0)&&<S label="Timeline"><Timeline items={data.timeline} update={update} editMode={editMode} accent={accent} fz={fz} cardSx={{ borderBottom: '0.5px solid #ccc', paddingBottom: 9 }} phaseSx={{ color: '#111', fontStyle: 'italic', fontWeight: 700 }} descSx={{ color: '#555' }} durationSx={{ color: accent, fontWeight: 700 }} /></S>}
          {(editMode||data.budget)&&<S label="Budget">
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <EditableField value={data.budget} onChange={v=>update('budget',v)} editMode={editMode} style={{ fontSize: fz * 1.4, fontWeight: 900, color: '#111', letterSpacing: '-0.5px' }} />
              {(editMode||data.validity)&&<div style={{ fontSize: fz * 0.78, color: '#888', marginTop: 4, fontStyle: 'italic' }}><EditableField value={data.validity} onChange={v=>update('validity',v)} editMode={editMode} style={{ color: '#888' }} /></div>}
            </div>
          </S>}
          {(editMode||data.contactName)&&<S label="Contact"><EditableField value={data.contactName}  onChange={v=>update('contactName', v)}  editMode={editMode} style={{ fontWeight: 700, color: accent, display: 'block' }} /><EditableField value={data.contactEmail} onChange={v=>update('contactEmail',v)} editMode={editMode} style={{ fontSize: fz * 0.84, color: '#666', display: 'block', marginTop: 2 }} /></S>}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   15. SUNSET — warm gradient header
══════════════════════════════════════════════════ */
function SunsetProposal({ data, update, accent, fz, editMode }) {
  const S = ({ label, children }) => (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 9 }}>
        <div style={{ width: 18, height: 2.5, borderRadius: 2, background: `linear-gradient(90deg,${accent},#f97316)` }} />
        <span style={{ fontSize: fz * 0.7, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: accent }}>{label}</span>
      </div>
      {children}
    </div>
  );
  return (
    <div style={{ fontFamily: "'Quicksand','Nunito',sans-serif", fontSize: fz, background: '#fff', minHeight: 700 }}>
      <div style={{ background: `linear-gradient(135deg,${accent} 0%,#f97316 100%)`, padding: '28px 36px', color: '#fff', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -30, bottom: -30, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', pointerEvents: 'none' }} />
        <EditableField value={data.title}    onChange={v=>update('title',    v)} editMode={editMode} style={{ fontSize: fz * 1.9, fontWeight: 700, color: '#fff', lineHeight: 1.15, display: 'block' }} inputStyle={{ color: '#fff', background: 'rgba(255,255,255,0.15)', border: '1px dashed rgba(255,255,255,0.4)' }} />
        <EditableField value={data.subtitle} onChange={v=>update('subtitle', v)} editMode={editMode} style={{ fontSize: fz * 0.82, color: 'rgba(255,255,255,0.85)', fontWeight: 500, marginTop: 6, display: 'block' }} />
        <div style={{ display: 'flex', gap: 16, marginTop: 14, flexWrap: 'wrap' }}>
          {[['preparedBy','👤'],['preparedFor','🏢'],['date','📅']].map(([f,icon])=>(data[f]||editMode)&&(
            <div key={f} style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: '4px 12px', fontSize: fz * 0.76, color: '#fff', display: 'flex', alignItems: 'center', gap: 5 }}>
              <span>{icon}</span><EditableField value={data[f]||''} onChange={v=>update(f,v)} editMode={editMode} style={{ color: '#fff' }} inputStyle={{ color: '#fff', background: 'transparent', border: 'none' }} />
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: '24px 36px' }}>
        {[['Executive Summary','executiveSummary'],['Problem Statement','problemStatement'],['Proposed Solution','proposedSolution']].map(([label,field])=>
          (editMode||data[field])&&<S key={field} label={label}><EditableField value={data[field]} onChange={v=>update(field,v)} editMode={editMode} multiline style={{ fontSize: fz * 0.88, color: '#444', lineHeight: 1.7 }} /></S>
        )}
        {(editMode||data.deliverables.length>0)&&<S label="Deliverables"><Deliverables items={data.deliverables} update={update} editMode={editMode} accent={accent} fz={fz} bulletSx={{ color: '#f97316', fontWeight: 700 }} itemSx={{ color: '#444' }} /></S>}
        {(editMode||data.timeline.length>0)&&<S label="Timeline"><Timeline items={data.timeline} update={update} editMode={editMode} accent={accent} fz={fz} cardSx={{ background: 'linear-gradient(135deg,rgba(var(--a),0.06),rgba(249,115,22,0.04))', borderLeft: `3px solid`, borderImageSource: `linear-gradient(180deg,${accent},#f97316)`, borderImageSlice: 1, borderRadius: '0 8px 8px 0', padding: '9px 14px' }} phaseSx={{ color: '#111', fontWeight: 700 }} descSx={{ color: '#666' }} durationSx={{ color: '#f97316', fontWeight: 600 }} /></S>}
        {(editMode||data.budget)&&<S label="Budget">
          <div style={{ background: `linear-gradient(135deg,${accent}12,#f9731612)`, border: `1.5px solid ${accent}30`, borderRadius: 12, padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div><div style={{ fontSize: fz * 0.7, color: accent, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>Total Budget</div><EditableField value={data.budget} onChange={v=>update('budget',v)} editMode={editMode} style={{ fontSize: fz * 1.3, fontWeight: 700, color: accent }} /></div>
            {(editMode||data.validity)&&<div style={{ textAlign: 'right' }}><div style={{ fontSize: fz * 0.7, color: '#888', marginBottom: 4 }}>Valid for</div><EditableField value={data.validity} onChange={v=>update('validity',v)} editMode={editMode} style={{ fontSize: fz * 0.88, color: '#f97316', fontWeight: 600 }} /></div>}
          </div>
        </S>}
        {(editMode||data.closingNote)&&<S label="Closing"><EditableField value={data.closingNote} onChange={v=>update('closingNote',v)} editMode={editMode} multiline style={{ fontSize: fz * 0.88, color: '#444', lineHeight: 1.7 }} /></S>}
        {(editMode||data.contactName)&&<div style={{ marginTop: 8, background: `linear-gradient(135deg,${accent}10,#f9731610)`, border: `1.5px solid ${accent}25`, borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: `linear-gradient(135deg,${accent},#f97316)`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: fz * 1.1, flexShrink: 0 }}>{data.contactName ? data.contactName[0].toUpperCase() : '?'}</div>
          <div><EditableField value={data.contactName}  onChange={v=>update('contactName', v)}  editMode={editMode} style={{ fontWeight: 700, color: accent, display: 'block' }} /><EditableField value={data.contactEmail} onChange={v=>update('contactEmail',v)} editMode={editMode} style={{ fontSize: fz * 0.82, color: '#666', display: 'block', marginTop: 1 }} /></div>
        </div>}
      </div>
    </div>
  );
}

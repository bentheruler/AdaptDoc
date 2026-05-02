// client/src/components/document/CoverLetterPreview.jsx
import EditableField from '../common/EditableField';

/* ─── Google Fonts loader ─── */
const loadedFonts = new Set();
const loadFont = (url) => {
  if (loadedFonts.has(url)) return;
  loadedFonts.add(url);
  const link = document.createElement('link');
  link.rel = 'stylesheet'; link.href = url;
  document.head.appendChild(link);
};

/* ══════════════════════════════════════════════════
   NORMALISE
══════════════════════════════════════════════════ */
const norm = (data = {}) => ({
  senderName:      data.senderName      || '',
  senderTitle:     data.senderTitle     || '',
  senderLocation:  data.senderLocation  || '',
  senderEmail:     data.senderEmail     || '',
  date:            data.date            || '',
  recipientName:   data.recipientName   || '',
  recipientTitle:  data.recipientTitle  || '',
  companyName:     data.companyName     || '',
  companyLocation: data.companyLocation || '',
  subject:         data.subject         || '',
  opening:         data.opening         || '',
  body1:           data.body1           || '',
  body2:           data.body2           || '',
  body3:           data.body3           || '',
  closing:         data.closing         || '',
  signoff:         data.signoff         || 'Sincerely,',
  signature:       data.signature       || '',
});

/* ══════════════════════════════════════════════════
   DISPATCHER
══════════════════════════════════════════════════ */
const CoverLetterPreview = ({ data, onDataChange, theme, fontSize, fontFamily = 'Inter', spacing = 'normal', accentColor, editMode }) => {
  const nd     = norm(data);
  const accent = accentColor || '#1e3a5f';
  const fz     = parseInt(fontSize) || 12;
  const update = (f, v) => onDataChange({ ...data, [f]: v });
  const props  = { data: nd, update, accent, fz, editMode };

  const map = {
    Classic:     ClassicCL,    Minimal:     MinimalCL,    Bold:        BoldCL,
    Executive:   ExecutiveCL,  Tech:        TechCL,       Creative:    CreativeCL,
    Academic:    AcademicCL,   Corporate:   CorporateCL,  Timeline:    TimelineCL,
    Infographic: InfographicCL,Nordic:      NordicCL,     Elegant:     ElegantCL,
    Chicago:     ChicagoCL,    Sunset:      SunsetCL,
  };
  const Comp = map[theme] || ModernCL;

  const lineHeight = spacing === 'compact' ? 1.3 : spacing === 'relaxed' ? 1.8 : 1.5;

  if (fontFamily) {
    const url = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s+/g, '+')}:wght@300;400;500;600;700&display=swap`;
    loadFont(url);
  }

  return (
    <div style={{ fontFamily: `"${fontFamily}", sans-serif`, lineHeight, display: "flex", flexDirection: "column", flex: 1, minHeight: "100%" }}>
      <Comp {...props} />
    </div>
  );
};

export default CoverLetterPreview;

/* ══════════════════════════════════════════════════
   SHARED HELPERS
══════════════════════════════════════════════════ */

/* Recipient block */
const Recipient = ({ data, update, editMode, fz, sx = {} }) => (
  <div style={{ marginBottom: 20, ...sx }}>
    {(editMode || data.date) && <EditableField value={data.date} onChange={v => update('date', v)} editMode={editMode} style={{ fontSize: fz * 0.85, color: '#888', display: 'block', marginBottom: 12 }} />}
    {(editMode || data.recipientName)  && <EditableField value={data.recipientName}   onChange={v => update('recipientName',   v)} editMode={editMode} style={{ fontWeight: 600, display: 'block' }} />}
    {(editMode || data.recipientTitle) && <EditableField value={data.recipientTitle}  onChange={v => update('recipientTitle',  v)} editMode={editMode} style={{ fontSize: fz * 0.88, color: '#555', display: 'block' }} />}
    {(editMode || data.companyName)    && <EditableField value={data.companyName}     onChange={v => update('companyName',     v)} editMode={editMode} style={{ fontSize: fz * 0.88, color: '#555', display: 'block' }} />}
    {(editMode || data.companyLocation)&& <EditableField value={data.companyLocation} onChange={v => update('companyLocation', v)} editMode={editMode} style={{ fontSize: fz * 0.88, color: '#555', display: 'block' }} />}
  </div>
);

/* Body paragraphs */
const Body = ({ data, update, editMode, fz, paraStyle = {} }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    {(editMode || data.opening) && <EditableField value={data.opening} onChange={v => update('opening', v)} editMode={editMode} style={{ fontSize: fz * 0.92, fontWeight: 500, ...paraStyle }} />}
    {['body1','body2','body3','closing'].map(f => (editMode || data[f]) && (
      <EditableField key={f} value={data[f]} onChange={v => update(f, v)} editMode={editMode} multiline style={{ fontSize: fz * 0.92, lineHeight: 1.75, ...paraStyle }} />
    ))}
  </div>
);

/* Sign-off block */
const Signoff = ({ data, update, editMode, fz, accent, lineColor }) => (
  <div style={{ marginTop: 26 }}>
    {(editMode || data.signoff) && <EditableField value={data.signoff} onChange={v => update('signoff', v)} editMode={editMode} style={{ fontSize: fz * 0.92, color: '#555', display: 'block', marginBottom: 18 }} />}
    <div style={{ borderTop: `1px solid ${lineColor || accent + '40'}`, paddingTop: 8, display: 'inline-block', minWidth: 140 }}>
      <EditableField value={data.signature} onChange={v => update('signature', v)} editMode={editMode} style={{ fontSize: fz * 1.05, fontWeight: 700, color: accent }} />
    </div>
  </div>
);

/* Subject line */
const SubjectLine = ({ data, update, editMode, fz, accent, style = {} }) => (
  (editMode || data.subject) && (
    <div style={{ marginBottom: 18, padding: '7px 14px', background: `${accent}10`, borderLeft: `3px solid ${accent}`, borderRadius: '0 6px 6px 0', ...style }}>
      <span style={{ fontSize: fz * 0.76, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: accent }}>Re: </span>
      <EditableField value={data.subject} onChange={v => update('subject', v)} editMode={editMode} style={{ fontSize: fz * 0.9, fontWeight: 600, color: '#1a1a1a' }} />
    </div>
  )
);

/* ══════════════════════════════════════════════════
   1. MODERN
══════════════════════════════════════════════════ */
function ModernCL({ data, update, accent, fz, editMode }) {
  return (
    <div style={{  fontSize: fz, background: '#fff', padding: '44px 52px', minHeight: 620, color: '#1a1a1a', lineHeight: 1.7 }}>
      <div style={{ marginBottom: 28, borderBottom: `2px solid ${accent}`, paddingBottom: 16 }}>
        <EditableField value={data.senderName}  onChange={v => update('senderName',  v)} editMode={editMode} style={{ fontSize: fz * 1.6, fontWeight: 700, color: accent, display: 'block', letterSpacing: '-0.3px' }} />
        <EditableField value={data.senderTitle} onChange={v => update('senderTitle', v)} editMode={editMode} style={{ fontSize: fz * 0.88, color: '#666', display: 'block', marginTop: 3 }} />
        <div style={{ marginTop: 6, fontSize: fz * 0.82, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {(editMode || data.senderLocation) && <EditableField value={data.senderLocation} onChange={v => update('senderLocation', v)} editMode={editMode} style={{ color: '#888' }} />}
          {(editMode || data.senderEmail)    && <EditableField value={data.senderEmail}    onChange={v => update('senderEmail',    v)} editMode={editMode} style={{ color: '#888' }} />}
        </div>
      </div>
      <Recipient data={data} update={update} editMode={editMode} fz={fz} />
      <SubjectLine data={data} update={update} editMode={editMode} fz={fz} accent={accent} />
      <Body data={data} update={update} editMode={editMode} fz={fz} paraStyle={{ color: '#333' }} />
      <Signoff data={data} update={update} editMode={editMode} fz={fz} accent={accent} />
    </div>
  );
}

/* ══════════════════════════════════════════════════
   2. CLASSIC
══════════════════════════════════════════════════ */
function ClassicCL({ data, update, accent, fz, editMode }) {
  return (
    <div style={{  fontSize: fz, background: '#fffef9', padding: '44px 52px', minHeight: 620, color: '#1a1a1a', lineHeight: 1.75 }}>
      <div style={{ textAlign: 'center', borderBottom: `1.5px solid ${accent}`, paddingBottom: 16, marginBottom: 24 }}>
        <EditableField value={data.senderName}  onChange={v => update('senderName',  v)} editMode={editMode} style={{ fontSize: fz * 2, fontWeight: 400, color: '#1a1a1a', display: 'block', letterSpacing: '2px', fontVariant: 'small-caps' }} />
        <EditableField value={data.senderTitle} onChange={v => update('senderTitle', v)} editMode={editMode} style={{ fontSize: fz * 0.9, color: '#666', fontStyle: 'italic', display: 'block', marginTop: 4 }} />
        <div style={{ marginTop: 8, fontSize: fz * 0.8, color: '#888', display: 'flex', justifyContent: 'center', gap: '0 16px', flexWrap: 'wrap' }}>
          {(editMode || data.senderLocation) && <EditableField value={data.senderLocation} onChange={v => update('senderLocation', v)} editMode={editMode} style={{ color: '#888' }} />}
          {(editMode || data.senderEmail)    && <EditableField value={data.senderEmail}    onChange={v => update('senderEmail',    v)} editMode={editMode} style={{ color: '#888' }} />}
        </div>
      </div>
      <Recipient data={data} update={update} editMode={editMode} fz={fz} />
      <SubjectLine data={data} update={update} editMode={editMode} fz={fz} accent={accent} />
      <Body data={data} update={update} editMode={editMode} fz={fz} paraStyle={{ color: '#333', fontStyle: 'italic' }} />
      <Signoff data={data} update={update} editMode={editMode} fz={fz} accent={accent} />
    </div>
  );
}

/* ══════════════════════════════════════════════════
   3. MINIMAL
══════════════════════════════════════════════════ */
function MinimalCL({ data, update, accent, fz, editMode }) {
  return (
    <div style={{  fontSize: fz, background: '#fafafa', padding: '52px 56px', minHeight: 620, color: '#111', lineHeight: 1.8 }}>
      <div style={{ marginBottom: 40 }}>
        <EditableField value={data.senderName}  onChange={v => update('senderName',  v)} editMode={editMode} style={{ fontSize: fz * 2.2, fontWeight: 200, color: '#111', letterSpacing: '-1.5px', display: 'block', lineHeight: 1 }} />
        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 28, height: 1.5, background: accent }} />
          <EditableField value={data.senderTitle} onChange={v => update('senderTitle', v)} editMode={editMode} style={{ fontSize: fz * 0.8, color: '#777', letterSpacing: '2px', textTransform: 'uppercase' }} />
        </div>
        <div style={{ marginTop: 10, fontSize: fz * 0.76, color: '#aaa', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {(editMode || data.senderLocation) && <EditableField value={data.senderLocation} onChange={v => update('senderLocation', v)} editMode={editMode} style={{ color: '#aaa' }} />}
          {(editMode || data.senderEmail)    && <EditableField value={data.senderEmail}    onChange={v => update('senderEmail',    v)} editMode={editMode} style={{ color: '#aaa' }} />}
        </div>
      </div>
      <Recipient data={data} update={update} editMode={editMode} fz={fz} />
      {(editMode || data.subject) && <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 16, height: 1.5, background: accent }} />
        <EditableField value={data.subject} onChange={v => update('subject', v)} editMode={editMode} style={{ fontSize: fz * 0.82, color: accent, fontWeight: 500, letterSpacing: '0.5px' }} />
      </div>}
      <Body data={data} update={update} editMode={editMode} fz={fz} paraStyle={{ color: '#444', fontWeight: 300 }} />
      <Signoff data={data} update={update} editMode={editMode} fz={fz} accent={accent} lineColor="#e5e7eb" />
    </div>
  );
}

/* ══════════════════════════════════════════════════
   4. BOLD
══════════════════════════════════════════════════ */
function BoldCL({ data, update, accent, fz, editMode }) {
  const dark = '#0f172a';
  return (
    <div style={{  fontSize: fz, background: '#fff', minHeight: 620, lineHeight: 1.65 }}>
      <div style={{ background: dark, padding: '26px 36px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: accent }} />
        <EditableField value={data.senderName}  onChange={v => update('senderName',  v)} editMode={editMode} style={{ fontSize: fz * 2, fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '-0.5px', lineHeight: 1, display: 'block', }} inputStyle={{ color: '#fff', background: 'rgba(255,255,255,0.1)', border: '1px dashed rgba(255,255,255,0.4)' }} />
        <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 22, height: 3, background: accent, borderRadius: 2 }} />
          <EditableField value={data.senderTitle} onChange={v => update('senderTitle', v)} editMode={editMode} style={{ fontSize: fz * 0.86, color: accent, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase' }} inputStyle={{ color: accent }} />
        </div>
        <div style={{ marginTop: 10, display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: fz * 0.78, color: 'rgba(255,255,255,0.6)' }}>
          {(editMode || data.senderLocation) && <span>{data.senderLocation}</span>}
          {(editMode || data.senderEmail)    && <span>{data.senderEmail}</span>}
        </div>
      </div>
      <div style={{ padding: '24px 36px' }}>
        <Recipient data={data} update={update} editMode={editMode} fz={fz} />
        <SubjectLine data={data} update={update} editMode={editMode} fz={fz} accent={accent} />
        <Body data={data} update={update} editMode={editMode} fz={fz} paraStyle={{ color: '#374151' }} />
        <Signoff data={data} update={update} editMode={editMode} fz={fz} accent={accent} />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   5. EXECUTIVE
══════════════════════════════════════════════════ */
function ExecutiveCL({ data, update, accent, fz, editMode }) {
  const gold = accent;
  return (
    <div style={{  fontSize: fz, background: '#fdfcf8', padding: '48px 52px', minHeight: 620, color: '#1a1510', lineHeight: 1.8 }}>
      <div style={{ marginBottom: 32 }}>
        <EditableField value={data.senderName} onChange={v => update('senderName', v)} editMode={editMode} style={{ fontSize: fz * 2.4, fontWeight: 300, color: '#1a1510', letterSpacing: '4px', textTransform: 'uppercase', display: 'block' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 12, margin: '10px 0' }}>
          <div style={{ height: '0.5px', width: 50, background: gold, opacity: 0.6 }} />
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: gold }} />
          <div style={{ height: '0.5px', width: 50, background: gold, opacity: 0.6 }} />
        </div>
        <EditableField value={data.senderTitle} onChange={v => update('senderTitle', v)} editMode={editMode} style={{ fontSize: fz * 0.88, color: '#6b5a3e', fontWeight: 300, letterSpacing: '2px', textTransform: 'uppercase', display: 'block' }} />
        <div style={{ marginTop: 8, fontSize: fz * 0.78, color: '#9a8b75', display: 'flex', gap: 16 }}>
          {(editMode || data.senderLocation) && <span>{data.senderLocation}</span>}
          {(editMode || data.senderEmail)    && <span>{data.senderEmail}</span>}
        </div>
      </div>
      <Recipient data={data} update={update} editMode={editMode} fz={fz} sx={{ fontSize: fz * 0.9 }} />
      {(editMode || data.subject) && <div style={{ margin: '0 0 20px', padding: '10px 0', borderTop: `0.5px solid ${gold}30`, borderBottom: `0.5px solid ${gold}30` }}>
        <span style={{ fontSize: fz * 0.72, color: gold, letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 400 }}>Re: </span>
        <EditableField value={data.subject} onChange={v => update('subject', v)} editMode={editMode} style={{ fontSize: fz * 0.92, color: '#3d3228', fontWeight: 300, fontStyle: 'italic' }} />
      </div>}
      <Body data={data} update={update} editMode={editMode} fz={fz} paraStyle={{ color: '#3d3228', fontWeight: 300 }} />
      <Signoff data={data} update={update} editMode={editMode} fz={fz} accent={gold} />
    </div>
  );
}

/* ══════════════════════════════════════════════════
   6. TECH
══════════════════════════════════════════════════ */
function TechCL({ data, update, accent, fz, editMode }) {
  const bg='#0d1117'; const bg2='#161b22'; const border='#30363d'; const green=accent; const muted='#8b949e';
  const inputSx = { background: 'rgba(255,255,255,0.05)', border: `1px dashed ${green}60`, borderRadius: 3, color: '#e6edf3',  outline: 'none', padding: '2px 6px' };
  return (
    <div style={{  fontSize: fz, background: bg, minHeight: 620, color: '#e6edf3', lineHeight: 1.7 }}>
      <div style={{ background: bg2, borderBottom: `1px solid ${border}`, padding: '22px 28px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ color: green }}>~/</span><EditableField value={data.senderName} onChange={v => update('senderName', v)} editMode={editMode} style={{ fontSize: fz * 1.6, fontWeight: 600, color: '#e6edf3' }} inputStyle={inputSx} /></div>
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}><span style={{ color: muted }}>$</span><EditableField value={data.senderTitle} onChange={v => update('senderTitle', v)} editMode={editMode} style={{ fontSize: fz * 0.84, color: green }} inputStyle={inputSx} /></div>
        <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: fz * 0.75, color: muted }}>
          {(editMode || data.senderLocation) && <span>loc: {data.senderLocation}</span>}
          {(editMode || data.senderEmail)    && <span>eml: {data.senderEmail}</span>}
        </div>
      </div>
      <div style={{ padding: '20px 28px' }}>
        <div style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 6, padding: '10px 14px', marginBottom: 18, fontSize: fz * 0.82, color: muted }}>
          <span style={{ color: green }}>to:</span> {data.recipientName}{data.companyName ? ` @ ${data.companyName}` : ''} &nbsp;<span style={{ color: green }}>date:</span> {data.date}
        </div>
        {(editMode || data.subject) && <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}><span style={{ color: green, fontSize: fz * 0.8 }}>subject:</span><EditableField value={data.subject} onChange={v => update('subject', v)} editMode={editMode} style={{ fontSize: fz * 0.84, color: '#e6edf3', fontWeight: 500 }} inputStyle={inputSx} /></div>}
        <Body data={data} update={update} editMode={editMode} fz={fz} paraStyle={{ color: '#c9d1d9', fontWeight: 300 }} />
        <div style={{ marginTop: 24, borderTop: `1px solid ${border}`, paddingTop: 12 }}>
          <div style={{ display: 'flex', gap: 8 }}><span style={{ color: green }}>$</span><EditableField value={data.signature} onChange={v => update('signature', v)} editMode={editMode} style={{ fontWeight: 600, color: '#e6edf3' }} inputStyle={inputSx} /></div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   7. CREATIVE
══════════════════════════════════════════════════ */
function CreativeCL({ data, update, accent, fz, editMode }) {
  return (
    <div style={{  fontSize: fz, background: '#fff', minHeight: 620, lineHeight: 1.7, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -30, right: -30, width: 180, height: 180, borderRadius: '50%', background: `${accent}10`, pointerEvents: 'none' }} />
      <div style={{ background: `linear-gradient(135deg,${accent},${accent}cc)`, padding: '28px 36px', clipPath: 'polygon(0 0,100% 0,100% 80%,0 100%)', marginBottom: 8 }}>
        <EditableField value={data.senderName}  onChange={v => update('senderName',  v)} editMode={editMode} style={{ fontSize: fz * 1.7, fontWeight: 800, color: '#fff', display: 'block', lineHeight: 1.1 }} inputStyle={{ color: '#fff', background: 'rgba(255,255,255,0.15)', border: '1px dashed rgba(255,255,255,0.4)' }} />
        <EditableField value={data.senderTitle} onChange={v => update('senderTitle', v)} editMode={editMode} style={{ fontSize: fz * 0.82, color: 'rgba(255,255,255,0.82)', fontWeight: 500, marginTop: 5, display: 'block' }} />
        <div style={{ marginTop: 10, display: 'flex', gap: 14, fontSize: fz * 0.76, color: 'rgba(255,255,255,0.7)' }}>
          {(editMode || data.senderLocation) && <span>{data.senderLocation}</span>}
          {(editMode || data.senderEmail)    && <span>{data.senderEmail}</span>}
        </div>
      </div>
      <div style={{ padding: '0 36px 28px' }}>
        <Recipient data={data} update={update} editMode={editMode} fz={fz} />
        {(editMode || data.subject) && <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: accent, transform: 'rotate(45deg)', flexShrink: 0 }} />
          <EditableField value={data.subject} onChange={v => update('subject', v)} editMode={editMode} style={{ fontSize: fz * 0.88, color: accent, fontWeight: 700 }} />
        </div>}
        <Body data={data} update={update} editMode={editMode} fz={fz} paraStyle={{ color: '#444' }} />
        <Signoff data={data} update={update} editMode={editMode} fz={fz} accent={accent} />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   8. ACADEMIC
══════════════════════════════════════════════════ */
function AcademicCL({ data, update, accent, fz, editMode }) {
  return (
    <div style={{  fontSize: fz, background: '#fff', padding: '40px 48px', minHeight: 620, color: '#111', lineHeight: 1.75 }}>
      <div style={{ borderBottom: `2px solid ${accent}`, paddingBottom: 14, marginBottom: 22 }}>
        <EditableField value={data.senderName}  onChange={v => update('senderName',  v)} editMode={editMode} style={{ fontSize: fz * 1.7, fontWeight: 600, color: '#111', display: 'block' }} />
        <EditableField value={data.senderTitle} onChange={v => update('senderTitle', v)} editMode={editMode} style={{ fontSize: fz * 0.88, color: accent, display: 'block', marginTop: 3, fontStyle: 'italic' }} />
        <div style={{ marginTop: 6, fontSize: fz * 0.78, color: '#666', display: 'flex', gap: 14 }}>
          {(editMode || data.senderLocation) && <span>{data.senderLocation}</span>}
          {(editMode || data.senderEmail)    && <span>{data.senderEmail}</span>}
        </div>
      </div>
      <Recipient data={data} update={update} editMode={editMode} fz={fz} />
      <SubjectLine data={data} update={update} editMode={editMode} fz={fz} accent={accent} />
      <Body data={data} update={update} editMode={editMode} fz={fz} paraStyle={{ color: '#333' }} />
      <Signoff data={data} update={update} editMode={editMode} fz={fz} accent={accent} />
    </div>
  );
}

/* ══════════════════════════════════════════════════
   9. CORPORATE
══════════════════════════════════════════════════ */
function CorporateCL({ data, update, accent, fz, editMode }) {
  return (
    <div style={{  fontSize: fz, background: '#fff', minHeight: 620, lineHeight: 1.65 }}>
      <div style={{ background: accent, padding: '18px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <EditableField value={data.senderName}  onChange={v => update('senderName',  v)} editMode={editMode} style={{ fontSize: fz * 1.5, fontWeight: 700, color: '#fff', display: 'block' }} inputStyle={{ color: '#fff', background: 'rgba(255,255,255,0.15)', border: '1px dashed rgba(255,255,255,0.4)' }} />
          <EditableField value={data.senderTitle} onChange={v => update('senderTitle', v)} editMode={editMode} style={{ fontSize: fz * 0.82, color: 'rgba(255,255,255,0.82)', display: 'block', marginTop: 3 }} />
        </div>
        <div style={{ fontSize: fz * 0.76, color: 'rgba(255,255,255,0.75)', textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {(editMode || data.senderLocation) && <span>{data.senderLocation}</span>}
          {(editMode || data.senderEmail)    && <span>{data.senderEmail}</span>}
        </div>
      </div>
      <div style={{ padding: '22px 32px' }}>
        <Recipient data={data} update={update} editMode={editMode} fz={fz} />
        <SubjectLine data={data} update={update} editMode={editMode} fz={fz} accent={accent} />
        <Body data={data} update={update} editMode={editMode} fz={fz} paraStyle={{ color: '#333' }} />
        <Signoff data={data} update={update} editMode={editMode} fz={fz} accent={accent} />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   10. TIMELINE
══════════════════════════════════════════════════ */
function TimelineCL({ data, update, accent, fz, editMode }) {
  return (
    <div style={{  fontSize: fz, background: '#fff', minHeight: 620, display: 'flex', lineHeight: 1.65 }}>
      <div style={{ width: '28%', background: '#f8fafc', borderRight: '1px solid #e2e8f0', padding: '28px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ paddingBottom: 14, borderBottom: `2px solid ${accent}` }}>
          <EditableField value={data.senderName}  onChange={v => update('senderName',  v)} editMode={editMode} style={{ fontSize: fz * 1.2, fontWeight: 700, color: '#111', display: 'block', lineHeight: 1.2 }} />
          <EditableField value={data.senderTitle} onChange={v => update('senderTitle', v)} editMode={editMode} style={{ fontSize: fz * 0.78, color: accent, fontWeight: 600, display: 'block', marginTop: 4 }} />
        </div>
        <div style={{ fontSize: fz * 0.76, color: '#64748b', display: 'flex', flexDirection: 'column', gap: 5 }}>
          {(editMode || data.senderLocation) && <span>Loc: {data.senderLocation}</span>}
          {(editMode || data.senderEmail)    && <span>Eml: {data.senderEmail}</span>}
          {(editMode || data.date)           && <span>Date: {data.date}</span>}
        </div>
        {(editMode || data.recipientName) && <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: fz * 0.65, textTransform: 'uppercase', letterSpacing: '1px', color: '#94a3b8', marginBottom: 5 }}>To</div>
          <div style={{ fontSize: fz * 0.82, color: '#374151', fontWeight: 600 }}>{data.recipientName}</div>
          {data.companyName && <div style={{ fontSize: fz * 0.78, color: '#64748b' }}>{data.companyName}</div>}
        </div>}
      </div>
      <div style={{ flex: 1, padding: '28px 24px' }}>
        {(editMode || data.subject) && <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 18, height: 2, background: accent }} />
          <EditableField value={data.subject} onChange={v => update('subject', v)} editMode={editMode} style={{ fontSize: fz * 0.88, color: accent, fontWeight: 600 }} />
        </div>}
        <Body data={data} update={update} editMode={editMode} fz={fz} paraStyle={{ color: '#444' }} />
        <Signoff data={data} update={update} editMode={editMode} fz={fz} accent={accent} />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   11. INFOGRAPHIC
══════════════════════════════════════════════════ */
function InfographicCL({ data, update, accent, fz, editMode }) {
  return (
    <div style={{  fontSize: fz, background: '#fff', minHeight: 620, lineHeight: 1.65 }}>
      <div style={{ background: accent, padding: '22px 32px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -20, top: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', border: '2px solid rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: fz * 1.4, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
            {data.senderName ? data.senderName[0].toUpperCase() : '?'}
          </div>
          <div>
            <EditableField value={data.senderName}  onChange={v => update('senderName',  v)} editMode={editMode} style={{ fontSize: fz * 1.4, fontWeight: 700, color: '#fff', display: 'block' }} inputStyle={{ color: '#fff', background: 'rgba(255,255,255,0.15)', border: '1px dashed rgba(255,255,255,0.4)' }} />
            <EditableField value={data.senderTitle} onChange={v => update('senderTitle', v)} editMode={editMode} style={{ fontSize: fz * 0.8, color: 'rgba(255,255,255,0.82)', display: 'block', marginTop: 2 }} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 14, marginTop: 12, flexWrap: 'wrap' }}>
          {[['Loc:', data.senderLocation], ['Eml:', data.senderEmail], ['Date:', data.date]].filter(([, v]) => editMode || v).map(([icon, v], i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.18)', borderRadius: 16, padding: '3px 10px', fontSize: fz * 0.75, color: '#fff' }}><span style={{ fontWeight: 600 }}>{icon}</span> {v}</div>
          ))}
        </div>
      </div>
      <div style={{ padding: '20px 32px' }}>
        {(editMode || data.recipientName) && <div style={{ background: `${accent}08`, border: `1px solid ${accent}20`, borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: fz * 0.84, color: '#374151' }}>
          <span style={{ fontWeight: 600 }}>To:</span> {data.recipientName}{data.companyName ? `, ${data.companyName}` : ''}
        </div>}
        <SubjectLine data={data} update={update} editMode={editMode} fz={fz} accent={accent} />
        <Body data={data} update={update} editMode={editMode} fz={fz} paraStyle={{ color: '#444' }} />
        <Signoff data={data} update={update} editMode={editMode} fz={fz} accent={accent} />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   12. NORDIC
══════════════════════════════════════════════════ */
function NordicCL({ data, update, accent, fz, editMode }) {
  return (
    <div style={{  fontSize: fz, background: '#fff', padding: '52px 56px', minHeight: 620, color: '#111', lineHeight: 1.85 }}>
      <div style={{ marginBottom: 44 }}>
        <EditableField value={data.senderName} onChange={v => update('senderName', v)} editMode={editMode} style={{ fontSize: fz * 2.6, fontWeight: 200, color: '#111', letterSpacing: '-2px', lineHeight: 1, display: 'block' }} />
        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 32, height: 1.5, background: accent }} />
          <EditableField value={data.senderTitle} onChange={v => update('senderTitle', v)} editMode={editMode} style={{ fontSize: fz * 0.78, color: '#777', letterSpacing: '2px', textTransform: 'uppercase' }} />
        </div>
        <div style={{ marginTop: 10, fontSize: fz * 0.74, color: '#aaa', display: 'flex', gap: 18, flexWrap: 'wrap' }}>
          {(editMode || data.senderLocation) && <span>{data.senderLocation}</span>}
          {(editMode || data.senderEmail)    && <span>{data.senderEmail}</span>}
        </div>
      </div>
      <Recipient data={data} update={update} editMode={editMode} fz={fz} />
      {(editMode || data.subject) && <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: '0.5px solid #f1f5f9' }}>
        <EditableField value={data.subject} onChange={v => update('subject', v)} editMode={editMode} style={{ fontSize: fz * 0.9, color: '#555', fontWeight: 300 }} />
      </div>}
      <Body data={data} update={update} editMode={editMode} fz={fz} paraStyle={{ color: '#444', fontWeight: 300 }} />
      <Signoff data={data} update={update} editMode={editMode} fz={fz} accent={accent} lineColor="#f1f5f9" />
    </div>
  );
}

/* ══════════════════════════════════════════════════
   13. ELEGANT
══════════════════════════════════════════════════ */
function ElegantCL({ data, update, accent, fz, editMode }) {
  return (
    <div style={{  fontSize: fz, background: '#fff', padding: '48px 52px', minHeight: 620, color: '#1a1a1a', lineHeight: 1.8 }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <EditableField value={data.senderName} onChange={v => update('senderName', v)} editMode={editMode} style={{ fontSize: fz * 2, fontWeight: 700, color: '#1a1a1a', letterSpacing: '4px', textTransform: 'uppercase', display: 'block' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, margin: '10px 0' }}>
          <div style={{ height: '0.5px', flex: 1, background: accent, opacity: 0.4 }} /><div style={{ width: 5, height: 5, borderRadius: '50%', background: accent }} /><div style={{ height: '0.5px', flex: 1, background: accent, opacity: 0.4 }} />
        </div>
        <EditableField value={data.senderTitle} onChange={v => update('senderTitle', v)} editMode={editMode} style={{ fontSize: fz * 0.86, color: '#666', fontStyle: 'italic', display: 'block' }} />
        <div style={{ marginTop: 8, fontSize: fz * 0.76, color: '#888', display: 'flex', justifyContent: 'center', gap: '0 16px', flexWrap: 'wrap' }}>
          {(editMode || data.senderLocation) && <span>{data.senderLocation}</span>}
          {(editMode || data.senderEmail)    && <span>{data.senderEmail}</span>}
        </div>
      </div>
      <Recipient data={data} update={update} editMode={editMode} fz={fz} />
      {(editMode || data.subject) && <div style={{ textAlign: 'center', position: 'relative', margin: '0 0 20px', padding: '12px 0' }}>
        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '0.5px', background: `${accent}30` }} />
        <span style={{ position: 'relative', background: '#fff', padding: '0 16px', fontSize: fz * 0.7, fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: accent }}>Re: </span>
        <EditableField value={data.subject} onChange={v => update('subject', v)} editMode={editMode} style={{ fontSize: fz * 0.9, fontStyle: 'italic', color: '#333' }} />
      </div>}
      <Body data={data} update={update} editMode={editMode} fz={fz} paraStyle={{ color: '#333', textAlign: 'center' }} />
      <div style={{ textAlign: 'center', marginTop: 28 }}>
        <EditableField value={data.signoff} onChange={v => update('signoff', v)} editMode={editMode} style={{ fontSize: fz * 0.9, color: '#555', display: 'block', marginBottom: 18 }} />
        <div style={{ borderTop: `0.5px solid ${accent}40`, paddingTop: 8, display: 'inline-block', minWidth: 140 }}>
          <EditableField value={data.signature} onChange={v => update('signature', v)} editMode={editMode} style={{ fontSize: fz * 1.1, fontWeight: 700, color: accent }} />
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   14. CHICAGO
══════════════════════════════════════════════════ */
function ChicagoCL({ data, update, accent, fz, editMode }) {
  return (
    <div style={{  fontSize: fz, background: '#fafaf8', minHeight: 620, border: '2px solid #111', lineHeight: 1.75 }}>
      <div style={{ borderBottom: '3px solid #111', padding: '16px 28px', textAlign: 'center' }}>
        <EditableField value={data.senderName}  onChange={v => update('senderName',  v)} editMode={editMode} style={{ fontSize: fz * 2.2, fontWeight: 900, color: '#111', letterSpacing: '-0.5px', display: 'block', lineHeight: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '6px 0' }}><div style={{ flex: 1, height: '1px', background: '#111' }} /><span style={{ fontSize: 11 }}>◆</span><div style={{ flex: 1, height: '1px', background: '#111' }} /></div>
        <EditableField value={data.senderTitle} onChange={v => update('senderTitle', v)} editMode={editMode} style={{ fontSize: fz * 0.86, color: '#444', fontStyle: 'italic', display: 'block' }} />
        <div style={{ marginTop: 6, fontSize: fz * 0.74, color: '#666', display: 'flex', justifyContent: 'center', gap: '0 14px' }}>
          {(editMode || data.senderLocation) && <span>{data.senderLocation}</span>}
          {(editMode || data.senderEmail)    && <span>{data.senderEmail}</span>}
        </div>
      </div>
      <div style={{ padding: '18px 28px' }}>
        <Recipient data={data} update={update} editMode={editMode} fz={fz} />
        {(editMode || data.subject) && <div style={{ borderTop: '3px solid #111', borderBottom: '1px solid #111', padding: '3px 0', marginBottom: 16 }}>
          <span style={{ fontSize: fz * 0.68, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#111' }}>Re: </span>
          <EditableField value={data.subject} onChange={v => update('subject', v)} editMode={editMode} style={{ fontSize: fz * 0.86, fontStyle: 'italic', color: '#333' }} />
        </div>}
        <Body data={data} update={update} editMode={editMode} fz={fz} paraStyle={{ color: '#333' }} />
        <Signoff data={data} update={update} editMode={editMode} fz={fz} accent={accent} />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   15. SUNSET
══════════════════════════════════════════════════ */
function SunsetCL({ data, update, accent, fz, editMode }) {
  return (
    <div style={{  fontSize: fz, background: '#fff', minHeight: 620, lineHeight: 1.7 }}>
      <div style={{ background: `linear-gradient(135deg,${accent} 0%,#f97316 100%)`, padding: '26px 36px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -20, bottom: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', pointerEvents: 'none' }} />
        <EditableField value={data.senderName}  onChange={v => update('senderName',  v)} editMode={editMode} style={{ fontSize: fz * 1.65, fontWeight: 700, color: '#fff', display: 'block', lineHeight: 1.1 }} inputStyle={{ color: '#fff', background: 'rgba(255,255,255,0.15)', border: '1px dashed rgba(255,255,255,0.4)' }} />
        <EditableField value={data.senderTitle} onChange={v => update('senderTitle', v)} editMode={editMode} style={{ fontSize: fz * 0.82, color: 'rgba(255,255,255,0.85)', fontWeight: 500, marginTop: 5, display: 'block' }} />
        <div style={{ display: 'flex', gap: 12, marginTop: 10, flexWrap: 'wrap' }}>
          {[['Loc:', data.senderLocation], ['Eml:', data.senderEmail]].filter(([, v]) => editMode || v).map(([icon, v], i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: '3px 10px', fontSize: fz * 0.75, color: '#fff' }}><span style={{ fontWeight: 600 }}>{icon}</span> {v}</div>
          ))}
        </div>
      </div>
      <div style={{ padding: '22px 36px' }}>
        <Recipient data={data} update={update} editMode={editMode} fz={fz} />
        <SubjectLine data={data} update={update} editMode={editMode} fz={fz} accent={accent} />
        <Body data={data} update={update} editMode={editMode} fz={fz} paraStyle={{ color: '#444' }} />
        <Signoff data={data} update={update} editMode={editMode} fz={fz} accent={accent} />
      </div>
    </div>
  );
}

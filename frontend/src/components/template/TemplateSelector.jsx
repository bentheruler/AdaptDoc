// client/src/components/template/TemplateSelector.jsx
import { useState, useEffect } from 'react';
import { THEME_LIST, THEME_CONFIGS, FONT_SIZES } from '../../constants';

const PRESET_COLORS = [
  '#0d9488','#0ea5e9','#6366f1','#8b5cf6','#ec4899',
  '#ef4444','#f97316','#eab308','#34d399','#1e3a5f',
  '#64748b','#0891b2','#374151','#000000',
];
const SPACING_PRESETS = [
  { id:'compact', label:'Compact' },
  { id:'normal',  label:'Normal'  },
  { id:'relaxed', label:'Relaxed' },
];
const PAPER_SIZES = ['A4','Letter','Legal'];

/* ══ Icons ══ */
const X = () => <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const Check = () => <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>;
const Download = () => <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;

/* ══════════════════════════════════════════════════
   (Abstract placeholder previews removed in favor of real previews)
══════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════════
   TEMPLATE CATEGORY TAGS — maps each theme to a category
══════════════════════════════════════════════════ */
const THEME_CATEGORIES = {
  Modern:      ['All', 'Sidebar'],
  Classic:     ['All', 'Classic'],
  Minimal:     ['All', 'Minimal'],
  Bold:        ['All', 'Dark'],
  Executive:   ['All', 'Classic', 'ATS'],
  Tech:        ['All', 'Dark', 'ATS'],
  Creative:    ['All', 'Sidebar'],
  Academic:    ['All', 'Two Column'],
  Corporate:   ['All', 'ATS', 'Classic'],
  Timeline:    ['All', 'Sidebar'],
  Infographic: ['All', 'Sidebar'],
  Nordic:      ['All', 'Minimal'],
  Elegant:     ['All', 'Classic'],
  Chicago:     ['All', 'Two Column'],
  Sunset:      ['All', 'Sidebar'],
};
const CATEGORY_FILTERS = ['All', 'Classic', 'Sidebar', 'Two Column', 'ATS', 'Dark', 'Minimal'];

/* ══════════════════════════════════════════════════
   THEME BROWSER MODAL — resume.io style grid
   Shows real user data thumbnails + category chips
══════════════════════════════════════════════════ */
const ThemeBrowserModal = ({ isOpen, onClose, currentTheme, onSelect, accentColor, renderPreview }) => {
  const [selected,   setSelected]   = useState(currentTheme);
  const [previewing, setPreviewing] = useState(currentTheme);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => { if (isOpen) { setSelected(currentTheme); setPreviewing(currentTheme); setActiveCategory('All'); } }, [isOpen, currentTheme]);

  if (!isOpen) return null;

  const filteredThemes = THEME_LIST.filter(name =>
    (THEME_CATEGORIES[name] || ['All']).includes(activeCategory)
  );

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', background: 'rgba(2,6,14,0.96)', backdropFilter: 'blur(12px)' }}>

      {/* ── Left: template browser ── */}
      <div style={{ width: 380, background: '#080c14', borderRight: '1px solid #1e293b', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '16px 18px 12px', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>Template & Style</div>
            <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>{THEME_LIST.length} templates · click to select</div>
          </div>
          <button onClick={onClose} style={{ background: '#1e293b', border: 'none', borderRadius: 7, width: 30, height: 30, cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><X /></button>
        </div>

        {/* Category filter chips */}
        <div style={{ padding: '10px 14px 8px', borderBottom: '1px solid #1e293b', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {CATEGORY_FILTERS.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              style={{
                padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                border: `1.5px solid ${activeCategory === cat ? '#0d9488' : '#1e293b'}`,
                background: activeCategory === cat ? '#042f2e' : 'transparent',
                color: activeCategory === cat ? '#0d9488' : '#64748b',
                transition: 'all 0.15s',
              }}
            >{cat}</button>
          ))}
        </div>

        {/* Template grid — 2 columns with real previews */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, alignContent: 'start' }}>
          {filteredThemes.map(name => {
            const cfg      = THEME_CONFIGS[name] || {};
            const isActive = name === currentTheme;
            const isSelected = name === selected;
            const isHov    = name === previewing;

            return (
              <div key={name}
                onMouseEnter={() => setPreviewing(name)}
                onMouseLeave={() => setPreviewing(selected)}
                onClick={() => { setSelected(name); setPreviewing(name); }}
                style={{
                  borderRadius: 10, overflow: 'hidden', cursor: 'pointer',
                  border: (isActive || isSelected) ? `2px solid #0d9488` : isHov ? `2px solid #334155` : '2px solid #1e293b',
                  transition: 'border-color 0.14s, transform 0.12s, box-shadow 0.12s',
                  transform: isHov ? 'translateY(-2px)' : 'translateY(0)',
                  boxShadow: isHov ? '0 8px 24px rgba(0,0,0,0.4)' : 'none',
                  background: '#0a0f1e',
                  position: 'relative',
                }}
              >
                {/* Thumbnail — real document content scaled down */}
                <div style={{ height: 120, overflow: 'hidden', background: '#fff', position: 'relative' }}>
                  <div style={{
                    transform: 'scale(0.36)',
                    transformOrigin: 'top left',
                    width: '278%',
                    pointerEvents: 'none',
                    userSelect: 'none',
                  }}>
                    {renderPreview(name)}
                  </div>

                  {/* Selected checkmark badge */}
                  {(isActive || isSelected) && (
                    <div style={{ position: 'absolute', top: 6, right: 6, width: 20, height: 20, borderRadius: '50%', background: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.4)' }}>
                      <Check />
                    </div>
                  )}

                  {/* Category tag overlay */}
                  <div style={{ position: 'absolute', bottom: 5, left: 5, display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                    {(THEME_CATEGORIES[name] || []).filter(c => c !== 'All').slice(0, 1).map(tag => (
                      <span key={tag} style={{ fontSize: 7, fontWeight: 700, background: 'rgba(0,0,0,0.72)', color: '#94a3b8', padding: '2px 5px', borderRadius: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{tag}</span>
                    ))}
                  </div>
                </div>

                {/* Template name + description */}
                <div style={{ padding: '7px 9px 8px', background: isHov ? '#111827' : '#0a0f1e', transition: 'background 0.14s' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: (isActive || isSelected) ? '#0d9488' : '#e2e8f0', marginBottom: 2 }}>{name}</div>
                  <div style={{ fontSize: 9, color: '#475569', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cfg.desc}</div>
                </div>
              </div>
            );
          })}

          {filteredThemes.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px 0', color: '#334155', fontSize: 12 }}>
              No templates in this category
            </div>
          )}
        </div>

        {/* Apply button */}
        <div style={{ padding: '12px 14px', borderTop: '1px solid #1e293b', display: 'flex', flexDirection: 'column', gap: 7 }}>
          <button onClick={() => { onSelect(selected); onClose(); }}
            style={{ width: '100%', background: 'var(--accent-color)', color: '#fff', border: 'none', borderRadius: 9, padding: '11px 0', cursor: 'pointer', fontSize: 13, fontWeight: 700, letterSpacing: '0.02em', transition: 'opacity 0.15s' }}>
            Apply {selected} Template
          </button>
        </div>
      </div>

      {/* ── Right: large preview ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Preview header bar */}
        <div style={{ padding: '12px 24px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#0d9488' }} />
          <span style={{ fontSize: 11, color: '#64748b', fontFamily: 'monospace' }}>
            preview — <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{previewing}</span>
          </span>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ fontSize: 9, background: '#042f2e', color: '#0d9488', fontWeight: 700, padding: '3px 8px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {(THEME_CATEGORIES[previewing] || []).filter(c => c !== 'All').join(' · ') || 'Template'}
            </div>
          </div>
        </div>

        {/* Full-size preview */}
        <div style={{ flex: 1, overflow: 'auto', padding: '28px', background: 'var(--bg-color)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: 680, background: '#fff', borderRadius: 8, boxShadow: '0 0 0 1px rgba(255,255,255,0.05), 0 24px 80px rgba(0,0,0,0.6)', overflow: 'hidden' }}>
            {renderPreview(previewing)}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ──────────────────────────────────────────────────
   (Large placeholders removed)
────────────────────────────────────────────────── */

/* ══════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════ */
const TemplateSelector = ({
  theme, onThemeChange,
  fontSize, onFontSizeChange,
  fontFamily = 'Inter',   onFontFamilyChange,
  accentColor,            onAccentChange,
  spacing = 'normal',     onSpacingChange,
  paperSize = 'A4',       onPaperSizeChange,
  showPageNumbers = false, onShowPageNumbersChange,
  showWatermark = false,   onShowWatermarkChange,
  onDownloadPDF, pdfLoading,
  onDownloadWord, wordLoading,
  thumbnail,
  renderPreview,
}) => {
  const [browserOpen,  setBrowserOpen]  = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');
  const [copyDone,     setCopyDone]     = useState(false);
  const [openSec, setOpenSec] = useState({ color:true, typo:false, page:false, export:true });
  const tog = k => setOpenSec(p => ({ ...p, [k]: !p[k] }));

  const isExporting = pdfLoading || wordLoading;

  /* ── PDF download — routes to client-side react-to-print ── */
  const handleExport = async () => {
    if (exportFormat === 'word' || exportFormat === 'both') {
      onDownloadWord?.();
    }
    if (exportFormat === 'pdf' || exportFormat === 'both') {
      onDownloadPDF?.();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopyDone(true); setTimeout(() => setCopyDone(false), 2000);
    });
  };

  const cfg = THEME_CONFIGS[theme] || {};

  return (
    <>
      <ThemeBrowserModal
        isOpen={browserOpen} onClose={() => setBrowserOpen(false)}
        currentTheme={theme} onSelect={onThemeChange}
        accentColor={accentColor} renderPreview={renderPreview}
      />

      <div style={ts.wrap}>
        {/* live thumbnail */}
        {thumbnail && (
          <div style={{ padding: '14px 16px 0', flexShrink: 0 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 7 }}>Live Preview</div>
            <div style={{ border: '1px solid #1e293b', borderRadius: 8, overflow: 'hidden', height: 110, position: 'relative', background: '#080c14' }}>
              <div style={{ transform: 'scale(0.29)', transformOrigin: 'top left', width: '345%', pointerEvents: 'none' }}>{thumbnail}</div>
              <div style={{ position: 'absolute', bottom: 5, right: 7, background: 'rgba(0,0,0,0.7)', color: '#0d9488', fontSize: 8, fontWeight: 700, padding: '2px 6px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{theme}</div>
            </div>
          </div>
        )}

        {/* theme picker button */}
        <div style={ts.sec}>
          <button onClick={() => setBrowserOpen(true)} style={ts.themeBtn}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#f1f5f9' }}>{theme}</div>
              <div style={{ fontSize: 9, color: '#475569', marginTop: 1 }}>{cfg.desc}</div>
            </div>
            <span style={{ fontSize: 9, color: '#0d9488', fontWeight: 600, background: '#042f2e', padding: '2px 7px', borderRadius: 4 }}>Browse all →</span>
          </button>
        </div>

        {/* accent color */}
        <div style={ts.sec}>
          <button style={ts.secHdr} onClick={() => tog('color')}>
            <span style={ts.secTtl}>Accent Colour</span>
            <span style={{ color:'#475569', transition:'transform 0.2s', transform: openSec.color?'rotate(180deg)':'none', display:'inline-block' }}>▾</span>
          </button>
          {openSec.color && (
            <div style={{ padding: '10px 16px 14px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                {PRESET_COLORS.map(c => (
                  <button key={c} onClick={() => onAccentChange(c)} title={c} style={{ width: 24, height: 24, borderRadius: 6, background: c, border: 'none', cursor: 'pointer', outline: accentColor === c ? '3px solid #0d9488' : '3px solid transparent', outlineOffset: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.13s' }}>
                    {accentColor === c && <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'conic-gradient(red,yellow,lime,aqua,blue,magenta,red)', padding: 3, flexShrink: 0 }}>
                  <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#0d1117', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    <input type="color" value={accentColor} onChange={e => onAccentChange(e.target.value)} style={{ width: 28, height: 28, border: 'none', padding: 0, cursor: 'pointer', background: 'none', borderRadius: '50%' }} />
                  </div>
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 18, height: 18, borderRadius: 4, background: accentColor, border: '1px solid #1e293b', flexShrink: 0 }} />
                  <input type="text" value={accentColor} onChange={e => { if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) onAccentChange(e.target.value); }}
                    style={{ flex: 1, padding: '5px 8px', border: '1px solid #1e293b', borderRadius: 6, fontSize: 11, fontFamily: 'monospace', color: '#e2e8f0', background: '#0f172a', outline: 'none' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* typography */}
        <div style={ts.sec}>
          <button style={ts.secHdr} onClick={() => tog('typo')}>
            <span style={ts.secTtl}>Typography</span>
            <span style={{ color:'#475569', transition:'transform 0.2s', transform: openSec.typo?'rotate(180deg)':'none', display:'inline-block' }}>▾</span>
          </button>
          {openSec.typo && (
            <div style={{ padding: '10px 16px 14px' }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>Font Family</div>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 14 }}>
                {['Inter', 'Roboto', 'Open Sans', 'Lato', 'Poppins', 'Playfair Display', 'Merriweather', 'Lora', 'Nunito', 'Fira Code'].map(f => (
                  <button key={f} onClick={() => onFontFamilyChange?.(f)} style={{ padding: '5px 10px', borderRadius: 7, border: '1px solid', fontSize: 10, fontWeight: 600, cursor: 'pointer', transition: 'all 0.13s', borderColor: fontFamily===f?'var(--accent-color)':'var(--border-color)', background: fontFamily===f?'var(--accent-subtle)':'var(--bg-color)', color: fontFamily===f?'var(--accent-color)':'var(--text-secondary)' }}>
                    {f}
                  </button>
                ))}
              </div>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>Font Size</div>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 14 }}>
                {FONT_SIZES.map(f => (
                  <button key={f} onClick={() => onFontSizeChange(f)} style={{ padding: '5px 10px', borderRadius: 7, border: '1px solid', fontSize: 10, fontWeight: 600, cursor: 'pointer', transition: 'all 0.13s', borderColor: fontSize===f?'var(--accent-color)':'var(--border-color)', background: fontSize===f?'var(--accent-subtle)':'var(--bg-color)', color: fontSize===f?'var(--accent-color)':'var(--text-secondary)' }}>
                    {f}
                  </button>
                ))}
              </div>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>Line Spacing</div>
              <div style={{ display: 'flex', gap: 5 }}>
                {SPACING_PRESETS.map(sp => (
                  <button key={sp.id} onClick={() => onSpacingChange?.(sp.id)} style={{ flex: 1, padding: '6px 4px', borderRadius: 7, border: '1px solid', fontSize: 10, fontWeight: 600, cursor: 'pointer', transition: 'all 0.13s', borderColor: spacing===sp.id?'var(--accent-color)':'var(--border-color)', background: spacing===sp.id?'var(--accent-subtle)':'var(--bg-color)', color: spacing===sp.id?'var(--accent-color)':'var(--text-secondary)' }}>
                    {sp.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* page settings */}
        <div style={ts.sec}>
          <button style={ts.secHdr} onClick={() => tog('page')}>
            <span style={ts.secTtl}>Page Settings</span>
            <span style={{ color:'#475569', transition:'transform 0.2s', transform: openSec.page?'rotate(180deg)':'none', display:'inline-block' }}>▾</span>
          </button>
          {openSec.page && (
            <div style={{ padding: '10px 16px 14px' }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>Paper Size</div>
              <div style={{ display: 'flex', gap: 5, marginBottom: 14 }}>
                {PAPER_SIZES.map(p => (
                  <button key={p} onClick={() => onPaperSizeChange?.(p)} style={{ flex: 1, padding: '6px 4px', borderRadius: 7, border: '1px solid', fontSize: 10, fontWeight: 600, cursor: 'pointer', transition: 'all 0.13s', borderColor: paperSize===p?'var(--accent-color)':'var(--border-color)', background: paperSize===p?'var(--accent-subtle)':'var(--bg-color)', color: paperSize===p?'var(--accent-color)':'var(--text-secondary)' }}>
                    {p}
                  </button>
                ))}
              </div>

              {/* Page numbers — applies @page CSS via a style tag */}
              <Toggle
                label="Page numbers"
                desc="Printed footer on each page"
                value={showPageNumbers}
                onChange={v => {
                  onShowPageNumbersChange?.(v);
                  // inject/remove @page style
                  const id = 'page-number-style';
                  if (v) {
                    if (!document.getElementById(id)) {
                      const s = document.createElement('style');
                      s.id = id;
                      s.textContent = `@media print { body::after { content: counter(page); position: fixed; bottom: 10mm; right: 12mm; font-size: 9pt; color: #666; } body { counter-reset: page; counter-increment: page; } }`;
                      document.head.appendChild(s);
                    }
                  } else {
                    document.getElementById(id)?.remove();
                  }
                }}
              />
              <Toggle label="Draft watermark" value={showWatermark} onChange={v => onShowWatermarkChange?.(v)} />
            </div>
          )}
        </div>

        {/* export */}
        <div style={ts.sec}>
          <button style={ts.secHdr} onClick={() => tog('export')}>
            <span style={ts.secTtl}>Export</span>
            <span style={{ color:'#475569', transition:'transform 0.2s', transform: openSec.export?'rotate(180deg)':'none', display:'inline-block' }}>▾</span>
          </button>
          {openSec.export && (
            <div style={{ padding: '10px 16px 14px' }}>
              <div style={{ display: 'flex', gap: 5, marginBottom: 10 }}>
                {[{id:'pdf',label:'PDF'},{id:'word',label:'Word'},{id:'both',label:'Both'}].map(f => (
                  <button key={f.id} onClick={() => setExportFormat(f.id)} style={{ flex: 1, padding: '6px 4px', borderRadius: 7, border: '1px solid', fontSize: 10, fontWeight: 600, cursor: 'pointer', transition: 'all 0.13s', borderColor: exportFormat===f.id?'#0d9488':'#1e293b', background: exportFormat===f.id?'#042f2e':'#0f172a', color: exportFormat===f.id?'#0d9488':'#64748b' }}>
                    {f.label}
                  </button>
                ))}
              </div>

              {/* info about backend */}
              {(exportFormat === 'pdf' || exportFormat === 'both') && (
                <div style={{ fontSize: 9, color: '#475569', background: '#0a0e1a', border: '1px solid #1e293b', borderRadius: 6, padding: '6px 10px', marginBottom: 10, lineHeight: 1.5 }}>
                  PDF export runs locally in your browser for maximum privacy.
                </div>
              )}

              <button onClick={handleExport} disabled={isExporting} style={{ width:'100%', background: isExporting ? '#1e293b' : 'var(--accent-color)', color: isExporting?'#475569':'#fff', border:'none', borderRadius:8, padding:'10px 0', cursor: isExporting?'not-allowed':'pointer', fontSize:12, fontWeight:600, display:'flex', alignItems:'center', justifyContent:'center', gap:6, marginBottom:7, transition:'all 0.18s' }}>
                {isExporting ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Exporting…
                  </>
                ) : (
                  <><Download />{exportFormat==='pdf'?'Download PDF':exportFormat==='word'?'Download Word':'Download Both'}</>
                )}
              </button>

              {exportFormat === 'both' && (
                <div style={{ display:'flex', gap:5, marginBottom:7 }}>
                  <button onClick={()=>onDownloadPDF?.()} disabled={pdfLoading} style={{ flex:1, padding:'7px 0', borderRadius:7, border:'1px solid #1e293b', background:'#0f172a', color:'#64748b', fontSize:10, fontWeight:600, cursor:'pointer' }}>{pdfLoading?'…':'PDF only'}</button>
                  <button onClick={()=>onDownloadWord?.()} disabled={wordLoading} style={{ flex:1, padding:'7px 0', borderRadius:7, border:'1px solid #1e293b', background:'#0f172a', color:'#64748b', fontSize:10, fontWeight:600, cursor:'pointer' }}>{wordLoading?'…':'Word only'}</button>
                </div>
              )}

              <button onClick={handleCopyLink} style={{ width:'100%', padding:'8px 0', borderRadius:8, border:`1px solid ${copyDone?'#0f766e':'#1e293b'}`, background: copyDone?'#042f2e':'#0f172a', color: copyDone?'#34d399':'#64748b', fontSize:11, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:5, transition:'all 0.18s' }}>
                {copyDone ? '✓ Link copied!' : 'Copy Link'}
              </button>
            </div>
          )}
        </div>

        <div style={{ height: 24 }} />
      </div>
    </>
  );
};

const Toggle = ({ label, desc, value, onChange }) => (
  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'6px 0' }}>
    <div>
      <div style={{ fontSize:11, color:'#94a3b8' }}>{label}</div>
      {desc && <div style={{ fontSize:9, color:'#334155', marginTop:1 }}>{desc}</div>}
    </div>
    <button onClick={() => onChange(!value)} style={{ width:34, height:19, borderRadius:10, border:'none', cursor:'pointer', padding:2, background: value?'#0d9488':'#1e293b', display:'flex', alignItems:'center', justifyContent: value?'flex-end':'flex-start', transition:'background 0.2s', flexShrink:0, marginLeft:8 }}>
      <span style={{ width:15, height:15, borderRadius:'50%', background:'#fff', display:'block', boxShadow:'0 1px 3px rgba(0,0,0,0.4)', transition:'all 0.18s' }} />
    </button>
  </div>
);

const ts = {
  wrap:    { height:'100%', overflowY:'auto', background:'var(--surface)', display:'flex', flexDirection:'column', fontFamily:"'Inter','Segoe UI',sans-serif" },
  sec:     { borderBottom:'1px solid var(--border-color)' },
  secHdr:  { width:'100%', display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 16px', background:'none', border:'none', cursor:'pointer', textAlign:'left' },
  secTtl:  { fontSize:10, fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.06em' },
  themeBtn:{ width:'100%', display:'flex', justifyContent:'space-between', alignItems:'center', padding:'11px 16px', background:'var(--card-bg)', border:'none', borderBottom:'1px solid var(--border-color)', cursor:'pointer', textAlign:'left' },
};

export default TemplateSelector;
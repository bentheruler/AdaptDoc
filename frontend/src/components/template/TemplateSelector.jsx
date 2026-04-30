// client/src/components/template/TemplateSelector.jsx
import { useState, useEffect } from 'react';
import { THEME_LIST, THEME_CONFIGS, FONT_SIZES } from '../../constants';

const PRESET_COLORS = [
  '#0d9488','#0ea5e9','#6366f1','#8b5cf6','#ec4899',
  '#ef4444','#f97316','#eab308','#22c55e','#1e3a5f',
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
   RICH PLACEHOLDER PREVIEW
   Renders a realistic-looking CV with placeholder
   content specific to each theme's visual style.
   No actual user data needed.
══════════════════════════════════════════════════ */
const PlaceholderPreview = ({ name, accent }) => {
  const isDark  = name === 'Tech';
  const isSplit = ['Modern','Creative','Timeline','Infographic','Sunset'].includes(name);
  const isTwoCol= name === 'Academic' || name === 'Chicago';
  const isCenter= ['Classic','Elegant'].includes(name);
  const bg      = isDark ? '#0d1117' : ['Classic'].includes(name) ? '#fffef9' : ['Minimal','Nordic'].includes(name) ? '#fafafa' : '#fff';

  const mutedColor = isDark ? '#8b949e' : '#94a3b8';
  const lineColor  = isDark ? '#30363d' : '#e2e8f0';

  /* accent bar colors for gradient themes */
  const headerBg = ['Bold','Corporate','Executive'].includes(name) ? '#0f172a'
    : name === 'Tech' ? '#161b22'
    : name === 'Sunset' ? `linear-gradient(135deg,${accent},#f97316)`
    : isSplit ? accent
    : 'transparent';

  /* fake content lines */
  const Lines = ({ widths, color, height = 3, gap = 4, mb = 0 }) => (
    <div style={{ marginBottom: mb }}>
      {widths.map((w, i) => (
        <div key={i} style={{ height, width: `${w}%`, borderRadius: 2, background: color || lineColor, marginBottom: gap }} />
      ))}
    </div>
  );

  /* Skill pills */
  const Pills = ({ count, color }) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginTop: 4 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ height: 8, width: [28,36,24,32,20,38][i % 6], borderRadius: 4, background: color || `${accent}30` }} />
      ))}
    </div>
  );

  return (
    <div style={{ width: '100%', height: '100%', background: bg, overflow: 'hidden', fontFamily: 'sans-serif', position: 'relative' }}>

      {/* ── header band ── */}
      {headerBg !== 'transparent' ? (
        <div style={{ background: headerBg, padding: isSplit ? '10px 8px 8px' : '8px 10px', position: 'relative' }}>
          {/* accent top strip */}
          {['Bold','Corporate','Executive','Tech'].includes(name) && (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: accent }} />
          )}
          <div style={{ height: 6, width: '55%', borderRadius: 2, background: 'rgba(255,255,255,0.75)', marginBottom: 3 }} />
          <div style={{ height: 3, width: '35%', borderRadius: 2, background: name === 'Executive' ? accent : 'rgba(255,255,255,0.4)', marginBottom: 4 }} />
          <div style={{ display: 'flex', gap: 6 }}>
            {[40, 50, 36].map((w, i) => <div key={i} style={{ height: 2, width: w, borderRadius: 1, background: 'rgba(255,255,255,0.3)' }} />)}
          </div>
        </div>
      ) : (
        <div style={{ padding: '8px 10px', borderBottom: `${isCenter ? '1.5px' : '1px'} solid ${accent}${isCenter ? '' : '40'}`, textAlign: isCenter ? 'center' : 'left' }}>
          <div style={{ height: isCenter ? 7 : 6, width: isCenter ? '60%' : '55%', borderRadius: 2, background: name === 'Nordic' ? '#111' : accent, marginBottom: 3, ...(isCenter ? { margin: '0 auto 3px' } : {}) }} />
          <div style={{ height: 3, width: '35%', borderRadius: 2, background: mutedColor, opacity: 0.5, ...(isCenter ? { margin: '0 auto 4px' } : { marginBottom: 4 }) }} />
          <div style={{ display: 'flex', gap: 6, justifyContent: isCenter ? 'center' : 'flex-start' }}>
            {[38, 48, 32].map((w, i) => <div key={i} style={{ height: 2, width: w, borderRadius: 1, background: mutedColor, opacity: 0.4 }} />)}
          </div>
        </div>
      )}

      {/* ── body ── */}
      {isSplit ? (
        <div style={{ display: 'flex', height: 'calc(100% - 50px)' }}>
          {/* sidebar */}
          <div style={{ width: '32%', background: name === 'Sunset' ? `${accent}20` : name === 'Tech' ? '#161b22' : '#f8fafc', borderRight: `1px solid ${isDark ? '#30363d' : '#e2e8f0'}`, padding: '6px 5px', display: 'flex', flexDirection: 'column', gap: 5 }}>
            <Lines widths={[85, 70, 60]} height={2} color={isDark ? '#8b949e' : mutedColor} gap={3} />
            <div style={{ height: '0.5px', background: isDark ? '#30363d' : '#e2e8f0', margin: '2px 0' }} />
            <Pills count={4} color={`${accent}40`} />
            <div style={{ height: '0.5px', background: isDark ? '#30363d' : '#e2e8f0', margin: '2px 0' }} />
            <Lines widths={[90, 75, 80]} height={2} color={isDark ? '#8b949e' : '#94a3b8'} gap={3} />
          </div>
          {/* main */}
          <div style={{ flex: 1, padding: '6px 7px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* section label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
              <div style={{ width: 2, height: 8, background: accent, borderRadius: 1 }} />
              <div style={{ height: 2, width: 28, borderRadius: 1, background: accent, opacity: 0.7 }} />
            </div>
            <Lines widths={[95, 82, 88, 70]} height={2} color={isDark ? '#8b949e' : lineColor} gap={3} mb={4} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
              <div style={{ width: 2, height: 8, background: accent, borderRadius: 1 }} />
              <div style={{ height: 2, width: 24, borderRadius: 1, background: accent, opacity: 0.7 }} />
            </div>
            <Lines widths={[90, 76, 84, 68, 78]} height={2} color={isDark ? '#8b949e' : lineColor} gap={3} />
          </div>
        </div>
      ) : isTwoCol ? (
        <div style={{ display: 'flex', height: 'calc(100% - 50px)', border: name === 'Chicago' ? '0 2px 2px 2px solid #111' : 'none' }}>
          <div style={{ flex: 1, padding: '6px 8px', borderRight: `1px solid ${name === 'Chicago' ? '#111' : '#e2e8f0'}` }}>
            <Lines widths={[95, 80, 88, 72, 85, 70]} height={2} color={lineColor} gap={3} />
          </div>
          <div style={{ flex: 1, padding: '6px 8px' }}>
            <Lines widths={[88, 74, 80, 65, 78, 60]} height={2} color={lineColor} gap={3} />
          </div>
        </div>
      ) : (
        <div style={{ padding: '6px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {/* section header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 1 }}>
            {name !== 'Elegant' && name !== 'Nordic' && <div style={{ width: 2, height: 7, background: accent, borderRadius: 1 }} />}
            <div style={{ height: 2, width: 22, borderRadius: 1, background: accent, opacity: name === 'Nordic' ? 0.8 : 0.7 }} />
            {(name === 'Elegant' || name === 'Nordic') && <div style={{ flex: 1, height: '0.5px', background: '#e2e8f0' }} />}
          </div>
          <Lines widths={[95, 80, 88, 72]} height={2} color={isDark ? '#30363d' : lineColor} gap={3} mb={3} />
          {/* experience entry */}
          <div style={{ paddingLeft: 6, borderLeft: `2px solid ${accent}30` }}>
            <div style={{ height: 3, width: '45%', borderRadius: 2, background: isDark ? '#e6edf3' : '#334155', marginBottom: 2, opacity: 0.8 }} />
            <div style={{ height: 2, width: '30%', borderRadius: 1, background: accent, marginBottom: 3, opacity: 0.7 }} />
            <Lines widths={[90, 76, 82, 68]} height={2} color={isDark ? '#30363d' : lineColor} gap={3} />
          </div>
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════
   THEME BROWSER MODAL — rich placeholder previews
══════════════════════════════════════════════════ */
const ThemeBrowserModal = ({ isOpen, onClose, currentTheme, onSelect, accentColor, renderPreview }) => {
  const [selected,  setSelected]  = useState(currentTheme);
  const [previewing, setPreviewing] = useState(currentTheme);
  const [useReal,   setUseReal]   = useState(false); // toggle: placeholder vs real preview

  useEffect(() => { if (isOpen) { setSelected(currentTheme); setPreviewing(currentTheme); } }, [isOpen, currentTheme]);

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(10px)' }}>

      {/* ── Left: theme grid ── */}
      <div style={{ width: 340, background: '#080c14', borderRight: '1px solid #1e293b', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '18px 18px 12px', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>Choose Template</div>
            <div style={{ fontSize: 10, color: '#475569', marginTop: 1 }}>{THEME_LIST.length} themes · hover to preview</div>
          </div>
          <button onClick={onClose} style={{ background: '#1e293b', border: 'none', borderRadius: 7, width: 30, height: 30, cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X /></button>
        </div>

        {/* grid of theme cards — each shows a rich placeholder */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
          {THEME_LIST.map(name => {
            const cfg = THEME_CONFIGS[name] || {};
            const isActive = name === currentTheme;
            const isHov    = name === previewing;
            return (
              <div key={name}
                onMouseEnter={() => setPreviewing(name)}
                onMouseLeave={() => setPreviewing(selected)}
                onClick={() => { setSelected(name); setPreviewing(name); }}
                style={{ borderRadius: 9, overflow: 'hidden', cursor: 'pointer', border: isActive ? `2px solid #0d9488` : isHov ? `2px solid #334155` : '2px solid #1e293b', transition: 'border-color 0.14s, transform 0.11s', transform: isHov ? 'scale(1.025)' : 'scale(1)', background: '#0f172a' }}
              >
                {/* placeholder preview thumbnail */}
                <div style={{ height: 80, position: 'relative', overflow: 'hidden' }}>
                  <div style={{ transform: 'scale(1)', width: '100%', height: '100%' }}>
                    <PlaceholderPreview name={name} accent={accentColor} />
                  </div>
                  {(isActive || name === selected) && (
                    <div style={{ position: 'absolute', top: 4, right: 4, width: 16, height: 16, borderRadius: '50%', background: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check />
                    </div>
                  )}
                </div>
                {/* label */}
                <div style={{ padding: '5px 7px', background: isHov ? '#1e293b' : '#0a0e1a', transition: 'background 0.14s' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: (isActive || name === selected) ? '#0d9488' : '#cbd5e1' }}>{name}</div>
                  <div style={{ fontSize: 8, color: '#475569', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cfg.desc}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* apply + toggle */}
        <div style={{ padding: '10px 12px', borderTop: '1px solid #1e293b', display: 'flex', flexDirection: 'column', gap: 7 }}>
          {/* real data toggle */}
          <button onClick={() => setUseReal(p => !p)} style={{ width: '100%', background: '#0f172a', border: '1px solid #1e293b', borderRadius: 7, padding: '7px 0', cursor: 'pointer', fontSize: 11, color: '#64748b' }}>
            {useReal ? '📋 Show placeholder preview' : '🔍 Preview with my data'}
          </button>
          <button onClick={() => { onSelect(selected); onClose(); }}
            style={{ width: '100%', background: 'linear-gradient(135deg,#0d9488,#0f766e)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 0', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
            Apply {selected} Theme
          </button>
        </div>
      </div>

      {/* ── Right: detail preview ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '12px 24px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#0d9488' }} />
          <span style={{ fontSize: 11, color: '#64748b', fontFamily: 'monospace' }}>
            preview — <span style={{ color: '#94a3b8' }}>{previewing}</span>
          </span>
          <div style={{ marginLeft: 'auto', fontSize: 10, color: '#334155' }}>
            {useReal ? 'Showing your document data' : 'Showing placeholder content'}
          </div>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '28px', background: '#050810', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
          {useReal ? (
            /* actual rendered document with user data */
            <div style={{ width: '100%', maxWidth: 640, background: '#fff', borderRadius: 6, boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 20px 60px rgba(0,0,0,0.7)', overflow: 'hidden' }}>
              {renderPreview(previewing)}
            </div>
          ) : (
            /* large placeholder preview, scaled up nicely */
            <div style={{ width: '100%', maxWidth: 640, background: '#fff', borderRadius: 6, boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 20px 60px rgba(0,0,0,0.7)', overflow: 'hidden', minHeight: 400 }}>
              <LargePlaceholder name={previewing} accent={accentColor} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ──────────────────────────────────────────────────
   LARGE PLACEHOLDER — realistic full-size mockup
   uses the same placeholder content for all themes
   but renders in the actual theme's visual style
────────────────────────────────────────────────── */
const PLACEHOLDER_DATA = {
  name: 'Alex Johnson', title: 'Senior Product Designer', location: 'Nairobi, Kenya',
  email1: 'alex@example.com', phone: '+254 700 000 000', linkedin: 'linkedin.com/in/alex',
  summary: 'Experienced designer with 8+ years crafting digital products used by millions. Expert in user research, prototyping, and cross-functional collaboration to deliver impactful experiences.',
  skills: ['Figma','User Research','Design Systems','Prototyping','Usability Testing'],
  education: ['BA Design — Nairobi University — 2016'],
  experience: [{ company: 'Innovate Labs', role: 'Senior Product Designer', period: '2020 – Present', bullets: ['Led redesign of core product increasing retention by 32%.','Built and maintained a design system used by 12 engineers.','Conducted 40+ user interviews to inform product strategy.'] }],
  projects: ['AdaptDoc — AI-powered document creation platform'],
  certifications: ['Google UX Design Certificate'],
  references: 'Available upon request',
};

const LargePlaceholder = ({ name: themeName, accent }) => {
  /* Dynamically import and render the actual CVPreview component with placeholder data.
     Since we can't do dynamic imports here synchronously, we render a scaled placeholder. */
  const isSplit = ['Modern','Creative','Timeline','Infographic','Sunset'].includes(themeName);
  const isDark  = themeName === 'Tech';
  const bg      = isDark ? '#0d1117' : ['Classic'].includes(themeName) ? '#fffef9' : '#fff';
  const accent_ = accent;

  /* header background */
  const hasColorHeader = ['Bold','Corporate','Executive','Tech','Creative','Infographic','Sunset'].includes(themeName);
  const headerBg = themeName === 'Sunset' ? `linear-gradient(135deg,${accent_},#f97316)` : ['Bold','Corporate','Executive','Tech'].includes(themeName) ? '#0f172a' : themeName === 'Creative' || themeName === 'Infographic' ? accent_ : undefined;

  const lc = isDark ? '#30363d' : '#e2e8f0';
  const tc = isDark ? '#e6edf3' : '#111';
  const mc = isDark ? '#8b949e' : '#64748b';
  const fz = 11;

  const Block = ({ label, children }) => (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <div style={{ width: 2, height: 12, background: accent_, borderRadius: 1 }} />
        <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: accent_, opacity: 0.8 }}>{label}</div>
      </div>
      {children}
    </div>
  );



  return (
    <div style={{ fontFamily: 'sans-serif', fontSize: fz, background: bg, minHeight: 420, color: tc }}>
      {/* Header */}
      {hasColorHeader ? (
        <div style={{ background: headerBg, padding: isSplit ? '18px 16px 14px' : '16px 20px', position: 'relative' }}>
          {['Bold','Corporate','Executive','Tech'].includes(themeName) && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: accent_ }} />}
          <div style={{ display: 'flex', gap: isSplit ? 0 : 12, alignItems: 'center', justifyContent: themeName === 'Infographic' ? 'flex-start' : 'flex-start' }}>
            {themeName === 'Infographic' && <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', border: '2px solid rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: '#fff', marginRight: 10 }}>A</div>}
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 3 }}>{PLACEHOLDER_DATA.name}</div>
              <div style={{ fontSize: 9, color: accent_, fontWeight: 600, letterSpacing: '1px', marginBottom: 6 }}>{PLACEHOLDER_DATA.title}</div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {[PLACEHOLDER_DATA.location, PLACEHOLDER_DATA.email1, PLACEHOLDER_DATA.phone].map((v, i) => (
                  <span key={i} style={{ fontSize: 8, color: 'rgba(255,255,255,0.6)' }}>{v}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ padding: '14px 20px', borderBottom: `1.5px solid ${['Classic','Elegant'].includes(themeName) ? accent_ : accent_ + '40'}`, textAlign: ['Classic','Elegant'].includes(themeName) ? 'center' : 'left' }}>
          <div style={{ fontSize: 17, fontWeight: themeName === 'Nordic' ? 200 : 700, color: tc, marginBottom: 3, letterSpacing: themeName === 'Nordic' ? '-1px' : 0 }}>{PLACEHOLDER_DATA.name}</div>
          <div style={{ fontSize: 9, color: accent_, marginBottom: 6, letterSpacing: themeName === 'Classic' ? '1px' : 0, fontStyle: themeName === 'Classic' ? 'italic' : 'normal' }}>{PLACEHOLDER_DATA.title}</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: ['Classic','Elegant'].includes(themeName) ? 'center' : 'flex-start' }}>
            {[PLACEHOLDER_DATA.location, PLACEHOLDER_DATA.email1].map((v, i) => <span key={i} style={{ fontSize: 8, color: mc }}>{v}</span>)}
          </div>
        </div>
      )}

      {/* Body */}
      {isSplit ? (
        <div style={{ display: 'flex', height: 340 }}>
          <div style={{ width: '32%', background: themeName === 'Sunset' ? `${accent_}15` : '#f8fafc', borderRight: `1px solid ${lc}`, padding: '10px 8px' }}>
            <div style={{ fontSize: 7, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 5 }}>Skills</div>
            {PLACEHOLDER_DATA.skills.map((s, i) => <div key={i} style={{ fontSize: 8, color: mc, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 4, height: 4, borderRadius: '50%', background: accent_, flexShrink: 0 }} />{s}</div>)}
            <div style={{ height: '0.5px', background: lc, margin: '8px 0' }} />
            <div style={{ fontSize: 7, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 5 }}>Education</div>
            {PLACEHOLDER_DATA.education.map((e, i) => <div key={i} style={{ fontSize: 8, color: mc, lineHeight: 1.4 }}>{e}</div>)}
          </div>
          <div style={{ flex: 1, padding: '10px 12px' }}>
            <Block label="Summary"><div style={{ fontSize: 8, color: mc, lineHeight: 1.6 }}>{PLACEHOLDER_DATA.summary}</div></Block>
            <Block label="Experience">
              {PLACEHOLDER_DATA.experience.map((exp, i) => (
                <div key={i} style={{ paddingLeft: 8, borderLeft: `2px solid ${accent_}30`, marginBottom: 8 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: tc }}>{exp.company}</div>
                  <div style={{ fontSize: 8, color: accent_, fontWeight: 600, marginBottom: 3 }}>{exp.role} · {exp.period}</div>
                  {exp.bullets.map((b, j) => <div key={j} style={{ fontSize: 7, color: mc, lineHeight: 1.5, marginBottom: 2 }}>▸ {b}</div>)}
                </div>
              ))}
            </Block>
          </div>
        </div>
      ) : (
        <div style={{ padding: '10px 20px' }}>
          <Block label="Summary"><div style={{ fontSize: 8, color: mc, lineHeight: 1.6 }}>{PLACEHOLDER_DATA.summary}</div></Block>
          <Block label="Skills">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {PLACEHOLDER_DATA.skills.map((s, i) => <div key={i} style={{ background: `${accent_}18`, border: `1px solid ${accent_}30`, borderRadius: 4, padding: '1px 7px', fontSize: 7, color: accent_ }}>{s}</div>)}
            </div>
          </Block>
          <Block label="Experience">
            {PLACEHOLDER_DATA.experience.map((exp, i) => (
              <div key={i} style={{ paddingLeft: 8, borderLeft: `2px solid ${accent_}30`, marginBottom: 8 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: tc }}>{exp.company}</div>
                <div style={{ fontSize: 8, color: accent_, marginBottom: 3 }}>{exp.role} · {exp.period}</div>
                {exp.bullets.map((b, j) => <div key={j} style={{ fontSize: 7, color: mc, lineHeight: 1.5, marginBottom: 2 }}>▸ {b}</div>)}
              </div>
            ))}
          </Block>
        </div>
      )}
    </div>
  );
};

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

  /* ── PDF download — routes to backend API ── */
  const handleExport = async () => {
    if (exportFormat === 'word' || exportFormat === 'both') {
      onDownloadWord?.();
    }
    if (exportFormat === 'pdf' || exportFormat === 'both') {
      // Try backend first; fall back to client-side
      try {
        const res = await fetch('/api/documents/export-pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')||''}` },
          body: JSON.stringify({ theme, fontSize, accentColor, fontFamily, spacing, paperSize, showPageNumbers }),
        });
        if (res.ok) {
          const blob = await res.blob();
          const url  = URL.createObjectURL(blob);
          const a    = document.createElement('a');
          a.href = url; a.download = 'document.pdf'; a.click();
          URL.revokeObjectURL(url);
          return;
        }
      } catch { /* fall through to client-side */ }
      // Client-side fallback
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
              <div style={{ fontSize: 9, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>Font Size</div>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 14 }}>
                {FONT_SIZES.map(f => (
                  <button key={f} onClick={() => onFontSizeChange(f)} style={{ padding: '5px 10px', borderRadius: 7, border: '1px solid', fontSize: 10, fontWeight: 600, cursor: 'pointer', transition: 'all 0.13s', borderColor: fontSize===f?'#0d9488':'#1e293b', background: fontSize===f?'#042f2e':'#0f172a', color: fontSize===f?'#0d9488':'#64748b' }}>
                    {f}
                  </button>
                ))}
              </div>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>Line Spacing</div>
              <div style={{ display: 'flex', gap: 5 }}>
                {SPACING_PRESETS.map(sp => (
                  <button key={sp.id} onClick={() => onSpacingChange?.(sp.id)} style={{ flex: 1, padding: '6px 4px', borderRadius: 7, border: '1px solid', fontSize: 10, fontWeight: 600, cursor: 'pointer', transition: 'all 0.13s', borderColor: spacing===sp.id?'#0d9488':'#1e293b', background: spacing===sp.id?'#042f2e':'#0f172a', color: spacing===sp.id?'#0d9488':'#64748b' }}>
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
                  <button key={p} onClick={() => onPaperSizeChange?.(p)} style={{ flex: 1, padding: '6px 4px', borderRadius: 7, border: '1px solid', fontSize: 10, fontWeight: 600, cursor: 'pointer', transition: 'all 0.13s', borderColor: paperSize===p?'#0d9488':'#1e293b', background: paperSize===p?'#042f2e':'#0f172a', color: paperSize===p?'#0d9488':'#64748b' }}>
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

              <button onClick={handleExport} disabled={isExporting} style={{ width:'100%', background: isExporting ? '#1e293b' : 'linear-gradient(135deg,#0d9488,#0f766e)', color: isExporting?'#475569':'#fff', border:'none', borderRadius:8, padding:'10px 0', cursor: isExporting?'not-allowed':'pointer', fontSize:12, fontWeight:600, display:'flex', alignItems:'center', justifyContent:'center', gap:6, marginBottom:7, transition:'all 0.18s' }}>
                {isExporting ? 'Exporting…' : <><Download />{exportFormat==='pdf'?'Download PDF':exportFormat==='word'?'Download Word':'Download Both'}</>}
              </button>

              {exportFormat === 'both' && (
                <div style={{ display:'flex', gap:5, marginBottom:7 }}>
                  <button onClick={()=>onDownloadPDF?.()} disabled={pdfLoading} style={{ flex:1, padding:'7px 0', borderRadius:7, border:'1px solid #1e293b', background:'#0f172a', color:'#64748b', fontSize:10, fontWeight:600, cursor:'pointer' }}>{pdfLoading?'…':'PDF only'}</button>
                  <button onClick={()=>onDownloadWord?.()} disabled={wordLoading} style={{ flex:1, padding:'7px 0', borderRadius:7, border:'1px solid #1e293b', background:'#0f172a', color:'#64748b', fontSize:10, fontWeight:600, cursor:'pointer' }}>{wordLoading?'…':'Word only'}</button>
                </div>
              )}

              <button onClick={handleCopyLink} style={{ width:'100%', padding:'8px 0', borderRadius:8, border:`1px solid ${copyDone?'#166534':'#1e293b'}`, background: copyDone?'#052e16':'#0f172a', color: copyDone?'#4ade80':'#64748b', fontSize:11, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:5, transition:'all 0.18s' }}>
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
  wrap:    { height:'100%', overflowY:'auto', background:'#0a0e1a', display:'flex', flexDirection:'column', fontFamily:"'Inter','Segoe UI',sans-serif" },
  sec:     { borderBottom:'1px solid #0f172a' },
  secHdr:  { width:'100%', display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 16px', background:'none', border:'none', cursor:'pointer', textAlign:'left' },
  secTtl:  { fontSize:10, fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.06em' },
  themeBtn:{ width:'100%', display:'flex', justifyContent:'space-between', alignItems:'center', padding:'11px 16px', background:'#0f172a', border:'none', borderBottom:'1px solid #1e293b', cursor:'pointer', textAlign:'left' },
};

export default TemplateSelector;
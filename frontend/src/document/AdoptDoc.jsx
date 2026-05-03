import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Document, Packer, Paragraph, TextRun, AlignmentType, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';
import { useAuth } from '../../context/AuthContext';

import Sidebar from '../../components/common/Sidebar';
import Navbar from '../../components/common/Navbar';

import CustomizationPanel from '../../components/customization/CustomizationPanel';
import DocumentEditor from '../../components/document/DocumentEditor';
import DocumentPreview from '../../components/document/DocumentPreview';
import TemplateSelector from '../../components/template/TemplateSelector';

import CVPreview from '../../components/document/CVPreview';
import CoverLetterPreview from '../../components/document/CoverLetterPreview';
import ProposalPreview from '../../components/document/ProposalPreview';

import HomeTab from '../../pages/dashboard/HomeTab';

import { generateDocumentAI } from '../../services/aiService';

/* ─── PDF lib loader (unchanged) ─── */
async function loadPdfLibs() {
  const load = (src) =>
    new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = src; s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  if (!window.html2canvas)
    await load('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
  if (!window.jspdf)
    await load('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
}

const safe = (val) => {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object') return val.label || val.value || val.name || val.school || val.degree || '';
  return String(val);
};

const mapAICvToPreview = (content) => ({
  name: safe(content?.basics?.name),
  phone: safe(content?.basics?.phone),
  email1: safe(content?.basics?.email),
  email2: safe(content?.basics?.email2),
  linkedin: safe(content?.basics?.linkedin),
  title: safe(content?.basics?.title || content?.basics?.role || content?.basics?.headline),
  location: safe(content?.basics?.location || content?.basics?.address || content?.basics?.city),
  summary: safe(content?.basics?.summary),
  skills: Array.isArray(content?.skills) ? content.skills.map(safe).filter(Boolean) : [],
  education: Array.isArray(content?.education)
    ? content.education.map((edu) =>
        typeof edu === 'string' ? edu
          : [safe(edu.degree), safe(edu.institution || edu.school || edu.university),
             safe(edu.date || edu.year || edu.graduationDate)].filter(Boolean).join(' - ')
      ).filter(Boolean)
    : [],
  experience: Array.isArray(content?.work)
    ? content.work.map((job) => ({
        company: safe(job.company),
        period: safe(job.period || job.duration || job.dates),
        role: safe(job.role || job.position || job.jobTitle),
        bullets: Array.isArray(job.bullets) ? job.bullets.map(safe).filter(Boolean)
          : Array.isArray(job.achievements) ? job.achievements.map(safe).filter(Boolean)
          : job.description ? [safe(job.description)] : [],
      }))
    : [],
  projects: Array.isArray(content?.projects) ? content.projects.map(safe).filter(Boolean) : [],
  certifications: Array.isArray(content?.certifications) ? content.certifications.map(safe).filter(Boolean) : [],
  references: safe(content?.references) || 'Available upon request',
});

/* ══════════════════════════════════════════════════
   FIELD CATALOGUE
══════════════════════════════════════════════════ */
const FIELD_CATALOGUE = {
  cv: [
    { key: 'name',          label: 'Full Name',      icon: '👤', placeholder: 'e.g. Jane Doe',                  type: 'input',    core: true  },
    { key: 'email1',        label: 'Email',          icon: '📧', placeholder: 'jane@example.com',               type: 'input',    core: true  },
    { key: 'phone',         label: 'Phone',          icon: '📞', placeholder: '+254 700 000 000',               type: 'input',    core: false },
    { key: 'linkedin',      label: 'LinkedIn',       icon: '🔗', placeholder: 'linkedin.com/in/janedoe',        type: 'input',    core: false },
    { key: 'title',         label: 'Job Title',      icon: '💼', placeholder: 'e.g. Senior Designer',           type: 'input',    core: false },
    { key: 'location',      label: 'Location',       icon: '📍', placeholder: 'e.g. Nairobi, Kenya',            type: 'input',    core: false },
    { key: 'summary',       label: 'Summary',        icon: '📝', placeholder: 'Professional summary…',          type: 'textarea', core: false },
    { key: 'skills',        label: 'Skills',         icon: '⚡', placeholder: 'React, Figma, Node.js…',         type: 'tags',     core: false },
    { key: 'education',     label: 'Education',      icon: '🎓', placeholder: 'BSc CS - MIT - 2020',            type: 'tags',     core: false },
    { key: 'experience',    label: 'Experience',     icon: '🏢', placeholder: 'Describe your experience…',      type: 'textarea', core: false },
    { key: 'projects',      label: 'Projects',       icon: '🚀', placeholder: 'Project name, description…',    type: 'tags',     core: false },
    { key: 'certifications',label: 'Certifications', icon: '🏅', placeholder: 'AWS Certified, PMP…',           type: 'tags',     core: false },
    { key: 'references',    label: 'References',     icon: '👥', placeholder: 'Available upon request',         type: 'input',    core: false },
  ],
  cover_letter: [
    { key: 'senderName',      label: 'Your Name',       icon: '👤', placeholder: 'e.g. Jane Doe',              type: 'input',    core: true  },
    { key: 'senderEmail',     label: 'Your Email',      icon: '📧', placeholder: 'jane@example.com',           type: 'input',    core: true  },
    { key: 'senderTitle',     label: 'Your Title',      icon: '💼', placeholder: 'e.g. Software Engineer',     type: 'input',    core: false },
    { key: 'senderLocation',  label: 'Your Location',   icon: '📍', placeholder: 'e.g. Nairobi, Kenya',        type: 'input',    core: false },
    { key: 'companyName',     label: 'Company',         icon: '🏢', placeholder: 'Company applying to…',      type: 'input',    core: false },
    { key: 'recipientName',   label: 'Hiring Manager',  icon: '🤝', placeholder: 'e.g. Hiring Manager',       type: 'input',    core: false },
    { key: 'subject',         label: 'Subject Line',    icon: '📌', placeholder: 'Application for…',          type: 'input',    core: false },
    { key: 'body1',           label: 'Opening Paragraph',icon: '✍️', placeholder: 'Introduce yourself…',       type: 'textarea', core: false },
    { key: 'body2',           label: 'Main Paragraph',  icon: '📝', placeholder: 'Your key experience…',      type: 'textarea', core: false },
    { key: 'body3',           label: 'Closing Paragraph',icon: '🎯', placeholder: 'Why this role/company…',   type: 'textarea', core: false },
    { key: 'date',            label: 'Date',            icon: '📅', placeholder: 'e.g. March 2026',           type: 'input',    core: false },
    { key: 'signature',       label: 'Signature Name',  icon: '✒️', placeholder: 'Your full name',            type: 'input',    core: false },
  ],
  business_proposal: [
    { key: 'title',            label: 'Project Title',     icon: '📋', placeholder: 'e.g. AI Platform Development', type: 'input',    core: true  },
    { key: 'preparedFor',      label: 'Prepared For',      icon: '🏢', placeholder: 'Client / company name',        type: 'input',    core: true  },
    { key: 'preparedBy',       label: 'Prepared By',       icon: '👤', placeholder: 'Your name or company',         type: 'input',    core: false },
    { key: 'executiveSummary', label: 'Executive Summary', icon: '📝', placeholder: 'High-level overview…',         type: 'textarea', core: false },
    { key: 'problemStatement', label: 'Problem Statement', icon: '❓', placeholder: 'Problem being solved…',        type: 'textarea', core: false },
    { key: 'proposedSolution', label: 'Proposed Solution', icon: '💡', placeholder: 'Your solution…',               type: 'textarea', core: false },
    { key: 'budget',           label: 'Budget',            icon: '💰', placeholder: 'e.g. KES 850,000',             type: 'input',    core: false },
    { key: 'validity',         label: 'Validity',          icon: '📅', placeholder: 'e.g. 30 days from issue',      type: 'input',    core: false },
    { key: 'closingNote',      label: 'Closing Note',      icon: '✒️', placeholder: 'Closing remarks…',             type: 'textarea', core: false },
    { key: 'contactName',      label: 'Contact Name',      icon: '🤝', placeholder: 'Your contact name',            type: 'input',    core: false },
    { key: 'contactEmail',     label: 'Contact Email',     icon: '📧', placeholder: 'contact@example.com',          type: 'input',    core: false },
  ],
};

/* ══════════════════════════════════════════════════
   ICONS
══════════════════════════════════════════════════ */
const SparkleIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
  </svg>
);
const SaveIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
    <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
  </svg>
);
const PdfIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
  </svg>
);
const EyeIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const EditIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

/* ══════════════════════════════════════════════════
   FIELD PICKER
══════════════════════════════════════════════════ */
const FieldPicker = ({ catalogue, activeKeys, onToggle }) => {
  const optional = catalogue.filter((f) => !f.core);
  return (
    <div style={fp.wrap}>
      <p style={fp.hint}>Add fields to your document</p>
      <div style={fp.grid}>
        {optional.map((f) => {
          const on = activeKeys.includes(f.key);
          return (
            <button
              key={f.key}
              style={{ ...fp.chip, ...(on ? fp.on : fp.off) }}
              onClick={() => onToggle(f.key)}
            >
              <span style={{ fontSize: 13 }}>{f.icon}</span>
              <span>{f.label}</span>
              <span style={{ ...fp.badge, ...(on ? fp.badgeOn : fp.badgeOff) }}>
                {on ? '✓' : '+'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const fp = {
  wrap:     { padding: '16px 20px 18px', background: '#f8fafc', borderBottom: '1px solid #edf0f4' },
  hint:     { margin: '0 0 11px', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em' },
  grid:     { display: 'flex', flexWrap: 'wrap', gap: 7 },
  chip:     { display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 10px 5px 8px', borderRadius: 20, border: '1.5px solid', cursor: 'pointer', fontSize: 12, fontWeight: 500, background: 'none', outline: 'none', transition: 'all 0.14s', userSelect: 'none', lineHeight: 1 },
  on:       { borderColor: '#1e3a5f', background: '#eef2f9', color: '#1e3a5f' },
  off:      { borderColor: '#e2e8f0', background: '#ffffff',  color: '#64748b' },
  badge:    { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 16, height: 16, borderRadius: '50%', fontSize: 10, fontWeight: 700 },
  badgeOn:  { background: '#1e3a5f', color: '#fff' },
  badgeOff: { background: '#e2e8f0', color: '#64748b' },
};

/* ══════════════════════════════════════════════════
   FIELD ROW
══════════════════════════════════════════════════ */
const FieldRow = ({ field, value, onChange, onRemove }) => {
  const isTextarea = field.type === 'textarea';
  const isTags     = field.type === 'tags';

  /*
   * TAGS FIX — keep a local raw string while typing so spaces work normally.
   * We split into an array only on blur, never mid-keystroke.
   * When the parent value changes externally (e.g. AI fill) we sync back.
   */
  const toRaw = (v) => Array.isArray(v) ? v.join(', ') : (v || '');
  const [rawTags, setRawTags] = useState(() => toRaw(value));
  const prevTagValue = useRef(value);
  useEffect(() => {
    if (isTags && prevTagValue.current !== value) {
      setRawTags(toRaw(value));
      prevTagValue.current = value;
    }
  }, [value, isTags]);

  const commitTags = () => {
    onChange(rawTags.split(',').map(s => s.trim()).filter(Boolean));
  };

  return (
    <div style={fr.wrap}>
      <div style={fr.header}>
        <label style={fr.label}>
          <span style={{ fontSize: 14, marginRight: 7 }}>{field.icon}</span>
          {field.label}
          {field.core && <span style={fr.badge}>required</span>}
        </label>
        {!field.core && (
          <button style={fr.removeBtn}
            onClick={onRemove}
            onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
            onMouseLeave={e => e.currentTarget.style.color = '#cbd5e1'}
          >✕</button>
        )}
      </div>

      {isTextarea ? (
        /* Textarea — controlled, spaces always work */
        <textarea
          style={fr.textarea}
          placeholder={field.placeholder}
          value={value || ''}
          onChange={e => onChange(e.target.value)}
        />
      ) : isTags ? (
        /* Tags — local raw string, parsed only on blur */
        <>
          <input
            style={fr.input}
            placeholder={field.placeholder}
            value={rawTags}
            onChange={e => setRawTags(e.target.value)}
            onBlur={commitTags}
          />
          <p style={fr.hint}>Separate with commas</p>
        </>
      ) : (
        /* Plain input — controlled, spaces always work */
        <input
          style={fr.input}
          placeholder={field.placeholder}
          value={value || ''}
          onChange={e => onChange(e.target.value)}
        />
      )}
    </div>
  );
};

const fr = {
  wrap:      { padding: '13px 20px', borderBottom: '1px solid #f1f5f9' },
  header:    { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 },
  label:     { display: 'flex', alignItems: 'center', fontSize: 12, fontWeight: 600, color: '#334155' },
  badge:     { marginLeft: 8, fontSize: 9, fontWeight: 700, color: '#0369a1', background: '#e0f2fe', padding: '2px 7px', borderRadius: 10, textTransform: 'uppercase', letterSpacing: '0.05em' },
  removeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1', fontSize: 13, padding: '2px 5px', borderRadius: 4, lineHeight: 1, transition: 'color 0.12s' },
  input:     { width: '100%', padding: '9px 13px', border: '1.5px solid #e2e8f0', borderRadius: 9, fontSize: 13, color: '#0f172a', background: '#fff', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', transition: 'border-color 0.15s' },
  textarea:  { width: '100%', padding: '9px 13px', border: '1.5px solid #e2e8f0', borderRadius: 9, fontSize: 13, color: '#0f172a', background: '#fff', outline: 'none', resize: 'vertical', minHeight: 88, boxSizing: 'border-box', fontFamily: 'inherit', transition: 'border-color 0.15s' },
  hint:      { margin: '5px 0 0', fontSize: 11, color: '#94a3b8' },
};

/* ══════════════════════════════════════════════════
   TAB BAR (for right panel: Preview / Style / Template)
══════════════════════════════════════════════════ */
const RightPanelTabs = ({ active, onChange }) => {
  const tabs = [
    { id: 'preview',   label: 'Preview',   icon: <EyeIcon /> },
    { id: 'style',     label: 'Style',     icon: <EditIcon /> },
    { id: 'templates', label: 'Templates', icon: <span style={{ fontSize: 13 }}>🎨</span> },
  ];
  return (
    <div style={rpt.bar}>
      {tabs.map(t => (
        <button
          key={t.id}
          style={{ ...rpt.tab, ...(active === t.id ? rpt.active : rpt.inactive) }}
          onClick={() => onChange(t.id)}
        >
          {t.icon}
          {t.label}
        </button>
      ))}
    </div>
  );
};

const rpt = {
  bar:     { display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#fff', padding: '0 20px', gap: 2, flexShrink: 0 },
  tab:     { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '12px 14px', fontSize: 13, fontWeight: 500, border: 'none', background: 'none', cursor: 'pointer', borderBottom: '2px solid transparent', marginBottom: -1, transition: 'color 0.15s, border-color 0.15s' },
  active:  { color: '#1e3a5f', borderBottomColor: '#1e3a5f' },
  inactive:{ color: '#94a3b8' },
};

/* ════════════════════════════════════════
   MAIN DASHBOARD
════════════════════════════════════════ */
const DashboardPage = () => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const [activeTab,       setActiveTab]       = useState('home');
  const [sidebarOpen,     setSidebarOpen]     = useState(true);
  const [documents,       setDocuments]       = useState([]);
  const [loadingDocuments,setLoadingDocuments]= useState(false);

  const previewRef = useRef(null);

  const [category,    setCategory]    = useState('CV');
  const [theme,       setTheme]       = useState('Modern');
  const [fontSize,    setFontSize]    = useState('12 pt');
  const [accentColor, setAccentColor] = useState('#1e3a5f');
  const [editMode,    setEditMode]    = useState(false);

  /* which right-panel tab is open: 'preview' | 'style' | 'templates' */
  const [rightTab, setRightTab] = useState('preview');

  const [cvData,          setCvData]          = useState({
    name: '', phone: '', email1: '', email2: '', linkedin: '', title: '',
    location: '', summary: '', skills: [], education: [], experience: [],
    projects: [], certifications: [], references: ''
  });
  const [coverLetterData, setCoverLetterData] = useState({
    senderName: '', senderTitle: '', senderLocation: '', senderEmail: '',
    date: '', recipientName: '', recipientTitle: '',
    companyName: '', companyLocation: '',
    subject: '', opening: '',
    body1: '', body2: '', body3: '', closing: '',
    signoff: 'Sincerely,', signature: '',
  });
  const [proposalData,    setProposalData]    = useState({
    title: '', subtitle: 'Technical Proposal',
    preparedBy: '', preparedFor: '',
    date: '', version: 'v1.0',
    executiveSummary: '', problemStatement: '', proposedSolution: '',
    deliverables: [],
    timeline: [],
    budget: '', validity: '',
    closingNote: '', contactName: '', contactEmail: '',
  });

  const [aiLoading,     setAiLoading]     = useState(false);
  const [pdfLoading,    setPdfLoading]    = useState(false);
  const [wordLoading,   setWordLoading]   = useState(false);

  const [activeFieldKeys, setActiveFieldKeys] = useState({
    cv:                [],
    cover_letter:      [],
    business_proposal: [],
  });

  const docType =
    category === 'CV'            ? 'cv'
    : category === 'Cover Letter'  ? 'cover_letter'
    : 'business_proposal';

  const currentFields =
    docType === 'cv'            ? cvData
    : docType === 'cover_letter'  ? coverLetterData
    : proposalData;

  const updateField = (field, value) => {
    if      (docType === 'cv')           setCvData(p => ({ ...p, [field]: value }));
    else if (docType === 'cover_letter') setCoverLetterData(p => ({ ...p, [field]: value }));
    else                                  setProposalData(p => ({ ...p, [field]: value }));
  };

  const toggleField = (key) => {
    setActiveFieldKeys(prev => {
      const cur  = prev[docType] || [];
      const next = cur.includes(key) ? cur.filter(k => k !== key) : [...cur, key];
      return { ...prev, [docType]: next };
    });
  };

  useEffect(() => { loadDocuments(); }, []);
  useEffect(() => { if (activeTab === 'documents') loadDocuments(); }, [activeTab]);

  const loadDocuments = () => {
    try {
      setLoadingDocuments(true);
      setDocuments(JSON.parse(localStorage.getItem('adaptdoc_documents') || '[]'));
    } catch { setDocuments([]); }
    finally   { setLoadingDocuments(false); }
  };

  /* ── handlers ── */
  const handleGenerate = async () => {
    try {
      setAiLoading(true);
      const res = await generateDocumentAI(docType, currentFields);
      if (docType === 'cv' && res.content) {
        setCvData(p => ({ ...p, ...mapAICvToPreview(res.content) }));
      } else if (docType === 'cover_letter') {
        // AI returns a text block — split it across the body paragraphs
        const text = res.document || res.generatedText || res.message || '';
        const parts = text.split('\n\n').filter(Boolean);
        setCoverLetterData(p => ({
          ...p,
          body1: parts[0] || p.body1,
          body2: parts[1] || p.body2,
          body3: parts[2] || p.body3,
          closing: parts[3] || p.closing,
        }));
      } else if (docType === 'business_proposal') {
        const text = res.document || res.generatedText || res.message || '';
        setProposalData(p => ({ ...p, executiveSummary: text }));
      }
    } catch (error) {
      alert(error.response?.data?.error || 'AI generation failed');
    } finally { setAiLoading(false); }
  };

  const handleSaveDraft = () => {
    const draft = { id: Date.now().toString(), cvData, coverLetterData, proposalData, theme, fontSize, accentColor, category, savedAt: new Date().toLocaleString(), type: category.toLowerCase().replace(' ', '_'), title: `${category} - ${new Date().toLocaleDateString()}` };
    const existing = JSON.parse(localStorage.getItem('adaptdoc_documents') || '[]');
    localStorage.setItem('adaptdoc_documents', JSON.stringify([draft, ...existing]));
    setDocuments([draft, ...existing]);
    alert(`${category} draft saved successfully!`);
  };

  const handleDeleteDocument = (id) => {
    const updated = documents.filter(d => d.id !== id);
    localStorage.setItem('adaptdoc_documents', JSON.stringify(updated));
    setDocuments(updated);
  };

  const handleOpenDocument = (doc) => {
    if (doc.category)        setCategory(doc.category);
    if (doc.cvData)          setCvData(doc.cvData);
    if (doc.coverLetterData) setCoverLetterData(doc.coverLetterData);
    if (doc.proposalData)    setProposalData(doc.proposalData);
    setActiveTab('create');
  };

  const handleDownloadPDF = async () => {
    if (!previewRef.current) return;
    try {
      setPdfLoading(true);
      await loadPdfLibs();
      const canvas = await window.html2canvas(previewRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pw = pdf.internal.pageSize.getWidth(), ph = pdf.internal.pageSize.getHeight();
      const ih = (canvas.height * pw) / canvas.width;
      let left = ih, pos = 0;
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, pos, pw, ih);
      left -= ph;
      while (left > 0) { pos -= ph; pdf.addPage(); pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, pos, pw, ih); left -= ph; }
      pdf.save(`${docType}_document.pdf`);
    } catch { alert('PDF export failed'); }
    finally { setPdfLoading(false); }
  };

  const handleDownloadWord = async () => {
    try {
      setWordLoading(true);
      const doc = new Document({ sections: [{ properties: {}, children: [
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: cvData.name || '', bold: true, size: 36, color: '1e3a5f' })], spacing: { after: 80 } }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: cvData.title || '', size: 22, color: '555555' })], spacing: { after: 60 } }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${cvData.location || ''} | ${cvData.email1 || ''} | ${cvData.phone || ''}`, size: 18, color: '777777' })], spacing: { after: 200 } }),
        new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '1e3a5f' } }, spacing: { after: 160 } }),
        new Paragraph({ children: [new TextRun({ text: 'SUMMARY', bold: true, size: 22, color: '1e3a5f' })], spacing: { after: 80 } }),
        new Paragraph({ children: [new TextRun({ text: cvData.summary || '', size: 20, color: '333333' })], spacing: { after: 200 } }),
      ]}]});
      saveAs(await Packer.toBlob(doc), `${(cvData.name || 'document').replace(/\s+/g, '_')}_CV.docx`);
    } catch { alert('Word export failed'); }
    finally { setWordLoading(false); }
  };

  /* ── renderForm ── */
  const renderForm = () => {
    const catalogue  = FIELD_CATALOGUE[docType] || [];
    const activeKeys = activeFieldKeys[docType] || [];
    const visible    = catalogue.filter(f => f.core || activeKeys.includes(f.key));
    const getVal     = (key) => currentFields[key] ?? '';

    const handleChange = (field, raw) => {
      // CV experience is stored as an array of objects; all other fields are plain strings/arrays
      if (field.key === 'experience' && docType === 'cv' && typeof raw === 'string') {
        updateField('experience', [{ company: '', period: '', role: raw, bullets: [] }]);
      } else {
        updateField(field.key, raw);
      }
    };

    return (
      <div>
        <FieldPicker catalogue={catalogue} activeKeys={activeKeys} onToggle={toggleField} />
        {visible.map(field => (
          <FieldRow
            key={field.key}
            field={field}
            value={getVal(field.key)}
            onChange={v => handleChange(field, v)}
            onRemove={() => toggleField(field.key)}
          />
        ))}
        {visible.length === catalogue.filter(f => f.core).length && (
          <div style={{ padding: '24px 20px', textAlign: 'center', color: '#b0bec5', fontSize: 13 }}>
            ↑ Select fields above to build your document
          </div>
        )}
      </div>
    );
  };

  const renderPreview = () => {
    if (category === 'Cover Letter') return <CoverLetterPreview data={coverLetterData} onDataChange={setCoverLetterData} theme={theme} fontSize={fontSize} accentColor={accentColor} editMode={editMode} />;
    if (category === 'Proposal')     return <ProposalPreview    data={proposalData}    onDataChange={setProposalData}    theme={theme} fontSize={fontSize} accentColor={accentColor} editMode={editMode} />;
    return                                  <CVPreview           data={cvData}          onDataChange={setCvData}          theme={theme} fontSize={fontSize} accentColor={accentColor} editMode={editMode} />;
  };

  const badgeBg = { cv: '#dbeafe', cover_letter: '#ccfbf1', business_proposal: '#fef9c3' };
  const badgeFg = { cv: '#1e40af', cover_letter: '#0d9488', business_proposal: '#92400e' };

  return (
    <div style={s.page}>
      <Sidebar activeTab={activeTab} onNavigate={setActiveTab} isOpen={sidebarOpen} user={user} onLogout={logoutUser} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Navbar onToggleSidebar={() => setSidebarOpen(p => !p)} user={user} onLogout={logoutUser} />

        <div style={s.content}>

          {/* ── HOME ── */}
          {activeTab === 'home' && (
            <HomeTab user={user} documents={documents} onNavigate={setActiveTab} loadingDocuments={loadingDocuments} />
          )}

          {/* ── CREATE ── */}
          {activeTab === 'create' && (
            <div style={s.createLayout}>

              {/* ═══ LEFT PANEL: type selector + field picker + inputs ═══ */}
              <div style={s.leftPanel}>

                {/* Doc type selector (from DocumentEditor) */}
                <div style={s.leftHeader}>
                  <DocumentEditor
                    category={category}
                    onCategoryChange={setCategory}
                    editMode={editMode}
                    onToggleEditMode={() => setEditMode(p => !p)}
                    onSaveDraft={handleSaveDraft}
                  />
                </div>

                {/* Scrollable field area */}
                <div style={s.formScroll}>
                  {renderForm()}
                </div>

                {/* Sticky action bar at bottom */}
                <div style={s.actionBar}>
                  <button
                    style={{ ...s.btnGenerate, ...(aiLoading ? s.btnDisabled : {}) }}
                    onClick={handleGenerate}
                    disabled={aiLoading}
                  >
                    <SparkleIcon />
                    {aiLoading ? 'Generating…' : 'Generate with AI'}
                  </button>
                  <div style={s.actionSecondary}>
                    <button style={s.btnIcon} onClick={handleSaveDraft} title="Save draft">
                      <SaveIcon />
                      <span>Save</span>
                    </button>
                    <button
                      style={{ ...s.btnIcon, ...(pdfLoading ? s.btnDisabled : {}) }}
                      onClick={handleDownloadPDF}
                      disabled={pdfLoading}
                      title="Download PDF"
                    >
                      <PdfIcon />
                      <span>{pdfLoading ? '…' : 'PDF'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* ═══ RIGHT PANEL: tabbed preview / style / templates ═══ */}
              <div style={s.rightPanel}>
                <RightPanelTabs active={rightTab} onChange={setRightTab} />

                <div style={s.rightContent}>
                  {/* Preview tab */}
                  {rightTab === 'preview' && (
                    <div style={s.previewWrap}>
                      <DocumentPreview
                        ref={previewRef}
                        editMode={editMode}
                        onToggleEditMode={() => setEditMode(p => !p)}
                      >
                        {renderPreview()}
                      </DocumentPreview>
                    </div>
                  )}

                  {/* Style tab */}
                  {rightTab === 'style' && (
                    <div style={s.panelScroll}>
                      <CustomizationPanel cvData={cvData} onCVUpdate={setCvData} />
                    </div>
                  )}

                  {/* Templates tab */}
                  {rightTab === 'templates' && (
                    <div style={s.panelScroll}>
                      <TemplateSelector
                        theme={theme}
                        onThemeChange={setTheme}
                        fontSize={fontSize}
                        onFontSizeChange={setFontSize}
                        accentColor={accentColor}
                        onAccentChange={setAccentColor}
                        onDownloadPDF={handleDownloadPDF}
                        pdfLoading={pdfLoading}
                        onDownloadWord={handleDownloadWord}
                        wordLoading={wordLoading}
                        thumbnail={renderPreview()}
                      />
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* ── DOCUMENTS ── */}
          {activeTab === 'documents' && (
            <div style={s.tabPage}>
              <div style={s.tabHeader}>
                <div>
                  <h2 style={s.tabTitle}>My Documents</h2>
                  <p style={s.tabSubtitle}>Manage and resume your saved work</p>
                </div>
                <button style={s.btnGenerate} onClick={() => setActiveTab('create')}>+ New Document</button>
              </div>

              {loadingDocuments && (
                <div style={s.emptyState}>
                  <div style={s.spinner} />
                  <p style={{ color: '#94a3b8', marginTop: 14, fontSize: 14 }}>Loading…</p>
                </div>
              )}

              {!loadingDocuments && documents.length === 0 && (
                <div style={s.emptyState}>
                  <div style={{ fontSize: 44, marginBottom: 14 }}>📄</div>
                  <h3 style={{ color: '#334155', fontWeight: 600, margin: '0 0 8px' }}>No documents yet</h3>
                  <p style={{ color: '#94a3b8', fontSize: 14, margin: '0 0 22px' }}>Create your first document to get started</p>
                  <button style={s.btnGenerate} onClick={() => setActiveTab('create')}>Create one now →</button>
                </div>
              )}

              {!loadingDocuments && documents.length > 0 && (
                <div style={s.docGrid}>
                  {documents.map(doc => {
                    const dt = doc.type || 'cv';
                    return (
                      <div key={doc.id} style={s.docCard}
                        onClick={() => handleOpenDocument(doc)}
                        onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,0.10)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)';    e.currentTarget.style.boxShadow='0 1px 4px rgba(0,0,0,0.06)'; }}
                      >
                        <div style={{ ...s.docCardTop, background: accentColor }}>
                          <span style={{ fontSize: 28 }}>{dt === 'cv' ? '📋' : dt === 'cover_letter' ? '✉️' : '💼'}</span>
                        </div>
                        <div style={s.docCardBody}>
                          <div style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: badgeBg[dt] || '#f1f5f9', color: badgeFg[dt] || '#475569', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {dt.replace('_', ' ')}
                          </div>
                          <div style={{ fontWeight: 600, color: '#1e293b', fontSize: 14, marginBottom: 4 }}>{doc.title}</div>
                          <div style={{ fontSize: 12, color: '#94a3b8' }}>Saved {doc.savedAt}</div>
                        </div>
                        <div style={s.docCardFooter}>
                          <button style={s.btnOpenDoc}   onClick={e => { e.stopPropagation(); handleOpenDocument(doc); }}>Open</button>
                          <button style={s.btnDeleteDoc} onClick={e => { e.stopPropagation(); handleDeleteDocument(doc.id); }}>Delete</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── SETTINGS ── */}
          {activeTab === 'settings' && (
            <div style={s.tabPage}>
              <div style={s.tabHeader}>
                <div>
                  <h2 style={s.tabTitle}>Settings</h2>
                  <p style={s.tabSubtitle}>Manage your account preferences</p>
                </div>
              </div>
              <div style={s.settingsCard}>
                <h3 style={{ color: '#0f172a', fontWeight: 700, fontSize: 16, margin: '0 0 20px' }}>Account Information</h3>
                {[{ label: 'Name', type: 'text', value: user?.name || user?.email || 'User' }, { label: 'Email', type: 'email', value: user?.email || '' }].map(f => (
                  <div key={f.label} style={{ marginBottom: 18 }}>
                    <label style={{ display: 'block', marginBottom: 6, color: '#475569', fontWeight: 600, fontSize: 13 }}>{f.label}</label>
                    <input type={f.type} value={f.value} readOnly style={{ width: '100%', padding: '9px 13px', border: '1.5px solid #e2e8f0', borderRadius: 9, fontSize: 13, color: '#64748b', background: '#f8fafc', boxSizing: 'border-box' }} />
                  </div>
                ))}
                <div style={{ height: 1, background: '#f1f5f9', margin: '22px 0' }} />
                <button onClick={() => { logoutUser(); navigate('/login'); }} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fef2f2', color: '#dc2626', border: '1.5px solid #fee2e2', padding: '9px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                  Sign Out
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════
   STYLES
════════════════════════════════════════ */
const s = {
  /* Shell */
  page:    { display: 'flex', minHeight: '100vh', fontFamily: "'Inter','Segoe UI',system-ui,sans-serif", background: '#f8fafc', color: '#0f172a' },
  content: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' },

  /* ── Create layout: two equal-ish columns ── */
  createLayout: {
    display: 'flex',
    flex: 1,
    minHeight: 0,
    height: '100%',
    /* left ~420px, right fills the rest */
  },

  /* Left panel */
  leftPanel: {
    width: 420,
    minWidth: 340,
    maxWidth: 480,
    display: 'flex',
    flexDirection: 'column',
    borderRight: '1px solid #e2e8f0',
    background: '#ffffff',
    overflow: 'hidden',
  },
  leftHeader: {
    /* DocumentEditor sits here — give it its own border-bottom space */
    flexShrink: 0,
  },
  formScroll: {
    flex: 1,
    overflowY: 'auto',
    /* extra bottom padding so last field isn't hidden behind action bar */
    paddingBottom: 8,
  },

  /* Action bar — sticky at base of left panel */
  actionBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '14px 20px',
    borderTop: '1px solid #e2e8f0',
    background: '#ffffff',
    flexShrink: 0,
  },
  actionSecondary: {
    display: 'flex',
    gap: 8,
    marginLeft: 'auto',
  },

  /* Right panel */
  rightPanel: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    overflow: 'hidden',
    background: '#f8fafc',
  },
  rightContent: {
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  previewWrap: {
    flex: 1,
    overflow: 'auto',
    padding: '24px',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  panelScroll: {
    flex: 1,
    overflow: 'auto',
  },

  /* ── Buttons ── */
  btnGenerate: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 7,
    background: '#1e3a5f',
    color: '#fff',
    border: 'none',
    padding: '10px 18px',
    borderRadius: 9,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  btnIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    background: 'transparent',
    color: '#475569',
    border: '1.5px solid #e2e8f0',
    padding: '8px 13px',
    borderRadius: 9,
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 500,
    whiteSpace: 'nowrap',
  },
  btnDisabled: { opacity: 0.5, cursor: 'not-allowed' },

  /* ── Tab pages (Documents, Settings) ── */
  tabPage:     { padding: '32px 40px', flex: 1, overflow: 'auto' },
  tabHeader:   { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, gap: 16, flexWrap: 'wrap' },
  tabTitle:    { color: '#0f172a', fontSize: 22, fontWeight: 700, margin: '0 0 4px', letterSpacing: '-0.01em' },
  tabSubtitle: { color: '#64748b', fontSize: 14, margin: 0 },

  /* ── Document cards ── */
  docGrid:      { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 },
  docCard:      { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column' },
  docCardTop:   { height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  docCardBody:  { padding: '14px 16px', flex: 1 },
  docCardFooter:{ display: 'flex', gap: 8, padding: '10px 16px', borderTop: '1px solid #f1f5f9' },
  btnOpenDoc:   { flex: 1, background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 0', fontSize: 12, fontWeight: 600, cursor: 'pointer' },
  btnDeleteDoc: { flex: 1, background: '#fef2f2', color: '#dc2626', border: '1px solid #fee2e2', borderRadius: 6, padding: '7px 0', fontSize: 12, fontWeight: 500, cursor: 'pointer' },

  /* ── Empty state ── */
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 20px', background: '#fff', borderRadius: 16, border: '1px dashed #cbd5e1', textAlign: 'center' },
  spinner:    { width: 32, height: 32, border: '3px solid #e2e8f0', borderTop: '3px solid #1e3a5f', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },

  /* ── Settings ── */
  settingsCard: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 28, maxWidth: 520 },
};

export default DashboardPage;

import { useState, useRef, useEffect, useCallback } from 'react';
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

import HomeTab from './HomeTab';
import AdminDashboardPage from '../admin/AdminDashboardPage';
import SettingsTab from './SettingsTab';

import { useDocuments } from '../../hooks/useDocuments';
import { useUI } from '../../hooks/useUI';
import { useAI } from '../../hooks/useAI';

async function loadPdfLibs() {
  const load = (src) =>
    new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = res;
      s.onerror = rej;
      document.head.appendChild(s);
    });

  if (!window.html2canvas) {
    await load('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
  }
  if (!window.jspdf) {
    await load('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
  }
}

const safe = (v) => {
  if (!v) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'object') return v.label || v.value || v.name || v.school || v.degree || '';
  return String(v);
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
    ? content.education
      .map((edu) =>
        typeof edu === 'string'
          ? edu
          : [
            safe(edu.degree),
            safe(edu.institution || edu.school || edu.university),
            safe(edu.date || edu.year || edu.graduationDate),
          ]
            .filter(Boolean)
            .join(' - ')
      )
      .filter(Boolean)
    : [],
  experience: Array.isArray(content?.work)
    ? content.work.map((job) => ({
      company: safe(job.company),
      period: safe(job.period || job.duration || job.dates),
      role: safe(job.role || job.position || job.jobTitle),
      bullets: Array.isArray(job.bullets)
        ? job.bullets.map(safe).filter(Boolean)
        : Array.isArray(job.achievements)
          ? job.achievements.map(safe).filter(Boolean)
          : job.description
            ? [safe(job.description)]
            : [],
    }))
    : [],
  projects: Array.isArray(content?.projects) ? content.projects.map(safe).filter(Boolean) : [],
  certifications: Array.isArray(content?.certifications)
    ? content.certifications.map(safe).filter(Boolean)
    : [],
  references: safe(content?.references) || 'Available upon request',
});

const FIELD_CATALOGUE = {
  cv: [
    { key: 'name', label: 'Full Name', placeholder: 'e.g. Jane Doe', type: 'input', core: true },
    { key: 'email1', label: 'Email', placeholder: 'jane@example.com', type: 'input', core: true },
    { key: 'phone', label: 'Phone', placeholder: '+254 700 000 000', type: 'input', core: false },
    { key: 'linkedin', label: 'LinkedIn', placeholder: 'linkedin.com/in/janedoe', type: 'input', core: false },
    { key: 'title', label: 'Job Title', placeholder: 'e.g. Senior Designer', type: 'input', core: false },
    { key: 'location', label: 'Location', placeholder: 'e.g. Nairobi, Kenya', type: 'input', core: false },
    { key: 'summary', label: 'Summary', placeholder: 'Professional summary…', type: 'textarea', core: false },
    { key: 'skills', label: 'Skills', placeholder: 'React, Figma, Node.js…', type: 'tags', core: false },
    { key: 'education', label: 'Education', placeholder: 'BSc CS - MIT - 2020', type: 'tags', core: false },
    { key: 'experience', label: 'Experience', placeholder: 'Role · Company · Period\nbullets…', type: 'textarea', core: false },
    { key: 'projects', label: 'Projects', placeholder: 'Project name, description…', type: 'tags', core: false },
    { key: 'certifications', label: 'Certifications', placeholder: 'AWS Certified, PMP…', type: 'tags', core: false },
    { key: 'references', label: 'References', placeholder: 'Available upon request', type: 'input', core: false },
  ],
  cover_letter: [
    { key: 'senderName', label: 'Your Name', placeholder: 'e.g. Jane Doe', type: 'input', core: true },
    { key: 'senderEmail', label: 'Your Email', placeholder: 'jane@example.com', type: 'input', core: true },
    { key: 'senderTitle', label: 'Your Title', placeholder: 'e.g. Software Engineer', type: 'input', core: false },
    { key: 'senderLocation', label: 'Your Location', placeholder: 'e.g. Nairobi, Kenya', type: 'input', core: false },
    { key: 'companyName', label: 'Company', placeholder: 'Company applying to…', type: 'input', core: false },
    { key: 'recipientName', label: 'Hiring Manager', placeholder: 'e.g. Hiring Manager', type: 'input', core: false },
    { key: 'subject', label: 'Subject Line', placeholder: 'Application for…', type: 'input', core: false },
    { key: 'body1', label: 'Opening Paragraph', placeholder: 'Introduce yourself…', type: 'textarea', core: false },
    { key: 'body2', label: 'Main Paragraph', placeholder: 'Your key experience…', type: 'textarea', core: false },
    { key: 'body3', label: 'Closing Paragraph', placeholder: 'Why this role/company…', type: 'textarea', core: false },
    { key: 'date', label: 'Date', placeholder: 'e.g. March 2026', type: 'input', core: false },
    { key: 'signature', label: 'Signature Name', placeholder: 'Your full name', type: 'input', core: false },
  ],
  business_proposal: [
    { key: 'title', label: 'Project Title', placeholder: 'e.g. AI Platform Development', type: 'input', core: true },
    { key: 'preparedFor', label: 'Prepared For', placeholder: 'Client / company name', type: 'input', core: true },
    { key: 'preparedBy', label: 'Prepared By', placeholder: 'Your name or company', type: 'input', core: false },
    { key: 'executiveSummary', label: 'Executive Summary', placeholder: 'High-level overview…', type: 'textarea', core: false },
    { key: 'problemStatement', label: 'Problem Statement', placeholder: 'Problem being solved…', type: 'textarea', core: false },
    { key: 'proposedSolution', label: 'Proposed Solution', placeholder: 'Your solution…', type: 'textarea', core: false },
    { key: 'budget', label: 'Budget', placeholder: 'e.g. KES 850,000', type: 'input', core: false },
    { key: 'validity', label: 'Validity', placeholder: 'e.g. 30 days from issue', type: 'input', core: false },
    { key: 'closingNote', label: 'Closing Note', placeholder: 'Closing remarks…', type: 'textarea', core: false },
    { key: 'contactName', label: 'Contact Name', placeholder: 'Your contact name', type: 'input', core: false },
    { key: 'contactEmail', label: 'Contact Email', placeholder: 'contact@example.com', type: 'input', core: false },
  ],
};

const SparkleIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
  </svg>
);

const SaveIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);

const PdfIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="12" y1="18" x2="12" y2="12" />
    <line x1="9" y1="15" x2="15" y2="15" />
  </svg>
);

const EyeIcon = () => (
  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EditIcon = () => (
  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const ThemeIcon = () => (
  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a10 10 0 0 1 0 20" />
    <path d="M12 8a4 4 0 0 1 0 8" />
  </svg>
);

const FieldPicker = ({ catalogue, activeKeys, onToggle }) => {
  const optional = catalogue.filter((f) => !f.core);

  return (
    <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', background: 'var(--card-bg)' }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12, fontFamily: "'Inter', sans-serif" }}>
        Add Optional Fields
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {optional.map((f) => {
          const on = activeKeys.includes(f.key);
          return (
            <button
              key={f.key}
              className="premium-field-chip"
              onClick={() => onToggle(f.key)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 24,
                border: '1px solid',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 500,
                lineHeight: 1,
                userSelect: 'none',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                borderColor: on ? 'var(--accent-color)' : 'var(--border-color)',
                background: on ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                color: on ? 'var(--accent-color)' : 'var(--text-secondary)',
                boxShadow: on ? '0 0 10px rgba(59, 130, 246, 0.15)' : 'none',
              }}
            >
              <span>{f.label}</span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  fontSize: 10,
                  fontWeight: 600,
                  background: on ? 'var(--accent-color)' : 'var(--border-color)',
                  color: '#fff',
                  transition: 'background 0.2s',
                }}
              >
                {on ? '✓' : '+'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const FieldRow = ({ field, value, onChange, onRemove }) => {
  const isTextarea = field.type === 'textarea';
  const isTags = field.type === 'tags';

  const toRaw = (v) => (Array.isArray(v) ? v.join(', ') : v || '');
  const [rawTags, setRawTags] = useState(() => toRaw(value));
  const prev = useRef(value);

  useEffect(() => {
    if (isTags && prev.current !== value) {
      setRawTags(toRaw(value));
      prev.current = value;
    }
  }, [value, isTags]);

  const commitTags = () => onChange(rawTags.split(',').map((s) => s.trim()).filter(Boolean));

  return (
    <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-color)', transition: 'background 0.3s' }} className="premium-field-row">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <label style={{ display: 'flex', alignItems: 'center', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', gap: 8, fontFamily: "'Inter', sans-serif" }}>
          {field.label}
          {field.core && (
            <span style={{ fontSize: 10, fontWeight: 600, color: '#3b82f6', background: 'rgba(59, 130, 246, 0.15)', padding: '2px 8px', borderRadius: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Required
            </span>
          )}
        </label>

        {!field.core && (
          <button
            onClick={onRemove}
            className="premium-remove-btn"
            title="Remove field"
          >
            ✕
          </button>
        )}
      </div>

      <div className="premium-input-wrapper">
        {isTextarea ? (
          <textarea className="premium-input" placeholder={field.placeholder} value={value || ''} onChange={(e) => onChange(e.target.value)} />
        ) : isTags ? (
          <>
            <input className="premium-input" placeholder={field.placeholder} value={rawTags} onChange={(e) => setRawTags(e.target.value)} onBlur={commitTags} />
            <p style={{ margin: '6px 0 0', fontSize: 11, color: '#64748b' }}>Separate with commas</p>
          </>
        ) : (
          <input className="premium-input" placeholder={field.placeholder} value={value || ''} onChange={(e) => onChange(e.target.value)} />
        )}
      </div>
    </div>
  );
};

const RightPanelTabs = ({ active, onChange }) => {
  const tabs = [
    { id: 'preview', label: 'Preview', icon: <EyeIcon /> },
    { id: 'style', label: 'AI Edit', icon: <EditIcon /> },
    { id: 'templates', label: 'Templates', icon: <ThemeIcon /> },
  ];

  return (
    <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-color)', padding: '0 20px', gap: 0, flexShrink: 0 }}>
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '12px 16px',
            fontSize: 12,
            fontWeight: 500,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            borderBottom: active === t.id ? '2px solid var(--accent-color)' : '2px solid transparent',
            color: active === t.id ? 'var(--accent-color)' : 'var(--text-secondary)',
            marginBottom: -1,
            transition: 'color 0.15s, border-color 0.15s',
            fontFamily: 'inherit',
          }}
        >
          {t.icon}
          {t.label}
        </button>
      ))}
    </div>
  );
};

const DashboardPage = () => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const { activeTab, setActiveTab, sidebarOpen, setSidebarOpen } = useUI();
  const { documents, loadingDocuments, loadDocuments, saveDocument, deleteDocument } = useDocuments();
  const { aiLoading, handleGenerate } = useAI();

  const previewRef = useRef(null);

  const [category, setCategory] = useState('CV');
  const [theme, setTheme] = useState('Modern');
  const [fontSize, setFontSize] = useState('12 pt');
  const [fontFamily, setFontFamily] = useState('Inter');
  const [accentColor, setAccentColor] = useState('#2563eb');
  const [spacing, setSpacing] = useState('normal');
  const [paperSize, setPaperSize] = useState('A4');
  const [showPageNumbers, setShowPageNumbers] = useState(false);
  const [showWatermark, setShowWatermark] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [rightTab, setRightTab] = useState('preview');
  const [createStep, setCreateStep] = useState('input');

  const [cvData, setCvData] = useState({
    name: '',
    phone: '',
    email1: '',
    email2: '',
    linkedin: '',
    title: '',
    location: '',
    summary: '',
    skills: [],
    education: [],
    experience: [],
    projects: [],
    certifications: [],
    references: '',
  });

  const [coverLetterData, setCoverLetterData] = useState({
    senderName: '',
    senderTitle: '',
    senderLocation: '',
    senderEmail: '',
    date: '',
    recipientName: '',
    recipientTitle: '',
    companyName: '',
    companyLocation: '',
    subject: '',
    opening: '',
    body1: '',
    body2: '',
    body3: '',
    closing: '',
    signoff: 'Sincerely,',
    signature: '',
  });

  const [proposalData, setProposalData] = useState({
    title: '',
    subtitle: 'Technical Proposal',
    preparedBy: '',
    preparedFor: '',
    date: '',
    version: 'v1.0',
    executiveSummary: '',
    problemStatement: '',
    proposedSolution: '',
    deliverables: [],
    timeline: [],
    budget: '',
    validity: '',
    closingNote: '',
    contactName: '',
    contactEmail: '',
  });

  const [pdfLoading, setPdfLoading] = useState(false);
  const [wordLoading, setWordLoading] = useState(false);

  const [activeFieldKeys, setActiveFieldKeys] = useState({
    cv: [],
    cover_letter: [],
    business_proposal: [],
  });

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  useEffect(() => {
    if (activeTab === 'documents' || activeTab === 'home') {
      loadDocuments();
    }
  }, [activeTab, loadDocuments]);

  const docType =
    category === 'CV'
      ? 'cv'
      : category === 'Cover Letter'
        ? 'cover_letter'
        : 'business_proposal';

  const currentFields =
    docType === 'cv'
      ? cvData
      : docType === 'cover_letter'
        ? coverLetterData
        : proposalData;

  const updateField = (field, value) => {
    if (docType === 'cv') setCvData((p) => ({ ...p, [field]: value }));
    else if (docType === 'cover_letter') setCoverLetterData((p) => ({ ...p, [field]: value }));
    else setProposalData((p) => ({ ...p, [field]: value }));
  };

  const toggleField = (key) => {
    setActiveFieldKeys((prev) => {
      const cur = prev[docType] || [];
      const next = cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key];
      return { ...prev, [docType]: next };
    });
  };

  const onGenerateAI = async () => {
    await handleGenerate({
      docType,
      currentFields,
      setCvData,
      setCoverLetterData,
      setProposalData,
      mapAICvToPreview,
    });
  };

  const handleSaveDraft = async () => {
    const payload = {
      title: `${category} — ${new Date().toLocaleDateString()}`,
      type: docType,
      category,
      content: currentFields,
      theme,
      fontSize,
      fontFamily,
      accentColor,
      spacing,
      paperSize,
      showPageNumbers,
      showWatermark,
    };

    const saved = await saveDocument(payload);
    if (saved) {
      alert(`${category} saved successfully!`);
      loadDocuments();
    }
  };

  const handleDeleteDocument = async (id) => {
    const ok = await deleteDocument(id);
    if (ok) {
      loadDocuments();
    }
  };

  const handleOpenDocument = (doc) => {
    const resolvedCategory =
      doc.category ||
      (doc.type === 'cv'
        ? 'CV'
        : doc.type === 'cover_letter'
          ? 'Cover Letter'
          : 'Proposal');

    setCategory(resolvedCategory);

    const content = doc.content || {};

    if (doc.type === 'cv') {
      setCvData(content);
    } else if (doc.type === 'cover_letter') {
      setCoverLetterData(content);
    } else if (doc.type === 'business_proposal') {
      setProposalData(content);
    }

    if (doc.theme) setTheme(doc.theme);
    if (doc.fontSize) setFontSize(doc.fontSize);
    if (doc.fontFamily) setFontFamily(doc.fontFamily);
    if (doc.accentColor) setAccentColor(doc.accentColor);
    if (doc.spacing) setSpacing(doc.spacing);
    if (doc.paperSize) setPaperSize(doc.paperSize);
    if (typeof doc.showPageNumbers === 'boolean') setShowPageNumbers(doc.showPageNumbers);
    if (typeof doc.showWatermark === 'boolean') setShowWatermark(doc.showWatermark);

    setActiveTab('create');
    setCreateStep('preview');
  };

  const handleDownloadPDF = async () => {
    if (!previewRef.current) return;

    try {
      setPdfLoading(true);
      await loadPdfLibs();

      const canvas = await window.html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pw = pdf.internal.pageSize.getWidth();
      const ph = pdf.internal.pageSize.getHeight();
      const ih = (canvas.height * pw) / canvas.width;

      let left = ih;
      let pos = 0;

      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, pos, pw, ih);
      left -= ph;

      while (left > 0) {
        pos -= ph;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, pos, pw, ih);
        left -= ph;
      }

      pdf.save(`${docType}_document.pdf`);
    } catch {
      alert('PDF export failed');
    } finally {
      setPdfLoading(false);
    }
  };

  const handleDownloadWord = async () => {
    try {
      setWordLoading(true);

      const doc = new Document({
        sections: [
          {
            properties: {},
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: cvData.name || '', bold: true, size: 36, color: '1e3a5f' })],
                spacing: { after: 80 },
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: cvData.title || '', size: 22, color: '555555' })],
                spacing: { after: 60 },
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: `${cvData.location || ''} | ${cvData.email1 || ''} | ${cvData.phone || ''}`, size: 18, color: '777777' })],
                spacing: { after: 200 },
              }),
              new Paragraph({
                border: {
                  bottom: { style: BorderStyle.SINGLE, size: 6, color: '1e3a5f' },
                },
                spacing: { after: 160 },
              }),
              new Paragraph({
                children: [new TextRun({ text: 'SUMMARY', bold: true, size: 22, color: '1e3a5f' })],
                spacing: { after: 80 },
              }),
              new Paragraph({
                children: [new TextRun({ text: cvData.summary || '', size: 20, color: '333333' })],
                spacing: { after: 200 },
              }),
            ],
          },
        ],
      });

      saveAs(await Packer.toBlob(doc), `${(cvData.name || 'document').replace(/\s+/g, '_')}_CV.docx`);
    } catch {
      alert('Word export failed');
    } finally {
      setWordLoading(false);
    }
  };

  const renderPreview = useCallback(
    (overrideTheme) => {
      const t = overrideTheme || theme;

      if (category === 'Cover Letter') {
        return (
          <CoverLetterPreview
            data={coverLetterData}
            onDataChange={setCoverLetterData}
            theme={t}
            fontSize={fontSize}
            accentColor={accentColor}
            editMode={editMode}
          />
        );
      }

      if (category === 'Proposal') {
        return (
          <ProposalPreview
            data={proposalData}
            onDataChange={setProposalData}
            theme={t}
            fontSize={fontSize}
            accentColor={accentColor}
            editMode={editMode}
          />
        );
      }

      return (
        <CVPreview
          data={cvData}
          onDataChange={setCvData}
          theme={t}
          fontSize={fontSize}
          accentColor={accentColor}
          editMode={editMode}
        />
      );
    },
    [category, coverLetterData, proposalData, cvData, theme, fontSize, accentColor, editMode]
  );

  const renderForm = () => {
    const catalogue = FIELD_CATALOGUE[docType] || [];
    const activeKeys = activeFieldKeys[docType] || [];
    const visible = catalogue.filter((f) => f.core || activeKeys.includes(f.key));

    const getVal = (key) => {
      const v = currentFields[key];
      if (v === undefined || v === null) return '';

      if (key === 'experience' && Array.isArray(v)) {
        return v
          .map((e) => {
            const h = [e.role, e.company, e.period].filter(Boolean).join(' · ');
            const b = Array.isArray(e.bullets) ? e.bullets.join('\n') : '';
            return [h, b].filter(Boolean).join('\n');
          })
          .join('\n\n');
      }

      return v;
    };

    const handleChange = (field, raw) => {
      if (field.key === 'experience' && docType === 'cv' && typeof raw === 'string') {
        const blocks = raw.split(/\n\n+/).filter(Boolean);
        const parsed = blocks.map((block) => {
          const lines = block.split('\n').filter(Boolean);
          const parts = (lines[0] || '').split('·').map((p) => p.trim());

          return {
            role: parts[0] || '',
            company: parts[1] || '',
            period: parts[2] || '',
            bullets: lines.slice(1),
          };
        });

        updateField('experience', parsed.length ? parsed : [{ role: raw, company: '', period: '', bullets: [] }]);
      } else {
        updateField(field.key, raw);
      }
    };

    return (
      <div>
        <FieldPicker catalogue={catalogue} activeKeys={activeKeys} onToggle={toggleField} />

        {visible.map((field) => (
          <FieldRow
            key={field.key}
            field={field}
            value={getVal(field.key)}
            onChange={(v) => handleChange(field, v)}
            onRemove={() => toggleField(field.key)}
          />
        ))}

        {visible.length === catalogue.filter((f) => f.core).length && (
          <div style={{ padding: '22px 18px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 12, fontStyle: 'italic' }}>
            ↑ Add fields above to build your document
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={s.page}>
      <Sidebar
        activeTab={activeTab}
        onNavigate={setActiveTab}
        isOpen={sidebarOpen}
        user={user}
        onLogout={logoutUser}
      />

      <div style={s.main}>
        <Navbar
          onToggleSidebar={() => setSidebarOpen((p) => !p)}
          user={user}
          onLogout={logoutUser}
          activeTab={activeTab}
          onSaveDraft={handleSaveDraft}
          showSaveButton={activeTab === 'create'}
        />

        <div style={s.content}>
          {activeTab === 'home' && (
            <div style={s.tabPage}>
              <HomeTab
                user={user}
                documents={documents}
                onNavigate={setActiveTab}
                loadingDocuments={loadingDocuments}
              />
            </div>
          )}

          {activeTab === 'create' && createStep === 'input' && (
            <div style={s.inputStepLayout}>
              <div style={s.inputContainer}>
                <div style={s.leftHeader}>
                  <DocumentEditor
                    category={category}
                    onCategoryChange={setCategory}
                    editMode={editMode}
                    onToggleEditMode={() => setEditMode((p) => !p)}
                    onSaveDraft={handleSaveDraft}
                  />
                </div>

                <div style={s.formScroll}>{renderForm()}</div>

                <div style={s.actionBar}>
                  <button
                    style={{ ...s.btnGenerate, ...(aiLoading ? s.btnDisabled : {}) }}
                    onClick={async () => {
                      await onGenerateAI();
                      setCreateStep('preview');
                    }}
                    disabled={aiLoading}
                  >
                    <SparkleIcon />
                    {aiLoading ? 'Generating…' : 'Generate with AI'}
                  </button>

                  <div style={{ display: 'flex', gap: 7, marginLeft: 'auto' }}>
                    <button style={s.btnGhost} onClick={() => setCreateStep('preview')}>
                      <EyeIcon />
                      <span>Preview</span>
                    </button>
                    <button style={s.btnGhost} onClick={handleSaveDraft}>
                      <SaveIcon />
                      <span>Save</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'create' && createStep === 'preview' && (
            <div style={s.createLayout}>
              <div style={s.rightPanel}>
                <div style={{ display: 'flex', alignItems: 'center', background: '#080c14', paddingRight: '20px' }}>
                  <button
                    style={{ ...s.btnGhost, margin: '12px 20px', border: 'none', background: '#1e293b', color: '#e2e8f0' }}
                    onClick={() => setCreateStep('input')}
                  >
                    ← Back to Form
                  </button>
                  <RightPanelTabs active={rightTab} onChange={setRightTab} />

                  <div style={{ flex: 1 }} />
                  <div style={{ display: 'flex', gap: 7 }}>
                    <button
                      style={{ ...s.btnGhost, ...(pdfLoading ? s.btnDisabled : {}) }}
                      onClick={handleDownloadPDF}
                      disabled={pdfLoading}
                    >
                      <PdfIcon />
                      <span>{pdfLoading ? '…' : 'PDF'}</span>
                    </button>
                  </div>
                </div>

                <div style={s.rightContent}>
                  {rightTab === 'preview' && (
                    <div style={s.previewWrap}>
                      <DocumentPreview ref={previewRef} editMode={editMode} onToggleEditMode={() => setEditMode((p) => !p)}>
                        {renderPreview()}
                      </DocumentPreview>
                    </div>
                  )}

                  {rightTab === 'style' && (
                    <div style={s.panelScroll}>
                      <CustomizationPanel
                        cvData={cvData}
                        onCVUpdate={setCvData}
                        coverLetterData={coverLetterData}
                        onCoverLetterUpdate={setCoverLetterData}
                        proposalData={proposalData}
                        onProposalUpdate={setProposalData}
                        docType={docType}
                      />
                    </div>
                  )}

                  {rightTab === 'templates' && (
                    <div style={s.panelScroll}>
                      <TemplateSelector
                        theme={theme}
                        onThemeChange={setTheme}
                        fontSize={fontSize}
                        onFontSizeChange={setFontSize}
                        fontFamily={fontFamily}
                        onFontFamilyChange={setFontFamily}
                        accentColor={accentColor}
                        onAccentChange={setAccentColor}
                        spacing={spacing}
                        onSpacingChange={setSpacing}
                        paperSize={paperSize}
                        onPaperSizeChange={setPaperSize}
                        showPageNumbers={showPageNumbers}
                        onShowPageNumbersChange={setShowPageNumbers}
                        showWatermark={showWatermark}
                        onShowWatermarkChange={setShowWatermark}
                        onDownloadPDF={handleDownloadPDF}
                        pdfLoading={pdfLoading}
                        onDownloadWord={handleDownloadWord}
                        wordLoading={wordLoading}
                        thumbnail={renderPreview()}
                        renderPreview={renderPreview}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div style={s.tabPage}>
              <div style={s.tabHeader}>
                <div>
                  <h2 style={s.tabTitle}>My Documents</h2>
                  <p style={s.tabSubtitle}>Manage and resume your saved work</p>
                </div>

                <button style={s.btnGenerate} onClick={() => setActiveTab('create')}>
                  + New Document
                </button>
              </div>

              {loadingDocuments && (
                <div style={s.emptyState}>
                  <div style={s.spinner} />
                  <p style={{ color: '#475569', marginTop: 14 }}>Loading…</p>
                </div>
              )}

              {!loadingDocuments && documents.length === 0 && (
                <div style={s.emptyState}>
                  <div style={{ fontSize: 42, marginBottom: 14 }}>📄</div>
                  <h3 style={{ color: '#94a3b8', fontWeight: 600, margin: '0 0 8px' }}>No documents yet</h3>
                  <p style={{ color: '#475569', fontSize: 13, margin: '0 0 20px' }}>Create your first document to get started</p>
                  <button style={s.btnGenerate} onClick={() => setActiveTab('create')}>
                    Create one →
                  </button>
                </div>
              )}

              {!loadingDocuments && documents.length > 0 && (
                <div style={s.docGrid}>
                  {documents.map((doc) => {
                    const dt = doc.type || 'cv';
                    const badgePalette = {
                      cv: ['#1e3a8a', '#60a5fa'],
                      cover_letter: ['#052e16', '#4ade80'],
                      business_proposal: ['#422006', '#fbbf24'],
                    };

                    const [badgeBg, badgeFg] = badgePalette[dt] || ['#1e293b', '#94a3b8'];

                    return (
                      <div
                        key={doc._id || doc.id}
                        style={s.docCard}
                        onClick={() => handleOpenDocument(doc)}
                      >
                        <div
                          style={{
                            height: 70,
                            background: `linear-gradient(135deg,${accentColor}22,${accentColor}08)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderBottom: '1px solid #0f172a',
                          }}
                        >
                          <span style={{ fontSize: 28 }}>
                            {dt === 'cv' ? '📋' : dt === 'cover_letter' ? '✉️' : '💼'}
                          </span>
                        </div>

                        <div style={{ padding: '12px 14px', flex: 1 }}>
                          <div
                            style={{
                              display: 'inline-block',
                              padding: '2px 7px',
                              borderRadius: 16,
                              fontSize: 10,
                              fontWeight: 700,
                              background: badgeBg,
                              color: badgeFg,
                              marginBottom: 7,
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                            }}
                          >
                            {dt.replace('_', ' ')}
                          </div>

                          <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: 13, marginBottom: 4 }}>
                            {doc.title}
                          </div>

                          <div style={{ fontSize: 11, color: '#334155' }}>
                            Saved {doc.updatedAt ? new Date(doc.updatedAt).toLocaleString() : doc.savedAt}
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: 7, padding: '10px 14px', borderTop: '1px solid #0f172a' }}>
                          <button
                            style={s.btnOpenDoc}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDocument(doc);
                            }}
                          >
                            Open
                          </button>

                          <button
                            style={s.btnDeleteDoc}
                            onClick={async (e) => {
                              e.stopPropagation();
                              await handleDeleteDocument(doc._id || doc.id);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <SettingsTab />
          )}

          {activeTab === 'admin' && user?.role === 'admin' && (
            <AdminDashboardPage />
          )}
        </div>
      </div>
    </div>
  );
};

const s = {
  page: {
    display: 'flex',
    height: '100vh',
    fontFamily: "'Outfit','Segoe UI',system-ui,sans-serif",
    background: 'var(--bg-color)',
    color: 'var(--text-primary)',
    overflow: 'hidden',
  },

  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    overflow: 'hidden',
  },

  content: {
    flex: 1,
    overflow: 'auto',
    display: 'flex',
    minWidth: 0,
    flexDirection: 'column',
  },

  createLayout: {
    display: 'flex',
    flex: 1,
    minHeight: 0,
    height: '100%',
  },

  inputStepLayout: {
    display: 'flex',
    flex: 1,
    minHeight: 0,
    height: '100%',
    alignItems: 'flex-start',
    justifyContent: 'center',
    background: 'var(--bg-color)',
    padding: '30px 20px',
    overflow: 'auto',
  },

  inputContainer: {
    width: '100%',
    maxWidth: 700,
    height: '85vh',
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--card-bg)',
    border: '1px solid var(--border-color)',
    borderRadius: 12,
    overflow: 'hidden',
    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
  },

  leftPanel: {
    width: 400,
    minWidth: 320,
    maxWidth: 460,
    display: 'flex',
    flexDirection: 'column',
    borderRight: '1px solid var(--border-color)',
    background: 'var(--bg-color)',
    overflow: 'hidden',
  },

  leftHeader: {
    flexShrink: 0,
  },

  formScroll: {
    flex: 1,
    overflowY: 'auto',
    paddingBottom: 8,
  },

  actionBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 18px',
    borderTop: '1px solid var(--border-color)',
    background: 'var(--bg-color)',
    flexShrink: 0,
  },

  rightPanel: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    overflow: 'hidden',
    background: 'var(--card-bg)',
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
    background: 'var(--bg-color)',
  },

  panelScroll: {
    flex: 1,
    overflow: 'auto',
  },

  btnGenerate: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    background: 'linear-gradient(135deg, var(--accent-color), #2563eb)',
    color: '#fff',
    border: 'none',
    padding: '9px 16px',
    borderRadius: 9,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    flexShrink: 0,
    fontFamily: 'inherit',
  },

  btnGhost: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    background: 'transparent',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border-color)',
    padding: '7px 12px',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    fontFamily: 'inherit',
  },

  btnDisabled: {
    opacity: 0.45,
    cursor: 'not-allowed',
  },

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

  docGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill,minmax(210px,1fr))',
    gap: 14,
  },

  docCard: {
    background: 'var(--card-bg)',
    border: '1px solid var(--border-color)',
    borderRadius: 12,
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'transform 0.18s, box-shadow 0.18s',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
    display: 'flex',
    flexDirection: 'column',
  },

  btnOpenDoc: {
    flex: 1,
    background: 'rgba(59, 130, 246, 0.1)',
    color: 'var(--accent-color)',
    border: 'none',
    borderRadius: 6,
    padding: '6px 0',
    fontSize: 11,
    fontWeight: 600,
    cursor: 'pointer',
  },

  btnDeleteDoc: {
    flex: 1,
    background: 'rgba(239, 68, 68, 0.1)',
    color: 'var(--danger-color)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: 6,
    padding: '6px 0',
    fontSize: 11,
    fontWeight: 500,
    cursor: 'pointer',
  },

  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    background: 'var(--card-bg)',
    borderRadius: 16,
    border: '1px dashed var(--border-color)',
    textAlign: 'center',
  },

  spinner: {
    width: 28,
    height: 28,
    border: '2.5px solid var(--border-color)',
    borderTop: '2.5px solid var(--accent-color)',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },

  settingsCard: {
    background: 'var(--card-bg)',
    border: '1px solid var(--border-color)',
    borderRadius: 14,
    padding: 28,
    maxWidth: 500,
  },
};

export default DashboardPage;
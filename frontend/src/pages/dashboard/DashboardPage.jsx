/* eslint-disable no-unused-vars */
import { useState, useRef, useEffect, useCallback } from 'react';

import { Document, Packer, Paragraph, TextRun, AlignmentType, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';
import html2pdf from 'html2pdf.js';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

import Sidebar from '../../components/common/Sidebar';
import Navbar from '../../components/common/Navbar';

import CustomizationPanel from '../../components/customization/CustomizationPanel';
import DocumentEditor from '../../components/document/DocumentEditor';
import DocumentPreview from '../../components/document/DocumentPreview';
import TemplateSelector from '../../components/template/TemplateSelector';

import CVPreview from '../../components/document/CVPreview';
import CoverLetterPreview from '../../components/document/CoverLetterPreview';
import ProposalPreview from '../../components/document/ProposalPreview';
import DocumentWizard from '../../components/document/DocumentWizard';

import HomeTab from './HomeTab';
import AdminDashboardPage from '../admin/AdminDashboardPage';
import SettingsTab from './SettingsTab';

import { useDocuments } from '../../hooks/useDocuments';
import { useUI } from '../../hooks/useUI';
import { useAI } from '../../hooks/useAI';
import { mapAICvToPreview } from '../../utils/cvMapper';



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
                background: on ? 'var(--accent-subtle)' : 'transparent',
                color: on ? 'var(--accent-color)' : 'var(--text-secondary)',
                boxShadow: on ? '0 0 10px var(--accent-glow)' : 'none',
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
            <span style={{ fontSize: 10, fontWeight: 600, color: '#14b8a6', background: 'rgba(20, 184, 166, 0.15)', padding: '2px 8px', borderRadius: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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

const LeftPanelTabs = ({ active, onChange }) => {
  const tabs = [
    { id: 'edit', label: 'Form', icon: <EditIcon /> },
    {
      id: 'style', label: 'AI Edit', icon: (
        <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
      )
    },
    { id: 'templates', label: 'Templates', icon: <ThemeIcon /> },
    // Preview tab — only shown on mobile via CSS
    { id: 'preview', label: 'Preview', icon: <EyeIcon />, mobileOnly: true },
  ];

  return (
    <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-color)', padding: '0 20px', gap: 0, flexShrink: 0 }}>
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={t.mobileOnly ? 'mobile-only-tab' : ''}
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
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {t.icon}
          {t.label}
        </button>
      ))}
    </div>
  );
};

const RightPanelTabs = ({ active, onChange }) => {
  const tabs = [
    { id: 'preview', label: 'Preview', icon: <EyeIcon /> },
    { id: 'style', label: 'Style', icon: <EditIcon /> },
    { id: 'templates', label: 'Templates', icon: <ThemeIcon /> },
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
  bar: { display: 'flex', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-color)', padding: '0 20px', gap: 2, flexShrink: 0 },
  tab: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '12px 14px', fontSize: 13, fontWeight: 500, border: 'none', background: 'none', cursor: 'pointer', borderBottom: '2px solid transparent', marginBottom: -1, transition: 'color 0.15s, border-color 0.15s' },
  active: { color: 'var(--accent-color)', borderBottomColor: 'var(--accent-color)' },
  inactive: { color: 'var(--text-secondary)' },
};

const DashboardPage = () => {
  const { user, logoutUser } = useAuth();
  const toast = useToast();

  const { activeTab, setActiveTab, sidebarOpen, setSidebarOpen, isMobile } = useUI();
  const { documents, loadingDocuments, loadDocuments, saveDocument, deleteDocument } = useDocuments();
  const { aiLoading, handleGenerate } = useAI();

  const previewRef = useRef(null);

  const [category, setCategory] = useState('CV');
  const [theme, setTheme] = useState('Modern');
  const [fontSize, setFontSize] = useState('12 pt');
  const [fontFamily, setFontFamily] = useState('Inter');
  const [accentColor, setAccentColor] = useState('#14b8a6');
  const [spacing, setSpacing] = useState('normal');
  const [paperSize, setPaperSize] = useState('A4');
  const [showPageNumbers, setShowPageNumbers] = useState(false);
  const [showWatermark, setShowWatermark] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [leftTab, setLeftTab] = useState('edit');
  const [rightTab, setRightTab] = useState('preview');
  const [createStep, setCreateStep] = useState('input');

  // Pre-fill data with the logged-in user's info so templates are never empty by default
  const [cvData, setCvData] = useState({
    avatar: user?.profileData?.avatar || user?.avatar || '',
    name: user?.profileData?.name || user?.name || '',
    phone: user?.profileData?.phone || '',
    email1: user?.profileData?.email1 || user?.profileData?.email || user?.email || '',
    email2: user?.profileData?.email2 || '',
    linkedin: user?.profileData?.linkedin || '',
    title: user?.profileData?.title || '',
    location: user?.profileData?.location || '',
    summary: user?.profileData?.summary || '',
    skills: user?.profileData?.skills || [],
    education: user?.profileData?.education || [],
    experience: user?.profileData?.experience || [],
    projects: user?.profileData?.projects || [],
    certifications: user?.profileData?.certifications || [],
    references: user?.profileData?.references || '',
  });

  const [coverLetterData, setCoverLetterData] = useState({
    senderName: user?.profileData?.senderName || user?.profileData?.name || user?.name || '',
    senderTitle: user?.profileData?.senderTitle || user?.profileData?.title || '',
    senderLocation: user?.profileData?.senderLocation || user?.profileData?.location || '',
    senderEmail: user?.profileData?.senderEmail || user?.profileData?.email1 || user?.email || '',
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
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
    signature: user?.profileData?.name || user?.name || '',
  });

  const [proposalData, setProposalData] = useState({
    title: '',
    subtitle: 'Technical Proposal',
    preparedBy: user?.profileData?.preparedBy || user?.profileData?.name || user?.name || '',
    preparedFor: '',
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    version: 'v1.0',
    executiveSummary: '',
    problemStatement: '',
    proposedSolution: '',
    deliverables: [],
    timeline: [],
    budget: '',
    validity: '',
    closingNote: '',
    contactName: user?.profileData?.contactName || user?.profileData?.name || user?.name || '',
    contactEmail: user?.profileData?.contactEmail || user?.profileData?.email1 || user?.email || '',
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
    // Always force a fresh generation — pass a unique requestId so the hook
    // treats every call as distinct even if currentFields hasn't changed.
    await handleGenerate({
      docType,
      currentFields,
      setCvData,
      setCoverLetterData,
      setProposalData,
      mapAICvToPreview,
      requestId: Date.now(), // forces re-run on subsequent clicks
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
      toast(`${category} saved successfully!`, 'success');
      loadDocuments();
    } else {
      toast('Failed to save document', 'error');
    }
  };

  const handleDeleteDocument = async (id) => {
    const ok = await deleteDocument(id);
    if (ok) {
      toast('Document deleted successfully', 'success');
      loadDocuments();
    } else {
      toast('Failed to delete document', 'error');
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
    try {
      setPdfLoading(true);
      if (!previewRef.current) throw new Error('Preview not found');

      const element = previewRef.current;

      let filename = 'document';
      if (docType === 'cv') filename = cvData.name ? `${cvData.name}_CV` : 'CV';
      else if (docType === 'cover_letter') filename = coverLetterData.senderName ? `${coverLetterData.senderName}_Cover_Letter` : 'Cover_Letter';
      else if (docType === 'business_proposal') filename = proposalData.title ? `${proposalData.title}_Proposal` : 'Proposal';

      const opt = {
        margin: 0,
        filename: `${filename.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: paperSize === 'Letter' ? 'letter' : 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['css', 'legacy'] }
      };

      await html2pdf().set(opt).from(element).save();
      toast('PDF exported successfully!', 'success');
    } catch (err) {
      console.error(err);
      toast('PDF export failed', 'error');
    } finally {
      setPdfLoading(false);
    }
  };

  const handleDownloadWord = async () => {
    try {
      setWordLoading(true);

      if (!previewRef.current) throw new Error('Preview not found');

      let filename = 'document';
      if (docType === 'cv') filename = cvData.name ? `${cvData.name}_CV` : 'CV';
      else if (docType === 'cover_letter') filename = coverLetterData.senderName ? `${coverLetterData.senderName}_Cover_Letter` : 'Cover_Letter';
      else if (docType === 'business_proposal') filename = proposalData.title ? `${proposalData.title}_Proposal` : 'Proposal';

      const pageW = paperSize === 'A4' ? '210mm' : '8.5in';
      const pageH = paperSize === 'A4' ? '297mm' : (paperSize === 'Legal' ? '14in' : '11in');

      const html = `
<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>${filename.replace(/_/g, ' ')}</title>
  <style>
    @page {
      size: ${pageW} ${pageH};
      margin: 0;
    }
    html, body {
      margin: 0;
      padding: 0;
      width: ${pageW};
      height: ${pageH};
      overflow: hidden;
      font-family: Arial, sans-serif;
    }
    body > * {
      page-break-inside: avoid;
    }
    /* Preserve inline styles from the React component */
    * { box-sizing: border-box; }
  </style>
</head>
<body>
  <div style="width:${pageW};height:${pageH};overflow:hidden;display:flex;flex-direction:column;">
    ${previewRef.current.innerHTML}
  </div>
</body>
</html>`;

      const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
      saveAs(blob, `${filename.replace(/\s+/g, '_')}.doc`);
      toast('Word document downloaded!', 'success');
    } catch (err) {
      toast('Word export failed', 'error');
    } finally {
      setWordLoading(false);
    }
  };

  const renderPreview = useCallback((overrideTheme) => {
    const t = overrideTheme || theme || 'modern';

    const sharedProps = {
      theme: t,
      fontSize,
      fontFamily,
      spacing,
      accentColor,
      editMode,
      paperSize,
      showPageNumbers,
      showWatermark,
    };

    if (category === 'Cover Letter') {
      return <CoverLetterPreview data={coverLetterData} onDataChange={setCoverLetterData} {...sharedProps} />;
    }
    if (category === 'Proposal') {
      return <ProposalPreview data={proposalData} onDataChange={setProposalData} {...sharedProps} />;
    }
    return <CVPreview data={cvData} onDataChange={setCvData} {...sharedProps} />;
  }, [category, coverLetterData, proposalData, cvData, theme, fontSize, fontFamily, spacing, accentColor, editMode, paperSize, showPageNumbers, showWatermark]);

  const renderForm = () => {
    return (
      <DocumentWizard
        docType={docType}
        data={currentFields}
        onDataChange={(newData) => {
          if (docType === 'cv') setCvData(typeof newData === 'function' ? newData(cvData) : newData);
          else if (docType === 'cover_letter') setCoverLetterData(typeof newData === 'function' ? newData(coverLetterData) : newData);
          else setProposalData(typeof newData === 'function' ? newData(proposalData) : newData);
        }}
        onGenerateAI={onGenerateAI}
        aiLoading={aiLoading}
        onNextStep={() => {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
          handleSaveDraft();
          setLeftTab('edit');
        }}
      />
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
        isMobileOverlay={isMobile}
        onClose={() => setSidebarOpen(false)}
      />

      <div style={s.main}>
        <Navbar
          onToggleSidebar={() => setSidebarOpen((p) => !p)}
          user={user}
          onLogout={logoutUser}
          activeTab={activeTab}
          onSaveDraft={handleSaveDraft}
          showSaveButton={activeTab === 'create'}
          onOpenSettings={() => setActiveTab('settings')}
        />

        <div style={s.content}>
          {activeTab === 'home' && (
            <div style={s.tabPage} className="page-fade">
              <HomeTab
                user={user}
                documents={documents}
                onNavigate={setActiveTab}
                loadingDocuments={loadingDocuments}
              />
            </div>
          )}

          {activeTab === 'create' && createStep === 'input' && (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, height: '100%', background: 'var(--bg-color)' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--card-bg)' }}>
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
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, height: '100%', background: 'var(--bg-color)' }}>
              {/* TOP NAVIGATION BAR */}
              <div style={{ display: 'flex', alignItems: 'center', background: '#080c14', paddingRight: '20px', borderBottom: '1px solid var(--border-color)', flexShrink: 0 }}>
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
                    {pdfLoading ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                      </svg>
                    ) : (
                      <PdfIcon />
                    )}
                    <span>{pdfLoading ? 'Exporting…' : 'Export PDF'}</span>
                  </button>
                  <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                </div>
              </div>

              {/* CONTENT AREA */}
              <div style={{ flex: 1, overflow: 'auto', display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ ...s.previewWrap, display: rightTab === 'preview' ? 'flex' : 'none' }}>
                    <DocumentPreview ref={previewRef} editMode={editMode} onToggleEditMode={() => setEditMode((p) => !p)} paperSize={paperSize} showWatermark={showWatermark}>
                      {renderPreview()}
                    </DocumentPreview>
                  </div>

                  {rightTab === 'style' && (
                    <div style={{ ...s.panelScroll, padding: '24px 16px' }}>
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
                    <div style={{ ...s.panelScroll, padding: '24px 16px' }}>
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
                        thumbnail={<div style={{ width: '100%', height: '100%', transform: 'scale(0.3)', transformOrigin: 'top left' }}>{renderPreview()}</div>}
                        renderPreview={renderPreview}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div style={s.tabPage} className="page-fade">
              <div style={s.tabHeader} className="tab-header-responsive">
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
                  <p style={{ color: 'var(--text-secondary)', marginTop: 14 }}>Loading…</p>
                </div>
              )}

              {!loadingDocuments && documents.length === 0 && (
                <div style={s.emptyState}>
                  <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)', marginBottom: 14 }}>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                  <h3 style={{ color: 'var(--text-secondary)', fontWeight: 600, margin: '0 0 8px' }}>No documents yet</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '0 0 20px' }}>Create your first document to get started</p>
                  <button style={s.btnGenerate} onClick={() => setActiveTab('create')}>
                    Create one →
                  </button>
                </div>
              )}

              {!loadingDocuments && documents.length > 0 && (
                <div style={s.docGrid}>
                  {documents.map((doc) => {
                    const dt = doc.type || 'cv';
                    const typeColors = { cv: '#14b8a6', cover_letter: '#0891b2', business_proposal: '#f59e0b' };
                    const badgeFg = typeColors[dt] || '#94a3b8';
                    const badgeBg = `${badgeFg}18`;

                    const docTheme = doc.theme || 'modern';
                    const docContent = doc.content || {};
                    const docAccent = doc.accentColor || '#14b8a6';
                    const docFontSize = doc.fontSize || 11;

                    return (
                      <div
                        key={doc._id || doc.id}
                        className="doc-card"
                        style={s.docCard}
                        onClick={() => handleOpenDocument(doc)}
                      >
                        {/* Mini preview thumbnail */}
                        <div
                          style={{
                            height: 130,
                            overflow: 'hidden',
                            background: '#fff',
                            borderBottom: '1px solid var(--border-color)',
                            position: 'relative',
                            cursor: 'pointer',
                          }}
                        >
                          <div style={{ position: 'absolute', top: 0, left: 0, width: '340%', height: '340%', transformOrigin: 'top left', transform: 'scale(0.294)', pointerEvents: 'none' }}>
                            {dt === 'cv' ? (
                              <CVPreview data={docContent} theme={docTheme} accentColor={docAccent} fontSize={docFontSize} editMode={false} spacing={1} />
                            ) : dt === 'cover_letter' ? (
                              <CoverLetterPreview data={docContent} theme={docTheme} accentColor={docAccent} fontSize={docFontSize} editMode={false} spacing={1} />
                            ) : (
                              <ProposalPreview data={docContent} theme={docTheme} accentColor={docAccent} fontSize={docFontSize} editMode={false} spacing={1} />
                            )}
                          </div>
                          {/* overlay to block interactions */}
                          <div style={{ position: 'absolute', inset: 0 }} />
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

                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13, marginBottom: 4 }}>
                            {doc.title}
                          </div>

                          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                            Saved {doc.updatedAt ? new Date(doc.updatedAt).toLocaleDateString() : doc.savedAt}
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: 7, padding: '10px 14px', borderTop: '1px solid var(--border-color)' }}>
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
    position: 'relative',
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
    background: 'var(--accent-color)',
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
    padding: 'clamp(16px, 4vw, 36px)',
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
    background: 'var(--accent-subtle)',
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
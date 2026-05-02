// client/src/constants/index.js

export const THEME_CONFIGS = {
  // ── Original 4 ──────────────────────────────────────────────
  Modern: {
    label: 'Modern',
    desc:  'Clean sidebar layout with sharp accents',
    bodyFont:    "'Lato', sans-serif",
    displayFont: "'Playfair Display', Georgia, serif",
  },
  Classic: {
    label: 'Classic',
    desc:  'Traditional centered header, ruled sections',
    bodyFont:    "'EB Garamond', Garamond, serif",
    displayFont: "'EB Garamond', Garamond, serif",
  },
  Minimal: {
    label: 'Minimal',
    desc:  'Ultra-sparse whitespace-first design',
    bodyFont:    "'DM Sans', sans-serif",
    displayFont: "'DM Sans', sans-serif",
  },
  Bold: {
    label: 'Bold',
    desc:  'Dark header band, high-contrast impact',
    bodyFont:    "'Barlow', sans-serif",
    displayFont: "'Barlow Condensed', sans-serif",
  },

  // ── 11 New themes ────────────────────────────────────────────
  Executive: {
    label: 'Executive',
    desc:  'Luxury serif, gold rules, prestige',
    bodyFont:    "'Cormorant Garamond', serif",
    displayFont: "'Cormorant Garamond', serif",
  },
  Tech: {
    label: 'Tech',
    desc:  'Dark terminal, mono font, code feel',
    bodyFont:    "'Fira Code', monospace",
    displayFont: "'Fira Code', monospace",
  },
  Creative: {
    label: 'Creative',
    desc:  'Diagonal block, bold asymmetry',
    bodyFont:    "'Nunito', sans-serif",
    displayFont: "'Nunito', sans-serif",
  },
  Academic: {
    label: 'Academic',
    desc:  'Two-column, dense scholarly layout',
    bodyFont:    "'Source Serif 4', serif",
    displayFont: "'Source Serif 4', serif",
  },
  Corporate: {
    label: 'Corporate',
    desc:  'Structured, tabular, conservative',
    bodyFont:    "'Roboto', sans-serif",
    displayFont: "'Roboto', sans-serif",
  },
  Timeline: {
    label: 'Timeline',
    desc:  'Vertical timeline for experience',
    bodyFont:    "'Mulish', sans-serif",
    displayFont: "'Mulish', sans-serif",
  },
  Infographic: {
    label: 'Infographic',
    desc:  'Skill bars, icon badges, visual data',
    bodyFont:    "'Poppins', sans-serif",
    displayFont: "'Poppins', sans-serif",
  },
  Nordic: {
    label: 'Nordic',
    desc:  'Scandinavian calm, generous whitespace',
    bodyFont:    "'Inter', sans-serif",
    displayFont: "'Inter', sans-serif",
  },
  Elegant: {
    label: 'Elegant',
    desc:  'All-caps headers, thin diamond rules',
    bodyFont:    "'Libre Baskerville', serif",
    displayFont: "'Libre Baskerville', serif",
  },
  Chicago: {
    label: 'Chicago',
    desc:  'Newspaper editorial, two columns',
    bodyFont:    "'Playfair Display', Georgia, serif",
    displayFont: "'Playfair Display', Georgia, serif",
  },
  Sunset: {
    label: 'Sunset',
    desc:  'Warm gradient sidebar, soft tones',
    bodyFont:    "'Quicksand', sans-serif",
    displayFont: "'Quicksand', sans-serif",
  },
};

export const THEME_LIST = [
  'Modern',
  'Classic',
  'Minimal',
  'Bold',
  'Executive',
  'Tech',
  'Creative',
  'Academic',
  'Corporate',
  'Timeline',
  'Infographic',
  'Nordic',
  'Elegant',
  'Chicago',
  'Sunset',
];

// ── Everything below is unchanged from your original file ─────

export const CATEGORIES    = ['CV', 'Cover Letter', 'Proposal'];
export const FONT_SIZES    = ['10 pt', '11 pt', '12 pt', '14 pt'];
export const COLOR_SCHEMES = ['#1e3a5f', '#14b8a6', '#0891b2', '#0f766e', '#64748b', '#94a3b8', '#cbd5e1'];

export const SIDEBAR_ITEMS = [
  { id: 'home',      icon: '⊞', label: 'Dashboard'      },
  { id: 'create',    icon: '✦', label: 'Create Document' },
  { id: 'documents', icon: '📄', label: 'My Documents'   },
  { id: 'settings',  icon: '⚙', label: 'Settings'       },
];

export const DEFAULT_CV = {
  name: 'John Mwangi', title: 'Software Engineer', location: 'Nairobi, Kenya',
  email1: 'john@example.com', email2: 'john.mwangi@gmail.com',
  summary: 'Accomplished Software Engineer with over 8 years of experience specializing in Machine Learning, Artificial Intelligence, and Web Development.',
  skills: ['Machine Learning', 'Artificial Intelligence', 'Web Development', 'Python', 'Team Collaboration'],
  experience: [{
    company: 'Tech Solutions Ltd', role: 'Lead Software Engineer', period: 'Apr 2018 – Present',
    bullets: [
      'Led development of AI-powered web applications serving over 50,000 users monthly.',
      'Collaborated with cross-functional teams to deliver machine learning models with 95% accuracy.',
      'Reduced system downtime by 30% through implementing automated monitoring solutions.',
    ],
  }],
};

export const DEFAULT_COVER_LETTER = {
  senderName: 'Michael Ochieng', senderTitle: 'Software Engineer',
  senderLocation: 'Nairobi, Kenya', senderEmail: 'ochiengmichael082@gmail.com',
  date: 'March 11, 2026', recipientName: 'Hiring Manager', recipientTitle: 'Head of Engineering',
  companyName: 'Tech Innovations Ltd', companyLocation: 'Nairobi, Kenya',
  subject: 'Application for Senior Software Engineer Position',
  opening: 'Dear Hiring Manager,',
  body1: 'I am writing to express my strong interest in the Senior Software Engineer position at Tech Innovations Ltd. With over 8 years of experience in Machine Learning, AI, and Web Development, I am confident my skills make me an excellent candidate.',
  body2: 'In my current role as Lead Software Engineer at Tech Solutions Ltd, I have led AI-powered web applications serving 50,000+ users monthly and delivered ML models with 95% accuracy.',
  body3: 'I am particularly drawn to Tech Innovations Ltd because of your commitment to leveraging cutting-edge technology to solve real-world problems.',
  closing: 'Thank you for considering my application. I look forward to hearing from you.',
  signoff: 'Sincerely,', signature: 'Michael Ochieng',
};

export const DEFAULT_PROPOSAL = {
  title: 'AI-Powered Web Platform Development', subtitle: 'Technical Proposal',
  preparedBy: 'Michael Ochieng', preparedFor: 'Tech Innovations Ltd',
  date: 'March 11, 2026', version: 'v1.0',
  executiveSummary: 'This proposal outlines a comprehensive plan to design, develop, and deploy an AI-powered web platform for Tech Innovations Ltd.',
  problemStatement: 'Tech Innovations Ltd currently faces challenges with manual data processing workflows that are time-intensive and error-prone.',
  proposedSolution: 'We propose developing a full-stack AI platform incorporating real-time data processing pipelines, predictive analytics dashboards, and an intelligent recommendation engine.',
  deliverables: [
    'AI-powered analytics dashboard with real-time data visualization',
    'Machine learning recommendation engine with 95%+ accuracy',
    'RESTful API layer with comprehensive documentation',
    'Automated testing suite with 80%+ code coverage',
    'Deployment pipeline with CI/CD integration',
  ],
  timeline: [
    { phase: 'Phase 1 — Discovery & Architecture', duration: '2 weeks', desc: 'Requirements gathering, system design, and technical specification.' },
    { phase: 'Phase 2 — Core Development',         duration: '6 weeks', desc: 'Backend API, ML model integration, and database architecture.'      },
    { phase: 'Phase 3 — Frontend & Integration',   duration: '4 weeks', desc: 'Dashboard UI, API integration, and end-to-end testing.'             },
    { phase: 'Phase 4 — Deployment & Handover',    duration: '2 weeks', desc: 'Production deployment, documentation, and team training.'           },
  ],
  budget: 'KES 850,000', validity: '30 days from date of issue',
  closingNote: 'We are confident this solution will deliver significant value. We welcome the opportunity to discuss this proposal further.',
  contactName: 'Michael Ochieng', contactEmail: 'ochiengmichael082@gmail.com',
};
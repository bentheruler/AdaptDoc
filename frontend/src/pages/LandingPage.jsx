import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const features = [
  {
    title: 'AI-assisted drafting',
    desc: 'Generate polished CVs, cover letters, and business proposals faster without starting from a blank page.',
    icon: '✦',
  },
  {
    title: 'Professional templates',
    desc: 'Choose structured layouts that look clean, credible, and ready for real-world use.',
    icon: '▣',
  },
  {
    title: 'Full editing control',
    desc: 'Refine text, switch styles, adjust formatting, and make every document your own.',
    icon: '✎',
  },
  {
    title: 'Export without friction',
    desc: 'Download your work in PDF or Word format when you are ready to submit or share it.',
    icon: '⬇',
  },
];

const documentTypes = [
  {
    title: 'CV / Resume',
    desc: 'Build modern, structured CVs that present your experience, education, and skills clearly.',
    tag: 'Career',
    type: 'cv',
  },
  {
    title: 'Cover Letter',
    desc: 'Generate tailored letters for jobs, internships, attachments, and formal applications.',
    tag: 'Application',
    type: 'letter',
  },
  {
    title: 'Business Proposal',
    desc: 'Create proposal documents with summaries, deliverables, budgets, and timelines.',
    tag: 'Business',
    type: 'proposal',
  },
];

const steps = [
  {
    title: 'Add your details',
    desc: 'Start with your information, goals, and the kind of document you need.',
  },
  {
    title: 'Generate a draft',
    desc: 'Use AI to produce a strong first version instead of writing from scratch.',
  },
  {
    title: 'Customize the result',
    desc: 'Edit content, change templates, and shape the final document your way.',
  },
  {
    title: 'Export and use it',
    desc: 'Download the finished document in a submission-ready format.',
  },
];

const LandingPage = () => {
  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="landing-brand-wrap">
          <img src="/favicon.png" alt="AdaptDoc" style={{ width: 28, height: 28, objectFit: 'contain' }} />
          <div className="landing-brand">AdaptDoc</div>
        </div>

        <nav className="landing-nav">
          <a href="#features">Features</a>
          <a href="#documents">Documents</a>
          <a href="#how-it-works">How it works</a>
        </nav>

        <div className="landing-auth-links">
          <Link to="/login" className="landing-link-btn">
            Sign In
          </Link>
          <Link to="/register" className="landing-primary-btn small">
            Get Started
          </Link>
        </div>
      </header>

      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-badge">Smart document creation</span>

          <h1>Write less from scratch. Build better documents faster.</h1>

          <p>
            AdaptDoc helps you create professional CVs, cover letters, and
            business proposals with AI support, editable templates, and
            export-ready formatting in one workspace.
          </p>

          <div className="hero-actions">
            <Link to="/register" className="landing-primary-btn">
              Create Account
            </Link>
            <Link to="/login" className="landing-secondary-btn">
              Sign In
            </Link>
          </div>

          <div className="hero-meta">
            <div className="hero-meta-item">
              <strong>3</strong>
              <span>document types</span>
            </div>

            <div className="hero-meta-item">
              <strong>AI</strong>
              <span>assisted drafting</span>
            </div>

            <div className="hero-meta-item">
              <strong>PDF</strong>
              <span>and Word export</span>
            </div>
          </div>
        </div>

        <div className="hero-preview">
          <div className="preview-shell">
            <div className="preview-glow" />

            <div className="preview-toolbar">
              <span className="preview-dot" />
              <span className="preview-dot" />
              <span className="preview-dot" />
            </div>

            <div className="preview-card large">
              <div className="preview-topbar" />

              <div className="preview-page">
                <div className="preview-page-header">
                  <div className="preview-avatar-block" />
                  <div className="preview-header-text">
                    <div className="preview-line w60" />
                    <div className="preview-line w35" />
                  </div>
                </div>

                <div className="preview-divider" />

                <div className="preview-section">
                  <div className="preview-section-title" />
                  <div className="preview-line w90" />
                  <div className="preview-line w80" />
                  <div className="preview-line w85" />
                  <div className="preview-line w70" />
                </div>

                <div className="preview-section">
                  <div className="preview-section-title short" />
                  <div className="preview-line w88" />
                  <div className="preview-line w72" />
                  <div className="preview-line w84" />
                </div>
              </div>
            </div>

            <div className="preview-floating-card preview-floating-card-top">
              <div className="preview-pill">AI Edit</div>
              <div className="preview-mini-line w80" />
              <div className="preview-mini-line w60" />
            </div>

            <div className="preview-floating-card preview-floating-card-bottom">
              <div className="preview-pill alt">CV</div>
              <div className="preview-mini-line w70" />
              <div className="preview-mini-line w50" />
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="landing-section">
        <div className="section-heading">
          <span className="section-kicker">Core Features</span>
          <h2>Built for real document work</h2>
          <p>
            Not just text generation. AdaptDoc gives you drafting, structure,
            editing, styling, and export in one flow.
          </p>
        </div>

        <div className="feature-grid">
          {features.map((item) => (
            <div key={item.title} className="feature-card">
              <div className="feature-icon">{item.icon}</div>
              <div className="card-accent" />
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="documents" className="landing-section alt">
        <div className="section-heading">
          <span className="section-kicker">Document Types</span>
          <h2>Create the documents people actually need</h2>
          <p>
            One workspace for applications, academic use, and business writing.
          </p>
        </div>

        <div className="doc-grid">
          {documentTypes.map((item) => (
            <div key={item.title} className="doc-card">
              <div className="doc-preview">
                <div className="doc-line w80" />
                <div className="doc-line w60" />
                <div className="doc-divider" />
                <div className="doc-line w90" />
                <div className="doc-line w70" />
              </div>

              <div className="doc-tag">{item.tag}</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="landing-section">
        <div className="section-heading">
          <span className="section-kicker">Workflow</span>
          <h2>A clean process from idea to document</h2>
          <p>
            No unnecessary steps. Just input, generate, refine, and export.
          </p>
        </div>

        <div className="steps-grid">
          {steps.map((step, index) => (
            <div key={step.title} className="step-card">
              <div className="step-number">{index + 1}</div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-section">
        <span className="section-kicker">Get Started</span>
        <h2>Stop wasting time rewriting documents</h2>
        <p>
          Build better CVs, letters, and proposals faster with AdaptDoc.
        </p>

        <div className="cta-actions">
          <Link to="/register" className="landing-primary-btn">
            Create Account
          </Link>
          <Link to="/login" className="landing-secondary-btn">
            Sign In
          </Link>
        </div>
      </section>

      <footer className="landing-footer">
  <div className="landing-footer-inner">

    <div className="footer-brand">
      <div className="footer-logo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <img src="/favicon.png" alt="AdaptDoc Logo" style={{ width: 24, height: 24, objectFit: 'contain' }} />
        AdaptDoc
      </div>
      <p>
        Create CVs, cover letters, and business documents faster with a
        structured and AI-assisted workflow.
      </p>
    </div>

    <div className="footer-links">
      <div className="footer-col">
        <h4>Product</h4>
        <a href="#features">Features</a>
        <a href="#documents">Documents</a>
        <a href="#how-it-works">Workflow</a>
      </div>

      <div className="footer-col">
        <h4>Account</h4>
        <Link to="/login">Sign In</Link>
        <Link to="/register">Get Started</Link>
      </div>

      <div className="footer-col">
        <h4>Other</h4>
        <Link to="/privacy">Privacy</Link>
        <Link to="/terms">Terms</Link>
      </div>
    </div>

  </div>

  <div className="landing-footer-bottom">
    © 2026 AdaptDoc. All rights reserved.
  </div>
</footer>
    </div>
  );
};

export default LandingPage;

import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css'; // Reuse landing page styling

const PrivacyPage = () => {
  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="landing-brand-wrap">
          <img src="/favicon.png" alt="AdaptDoc" style={{ width: 28, height: 28, objectFit: 'contain' }} />
          <Link to="/" className="landing-brand" style={{textDecoration: 'none'}}>AdaptDoc</Link>
        </div>
        <div className="landing-auth-links">
          <Link to="/login" className="landing-link-btn">Sign In</Link>
        </div>
      </header>

      <section className="hero-section" style={{ minHeight: '60vh', textAlign: 'left', alignItems: 'flex-start', paddingTop: '100px' }}>
        <div className="hero-content" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1>Privacy Policy</h1>
          <p style={{ marginBottom: '20px' }}>Last updated: {new Date().toLocaleDateString()}</p>
          
          <div style={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, fontSize: '1.1rem' }}>
            <h3 style={{ color: '#fff', marginTop: '20px', marginBottom: '10px' }}>1. Information We Collect</h3>
            <p style={{ marginBottom: '15px' }}>We collect information you provide directly to us, such as when you create or modify your account, use our AI generation services, or communicate with us. This includes your name, email address, and the document contents you provide for AI processing.</p>

            <h3 style={{ color: '#fff', marginTop: '20px', marginBottom: '10px' }}>2. How We Use Your Information</h3>
            <p style={{ marginBottom: '15px' }}>We use the information we collect to provide, maintain, and improve our services. Specifically, your document data is used exclusively to generate CVs, Cover Letters, and Proposals via our AI integration.</p>

            <h3 style={{ color: '#fff', marginTop: '20px', marginBottom: '10px' }}>3. Data Security</h3>
            <p style={{ marginBottom: '15px' }}>We implement reasonable security measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure.</p>

            <h3 style={{ color: '#fff', marginTop: '20px', marginBottom: '10px' }}>4. Third-Party Services</h3>
            <p style={{ marginBottom: '15px' }}>We use third-party AI services (like OpenAI or Google Gemini) to process document generation requests. Please refer to their respective privacy policies for details on their data handling practices.</p>

            <h3 style={{ color: '#fff', marginTop: '20px', marginBottom: '10px' }}>5. Contact Us</h3>
            <p style={{ marginBottom: '15px' }}>If you have any questions about this Privacy Policy, please contact us.</p>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-footer-inner" style={{ justifyContent: 'center' }}>
          <div className="landing-footer-bottom" style={{ border: 'none', marginTop: 0 }}>
            © {new Date().getFullYear()} AdaptDoc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPage;

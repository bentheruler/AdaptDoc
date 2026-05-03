import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const TermsPage = () => {
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
          <h1>Terms of Service</h1>
          <p style={{ marginBottom: '20px' }}>Last updated: {new Date().toLocaleDateString()}</p>
          
          <div style={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, fontSize: '1.1rem' }}>
            <h3 style={{ color: '#fff', marginTop: '20px', marginBottom: '10px' }}>1. Acceptance of Terms</h3>
            <p style={{ marginBottom: '15px' }}>By accessing and using AdaptDoc, you accept and agree to be bound by the terms and provision of this agreement.</p>

            <h3 style={{ color: '#fff', marginTop: '20px', marginBottom: '10px' }}>2. Description of Service</h3>
            <p style={{ marginBottom: '15px' }}>AdaptDoc provides an AI-assisted document generation platform for creating CVs, Cover Letters, and Proposals. We reserve the right to modify or discontinue the service at any time.</p>

            <h3 style={{ color: '#fff', marginTop: '20px', marginBottom: '10px' }}>3. User Conduct</h3>
            <p style={{ marginBottom: '15px' }}>You agree to use the service only for lawful purposes. You are responsible for all content that you generate or transmit via the platform.</p>

            <h3 style={{ color: '#fff', marginTop: '20px', marginBottom: '10px' }}>4. Intellectual Property</h3>
            <p style={{ marginBottom: '15px' }}>You retain ownership of the content you create using AdaptDoc. The platform itself, including its design, templates, and code, is the property of AdaptDoc.</p>

            <h3 style={{ color: '#fff', marginTop: '20px', marginBottom: '10px' }}>5. Disclaimer of Warranties</h3>
            <p style={{ marginBottom: '15px' }}>The service is provided on an "AS IS" and "AS AVAILABLE" basis. We make no warranties that the service will meet your requirements or be uninterrupted.</p>
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

export default TermsPage;

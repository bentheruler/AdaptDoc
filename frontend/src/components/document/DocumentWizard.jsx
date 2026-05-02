import React, { useState } from 'react';


const SparkleIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z" />
  </svg>
);

const DocumentWizard = ({ docType, data, onDataChange, onGenerateAI, aiLoading, onNextStep }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [localAiLoading, setLocalAiLoading] = useState(false);

  const getSteps = () => {
    if (docType === 'cv') {
      return [
        { id: 'basics', label: 'Basic Info', fields: [{ key: 'name', label: 'Full Name' }, { key: 'title', label: 'Job Title' }, { key: 'email1', label: 'Email' }, { key: 'phone', label: 'Phone' }, { key: 'location', label: 'Location' }, { key: 'linkedin', label: 'LinkedIn URL' }] },
        { id: 'summary', label: 'Summary', fields: [{ key: 'summary', label: 'Professional Summary', multiline: true, aiPrompt: 'Write a professional summary based on my job title.' }] },
        { id: 'experience', label: 'Experience', fields: [{ key: 'experience', label: 'Experience Details (Format: Role · Company · Period \n Bullet points)', multiline: true }] },
        { id: 'education', label: 'Education', fields: [{ key: 'education', label: 'Education (Comma separated or one per line)', multiline: true, aiPrompt: 'Suggest a standard format for a University education entry.' }] },
        { id: 'skills', label: 'Skills', fields: [{ key: 'skills', label: 'Skills (Comma separated)', multiline: true, aiPrompt: 'Suggest a list of skills relevant to my job title.' }] },
      ];
    }
    if (docType === 'cover_letter') {
      return [
        { id: 'sender', label: 'Your Details', fields: [{ key: 'senderName', label: 'Full Name' }, { key: 'senderTitle', label: 'Title' }, { key: 'senderEmail', label: 'Email' }, { key: 'senderLocation', label: 'Location' }] },
        { id: 'recipient', label: 'Recipient Details', fields: [{ key: 'recipientName', label: 'Hiring Manager Name' }, { key: 'recipientTitle', label: 'Hiring Manager Title' }, { key: 'companyName', label: 'Company Name' }, { key: 'companyLocation', label: 'Company Location' }, { key: 'date', label: 'Date' }] },
        { id: 'content', label: 'Letter Content', fields: [{ key: 'subject', label: 'Subject Line', aiPrompt: 'Write a subject line for my cover letter.' }, { key: 'opening', label: 'Opening Paragraph', multiline: true, aiPrompt: 'Write an opening paragraph for a cover letter.' }, { key: 'body1', label: 'Body Paragraph 1', multiline: true, aiPrompt: 'Write a body paragraph for a cover letter highlighting my experience.' }, { key: 'body2', label: 'Body Paragraph 2', multiline: true, aiPrompt: 'Write a body paragraph for a cover letter highlighting my skills.' }, { key: 'closing', label: 'Closing Paragraph', multiline: true, aiPrompt: 'Write a closing paragraph for a cover letter.' }] }
      ];
    }
    if (docType === 'business_proposal') {
      return [
        { id: 'client', label: 'Client Details', fields: [{ key: 'clientName', label: 'Client Name' }, { key: 'clientCompany', label: 'Client Company' }, { key: 'clientEmail', label: 'Client Email' }, { key: 'date', label: 'Date' }] },
        { id: 'provider', label: 'Your Details', fields: [{ key: 'providerName', label: 'Your Name' }, { key: 'providerCompany', label: 'Your Company' }, { key: 'providerEmail', label: 'Your Email' }] },
        { id: 'project', label: 'Project Info', fields: [{ key: 'projectName', label: 'Project Name' }, { key: 'projectSummary', label: 'Project Summary', multiline: true, aiPrompt: 'Write a business proposal project summary.' }] },
        { id: 'scope', label: 'Scope & Terms', fields: [{ key: 'objectives', label: 'Objectives', multiline: true, aiPrompt: 'Write business proposal objectives.' }, { key: 'timeline', label: 'Timeline', multiline: true }, { key: 'pricing', label: 'Pricing Info', multiline: true }, { key: 'terms', label: 'Terms & Conditions', multiline: true }] }
      ];
    }
    // Simple fallback for others
    return [{ id: 'all', label: 'All Fields', fields: [] }];
  };

  const steps = getSteps();
  const step = steps[currentStep];

  const handleFieldChange = (key, val) => {
    onDataChange((prev) => ({ ...prev, [key]: val }));
  };

  const handleAIGenerateField = async (field) => {
    if (!field.aiPrompt) return;
    setLocalAiLoading(true);
    // Call AI just for this section using the global AI hook
    // We pass the current data as context
    try {
      const res = await fetch('/api/ai/chat-edit', { // use generic fetch or axios if hook not perfect
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` },
        body: JSON.stringify({
          documentData: data,
          messages: [{ role: 'user', content: field.aiPrompt }]
        })
      });
      const result = await res.json();
      if (result.updatedDocument && result.updatedDocument[field.key]) {
        handleFieldChange(field.key, result.updatedDocument[field.key]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLocalAiLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--card-bg)' }}>
      {/* Step Indicators */}
      <div style={{ display: 'flex', gap: '8px', padding: '16px 20px', borderBottom: '1px solid var(--border-color)', overflowX: 'auto' }}>
        {steps.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setCurrentStep(i)}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: currentStep === i ? '1px solid var(--accent-color)' : '1px solid var(--border-color)',
              background: currentStep === i ? 'var(--accent-subtle)' : 'transparent',
              color: currentStep === i ? 'var(--accent-color)' : 'var(--text-secondary)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              fontSize: '13px',
              fontWeight: currentStep === i ? 600 : 400,
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Form Area */}
      <div style={{ flex: 1, padding: '24px 32px', overflowY: 'auto' }}>
        <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: 600 }}>{step.label}</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {step.fields.map(f => (
            <div key={f.key}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>{f.label}</label>
                {f.aiPrompt && (
                  <button
                    onClick={() => handleAIGenerateField(f)}
                    disabled={localAiLoading}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '4px',
                      background: 'transparent', border: 'none', color: 'var(--accent-color)',
                      fontSize: '12px', fontWeight: 600, cursor: 'pointer'
                    }}
                  >
                    <SparkleIcon /> {localAiLoading ? 'Generating...' : 'AI Assist'}
                  </button>
                )}
              </div>
              {f.key === 'experience' ? (
                <div>
                  {(data[f.key] || []).map((exp, idx) => (
                    <div key={idx} style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: '8px', marginBottom: '12px', background: 'var(--bg-color)' }}>
                      <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Job Title</label>
                          <input type="text" value={exp.role || ''} onChange={(e) => {
                            const newExp = [...(data[f.key] || [])];
                            newExp[idx].role = e.target.value;
                            handleFieldChange(f.key, newExp);
                          }} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--surface)', color: 'var(--text-primary)' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Employer</label>
                          <input type="text" value={exp.company || ''} onChange={(e) => {
                            const newExp = [...(data[f.key] || [])];
                            newExp[idx].company = e.target.value;
                            handleFieldChange(f.key, newExp);
                          }} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--surface)', color: 'var(--text-primary)' }} />
                        </div>
                      </div>
                      <div style={{ marginBottom: '12px' }}>
                        <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Start & End Date</label>
                        <input type="text" value={exp.period || ''} onChange={(e) => {
                          const newExp = [...(data[f.key] || [])];
                          newExp[idx].period = e.target.value;
                          handleFieldChange(f.key, newExp);
                        }} placeholder="e.g. Mar 2020 - Present" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--surface)', color: 'var(--text-primary)' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Description / Achievements</label>
                        <textarea value={Array.isArray(exp.bullets) ? exp.bullets.join('\n') : (exp.bullets || '')} onChange={(e) => {
                          const newExp = [...(data[f.key] || [])];
                          newExp[idx].bullets = e.target.value.split('\n');
                          handleFieldChange(f.key, newExp);
                        }} style={{ width: '100%', minHeight: '80px', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--surface)', color: 'var(--text-primary)', resize: 'vertical' }} />
                      </div>
                      <button onClick={() => {
                        const newExp = (data[f.key] || []).filter((_, i) => i !== idx);
                        handleFieldChange(f.key, newExp);
                      }} style={{ marginTop: '12px', background: 'transparent', border: 'none', color: '#ef4444', fontSize: '12px', cursor: 'pointer' }}>Remove Experience</button>
                    </div>
                  ))}
                  <button onClick={() => {
                    handleFieldChange(f.key, [...(data[f.key] || []), { role: '', company: '', period: '', bullets: [] }]);
                  }} style={{ color: 'var(--accent-color)', background: 'transparent', border: '1px dashed var(--accent-color)', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', width: '100%', fontWeight: 500 }}>+ Add Employment History</button>
                </div>
              ) : f.multiline ? (
                <textarea
                  value={
                    Array.isArray(data[f.key]) 
                    ? data[f.key].join('\n')
                    : (typeof data[f.key] === 'object' && data[f.key] !== null) 
                      ? JSON.stringify(data[f.key], null, 2)
                      : (data[f.key] || '')
                  }
                  onChange={(e) => {
                     let val = e.target.value;
                     if (f.key === 'skills' || f.key === 'education' || f.key === 'projects' || f.key === 'certifications') {
                       val = val.split('\n');
                     }
                     handleFieldChange(f.key, val);
                  }}
                  style={{
                    width: '100%', minHeight: '120px', padding: '12px',
                    borderRadius: '8px', border: '1px solid var(--border-color)',
                    background: 'var(--bg-color)', color: 'var(--text-primary)',
                    fontFamily: 'inherit', fontSize: '14px', resize: 'vertical'
                  }}
                />
              ) : (
                <input
                  type="text"
                  value={data[f.key] || ''}
                  onChange={(e) => handleFieldChange(f.key, e.target.value)}
                  style={{
                    width: '100%', padding: '12px',
                    borderRadius: '8px', border: '1px solid var(--border-color)',
                    background: 'var(--bg-color)', color: 'var(--text-primary)',
                    fontFamily: 'inherit', fontSize: '14px'
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 32px', borderTop: '1px solid var(--border-color)', background: 'var(--surface)' }}>
        <button
          onClick={() => setCurrentStep(c => Math.max(0, c - 1))}
          style={{
            padding: '8px 16px', borderRadius: '6px', border: '1px solid var(--border-color)',
            background: 'transparent', color: 'var(--text-primary)',
            cursor: currentStep === 0 ? 'not-allowed' : 'pointer', opacity: currentStep === 0 ? 0.5 : 1
          }}
          disabled={currentStep === 0}
        >
          Previous
        </button>
        <button
          onClick={() => {
            if (currentStep < steps.length - 1) setCurrentStep(c => c + 1);
            else if (onNextStep) onNextStep();
          }}
          style={{
            padding: '8px 20px', borderRadius: '6px', border: 'none',
            background: 'var(--accent-color)', color: '#fff', fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          {currentStep === steps.length - 1 ? 'Finish' : 'Next Step'}
        </button>
      </div>
    </div>
  );
};

export default DocumentWizard;

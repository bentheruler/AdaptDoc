import { useState, useRef, useEffect } from 'react';

/* ══════════════════════════════════════════════════
   QUICK-ACTION CHIPS
══════════════════════════════════════════════════ */
const QUICK_ACTIONS = {
  cv: [
    { label: '🎯 Make it concise', prompt: 'Shorten the summary to 2–3 sentences and trim any bullet points that are redundant.' },
    { label: '💼 More professional tone', prompt: 'Rewrite the summary and bullet points in a formal, professional tone.' },
    { label: '✨ Strengthen bullets', prompt: 'Rewrite each experience bullet point to start with a strong action verb and include a measurable outcome where possible.' },
    { label: '🔍 ATS-friendly', prompt: 'Rewrite the summary and skills section to be more ATS-friendly with strong keywords.' },
    { label: '📈 Add impact numbers', prompt: 'Add specific metrics or percentages to the experience bullet points to quantify achievements.' },
    { label: '🗑 Remove email2', prompt: 'Remove the secondary email address field from the document.' },
  ],
  cover_letter: [
    { label: '🎯 Make it concise', prompt: 'Shorten the cover letter body paragraphs. Keep them punchy — no more than 3 short paragraphs total.' },
    { label: '🔥 More enthusiastic', prompt: 'Rewrite the opening and closing paragraphs to sound more enthusiastic and passionate about the role.' },
    { label: '💼 More formal', prompt: 'Rewrite the body in a more formal, polished tone suitable for a corporate environment.' },
    { label: '🏢 Tailor to company', prompt: 'Adjust the body paragraphs to more specifically address how my skills match the company and role mentioned.' },
    { label: '✏ Fix grammar', prompt: 'Fix any grammar or spelling issues in the letter without changing the meaning.' },
  ],
  business_proposal: [
    { label: '📣 Stronger pitch', prompt: 'Rewrite the executive summary to be more persuasive and client-focused.' },
    { label: '🎯 Be more specific', prompt: 'Make the problem statement and proposed solution more specific and concrete.' },
    { label: '💼 More formal tone', prompt: 'Rewrite the entire proposal in a more formal, executive-level tone.' },
    { label: '✂ Make it shorter', prompt: 'Shorten all text sections by 30% while keeping the key points.' },
    { label: '💰 Justify the budget', prompt: 'Add a brief justification for the budget in the closing note.' },
  ],
};

/* ══════════════════════════════════════════════════
   ICONS
══════════════════════════════════════════════════ */
const SendIcon = () => (
  <svg width={15} height={15} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const BotIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    <line x1="12" y1="3" x2="12" y2="7" />
    <circle cx="9" cy="15" r="1" fill="currentColor" />
    <circle cx="15" cy="15" r="1" fill="currentColor" />
  </svg>
);

const SparkIcon = () => (
  <svg width={10} height={10} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
  </svg>
);

const TypingDots = () => (
  <div style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '4px 2px' }}>
    <style>{`
      @keyframes td{0%,80%,100%{transform:scale(0.6);opacity:0.4}40%{transform:scale(1);opacity:1}}
    `}</style>
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: '#94a3b8',
          animation: `td 1.2s ${i * 0.2}s infinite ease-in-out`,
        }}
      />
    ))}
  </div>
);

/* ══════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════ */
const WELCOME = `Hi! I'm your AI editor. Tell me what you'd like to change and I'll update the document instantly.

Try:
• "Make the summary shorter"
• "Change the tone to be more formal"
• "Remove the secondary email"
• "Strengthen my bullet points"`;

const CustomizationPanel = ({
  cvData,
  onCVUpdate,
  coverLetterData,
  onCoverLetterUpdate,
  proposalData,
  onProposalUpdate,
  docType = 'cv',
}) => {

  const storageKey = `adapt_doc_ai_chat_${docType}`;

  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [{ role: 'assistant', text: WELCOME }];
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [updateCount, setUpdateCount] = useState(0);

  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(messages));
    } catch (e) {}
  }, [messages, storageKey]);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(storageKey);
      if (saved) {
        setMessages(JSON.parse(saved));
      } else {
        setMessages([{ role: 'assistant', text: WELCOME }]);
      }
    } catch (e) {
      setMessages([{ role: 'assistant', text: WELCOME }]);
    }
    setInput('');
  }, [docType, storageKey]);

  const currentData =
    docType === 'cv'
      ? cvData
      : docType === 'cover_letter'
      ? coverLetterData
      : proposalData;

  const applyUpdate = (updated) => {
    if (docType === 'cv') {
      onCVUpdate?.(updated);
    } else if (docType === 'cover_letter') {
      onCoverLetterUpdate?.(updated);
    } else {
      onProposalUpdate?.(updated);
    }

    setUpdateCount((prev) => prev + 1);
  };

  const send = async (overrideText) => {
    const text = (overrideText || input).trim();
    if (!text || loading) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setLoading(true);

    try {
      const payload = {
        documentData: currentData,
        messages: [
          ...messages.slice(1).map((m) => ({
            role: m.role,
            content: m.text,
          })),
          { role: 'user', content: text },
        ],
      };

      const hostname = window.location.hostname;
      const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.');
      const API_BASE = isLocalhost ? `http://${hostname}:5000` : (process.env.REACT_APP_API_URL?.replace('http://', 'https://') || 'https://adaptdoc.onrender.com');

      const response = await fetch(`${API_BASE}/api/ai/chat-edit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || data?.error || 'API error');
      }

      let updatedDoc = null;

      if (data.updatedDocument && typeof data.updatedDocument === 'object') {
        updatedDoc = data.updatedDocument;
        applyUpdate(updatedDoc);
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: data.reply || `Done. Updated with ${data.provider || 'AI'}.`,
          hadUpdate: !!updatedDoc,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `⚠ ${err.message || 'Something went wrong. Please try again.'}`,
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
  };

  const quickActions = QUICK_ACTIONS[docType] || [];
  const docLabel =
    docType === 'cv' ? 'CV' : docType === 'cover_letter' ? 'Cover Letter' : 'Proposal';

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <div style={s.headerLeft}>
          <div style={s.botBadge}>
            <BotIcon />
          </div>
          <div>
            <div style={s.headerTitle}>AI Editor</div>
            <div style={s.headerSub}>Editing · {docLabel}</div>
          </div>
        </div>

        {updateCount > 0 && (
          <div style={s.updateBadge}>
            <SparkIcon />
            {updateCount} update{updateCount > 1 ? 's' : ''}
          </div>
        )}
      </div>

      <div style={s.chipZone}>
        <div style={s.chipLabel}>Quick actions</div>
        {/* Horizontal scrollable single-line chip strip */}
        <div className="chip-slider" style={s.chipRow}>
          {quickActions.map((a) => (
            <button
              key={a.label}
              type="button"
              onClick={() => send(a.prompt)}
              disabled={loading}
              style={{ ...s.chip, ...(loading ? s.chipDisabled : {}), flexShrink: 0 }}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>

      <div style={s.messages}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
              gap: 2,
            }}
          >
            {msg.role === 'assistant' && i > 0 && (
              <div style={s.avatarRow}>
                <div style={s.botAvatar}><BotIcon /></div>
                <span style={s.avatarLabel}>AI Editor</span>
              </div>
            )}

            <div
              style={{
                ...s.bubble,
                ...(msg.role === 'user' ? s.bubbleUser : s.bubbleBot),
                ...(msg.isError ? s.bubbleError : {}),
                marginLeft: msg.role === 'assistant' ? 22 : 0,
              }}
            >
              {msg.text}
            </div>

            {msg.role === 'assistant' && msg.hadUpdate && (
              <div style={{ ...s.updatedPill, marginLeft: 22 }}>
                ✓ Document updated
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
            <div style={s.avatarRow}>
              <div style={s.botAvatar}><BotIcon /></div>
              <span style={s.avatarLabel}>AI Editor</span>
            </div>
            <div style={{ ...s.bubble, ...s.bubbleBot, marginLeft: 22 }}>
              <TypingDots />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div style={s.inputWrap}>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder={`Ask me to edit your ${docLabel}…`}
          rows={2}
          style={s.textarea}
        />

        <button
          type="button"
          onClick={() => send()}
          disabled={loading || !input.trim()}
          style={{ ...s.sendBtn, ...(loading || !input.trim() ? s.sendBtnDisabled : {}) }}
          title="Send (Enter)"
        >
          <SendIcon />
        </button>
      </div>

      <div style={s.hint}>Enter to send · Shift+Enter for new line</div>
    </div>
  );
};

/* ══════════════════════════════════════════════════
   STYLES
══════════════════════════════════════════════════ */
const s = {
  wrap: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    background: 'transparent',
    fontFamily: "'Inter','Segoe UI',sans-serif",
    overflow: 'hidden',
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 16px 12px',
    borderBottom: '1px solid var(--border-color)',
    flexShrink: 0,
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 10 },
  botBadge: {
    width: 32,
    height: 32,
    borderRadius: 9,
    background: 'linear-gradient(135deg,#1e3a5f,#3b82f6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    flexShrink: 0,
  },
  headerTitle: { fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' },
  headerSub: { fontSize: 10, color: 'var(--text-secondary)', marginTop: 1 },
  updateBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 10,
    fontWeight: 700,
    color: '#14b8a6',
    background: 'rgba(20,184,166,0.1)',
    border: '1px solid rgba(20,184,166,0.3)',
    padding: '3px 8px',
    borderRadius: 20,
  },

  chipZone: {
    padding: '8px 14px 6px',
    borderBottom: '1px solid var(--border-color)',
    flexShrink: 0,
  },
  chipLabel: {
    fontSize: 9,
    fontWeight: 700,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    marginBottom: 5,
  },
  // Single-line horizontal scroll — no wrap, hidden scrollbar
  chipRow: {
    display: 'flex',
    flexWrap: 'nowrap',
    gap: 5,
    overflowX: 'auto',
    scrollbarWidth: 'none',   // Firefox
    msOverflowStyle: 'none',  // IE/Edge
    paddingBottom: 2,
  },
  chip: {
    padding: '4px 9px',
    borderRadius: 20,
    border: '1.5px solid #e2e8f0',
    background: '#f8fafc',
    color: '#334155',
    fontSize: 11,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.13s',
    lineHeight: 1.3,
  },
  chipDisabled: { opacity: 0.45, cursor: 'not-allowed' },

  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '14px 14px 8px',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    minHeight: 0,
  },
  avatarRow: { display: 'flex', alignItems: 'center', gap: 5 },
  botAvatar: {
    width: 16,
    height: 16,
    borderRadius: 5,
    background: '#eef2f9',
    color: '#1e3a5f',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarLabel: { fontSize: 10, fontWeight: 600, color: '#64748b' },
  bubble: {
    maxWidth: '88%',
    padding: '9px 12px',
    borderRadius: 10,
    fontSize: 12,
    lineHeight: 1.55,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  bubbleUser: {
    background: '#1e3a5f',
    color: '#fff',
    borderRadius: '10px 10px 2px 10px',
    alignSelf: 'flex-end',
  },
  bubbleBot: {
    background: 'var(--card-bg)',
    color: 'var(--text-primary)',
    borderRadius: '2px 10px 10px 10px',
  },
  bubbleError: {
    background: '#fef2f2',
    color: '#dc2626',
    border: '1px solid #fee2e2',
  },
  updatedPill: {
    fontSize: 10,
    fontWeight: 600,
    color: '#14b8a6',
    background: 'rgba(20,184,166,0.1)',
    border: '1px solid rgba(20,184,166,0.3)',
    padding: '2px 8px',
    borderRadius: 20,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
  },

  inputWrap: {
    display: 'flex',
    gap: 8,
    padding: '10px 14px 4px',
    borderTop: '1px solid var(--border-color)',
    flexShrink: 0,
    alignItems: 'flex-end',
  },
  textarea: {
    flex: 1,
    padding: '9px 11px',
    borderRadius: 9,
    border: '1.5px solid var(--border-color)',
    background: 'var(--bg-color)',
    fontSize: 12,
    color: 'var(--text-primary)',
    resize: 'none',
    fontFamily: 'inherit',
    lineHeight: 1.45,
    outline: 'none',
    transition: 'border-color 0.15s',
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 9,
    border: 'none',
    background: '#1e3a5f',
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'background 0.15s',
  },
  sendBtnDisabled: { background: '#cbd5e1', cursor: 'not-allowed' },
  hint: {
    fontSize: 10,
    color: '#94a3b8',
    textAlign: 'center',
    paddingBottom: 10,
    flexShrink: 0,
  },
};

export default CustomizationPanel;

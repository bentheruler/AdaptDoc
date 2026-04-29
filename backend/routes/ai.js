const express = require('express');
const router = express.Router();

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
const detectDocType = (documentData = {}) => {
  if (
    'senderName' in documentData ||
    'companyName' in documentData ||
    'opening' in documentData ||
    'signoff' in documentData
  ) {
    return 'cover_letter';
  }

  if (
    'executiveSummary' in documentData ||
    'problemStatement' in documentData ||
    'proposedSolution' in documentData ||
    'deliverables' in documentData
  ) {
    return 'business_proposal';
  }

  return 'cv';
};

const getDocumentSchemaExample = (docType) => {
  if (docType === 'cover_letter') {
    return {
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
      signoff: '',
      signature: '',
    };
  }

  if (docType === 'business_proposal') {
    return {
      title: '',
      subtitle: '',
      preparedBy: '',
      preparedFor: '',
      date: '',
      version: '',
      executiveSummary: '',
      problemStatement: '',
      proposedSolution: '',
      deliverables: [],
      timeline: [
        {
          phase: '',
          duration: '',
          desc: '',
        },
      ],
      budget: '',
      validity: '',
      closingNote: '',
      contactName: '',
      contactEmail: '',
    };
  }

  return {
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
    experience: [
      {
        role: '',
        company: '',
        period: '',
        bullets: [],
      },
    ],
    projects: [],
    certifications: [],
    references: '',
  };
};

const getStructureHint = (docType) => {
  if (docType === 'cover_letter') {
    return `The document is a cover letter with fields: senderName, senderTitle, senderLocation, senderEmail, date, recipientName, recipientTitle, companyName, companyLocation, subject, opening, body1, body2, body3, closing, signoff, signature.`;
  }

  if (docType === 'business_proposal') {
    return `The document is a business proposal with fields: title, subtitle, preparedBy, preparedFor, date, version, executiveSummary, problemStatement, proposedSolution, deliverables, timeline, budget, validity, closingNote, contactName, contactEmail.`;
  }

  return `The document is a CV with fields: name, phone, email1, email2, linkedin, title, location, summary, skills, education, experience, projects, certifications, references.`;
};

const buildUnifiedSystemPrompt = (docType, documentData) => {
  const exampleSchema = getDocumentSchemaExample(docType);

  return `You are the AdaptDoc AI editor.

${getStructureHint(docType)}

Current document type: ${docType}

Current document data:
${JSON.stringify(documentData, null, 2)}

Your job:
- edit the document based on the user's request
- preserve the same document type
- return the FULL updated document object
- never remove required fields unless the user explicitly asks
- keep arrays as arrays
- keep object fields as objects
- do not output markdown
- do not output code fences
- do not output explanation outside JSON

Return ONLY valid JSON in exactly this shape:
{
  "reply": "short helpful response",
  "updatedDocument": ${JSON.stringify(exampleSchema, null, 2)}
}

Rules:
1. "reply" must be short.
2. "updatedDocument" must contain the FULL updated document object.
3. If no edit is needed, return the original object unchanged in updatedDocument.
4. Output JSON only.`;
};

const normalizeMessagesForOpenAI = (messages = []) =>
  messages.map((m) => ({
    role: m.role,
    content: typeof m.content === 'string' ? m.content : String(m.content || ''),
  }));

const extractGeminiText = (data) => {
  return data?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || '';
};

const safeParseJSON = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

const cleanAIJsonText = (text = '') => {
  return text.replace(/```json/gi, '').replace(/```/g, '').trim();
};

const parsePossiblyWrappedJSON = (text = '') => {
  const cleaned = cleanAIJsonText(text);

  let parsed = safeParseJSON(cleaned);
  if (parsed) return parsed;

  const objectMatch = cleaned.match(/\{[\s\S]*\}/);
  if (objectMatch) {
    parsed = safeParseJSON(objectMatch[0]);
    if (parsed) return parsed;
  }

  return null;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/* ─────────────────────────────────────────────
   OPENAI FALLBACK
───────────────────────────────────────────── */
const callOpenAI = async ({ systemPrompt, messages }) => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4.1-mini',
      temperature: 0.2,
      max_tokens: 3000,
      messages: [
        { role: 'system', content: systemPrompt },
        ...normalizeMessagesForOpenAI(messages),
      ],
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || 'OpenAI request failed');
  }

  const text = data?.choices?.[0]?.message?.content || '';
  console.log('OpenAI raw response length:', text.length);
  console.log('OpenAI raw response preview:', text.slice(0, 500));
  console.log('OpenAI raw response ending:', text.slice(-200));

  const parsed = parsePossiblyWrappedJSON(text);

  if (!parsed) {
    throw new Error('OpenAI returned invalid JSON');
  }

  return parsed;
};

/* ─────────────────────────────────────────────
   GEMINI PRIMARY
───────────────────────────────────────────── */
const callGemini = async ({ systemPrompt, messages }) => {
  const joinedConversation = messages
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join('\n\n');

  let lastError;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: systemPrompt }],
            },
            contents: [
              {
                parts: [
                  {
                    text: joinedConversation,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 3000,
              responseMimeType: 'application/json',
            },
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error?.message || 'Gemini request failed');
      }

      const text = extractGeminiText(data);

      console.log('Gemini raw response length:', text.length);
      console.log('Gemini raw response preview:', text.slice(0, 500));
      console.log('Gemini raw response ending:', text.slice(-200));

      const parsed = parsePossiblyWrappedJSON(text);

      if (!parsed) {
        throw new Error('Gemini returned invalid JSON');
      }

      return parsed;
    } catch (error) {
      lastError = error;

      const msg = error.message || '';
      const retryable =
        msg.includes('high demand') ||
        msg.includes('try again later') ||
        msg.includes('timeout') ||
        msg.includes('503') ||
        msg.includes('429');

      if (!retryable || attempt === 3) {
        throw lastError;
      }

      await sleep(1500 * attempt);
    }
  }

  throw lastError;
};

/* ─────────────────────────────────────────────
   UNIFIED CHAT EDIT ROUTE
───────────────────────────────────────────── */
router.post('/chat-edit', async (req, res) => {
  try {
    const { messages, documentData } = req.body;

    if (!messages || !Array.isArray(messages) || !documentData || typeof documentData !== 'object') {
      return res.status(400).json({
        message: 'messages and documentData are required',
      });
    }

    const docType = detectDocType(documentData);
    const systemPrompt = buildUnifiedSystemPrompt(docType, documentData);

    let result = null;
    let provider = 'gemini';

    try {
      result = await callGemini({ systemPrompt, messages });
    } catch (geminiError) {
      console.error('Gemini failed, falling back to OpenAI:', geminiError.message);
      provider = 'openai';
      result = await callOpenAI({ systemPrompt, messages });
    }

    if (!result || typeof result !== 'object') {
      return res.status(500).json({
        message: 'AI returned an invalid result',
      });
    }

    return res.json({
      provider,
      docType,
      reply: result.reply || 'Done.',
      updatedDocument: result.updatedDocument || documentData,
    });
  } catch (error) {
    console.error('Unified chat-edit error:', error);
    return res.status(500).json({
      message: 'AI editing is temporarily unavailable. Please try again in a moment.',
      error: error.message,
    });
  }
});

module.exports = router;
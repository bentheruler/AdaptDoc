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
- edit the document based ONLY on the user's request and the provided context.
- preserve the same document type.
- return the FULL updated document object.
- NEVER remove required fields unless the user explicitly asks.
- NEVER hallucinate or invent work history, education, or skills that are not implied by the user's prompt or existing data.
- Keep arrays as arrays, and object fields as objects.
- Do not output markdown.
- Do not output code fences.
- Do not output explanation outside JSON.

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
   GEMINI CALLER
───────────────────────────────────────────── */
const callGemini = async ({ systemPrompt, messages, modelName }) => {
  const joinedConversation = messages
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join('\n\n');

  let lastError;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${process.env.GEMINI_API_KEY}`,
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
        throw new Error(data?.error?.message || `Gemini ${modelName} request failed`);
      }

      const text = extractGeminiText(data);
      const parsed = parsePossiblyWrappedJSON(text);

      if (!parsed) {
        throw new Error(`Gemini ${modelName} returned invalid JSON`);
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
   GENERATE ROUTE — creates a full document from user inputs
───────────────────────────────────────────── */
router.post('/generate', async (req, res) => {
  try {
    const { docType, userData } = req.body;

    if (!docType || !userData) {
      return res.status(400).json({ message: 'docType and userData are required' });
    }

    // Build a generation prompt based on doc type and user-supplied info
    const buildGeneratePrompt = () => {
      if (docType === 'cv') {
        return `Generate a professional CV for the following person. Return ONLY valid JSON with this exact shape:
{
  "content": {
    "basics": { "name": "", "title": "", "email": "", "phone": "", "location": "", "linkedin": "", "summary": "" },
    "skills": [],
    "education": [{ "degree": "", "institution": "", "date": "" }],
    "work": [{ "role": "", "company": "", "period": "", "bullets": [] }],
    "projects": [],
    "certifications": [],
    "references": "Available upon request"
  }
}
User data: ${JSON.stringify(userData)}
- Write a compelling professional summary based on the job title and experience provided.
- Generate realistic, professional bullet points for each work experience.
- If skills are provided, keep them. If not, suggest relevant skills based on the job title.
- Do not hallucinate dates or companies not mentioned.
- Output JSON only, no explanation.`;
      }

      if (docType === 'cover_letter') {
        return `Generate a professional cover letter. Return ONLY valid JSON with this exact shape:
{
  "content": {
    "senderName": "", "senderTitle": "", "senderLocation": "", "senderEmail": "",
    "date": "", "recipientName": "", "recipientTitle": "", "companyName": "", "companyLocation": "",
    "subject": "", "opening": "", "body1": "", "body2": "", "body3": "", "closing": "",
    "signoff": "Sincerely,", "signature": ""
  }
}
User data: ${JSON.stringify(userData)}
- Write a compelling subject line, engaging opening, two strong body paragraphs, and a professional closing.
- Use the sender's name and email as-is. Fill in the recipient fields from user data.
- Output JSON only, no explanation.`;
      }

      if (docType === 'business_proposal') {
        return `Generate a professional business proposal. Return ONLY valid JSON with this exact shape:
{
  "content": {
    "title": "", "subtitle": "Technical Proposal", "preparedBy": "", "preparedFor": "",
    "date": "", "version": "v1.0", "executiveSummary": "", "problemStatement": "",
    "proposedSolution": "", "deliverables": [], "timeline": [{"phase":"","duration":"","desc":""}],
    "budget": "", "validity": "30 days", "closingNote": "", "contactName": "", "contactEmail": ""
  }
}
User data: ${JSON.stringify(userData)}
- Write a compelling executive summary, clear problem statement, and proposed solution.
- Generate 3-5 realistic deliverables as an array of strings.
- Output JSON only, no explanation.`;
      }

      return `Generate a professional document. User data: ${JSON.stringify(userData)}. Return valid JSON.`;
    };

    const systemPrompt = `You are an expert professional document writer for AdaptDoc.
Your job is to generate a complete, high-quality, realistic document based on user-provided information.
CRITICAL RULES:
- Return ONLY valid JSON. No markdown, no explanation, no code fences.
- Fill in all fields intelligently. Do NOT leave important fields empty.
- Write professional, specific content — avoid generic filler text.
- If a field was provided by the user, use it as-is. Enhance or fill missing fields.`;

    const messages = [{ role: 'user', content: buildGeneratePrompt() }];

    let result = null;
    let provider = 'gemini-2.5-flash-lite';

    try {
      result = await callGemini({ systemPrompt, messages, modelName: provider });
    } catch (geminiError) {
      console.error('Primary model failed, trying fallback:', geminiError.message);
      provider = 'gemini-2.0-flash-lite';
      result = await callGemini({ systemPrompt, messages, modelName: provider });
    }

    if (!result || typeof result !== 'object') {
      return res.status(500).json({ message: 'AI returned an invalid result' });
    }

    // The result should have a "content" key — unwrap it if wrapped
    const content = result.content || result;

    return res.json({ provider, docType, content });
  } catch (error) {
    console.error('Generate route error:', error);
    return res.status(500).json({
      message: 'AI generation is temporarily unavailable. Please try again.',
      error: error.message,
    });
  }
});

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
    let provider = 'gemini-2.5-flash-lite';

    try {
      result = await callGemini({ systemPrompt, messages, modelName: provider });
    } catch (geminiError) {
      console.error('Primary Gemini model failed, falling back to gemini-2.0-flash-lite:', geminiError.message);
      provider = 'gemini-2.5-flash-lite';
      result = await callGemini({ systemPrompt, messages, modelName: provider });
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
/**
 * @service promptService
 * @description Constructs dynamic prompts for document generation.
 * Ensures AI returns structured valid JSON for all document types.
 */
class PromptService {
  /**
   * CV / Resume prompt
   * @param {Object} userData
   * @returns {string}
   */
  getResumePrompt(userData) {
    return `
Generate a complete, detailed, and professional CV using the user data below.

USER DATA:
${JSON.stringify(userData, null, 2)}

Follow this exact CV structure:

1. basics
- name
- phone
- email
- linkedin
- title
- location
- summary

2. work
- reverse chronological order
- each work item must contain:
  - role
  - company
  - period
  - bullets (array of at least 3 concise achievement/responsibility statements)

3. education
- most recent first
- each education item must contain:
  - degree
  - institution
  - graduationDate

4. skills
- array of relevant technical and professional skills

5. projects
- optional array of project names or short project descriptions

6. certifications
- optional array of certifications

7. references
- string, default to "Available upon request"

Rules:
- Do not include birth date or marital status.
- The summary must be 3 to 4 lines.
- The CV must be realistic, detailed, and professionally written.
- Include projects and certifications only if relevant or inferable from the input.
- Return ONLY valid JSON.
- Do not return markdown.
- Do not return explanations.

Return JSON in this exact format:
{
  "basics": {
    "name": "",
    "phone": "",
    "email": "",
    "linkedin": "",
    "title": "",
    "location": "",
    "summary": ""
  },
  "work": [
    {
      "role": "",
      "company": "",
      "period": "",
      "bullets": ["", "", ""]
    }
  ],
  "education": [
    {
      "degree": "",
      "institution": "",
      "graduationDate": ""
    }
  ],
  "skills": ["", ""],
  "projects": ["", ""],
  "certifications": ["", ""],
  "references": "Available upon request"
}
    `.trim();
  }

  /**
   * Cover Letter prompt
   * @param {Object} userData
   * @param {string} jobDescription
   * @returns {string}
   */
  getCoverLetterPrompt(userData, jobDescription = '') {
    return `
Generate a complete, detailed, and professional cover letter using the user data below.

USER DATA:
${JSON.stringify(userData, null, 2)}

JOB DESCRIPTION:
${jobDescription || 'Not provided'}

The cover letter must be tailored to the role if a job description is provided.

Use this exact structure:

- senderName
- senderTitle
- senderLocation
- senderEmail
- date
- recipientName
- recipientTitle
- companyName
- companyLocation
- subject
- opening
- body1
- body2
- body3
- closing
- signoff
- signature

Rules:
- Keep the tone professional, polished, and realistic.
- opening should introduce the role and candidate interest.
- body1 should explain relevant qualifications and strengths.
- body2 should connect the user's experience/skills to the employer's needs.
- body3 should reinforce fit and enthusiasm.
- closing should include a polite call to action.
- signoff should be something like "Sincerely," or "Kind regards,".
- signature should normally match senderName.
- If recipient details are missing, infer professional placeholders like Hiring Manager.
- Return ONLY valid JSON.
- Do not return markdown.
- Do not return explanations.

Return JSON in this exact format:
{
  "senderName": "",
  "senderTitle": "",
  "senderLocation": "",
  "senderEmail": "",
  "date": "",
  "recipientName": "",
  "recipientTitle": "",
  "companyName": "",
  "companyLocation": "",
  "subject": "",
  "opening": "",
  "body1": "",
  "body2": "",
  "body3": "",
  "closing": "",
  "signoff": "",
  "signature": ""
}
    `.trim();
  }

  /**
   * Business / Project Proposal prompt
   * @param {Object} proposalData
   * @returns {string}
   */
  getProposalPrompt(proposalData) {
    return `
Generate a complete, detailed, and professional business/project proposal using the details below.

PROPOSAL DATA:
${JSON.stringify(proposalData, null, 2)}

Use this exact structure:

- title
- subtitle
- preparedBy
- preparedFor
- date
- version
- executiveSummary
- problemStatement
- proposedSolution
- deliverables (array of strings)
- timeline (array of objects with phase, duration, desc)
- budget
- validity
- closingNote
- contactName
- contactEmail

Rules:
- Make the proposal realistic, clear, and professional.
- executiveSummary should be concise but persuasive.
- problemStatement should explain the issue or need.
- proposedSolution should clearly explain the recommended approach.
- deliverables must be a string array.
- timeline must be an array of objects with:
  - phase
  - duration
  - desc
- budget should be professionally phrased even if exact numbers are not provided.
- validity should indicate how long the proposal remains valid.
- closingNote should end with a strong professional closing statement.
- Return ONLY valid JSON.
- Do not return markdown.
- Do not return explanations.

Return JSON in this exact format:
{
  "title": "",
  "subtitle": "",
  "preparedBy": "",
  "preparedFor": "",
  "date": "",
  "version": "",
  "executiveSummary": "",
  "problemStatement": "",
  "proposedSolution": "",
  "deliverables": ["", ""],
  "timeline": [
    {
      "phase": "",
      "duration": "",
      "desc": ""
    }
  ],
  "budget": "",
  "validity": "",
  "closingNote": "",
  "contactName": "",
  "contactEmail": ""
}
    `.trim();
  }

  /**
   * Unified prompt getter
   * @param {string} docType
   * @param {Object} userData
   * @returns {string}
   */
  getPrompt(docType, userData) {
    switch (docType) {
      case 'cover_letter':
        return this.getCoverLetterPrompt(userData, userData?.jobDescription || '');
      case 'business_proposal':
        return this.getProposalPrompt(userData);
      case 'cv':
      default:
        return this.getResumePrompt(userData);
    }
  }
}

module.exports = new PromptService();

import { useState } from 'react';
import { generateDocumentAI } from '../services/aiService';

export const useAI = () => {
  const [aiLoading, setAiLoading] = useState(false);

  /**
   * handleGenerate — calls the /api/ai/generate endpoint and maps the response
   * back into the correct document state (cv, cover_letter, or business_proposal).
   *
   * @param {object} params
   * @param {string}   params.docType           - 'cv' | 'cover_letter' | 'business_proposal'
   * @param {object}   params.currentFields     - current form data to send as user context
   * @param {function} params.setCvData         - state setter for CV
   * @param {function} params.setCoverLetterData- state setter for cover letter
   * @param {function} params.setProposalData   - state setter for proposal
   * @param {function} params.mapAICvToPreview  - mapper for AI CV response → preview shape
   * @param {number}   [params.requestId]       - unique stamp to force re-runs
   */
  const handleGenerate = async ({
    docType,
    currentFields,
    setCvData,
    setCoverLetterData,
    setProposalData,
    mapAICvToPreview,
  }) => {
    try {
      setAiLoading(true);

      const res = await generateDocumentAI(docType, currentFields);
      console.log('AI generate response:', res);

      const content = res?.content;

      if (!content) {
        throw new Error('AI returned no usable document content.');
      }

      if (docType === 'cv') {
        // CV response has a nested "basics/work/skills" shape — map it to preview fields
        setCvData((prev) => ({
          ...prev,
          ...mapAICvToPreview(content),
        }));
      } else if (docType === 'cover_letter') {
        // Cover letter response is a flat object matching state keys directly
        setCoverLetterData((prev) => ({
          ...prev,
          ...content,
        }));
      } else if (docType === 'business_proposal') {
        // Proposal response is a flat object matching state keys directly
        setProposalData((prev) => ({
          ...prev,
          ...content,
        }));
      }

      return res;
    } catch (error) {
      console.error('AI generation failed:', error.response?.data || error.message || error);
      const msg = error.response?.data?.message || error.response?.data?.error || error.message || 'AI generation failed';
      alert(msg);
      return null;
    } finally {
      setAiLoading(false);
    }
  };

  return {
    aiLoading,
    handleGenerate,
  };
};
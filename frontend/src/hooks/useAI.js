import { useState } from 'react';
import { generateDocumentAI } from '../services/aiService';

export const useAI = () => {
  const [aiLoading, setAiLoading] = useState(false);

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
      console.log('AI response:', res);

      if (docType === 'cv' && res.content) {
        setCvData((prev) => ({
          ...prev,
          ...mapAICvToPreview(res.content),
        }));
      } else if (docType === 'cover_letter' && res.content) {
        setCoverLetterData((prev) => ({
          ...prev,
          ...res.content,
        }));
      } else if (docType === 'business_proposal' && res.content) {
        setProposalData((prev) => ({
          ...prev,
          ...res.content,
        }));
      } else {
        alert('AI returned no usable document content.');
      }

      return res;
    } catch (error) {
      console.error('AI generation failed:', error.response?.data || error.message || error);
      alert(error.response?.data?.error || 'AI generation failed');
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
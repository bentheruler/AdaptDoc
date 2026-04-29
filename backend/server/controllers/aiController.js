const FailoverManager = require('../services/ai/FailoverManager');
const promptService = require('../services/promptService');

/**
 * @controller AIController
 * @description Handles requests for AI content generation.
 */
class AIController {
  /**
   * Generates document content based on type and user input.
   * POST /api/ai/generate
   */
  async generateContent(req, res) {
    const { docType, userData, jobDescription } = req.body;

    if (!docType || !userData) {
      return res.status(400).json({
        error: 'Missing required fields: docType, userData'
      });
    }

    try {
      let normalizedDocType;

      switch (docType.toLowerCase()) {
        case 'cv':
        case 'resume':
          normalizedDocType = 'cv';
          break;

        case 'coverletter':
        case 'cover_letter':
        case 'cover-letter':
          normalizedDocType = 'cover_letter';
          break;

        case 'proposal':
        case 'business_proposal':
        case 'business-proposal':
          normalizedDocType = 'business_proposal';
          break;

        default:
          return res.status(400).json({
            error: `Unsupported docType: ${docType}`
          });
      }

      const result = await FailoverManager.generateDocument(
        normalizedDocType,
        {
          ...userData,
          jobDescription: jobDescription || ''
        },
        req.user.id
      );

      return res.json({
        success: true,
        documentType: result.documentType,
        content: result.content,
        provider: result.provider
      });

    } catch (error) {
      console.error('AI Generation Endpoint Error:', error.message);
      return res.status(500).json({
        error: error.message
      });
    }
  }
}

module.exports = new AIController();

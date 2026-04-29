const { GoogleGenerativeAI } = require('@google/generative-ai');
const AIProvider = require('./AIProvider');
const promptService = require('../promptService');

/**
 * @class GeminiService
 * @description Implementation of AIProvider using Google's Gemini API.
 */
class GeminiService extends AIProvider {
  constructor() {
    super();
    this.model = null;
  }

  init() {
    if (!this.model) {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is missing in .env');
      }

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

      this.model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash-lite',
        generationConfig: {
          temperature: 0.7,
        },
      });
    }
  }

  /**
   * Generates raw text using Gemini from a ready-made prompt.
   * @param {string} prompt
   * @returns {Promise<string>}
   */
  async generate(prompt) {
    try {
      this.init();

      const result = await this.model.generateContent(prompt);
      const response = await result.response;

      return response.text();
    } catch (error) {
      console.error('Gemini Error:', error.message);
      throw error;
    }
  }

  /**
   * Generates structured document content using docType + userData.
   * @param {string} docType
   * @param {Object} userData
   * @returns {Promise<Object>}
   */
  async generateDocument(docType, userData) {
    try {
      const prompt = promptService.getPrompt(docType, userData);
      const rawText = await this.generate(prompt);

      let parsed;
      try {
        const cleanedText = rawText
  .replace(/```json/gi, '')
  .replace(/```/g, '')
  .trim();

parsed = JSON.parse(cleanedText);
      } catch (parseError) {
        console.error('Gemini returned invalid JSON:', rawText);
        throw new Error('Gemini returned invalid JSON');
      }

      return {
        documentType: docType,
        content: parsed,
        provider: 'gemini',
      };
    } catch (error) {
      console.error('Gemini generateDocument error:', error.message);
      throw error;
    }
  }
}

module.exports = GeminiService;

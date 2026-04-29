const OpenAI = require('openai');
const AIProvider = require('./AIProvider');
const promptService = require('../promptService');

/**
 * @class OpenAIService
 * @description Implementation of AIProvider using OpenAI's GPT models.
 */
class OpenAIService extends AIProvider {
  constructor() {
    super();
    this.openai = null;
  }

  /**
   * Initializes the OpenAI client lazily.
   */
  init() {
    if (!this.openai) {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY is missing in .env');
      }

      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
  }

  /**
   * Generates raw text using OpenAI from a ready-made prompt.
   * @param {string} prompt
   * @returns {Promise<string>}
   */
  async generate(prompt) {
    try {
      this.init();

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI Error:', error.message);
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
        console.error('OpenAI returned invalid JSON:', rawText);
        throw new Error('OpenAI returned invalid JSON');
      }

      return {
        documentType: docType,
        content: parsed,
        provider: 'openai',
      };
    } catch (error) {
      console.error('OpenAI generateDocument error:', error.message);
      throw error;
    }
  }
}

module.exports = OpenAIService;

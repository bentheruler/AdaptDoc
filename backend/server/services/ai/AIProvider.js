/**
 * @class AIProvider
 * @description Abstract base class for AI service implementations.
 * This ensures all AI services follow a common structure for generating content.
 */
class AIProvider {
  /**
   * Generates structured text using the AI model.
   * @param {string} prompt - The prompt to send to the AI.
   * @returns {Promise<string>} - The AI-generated content.
   * @throws {Error} - If the subclass hasn't implemented this method.
   */
  async generate(prompt) {
    throw new Error('Method "generate()" must be implemented.');
  }
}

module.exports = AIProvider;

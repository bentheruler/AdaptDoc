const GeminiService = require('./GeminiService');
const OpenAIService = require('./OpenAIService');
const SystemSetting = require('../../../models/SystemSetting');
const AIRequestLog = require('../../../models/AIRequestLog');

/**
 * @class FailoverManager
 * @description Manages AI service selection, failover logic, and metrics logging.
 */
class FailoverManager {
  constructor() {
    this.primary = new GeminiService();
    this.secondary = new OpenAIService();
    this.timeoutLimit = 60000;
  }

  async callWithTimeout(provider, docType, userData) {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('AI response timeout')), this.timeoutLimit)
    );

    return Promise.race([
      provider.generateDocument(docType, userData),
      timeoutPromise
    ]);
  }

  async generateDocument(docType, userData, userId) {
    const startTime = Date.now();
    let providerUsed = 'gemini';
    let success = false;
    let errorMessage = null;
    let contentResult = null;

    try {
      const settings = await SystemSetting.find({});
      const settingsMap = settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
      
      let preferredProvider = settingsMap['preferredProvider'] || 'gemini';
      let fallbackEnabled = settingsMap['fallbackEnabled'] !== false; // default true
      let maintenanceMode = settingsMap['maintenanceMode'] === true; // default false

      if (maintenanceMode) {
        throw new Error('AI Services are currently in maintenance mode. Please try again later.');
      }

      if (preferredProvider === 'openai') {
        providerUsed = 'openai';
        try {
          contentResult = await this.callWithTimeout(this.secondary, docType, userData);
        } catch (error) {
          if (fallbackEnabled) {
            console.warn('OpenAI failed. Switching to Gemini...', error.message);
            providerUsed = 'gemini';
            contentResult = await this.callWithTimeout(this.primary, docType, userData);
          } else {
            throw error;
          }
        }
      } else {
        providerUsed = 'gemini';
        try {
          contentResult = await this.callWithTimeout(this.primary, docType, userData);
        } catch (error) {
          if (fallbackEnabled) {
            console.warn('Gemini failed or timed out. Switching to OpenAI...', error.message);
            providerUsed = 'openai';
            contentResult = await this.callWithTimeout(this.secondary, docType, userData);
          } else {
            throw error;
          }
        }
      }
      
      success = true;
      providerUsed = contentResult.provider || providerUsed;
      return contentResult;

    } catch (error) {
      success = false;
      errorMessage = error.message;
      console.error('FailoverManager generation failed:', errorMessage);
      throw new Error(errorMessage || 'All AI providers failed. Please try again later.');
    } finally {
      const latencyMs = Date.now() - startTime;
      if (userId) {
         await AIRequestLog.create({
           user: userId,
           provider: providerUsed,
           documentType: docType,
           success,
           errorMessage,
           latencyMs
         }).catch(err => console.error('Failed to log AI request:', err.message));
      }
    }
  }
}

module.exports = new FailoverManager();

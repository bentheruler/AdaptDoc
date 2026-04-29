/**
 * @file server/services/resumeRenderService.js
 * @description Main rendering service that converts AI JSON data into HTML using document-specific themes.
 */

const coverLetterTemplates = require('../templates/coverLetter');
const proposalTemplates = require('../templates/proposal');

class ResumeRenderService {
  /**
   * Main rendering function.
   * @param {string} docType - 'cv', 'coverLetter', or 'proposal'
   * @param {Object} content - The JSON data from AI
   * @param {string} theme - The theme name (e.g., 'classic', 'formal', 'elegant')
   * @returns {string} - The fully rendered HTML string
   */
  renderDocument(docType, content, theme = 'default') {
    try {
      switch (docType.toLowerCase()) {
        case 'cv':
        case 'resume':
          return this.renderCV(content, theme);
        
        case 'coverletter':
          return this.renderCoverLetter(content, theme);
        
        case 'proposal':
          return this.renderProposal(content, theme);
        
        default:
          throw new Error(`Unsupported document type: ${docType}`);
      }
    } catch (error) {
      console.error("Rendering Error:", error.message);
      return `<h1>Rendering Error</h1><p>${error.message}</p>`;
    }
  }

  /**
   * Render a CV using JSON Resume themes.
   * Note: requires the theme package to be installed #jsonresume-theme-${theme}.
   */
  renderCV(content, theme) {
    try {
      // In a real implementation, we would use: const themePackage = require(`jsonresume-theme-${theme}`);
      // For this school project placeholder, we return a structured HTML view.
      return `
        <!DOCTYPE html>
        <html>
        <head><title>CV Preview</title><style>body { font-family: sans-serif; padding: 20px; }</style></head>
        <body>
          <h1>${content.basics?.name || 'CV Preview'}</h1>
          <p>${content.basics?.summary || 'No summary provided.'}</p>
          <hr/>
          <p><em>(In production, this would be rendered using the npm package: jsonresume-theme-${theme})</em></p>
        </body>
        </html>
      `;
    } catch (e) {
      throw new Error(`CV Theme '${theme}' not found or failed to render.`);
    }
  }

  /**
   * Render a Cover Letter using internal templates.
   */
  renderCoverLetter(content, theme) {
    const template = coverLetterTemplates[theme] || coverLetterTemplates.classic;
    return template(content);
  }

  /**
   * Render a Proposal using internal templates.
   */
  renderProposal(content, theme) {
    const template = proposalTemplates[theme] || proposalTemplates.formal;
    return template(content);
  }

  /**
   * Returns a list of available themes for the frontend team.
   */
  getAvailableThemes() {
    return {
      cv: ['elegant', 'flat', 'kendall'],
      coverLetter: Object.keys(coverLetterTemplates),
      proposal: Object.keys(proposalTemplates)
    };
  }
}

module.exports = new ResumeRenderService();

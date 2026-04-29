const resumeRenderService = require('../services/resumeRenderService');

/**
 * @controller TemplateController
 * @description Handles requests for template and theme information.
 */
class TemplateController {
  /**
   * Returns a list of available themes for each document type.
   * GET /api/templates/themes
   */
  async getThemes(req, res) {
    try {
      const themes = resumeRenderService.getAvailableThemes();
      return res.json({ success: true, themes });
    } catch (error) {
      console.error("Template Controller Error:", error.message);
      return res.status(500).json({ error: "Failed to fetch themes" });
    }
  }
}

module.exports = new TemplateController();

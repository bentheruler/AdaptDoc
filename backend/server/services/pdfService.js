const puppeteer = require('puppeteer');

/**
 * @service pdfService
 * @description Generates PDF files from HTML strings using Puppeteer.
 */
class PDFService {
  /**
   * Generates a PDF buffer from an HTML string. 
   * @param {string} html - The fully rendered HTML of the document.
   * @returns {Promise<Buffer>} - The generated PDF buffer.
   */
  async generatePDF(html) {
    try {
      const browser = await puppeteer.launch({ headless: 'new' });
      const page = await browser.newPage();
      
      // Set the content to our generated HTML
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      // Export as PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
        printBackground: true
      });
      
      await browser.close();
      return pdfBuffer;
    } catch (error) {
      console.error("Puppeteer PDF Error:", error.message);
      throw new Error(`Failed to generate PDF: ${error.message}`);
    }
  }
}

module.exports = new PDFService();

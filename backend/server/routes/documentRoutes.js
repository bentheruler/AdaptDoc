const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');

// GET /api/documents/:id/preview
router.get('/:id/preview', documentController.getPreview);

// GET /api/documents/:id/download
router.get('/:id/download', documentController.downloadPDF);

module.exports = router;

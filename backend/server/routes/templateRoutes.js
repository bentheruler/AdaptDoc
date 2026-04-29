const express = require('express');
const router = express.Router();
const templateController = require('../controllers/templateController');

// GET /api/templates/themes
router.get('/themes', templateController.getThemes);

module.exports = router;

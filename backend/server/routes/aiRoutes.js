const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const authMiddleware = require('../../middleware/authMiddleware');

// POST /api/ai/generate
router.post('/generate', authMiddleware, aiController.generateContent);

module.exports = router;

// server/routes/adminRoutes.js
// Routes for admin functionalities.

const express = require('express');
const User = require('../../models/User');
const Document = require('../../models/Document');
const AIRequestLog = require('../../models/AIRequestLog');
const SystemSetting = require('../../models/SystemSetting');
const authMiddleware = require('../../middleware/authMiddleware');
const adminMiddleware = require('../../middleware/adminMiddleware');

const router = express.Router();

// Helper to mask email
const maskEmail = (email) => {
  if (!email) return '';
  const parts = email.split('@');
  if (parts.length !== 2) return email;
  const name = parts[0];
  const domain = parts[1];
  if (name.length <= 2) return `${name[0]}***@${domain}`;
  return `${name[0]}***${name[name.length-1]}@${domain}`;
};

// Helper to mask name
const maskName = (name) => {
  if (!name) return '';
  const parts = name.split(' ');
  return parts.map(p => p[0] + '***').join(' ');
};

/* ─────────────────────────────────────────────
   ADMIN STATS
───────────────────────────────────────────── */
router.get('/stats', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'active' });
    const restrictedUsers = await User.countDocuments({ status: 'restricted' });
    
    const totalDocuments = await Document.countDocuments();
    const totalCVs = await Document.countDocuments({ type: 'cv' });
    const totalCoverLetters = await Document.countDocuments({ type: 'cover_letter' });
    const totalProposals = await Document.countDocuments({ type: 'business_proposal' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const documentsToday = await Document.countDocuments({ createdAt: { $gte: today } });
    const documentsThisWeek = await Document.countDocuments({ createdAt: { $gte: weekAgo } });

    res.json({
      totalUsers,
      activeUsers,
      restrictedUsers,
      totalDocuments,
      totalCVs,
      totalCoverLetters,
      totalProposals,
      documentsToday,
      documentsThisWeek
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load admin stats', error: error.message });
  }
});

/* ─────────────────────────────────────────────
   GET ALL USERS
───────────────────────────────────────────── */
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find({}, '-password').lean().sort({ createdAt: -1 });
    
    // Get document counts
    const userIds = users.map(u => u._id);
    const docCounts = await Document.aggregate([
      { $match: { user: { $in: userIds } } },
      { $group: { _id: "$user", count: { $sum: 1 } } }
    ]);
    
    const countMap = docCounts.reduce((acc, curr) => {
      acc[curr._id.toString()] = curr.count;
      return acc;
    }, {});

    const maskedUsers = users.map(u => ({
      ...u,
      name: maskName(u.name),
      email: maskEmail(u.email),
      documentCount: countMap[u._id.toString()] || 0
    }));

    res.json(maskedUsers);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load users', error: error.message });
  }
});

/* ─────────────────────────────────────────────
   UPDATE USER STATUS
───────────────────────────────────────────── */
router.put('/users/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body;

    if (req.user.id === req.params.id) {
      return res.status(400).json({ message: 'You cannot restrict your own admin account' });
    }

    if (!['active', 'restricted'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true, select: '-password' }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User status updated successfully',
      user: { ...user.toObject(), name: maskName(user.name), email: maskEmail(user.email) },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user status', error: error.message });
  }
});

/* ─────────────────────────────────────────────
   DELETE USER
───────────────────────────────────────────── */
router.delete('/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    if (req.user.id === req.params.id) {
      return res.status(400).json({ message: 'You cannot delete your own admin account here' });
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await Document.deleteMany({ user: req.params.id });
    await AIRequestLog.deleteMany({ user: req.params.id });

    res.json({ message: 'User and related documents deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user', error: error.message });
  }
});

/* ─────────────────────────────────────────────
   GET ALL DOCUMENTS
───────────────────────────────────────────── */
router.get('/documents', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const documents = await Document.find()
      .populate('user', 'name email role')
      .lean()
      .sort({ updatedAt: -1 });

    const maskedDocs = documents.map(doc => ({
      ...doc,
      user: doc.user ? {
        ...doc.user,
        name: maskName(doc.user.name),
        email: maskEmail(doc.user.email)
      } : null
    }));

    res.json(maskedDocs);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load documents', error: error.message });
  }
});

/* ─────────────────────────────────────────────
   DELETE DOCUMENT
───────────────────────────────────────────── */
router.delete('/documents/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const doc = await Document.findByIdAndDelete(req.params.id);

    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete document', error: error.message });
  }
});

/* ─────────────────────────────────────────────
   AI LOGS & METRICS
───────────────────────────────────────────── */
router.get('/ai-logs', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const logs = await AIRequestLog.find().sort({ createdAt: -1 }).limit(1000).lean();
    
    const aggregated = {
      gemini: { success: 0, fail: 0, totalLatency: 0 },
      openai: { success: 0, fail: 0, totalLatency: 0 },
      byDocType: {}
    };

    logs.forEach(log => {
      const p = log.provider;
      if (aggregated[p]) {
        if (log.success) aggregated[p].success++;
        else aggregated[p].fail++;
        if (log.success && log.latencyMs) aggregated[p].totalLatency += log.latencyMs;
      }
      
      const dt = log.documentType;
      if (!aggregated.byDocType[dt]) aggregated.byDocType[dt] = 0;
      aggregated.byDocType[dt]++;
    });

    const metrics = {
      raw: logs,
      stats: {
        gemini: {
          successRate: aggregated.gemini.success + aggregated.gemini.fail > 0 ? (aggregated.gemini.success / (aggregated.gemini.success + aggregated.gemini.fail)) * 100 : 0,
          avgLatency: aggregated.gemini.success > 0 ? aggregated.gemini.totalLatency / aggregated.gemini.success : 0
        },
        openai: {
          successRate: aggregated.openai.success + aggregated.openai.fail > 0 ? (aggregated.openai.success / (aggregated.openai.success + aggregated.openai.fail)) * 100 : 0,
          avgLatency: aggregated.openai.success > 0 ? aggregated.openai.totalLatency / aggregated.openai.success : 0
        },
        byDocType: aggregated.byDocType
      }
    };

    res.json(metrics);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load AI logs', error: error.message });
  }
});

/* ─────────────────────────────────────────────
   SETTINGS
───────────────────────────────────────────── */
router.get('/settings', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const settings = await SystemSetting.find();
    const settingsMap = settings.reduce((acc, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {});
    
    res.json({
      preferredProvider: settingsMap['preferredProvider'] || 'gemini',
      fallbackEnabled: settingsMap['fallbackEnabled'] !== false,
      maintenanceMode: settingsMap['maintenanceMode'] === true
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load settings', error: error.message });
  }
});

router.put('/settings', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { preferredProvider, fallbackEnabled, maintenanceMode } = req.body;
    
    if (preferredProvider) {
      await SystemSetting.findOneAndUpdate(
        { key: 'preferredProvider' },
        { value: preferredProvider },
        { upsert: true }
      );
    }
    
    if (fallbackEnabled !== undefined) {
      await SystemSetting.findOneAndUpdate(
        { key: 'fallbackEnabled' },
        { value: fallbackEnabled },
        { upsert: true }
      );
    }
    
    if (maintenanceMode !== undefined) {
      await SystemSetting.findOneAndUpdate(
        { key: 'maintenanceMode' },
        { value: maintenanceMode },
        { upsert: true }
      );
    }

    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update settings', error: error.message });
  }
});

module.exports = router;
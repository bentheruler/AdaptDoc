const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Document = require('../models/Document');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Protected routes
router.use(authMiddleware);

/* ─────────────────────────────────────────────
   GET USER PROFILE
───────────────────────────────────────────── */
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load user profile', error: error.message });
  }
});

/* ─────────────────────────────────────────────
   UPDATE USER PROFILE
───────────────────────────────────────────── */
router.put('/profile', async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if email is already used by another user
    if (normalizedEmail !== req.user.email) {
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser && existingUser._id.toString() !== req.user.id) {
        return res.status(400).json({ message: 'Email is already in use' });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name: name.trim(), email: normalizedEmail },
      { new: true, runValidators: true, select: '-password' }
    );

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
});

/* ─────────────────────────────────────────────
   CHANGE PASSWORD
───────────────────────────────────────────── */
router.put('/change-password', async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Old and new passwords are required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Old password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update password', error: error.message });
  }
});

/* ─────────────────────────────────────────────
   UPDATE APPEARANCE SETTINGS
───────────────────────────────────────────── */
router.put('/settings/appearance', async (req, res) => {
  try {
    const { theme, accentColor } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.settings) user.settings = { appearance: {} };
    if (!user.settings.appearance) user.settings.appearance = {};

    if (theme && ['light', 'dark'].includes(theme)) {
      user.settings.appearance.theme = theme;
    }
    if (accentColor) {
      user.settings.appearance.accentColor = accentColor;
    }

    await user.save();
    
    // Return updated user without password
    const updatedUser = await User.findById(req.user.id).select('-password');

    res.json({ message: 'Appearance settings updated successfully', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update appearance settings', error: error.message });
  }
});

/* ─────────────────────────────────────────────
   DELETE ALL DOCUMENTS
───────────────────────────────────────────── */
router.delete('/documents', async (req, res) => {
  try {
    const result = await Document.deleteMany({ user: req.user.id });
    res.json({ message: `Successfully deleted ${result.deletedCount} document(s)` });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete documents', error: error.message });
  }
});

/* ─────────────────────────────────────────────
   DELETE ACCOUNT
───────────────────────────────────────────── */
router.delete('/account', async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'Password is required to delete account' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect password' });
    }

    // Delete documents first
    await Document.deleteMany({ user: req.user.id });
    
    // Delete user
    await User.findByIdAndDelete(req.user.id);

    res.json({ message: 'Account and associated documents deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete account', error: error.message });
  }
});

module.exports = router;

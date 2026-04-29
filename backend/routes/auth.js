const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');

const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

/* ─────────────────────────────────────────────
   MAILER
───────────────────────────────────────────── */

const createTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

const sendVerificationEmail = async (user, token) => {
  const transporter = createTransporter();
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: user.email,
    subject: 'Verify your AdaptDoc account',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Verify your email</h2>
        <p>Hello ${user.name},</p>
        <p>Thanks for registering for AdaptDoc. Please verify your email by clicking the button below:</p>
        <p>
          <a href="${verifyUrl}" style="display:inline-block;padding:10px 18px;background:#1e3a5f;color:#fff;text-decoration:none;border-radius:6px;">
            Verify Email
          </a>
        </p>
        <p>If the button does not work, copy and paste this link into your browser:</p>
        <p>${verifyUrl}</p>
        <p>This link will expire in 24 hours.</p>
      </div>
    `,
  });
};

const sendPasswordResetEmail = async (user, token) => {
  const transporter = createTransporter();
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: user.email,
    subject: 'Reset your AdaptDoc password',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Password reset request</h2>
        <p>Hello ${user.name},</p>
        <p>We received a request to reset your password. Click the button below to continue:</p>
        <p>
          <a href="${resetUrl}" style="display:inline-block;padding:10px 18px;background:#1e3a5f;color:#fff;text-decoration:none;border-radius:6px;">
            Reset Password
          </a>
        </p>
        <p>If the button does not work, copy and paste this link into your browser:</p>
        <p>${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you did not request this, you can ignore this email.</p>
      </div>
    `,
  });
};

const createToken = () => crypto.randomBytes(32).toString('hex');

/* ─────────────────────────────────────────────
   ADMIN TEST
───────────────────────────────────────────── */
router.get('/admin-test', authMiddleware, adminMiddleware, (req, res) => {
  res.json({ message: 'Admin access granted' });
});

/* ─────────────────────────────────────────────
   REGISTER
───────────────────────────────────────────── */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const verificationToken = createToken();
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      isVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpiry,
    });

    await user.save();

    try {
      await sendVerificationEmail(user, verificationToken);
    } catch (mailError) {
      console.error('Verification email failed:', mailError.message);
    }

    res.status(201).json({
      message: 'User registered successfully. Please verify your email.',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ─────────────────────────────────────────────
   RESEND VERIFICATION EMAIL
───────────────────────────────────────────── */
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.json({
        message: 'If that email exists, a verification link has been sent.',
      });
    }

    if (user.isVerified) {
      return res.json({ message: 'This email is already verified.' });
    }

    const verificationToken = createToken();
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = verificationExpiry;
    await user.save();

    try {
      await sendVerificationEmail(user, verificationToken);
    } catch (mailError) {
      console.error('Resend verification email failed:', mailError.message);
    }

    res.json({
      message: 'If that email exists, a verification link has been sent.',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ─────────────────────────────────────────────
   VERIFY EMAIL
───────────────────────────────────────────── */
router.get('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        message: 'Invalid or expired verification token',
      });
    }

    user.isVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;

    await user.save();

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ─────────────────────────────────────────────
   LOGIN
───────────────────────────────────────────── */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: 'Please verify your email before logging in',
      });
    }

    if (user.status === 'restricted') {
      return res.status(403).json({ message: 'Account is restricted' });
    }

    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        isVerified: user.isVerified,
        settings: user.settings,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ─────────────────────────────────────────────
   GET CURRENT USER
───────────────────────────────────────────── */
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ─────────────────────────────────────────────
   REFRESH TOKEN
───────────────────────────────────────────── */
router.post('/refresh', (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token required' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const newAccessToken = jwt.sign(
      { id: decoded.id, role: decoded.role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({ accessToken: newAccessToken });
  } catch (err) {
    res.status(403).json({ message: 'Invalid refresh token' });
  }
});

/* ─────────────────────────────────────────────
   FORGOT PASSWORD
───────────────────────────────────────────── */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (user) {
      const resetToken = createToken();
      const resetExpiry = new Date(Date.now() + 60 * 60 * 1000);

      user.passwordResetToken = resetToken;
      user.passwordResetExpires = resetExpiry;
      await user.save();

      try {
        await sendPasswordResetEmail(user, resetToken);
      } catch (mailError) {
        console.error('Password reset email failed:', mailError.message);
      }
    }

    res.json({
      message: 'If that email exists, a password reset link has been sent.',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ─────────────────────────────────────────────
   RESET PASSWORD
───────────────────────────────────────────── */
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ message: 'New password is required' });
    }

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        message: 'Invalid or expired reset token',
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.passwordResetToken = null;
    user.passwordResetExpires = null;

    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ─────────────────────────────────────────────
   CHANGE PASSWORD
───────────────────────────────────────────── */
router.put('/change-password', authMiddleware, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Old password incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ─────────────────────────────────────────────
   LOGOUT
───────────────────────────────────────────── */
router.post('/logout', (req, res) => {
  return res.json({ message: 'Logged out successfully' });
});

module.exports = router;
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const User = require('../models/User');
const validate = require('../middleware/validate');

// Generate a signed JWT for a user
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// POST /api/auth/register
const register = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('course').optional().trim(),
  body('semester').optional().trim(),
  validate,
  async (req, res) => {
    try {
      const { name, email, password, course, semester } = req.body;

      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(400).json({ message: 'An account with this email already exists.' });
      }

      const user = await User.create({ name, email, password, course, semester });
      const token = generateToken(user._id);

      res.status(201).json({
        message: 'Registration successful',
        token,
        user
      });
    } catch (err) {
      res.status(500).json({ message: 'Registration failed. Please try again.' });
    }
  }
];

// POST /api/auth/login
const login = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
  async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email }).select('+password');
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }

      if (!user.isActive) {
        return res.status(401).json({ message: 'Your account has been deactivated.' });
      }

      const token = generateToken(user._id);

      // Return user without password
      const userData = user.toJSON();

      res.json({
        message: 'Login successful',
        token,
        user: userData
      });
    } catch (err) {
      res.status(500).json({ message: 'Login failed. Please try again.' });
    }
  }
];

// GET /api/auth/profile
const getProfile = async (req, res) => {
  res.json({ user: req.user });
};

// PUT /api/auth/profile
const updateProfile = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('course').optional().trim(),
  body('semester').optional().trim(),
  body('learningLevel').optional().isIn(['beginner', 'intermediate', 'advanced']),
  body('dailyStudyHours').optional().isFloat({ min: 0.5, max: 16 }),
  validate,
  async (req, res) => {
    try {
      const { name, course, semester, learningLevel, dailyStudyHours } = req.body;
      const updates = {};
      if (name !== undefined) updates.name = name;
      if (course !== undefined) updates.course = course;
      if (semester !== undefined) updates.semester = semester;
      if (learningLevel !== undefined) updates.learningLevel = learningLevel;
      if (dailyStudyHours !== undefined) updates.dailyStudyHours = dailyStudyHours;

      const user = await User.findByIdAndUpdate(req.user._id, updates, {
        new: true,
        runValidators: true
      });

      res.json({ message: 'Profile updated successfully', user });
    } catch (err) {
      res.status(500).json({ message: 'Failed to update profile.' });
    }
  }
];

// PUT /api/auth/change-password
const changePassword = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  validate,
  async (req, res) => {
    try {
      const user = await User.findById(req.user._id).select('+password');
      const match = await user.comparePassword(req.body.currentPassword);
      if (!match) {
        return res.status(400).json({ message: 'Current password is incorrect.' });
      }
      user.password = req.body.newPassword;
      await user.save();
      res.json({ message: 'Password changed successfully.' });
    } catch (err) {
      res.status(500).json({ message: 'Failed to change password.' });
    }
  }
];

module.exports = { register, login, getProfile, updateProfile, changePassword };

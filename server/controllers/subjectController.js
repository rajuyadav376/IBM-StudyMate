const { body } = require('express-validator');
const Subject = require('../models/Subject');
const Progress = require('../models/Progress');
const validate = require('../middleware/validate');

// GET /api/subjects
const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({ userId: req.user._id, isActive: true })
      .sort({ createdAt: -1 });
    res.json({ subjects });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch subjects.' });
  }
};

// GET /api/subjects/:id
const getSubject = async (req, res) => {
  try {
    const subject = await Subject.findOne({ _id: req.params.id, userId: req.user._id });
    if (!subject) return res.status(404).json({ message: 'Subject not found.' });
    res.json({ subject });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch subject.' });
  }
};

// POST /api/subjects
const createSubject = [
  body('name').trim().notEmpty().withMessage('Subject name is required'),
  body('examDate').optional().isISO8601().withMessage('Invalid exam date'),
  body('learningLevel').optional().isIn(['beginner', 'intermediate', 'advanced']),
  body('dailyStudyHours').optional().isFloat({ min: 0.5, max: 16 }),
  validate,
  async (req, res) => {
    try {
      const { name, description, examDate, learningLevel, dailyStudyHours, topics, color, icon } = req.body;

      const subject = await Subject.create({
        userId: req.user._id,
        name,
        description,
        examDate: examDate || null,
        learningLevel: learningLevel || req.user.learningLevel || 'beginner',
        dailyStudyHours: dailyStudyHours || req.user.dailyStudyHours || 2,
        topics: topics || [],
        color: color || '#3b82f6',
        icon: icon || '📚'
      });

      // Initialize a progress record for this subject
      await Progress.findOneAndUpdate(
        { userId: req.user._id, subject: subject.name },
        {
          $setOnInsert: {
            userId: req.user._id,
            subjectId: subject._id,
            subject: subject.name,
            topics: (topics || []).map(t => ({
              topicName: typeof t === 'string' ? t : t.name,
              completed: false
            })),
            progressPercentage: 0
          }
        },
        { upsert: true, new: true }
      );

      res.status(201).json({ message: 'Subject created successfully', subject });
    } catch (err) {
      res.status(500).json({ message: 'Failed to create subject.' });
    }
  }
];

// PUT /api/subjects/:id
const updateSubject = [
  body('name').optional().trim().notEmpty(),
  body('examDate').optional().isISO8601(),
  body('learningLevel').optional().isIn(['beginner', 'intermediate', 'advanced']),
  validate,
  async (req, res) => {
    try {
      const subject = await Subject.findOneAndUpdate(
        { _id: req.params.id, userId: req.user._id },
        { $set: req.body },
        { new: true, runValidators: true }
      );
      if (!subject) return res.status(404).json({ message: 'Subject not found.' });
      res.json({ message: 'Subject updated', subject });
    } catch (err) {
      res.status(500).json({ message: 'Failed to update subject.' });
    }
  }
];

// DELETE /api/subjects/:id
const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isActive: false },
      { new: true }
    );
    if (!subject) return res.status(404).json({ message: 'Subject not found.' });
    res.json({ message: 'Subject removed successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete subject.' });
  }
};

// POST /api/subjects/:id/topics  – add a topic to a subject
const addTopic = [
  body('name').trim().notEmpty().withMessage('Topic name is required'),
  validate,
  async (req, res) => {
    try {
      const subject = await Subject.findOne({ _id: req.params.id, userId: req.user._id });
      if (!subject) return res.status(404).json({ message: 'Subject not found.' });

      subject.topics.push({
        name: req.body.name,
        description: req.body.description || '',
        estimatedHours: req.body.estimatedHours || 1,
        order: subject.topics.length
      });
      await subject.save();

      // Keep Progress topics in sync
      await Progress.findOneAndUpdate(
        { userId: req.user._id, subject: subject.name },
        { $addToSet: { 'topics': { topicName: req.body.name, completed: false } } }
      );

      res.json({ message: 'Topic added', subject });
    } catch (err) {
      res.status(500).json({ message: 'Failed to add topic.' });
    }
  }
];

module.exports = { getSubjects, getSubject, createSubject, updateSubject, deleteSubject, addTopic };

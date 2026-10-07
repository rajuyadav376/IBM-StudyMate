const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  label: { type: String, required: true }, // A, B, C, D
  text: { type: String, required: true }
});

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [optionSchema],
  correctAnswer: { type: String, required: true }, // A, B, C, or D
  explanation: { type: String, default: '' },
  topic: { type: String, default: '' },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  }
});

const quizSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  topic: {
    type: String,
    required: true,
    trim: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'mixed'],
    default: 'mixed'
  },
  questions: [questionSchema],
  totalQuestions: {
    type: Number,
    default: 0
  },
  aiGenerated: {
    type: Boolean,
    default: false
  },
  cacheKey: {
    type: String,
    default: ''
  }
}, { timestamps: true });

quizSchema.index({ cacheKey: 1 });

module.exports = mongoose.model('Quiz', quizSchema);

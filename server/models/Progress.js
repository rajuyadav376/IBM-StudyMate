const mongoose = require('mongoose');

const topicProgressSchema = new mongoose.Schema({
  topicName: { type: String, required: true },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date, default: null },
  quizScore: { type: Number, default: 0 },
  studyTimeMinutes: { type: Number, default: 0 },
  isWeak: { type: Boolean, default: false }
});

const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    default: null
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  topics: [topicProgressSchema],
  completedTopics: [String],
  weakTopics: [String],
  strongTopics: [String],
  progressPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  quizAttempts: {
    type: Number,
    default: 0
  },
  quizAverage: {
    type: Number,
    default: 0
  },
  totalStudyMinutes: {
    type: Number,
    default: 0
  },
  lastStudied: {
    type: Date,
    default: null
  }
}, { timestamps: true });

progressSchema.index({ userId: 1, subject: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);

const mongoose = require('mongoose');

const dayPlanSchema = new mongoose.Schema({
  day: { type: Number, required: true },
  date: { type: String, default: '' },
  topic: { type: String, required: true },
  subtopics: [String],
  duration: { type: Number, default: 2 }, // hours
  type: {
    type: String,
    enum: ['learn', 'practice', 'revise', 'quiz'],
    default: 'learn'
  },
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  },
  completed: { type: Boolean, default: false }
});

const studyPlanSchema = new mongoose.Schema({
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
    required: [true, 'Subject is required'],
    trim: true
  },
  learningLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  examDate: {
    type: Date,
    required: [true, 'Exam date is required']
  },
  dailyHours: {
    type: Number,
    required: true,
    min: 0.5,
    max: 16
  },
  totalDays: {
    type: Number,
    default: 0
  },
  topics: [String],
  learningGoal: {
    type: String,
    default: ''
  },
  generatedPlan: [dayPlanSchema],
  summary: {
    type: String,
    default: ''
  },
  priorityTopics: [String],
  aiGenerated: {
    type: Boolean,
    default: false
  },
  cacheKey: {
    type: String,
    default: ''
  },
  completionPercentage: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Index for cache lookup
studyPlanSchema.index({ cacheKey: 1 });

module.exports = mongoose.model('StudyPlan', studyPlanSchema);

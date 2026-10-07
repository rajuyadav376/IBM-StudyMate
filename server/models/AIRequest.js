const mongoose = require('mongoose');

// Tracks AI requests for auditing and cost monitoring
const aiRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requestType: {
    type: String,
    enum: ['study-plan', 'explain', 'quiz', 'chat'],
    required: true
  },
  prompt: { type: String, default: '' },
  response: { type: String, default: '' },
  tokensUsed: { type: Number, default: 0 },
  usedMock: { type: Boolean, default: false },
  error: { type: String, default: null },
  durationMs: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('AIRequest', aiRequestSchema);

const Progress = require('../models/Progress');
const QuizAttempt = require('../models/QuizAttempt');

// GET /api/progress
const getProgress = async (req, res) => {
  try {
    const { subject } = req.query;
    const filter = { userId: req.user._id };
    if (subject) filter.subject = new RegExp(subject, 'i');

    const progress = await Progress.find(filter).sort({ updatedAt: -1 });
    res.json({ progress });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch progress.' });
  }
};

// GET /api/progress/summary
const getProgressSummary = async (req, res) => {
  try {
    const progress = await Progress.find({ userId: req.user._id });
    const attempts = await QuizAttempt.find({ userId: req.user._id });

    const overall = progress.length > 0
      ? Math.round(progress.reduce((s, p) => s + p.progressPercentage, 0) / progress.length)
      : 0;

    const quizAvg = attempts.length > 0
      ? Math.round(attempts.reduce((s, a) => s + a.score, 0) / attempts.length)
      : 0;

    const allWeak = [...new Set(progress.flatMap(p => p.weakTopics || []))];
    const allStrong = [...new Set(progress.flatMap(p => p.strongTopics || []))];

    res.json({
      overall,
      quizAverage: quizAvg,
      totalQuizAttempts: attempts.length,
      weakTopics: allWeak,
      strongTopics: allStrong,
      subjectCount: progress.length,
      completedTopicsCount: progress.reduce((s, p) => s + (p.completedTopics?.length || 0), 0)
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch progress summary.' });
  }
};

// PUT /api/progress
const updateProgress = async (req, res) => {
  try {
    const { subject, completedTopic, studyMinutes } = req.body;

    if (!subject) {
      return res.status(400).json({ message: 'Subject is required.' });
    }

    const progress = await Progress.findOneAndUpdate(
      { userId: req.user._id, subject },
      {
        $setOnInsert: { userId: req.user._id, subject, topics: [] },
        $addToSet: completedTopic ? { completedTopics: completedTopic } : undefined,
        $inc: studyMinutes ? { totalStudyMinutes: studyMinutes } : undefined,
        $set: { lastStudied: new Date() }
      },
      { upsert: true, new: true, runValidators: true }
    );

    // Recalculate percentage
    if (progress.topics.length > 0) {
      const completedCount = progress.completedTopics.length;
      progress.progressPercentage = Math.round((completedCount / progress.topics.length) * 100);
      await progress.save();
    }

    res.json({ message: 'Progress updated', progress });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update progress.' });
  }
};

// GET /api/progress/weak-topics
const getWeakTopics = async (req, res) => {
  try {
    const progress = await Progress.find({ userId: req.user._id });
    const allWeak = [...new Set(progress.flatMap(p => p.weakTopics || []))];

    // Get recent quiz attempts to show scores per weak topic
    const attempts = await QuizAttempt.find({ userId: req.user._id }).sort({ completedAt: -1 }).limit(50);

    const topicStats = {};
    attempts.forEach(a => {
      a.weakTopics.forEach(t => {
        if (!topicStats[t]) topicStats[t] = { attempts: 0, totalScore: 0, subject: a.subject };
        topicStats[t].attempts++;
        topicStats[t].totalScore += a.score;
      });
    });

    const weakTopicsWithStats = allWeak.map(topic => ({
      topic,
      subject: topicStats[topic]?.subject || '',
      attempts: topicStats[topic]?.attempts || 0,
      avgScore: topicStats[topic]?.attempts > 0
        ? Math.round(topicStats[topic].totalScore / topicStats[topic].attempts)
        : 0
    }));

    res.json({ weakTopics: weakTopicsWithStats });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch weak topics.' });
  }
};

module.exports = { getProgress, getProgressSummary, updateProgress, getWeakTopics };

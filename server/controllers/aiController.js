const aiService = require('../services/aiService');
const StudyPlan = require('../models/StudyPlan');
const Quiz = require('../models/Quiz');
const Progress = require('../models/Progress');
const crypto = require('crypto');

// Build a cache key for deduplication
const makeCacheKey = (type, params) => {
  const str = type + JSON.stringify(params);
  return crypto.createHash('md5').update(str).digest('hex');
};

// POST /api/ai/study-plan
const generateStudyPlan = async (req, res) => {
  try {
    const { subject, learningLevel, examDate, dailyHours, topics, learningGoal, subjectId } = req.body;

    if (!subject || !examDate || !dailyHours) {
      return res.status(400).json({ message: 'Subject, exam date, and daily hours are required.' });
    }

    const examDateObj = new Date(examDate);
    const today = new Date();
    const totalDays = Math.max(1, Math.ceil((examDateObj - today) / (1000 * 60 * 60 * 24)));

    const params = { subject, learningLevel: learningLevel || 'beginner', totalDays, dailyHours, topics: topics || [], learningGoal };
    const cacheKey = makeCacheKey('study-plan', params);

    // Check cache first — avoid duplicate AI calls
    const cached = await StudyPlan.findOne({ cacheKey, aiGenerated: true });
    if (cached) {
      // Clone the cached plan for this user
      const plan = await StudyPlan.create({
        userId: req.user._id,
        subjectId: subjectId || null,
        subject,
        learningLevel: learningLevel || 'beginner',
        examDate: examDateObj,
        dailyHours,
        totalDays,
        topics: topics || [],
        learningGoal: learningGoal || '',
        generatedPlan: cached.generatedPlan,
        summary: cached.summary,
        priorityTopics: cached.priorityTopics,
        aiGenerated: true,
        cacheKey
      });
      return res.json({ studyPlan: plan, cached: true, poweredBy: 'IBM watsonx.ai' });
    }

    // Call AI
    const result = await aiService.generateStudyPlan(req.user._id, params);

    const plan = await StudyPlan.create({
      userId: req.user._id,
      subjectId: subjectId || null,
      subject,
      learningLevel: learningLevel || 'beginner',
      examDate: examDateObj,
      dailyHours,
      totalDays,
      topics: topics || [],
      learningGoal: learningGoal || '',
      generatedPlan: result.generatedPlan || [],
      summary: result.summary || '',
      priorityTopics: result.priorityTopics || [],
      aiGenerated: true,
      cacheKey
    });

    res.json({ studyPlan: plan, cached: false, poweredBy: 'IBM watsonx.ai' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to generate study plan. Please try again.' });
  }
};

// POST /api/ai/explain
const explainTopic = async (req, res) => {
  try {
    const { topic, subject, level } = req.body;

    if (!topic) {
      return res.status(400).json({ message: 'Topic is required.' });
    }

    const explanation = await aiService.explainTopic(req.user._id, {
      topic,
      subject: subject || '',
      level: level || req.user.learningLevel || 'beginner'
    });

    res.json({ explanation, topic, level: level || 'beginner', poweredBy: 'IBM watsonx.ai' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to generate explanation. Please try again.' });
  }
};

// POST /api/ai/quiz
const generateQuiz = async (req, res) => {
  try {
    const { subject, topic, difficulty, numQuestions } = req.body;

    if (!subject || !topic) {
      return res.status(400).json({ message: 'Subject and topic are required.' });
    }

    const params = { subject, topic, difficulty: difficulty || 'mixed', numQuestions: numQuestions || 5 };
    const cacheKey = makeCacheKey('quiz', params);

    // Check cache
    const cached = await Quiz.findOne({ cacheKey, aiGenerated: true });
    if (cached) {
      return res.json({ quiz: cached, cached: true, poweredBy: 'IBM watsonx.ai' });
    }

    const result = await aiService.generateQuiz(req.user._id, params);

    const quiz = await Quiz.create({
      userId: req.user._id,
      subject,
      topic,
      difficulty: difficulty || 'mixed',
      questions: result.questions || [],
      totalQuestions: result.questions?.length || 0,
      aiGenerated: true,
      cacheKey
    });

    res.json({ quiz, cached: false, poweredBy: 'IBM watsonx.ai' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to generate quiz. Please try again.' });
  }
};

// POST /api/ai/chat
const chat = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ message: 'Message cannot be empty.' });
    }

    // Build user context for smarter responses
    const progress = await Progress.find({ userId: req.user._id }).lean();
    const weakTopics = [...new Set(progress.flatMap(p => p.weakTopics || []))];
    const subjects = progress.map(p => p.subject);
    const avgProgress = progress.length > 0
      ? Math.round(progress.reduce((sum, p) => sum + p.progressPercentage, 0) / progress.length)
      : 0;

    const userContext = {
      name: req.user.name,
      learningLevel: req.user.learningLevel,
      dailyStudyHours: req.user.dailyStudyHours,
      subjects,
      weakTopics,
      progressPercentage: avgProgress,
      recentSubject: subjects[0] || null
    };

    const response = await aiService.chat(req.user._id, message.trim(), userContext);

    res.json({ response, poweredBy: 'IBM watsonx.ai' });
  } catch (err) {
    res.status(500).json({ message: 'AI assistant unavailable. Please try again.' });
  }
};

module.exports = { generateStudyPlan, explainTopic, generateQuiz, chat };

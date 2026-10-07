const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const Progress = require('../models/Progress');

// GET /api/quizzes  – quizzes available to user
const getQuizzes = async (req, res) => {
  try {
    const { subject, topic } = req.query;
    const filter = { userId: req.user._id };
    if (subject) filter.subject = new RegExp(subject, 'i');
    if (topic) filter.topic = new RegExp(topic, 'i');

    const quizzes = await Quiz.find(filter)
      .select('-questions.correctAnswer -questions.explanation')
      .sort({ createdAt: -1 });

    res.json({ quizzes });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch quizzes.' });
  }
};

// GET /api/quizzes/:id  – get quiz with questions (no answers)
const getQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .select('-questions.correctAnswer -questions.explanation');
    if (!quiz) return res.status(404).json({ message: 'Quiz not found.' });
    res.json({ quiz });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch quiz.' });
  }
};

// POST /api/quizzes/:id/submit
const submitQuiz = async (req, res) => {
  try {
    const { answers, timeTaken } = req.body;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: 'Answers array is required.' });
    }

    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found.' });

    // Grade each answer
    const gradedAnswers = answers.map((ans, idx) => {
      const question = quiz.questions[idx];
      if (!question) return null;
      const isCorrect = ans.selectedAnswer === question.correctAnswer;
      return {
        questionIndex: idx,
        selectedAnswer: ans.selectedAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        topic: question.topic || quiz.topic
      };
    }).filter(Boolean);

    const correctCount = gradedAnswers.filter(a => a.isCorrect).length;
    const score = Math.round((correctCount / quiz.questions.length) * 100);

    // Identify weak topics (topics where user got questions wrong)
    const topicResults = {};
    gradedAnswers.forEach(a => {
      if (!topicResults[a.topic]) topicResults[a.topic] = { correct: 0, total: 0 };
      topicResults[a.topic].total++;
      if (a.isCorrect) topicResults[a.topic].correct++;
    });

    const weakTopics = Object.entries(topicResults)
      .filter(([, v]) => v.correct / v.total < 0.6)
      .map(([k]) => k);

    const strongTopics = Object.entries(topicResults)
      .filter(([, v]) => v.correct / v.total >= 0.8)
      .map(([k]) => k);

    // Save attempt
    const attempt = await QuizAttempt.create({
      userId: req.user._id,
      quizId: quiz._id,
      subject: quiz.subject,
      topic: quiz.topic,
      answers: gradedAnswers,
      score,
      correctCount,
      totalQuestions: quiz.questions.length,
      weakTopics,
      strongTopics,
      timeTaken: timeTaken || 0
    });

    // Update progress record
    await updateProgressAfterQuiz(req.user._id, quiz.subject, quiz.topic, score, weakTopics, strongTopics);

    // Return full quiz with correct answers + attempt result
    const fullQuiz = await Quiz.findById(quiz._id);

    res.json({
      attempt,
      score,
      correctCount,
      totalQuestions: quiz.questions.length,
      weakTopics,
      strongTopics,
      quiz: fullQuiz,
      message: score >= 80 ? 'Excellent work! 🎉' : score >= 60 ? 'Good effort! Keep practicing.' : 'Keep studying — you\'ll improve!'
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to submit quiz.' });
  }
};

// GET /api/quizzes/attempts  – user's quiz history
const getAttempts = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ userId: req.user._id })
      .sort({ completedAt: -1 })
      .limit(20)
      .populate('quizId', 'subject topic');
    res.json({ attempts });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch quiz attempts.' });
  }
};

// Helper: update progress after quiz submission
const updateProgressAfterQuiz = async (userId, subject, topic, score, weakTopics, strongTopics) => {
  const progress = await Progress.findOneAndUpdate(
    { userId, subject },
    {
      $setOnInsert: { userId, subject, topics: [], completedTopics: [], weakTopics: [], strongTopics: [], progressPercentage: 0, quizAttempts: 0, quizAverage: 0 }
    },
    { upsert: true, new: true }
  );

  // Recompute quiz average
  const attempts = await QuizAttempt.find({ userId, subject });
  const avg = attempts.length > 0
    ? Math.round(attempts.reduce((s, a) => s + a.score, 0) / attempts.length)
    : 0;

  // Merge weak/strong topics
  const allWeak = [...new Set([...progress.weakTopics, ...weakTopics])].filter(t => !strongTopics.includes(t));
  const allStrong = [...new Set([...progress.strongTopics, ...strongTopics])];

  await Progress.findOneAndUpdate(
    { userId, subject },
    {
      $set: {
        quizAttempts: attempts.length,
        quizAverage: avg,
        weakTopics: allWeak,
        strongTopics: allStrong,
        lastStudied: new Date()
      },
      $addToSet: { completedTopics: topic }
    }
  );
};

module.exports = { getQuizzes, getQuiz, submitQuiz, getAttempts };

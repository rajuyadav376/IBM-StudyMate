const User = require('../models/User');
const Subject = require('../models/Subject');
const StudyPlan = require('../models/StudyPlan');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const AIRequest = require('../models/AIRequest');

// GET /api/admin/stats
const getStats = async (req, res) => {
  try {
    const [users, subjects, studyPlans, quizzes, attempts, aiRequests] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Subject.countDocuments({ isActive: true }),
      StudyPlan.countDocuments(),
      Quiz.countDocuments(),
      QuizAttempt.countDocuments(),
      AIRequest.countDocuments()
    ]);

    const avgScore = await QuizAttempt.aggregate([
      { $group: { _id: null, avg: { $avg: '$score' } } }
    ]);

    const mockRequests = await AIRequest.countDocuments({ usedMock: true });
    const realRequests = aiRequests - mockRequests;

    res.json({
      stats: {
        totalStudents: users,
        totalSubjects: subjects,
        totalStudyPlans: studyPlans,
        totalQuizzes: quizzes,
        totalAttempts: attempts,
        averageQuizScore: avgScore[0] ? Math.round(avgScore[0].avg) : 0,
        aiRequestsTotal: aiRequests,
        aiRequestsMock: mockRequests,
        aiRequestsReal: realRequests
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch stats.' });
  }
};

// GET /api/admin/users
const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const users = await User.find({ role: 'student' })
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments({ role: 'student' });

    res.json({ users, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users.' });
  }
};

// PUT /api/admin/users/:id/deactivate
const deactivateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ message: 'User deactivated.', user });
  } catch (err) {
    res.status(500).json({ message: 'Failed to deactivate user.' });
  }
};

// GET /api/admin/activity  – recent quiz attempts
const getRecentActivity = async (req, res) => {
  try {
    const activity = await QuizAttempt.find()
      .populate('userId', 'name email')
      .sort({ completedAt: -1 })
      .limit(20);

    res.json({ activity });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch activity.' });
  }
};

module.exports = { getStats, getUsers, deactivateUser, getRecentActivity };

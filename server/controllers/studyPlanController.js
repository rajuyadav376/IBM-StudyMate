const StudyPlan = require('../models/StudyPlan');
const aiService = require('../services/aiService');

// GET /api/study-plans
const getStudyPlans = async (req, res) => {
  try {
    const plans = await StudyPlan.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    res.json({ studyPlans: plans });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch study plans.' });
  }
};

// GET /api/study-plans/:id
const getStudyPlan = async (req, res) => {
  try {
    const plan = await StudyPlan.findOne({ _id: req.params.id, userId: req.user._id });
    if (!plan) return res.status(404).json({ message: 'Study plan not found.' });
    res.json({ studyPlan: plan });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch study plan.' });
  }
};

// POST /api/study-plans  (creates a study plan without AI – stores input)
const createStudyPlan = async (req, res) => {
  try {
    const { subject, learningLevel, examDate, dailyHours, topics, learningGoal, subjectId } = req.body;

    if (!subject || !examDate || !dailyHours) {
      return res.status(400).json({ message: 'Subject, exam date, and daily hours are required.' });
    }

    const examDateObj = new Date(examDate);
    const today = new Date();
    const totalDays = Math.max(1, Math.ceil((examDateObj - today) / (1000 * 60 * 60 * 24)));

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
      generatedPlan: [],
      aiGenerated: false
    });

    res.status(201).json({ message: 'Study plan created. Use AI to generate the schedule.', studyPlan: plan });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create study plan.' });
  }
};

// PUT /api/study-plans/:id/complete-day  – mark a day completed
const completeDayTask = async (req, res) => {
  try {
    const { dayIndex } = req.body;
    const plan = await StudyPlan.findOne({ _id: req.params.id, userId: req.user._id });
    if (!plan) return res.status(404).json({ message: 'Study plan not found.' });

    if (plan.generatedPlan[dayIndex]) {
      plan.generatedPlan[dayIndex].completed = true;
    }

    const completedCount = plan.generatedPlan.filter(d => d.completed).length;
    plan.completionPercentage = Math.round((completedCount / plan.generatedPlan.length) * 100);

    await plan.save();
    res.json({ message: 'Day marked complete', studyPlan: plan });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update study plan.' });
  }
};

// DELETE /api/study-plans/:id
const deleteStudyPlan = async (req, res) => {
  try {
    await StudyPlan.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ message: 'Study plan deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete study plan.' });
  }
};

module.exports = { getStudyPlans, getStudyPlan, createStudyPlan, completeDayTask, deleteStudyPlan };

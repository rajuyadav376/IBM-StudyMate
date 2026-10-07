const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { generateStudyPlan, explainTopic, generateQuiz, chat } = require('../controllers/aiController');

router.use(protect);

router.post('/study-plan', generateStudyPlan);
router.post('/explain', explainTopic);
router.post('/quiz', generateQuiz);
router.post('/chat', chat);

module.exports = router;

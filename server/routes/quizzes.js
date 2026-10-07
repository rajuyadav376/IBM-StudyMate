const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getQuizzes, getQuiz, submitQuiz, getAttempts } = require('../controllers/quizController');

router.use(protect);

router.get('/', getQuizzes);
router.get('/attempts', getAttempts);
router.get('/:id', getQuiz);
router.post('/:id/submit', submitQuiz);

module.exports = router;

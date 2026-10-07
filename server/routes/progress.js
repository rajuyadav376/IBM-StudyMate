const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getProgress, getProgressSummary, updateProgress, getWeakTopics } = require('../controllers/progressController');

router.use(protect);

router.get('/', getProgress);
router.get('/summary', getProgressSummary);
router.get('/weak-topics', getWeakTopics);
router.put('/', updateProgress);

module.exports = router;

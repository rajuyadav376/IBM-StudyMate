const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getStudyPlans,
  getStudyPlan,
  createStudyPlan,
  completeDayTask,
  deleteStudyPlan
} = require('../controllers/studyPlanController');

router.use(protect);

router.route('/').get(getStudyPlans).post(createStudyPlan);
router.route('/:id').get(getStudyPlan).delete(deleteStudyPlan);
router.put('/:id/complete-day', completeDayTask);

module.exports = router;

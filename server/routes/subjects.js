const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getSubjects,
  getSubject,
  createSubject,
  updateSubject,
  deleteSubject,
  addTopic
} = require('../controllers/subjectController');

router.use(protect);

router.route('/').get(getSubjects).post(createSubject);
router.route('/:id').get(getSubject).put(updateSubject).delete(deleteSubject);
router.post('/:id/topics', addTopic);

module.exports = router;

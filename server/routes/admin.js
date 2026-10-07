const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getStats, getUsers, deactivateUser, getRecentActivity } = require('../controllers/adminController');

router.use(protect, authorize('admin'));

router.get('/stats', getStats);
router.get('/users', getUsers);
router.get('/activity', getRecentActivity);
router.put('/users/:id/deactivate', deactivateUser);

module.exports = router;

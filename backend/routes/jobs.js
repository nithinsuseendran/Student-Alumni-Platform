const express = require('express');
const router = express.Router();
const { createJob, getJobs, getJobById, deleteJob } = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getJobs);
router.post('/', protect, authorize('alumni', 'admin'), createJob);
router.get('/:id', protect, getJobById);
router.delete('/:id', protect, deleteJob);

module.exports = router;

const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, getAlumni, bookmarkMentor, adminGetAllUsers, adminApproveAlumni, adminToggleUserStatus, getStats } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getAllUsers);
router.get('/alumni', protect, getAlumni);
router.get('/stats', protect, getStats);
router.get('/admin/all', protect, authorize('admin'), adminGetAllUsers);
router.get('/:id', protect, getUserById);
router.post('/:id/bookmark', protect, bookmarkMentor);
router.put('/admin/:id/approve', protect, authorize('admin'), adminApproveAlumni);
router.put('/admin/:id/toggle', protect, authorize('admin'), adminToggleUserStatus);

module.exports = router;

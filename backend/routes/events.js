const express = require('express');
const router = express.Router();
const { createEvent, getEvents, getEventById, registerForEvent, deleteEvent } = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getEvents);
router.post('/', protect, authorize('alumni', 'admin'), createEvent);
router.get('/:id', protect, getEventById);
router.post('/:id/register', protect, registerForEvent);
router.delete('/:id', protect, deleteEvent);

module.exports = router;

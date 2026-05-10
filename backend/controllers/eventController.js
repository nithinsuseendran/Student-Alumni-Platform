const Event = require('../models/Event');
const Notification = require('../models/Notification');

exports.createEvent = async (req, res) => {
  try {
    const event = await Event.create({ ...req.body, host: req.user._id });
    res.status(201).json({ success: true, event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getEvents = async (req, res) => {
  try {
    const { type, status, page = 1, limit = 10 } = req.query;
    const query = { isApproved: true };
    if (type) query.type = type;
    if (status) query.status = status;
    const total = await Event.countDocuments(query);
    const events = await Event.find(query)
      .populate('host', 'name avatar company designation')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ date: 1 });
    res.json({ success: true, events, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('host', 'name avatar company designation').populate('registrations', 'name avatar');
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    res.json({ success: true, event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (event.registrations.includes(req.user._id)) {
      event.registrations.pull(req.user._id);
    } else {
      if (event.registrations.length >= event.maxAttendees) {
        return res.status(400).json({ success: false, message: 'Event is full' });
      }
      event.registrations.push(req.user._id);
    }
    await event.save();
    res.json({ success: true, event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (event.host.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await event.deleteOne();
    res.json({ success: true, message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

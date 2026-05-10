const Mentorship = require('../models/Mentorship');
const Notification = require('../models/Notification');

exports.sendRequest = async (req, res) => {
  try {
    const { alumniId, message, goals, domain } = req.body;
    const existing = await Mentorship.findOne({ student: req.user._id, alumni: alumniId, status: 'pending' });
    if (existing) return res.status(400).json({ success: false, message: 'Request already sent' });
    const mentorship = await Mentorship.create({ student: req.user._id, alumni: alumniId, message, goals, domain });
    await Notification.create({
      recipient: alumniId, sender: req.user._id, type: 'mentorship_request',
      title: 'New Mentorship Request', message: `${req.user.name} sent you a mentorship request`,
      link: '/dashboard/mentorship', data: { mentorshipId: mentorship._id }
    });
    res.status(201).json({ success: true, mentorship });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyRequests = async (req, res) => {
  try {
    let requests;
    if (req.user.role === 'student') {
      requests = await Mentorship.find({ student: req.user._id }).populate('alumni', 'name avatar company designation');
    } else {
      requests = await Mentorship.find({ alumni: req.user._id }).populate('student', 'name avatar college course year');
    }
    res.json({ success: true, requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.respondToRequest = async (req, res) => {
  try {
    const { status, response } = req.body;
    const mentorship = await Mentorship.findById(req.params.id);
    if (!mentorship) return res.status(404).json({ success: false, message: 'Request not found' });
    if (mentorship.alumni.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    mentorship.status = status;
    mentorship.response = response || '';
    await mentorship.save();
    await Notification.create({
      recipient: mentorship.student, sender: req.user._id,
      type: status === 'accepted' ? 'mentorship_accepted' : 'mentorship_rejected',
      title: `Mentorship Request ${status === 'accepted' ? 'Accepted' : 'Rejected'}`,
      message: `${req.user.name} ${status === 'accepted' ? 'accepted' : 'rejected'} your mentorship request`,
      link: '/dashboard/mentorship'
    });
    res.json({ success: true, mentorship });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

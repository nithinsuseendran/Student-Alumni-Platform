const mongoose = require('mongoose');

const mentorshipSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  alumni: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'completed'], default: 'pending' },
  message: { type: String, required: true },
  goals: [{ type: String }],
  domain: { type: String, default: '' },
  response: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Mentorship', mentorshipSchema);

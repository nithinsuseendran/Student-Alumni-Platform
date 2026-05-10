const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['full-time', 'part-time', 'internship', 'contract', 'remote'], default: 'full-time' },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  location: { type: String, default: '' },
  salary: { type: String, default: '' },
  skills: [{ type: String }],
  experience: { type: String, default: '' },
  deadline: { type: Date },
  applyLink: { type: String, default: '' },
  applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isActive: { type: Boolean, default: true },
  domain: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);

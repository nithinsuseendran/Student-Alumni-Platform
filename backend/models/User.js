const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['student', 'alumni', 'admin'], default: 'student' },
  avatar: { type: String, default: '' },
  bio: { type: String, default: '' },
  
  // Common fields
  phone: { type: String, default: '' },
  location: { type: String, default: '' },
  linkedin: { type: String, default: '' },
  github: { type: String, default: '' },
  website: { type: String, default: '' },
  skills: [{ type: String }],
  
  // Student-specific
  course: { type: String, default: '' },
  year: { type: String, default: '' },
  college: { type: String, default: '' },
  gpa: { type: String, default: '' },
  resumeUrl: { type: String, default: '' },
  
  // Alumni-specific
  company: { type: String, default: '' },
  designation: { type: String, default: '' },
  domain: { type: String, default: '' },
  graduationYear: { type: String, default: '' },
  experience: { type: String, default: '' },
  achievements: [{ type: String }],
  isApproved: { type: Boolean, default: false },
  
  // Social
  isOnline: { type: Boolean, default: false },
  lastSeen: { type: Date, default: Date.now },
  bookmarkedMentors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // Auth
  isEmailVerified: { type: Boolean, default: false },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

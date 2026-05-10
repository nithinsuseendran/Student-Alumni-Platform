const User = require('../models/User');

exports.getAllUsers = async (req, res) => {
  try {
    const { role, search, skills, company, domain, page = 1, limit = 12 } = req.query;
    const query = { isActive: true };
    if (role) query.role = role;
    if (skills) query.skills = { $in: skills.split(',') };
    if (company) query.company = { $regex: company, $options: 'i' };
    if (domain) query.domain = { $regex: domain, $options: 'i' };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { designation: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } },
      ];
    }
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password -resetPasswordToken -resetPasswordExpire')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    res.json({ success: true, users, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAlumni = async (req, res) => {
  try {
    const { search, skills, company, domain, page = 1, limit = 12 } = req.query;
    const query = { role: 'alumni', isActive: true, isApproved: true };
    if (skills) query.skills = { $in: skills.split(',') };
    if (company) query.company = { $regex: company, $options: 'i' };
    if (domain) query.domain = { $regex: domain, $options: 'i' };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { designation: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } },
        { domain: { $regex: search, $options: 'i' } },
      ];
    }
    const total = await User.countDocuments(query);
    const alumni = await User.find(query)
      .select('-password')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    res.json({ success: true, alumni, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.bookmarkMentor = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const mentorId = req.params.id;
    const idx = user.bookmarkedMentors.indexOf(mentorId);
    if (idx > -1) {
      user.bookmarkedMentors.splice(idx, 1);
    } else {
      user.bookmarkedMentors.push(mentorId);
    }
    await user.save({ validateBeforeSave: false });
    res.json({ success: true, bookmarkedMentors: user.bookmarkedMentors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.adminGetAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.adminApproveAlumni = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.adminToggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalAlumni = await User.countDocuments({ role: 'alumni', isApproved: true });
    const pendingAlumni = await User.countDocuments({ role: 'alumni', isApproved: false });
    const onlineUsers = await User.countDocuments({ isOnline: true });
    res.json({ success: true, stats: { totalStudents, totalAlumni, pendingAlumni, onlineUsers } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

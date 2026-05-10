const Message = require('../models/Message');
const User = require('../models/User');

exports.getMessages = async (req, res) => {
  try {
    const conversationId = [req.user._id, req.params.userId].sort().join('_');
    const messages = await Message.find({ conversationId })
      .populate('sender', 'name avatar')
      .sort({ createdAt: 1 });
    
    await Message.updateMany(
      { conversationId, receiver: req.user._id, isRead: false },
      { isRead: true }
    );
    
    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { content, type, fileUrl, fileName } = req.body;
    const conversationId = [req.user._id, req.params.userId].sort().join('_');
    const message = await Message.create({
      sender: req.user._id, receiver: req.params.userId,
      content, type: type || 'text', fileUrl, fileName, conversationId
    });
    const populated = await Message.findById(message._id).populate('sender', 'name avatar');
    res.status(201).json({ success: true, message: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    const conversations = await Message.aggregate([
      { $match: { $or: [{ sender: userId }, { receiver: userId }] } },
      { $sort: { createdAt: -1 } },
      { $group: {
          _id: "$conversationId",
          lastMessage: { $first: "$$ROOT" },
          unreadCount: { $sum: { $cond: [{ $and: [{ $eq: ["$receiver", userId] }, { $eq: ["$isRead", false] }] }, 1, 0] } }
      }},
      { $lookup: {
          from: "users",
          let: { senderId: "$lastMessage.sender", receiverId: "$lastMessage.receiver" },
          pipeline: [
            { $match: { $expr: { $and: [
                { $in: ["$_id", ["$$senderId", "$$receiverId"]] },
                { $ne: ["$_id", userId] }
            ]}}},
            { $project: { name: 1, avatar: 1, role: 1, designation: 1, company: 1 } }
          ],
          as: "user"
      }},
      { $unwind: "$user" },
      { $sort: { "lastMessage.createdAt": -1 } }
    ]);
    res.json({ success: true, conversations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

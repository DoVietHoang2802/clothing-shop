/**
 * Chat Controller - Tin nhắn giữa user và admin/staff
 */

const Message = require('../models/Message');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Gửi tin nhắn
// @route   POST /api/chat/send
// @access  Private
const sendMessage = asyncHandler(async (req, res, next) => {
  const { receiverId, content } = req.body;
  const senderId = req.user.id;

  if (!receiverId || !content) {
    return res.status(400).json({
      success: false,
      message: 'Thiếu thông tin người nhận hoặc nội dung',
      data: null,
    });
  }

  // Không gửi cho chính mình
  if (senderId === receiverId) {
    return res.status(400).json({
      success: false,
      message: 'Không thể gửi tin nhắn cho chính mình',
      data: null,
    });
  }

  // Kiểm tra receiver có tồn tại
  const receiver = await User.findById(receiverId);
  if (!receiver) {
    return res.status(404).json({
      success: false,
      message: 'Người dùng không tồn tại',
      data: null,
    });
  }

  const message = await Message.create({
    sender: senderId,
    receiver: receiverId,
    content,
  });

  await message.populate('sender', 'name email avatar role');
  await message.populate('receiver', 'name email avatar role');

  // Emit socket event (nếu có socket)
  const io = req.app.get('io');
  if (io) {
    io.to(`user_${receiverId}`).emit('new_message', message);
    io.to(`user_${senderId}`).emit('message_sent', message);
  }

  res.status(201).json({
    success: true,
    message: 'Gửi tin nhắn thành công',
    data: message,
  });
});

// @desc    Lấy tin nhắn với một người dùng
// @route   GET /api/chat/:userId
// @access  Private
const getMessages = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const currentUserId = req.user.id;
  const { limit = 50, before } = req.query;

  const query = {
    $or: [
      { sender: currentUserId, receiver: userId },
      { sender: userId, receiver: currentUserId },
    ],
  };

  if (before) {
    query.createdAt = { $lt: new Date(before) };
  }

  const messages = await Message.find(query)
    .populate('sender', 'name email avatar role')
    .populate('receiver', 'name email avatar role')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit));

  // Đánh dấu tin nhắn đã đọc
  await Message.updateMany(
    { sender: userId, receiver: currentUserId, read: false },
    { $set: { read: true } }
  );

  res.status(200).json({
    success: true,
    message: 'Lấy tin nhắn thành công',
    data: messages.reverse(),
  });
});

// @desc    Lấy danh sách cuộc trò chuyện
// @route   GET /api/chat/conversations
// @access  Private
const getConversations = asyncHandler(async (req, res, next) => {
  const currentUserId = req.user.id;

  // Lấy tin nhắn cuối cùng của mỗi cuộc trò chuyện
  const messages = await Message.aggregate([
    {
      $match: {
        $or: [
          { sender: require('mongoose').Types.ObjectId(currentUserId) },
          { receiver: require('mongoose').Types.ObjectId(currentUserId) },
        ],
      },
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $group: {
        _id: {
          $cond: {
            if: { $eq: ['$sender', require('mongoose').Types.ObjectId(currentUserId)] },
            then: '$receiver',
            else: '$sender',
          },
        },
        lastMessage: { $first: '$$ROOT' },
        unreadCount: {
          $sum: {
            $cond: {
              if: {
                $and: [
                  { $eq: ['$receiver', require('mongoose').Types.ObjectId(currentUserId)] },
                  { $eq: ['$read', false] },
                ],
              },
              then: 1,
              else: 0,
            },
          },
        },
      },
    },
    { $sort: { 'lastMessage.createdAt': -1 } },
  ]);

  // Populate thông tin user
  const userIds = messages.map((m) => m._id);
  const users = await User.find({ _id: { $in: userIds } }).select('name email avatar role');

  const conversations = messages.map((m) => {
    const user = users.find((u) => u._id.toString() === m._id.toString());
    return {
      user: user ? {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      } : null,
      lastMessage: m.lastMessage,
      unreadCount: m.unreadCount,
    };
  }).filter(c => c.user);

  res.status(200).json({
    success: true,
    message: 'Lấy danh sách cuộc trò chuyện thành công',
    data: conversations,
  });
});

// @desc    Lấy danh sách admin/staff để chat
// @route   GET /api/chat/users
// @access  Private
const getChatUsers = asyncHandler(async (req, res, next) => {
  // Lấy tất cả admin và staff
  const users = await User.find({ role: { $in: ['ADMIN', 'STAFF'] } })
    .select('name email avatar role')
    .sort({ name: 1 });

  res.status(200).json({
    success: true,
    message: 'Lấy danh sách người dùng thành công',
    data: users,
  });
});

// @desc    Đánh dấu tin nhắn đã đọc
// @route   PUT /api/chat/read/:userId
// @access  Private
const markAsRead = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const currentUserId = req.user.id;

  await Message.updateMany(
    { sender: userId, receiver: currentUserId, read: false },
    { $set: { read: true } }
  );

  res.status(200).json({
    success: true,
    message: 'Đánh dấu đã đọc thành công',
    data: null,
  });
});

// @desc    Lấy số tin nhắn chưa đọc
// @route   GET /api/chat/unread
// @access  Private
const getUnreadCount = asyncHandler(async (req, res, next) => {
  const currentUserId = req.user.id;

  const count = await Message.countDocuments({
    receiver: currentUserId,
    read: false,
  });

  res.status(200).json({
    success: true,
    message: 'Lấy số tin nhắn chưa đọc thành công',
    data: { unreadCount: count },
  });
});

module.exports = {
  sendMessage,
  getMessages,
  getConversations,
  getChatUsers,
  markAsRead,
  getUnreadCount,
};

/**
 * Chat Controller - Tin nhắn giữa user và admin/staff
 */

const mongoose = require('mongoose');
const Message = require('../models/Message');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Gửi tin nhắn
// @route   POST /api/chat/send
// @access  Private
const sendMessage = asyncHandler(async (req, res, next) => {
  const { receiverId, content, image, messageType } = req.body;
  const senderId = req.user.id;

  if (!receiverId) {
    return res.status(400).json({
      success: false,
      message: 'Thiếu thông tin người nhận',
      data: null,
    });
  }

  // Phải có content hoặc image
  if (!content && !image) {
    return res.status(400).json({
      success: false,
      message: 'Tin nhắn không được trống',
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
    content: content || '',
    image: image || null,
    messageType: image ? (messageType || 'image') : 'text',
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

  // Validate userId
  if (!userId || userId === 'undefined' || userId === 'null') {
    return res.status(400).json({
      success: false,
      message: 'ID người dùng không hợp lệ',
      data: null,
    });
  }

  try {
    const userIdObj = new mongoose.Types.ObjectId(userId);
    const currentUserIdObj = new mongoose.Types.ObjectId(currentUserId);

    const query = {
      $or: [
        { sender: currentUserIdObj, receiver: userIdObj },
        { sender: userIdObj, receiver: currentUserIdObj },
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
      { sender: userIdObj, receiver: currentUserIdObj, read: false },
      { $set: { read: true } }
    );

    res.status(200).json({
      success: true,
      message: 'Lấy tin nhắn thành công',
      data: messages.reverse(),
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: 'ID người dùng không hợp lệ',
      data: null,
    });
  }
});

// @desc    Lấy danh sách cuộc trò chuyện
// @route   GET /api/chat/conversations/all
// @access  Private
const getConversations = asyncHandler(async (req, res, next) => {
  const currentUserId = req.user.id;

  try {
    const currentUserIdObj = new mongoose.Types.ObjectId(currentUserId);

    // Lấy tất cả tin nhắn liên quan đến user hiện tại
    const messages = await Message.find({
      $or: [
        { sender: currentUserIdObj },
        { receiver: currentUserIdObj },
      ]
    })
    .populate('sender', 'name email avatar role')
    .populate('receiver', 'name email avatar role')
    .sort({ createdAt: -1 })
    .limit(100);

    // Gom nhóm theo người chat (người còn lại trong cuộc trò chuyện)
    const conversationMap = new Map();

    for (const msg of messages) {
      // Xác định người chat còn lại
      const otherUser = msg.sender._id.toString() === currentUserId
        ? msg.receiver
        : msg.sender;

      const otherUserId = otherUser._id.toString();

      // Chỉ lấy tin nhắn đầu tiên (mới nhất) cho mỗi người
      if (!conversationMap.has(otherUserId)) {
        // Đếm tin nhắn chưa đọc
        const unreadCount = await Message.countDocuments({
          sender: otherUser._id,
          receiver: currentUserIdObj,
          read: false,
        });

        conversationMap.set(otherUserId, {
          user: {
            _id: otherUser._id,
            name: otherUser.name,
            email: otherUser.email,
            avatar: otherUser.avatar,
            role: otherUser.role,
          },
          lastMessage: {
            _id: msg._id,
            content: msg.content,
            sender: msg.sender,
            receiver: msg.receiver,
            createdAt: msg.createdAt,
          },
          unreadCount: unreadCount,
        });
      }
    }

    // Chuyển Map thành array và sắp xếp theo thời gian
    const conversations = Array.from(conversationMap.values())
      .sort((a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt));

    res.status(200).json({
      success: true,
      message: 'Lấy danh sách cuộc trò chuyện thành công',
      data: conversations,
    });

  } catch (err) {
    console.error('Error in getConversations:', err);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách cuộc trò chuyện',
      data: [],
    });
  }
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
// @route   GET /api/chat/unread/count
// @access  Private
const getUnreadCount = asyncHandler(async (req, res, next) => {
  const currentUserId = req.user.id;

  try {
    const userIdObj = new mongoose.Types.ObjectId(currentUserId);

    const count = await Message.countDocuments({
      receiver: userIdObj,
      read: false,
    });

    res.status(200).json({
      success: true,
      message: 'Lấy số tin nhắn chưa đọc thành công',
      data: { unreadCount: count },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi đếm tin nhắn',
      data: { unreadCount: 0 },
    });
  }
});

module.exports = {
  sendMessage,
  getMessages,
  getConversations,
  getChatUsers,
  markAsRead,
  getUnreadCount,
};

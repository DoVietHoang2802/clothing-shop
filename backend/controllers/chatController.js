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
  const currentUserRole = req.user.role;
  const isAdminOrStaff = currentUserRole === 'ADMIN' || currentUserRole === 'STAFF';
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

    let query;

    if (isAdminOrStaff) {
      // Admin: lấy TẤT CẢ tin nhắn liên quan đến user này
      query = {
        $or: [
          { sender: userIdObj },
          { receiver: userIdObj },
        ],
      };
    } else {
      // User thường: chỉ lấy tin nhắn giữa họ và user kia
      query = {
        $or: [
          { sender: currentUserIdObj, receiver: userIdObj },
          { sender: userIdObj, receiver: currentUserIdObj },
        ],
      };
    }

    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await Message.find(query)
      .populate('sender', 'name email avatar role')
      .populate('receiver', 'name email avatar role')
      .sort({ createdAt: 1 }) // Sắp xếp tăng dần để hiển thị đúng thứ tự
      .limit(parseInt(limit));

    // Đánh dấu tin nhắn đã đọc (chỉ đánh dấu tin nhắn gửi đến current user)
    await Message.updateMany(
      { sender: userIdObj, receiver: currentUserIdObj, read: false },
      { $set: { read: true } }
    );

    res.status(200).json({
      success: true,
      message: 'Lấy tin nhắn thành công',
      data: messages,
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
  const currentUserRole = req.user.role;
  const isAdminOrStaff = currentUserRole === 'ADMIN' || currentUserRole === 'STAFF';

  try {
    const currentUserIdObj = new mongoose.Types.ObjectId(currentUserId);

    let query = {};

    if (isAdminOrStaff) {
      // Admin/Staff: chỉ thấy cuộc trò chuyện MÀ HỌ tham gia
      query = {
        $or: [
          { sender: currentUserIdObj },
          { receiver: currentUserIdObj },
        ]
      };
    } else {
      // User thường chỉ thấy cuộc trò chuyện với admin/staff
      const adminStaffUsers = await User.find({ role: { $in: ['ADMIN', 'STAFF'] } }).select('_id');
      const adminStaffIds = adminStaffUsers.map(u => u._id);

      query = {
        $or: [
          { sender: currentUserIdObj },
          { receiver: currentUserIdObj },
        ]
      };
    }

    // Lấy tất cả tin nhắn theo query
    const messages = await Message.find(query)
    .populate('sender', 'name email avatar role')
    .populate('receiver', 'name email avatar role')
    .sort({ createdAt: -1 })
    .limit(200);

    // Gom nhóm theo người chat (người còn lại trong cuộc trò chuyện)
    const conversationMap = new Map();

    for (const msg of messages) {
      // Xác định người chat còn lại
      let otherUser;
      let conversationKey;

      if (isAdminOrStaff) {
        // Admin/Staff: gom nhóm theo USER (không phải admin-user pair)
        // Nếu người gửi là user thường → otherUser = sender
        // Nếu người gửi là admin/staff → bỏ qua admin gửi cho admin, lấy receiver là user
        const senderRole = msg.sender.role;
        const receiverRole = msg.receiver.role;

        if (senderRole === 'USER') {
          // User gửi tin nhắn → otherUser = sender
          otherUser = msg.sender;
          conversationKey = `user_${msg.sender._id.toString()}`;
        } else if (receiverRole === 'USER') {
          // Admin gửi cho user → otherUser = receiver
          otherUser = msg.receiver;
          conversationKey = `user_${msg.receiver._id.toString()}`;
        }
        // Admin gửi cho admin → bỏ qua
      } else {
        // User thường: xác định người còn lại
        if (msg.sender._id.toString() === currentUserId) {
          otherUser = msg.receiver;
          conversationKey = otherUser._id.toString();
        } else if (msg.receiver._id.toString() === currentUserId) {
          otherUser = msg.sender;
          conversationKey = otherUser._id.toString();
        }
      }

      // Chỉ lấy tin nhắn đầu tiên (mới nhất) cho mỗi user
      if (otherUser && !conversationMap.has(conversationKey)) {
        // Đếm tin nhắn chưa đọc từ otherUser gửi đến currentUser
        const unreadCount = await Message.countDocuments({
          sender: otherUser._id,
          receiver: currentUserIdObj,
          read: false,
        });

        conversationMap.set(conversationKey, {
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
            messageType: msg.messageType,
            image: msg.image,
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

// @desc    Xóa tin nhắn
// @route   DELETE /api/chat/message/:id
// @access  Private
const deleteMessage = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  const message = await Message.findById(id);

  if (!message) {
    return res.status(404).json({
      success: false,
      message: 'Tin nhắn không tìm thấy',
      data: null,
    });
  }

  // Chỉ người gửi mới được xóa
  const senderId = typeof message.sender === 'object' ? message.sender.toString() : message.sender.toString();
  if (senderId !== userId) {
    return res.status(403).json({
      success: false,
      message: 'Bạn không có quyền xóa tin nhắn này',
      data: null,
    });
  }

  await Message.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: 'Xóa tin nhắn thành công',
    data: null,
  });
});

module.exports = {
  sendMessage,
  getMessages,
  getConversations,
  getChatUsers,
  markAsRead,
  getUnreadCount,
  deleteMessage,
};

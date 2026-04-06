/**
 * Chat Controller - Tin nhắn giữa user và admin/staff
 * Dùng unified SSE Map từ orderSSEController (để chat + orders dùng chung kết nối)
 */

const mongoose = require('mongoose');
const Message = require('../models/Message');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { sseClients, sendToUser, broadcastChatMessage } = require('./orderSSEController');

// SSE Endpoint - Real-time chat updates (dùng chung Map với orderSSEController)
// @route   GET /api/chat/sse
// @access  Private
const sseHandler = asyncHandler(async (req, res, next) => {
  // Lấy user từ middleware đã verify
  const userId = req.user.id;
  const userRole = req.user.role;

  // Set headers cho SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.flushHeaders();

  // Lưu connection vào Map CHUNG với role info
  sseClients.set(userId, { res, role: userRole });

  // Gửi heartbeat để giữ kết nối (15s - tránh Render kill)
  const heartbeatInterval = setInterval(() => {
    try {
      res.write(': heartbeat\n\n');
    } catch (e) {
      clearInterval(heartbeatInterval);
      sseClients.delete(userId);
    }
  }, 15000);

  // Gửi event khởi tạo
  res.write(`data: ${JSON.stringify({ type: 'connected', userId })}\n\n`);

  // Cleanup khi client disconnect
  req.on('close', () => {
    clearInterval(heartbeatInterval);
    sseClients.delete(userId);
  });
});

// Hàm broadcast tin nhắn mới tới tất cả client đang online
// Sử dụng unified broadcastChatMessage từ orderSSEController
// NOTE: import broadcastChatMessage, sendToUser from orderSSEController
// Đã được require ở trên

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

  // Broadcast tin nhắn tới TẤT CẢ client đang online (dùng unified Map)
  broadcastChatMessage(message);

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
      // Admin/Staff: thấy TẤT CẢ cuộc trò chuyện giữa USER với bất kỳ admin/staff nào
      // (không lọc theo currentUserId - để admin thấy tất cả)
      query = {};
    } else {
      // User thường: thấy TẤT CẢ cuộc trò chuyện của mình (với admin, staff, hoặc user khác)
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
        // Admin/Staff: gom nhóm theo USER
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
        // Admin gửi cho admin → bỏ qua (không có senderRole/receiverRole === 'USER')
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
        const unreadQuery = isAdminOrStaff
          ? { sender: otherUser._id, read: false }
          : { sender: otherUser._id, receiver: currentUserIdObj, read: false };

        const unreadCount = await Message.countDocuments(unreadQuery);

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

// @desc    Xóa toàn bộ cuộc trò chuyện với một người
// @route   DELETE /api/chat/conversation/:userId
// @access  Private
const deleteConversation = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const currentUserId = req.user.id;

  if (!userId || userId === 'undefined' || userId === 'null') {
    return res.status(400).json({
      success: false,
      message: 'ID người dùng không hợp lệ',
      data: null,
    });
  }

  try {
    const currentUserIdObj = new mongoose.Types.ObjectId(currentUserId);
    const otherUserIdObj = new mongoose.Types.ObjectId(userId);

    // Xóa tất cả tin nhắn giữa 2 người
    const result = await Message.deleteMany({
      $or: [
        { sender: currentUserIdObj, receiver: otherUserIdObj },
        { sender: otherUserIdObj, receiver: currentUserIdObj },
      ],
    });

    // Broadcast event để cập nhật cho tất cả client
    broadcastChatMessage({ type: 'chat_conversation_deleted', deletedWith: userId });

    res.status(200).json({
      success: true,
      message: `Đã xóa ${result.deletedCount} tin nhắn`,
      data: { deletedCount: result.deletedCount },
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: 'ID người dùng không hợp lệ',
      data: null,
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
  deleteMessage,
  deleteConversation,
  sseHandler,
};

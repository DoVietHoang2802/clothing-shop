import React, { useState, useEffect, useRef } from 'react';
import chatService from '../services/chatService';
import { useAuth } from '../context/AuthContext';

const ChatWidget = () => {
  const { isAuthenticated, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [adminList, setAdminList] = useState([]);
  const messagesEndRef = useRef(null);

  const isAdminOrStaff = user?.role === 'ADMIN' || user?.role === 'STAFF';

  // Load data on open
  useEffect(() => {
    if (isAuthenticated && isOpen) {
      if (isAdminOrStaff) {
        loadConversations();
      } else {
        loadAdminList();
      }
    }
  }, [isAuthenticated, isOpen, isAdminOrStaff]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto refresh conversations - only refresh conversations list, not messages
  useEffect(() => {
    if (isAuthenticated && isOpen) {
      // Refresh conversations list every 10 seconds
      const conversationInterval = setInterval(() => {
        if (isAdminOrStaff) {
          loadConversations();
        }
        loadUnreadCount();
      }, 10000);

      // Refresh messages only when actively viewing a chat
      const messageInterval = setInterval(() => {
        if (isAdminOrStaff && selectedUser) {
          const currentLength = messages.length;
          loadMessages(selectedUser._id).then(() => {
            // Only scroll if new messages arrived
            // Don't force scroll to prevent jumping
          });
        }
      }, 8000);

      return () => {
        clearInterval(conversationInterval);
        clearInterval(messageInterval);
      };
    }
  }, [isAuthenticated, isOpen, isAdminOrStaff, selectedUser]);

  // Load admin/staff list
  const loadAdminList = async () => {
    try {
      const res = await chatService.getChatUsers();
      const admins = res.data.data || [];
      setAdminList(admins);
      // Auto-select first admin and load messages
      if (admins.length > 0 && !selectedUser) {
        setSelectedUser(admins[0]);
        loadMessages(admins[0]._id);
      }
    } catch (err) {
      console.error('Error loading admin list:', err);
    }
  };

  // Load conversations for admin/staff
  const loadConversations = async () => {
    try {
      const res = await chatService.getConversations();
      const convs = res.data.data || [];
      setConversations(convs);
      const totalUnread = convs.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
      setUnreadCount(totalUnread);
    } catch (err) {
      console.error('Error loading conversations:', err);
    }
  };

  // Load messages with specific user
  const loadMessages = async (userId) => {
    if (!userId) return;
    try {
      setLoading(true);
      const res = await chatService.getMessages(userId);
      setMessages(res.data.data || []);
      // Mark as read
      await chatService.markAsRead(userId);
      // Refresh conversations to update unread count
      loadConversations();
    } catch (err) {
      console.error('Error loading messages:', err);
    } finally {
      setLoading(false);
    }
  };

  // Select a conversation to view
  const handleSelectConversation = (conv) => {
    setSelectedUser(conv.user);
    loadMessages(conv.user._id);
  };

  // Back to list
  const handleBack = () => {
    setSelectedUser(null);
    setMessages([]);
  };

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();

    // Determine receiver
    let receiverId;
    if (isAdminOrStaff && selectedUser) {
      // Admin/Staff replying to selected user
      receiverId = selectedUser._id;
    } else if (!isAdminOrStaff && adminList.length > 0) {
      // User chatting with first available admin/staff
      receiverId = adminList[0]._id;
    }

    if (!newMessage.trim() || !receiverId) return;

    try {
      setSending(true);
      await chatService.sendMessage(receiverId, newMessage.trim());
      setNewMessage('');
      loadMessages(receiverId);
    } catch (err) {
      console.error('Error sending message:', err);
      alert(err.response?.data?.message || 'Lỗi khi gửi tin nhắn');
    } finally {
      setSending(false);
    }
  };

  // Format time
  const formatTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    const now = new Date();
    const diff = now - d;

    if (diff < 60000) return 'Vừa xong';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} phút`;
    if (diff < 86400000) return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  };

  // Get avatar
  const getAvatar = (u) => {
    if (u?.avatar) return u.avatar;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(u?.name?.[0] || 'U')}&background=667eea&color=fff&size=128&bold=true`;
  };

  // Get role badge
  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return { label: '👑 Admin', color: '#e74c3c' };
      case 'STAFF':
        return { label: '👔 NV', color: '#3498db' };
      default:
        return { label: '👤 Khách', color: '#27ae60' };
    }
  };

  // Check if message is from me
  const isMyMessage = (msg) => {
    const senderId = typeof msg.sender === 'object' ? msg.sender._id : msg.sender;
    return senderId === user._id;
  };

  // Get sender info
  const getSenderInfo = (msg) => {
    if (typeof msg.sender === 'object') {
      return msg.sender;
    }
    return { name: 'Người dùng', role: 'USER' };
  };

  // Check if message is from admin/staff (show on RIGHT)
  const isAdminMessage = (msg) => {
    const sender = getSenderInfo(msg);
    return sender.role === 'ADMIN' || sender.role === 'STAFF';
  };

  if (!isAuthenticated) return null;

  return (
    <>
      {/* Chat Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 9999,
        }}
      >
        {isOpen ? (
          <span style={{ color: 'white', fontSize: '24px' }}>✕</span>
        ) : (
          <>
            <span style={{ color: 'white', fontSize: '28px' }}>💬</span>
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                background: '#e74c3c',
                color: 'white',
                borderRadius: '50%',
                width: '22px',
                height: '22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold',
              }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </>
        )}
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '90px',
          left: '20px',
          width: '380px',
          height: '520px',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 5px 40px rgba(0,0,0,0.15)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            padding: '14px 16px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {selectedUser && (
                <button
                  onClick={handleBack}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                  }}
                >
                  ←
                </button>
              )}
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>
                  {selectedUser
                    ? `💬 ${selectedUser.name}`
                    : isAdminOrStaff
                      ? '💬 Hộp thư'
                      : '💬 Hỗ trợ'}
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', opacity: 0.9 }}>
                  {selectedUser
                    ? getRoleBadge(selectedUser.role).label
                    : isAdminOrStaff
                      ? `${conversations.length} cuộc trò chuyện`
                      : 'Gửi tin nhắn để được hỗ trợ'}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          {selectedUser ? (
            // Chat view
            <>
              <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', background: '#f8f9fa' }}>
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>⏳ Đang tải...</div>
                ) : messages.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>💬</div>
                    <p>Chưa có tin nhắn nào</p>
                    <p style={{ fontSize: '0.85rem' }}>Hãy gửi tin nhắn đầu tiên!</p>
                  </div>
                ) : (
                  <>
                    {messages.map((msg) => {
                      const isMe = isMyMessage(msg);
                      const isAdmin = isAdminMessage(msg);
                      const sender = getSenderInfo(msg);
                      const senderRole = getRoleBadge(sender.role);

                      // Message position: User -> LEFT (white), Admin/Staff -> RIGHT (purple)
                      const isRightSide = isAdmin;
                      const isLeftSide = !isAdmin;

                      return (
                        <div
                          key={msg._id}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: isRightSide ? 'flex-end' : 'flex-start',
                            marginBottom: '12px',
                          }}
                        >
                          {/* Sender info - only show if not Admin/Staff */}
                          {isLeftSide && (
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              marginBottom: '4px',
                            }}>
                              <img
                                src={getAvatar(sender)}
                                alt={sender.name}
                                style={{ width: '24px', height: '24px', borderRadius: '50%' }}
                              />
                              <span style={{
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                color: senderRole.color
                              }}>
                                {sender.name} • {senderRole.label}
                              </span>
                            </div>
                          )}

                          {/* Message bubble */}
                          <div style={{
                            maxWidth: '80%',
                            display: 'flex',
                            flexDirection: isRightSide ? 'row-reverse' : 'row',
                            alignItems: 'flex-end',
                            gap: '6px',
                          }}>
                            {isRightSide ? (
                              <>
                                <div style={{
                                  background: '#667eea',
                                  color: 'white',
                                  padding: '8px 12px',
                                  borderRadius: '16px',
                                  borderBottomRightRadius: '4px',
                                  fontSize: '0.9rem',
                                  lineHeight: '1.4',
                                  wordBreak: 'break-word',
                                }}>
                                  {msg.content}
                                </div>
                                <span style={{ fontSize: '0.65rem', color: '#999' }}>
                                  {formatTime(msg.createdAt)}
                                </span>
                              </>
                            ) : (
                              <>
                                <span style={{ fontSize: '0.65rem', color: '#999' }}>
                                  {formatTime(msg.createdAt)}
                                </span>
                                <div style={{
                                  background: 'white',
                                  color: '#333',
                                  padding: '8px 12px',
                                  borderRadius: '16px',
                                  borderBottomLeftRadius: '4px',
                                  fontSize: '0.9rem',
                                  lineHeight: '1.4',
                                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                                  wordBreak: 'break-word',
                                }}>
                                  {msg.content}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} style={{
                padding: '12px 16px',
                borderTop: '1px solid #eee',
                display: 'flex',
                gap: '8px',
                background: 'white',
              }}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={isAdminOrStaff ? 'Trả lời tin nhắn...' : 'Nhập tin nhắn...'}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    border: '2px solid #eee',
                    borderRadius: '20px',
                    outline: 'none',
                    fontSize: '0.9rem',
                  }}
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: sending || !newMessage.trim() ? '#ccc' : '#667eea',
                    color: 'white',
                    border: 'none',
                    cursor: sending || !newMessage.trim() ? 'not-allowed' : 'pointer',
                    fontSize: '1.1rem',
                  }}
                >
                  ➤
                </button>
              </form>
            </>
          ) : isAdminOrStaff ? (
            // Admin/Staff - Conversations list
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {conversations.length === 0 ? (
                <div style={{ padding: '3rem 2rem', textAlign: 'center', color: '#999' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                  <p style={{ margin: 0, fontWeight: '600', color: '#666' }}>Chưa có tin nhắn nào</p>
                  <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Tin nhắn từ khách hàng sẽ hiển thị ở đây</p>
                </div>
              ) : (
                conversations.map((conv) => {
                  const roleInfo = getRoleBadge(conv.user?.role);
                  return (
                    <div
                      key={conv.user?._id}
                      onClick={() => handleSelectConversation(conv)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '14px 16px',
                        cursor: 'pointer',
                        borderBottom: '1px solid #f0f0f0',
                        background: conv.unreadCount > 0 ? '#f0f4ff' : 'white',
                      }}
                    >
                      <div style={{ position: 'relative' }}>
                        <img
                          src={getAvatar(conv.user)}
                          alt={conv.user?.name}
                          style={{ width: '48px', height: '48px', borderRadius: '50%' }}
                        />
                        {conv.unreadCount > 0 && (
                          <span style={{
                            position: 'absolute',
                            top: '-4px',
                            right: '-4px',
                            background: '#e74c3c',
                            color: 'white',
                            borderRadius: '50%',
                            width: '18px',
                            height: '18px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '10px',
                            fontWeight: 'bold',
                          }}>
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{
                            fontWeight: conv.unreadCount > 0 ? '700' : '600',
                            fontSize: '0.9rem',
                            color: '#333'
                          }}>
                            {conv.user?.name || 'Người dùng'}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: '#999' }}>
                            {formatTime(conv.lastMessage?.createdAt)}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                          <span style={{
                            fontSize: '0.7rem',
                            color: roleInfo.color,
                            fontWeight: '600'
                          }}>
                            {roleInfo.label}
                          </span>
                          <span style={{
                            fontSize: '0.8rem',
                            color: conv.unreadCount > 0 ? '#333' : '#888',
                            fontWeight: conv.unreadCount > 0 ? '500' : '400',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '150px'
                          }}>
                            • {conv.lastMessage?.content}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            // User - Simple chat (should not reach here as selectedUser is auto-set)
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
              <p>Đang kết nối...</p>
            </div>
          )}

          {/* User input area (outside selectedUser check) */}
          {!selectedUser && !isAdminOrStaff && adminList.length > 0 && (
            <form onSubmit={handleSendMessage} style={{
              padding: '12px 16px',
              borderTop: '1px solid #eee',
              display: 'flex',
              gap: '8px',
              background: 'white',
            }}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Nhập tin nhắn..."
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  border: '2px solid #eee',
                  borderRadius: '20px',
                  outline: 'none',
                  fontSize: '0.9rem',
                }}
              />
              <button
                type="submit"
                disabled={sending || !newMessage.trim()}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: sending || !newMessage.trim() ? '#ccc' : '#667eea',
                  color: 'white',
                  border: 'none',
                  cursor: sending || !newMessage.trim() ? 'not-allowed' : 'pointer',
                  fontSize: '1.1rem',
                }}
              >
                ➤
              </button>
            </form>
          )}
        </div>
      )}
    </>
  );
};

export default ChatWidget;

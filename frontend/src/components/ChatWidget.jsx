import React, { useState, useEffect, useRef } from 'react';
import chatService from '../services/chatService';
import { useAuth } from '../context/AuthContext';

const ChatWidget = () => {
  const { isAuthenticated, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [adminList, setAdminList] = useState([]);
  const messagesEndRef = useRef(null);

  // Check if user is admin/staff
  const isAdminOrStaff = user?.role === 'ADMIN' || user?.role === 'STAFF';

  // Load conversations or admin list on open
  useEffect(() => {
    if (isAuthenticated && isOpen) {
      if (isAdminOrStaff) {
        loadConversations();
      } else {
        loadAdminList();
      }
    }
  }, [isAuthenticated, isOpen, isAdminOrStaff]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto refresh
  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(() => {
        if (isAdminOrStaff) {
          loadConversations();
        }
        loadUnreadCount();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, isAdminOrStaff]);

  // Load admin/staff list for user
  const loadAdminList = async () => {
    try {
      const res = await chatService.getChatUsers();
      setAdminList(res.data.data || []);
    } catch (err) {
      console.error('Error loading admin list:', err);
    }
  };

  // Load conversations for admin/staff
  const loadConversations = async () => {
    try {
      const res = await chatService.getConversations();
      setConversations(res.data.data || []);
      const unread = res.data.data.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
      setUnreadCount(unread);
    } catch (err) {
      console.error('Error loading conversations:', err);
    }
  };

  // Load messages with specific user
  const loadMessages = async (userId, userName) => {
    try {
      setLoading(true);
      const res = await chatService.getMessages(userId);
      setMessages(res.data.data || []);
      await chatService.markAsRead(userId);
      // Update conversations unread count
      loadConversations();
    } catch (err) {
      console.error('Error loading messages:', err);
    } finally {
      setLoading(false);
    }
  };

  // Select a conversation
  const handleSelectConversation = (conv) => {
    setSelectedConv(conv);
    loadMessages(conv.user._id, conv.user.name);
  };

  // Back to conversations list
  const handleBack = () => {
    setSelectedConv(null);
    setMessages([]);
    loadConversations();
  };

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    const receiverId = isAdminOrStaff ? selectedConv?.user._id : adminList[0]?._id;
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
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: '2-digit' });
  };

  // Get avatar
  const getAvatar = (u) => {
    if (u?.avatar) return u.avatar;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(u?.name || 'U')}&background=667eea&color=fff&size=128`;
  };

  // Check if message is from me
  const isMyMessage = (msg) => {
    const senderId = typeof msg.sender === 'object' ? msg.sender._id : msg.sender;
    return senderId === user._id;
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
            padding: '16px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            {selectedConv && (
              <button
                onClick={handleBack}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  color: 'white',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                }}
              >
                ← Back
              </button>
            )}
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
                {selectedConv
                  ? `💬 ${selectedConv.user?.name || 'Người dùng'}`
                  : isAdminOrStaff
                    ? '💬 Tin nhắn'
                    : '💬 Hỗ trợ trực tuyến'}
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', opacity: 0.9 }}>
                {selectedConv
                  ? 'Đang trò chuyện'
                  : isAdminOrStaff
                    ? `${conversations.length} cuộc trò chuyện`
                    : 'Gửi tin nhắn cho admin/staff'}
              </p>
            </div>
          </div>

          {/* Content */}
          {selectedConv ? (
            // Chat view with selected user
            <>
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px', background: '#f5f5f5' }}>
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>⏳ Đang tải...</div>
                ) : messages.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👋</div>
                    <p>Chưa có tin nhắn nào</p>
                    <p style={{ fontSize: '0.85rem' }}>Hãy gửi tin nhắn đầu tiên!</p>
                  </div>
                ) : (
                  <>
                    {messages.map((msg) => {
                      const isMe = isMyMessage(msg);
                      const sender = typeof msg.sender === 'object' ? msg.sender : { name: 'Người dùng' };
                      return (
                        <div
                          key={msg._id}
                          style={{
                            display: 'flex',
                            justifyContent: isMe ? 'flex-end' : 'flex-start',
                            marginBottom: '12px',
                          }}
                        >
                          {!isMe && (
                            <img
                              src={getAvatar(sender)}
                              alt="avatar"
                              style={{ width: '32px', height: '32px', borderRadius: '50%', marginRight: '8px' }}
                            />
                          )}
                          <div style={{ maxWidth: '75%' }}>
                            {!isMe && (
                              <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '4px', marginLeft: '4px' }}>
                                {sender.name || 'Người dùng'}
                              </div>
                            )}
                            <div style={{
                              background: isMe ? '#667eea' : 'white',
                              color: isMe ? 'white' : '#333',
                              padding: '10px 14px',
                              borderRadius: '18px',
                              borderBottomRightRadius: isMe ? '4px' : '18px',
                              borderBottomLeftRadius: isMe ? '18px' : '4px',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                              fontSize: '0.9rem',
                              lineHeight: '1.4',
                            }}>
                              {msg.content}
                            </div>
                            <div style={{
                              fontSize: '0.7rem',
                              color: '#999',
                              marginTop: '4px',
                              textAlign: isMe ? 'right' : 'left',
                              paddingLeft: isMe ? '0' : '4px',
                              paddingRight: isMe ? '4px' : '0',
                            }}>
                              {formatTime(msg.createdAt)}
                            </div>
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
                gap: '10px',
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
                    borderRadius: '24px',
                    outline: 'none',
                    fontSize: '0.9rem',
                  }}
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: sending || !newMessage.trim() ? '#ccc' : '#667eea',
                    color: 'white',
                    border: 'none',
                    cursor: sending || !newMessage.trim() ? 'not-allowed' : 'pointer',
                    fontSize: '1.2rem',
                  }}
                >
                  ➤
                </button>
              </form>
            </>
          ) : isAdminOrStaff ? (
            // Admin/Staff - Show conversations list
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {conversations.length === 0 ? (
                <div style={{ padding: '3rem 2rem', textAlign: 'center', color: '#666' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                  <p>Chưa có tin nhắn nào</p>
                  <p style={{ fontSize: '0.85rem', color: '#999' }}>Tin nhắn từ khách hàng sẽ hiển thị ở đây</p>
                </div>
              ) : (
                conversations.map((conv) => (
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
                      transition: 'background 0.2s',
                    }}
                  >
                    <div style={{ position: 'relative' }}>
                      <img
                        src={getAvatar(conv.user)}
                        alt={conv.user?.name}
                        style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      {conv.unreadCount > 0 && (
                        <span style={{
                          position: 'absolute',
                          top: '-4px',
                          right: '-4px',
                          background: '#e74c3c',
                          color: 'white',
                          borderRadius: '50%',
                          width: '20px',
                          height: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
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
                          fontSize: '0.95rem',
                          color: '#333'
                        }}>
                          {conv.user?.name || 'Người dùng'}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#999' }}>
                          {formatTime(conv.lastMessage?.createdAt)}
                        </span>
                      </div>
                      <div style={{
                        fontSize: '0.85rem',
                        color: conv.unreadCount > 0 ? '#333' : '#666',
                        fontWeight: conv.unreadCount > 0 ? '500' : '400',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        marginTop: '4px',
                      }}>
                        {conv.lastMessage?.content}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#999', marginTop: '2px' }}>
                        {conv.user?.role === 'ADMIN' ? '👑 Admin' : conv.user?.role === 'STAFF' ? '👔 Nhân viên' : '👤 Khách hàng'}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            // User - Show admin selection
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', background: '#f5f5f5' }}>
              <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1rem' }}>
                Chọn người để trò chuyện:
              </p>
              {adminList.map((admin) => (
                <div
                  key={admin._id}
                  onClick={() => {
                    setSelectedConv({ user: admin });
                    loadMessages(admin._id, admin.name);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    background: 'white',
                    borderRadius: '12px',
                    marginBottom: '8px',
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  }}
                >
                  <img
                    src={getAvatar(admin)}
                    alt={admin.name}
                    style={{ width: '45px', height: '45px', borderRadius: '50%' }}
                  />
                  <div>
                    <div style={{ fontWeight: '600', color: '#333' }}>{admin.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>
                      {admin.role === 'ADMIN' ? '👑 Quản trị viên' : '👔 Nhân viên hỗ trợ'}
                    </div>
                  </div>
                </div>
              ))}
              {adminList.length === 0 && (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                  <p>Không có nhân viên hỗ trợ online</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ChatWidget;

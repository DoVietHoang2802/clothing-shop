import React, { useState, useEffect, useRef } from 'react';
import chatService from '../services/chatService';
import { useAuth } from '../context/AuthContext';

const ChatWidget = () => {
  const { isAuthenticated, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [adminInfo, setAdminInfo] = useState(null);
  const messagesEndRef = useRef(null);

  // Check if user is admin/staff
  const isAdminOrStaff = user?.role === 'ADMIN' || user?.role === 'STAFF';

  useEffect(() => {
    if (isAuthenticated && isOpen) {
      if (isAdminOrStaff) {
        // Admin/Staff - load conversations
        loadConversations();
      } else {
        // User - load messages with admin
        loadAdminInfo();
      }
    }
  }, [isAuthenticated, isOpen, isAdminOrStaff]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isAuthenticated) {
      loadUnreadCount();
      const interval = setInterval(() => {
        if (isAdminOrStaff) {
          loadConversations();
        } else if (adminInfo?._id) {
          loadMessages(adminInfo._id);
        }
        loadUnreadCount();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, isAdminOrStaff, adminInfo]);

  const loadAdminInfo = async () => {
    try {
      const res = await chatService.getChatUsers();
      if (res.data.data.length > 0) {
        setAdminInfo(res.data.data[0]); // Get first admin/staff
        loadMessages(res.data.data[0]._id);
      }
    } catch (err) {
      console.error('Error loading admin info:', err);
    }
  };

  const loadConversations = async () => {
    try {
      const res = await chatService.getConversations();
      const unread = res.data.data.reduce((sum, c) => sum + c.unreadCount, 0);
      setUnreadCount(unread);
      if (res.data.data.length > 0) {
        // Auto-select first conversation for admin
        setMessages(res.data.data);
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.error('Error loading conversations:', err);
    }
  };

  const loadMessages = async (userId) => {
    try {
      setLoading(true);
      const res = await chatService.getMessages(userId);
      setMessages(res.data.data);
      await chatService.markAsRead(userId);
    } catch (err) {
      console.error('Error loading messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const res = await chatService.getUnreadCount();
      setUnreadCount(res.data.data.unreadCount);
    } catch (err) {
      console.error('Error loading unread count:', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !adminInfo?._id) return;

    try {
      setSending(true);
      await chatService.sendMessage(adminInfo._id, newMessage.trim());
      setNewMessage('');
      loadMessages(adminInfo._id);
      loadUnreadCount();
    } catch (err) {
      console.error('Error sending message:', err);
      alert(err.response?.data?.message || 'Lỗi khi gửi tin nhắn');
    } finally {
      setSending(false);
    }
  };

  const handleSelectConversation = (conv) => {
    loadMessages(conv.user._id);
    setAdminInfo(conv.user);
  };

  const formatTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;

    if (diff < 60000) return 'Vừa xong';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}p`;
    if (diff < 86400000) return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  };

  const getAvatar = (u) => {
    if (u?.avatar) return u.avatar;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(u?.name || 'U')}&background=random&color=fff`;
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
          height: '500px',
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
          }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
              {isAdminOrStaff ? '💬 Tin nhắn' : '💬 Hỗ trợ trực tuyến'}
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', opacity: 0.9 }}>
              {isAdminOrStaff ? 'Quản lý tin nhắn từ khách hàng' : 'Gửi tin nhắn cho admin/staff'}
            </p>
          </div>

          {/* Content */}
          {isAdminOrStaff ? (
            // Admin/Staff - Show conversations list
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
              {messages.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                  <p>Chưa có tin nhắn nào</p>
                </div>
              ) : (
                messages.map((conv) => (
                  <div
                    key={conv.user?._id || conv.lastMessage?.sender?._id || conv.lastMessage?.receiver?._id}
                    onClick={() => handleSelectConversation(conv)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      background: adminInfo?._id === (conv.user?._id || conv.lastMessage?.sender?._id || conv.lastMessage?.receiver?._id) ? '#e8efff' : '#fff',
                      border: '1px solid #eee',
                      marginBottom: '8px',
                    }}
                  >
                    <div style={{ position: 'relative' }}>
                      <img
                        src={getAvatar(conv.user || conv.lastMessage?.sender || conv.lastMessage?.receiver)}
                        alt="avatar"
                        style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      {conv.unreadCount > 0 && (
                        <span style={{
                          position: 'absolute',
                          top: '-2px',
                          right: '-2px',
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
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: conv.unreadCount > 0 ? '700' : '600', fontSize: '0.95rem' }}>
                          {conv.user?.name || conv.lastMessage?.sender?.name || conv.lastMessage?.receiver?.name || 'Người dùng'}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#999' }}>
                          {formatTime(conv.lastMessage?.createdAt)}
                        </span>
                      </div>
                      <div style={{
                        fontSize: '0.85rem',
                        color: '#666',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {conv.lastMessage?.sender?._id === user._id ? 'Bạn: ' : ''}{conv.lastMessage?.content}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            // User - Show chat with admin
            <>
              {adminInfo ? (
                <>
                  {/* Chat with admin */}
                  <div style={{ flex: 1, overflowY: 'auto', padding: '16px', background: '#f5f5f5' }}>
                    {loading ? (
                      <div style={{ textAlign: 'center', padding: '2rem' }}>Đang tải...</div>
                    ) : messages.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👋</div>
                        <p>Gửi tin nhắn để được hỗ trợ</p>
                      </div>
                    ) : (
                      messages.map((msg) => {
                        const senderId = typeof msg.sender === 'object' ? msg.sender._id : msg.sender;
                        const isMe = senderId === user._id;
                        return (
                          <div
                            key={msg._id}
                            style={{
                              display: 'flex',
                              justifyContent: isMe ? 'flex-end' : 'flex-start',
                              marginBottom: '12px',
                            }}
                          >
                            <div style={{
                              maxWidth: '75%',
                              display: 'flex',
                              flexDirection: isMe ? 'row-reverse' : 'row',
                              alignItems: 'flex-end',
                              gap: '8px',
                            }}>
                              <img
                                src={getAvatar(typeof msg.sender === 'object' ? msg.sender : { name: 'User' })}
                                alt="avatar"
                                style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                              />
                              <div style={{
                                background: isMe ? '#667eea' : 'white',
                                color: isMe ? 'white' : '#333',
                                padding: '10px 14px',
                                borderRadius: '16px',
                                borderBottomRightRadius: isMe ? '4px' : '16px',
                                borderBottomLeftRadius: isMe ? '16px' : '4px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                fontSize: '0.9rem',
                              }}>
                                {msg.content}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
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
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      ➤
                    </button>
                  </form>
                </>
              ) : (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
                  <p>Đang kết nối với hỗ trợ...</p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
};

export default ChatWidget;

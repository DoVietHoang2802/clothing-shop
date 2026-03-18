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
  const [showNewChat, setShowNewChat] = useState(false);
  const [chatUsers, setChatUsers] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated && isOpen) {
      loadConversations();
    }
  }, [isAuthenticated, isOpen]);

  useEffect(() => {
    if (selectedUser) {
      loadMessages(selectedUser._id);
      loadChatUsers();
    }
  }, [selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Poll for unread count
    if (isAuthenticated) {
      loadUnreadCount();
      const interval = setInterval(loadUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const loadConversations = async () => {
    try {
      const res = await chatService.getConversations();
      setConversations(res.data.data);
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
      loadConversations();
    } catch (err) {
      console.error('Error loading messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadChatUsers = async () => {
    try {
      const res = await chatService.getChatUsers();
      setChatUsers(res.data.data);
    } catch (err) {
      console.error('Error loading chat users:', err);
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
    if (!newMessage.trim() || !selectedUser) return;

    try {
      setSending(true);
      await chatService.sendMessage(selectedUser._id, newMessage.trim());
      setNewMessage('');
      loadMessages(selectedUser._id);
      loadConversations();
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
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
          right: '20px',
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
          right: '20px',
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>💬 Tin nhắn</h3>
              <button
                onClick={() => setShowNewChat(!showNewChat)}
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
                + Tin mới
              </button>
            </div>
          </div>

          {/* New Chat User List */}
          {showNewChat && (
            <div style={{
              padding: '12px',
              borderBottom: '1px solid #eee',
              maxHeight: '200px',
              overflowY: 'auto',
              background: '#f8f9fa',
            }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: '#666' }}>Chọn người để chat:</p>
              {chatUsers.map((u) => (
                <div
                  key={u._id}
                  onClick={() => {
                    setSelectedUser(u);
                    setShowNewChat(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: selectedUser?._id === u._id ? '#e8efff' : 'white',
                  }}
                >
                  <img
                    src={getAvatar(u)}
                    alt={u.name}
                    style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{u.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#666' }}>{u.role}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Conversation List or Messages */}
          {!selectedUser ? (
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {conversations.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
                  <p>Chưa có cuộc trò chuyện nào</p>
                  <button
                    onClick={() => setShowNewChat(true)}
                    style={{
                      background: '#667eea',
                      color: 'white',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      marginTop: '10px',
                    }}
                  >
                    Bắt đầu cuộc trò chuyện
                  </button>
                </div>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.user._id}
                    onClick={() => setSelectedUser(conv.user)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      borderBottom: '1px solid #f0f0f0',
                      cursor: 'pointer',
                      background: '#fff',
                    }}
                  >
                    <div style={{ position: 'relative' }}>
                      <img
                        src={getAvatar(conv.user)}
                        alt={conv.user.name}
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
                        <span style={{ fontWeight: conv.unreadCount > 0 ? '700' : '600', fontSize: '0.95rem' }}>
                          {conv.user.name}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#999' }}>
                          {formatTime(conv.lastMessage.createdAt)}
                        </span>
                      </div>
                      <div style={{
                        fontSize: '0.85rem',
                        color: conv.unreadCount > 0 ? '#333' : '#666',
                        fontWeight: conv.unreadCount > 0 ? '500' : '400',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {conv.lastMessage.sender._id === user._id ? 'Bạn: ' : ''}{conv.lastMessage.content}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid #eee',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: '#f8f9fa',
              }}>
                <button
                  onClick={() => setSelectedUser(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.2rem',
                    cursor: 'pointer',
                    padding: '4px',
                  }}
                >
                  ←
                </button>
                <img
                  src={getAvatar(selectedUser)}
                  alt={selectedUser.name}
                  style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{selectedUser.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#666' }}>{selectedUser.role}</div>
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px', background: '#f5f5f5' }}>
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>Đang tải...</div>
                ) : messages.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👋</div>
                    <p>Hãy gửi tin nhắn để bắt đầu cuộc trò chuyện</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.sender._id === user._id;
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
                            src={getAvatar(msg.sender)}
                            alt={msg.sender.name}
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
                            lineHeight: '1.4',
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
                    fontSize: '1.2rem',
                  }}
                >
                  ➤
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default ChatWidget;

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
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrAmount, setQrAmount] = useState('');
  const [qrImage, setQrImage] = useState(null);
  const [lastMessageId, setLastMessageId] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

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

  // Scroll to bottom only on new messages
  useEffect(() => {
    if (messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      if (latestMessage._id !== lastMessageId) {
        setLastMessageId(latestMessage._id);
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [messages]);

  // Refresh data periodically but smarter
  useEffect(() => {
    if (isAuthenticated && isOpen) {
      const interval = setInterval(() => {
        if (isAdminOrStaff) {
          loadConversations();
        }
        loadUnreadCount();
        // Only load messages if viewing a chat and there are new ones
        if (selectedUser) {
          const prevLength = messages.length;
          loadMessagesSilent(selectedUser._id).then(newMessages => {
            if (newMessages.length > prevLength) {
              setMessages(newMessages);
            }
          });
        }
      }, 8000);

      return () => clearInterval(interval);
    }
  }, [isAuthenticated, isOpen, isAdminOrStaff, selectedUser, messages.length]);

  // Load admin/staff list
  const loadAdminList = async () => {
    try {
      const res = await chatService.getChatUsers();
      const admins = res.data.data || [];
      setAdminList(admins);
      if (admins.length > 0 && !selectedUser) {
        setSelectedUser(admins[0]);
        loadMessages(admins[0]._id);
      }
    } catch (err) {
      console.error('Error loading admin list:', err);
    }
  };

  // Load conversations
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

  // Load messages with loading state
  const loadMessages = async (userId) => {
    if (!userId) return;
    try {
      setLoading(true);
      const res = await chatService.getMessages(userId);
      const msgs = res.data.data || [];
      setMessages(msgs);
      if (msgs.length > 0) {
        setLastMessageId(msgs[msgs.length - 1]._id);
      }
      await chatService.markAsRead(userId);
      loadConversations();
    } catch (err) {
      console.error('Error loading messages:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load messages silently (no loading indicator)
  const loadMessagesSilent = async (userId) => {
    if (!userId) return [];
    try {
      const res = await chatService.getMessages(userId);
      return res.data.data || [];
    } catch (err) {
      return messages;
    }
  };

  // Handle image selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('Kích thước ảnh quá lớn. Vui lòng chọn ảnh dưới 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewImage(event.target.result);
        setShowImageUpload(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Send message with image
  const handleSendImage = async () => {
    let receiverId;
    if (isAdminOrStaff && selectedUser) {
      receiverId = selectedUser._id;
    } else if (!isAdminOrStaff && adminList.length > 0) {
      receiverId = adminList[0]._id;
    }

    if (!receiverId || !previewImage) return;

    try {
      setSending(true);
      await chatService.sendImageMessage(receiverId, previewImage, newMessage);
      setNewMessage('');
      setPreviewImage(null);
      setShowImageUpload(false);
      loadMessages(receiverId);
    } catch (err) {
      console.error('Error sending image:', err);
      alert('Lỗi khi gửi ảnh');
    } finally {
      setSending(false);
    }
  };

  // Send QR code
  const handleSendQR = async () => {
    let receiverId;
    if (isAdminOrStaff && selectedUser) {
      receiverId = selectedUser._id;
    } else if (!isAdminOrStaff && adminList.length > 0) {
      receiverId = adminList[0]._id;
    }

    if (!receiverId || !qrImage) return;

    try {
      setSending(true);
      await chatService.sendQRMessage(receiverId, qrImage, `Yêu cầu thanh toán: ${qrAmount ? formatCurrency(parseInt(qrAmount)) : ''}`);
      setShowQRModal(false);
      setQrAmount('');
      setQrImage(null);
      loadMessages(receiverId);
    } catch (err) {
      console.error('Error sending QR:', err);
    } finally {
      setSending(false);
    }
  };

  // Send text message
  const handleSendMessage = async (e) => {
    e?.preventDefault();

    let receiverId;
    if (isAdminOrStaff && selectedUser) {
      receiverId = selectedUser._id;
    } else if (!isAdminOrStaff && adminList.length > 0) {
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
    } finally {
      setSending(false);
    }
  };

  // Generate QR placeholder (in real app, would call a QR API)
  const generateQR = () => {
    // Create a simple QR placeholder using a service
    const amount = qrAmount || '100000';
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=STK:123456789&BANK=VCB&AMOUNT=${amount}`;
    setQrImage(qrUrl);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount);
  };

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

  const getAvatar = (u) => {
    if (u?.avatar) return u.avatar;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(u?.name?.[0] || 'U')}&background=667eea&color=fff&size=128&bold=true`;
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN': return { label: '👑 Admin', color: '#e74c3c' };
      case 'STAFF': return { label: '👔 NV', color: '#3498db' };
      default: return { label: '👤 Khách', color: '#27ae60' };
    }
  };

  const isMyMessage = (msg) => {
    const senderId = typeof msg.sender === 'object' ? msg.sender._id : msg.sender;
    return senderId === user._id;
  };

  const isAdminMessage = (msg) => {
    const sender = typeof msg.sender === 'object' ? msg.sender : { role: 'USER' };
    return sender.role === 'ADMIN' || sender.role === 'STAFF';
  };

  const getSenderInfo = (msg) => {
    if (typeof msg.sender === 'object') return msg.sender;
    return { name: 'Người dùng', role: 'USER' };
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
          height: '550px',
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
                  onClick={() => { setSelectedUser(null); setMessages([]); }}
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
                  {selectedUser ? `💬 ${selectedUser.name}` : isAdminOrStaff ? '💬 Hộp thư' : '💬 Hỗ trợ'}
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', opacity: 0.9 }}>
                  {selectedUser ? getRoleBadge(selectedUser.role).label : isAdminOrStaff ? `${conversations.length} cuộc trò chuyện` : 'Gửi tin nhắn để được hỗ trợ'}
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
                      const isRightSide = isAdmin;
                      const isImage = msg.messageType === 'image';
                      const isQR = msg.messageType === 'qr';

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
                          {!isAdmin && (
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              marginBottom: '4px',
                            }}>
                              <img src={getAvatar(sender)} alt="" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
                              <span style={{ fontSize: '0.75rem', fontWeight: '600', color: getRoleBadge(sender.role).color }}>
                                {sender.name} • {getRoleBadge(sender.role).label}
                              </span>
                            </div>
                          )}

                          <div style={{
                            maxWidth: '85%',
                            display: 'flex',
                            flexDirection: isRightSide ? 'row-reverse' : 'row',
                            alignItems: 'flex-end',
                            gap: '6px',
                          }}>
                            {isRightSide ? (
                              <>
                                {isImage ? (
                                  <img
                                    src={msg.image}
                                    alt=""
                                    style={{
                                      maxWidth: '200px',
                                      borderRadius: '12px',
                                      cursor: 'pointer',
                                    }}
                                    onClick={() => window.open(msg.image, '_blank')}
                                  />
                                ) : isQR ? (
                                  <div style={{
                                    background: 'white',
                                    padding: '8px',
                                    borderRadius: '12px',
                                    textAlign: 'center',
                                    maxWidth: '220px',
                                  }}>
                                    <img src={msg.image} alt="QR" style={{ width: '200px', borderRadius: '8px' }} />
                                    {msg.content && (
                                      <p style={{ margin: '8px 0 0 0', fontWeight: '600', color: '#27ae60' }}>{msg.content}</p>
                                    )}
                                  </div>
                                ) : (
                                  <div style={{
                                    background: '#667eea',
                                    color: 'white',
                                    padding: '8px 12px',
                                    borderRadius: '16px',
                                    borderBottomRightRadius: '4px',
                                    fontSize: '0.9rem',
                                    wordBreak: 'break-word',
                                  }}>
                                    {msg.content}
                                  </div>
                                )}
                                <span style={{ fontSize: '0.65rem', color: '#999' }}>{formatTime(msg.createdAt)}</span>
                              </>
                            ) : (
                              <>
                                <span style={{ fontSize: '0.65rem', color: '#999' }}>{formatTime(msg.createdAt)}</span>
                                {isImage ? (
                                  <img
                                    src={msg.image}
                                    alt=""
                                    style={{
                                      maxWidth: '200px',
                                      borderRadius: '12px',
                                      cursor: 'pointer',
                                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                    }}
                                    onClick={() => window.open(msg.image, '_blank')}
                                  />
                                ) : isQR ? (
                                  <div style={{
                                    background: 'white',
                                    padding: '8px',
                                    borderRadius: '12px',
                                    textAlign: 'center',
                                    maxWidth: '220px',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                  }}>
                                    <img src={msg.image} alt="QR" style={{ width: '200px', borderRadius: '8px' }} />
                                    {msg.content && (
                                      <p style={{ margin: '8px 0 0 0', fontWeight: '600', color: '#27ae60' }}>{msg.content}</p>
                                    )}
                                  </div>
                                ) : (
                                  <div style={{
                                    background: 'white',
                                    color: '#333',
                                    padding: '8px 12px',
                                    borderRadius: '16px',
                                    borderBottomLeftRadius: '4px',
                                    fontSize: '0.9rem',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                                    wordBreak: 'break-word',
                                  }}>
                                    {msg.content}
                                  </div>
                                )}
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

              {/* Image Preview */}
              {showImageUpload && previewImage && (
                <div style={{
                  padding: '8px 16px',
                  background: '#f0f0f0',
                  borderTop: '1px solid #ddd',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <img src={previewImage} alt="" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Thêm ghi chú (tùy chọn)..."
                    style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.85rem' }}
                  />
                  <button
                    onClick={handleSendImage}
                    disabled={sending}
                    style={{
                      padding: '8px 16px',
                      background: '#27ae60',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: sending ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {sending ? '...' : 'Gửi'}
                  </button>
                  <button
                    onClick={() => { setShowImageUpload(false); setPreviewImage(null); }}
                    style={{
                      padding: '8px 12px',
                      background: '#eee',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                    }}
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Input Area */}
              {!showImageUpload && (
                <form onSubmit={handleSendMessage} style={{
                  padding: '12px 16px',
                  borderTop: '1px solid #eee',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'white',
                }}>
                  {/* Image upload button */}
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: '#f0f0f0',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '1.1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    📷
                  </button>

                  {/* QR button */}
                  {isAdminOrStaff && (
                    <button
                      type="button"
                      onClick={() => setShowQRModal(true)}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: '#f0f0f0',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      💳
                    </button>
                  )}

                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={isAdminOrStaff ? 'Trả lời...' : 'Nhắn tin...'}
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
            </>
          ) : isAdminOrStaff ? (
            // Conversations list
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {conversations.length === 0 ? (
                <div style={{ padding: '3rem 2rem', textAlign: 'center', color: '#999' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                  <p style={{ fontWeight: '600', color: '#666' }}>Chưa có tin nhắn nào</p>
                </div>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.user?._id}
                    onClick={() => { setSelectedUser(conv.user); loadMessages(conv.user._id); }}
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
                      <img src={getAvatar(conv.user)} alt="" style={{ width: '48px', height: '48px', borderRadius: '50%' }} />
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
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: conv.unreadCount > 0 ? '700' : '600', fontSize: '0.9rem' }}>
                          {conv.user?.name || 'Người dùng'}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: '#999' }}>
                          {formatTime(conv.lastMessage?.createdAt)}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                        <span style={{ fontSize: '0.7rem', color: getRoleBadge(conv.user?.role).color, fontWeight: '600' }}>
                          {getRoleBadge(conv.user?.role).label}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px' }}>
                          • {conv.lastMessage?.content?.substring(0, 30) || 'Tin nhắn mới'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            // User - loading state
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
              <p>Đang kết nối...</p>
            </div>
          )}
        </div>
      )}

      {/* QR Modal */}
      {showQRModal && (
        <div
          onClick={() => setShowQRModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              padding: '24px',
              borderRadius: '16px',
              width: '320px',
              textAlign: 'center',
            }}
          >
            <h3 style={{ margin: '0 0 16px 0' }}>💳 Gửi mã QR thanh toán</h3>
            <input
              type="number"
              value={qrAmount}
              onChange={(e) => setQrAmount(e.target.value)}
              placeholder="Nhập số tiền (VNĐ)"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #ddd',
                borderRadius: '8px',
                fontSize: '1rem',
                marginBottom: '12px',
                boxSizing: 'border-box',
              }}
            />
            <button
              onClick={generateQR}
              style={{
                width: '100%',
                padding: '12px',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                marginBottom: '12px',
              }}
            >
              Tạo mã QR
            </button>
            {qrImage && (
              <div style={{ marginBottom: '12px' }}>
                <img src={qrImage} alt="QR" style={{ width: '200px', borderRadius: '8px' }} />
              </div>
            )}
            {qrImage && (
              <button
                onClick={handleSendQR}
                disabled={sending}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#27ae60',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: sending ? 'not-allowed' : 'pointer',
                  fontSize: '1rem',
                }}
              >
                {sending ? 'Đang gửi...' : 'Gửi QR'}
              </button>
            )}
            <button
              onClick={() => setShowQRModal(false)}
              style={{
                width: '100%',
                padding: '12px',
                background: '#eee',
                color: '#666',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                marginTop: '8px',
              }}
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;

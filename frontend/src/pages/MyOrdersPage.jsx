import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import orderService from '../services/orderService';
import sseService from '../config/sse';
import { useNotifications } from '../context/NotificationContext';
import { toast } from '../components/ToastNotification';

const MyOrdersPage = () => {
  const { markAllAsRead } = useNotifications();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cancelling, setCancelling] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [confirmingPayment, setConfirmingPayment] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    loadOrders();

    // Get userId from localStorage
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    let userId = null;
    if (userData) {
      try {
        userId = JSON.parse(userData).id;
      } catch (e) {
        // ignore
      }
    }

    // Connect to SSE for real-time order updates
    if (userId) {
      sseService.connect(userId);

      // Listen for real-time order updates
      sseService.onOrderUpdate((data) => {
        // Update the specific order in the list
        setOrders(prevOrders => {
          const index = prevOrders.findIndex(o => o._id === data.orderId);
          if (index !== -1) {
            const newOrders = [...prevOrders];
            newOrders[index] = { ...newOrders[index], ...data.order };
            return newOrders;
          }
          return prevOrders;
        });

        // Show toast notification
        if (data.message) {
          toast.success(data.message);
        }
      });
    }

    return () => {
      sseService.disconnect();
    };
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await orderService.getMyOrders();
      setOrders(res.data.data);
      setError('');

      const unfinishedCount = res.data.data.filter(
        order => !['COMPLETED', 'CANCELLED'].includes(order.status)
      ).length;

      if (unfinishedCount > 0) {
        // Orders still pending, notification system will handle unread count via SSE
      } else {
        markAllAsRead();
      }
    } catch (err) {
      setError('Không thể tải đơn hàng');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Bạn chắc chắn muốn hủy đơn hàng này không?')) {
      return;
    }

    try {
      setCancelling(orderId);
      setError('');
      await orderService.cancelOrder(orderId);
      setSuccess('Hủy đơn hàng thành công!');
      await loadOrders();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Hủy đơn hàng thất bại');
      console.error(err);
    } finally {
      setCancelling(null);
    }
  };

  const handleConfirmPaidToShipper = async (orderId) => {
    if (!window.confirm('Bạn đã thanh toán tiền cho shipper chưa?')) {
      return;
    }

    try {
      setConfirmingPayment(orderId);
      setError('');
      await orderService.confirmPaidToShipper(orderId);
      setSuccess('✅ Bạn đã xác nhận thanh toán cho shipper!');
      await loadOrders();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Xác nhận thất bại');
      console.error(err);
    } finally {
      setConfirmingPayment(null);
    }
  };

  // Xác nhận đã nhận được hàng (cho MoMo - chuyển thẳng sang COMPLETED)
  const handleReceivedOrder = async (orderId) => {
    if (!window.confirm('Bạn đã nhận được hàng?')) {
      return;
    }

    try {
      setConfirmingPayment(orderId);
      setError('');
      await orderService.updateOrderStatus(orderId, 'COMPLETED');
      setSuccess('✅ Đã xác nhận hoàn tất đơn hàng!');
      await loadOrders();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Xác nhận thất bại');
      console.error(err);
    } finally {
      setConfirmingPayment(null);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa đơn hàng này? Hành động này không thể hoàn tác.')) {
      return;
    }

    try {
      setDeleting(orderId);
      setError('');
      await orderService.deleteOrder(orderId);
      setSuccess('Xóa đơn hàng thành công!');
      await loadOrders();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Xóa đơn hàng thất bại');
      console.error(err);
    } finally {
      setDeleting(null);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: { label: '⏳ Chờ xác nhận', color: '#f39c12', bg: '#f39c1220' },
      CONFIRMED: { label: '✅ Đã xác nhận', color: '#3498db', bg: '#3498db20' },
      SHIPPED: { label: '📦 Đã giao ĐVVC', color: '#9b59b6', bg: '#9b59b620' },
      DELIVERING: { label: '🚚 Đang giao', color: '#e67e22', bg: '#e67e2220' },
      ARRIVED: { label: '🏪 Đã đến nơi', color: '#e74c3c', bg: '#e74c3c20' },
      PAID_TO_SHIPPER: { label: '💵 Đã thanh toán', color: '#27ae60', bg: '#27ae6020' },
      COMPLETED: { label: '🎉 Hoàn tất', color: '#27ae60', bg: '#27ae6020' },
      CANCELLED: { label: '❌ Đã hủy', color: '#e74c3c', bg: '#e74c3c20' },
    };
    return statusMap[status] || { label: status, color: '#7f8c8d', bg: '#7f8c8d20' };
  };

  const getStatusIndex = (status) => {
    const order = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERING', 'ARRIVED', 'PAID_TO_SHIPPER', 'COMPLETED'];
    const cancelIdx = order.indexOf('CANCELLED');
    return order.indexOf(status);
  };

  const getTimelineSteps = (status) => {
    const allSteps = [
      { key: 'PENDING', label: 'Đặt hàng', icon: '📝' },
      { key: 'CONFIRMED', label: 'Xác nhận', icon: '✅' },
      { key: 'SHIPPED', label: 'Giao ĐVVC', icon: '📦' },
      { key: 'DELIVERING', label: 'Đang giao', icon: '🚚' },
      { key: 'ARRIVED', label: 'Đến nơi', icon: '🏪' },
      { key: 'PAID_TO_SHIPPER', label: 'Thanh toán', icon: '💵' },
      { key: 'COMPLETED', label: 'Hoàn tất', icon: '🎉' },
    ];

    if (status === 'CANCELLED') {
      return allSteps.map(step => ({ ...step, active: false, cancelled: step.key === 'CONFIRMED' }));
    }

    const currentIdx = getStatusIndex(status);
    return allSteps.map((step, idx) => ({
      ...step,
      active: idx <= currentIdx,
    }));
  };

  const getFilteredOrders = () => {
    let filtered = orders;
    if (filterStatus === 'ALL') filtered = orders;
    else if (filterStatus === 'COMPLETED') {
      filtered = orders.filter(order => ['COMPLETED', 'CANCELLED'].includes(order.status));
    } else if (filterStatus === 'NOT_COMPLETED') {
      filtered = orders.filter(order => !['COMPLETED', 'CANCELLED'].includes(order.status));
    }
    // Sort by newest first (createdAt descending)
    return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  const toggleExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  if (loading) {
    return (
      <div className="container flex-center" style={{ minHeight: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid #f0f0f0',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: '#666' }}>Đang tải đơn hàng...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Header */}
      <div style={{
        marginBottom: '2rem',
        padding: '2rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '16px',
        color: 'white'
      }}>
        <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: '700' }}>
          📋 Đơn Hàng Của Tôi
        </h1>
        <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9 }}>
          Quản lý và theo dõi các đơn hàng của bạn
        </p>
      </div>

      {error && (
        <div style={{
          padding: '1rem 1.5rem',
          marginBottom: '1.5rem',
          backgroundColor: '#fee',
          color: '#e74c3c',
          borderRadius: '12px',
          borderLeft: '4px solid #e74c3c'
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          padding: '1rem 1.5rem',
          marginBottom: '1.5rem',
          backgroundColor: '#efe',
          color: '#27ae60',
          borderRadius: '12px',
          borderLeft: '4px solid #27ae60'
        }}>
          {success}
        </div>
      )}

      {/* Filter */}
      {orders.length > 0 && (
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '1.5rem',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => setFilterStatus('ALL')}
            style={{
              padding: '0.5rem 1rem',
              background: filterStatus === 'ALL' ? '#667eea' : 'white',
              color: filterStatus === 'ALL' ? 'white' : '#7f8c8d',
              border: '2px solid #667eea',
              borderRadius: '20px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }}
          >
            📋 Tất cả ({orders.length})
          </button>
          <button
            onClick={() => setFilterStatus('NOT_COMPLETED')}
            style={{
              padding: '0.5rem 1rem',
              background: filterStatus === 'NOT_COMPLETED' ? '#f39c12' : 'white',
              color: filterStatus === 'NOT_COMPLETED' ? 'white' : '#7f8c8d',
              border: '2px solid #f39c12',
              borderRadius: '20px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }}
          >
            ⏳ Chưa hoàn thành ({orders.filter(o => !['COMPLETED', 'CANCELLED'].includes(o.status)).length})
          </button>
          <button
            onClick={() => setFilterStatus('COMPLETED')}
            style={{
              padding: '0.5rem 1rem',
              background: filterStatus === 'COMPLETED' ? '#27ae60' : 'white',
              color: filterStatus === 'COMPLETED' ? 'white' : '#7f8c8d',
              border: '2px solid #27ae60',
              borderRadius: '20px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }}
          >
            ✅ Đã hoàn thành ({orders.filter(o => ['COMPLETED', 'CANCELLED'].includes(o.status)).length})
          </button>
        </div>
      )}

      {orders.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📦</div>
          <h2 style={{ color: '#2c3e50', marginBottom: '0.5rem' }}>Bạn chưa có đơn hàng nào</h2>
          <p style={{ color: '#7f8c8d', marginBottom: '1.5rem' }}>Hãy bắt đầu mua sắm ngay!</p>
          <Link to="/" style={{
            padding: '1rem 2rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600',
            display: 'inline-block'
          }}>
            Mua Sắm Ngay
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {getFilteredOrders().map((order) => {
            const statusInfo = getStatusBadge(order.status);
            const isExpanded = expandedOrder === order._id;

            return (
              <div key={order._id} style={{
                background: 'white',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                border: isExpanded ? '2px solid #667eea' : '2px solid transparent'
              }}>
                {/* COMPACT VIEW - Click to expand */}
                <div
                  onClick={() => toggleExpand(order._id)}
                  style={{
                    padding: '1rem 1.5rem',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '1.2rem', color: '#667eea' }}>{isExpanded ? '▼' : '▶'}</span>
                    <div>
                      <div style={{ fontWeight: '600', color: '#2c3e50', fontSize: '0.95rem' }}>
                        🕒 {new Date(order.createdAt).toLocaleString('vi-VN', {
                          day: '2-digit', month: '2-digit', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </div>
                      <div style={{ color: '#7f8c8d', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                        📦 {order.items?.length || 0} sản phẩm
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: '15px',
                      background: statusInfo.bg,
                      color: statusInfo.color,
                      fontWeight: '600',
                      fontSize: '0.8rem'
                    }}>
                      {statusInfo.label}
                    </span>
                    <div style={{ textAlign: 'right', minWidth: '100px' }}>
                      {order.discountAmount > 0 && (
                        <div style={{ fontSize: '0.75rem', color: '#999', textDecoration: 'line-through' }}>
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalPrice)}
                        </div>
                      )}
                      <div style={{ fontWeight: '700', color: '#e74c3c', fontSize: '1rem' }}>
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.finalPrice || order.totalPrice)}
                      </div>
                      {order.discountAmount > 0 && (
                        <div style={{ fontSize: '0.7rem', color: '#27ae60', fontWeight: '600' }}>
                          🎫 -{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.discountAmount)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* EXPANDED VIEW - Order Details */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid #eee', padding: '1.5rem' }}>
                    {/* Thông báo đặc biệt cho ARRIVED */}
                    {/* Chỉ hiện thông báo thanh toán cho shipper khi là COD */}
                    {order.status === 'ARRIVED' && order.paymentMethod === 'COD' && (
                      <div style={{
                        padding: '1rem',
                        marginBottom: '1rem',
                        background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
                        borderRadius: '8px',
                        color: 'white',
                        textAlign: 'center'
                      }}>
                        <p style={{ margin: 0, fontSize: '0.95rem' }}>
                          🔔 Đơn hàng đã đến nơi! Vui lòng thanh toán <strong>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.finalPrice || order.totalPrice)}</strong> cho shipper
                        </p>
                      </div>
                    )}

                    {/* Thông báo đã thanh toán MoMo */}
                    {order.status === 'ARRIVED' && order.paymentMethod === 'MOMO' && (
                      <div style={{
                        padding: '1rem',
                        marginBottom: '1rem',
                        background: 'linear-gradient(135deg, #a50064 0%, #880055 100%)',
                        borderRadius: '8px',
                        color: 'white',
                        textAlign: 'center'
                      }}>
                        <p style={{ margin: 0, fontSize: '0.95rem' }}>
                          💜 Đã nhận được hàng! Vui lòng giao hàng
                        </p>
                      </div>
                    )}

                    {/* Timeline theo dõi đơn hàng */}
                    <div style={{
                      padding: '1rem',
                      marginBottom: '1rem',
                      background: order.status === 'CANCELLED' ? '#fee' : '#f8f9fa',
                      borderRadius: '8px'
                    }}>
                      <div style={{ fontWeight: '600', color: '#2c3e50', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                        {order.status === 'CANCELLED' ? '❌ Đơn hàng đã bị hủy' : '📍 Theo dõi đơn hàng'}
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        position: 'relative'
                      }}>
                        {/* Line connecting steps */}
                        <div style={{
                          position: 'absolute',
                          top: '16px',
                          left: '20px',
                          right: '20px',
                          height: '3px',
                          background: '#e0e0e0',
                          zIndex: 0
                        }} />

                        {getTimelineSteps(order.status).map((step, idx) => (
                          <div key={step.key} style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            zIndex: 1,
                            flex: 1
                          }}>
                            <div style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              background: step.cancelled
                                ? '#e74c3c'
                                : step.active
                                  ? '#667eea'
                                  : '#e0e0e0',
                              color: step.cancelled
                                ? '#fff'
                                : step.active
                                  ? '#fff'
                                  : '#aaa',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.9rem',
                              fontWeight: '700',
                              marginBottom: '0.35rem',
                              boxShadow: step.active ? '0 2px 8px rgba(102,126,234,0.4)' : 'none',
                              textDecoration: step.cancelled ? 'line-through' : 'none',
                            }}>
                              {step.active && !step.cancelled ? idx + 1 : step.icon}
                            </div>
                            <div style={{
                              fontSize: '0.65rem',
                              fontWeight: step.active ? '700' : '400',
                              color: step.cancelled
                                ? '#e74c3c'
                                : step.active
                                  ? '#667eea'
                                  : '#aaa',
                              textAlign: 'center',
                              maxWidth: '45px',
                              lineHeight: 1.2
                            }}>
                              {step.label}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Danh sách sản phẩm */}
                    <div style={{ marginBottom: '1rem' }}>
                      <h4 style={{ margin: '0 0 0.75rem 0', color: '#2c3e50', fontSize: '0.95rem' }}>Sản phẩm:</h4>
                      {order.items?.map((item, index) => (
                        <div key={index} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                          padding: '0.75rem',
                          background: '#f8f9fa',
                          borderRadius: '8px',
                          marginBottom: '0.5rem'
                        }}>
                          <img
                            src={item.product?.image || 'https://via.placeholder.com/50'}
                            alt={item.product?.name}
                            style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px' }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '500', color: '#2c3e50', fontSize: '0.9rem' }}>
                              {item.product?.name || item.name || 'Sản phẩm'}
                            </div>
                            {(item.size || item.color) && (
                              <div style={{ fontSize: '0.8rem', color: '#7f8c8d' }}>
                                {item.size && `Size: ${item.size}`} {item.color && `| Màu: ${item.color}`}
                              </div>
                            )}
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ color: '#2c3e50', fontSize: '0.9rem' }}>x{item.quantity}</div>
                            <div style={{ color: '#e74c3c', fontWeight: '600', fontSize: '0.9rem' }}>
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price * item.quantity)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Địa chỉ & Thanh toán */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                      {order.shippingAddress && (
                        <div style={{ padding: '0.75rem', background: '#f8f9fa', borderRadius: '8px' }}>
                          <div style={{ fontWeight: '600', color: '#2c3e50', fontSize: '0.85rem', marginBottom: '0.5rem' }}>📍 Địa chỉ:</div>
                          <div style={{ color: '#7f8c8d', fontSize: '0.8rem' }}>
                            {order.shippingAddress.fullName}<br />
                            {order.shippingAddress.phone}<br />
                            {order.shippingAddress.address}
                          </div>
                        </div>
                      )}
                      {order.paymentMethod && (
                        <div style={{ padding: '0.75rem', background: '#f8f9fa', borderRadius: '8px' }}>
                          <div style={{ fontWeight: '600', color: '#2c3e50', fontSize: '0.85rem', marginBottom: '0.5rem' }}>💳 Thanh toán:</div>
                          <div style={{ color: '#7f8c8d', fontSize: '0.8rem' }}>
                            {order.paymentMethod === 'MOMO' ? '💜 MoMo' :
                             order.paymentMethod === 'COD' ? '📦 COD (Thanh toán khi nhận hàng)' : '🏦 VNPay'}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Coupon & Price Summary */}
                    <div style={{
                      padding: '0.75rem',
                      background: order.discountAmount > 0 ? '#f0fff4' : '#f8f9fa',
                      borderRadius: '8px',
                      marginBottom: '1rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span style={{ color: '#7f8c8d', fontSize: '0.85rem' }}>Tạm tính:</span>
                        <span style={{ color: '#7f8c8d', fontSize: '0.85rem' }}>
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalPrice)}
                        </span>
                      </div>
                      {order.discountAmount > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                          <span style={{ color: '#27ae60', fontSize: '0.85rem' }}>
                            🎫 Giảm giá {order.coupon?.code && `(Mã: ${order.coupon.code})`}:
                          </span>
                          <span style={{ color: '#27ae60', fontSize: '0.85rem', fontWeight: '600' }}>
                            -{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.discountAmount)}
                          </span>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #ddd', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                        <span style={{ fontWeight: '700', color: '#2c3e50', fontSize: '0.95rem' }}>Tổng cộng:</span>
                        <span style={{ fontWeight: '700', color: '#e74c3c', fontSize: '0.95rem' }}>
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.finalPrice)}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      {/* Nút xác nhận đã thanh toán cho shipper (COD) */}
                      {order.status === 'ARRIVED' && order.paymentMethod === 'COD' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleConfirmPaidToShipper(order._id); }}
                          disabled={confirmingPayment === order._id}
                          style={{
                            padding: '0.6rem 1rem',
                            background: confirmingPayment === order._id ? '#27ae60' : 'linear-gradient(135deg, #27ae60 0%, #229954 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: confirmingPayment === order._id ? 'not-allowed' : 'pointer',
                            fontWeight: '600',
                            fontSize: '0.85rem',
                            opacity: confirmingPayment === order._id ? 0.6 : 1
                          }}
                        >
                          {confirmingPayment === order._id ? '⏳ Đang xác nhận...' : '💵 Đã Thanh Toán Cho Shipper'}
                        </button>
                      )}

                      {/* Nút xác nhận đã nhận hàng (MoMo) */}
                      {order.status === 'ARRIVED' && order.paymentMethod === 'MOMO' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleReceivedOrder(order._id); }}
                          disabled={confirmingPayment === order._id}
                          style={{
                            padding: '0.6rem 1rem',
                            background: confirmingPayment === order._id ? '#a50064' : 'linear-gradient(135deg, #a50064 0%, #880055 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: confirmingPayment === order._id ? 'not-allowed' : 'pointer',
                            fontWeight: '600',
                            fontSize: '0.85rem',
                            opacity: confirmingPayment === order._id ? 0.6 : 1
                          }}
                        >
                          {confirmingPayment === order._id ? '⏳ Đang xác nhận...' : '📦 Đã Nhận Được Hàng'}
                        </button>
                      )}

                      {/* Nút hủy đơn - chỉ PENDING và CONFIRMED mới được hủy */}
                      {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleCancelOrder(order._id); }}
                          disabled={cancelling === order._id}
                          style={{
                            padding: '0.6rem 1rem',
                            background: 'white',
                            color: '#e74c3c',
                            border: '2px solid #e74c3c',
                            borderRadius: '6px',
                            cursor: cancelling === order._id ? 'not-allowed' : 'pointer',
                            fontWeight: '600',
                            fontSize: '0.85rem',
                            opacity: cancelling === order._id ? 0.6 : 1
                          }}
                        >
                          {cancelling === order._id ? '⏳ Đang hủy...' : '❌ Hủy Đơn'}
                        </button>
                      )}

                      {/* Nút xóa đơn - chỉ COMPLETED, PAID_TO_SHIPPER, CANCELLED mới được xóa */}
                      {(order.status === 'COMPLETED' || order.status === 'PAID_TO_SHIPPER' || order.status === 'CANCELLED') && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteOrder(order._id); }}
                          disabled={deleting === order._id}
                          style={{
                            padding: '0.6rem 1rem',
                            background: '#fee',
                            color: '#e74c3c',
                            border: '2px solid #e74c3c',
                            borderRadius: '6px',
                            cursor: deleting === order._id ? 'not-allowed' : 'pointer',
                            fontWeight: '600',
                            fontSize: '0.85rem',
                            opacity: deleting === order._id ? 0.6 : 1
                          }}
                        >
                          {deleting === order._id ? '⏳ Đang xóa...' : '🗑️ Xóa Đơn'}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;

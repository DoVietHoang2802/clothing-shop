import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import orderService from '../../services/orderService';
import sseService from '../../config/sse';
import { useNotifications } from '../../context/NotificationContext';
import { toast } from '../../components/ToastNotification';

const AdminOrdersPage = () => {
  const navigate = useNavigate();
  const { markAllAsRead } = useNotifications();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [highlightOrderId, setHighlightOrderId] = useState(null);

  useEffect(() => {
    loadOrders();

    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (userData && token) {
      sseService.connect(JSON.parse(userData).id);

      // Lắng nghe đơn hàng mới
      sseService.onNewOrder((data) => {
        if (data.order) {
          setOrders(prev => {
            if (!prev.find(o => o._id === data.order._id)) {
              setHighlightOrderId(data.order._id);
              setTimeout(() => setHighlightOrderId(null), 2000);
              toast.success(data.message || '📦 Có đơn hàng mới!');
              return [data.order, ...prev];
            }
            return prev;
          });
        }
      });

      // Lắng nghe cập nhật trạng thái (từ user)
      sseService.onOrderUpdate((data) => {
        if (data.orderId && data.order) {
          setOrders(prev => {
            const idx = prev.findIndex(o => o._id === data.orderId);
            if (idx !== -1) {
              setHighlightOrderId(data.orderId);
              setTimeout(() => setHighlightOrderId(null), 2000);
              const updated = [...prev];
              updated[idx] = { ...updated[idx], ...data.order };
              return updated;
            }
            return prev;
          });
          if (data.message) {
            toast.info(data.message);
          }
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
      setError('');
      const res = await orderService.getAllOrders();
      setOrders(res.data.data);

      const pendingCount = res.data.data.filter(order => order.status === 'PENDING').length;
      if (pendingCount === 0) {
        markAllAsRead();
      }
    } catch (err) {
      setError('Không thể tải đơn hàng');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      const res = await orderService.updateOrderStatus(orderId, newStatus);
      // Cập nhật state trực tiếp - không reload toàn bộ danh sách
      if (res.data.data) {
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, ...res.data.data } : o));
      }
      toast.success('✅ Cập nhật trạng thái thành công!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể cập nhật trạng thái');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa đơn hàng này?')) {
      return;
    }

    try {
      setDeletingId(orderId);
      await orderService.deleteOrderAdmin(orderId);
      // Xóa khỏi state trực tiếp - không reload
      setOrders(prev => prev.filter(o => o._id !== orderId));
      toast.success('✅ Xóa đơn hàng thành công!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể xóa đơn hàng');
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: { label: '⏳ Chờ Xác Nhận', color: '#f39c12', bg: '#f39c1220' },
      CONFIRMED: { label: '✅ Đã Xác Nhận', color: '#3498db', bg: '#3498db20' },
      SHIPPED: { label: '📦 Đã Giao Cho ĐVVC', color: '#9b59b6', bg: '#9b59b620' },
      DELIVERING: { label: '🚚 Đang Giao Hàng', color: '#e67e22', bg: '#e67e2220' },
      ARRIVED: { label: '🏪 Đã Đến Nơi', color: '#e74c3c', bg: '#e74c3c20' },
      PAID_TO_SHIPPER: { label: '💵 Đã Thanh Toán Cho Shipper', color: '#27ae60', bg: '#27ae6020' },
      COMPLETED: { label: '🎉 Hoàn Tất', color: '#27ae60', bg: '#27ae6020' },
      CANCELLED: { label: '❌ Đã Hủy', color: '#e74c3c', bg: '#e74c3c20' },
    };
    return statusMap[status] || { label: status, color: '#7f8c8d', bg: '#7f8c8d20' };
  };

  // Lọc đơn hàng + sắp xếp mới nhất trước
  const getFilteredOrders = () => {
    let filtered = orders;
    if (filterStatus === 'ALL') filtered = orders;
    else if (filterStatus === 'COMPLETED') {
      filtered = orders.filter(order => order.status === 'COMPLETED');
    } else if (filterStatus === 'NOT_COMPLETED') {
      filtered = orders.filter(order => !['COMPLETED', 'CANCELLED'].includes(order.status));
    } else {
      filtered = orders.filter(order => order.status === filterStatus);
    }
    // Sort by newest first (createdAt descending)
    return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  if (loading) {
    return (
      <div className="container flex-center" style={{ minHeight: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid #f0f0f0',
            borderTop: '4px solid #fa709a',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: '#666' }}>Đang tải...</p>
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
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .order-card-new {
          animation: slideIn 0.4s ease-out, pulse 0.5s ease-in-out;
        }
      `}</style>
      {/* Header */}
      <div style={{
        marginBottom: '2rem',
        padding: '2rem',
        background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        borderRadius: '16px',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: '700' }}>📦 Quản Lý Đơn Hàng</h1>
          <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9 }}>{orders.length} đơn hàng</p>
        </div>
        <button
          onClick={() => navigate('/admin/dashboard')}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'white',
            color: '#fa709a',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          ← Quay Lại
        </button>
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
          borderLeft: '4px solid #27ae60',
          animation: 'fadeIn 0.3s ease'
        }}>
          {success}
        </div>
      )}

      {/* Filter */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1.5rem',
        flexWrap: 'wrap'
      }}>
        {['ALL', 'NOT_COMPLETED', 'COMPLETED'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            style={{
              padding: '0.5rem 1rem',
              background: filterStatus === status ? '#fa709a' : 'white',
              color: filterStatus === status ? 'white' : '#7f8c8d',
              border: '2px solid #fa709a',
              borderRadius: '20px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }}
          >
            {status === 'ALL' ? `📋 Tất cả (${orders.length})` :
             status === 'NOT_COMPLETED' ? `⏳ Chưa hoàn thành (${orders.filter(o => !['COMPLETED', 'CANCELLED'].includes(o.status)).length})` :
             `✅ Đã hoàn thành (${orders.filter(o => o.status === 'COMPLETED').length})`}
          </button>
        ))}
      </div>

      {/* Orders */}
      {getFilteredOrders().length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '16px' }}>
          <div style={{ fontSize: '4rem' }}>📦</div>
          <h2 style={{ color: '#2c3e50' }}>Không có đơn hàng nào</h2>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {getFilteredOrders().map((order) => {
            const statusInfo = getStatusBadge(order.status);
            const isHighlighted = highlightOrderId === order._id;
            return (
              <div key={order._id} style={{
                background: 'white',
                borderRadius: '16px',
                boxShadow: isHighlighted
                  ? '0 0 0 3px #fa709a, 0 4px 12px rgba(250,112,154,0.4)'
                  : '0 4px 12px rgba(0,0,0,0.08)',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                animation: isHighlighted ? 'pulse 1s ease-in-out' : 'none'
              }}>
                {/* Order Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1.5rem',
                  background: '#f8f9fa',
                  borderBottom: '1px solid #eee'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem'
                    }}>
                      📦
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600', color: '#2c3e50' }}>
                        {order.user?.name || 'Không xác định'}
                      </h3>
                      <p style={{ margin: '0.25rem 0 0 0', color: '#7f8c8d', fontSize: '0.85rem' }}>
                        🕒 {new Date(order.createdAt).toLocaleString('vi-VN', {
                          day: '2-digit', month: '2-digit', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{
                      padding: '0.4rem 0.8rem',
                      borderRadius: '15px',
                      background: statusInfo.bg,
                      color: statusInfo.color,
                      fontWeight: '600',
                      fontSize: '0.8rem'
                    }}>
                      {statusInfo.label}
                    </span>
                    <span style={{ fontWeight: '700', color: '#e74c3c', fontSize: '1.1rem' }}>
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.finalPrice || order.totalPrice)}
                    </span>
                  </div>
                </div>

                {/* Order Body */}
                <div style={{ padding: '1.5rem', borderTop: '1px solid #eee' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div>
                      <p style={{ margin: 0, color: '#7f8c8d', fontSize: '0.85rem' }}>👤 Khách hàng</p>
                      <p style={{ margin: '0.25rem 0 0 0', fontWeight: '600', color: '#2c3e50' }}>
                        {order.user?.name || 'Không xác định'}
                      </p>
                      {order.shippingAddress && (
                        <>
                          <p style={{ margin: '0.5rem 0 0 0', color: '#7f8c8d', fontSize: '0.85rem' }}>📍 Địa chỉ giao hàng</p>
                          <p style={{ margin: '0.25rem 0 0 0', fontWeight: '500', color: '#2c3e50', fontSize: '0.85rem' }}>
                            {order.shippingAddress.fullName} - {order.shippingAddress.phone}
                            <br />
                            {order.shippingAddress.address}
                          </p>
                        </>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ margin: 0, color: '#7f8c8d', fontSize: '0.85rem' }}>📦 Sản phẩm</p>
                      <p style={{ margin: '0.25rem 0 0 0', fontWeight: '600', color: '#2c3e50' }}>
                        {order.items?.length || 0} sản phẩm
                      </p>
                      {order.paymentMethod && (
                        <>
                          <p style={{ margin: '0.5rem 0 0 0', color: '#7f8c8d', fontSize: '0.9rem' }}>Thanh toán</p>
                          <p style={{
                            margin: '0.25rem 0 0 0',
                            fontWeight: '600',
                            color: order.paymentMethod === 'MOMO' ? '#a50064' :
                                   order.paymentMethod === 'COD' ? '#e67e22' : '#3498db'
                          }}>
                            {order.paymentMethod === 'MOMO' ? '💜 MoMo' :
                             order.paymentMethod === 'COD' ? '📦 COD (Khi nhận hàng)' : '🏦 VNPay'}
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      disabled={updatingId === order._id || order.status === 'COMPLETED' || order.status === 'CANCELLED'}
                      style={{
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        border: '2px solid #ddd',
                        fontWeight: '600',
                        cursor: updatingId === order._id || order.status === 'COMPLETED' || order.status === 'CANCELLED' ? 'not-allowed' : 'pointer',
                        opacity: order.status === 'COMPLETED' || order.status === 'CANCELLED' ? 0.6 : 1
                      }}
                    >
                      <option value="PENDING">⏳ Chờ Xác Nhận</option>
                      <option value="CONFIRMED">✅ Đã Xác Nhận</option>
                      <option value="SHIPPED">📦 Đã Giao Cho ĐVVC</option>
                      <option value="DELIVERING">🚚 Đang Giao Hàng</option>
                      <option value="ARRIVED">🏪 Đã Đến Nơi</option>
                      <option value="PAID_TO_SHIPPER">💵 Đã Thanh Toán Cho Shipper</option>
                      <option value="COMPLETED">🎉 Hoàn Tất</option>
                      <option value="CANCELLED">❌ Hủy</option>
                    </select>

                    {/* Hiển thị label đặc biệt khi khách đã thanh toán cho shipper */}
                    {order.status === 'PAID_TO_SHIPPER' && (
                      <span style={{
                        padding: '0.5rem 1rem',
                        background: '#27ae60',
                        color: 'white',
                        borderRadius: '8px',
                        fontWeight: '600',
                        fontSize: '0.85rem'
                      }}>
                        ✅ Khách đã thanh toán cho shipper
                      </span>
                    )}

                    {['CANCELLED', 'COMPLETED'].includes(order.status) && (
                      <button
                        onClick={() => handleDeleteOrder(order._id)}
                        disabled={deletingId === order._id}
                        style={{
                          padding: '0.75rem 1.5rem',
                          background: '#fee',
                          color: '#e74c3c',
                          border: 'none',
                          borderRadius: '8px',
                          fontWeight: '600',
                          cursor: deletingId === order._id ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {deletingId === order._id ? '⏳ Đang xóa...' : '🗑️ Xóa đơn'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default AdminOrdersPage;

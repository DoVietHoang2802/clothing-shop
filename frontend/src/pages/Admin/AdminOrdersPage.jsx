import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import orderService from '../../services/orderService';
import { useNotifications } from '../../context/NotificationContext';

const AdminOrdersPage = () => {
  const navigate = useNavigate();
  const { markAdminRead, setAdminNotificationCount } = useNotifications();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await orderService.getAllOrders();
      setOrders(res.data.data);
      setError('');

      const pendingCount = res.data.data.filter(order => order.status === 'PENDING').length;
      if (pendingCount > 0) {
        setAdminNotificationCount(pendingCount);
      } else {
        markAdminRead();
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
      await orderService.updateOrderStatus(orderId, newStatus);
      setSuccess('✅ Cập nhật trạng thái thành công!');
      loadOrders();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Không thể cập nhật trạng thái');
      console.error(err);
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
      setSuccess('✅ Xóa đơn hàng thành công!');
      loadOrders();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể xóa đơn hàng');
      console.error(err);
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
      COMPLETED: { label: '🎉 Hoàn Tất', color: '#27ae60', bg: '#27ae6020' },
      CANCELLED: { label: '❌ Đã Hủy', color: '#e74c3c', bg: '#e74c3c20' },
    };
    return statusMap[status] || { label: status, color: '#7f8c8d', bg: '#7f8c8d20' };
  };

  const filteredOrders = filterStatus === 'ALL'
    ? orders
    : orders.filter(order => order.status === filterStatus);

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
        {['ALL', 'PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERING', 'ARRIVED', 'COMPLETED', 'CANCELLED'].map((status) => (
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
            {status === 'ALL' ? '📋 Tất cả' : getStatusBadge(status).label}
          </button>
        ))}
      </div>

      {/* Orders */}
      {filteredOrders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '16px' }}>
          <div style={{ fontSize: '4rem' }}>📦</div>
          <h2 style={{ color: '#2c3e50' }}>Không có đơn hàng nào</h2>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredOrders.map((order) => {
            const statusInfo = getStatusBadge(order.status);
            return (
              <div key={order._id} style={{
                background: 'white',
                borderRadius: '16px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                overflow: 'hidden',
                transition: 'all 0.3s ease'
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
                      <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#2c3e50' }}>
                        Đơn hàng #{order._id.substring(0, 8).toUpperCase()}
                      </h3>
                      <p style={{ margin: '0.25rem 0 0 0', color: '#7f8c8d', fontSize: '0.9rem' }}>
                        🕒 {new Date(order.createdAt).toLocaleString('vi-VN')}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '20px',
                      background: statusInfo.bg,
                      color: statusInfo.color,
                      fontWeight: '600'
                    }}>
                      {statusInfo.label}
                    </span>
                    <h3 style={{ margin: 0, color: '#e74c3c', fontSize: '1.3rem' }}>
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.finalPrice || order.totalPrice)}
                    </h3>
                  </div>
                </div>

                {/* Order Body */}
                <div style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div>
                      <p style={{ margin: 0, color: '#7f8c8d', fontSize: '0.9rem' }}>Khách hàng</p>
                      <p style={{ margin: '0.25rem 0 0 0', fontWeight: '600', color: '#2c3e50' }}>
                        {order.user?.name || 'Không xác định'}
                      </p>
                      {order.shippingAddress && (
                        <>
                          <p style={{ margin: '0.5rem 0 0 0', color: '#7f8c8d', fontSize: '0.9rem' }}>Địa chỉ giao hàng</p>
                          <p style={{ margin: '0.25rem 0 0 0', fontWeight: '500', color: '#2c3e50', fontSize: '0.9rem' }}>
                            {order.shippingAddress.fullName} - {order.shippingAddress.phone}
                            <br />
                            {order.shippingAddress.address}
                          </p>
                        </>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ margin: 0, color: '#7f8c8d', fontSize: '0.9rem' }}>Sản phẩm</p>
                      <p style={{ margin: '0.25rem 0 0 0', fontWeight: '600', color: '#2c3e50' }}>
                        {order.items?.length || 0} sản phẩm
                      </p>
                      {order.paymentMethod && (
                        <>
                          <p style={{ margin: '0.5rem 0 0 0', color: '#7f8c8d', fontSize: '0.9rem' }}>Thanh toán</p>
                          <p style={{
                            margin: '0.25rem 0 0 0',
                            fontWeight: '600',
                            color: order.paymentMethod === 'COD' ? '#e67e22' : '#3498db'
                          }}>
                            {order.paymentMethod === 'COD' ? '📦 COD (Khi nhận hàng)' : '🏦 VNPay'}
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
                      disabled={updatingId === order._id}
                      style={{
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        border: '2px solid #ddd',
                        fontWeight: '600',
                        cursor: updatingId === order._id ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <option value="PENDING">⏳ Chờ Xác Nhận</option>
                      <option value="CONFIRMED">✅ Đã Xác Nhận</option>
                      <option value="SHIPPED">📦 Đã Giao Cho ĐVVC</option>
                      <option value="DELIVERING">🚚 Đang Giao Hàng</option>
                      <option value="ARRIVED">🏪 Đã Đến Nơi</option>
                      <option value="COMPLETED">🎉 Hoàn Tất</option>
                      <option value="CANCELLED">❌ Hủy</option>
                    </select>

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

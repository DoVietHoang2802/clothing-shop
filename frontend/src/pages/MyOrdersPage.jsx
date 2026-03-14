import React, { useState, useEffect } from 'react';
import orderService from '../services/orderService';
import { useNotifications } from '../context/NotificationContext';

const MyOrdersPage = () => {
  const { markOrdersRead } = useNotifications();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cancelling, setCancelling] = useState(null);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    markOrdersRead(); // Mark notifications as read when user visits this page
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await orderService.getMyOrders();
      setOrders(res.data.data);
      setError('');
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

      // Reload orders
      await loadOrders();

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Hủy đơn hàng thất bại');
      console.error(err);
    } finally {
      setCancelling(null);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa đơn hàng này không? Hành động này không thể hoàn nguyên!')) {
      return;
    }

    try {
      setDeleting(orderId);
      setError('');
      await orderService.deleteOrder(orderId);
      setSuccess('Xóa đơn hàng thành công!');

      // Reload orders
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
      PENDING: '⏳ Chờ Xác Nhận',
      CONFIRMED: '✅ Đã Xác Nhận',
      SHIPPED: '📦 Đang Giao',
      COMPLETED: '🎉 Hoàn Tất',
      CANCELLED: '❌ Đã Hủy',
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return (
      <div className="container flex-center" style={{ minHeight: '400px' }}>
        <p>Đang tải đơn hàng...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>📋 Đơn Hàng Của Tôi</h1>

      {error && (
        <div
          style={{
            padding: '1rem',
            marginBottom: '1rem',
            backgroundColor: '#fee',
            color: '#c00',
            borderRadius: '4px',
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            padding: '1rem',
            marginBottom: '1rem',
            backgroundColor: '#efe',
            color: '#0a0',
            borderRadius: '4px',
          }}
        >
          {success}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ fontSize: '1.1rem' }}>Bạn chưa có đơn hàng nào</p>
        </div>
      ) : (
        <div style={{ marginTop: '2rem' }}>
          {orders.map((order) => (
            <div key={order._id} className="card" style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <h3>Đơn Hàng #{order._id.substring(0, 8)}</h3>
                  <p style={{ color: '#666' }}>
                    {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                    {getStatusBadge(order.status)}
                  </p>
                  {order.discountAmount > 0 && (
                    <>
                      <p style={{ textDecoration: 'line-through', color: '#999', marginBottom: '0.25rem' }}>
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                        }).format(order.totalPrice)}
                      </p>
                      <p style={{ color: '#27ae60', marginBottom: '0.5rem' }}>
                        Giảm: {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                        }).format(order.discountAmount)}
                      </p>
                    </>
                  )}
                  <h2 style={{ color: '#e74c3c' }}>
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(order.finalPrice || order.totalPrice)}
                  </h2>
                </div>
              </div>

              <table className="table" style={{ marginTop: '1rem' }}>
                <thead>
                  <tr>
                    <th>Sản Phẩm</th>
                    <th>Số Lượng</th>
                    <th>Đơn Giá</th>
                    <th>Thành Tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.product?.name}</td>
                      <td>{item.quantity}</td>
                      <td>
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                        }).format(item.price)}
                      </td>
                      <td>
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                        }).format(item.price * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Cancel & Delete Buttons */}
              <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                {order.status === 'PENDING' && (
                  <button
                    onClick={() => handleCancelOrder(order._id)}
                    disabled={cancelling === order._id}
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: cancelling === order._id ? 'not-allowed' : 'pointer',
                      fontWeight: 'bold',
                      opacity: cancelling === order._id ? 0.6 : 1,
                    }}
                  >
                    {cancelling === order._id ? 'Đang hủy...' : '❌ Hủy Đơn Hàng'}
                  </button>
                )}

                {['CANCELLED', 'COMPLETED'].includes(order.status) && (
                  <button
                    onClick={() => handleDeleteOrder(order._id)}
                    disabled={deleting === order._id}
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: deleting === order._id ? 'not-allowed' : 'pointer',
                      fontWeight: 'bold',
                      opacity: deleting === order._id ? 0.6 : 1,
                    }}
                  >
                    {deleting === order._id ? 'Đang xóa...' : '🗑️ Xóa Đơn Hàng'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;

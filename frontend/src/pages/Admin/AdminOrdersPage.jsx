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

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await orderService.getAllOrders();
      setOrders(res.data.data);
      setError('');

      // Count pending orders
      const pendingCount = res.data.data.filter(order => order.status === 'PENDING').length;

      // If logged in as admin, set notification count
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
      setSuccess('Cập nhật trạng thái thành công');
      loadOrders();
      setTimeout(() => setSuccess(''), 2000);
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
      setSuccess('Xóa đơn hàng thành công');
      loadOrders();
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể xóa đơn hàng');
      console.error(err);
    } finally {
      setDeletingId(null);
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
        <p>Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>📦 Quản Lý Đơn Hàng</h1>
        <button className="btn btn-secondary" onClick={() => navigate('/admin/dashboard')}>
          ← Quay Lại
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {orders.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Không có đơn hàng nào</p>
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>ID Đơn Hàng</th>
                <th>Khách Hàng</th>
                <th>Tổng Tiền</th>
                <th>Chiết Khấu</th>
                <th>Thành Tiền</th>
                <th>Trạng Thái</th>
                <th>Ngày Tạo</th>
                <th>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>{order._id.substring(0, 8)}</td>
                  <td>{order.user?.name}</td>
                  <td>
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(order.totalPrice)}
                  </td>
                  <td>
                    {order.discountAmount > 0 ? (
                      <span style={{ color: '#27ae60', fontWeight: 'bold' }}>
                        -{new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                        }).format(order.discountAmount)}
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(order.finalPrice || order.totalPrice)}
                  </td>
                  <td>{getStatusBadge(order.status)}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        disabled={updatingId === order._id}
                        style={{ padding: '0.5rem', borderRadius: '4px' }}
                      >
                        <option value="PENDING">Chờ Xác Nhận</option>
                        <option value="CONFIRMED">Đã Xác Nhận</option>
                        <option value="SHIPPED">Đang Giao</option>
                        <option value="COMPLETED">Hoàn Tất</option>
                        <option value="CANCELLED">Hủy</option>
                      </select>
                      {['CANCELLED'].includes(order.status) && (
                        <button
                          onClick={() => handleDeleteOrder(order._id)}
                          disabled={deletingId === order._id}
                          style={{
                            padding: '0.5rem',
                            backgroundColor: '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                          }}
                        >
                          {deletingId === order._id ? 'Xóa...' : 'Xóa'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;

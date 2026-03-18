import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import orderService from '../services/orderService';
import { useNotifications } from '../context/NotificationContext';

const MyOrdersPage = () => {
  const { markOrdersRead, setOrderNotificationCount } = useNotifications();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cancelling, setCancelling] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [confirmingPayment, setConfirmingPayment] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL'); // ALL, COMPLETED, NOT_COMPLETED

  useEffect(() => {
    loadOrders();
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
        setOrderNotificationCount(unfinishedCount);
      } else {
        markOrdersRead();
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

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa đơn hàng này không?')) {
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
      PENDING: { label: '⏳ Chờ Xác Nhận', color: '#f39c12', bg: '#f39c1220' },
      CONFIRMED: { label: '✅ Đã Xác Nhận', color: '#3498db', bg: '#3498db20' },
      SHIPPED: { label: '📦 Đã Giao Cho ĐVVC', color: '#9b59b6', bg: '#9b59b620' },
      DELIVERING: { label: '🚚 Đang Giao Hàng', color: '#e67e22', bg: '#e67e2220' },
      ARRIVED: { label: '🏪 Đã Đến Nơi - Chờ Thanh Toán', color: '#e74c3c', bg: '#e74c3c20' },
      PAID_TO_SHIPPER: { label: '💵 Đã Thanh Toán Cho Shipper', color: '#27ae60', bg: '#27ae6020' },
      COMPLETED: { label: '🎉 Hoàn Tất', color: '#27ae60', bg: '#27ae6020' },
      CANCELLED: { label: '❌ Đã Hủy', color: '#e74c3c', bg: '#e74c3c20' },
    };
    return statusMap[status] || { label: status, color: '#7f8c8d', bg: '#7f8c8d20' };
  };

  // Xử lý xác nhận đã thanh toán cho shipper
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

  // Lọc đơn hàng
  const getFilteredOrders = () => {
    if (filterStatus === 'ALL') return orders;
    if (filterStatus === 'COMPLETED') {
      return orders.filter(order => order.status === 'COMPLETED');
    }
    if (filterStatus === 'NOT_COMPLETED') {
      return orders.filter(order => !['COMPLETED', 'CANCELLED'].includes(order.status));
    }
    return orders;
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
          borderLeft: '4px solid #e74c3c',
          animation: 'shake 0.5s ease-in-out'
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
            ✅ Đã hoàn thành ({orders.filter(o => o.status === 'COMPLETED').length})
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {getFilteredOrders().map((order) => {
            const statusInfo = getStatusBadge(order.status);
            return (
              <div key={order._id} style={{
                background: 'white',
                borderRadius: '16px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                overflow: 'hidden',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
              }}
              >
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
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      color: 'white'
                    }}>
                      📦
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#2c3e50' }}>
                        Đơn Hàng #{order._id.substring(0, 8).toUpperCase()}
                      </h3>
                      <p style={{ margin: '0.25rem 0 0 0', color: '#7f8c8d', fontSize: '0.9rem' }}>
                        🕒 {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '20px',
                      background: statusInfo.bg,
                      color: statusInfo.color,
                      fontWeight: '600',
                      fontSize: '0.9rem'
                    }}>
                      {statusInfo.label}
                    </span>
                    <div style={{ textAlign: 'right' }}>
                      {order.discountAmount > 0 && (
                        <>
                          <p style={{
                            textDecoration: 'line-through',
                            color: '#999',
                            margin: 0,
                            fontSize: '0.9rem'
                          }}>
                            {new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: 'VND',
                            }).format(order.totalPrice)}
                          </p>
                          <p style={{ color: '#27ae60', margin: '0.25rem 0 0 0', fontSize: '0.85rem' }}>
                            🎉 Giảm: {new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: 'VND',
                            }).format(order.discountAmount)}
                          </p>
                        </>
                      )}
                      <h3 style={{
                        margin: '0.5rem 0 0 0',
                        color: '#e74c3c',
                        fontSize: '1.4rem',
                        fontWeight: '700'
                      }}>
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                        }).format(order.finalPrice || order.totalPrice)}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div style={{ padding: '1.5rem' }}>
                  {/* Special notification for ARRIVED orders (COD payment) */}
                  {order.status === 'ARRIVED' && (
                    <div style={{
                      padding: '1rem',
                      marginBottom: '1rem',
                      background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
                      borderRadius: '12px',
                      color: 'white',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔔</div>
                      <h4 style={{ margin: '0 0 0.5rem 0' }}>Đơn Hàng Đã Đến Nơi!</h4>
                      <p style={{ margin: 0, fontSize: '0.95rem', opacity: 0.9 }}>
                        Vui lòng thanh toán <strong>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.finalPrice || order.totalPrice)}</strong> cho nhân viên giao hàng
                      </p>
                    </div>
                  )}

                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
                        <th style={{ textAlign: 'left', padding: '0.75rem', color: '#7f8c8d', fontWeight: '600' }}>Sản Phẩm</th>
                        <th style={{ textAlign: 'center', padding: '0.75rem', color: '#7f8c8d', fontWeight: '600' }}>Số Lượng</th>
                        <th style={{ textAlign: 'right', padding: '0.75rem', color: '#7f8c8d', fontWeight: '600' }}>Đơn Giá</th>
                        <th style={{ textAlign: 'right', padding: '0.75rem', color: '#7f8c8d', fontWeight: '600' }}>Thành Tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item, index) => (
                        <tr key={index} style={{ borderBottom: index < order.items.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                          <td style={{ padding: '1rem 0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              <img
                                src={item.product?.image || 'https://via.placeholder.com/50'}
                                alt={item.product?.name}
                                style={{
                                  width: '50px',
                                  height: '50px',
                                  objectFit: 'cover',
                                  borderRadius: '8px'
                                }}
                              />
                              <div>
                                <span style={{ fontWeight: '500', color: '#2c3e50' }}>
                                  {item.product?.name || item.name || 'Sản phẩm'}
                                </span>
                                {(item.size || item.color) && (
                                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: '#7f8c8d' }}>
                                    {item.size && `Size: ${item.size}`} {item.color && `| Màu: ${item.color}`}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td style={{ textAlign: 'center', padding: '1rem 0.75rem', color: '#2c3e50' }}>
                            {item.quantity}
                          </td>
                          <td style={{ textAlign: 'right', padding: '1rem 0.75rem', color: '#2c3e50' }}>
                            {new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: 'VND',
                            }).format(item.price)}
                          </td>
                          <td style={{ textAlign: 'right', padding: '1rem 0.75rem', color: '#2c3e50', fontWeight: '600' }}>
                            {new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: 'VND',
                            }).format(item.price * item.quantity)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Shipping Address & Payment Method */}
                  {(order.shippingAddress || order.paymentMethod) && (
                    <div style={{
                      marginTop: '1.5rem',
                      padding: '1rem',
                      background: '#f8f9fa',
                      borderRadius: '8px',
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '1rem'
                    }}>
                      {order.shippingAddress && (
                        <div>
                          <h5 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50', fontSize: '0.9rem' }}>
                            📍 Địa Chỉ Giao Hàng
                          </h5>
                          <p style={{ margin: 0, color: '#7f8c8d', fontSize: '0.85rem' }}>
                            {order.shippingAddress.fullName}<br />
                            {order.shippingAddress.phone}<br />
                            {order.shippingAddress.address}
                          </p>
                        </div>
                      )}
                      {order.paymentMethod && (
                        <div>
                          <h5 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50', fontSize: '0.9rem' }}>
                            💳 Phương Thức Thanh Toán
                          </h5>
                          <p style={{ margin: 0, color: '#7f8c8d', fontSize: '0.85rem' }}>
                            {order.paymentMethod === 'COD' ? '📦 Thanh toán khi nhận hàng (COD)' :
                              order.paymentMethod === 'VNPAY' ? '🏦 Thanh toán VNPay' : order.paymentMethod}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div style={{
                  padding: '1rem 1.5rem',
                  background: '#f8f9fa',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '1rem',
                  flexWrap: 'wrap'
                }}>
                  {/* Nút xác nhận đã thanh toán cho shipper - chỉ hiện khi đơn hàng ARRIVED và là COD */}
                  {order.status === 'ARRIVED' && order.paymentMethod === 'COD' && (
                    <button
                      onClick={() => handleConfirmPaidToShipper(order._id)}
                      disabled={confirmingPayment === order._id}
                      style={{
                        padding: '0.75rem 1.5rem',
                        background: confirmingPayment === order._id ? '#27ae60' : 'linear-gradient(135deg, #27ae60 0%, #229954 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: confirmingPayment === order._id ? 'not-allowed' : 'pointer',
                        fontWeight: '600',
                        opacity: confirmingPayment === order._id ? 0.6 : 1,
                        transition: 'all 0.3s ease',
                        boxShadow: '0 2px 8px rgba(39, 174, 96, 0.3)'
                      }}
                    >
                      {confirmingPayment === order._id ? '⏳ Đang xác nhận...' : '💵 Đã Thanh Toán Cho Shipper'}
                    </button>
                  )}

                  {order.status === 'PENDING' && (
                    <button
                      onClick={() => handleCancelOrder(order._id)}
                      disabled={cancelling === order._id}
                      style={{
                        padding: '0.75rem 1.5rem',
                        background: 'white',
                        color: '#e74c3c',
                        border: '2px solid #e74c3c',
                        borderRadius: '8px',
                        cursor: cancelling === order._id ? 'not-allowed' : 'pointer',
                        fontWeight: '600',
                        opacity: cancelling === order._id ? 0.6 : 1,
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {cancelling === order._id ? '⏳ Đang hủy...' : '❌ Hủy Đơn Hàng'}
                    </button>
                  )}

                  {['CANCELLED', 'COMPLETED'].includes(order.status) && (
                    <button
                      onClick={() => handleDeleteOrder(order._id)}
                      disabled={deleting === order._id}
                      style={{
                        padding: '0.75rem 1.5rem',
                        background: 'white',
                        color: '#7f8c8d',
                        border: '2px solid #ddd',
                        borderRadius: '8px',
                        cursor: deleting === order._id ? 'not-allowed' : 'pointer',
                        fontWeight: '600',
                        opacity: deleting === order._id ? 0.6 : 1,
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {deleting === order._id ? '⏳ Đang xóa...' : '🗑️ Xóa Đơn Hàng'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default MyOrdersPage;

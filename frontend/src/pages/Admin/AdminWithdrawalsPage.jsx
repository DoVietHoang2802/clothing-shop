import React, { useState, useEffect } from 'react';
import withdrawalService from '../../services/withdrawalService';

const AdminWithdrawalsPage = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    loadWithdrawals();
  }, []);

  const loadWithdrawals = async () => {
    try {
      const res = await withdrawalService.getAllWithdrawals();
      setWithdrawals(res.data.data);
    } catch (err) {
      console.error('Error loading withdrawals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status, note = '') => {
    try {
      setUpdating(id);
      await withdrawalService.updateWithdrawalStatus(id, { status, note });
      loadWithdrawals();
    } catch (err) {
      console.error('Error updating withdrawal:', err);
      alert('Lỗi khi cập nhật trạng thái');
    } finally {
      setUpdating(null);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { bg: '#fff3cd', color: '#856404', text: 'Chờ xử lý' },
      APPROVED: { bg: '#d4edda', color: '#155724', text: 'Đã duyệt' },
      REJECTED: { bg: '#f8d7da', color: '#721c24', text: 'Từ chối' },
      COMPLETED: { bg: '#d4edda', color: '#155724', text: 'Hoàn thành' },
    };
    const config = statusConfig[status] || statusConfig.PENDING;
    return <span style={{ background: config.bg, color: config.color, padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '600' }}>{config.text}</span>;
  };

  if (loading) {
    return (
      <div className="container flex-center" style={{ minHeight: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid #f0f0f0', borderTop: '3px solid #667eea', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
          <p style={{ color: '#666', marginTop: '1rem' }}>Đang tải...</p>
        </div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Header */}
      <div style={{ marginBottom: '2rem', padding: '2rem', background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', borderRadius: '16px', color: 'white' }}>
        <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: '700' }}>💰 Quản Lý Rút Tiền</h1>
        <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9 }}>Danh sách yêu cầu rút tiền từ người dùng</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <p style={{ margin: 0, color: '#7f8c8d', fontSize: '0.9rem' }}>Tổng yêu cầu</p>
          <h3 style={{ margin: '0.5rem 0 0 0', color: '#2c3e50' }}>{withdrawals.length}</h3>
        </div>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <p style={{ margin: 0, color: '#7f8c8d', fontSize: '0.9rem' }}>Chờ xử lý</p>
          <h3 style={{ margin: '0.5rem 0 0 0', color: '#f39c12' }}>{withdrawals.filter(w => w.status === 'PENDING').length}</h3>
        </div>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <p style={{ margin: 0, color: '#7f8c8d', fontSize: '0.9rem' }}>Đã hoàn thành</p>
          <h3 style={{ margin: '0.5rem 0 0 0', color: '#27ae60' }}>{withdrawals.filter(w => w.status === 'COMPLETED').length}</h3>
        </div>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <p style={{ margin: 0, color: '#7f8c8d', fontSize: '0.9rem' }}>Tổng tiền đã rút</p>
          <h3 style={{ margin: '0.5rem 0 0 0', color: '#e74c3c' }}>{formatCurrency(withdrawals.filter(w => w.status === 'COMPLETED').reduce((sum, w) => sum + w.amount, 0))}</h3>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #eee' }}>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#7f8c8d', fontWeight: '600' }}>STT</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#7f8c8d', fontWeight: '600' }}>Người dùng</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#7f8c8d', fontWeight: '600' }}>Số tiền</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#7f8c8d', fontWeight: '600' }}>Ngân hàng</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#7f8c8d', fontWeight: '600' }}>Trạng thái</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#7f8c8d', fontWeight: '600' }}>Ngày tạo</th>
                <th style={{ padding: '1rem', textAlign: 'center', color: '#7f8c8d', fontWeight: '600' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: '#7f8c8d' }}>Không có yêu cầu rút tiền nào</td>
                </tr>
              ) : (
                withdrawals.map((item, index) => (
                  <tr key={item._id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '1rem', color: '#7f8c8d' }}>{index + 1}</td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: '600', color: '#2c3e50' }}>{item.user?.name || 'N/A'}</div>
                      <div style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>{item.user?.email || 'N/A'}</div>
                    </td>
                    <td style={{ padding: '1rem', fontWeight: '700', color: '#e74c3c' }}>{formatCurrency(item.amount)}</td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ color: '#2c3e50' }}>{item.bankName}</div>
                      <div style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>{item.accountNumber} - {item.accountHolder}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>{getStatusBadge(item.status)}</td>
                    <td style={{ padding: '1rem', color: '#7f8c8d' }}>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      {item.status === 'PENDING' && (
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                          <button
                            onClick={() => handleUpdateStatus(item._id, 'COMPLETED')}
                            disabled={updating === item._id}
                            style={{ padding: '0.5rem 1rem', background: '#27ae60', color: 'white', border: 'none', borderRadius: '6px', cursor: updating === item._id ? 'not-allowed' : 'pointer', fontSize: '0.85rem' }}
                          >
                            ✅ Duyệt
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(item._id, 'REJECTED')}
                            disabled={updating === item._id}
                            style={{ padding: '0.5rem 1rem', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '6px', cursor: updating === item._id ? 'not-allowed' : 'pointer', fontSize: '0.85rem' }}
                          >
                            ❌ Từ chối
                          </button>
                        </div>
                      )}
                      {item.status !== 'PENDING' && (
                        <span style={{ color: '#7f8c8d', fontSize: '0.85rem' }}>Đã xử lý</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminWithdrawalsPage;

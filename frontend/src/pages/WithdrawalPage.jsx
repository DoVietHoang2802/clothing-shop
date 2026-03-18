import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import withdrawalService from '../services/withdrawalService';
import { useAuth } from '../context/AuthContext';

const WithdrawalPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [balance, setBalance] = useState({ totalRevenue: 0, totalWithdrawn: 0, availableBalance: 0 });
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    amount: '',
    bankName: 'Vietcombank',
    accountNumber: '',
    accountHolder: '',
  });

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [balanceRes, withdrawalsRes] = await Promise.all([
        withdrawalService.getBalance(),
        withdrawalService.getMyWithdrawals(),
      ]);
      setBalance(balanceRes.data.data);
      setWithdrawals(withdrawalsRes.data.data);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const amount = parseInt(formData.amount);
    if (!amount || amount < 10000) {
      setError('Số tiền rút tối thiểu là 10,000 VNĐ');
      return;
    }

    if (amount > balance.availableBalance) {
      setError('Số dư khả dụng không đủ');
      return;
    }

    if (!formData.accountNumber || !formData.accountHolder) {
      setError('Vui lòng nhập đầy đủ thông tin tài khoản');
      return;
    }

    try {
      setSubmitting(true);
      await withdrawalService.createWithdrawal(formData);
      setSuccess('Yêu cầu rút tiền thành công!');
      setFormData({ amount: '', bankName: 'Vietcombank', accountNumber: '', accountHolder: '' });
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi tạo yêu cầu rút tiền');
    } finally {
      setSubmitting(false);
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

  if (!isAuthenticated) {
    return (
      <div className="container flex-center" style={{ minHeight: '60vh' }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔒</div>
          <h2 style={{ color: '#2c3e50' }}>Vui lòng đăng nhập</h2>
          <Link to="/login" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '600' }}>Đăng nhập ngay</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container flex-center" style={{ minHeight: '60vh' }}>
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
        <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: '700' }}>💰 Rút Tiền</h1>
        <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9 }}>Quản lý rút tiền từ doanh thu đơn hàng</p>
      </div>

      {error && (
        <div style={{ padding: '1rem', background: '#fee', color: '#e74c3c', borderRadius: '8px', marginBottom: '1rem' }}>{error}</div>
      )}
      {success && (
        <div style={{ padding: '1rem', background: '#efe', color: '#27ae60', borderRadius: '8px', marginBottom: '1rem' }}>{success}</div>
      )}

      {/* Balance Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <p style={{ margin: 0, color: '#7f8c8d', fontSize: '0.9rem' }}>Tổng doanh thu</p>
          <h3 style={{ margin: '0.5rem 0 0 0', color: '#2c3e50', fontSize: '1.3rem' }}>{formatCurrency(balance.totalRevenue)}</h3>
        </div>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <p style={{ margin: 0, color: '#7f8c8d', fontSize: '0.9rem' }}>Đã rút</p>
          <h3 style={{ margin: '0.5rem 0 0 0', color: '#e74c3c', fontSize: '1.3rem' }}>{formatCurrency(balance.totalWithdrawn)}</h3>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', padding: '1.5rem', borderRadius: '12px', color: 'white' }}>
          <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>Số dư khả dụng</p>
          <h3 style={{ margin: '0.5rem 0 0 0', fontSize: '1.3rem' }}>{formatCurrency(balance.availableBalance)}</h3>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Withdrawal Form */}
        <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', color: '#2c3e50' }}>📤 Yêu cầu rút tiền</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#2c3e50', fontWeight: '500' }}>Số tiền (VNĐ)</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="Nhập số tiền (tối thiểu 10,000)"
                min="10000"
                style={{ width: '100%', padding: '0.75rem', border: '2px solid #ddd', borderRadius: '8px', fontSize: '1rem' }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#2c3e50', fontWeight: '500' }}>Ngân hàng</label>
              <select
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                style={{ width: '100%', padding: '0.75rem', border: '2px solid #ddd', borderRadius: '8px', fontSize: '1rem' }}
              >
                <option value="Vietcombank">Vietcombank</option>
                <option value="ViettinBank">ViettinBank</option>
                <option value="BIDV">BIDV</option>
                <option value="Agribank">Agribank</option>
                <option value="MB Bank">MB Bank</option>
                <option value="TP Bank">TP Bank</option>
              </select>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#2c3e50', fontWeight: '500' }}>Số tài khoản</label>
              <input
                type="text"
                value={formData.accountNumber}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                placeholder="Nhập số tài khoản"
                style={{ width: '100%', padding: '0.75rem', border: '2px solid #ddd', borderRadius: '8px', fontSize: '1rem' }}
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#2c3e50', fontWeight: '500' }}>Tên chủ tài khoản</label>
              <input
                type="text"
                value={formData.accountHolder}
                onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
                placeholder="Nhập tên chủ tài khoản"
                style={{ width: '100%', padding: '0.75rem', border: '2px solid #ddd', borderRadius: '8px', fontSize: '1rem' }}
              />
            </div>
            <button
              type="submit"
              disabled={submitting || balance.availableBalance < 10000}
              style={{ width: '100%', padding: '1rem', background: submitting || balance.availableBalance < 10000 ? '#ccc' : 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: submitting ? 'not-allowed' : 'pointer' }}
            >
              {submitting ? '⏳ Đang xử lý...' : '💰 Rút tiền ngay'}
            </button>
          </form>
        </div>

        {/* Withdrawal History */}
        <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', color: '#2c3e50' }}>📋 Lịch sử rút tiền</h3>
          {withdrawals.length === 0 ? (
            <p style={{ color: '#7f8c8d', textAlign: 'center' }}>Chưa có yêu cầu rút tiền nào</p>
          ) : (
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {withdrawals.map((item) => (
                <div key={item._id} style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: '600', color: '#2c3e50' }}>{formatCurrency(item.amount)}</span>
                    {getStatusBadge(item.status)}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>
                    <div>{item.bankName} - {item.accountNumber}</div>
                    <div>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WithdrawalPage;

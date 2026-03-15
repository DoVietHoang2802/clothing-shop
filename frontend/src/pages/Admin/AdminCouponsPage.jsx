import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { couponService } from '../../services/couponService';

const AdminCouponsPage = () => {
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    minOrderValue: '',
    maxDiscount: '',
    usageLimit: '',
    expiresAt: '',
    isActive: true,
  });

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const res = await couponService.getAllCoupons(1, 100);
      setCoupons(res.data || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách coupon');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      discountType: 'PERCENTAGE',
      discountValue: '',
      minOrderValue: '',
      maxDiscount: '',
      usageLimit: '',
      expiresAt: '',
      isActive: true,
    });
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!formData.code || !formData.discountType || !formData.discountValue) {
      setError('Vui lòng nhập đầy đủ mã, loại giảm giá và giá trị giảm');
      return;
    }

    try {
      const payload = {
        code: formData.code,
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        minOrderValue: formData.minOrderValue ? Number(formData.minOrderValue) : 0,
        maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : null,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
        expiresAt: formData.expiresAt || null,
        isActive: formData.isActive,
      };

      if (editingId) {
        await couponService.updateCoupon(editingId, payload);
        setSuccess('✅ Cập nhật coupon thành công!');
      } else {
        await couponService.createCoupon(payload);
        setSuccess('✅ Tạo coupon thành công!');
      }

      resetForm();
      setShowForm(false);
      await loadCoupons();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi lưu coupon');
    }
  };

  const handleEdit = (coupon) => {
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderValue: coupon.minOrderValue || '',
      maxDiscount: coupon.maxDiscount || '',
      usageLimit: coupon.usageLimit || '',
      expiresAt: coupon.expiresAt ? coupon.expiresAt.substring(0, 10) : '',
      isActive: coupon.isActive,
    });
    setEditingId(coupon._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa coupon này?')) return;
    try {
      await couponService.deleteCoupon(id);
      setSuccess('✅ Xóa coupon thành công!');
      await loadCoupons();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể xóa coupon');
    }
  };

  const handleCancel = () => {
    resetForm();
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="container flex-center" style={{ minHeight: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid #f0f0f0',
            borderTop: '4px solid #43e97b',
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
        background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        borderRadius: '16px',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: '700' }}>🎫 Quản Lý Coupon</h1>
          <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9 }}>{coupons.length} coupon</p>
        </div>
        <button
          onClick={() => navigate('/admin/dashboard')}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'white',
            color: '#43e97b',
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

      {/* Add Button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          style={{
            padding: '1rem 2rem',
            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer',
            marginBottom: '1.5rem'
          }}
        >
          ➕ Thêm Coupon Mới
        </button>
      )}

      {/* Form */}
      {showForm && (
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '2rem',
          marginBottom: '1.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        }}>
          <h3 style={{ margin: '0 0 1.5rem 0', color: '#2c3e50' }}>
            {editingId ? '✏️ Chỉnh sửa coupon' : '➕ Thêm coupon mới'}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Mã coupon *</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="ABC123"
                style={{ width: '100%', padding: '0.75rem', border: '2px solid #e0e0e0', borderRadius: '8px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Loại giảm giá *</label>
              <select
                value={formData.discountType}
                onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                style={{ width: '100%', padding: '0.75rem', border: '2px solid #e0e0e0', borderRadius: '8px' }}
              >
                <option value="PERCENTAGE">Phần trăm (%)</option>
                <option value="FIXED">Giảm cố định (VND)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Giá trị giảm *</label>
              <input
                type="number"
                value={formData.discountValue}
                onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                placeholder={formData.discountType === 'PERCENTAGE' ? '10' : '50000'}
                style={{ width: '100%', padding: '0.75rem', border: '2px solid #e0e0e0', borderRadius: '8px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Đơn hàng tối thiểu (VND)</label>
              <input
                type="number"
                value={formData.minOrderValue}
                onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                placeholder="0"
                style={{ width: '100%', padding: '0.75rem', border: '2px solid #e0e0e0', borderRadius: '8px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Giảm tối đa (VND)</label>
              <input
                type="number"
                value={formData.maxDiscount}
                onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                placeholder="Không giới hạn"
                style={{ width: '100%', padding: '0.75rem', border: '2px solid #e0e0e0', borderRadius: '8px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Số lần sử dụng</label>
              <input
                type="number"
                value={formData.usageLimit}
                onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                placeholder="Không giới hạn"
                style={{ width: '100%', padding: '0.75rem', border: '2px solid #e0e0e0', borderRadius: '8px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Ngày hết hạn</label>
              <input
                type="date"
                value={formData.expiresAt}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                style={{ width: '100%', padding: '0.75rem', border: '2px solid #e0e0e0', borderRadius: '8px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Trạng thái</label>
              <select
                value={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                style={{ width: '100%', padding: '0.75rem', border: '2px solid #e0e0e0', borderRadius: '8px' }}
              >
                <option value="true">Hoạt động</option>
                <option value="false">Tạm dừng</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button
              onClick={handleSubmit}
              style={{
                flex: 1,
                padding: '1rem',
                background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {editingId ? '💾 Lưu thay đổi' : '➕ Thêm coupon'}
            </button>
            <button
              onClick={handleCancel}
              style={{
                padding: '1rem 2rem',
                background: 'white',
                color: '#7f8c8d',
                border: '2px solid #ddd',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              ❌ Hủy
            </button>
          </div>
        </div>
      )}

      {/* Coupons Grid */}
      {coupons.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '16px' }}>
          <div style={{ fontSize: '4rem' }}>🎫</div>
          <h2 style={{ color: '#2c3e50' }}>Chưa có coupon nào</h2>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {coupons.map((coupon) => (
            <div key={coupon._id} style={{
              background: 'white',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              border: coupon.isActive ? '2px solid #43e97b' : '2px solid #ddd',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                padding: '0.25rem 0.75rem',
                borderRadius: '20px',
                background: coupon.isActive ? '#43e97b20' : '#ddd',
                color: coupon.isActive ? '#27ae60' : '#7f8c8d',
                fontWeight: '600',
                fontSize: '0.85rem'
              }}>
                {coupon.isActive ? '✅ Hoạt động' : '⏸ Tạm dừng'}
              </div>

              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎫</div>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50', fontSize: '1.3rem' }}>
                {coupon.code}
              </h3>

              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#e74c3c', marginBottom: '1rem' }}>
                {coupon.discountType === 'PERCENTAGE'
                  ? `${coupon.discountValue}%`
                  : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(coupon.discountValue)}
              </div>

              <div style={{ color: '#7f8c8d', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                {coupon.minOrderValue > 0 && `Đơn tối thiểu: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(coupon.minOrderValue)}`}
              </div>

              <div style={{ color: '#7f8c8d', fontSize: '0.9rem', marginBottom: '1rem' }}>
                {coupon.expiresAt
                  ? `Hết hạn: ${new Date(coupon.expiresAt).toLocaleDateString('vi-VN')}`
                  : 'Không hết hạn'}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => handleEdit(coupon)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: '#43e97b20',
                    color: '#27ae60',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  ✏️ Sửa
                </button>
                <button
                  onClick={() => handleDelete(coupon._id)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: '#fee',
                    color: '#e74c3c',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  🗑️ Xóa
                </button>
              </div>
            </div>
          ))}
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

export default AdminCouponsPage;

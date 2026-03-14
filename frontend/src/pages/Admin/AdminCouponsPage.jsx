import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { couponService } from '../../services/couponService';
import CouponFormModal from '../../components/CouponFormModal';

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
        setSuccess('Cập nhật coupon thành công');
      } else {
        await couponService.createCoupon(payload);
        setSuccess('Tạo coupon thành công');
      }

      resetForm();
      setShowForm(false);
      await loadCoupons();
      setTimeout(() => setSuccess(''), 2500);
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
      setSuccess('Xóa coupon thành công');
      await loadCoupons();
      setTimeout(() => setSuccess(''), 2500);
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
        <p>Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
        }}
      >
        <h1>🎫 Quản Lý Coupon</h1>
        <button className="btn btn-secondary" onClick={() => navigate('/admin/dashboard')}>
          ← Quay Lại
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {!showForm && (
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
          style={{ marginBottom: '1rem' }}
        >
          + Thêm Coupon
        </button>
      )}

      <CouponFormModal
        isOpen={showForm}
        onClose={handleCancel}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        editingId={editingId}
      />

      {coupons.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Chưa có coupon nào</p>
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Loại</th>
                <th>Giá Trị</th>
                <th>ĐH Tối Thiểu</th>
                <th>Đã / Tối Đa</th>
                <th>Hết Hạn</th>
                <th>Trạng Thái</th>
                <th>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon._id}>
                  <td>{coupon.code}</td>
                  <td>{coupon.discountType === 'PERCENTAGE' ? 'Phần trăm' : 'Cố định'}</td>
                  <td>
                    {coupon.discountType === 'PERCENTAGE'
                      ? `${coupon.discountValue}%`
                      : new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                        }).format(coupon.discountValue)}
                  </td>
                  <td>
                    {coupon.minOrderValue
                      ? new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                        }).format(coupon.minOrderValue)
                      : '-'}
                  </td>
                  <td>
                    {coupon.usageLimit
                      ? `${coupon.usageCount}/${coupon.usageLimit}`
                      : `${coupon.usageCount}/∞`}
                  </td>
                  <td>
                    {coupon.expiresAt
                      ? new Date(coupon.expiresAt).toLocaleDateString('vi-VN')
                      : 'Không giới hạn'}
                  </td>
                  <td>{coupon.isActive ? 'Đang hoạt động' : 'Đã tắt'}</td>
                  <td>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleEdit(coupon)}
                      style={{ marginRight: '0.5rem' }}
                    >
                      Sửa
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(coupon._id)}
                    >
                      Xóa
                    </button>
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

export default AdminCouponsPage;


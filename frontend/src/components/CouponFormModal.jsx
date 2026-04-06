import React from 'react';
import Modal from './Modal';

const CouponFormModal = ({ isOpen, onClose, onSubmit, formData, setFormData, editingId }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Modal
      isOpen={isOpen}
      title={editingId ? '✏️ Cập Nhật Coupon' : '➕ Thêm Mới Coupon'}
      onClose={onClose}
      size="large"
    >
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Mã Coupon *</label>
          <input
            type="text"
            name="code"
            value={formData.code}
            onChange={handleChange}
            placeholder="VD: SAVE20, SUMMER50..."
            required
          />
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label>Loại Giảm Giá *</label>
            <select
              name="discountType"
              value={formData.discountType}
              onChange={handleChange}
              required
            >
              <option value="PERCENTAGE">Phần Trăm (%)</option>
              <option value="FIXED">Cố Định (₫)</option>
            </select>
          </div>
          <div className="form-group">
            <label>Giá Trị Giảm *</label>
            <input
              type="number"
              name="discountValue"
              value={formData.discountValue}
              onChange={handleChange}
              placeholder={formData.discountType === 'PERCENTAGE' ? '20' : '50000'}
              step="0.01"
              required
            />
          </div>
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label>Giá Trị Đơn Hàng Tối Thiểu (₫)</label>
            <input
              type="number"
              name="minOrderValue"
              value={formData.minOrderValue}
              onChange={handleChange}
              placeholder="0"
              step="1000"
            />
          </div>
          <div className="form-group">
            <label>Giảm Tối Đa (₫)</label>
            <input
              type="number"
              name="maxDiscount"
              value={formData.maxDiscount}
              onChange={handleChange}
              placeholder="Không giới hạn"
              step="1000"
            />
          </div>
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label>Số Lần Sử Dụng Tối Đa</label>
            <input
              type="number"
              name="usageLimit"
              value={formData.usageLimit}
              onChange={handleChange}
              placeholder="Không giới hạn"
              min="1"
            />
          </div>
          <div className="form-group">
            <label>Ngày Hết Hạn</label>
            <input
              type="date"
              name="expiresAt"
              value={formData.expiresAt}
              onChange={handleChange}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="checkbox"
            id="isActive"
            name="isActive"
            checked={formData.isActive}
            onChange={handleCheckChange}
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
          />
          <label htmlFor="isActive" style={{ margin: 0, cursor: 'pointer' }}>
            Kích Hoạt Coupon
          </label>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-cancel" onClick={onClose}>
            Hủy
          </button>
          <button type="submit" className="btn-submit">
            {editingId ? 'Cập Nhật' : 'Thêm Coupon'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CouponFormModal;

import React from 'react';
import Modal from './Modal';

const UserFormModal = ({ isOpen, onClose, onSubmit, formData, setFormData, editingId }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Modal
      isOpen={isOpen}
      title={editingId ? '✏️ Cập Nhật Người Dùng' : '➕ Thêm Mới Người Dùng'}
      onClose={onClose}
      size="large"
    >
      <form onSubmit={handleSubmit}>
        <div className="form-grid-2">
          <div className="form-group">
            <label>Họ và Tên *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nhập họ và tên"
              required
            />
          </div>
          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="email@example.com"
              required
              disabled={editingId ? true : false}
            />
          </div>
        </div>

        {!editingId && (
          <div className="form-group">
            <label>Mật Khẩu *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Nhập mật khẩu"
              required={!editingId}
            />
          </div>
        )}

        <div className="form-grid-2">
          <div className="form-group">
            <label>Số Điện Thoại</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone || ''}
              onChange={handleChange}
              placeholder="Số điện thoại"
            />
          </div>
          <div className="form-group">
            <label>Địa Chỉ</label>
            <input
              type="text"
              name="address"
              value={formData.address || ''}
              onChange={handleChange}
              placeholder="Địa chỉ nhà"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Vai Trò *</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
          >
            <option value="">-- Chọn vai trò --</option>
            <option value="user">Người Dùng</option>
            <option value="admin">Quản Trị Viên</option>
            <option value="staff">Nhân Viên</option>
          </select>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-cancel" onClick={onClose}>
            Hủy
          </button>
          <button type="submit" className="btn-submit">
            {editingId ? 'Cập Nhật' : 'Thêm Người Dùng'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default UserFormModal;

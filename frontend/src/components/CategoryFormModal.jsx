import React from 'react';
import Modal from './Modal';

const CategoryFormModal = ({ isOpen, onClose, onSubmit, formData, setFormData, editingId }) => {
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
      title={editingId ? '✏️ Cập Nhật Danh Mục' : '➕ Thêm Mới Danh Mục'}
      onClose={onClose}
      size="medium"
    >
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Tên Danh Mục *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ví dụ: Điện thoại, Laptop..."
            required
          />
        </div>

        <div className="form-group">
          <label>Mô Tả</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Nhập mô tả danh mục (tuỳ chọn)"
            style={{ minHeight: '80px' }}
          />
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-cancel" onClick={onClose}>
            Hủy
          </button>
          <button type="submit" className="btn-submit">
            {editingId ? 'Cập Nhật' : 'Thêm Danh Mục'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CategoryFormModal;

import React from 'react';
import Modal from './Modal';

const ProductFormModal = ({ isOpen, onClose, onSubmit, formData, setFormData, categories, editingId }) => {
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
      title={editingId ? '✏️ Cập Nhật Sản Phẩm' : '➕ Thêm Mới Sản Phẩm'}
      onClose={onClose}
      size="large"
    >
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Tên Sản Phẩm *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Nhập tên sản phẩm"
            required
          />
        </div>

        <div className="form-group">
          <label>Mô Tả *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Nhập mô tả sản phẩm"
            required
          />
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label>Giá (₫) *</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="0"
              step="1000"
              required
            />
          </div>
          <div className="form-group">
            <label>Tồn Kho</label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              placeholder="0"
              min="0"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Danh Mục *</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="">-- Chọn danh mục --</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Link Hình Ảnh</label>
          <input
            type="url"
            name="image"
            value={formData.image}
            onChange={handleChange}
            placeholder="https://via.placeholder.com/300x300"
          />
          {formData.image && (
            <div style={{ marginTop: '0.5rem', textAlign: 'center' }}>
              <img
                src={formData.image}
                alt="Preview"
                style={{ maxWidth: '150px', maxHeight: '150px', borderRadius: '6px' }}
              />
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-cancel" onClick={onClose}>
            Hủy
          </button>
          <button type="submit" className="btn-submit">
            {editingId ? 'Cập Nhật' : 'Thêm Sản Phẩm'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ProductFormModal;

import React, { useState, useRef, useEffect } from 'react';
import Modal from './Modal';
import productService from '../services/productService';

const ProductFormModal = ({ isOpen, onClose, onSubmit, formData, setFormData, categories, editingId, imagePreview: externalPreview, setImagePreview: setExternalPreview }) => {
  const [internalUploading, setInternalUploading] = useState(false);
  const [internalPreview, setInternalPreview] = useState('');
  const fileInputRef = useRef(null);

  // Use external preview if provided (from parent), otherwise use internal
  const imagePreview = externalPreview !== undefined ? externalPreview : internalPreview;
  const setImagePreview = setExternalPreview || setInternalPreview;
  const uploading = internalUploading;

  useEffect(() => {
    // Set initial preview when editing
    if (isOpen && formData.image && !imagePreview) {
      setImagePreview(formData.image);
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Kích thước ảnh không được vượt quá 5MB');
      return;
    }

    // Preview locally
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target.result);
    };
    reader.readAsDataURL(file);

    // Upload to server
    setInternalUploading(true);
    productService.uploadProductImage(file)
      .then(res => {
        setFormData(prev => ({ ...prev, image: res.data.data.url }));
      })
      .catch(() => {
        alert('Upload ảnh thất bại. Vui lòng thử lại.');
        setImagePreview('');
      })
      .finally(() => {
        setInternalUploading(false);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  const handleClose = () => {
    setImagePreview('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      title={editingId ? '✏️ Cập Nhật Sản Phẩm' : '➕ Thêm Mới Sản Phẩm'}
      onClose={handleClose}
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
          <label>Hình Ảnh Sản Phẩm</label>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {/* Image preview */}
            {(imagePreview || formData.image) && (
              <div style={{ position: 'relative' }}>
                <img
                  src={imagePreview || formData.image}
                  alt="Preview"
                  style={{
                    width: '100px',
                    height: '100px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    border: '2px solid #e0e0e0'
                  }}
                />
                {uploading && (
                  <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(255,255,255,0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '8px',
                    fontSize: '1.5rem'
                  }}>
                    ⏳
                  </div>
                )}
              </div>
            )}

            {/* Upload button */}
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/*"
                style={{ display: 'none' }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                style={{
                  padding: '0.6rem 1.2rem',
                  background: uploading ? '#ccc' : '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  fontSize: '0.9rem'
                }}
              >
                {uploading ? '⏳ Upload...' : '📷 Chọn Ảnh'}
              </button>

              {/* URL fallback */}
              <div style={{ marginTop: '0.5rem' }}>
                <input
                  type="text"
                  name="image"
                  value={formData.image}
                  onChange={(e) => {
                    handleChange(e);
                    setImagePreview('');
                  }}
                  placeholder="Hoặc dán URL ảnh..."
                  style={{
                    width: '200px',
                    padding: '0.5rem',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '0.85rem'
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-cancel" onClick={handleClose}>
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

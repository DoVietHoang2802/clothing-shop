import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import categoryService from '../../services/categoryService';

const AdminCategoriesPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await categoryService.getAllCategories();
      setCategories(res.data.data);
      setError('');
    } catch (err) {
      setError('Không thể tải danh mục');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      setError('Vui lòng điền tên danh mục');
      return;
    }

    try {
      if (editingId) {
        await categoryService.updateCategory(editingId, formData);
        setSuccess('✅ Cập nhật danh mục thành công!');
      } else {
        await categoryService.createCategory(formData);
        setSuccess('✅ Tạo danh mục thành công!');
      }
      setFormData({ name: '', description: '' });
      setEditingId(null);
      setShowForm(false);
      loadCategories();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi lưu danh mục');
    }
  };

  const handleEdit = (category) => {
    setFormData({ name: category.name, description: category.description });
    setEditingId(category._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa danh mục này?')) return;

    try {
      await categoryService.deleteCategory(id);
      setSuccess('✅ Xóa danh mục thành công!');
      loadCategories();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Không thể xóa danh mục');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormData({ name: '', description: '' });
    setEditingId(null);
  };

  if (loading) {
    return (
      <div className="container flex-center" style={{ minHeight: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid #f0f0f0',
            borderTop: '4px solid #f093fb',
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
        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        borderRadius: '16px',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: '700' }}>📂 Quản Lý Danh Mục</h1>
          <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9 }}>{categories.length} danh mục</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={() => navigate('/admin/dashboard')}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'white',
              color: '#f5576c',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            ← Quay Lại
          </button>
        </div>
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
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer',
            marginBottom: '1.5rem',
            fontSize: '1rem'
          }}
        >
          ➕ Thêm Danh Mục Mới
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
            {editingId ? '✏️ Chỉnh sửa danh mục' : '➕ Thêm danh mục mới'}
          </h3>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#34495e' }}>
              📝 Tên danh mục
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nhập tên danh mục..."
              style={{
                width: '100%',
                padding: '1rem',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '1rem'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#34495e' }}>
              📄 Mô tả
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Nhập mô tả..."
              rows={3}
              style={{
                width: '100%',
                padding: '1rem',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '1rem',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={handleSubmit}
              style={{
                flex: 1,
                padding: '1rem',
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {editingId ? '💾 Lưu thay đổi' : '➕ Thêm danh mục'}
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

      {/* Categories Grid */}
      {categories.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📂</div>
          <h2 style={{ color: '#2c3e50' }}>Chưa có danh mục nào</h2>
          <p style={{ color: '#7f8c8d' }}>Hãy thêm danh mục đầu tiên!</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1.5rem'
        }}>
          {categories.map((category, index) => (
            <div key={category._id} style={{
              background: 'white',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
            }}
            >
              {/* Index badge */}
              <div style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '600',
                fontSize: '0.9rem'
              }}>
                {index + 1}
              </div>

              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #f093fb20 0%, #f5576c20 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                marginBottom: '1rem'
              }}>
                📂
              </div>

              <h3 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50', fontSize: '1.1rem' }}>
                {category.name}
              </h3>

              <p style={{ margin: '0 0 1rem 0', color: '#7f8c8d', fontSize: '0.9rem', minHeight: '40px' }}>
                {category.description || 'Không có mô tả'}
              </p>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => handleEdit(category)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: '#f093fb20',
                    color: '#f5576c',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  ✏️ Sửa
                </button>
                <button
                  onClick={() => handleDelete(category._id)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: '#fee',
                    color: '#e74c3c',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
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

export default AdminCategoriesPage;

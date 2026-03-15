import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import productService from '../../services/productService';
import categoryService from '../../services/categoryService';
import ProductFormModal from '../../components/ProductFormModal';

const AdminProductsPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    image: '',
    category: '',
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        productService.getAllProducts({ limit: 100 }),
        categoryService.getAllCategories(),
      ]);
      setProducts(productsRes.data.data);
      setCategories(categoriesRes.data.data);
      setError('');
    } catch (err) {
      setError('Không thể tải dữ liệu');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.category || !formData.price) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    try {
      if (editingId) {
        await productService.updateProduct(editingId, formData);
        setSuccess('✅ Cập nhật sản phẩm thành công!');
      } else {
        await productService.createProduct(formData);
        setSuccess('✅ Tạo sản phẩm thành công!');
      }
      handleCancel();
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi lưu sản phẩm');
    }
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      stock: product.stock,
      image: product.image || '',
      category: product.category?._id || product.category,
    });
    setEditingId(product._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;

    try {
      await productService.deleteProduct(id);
      setSuccess('✅ Xóa sản phẩm thành công!');
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Không thể xóa sản phẩm');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      image: '',
      category: '',
    });
    setEditingId(null);
  };

  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container flex-center" style={{ minHeight: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid #f0f0f0',
            borderTop: '4px solid #4facfe',
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
        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        borderRadius: '16px',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: '700' }}>👕 Quản Lý Sản Phẩm</h1>
          <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9 }}>{products.length} sản phẩm</p>
        </div>
        <button
          onClick={() => navigate('/admin/dashboard')}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'white',
            color: '#4facfe',
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

      {/* Search & Add Button */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <input
          type="text"
          placeholder="🔍 Tìm kiếm sản phẩm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            padding: '1rem',
            border: '2px solid #e0e0e0',
            borderRadius: '8px',
            fontSize: '1rem'
          }}
        />
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            style={{
              padding: '1rem 2rem',
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            ➕ Thêm Sản Phẩm
          </button>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '2rem',
          marginBottom: '1.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        }}>
          <h3 style={{ margin: '0 0 1.5rem 0', color: '#2c3e50' }}>
            {editingId ? '✏️ Chỉnh sửa sản phẩm' : '➕ Thêm sản phẩm mới'}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Tên sản phẩm *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{ width: '100%', padding: '0.75rem', border: '2px solid #e0e0e0', borderRadius: '8px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Danh mục *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                style={{ width: '100%', padding: '0.75rem', border: '2px solid #e0e0e0', borderRadius: '8px' }}
              >
                <option value="">Chọn danh mục</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Giá (VND) *</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                style={{ width: '100%', padding: '0.75rem', border: '2px solid #e0e0e0', borderRadius: '8px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Số lượng tồn kho</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                style={{ width: '100%', padding: '0.75rem', border: '2px solid #e0e0e0', borderRadius: '8px' }}
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>URL Hình ảnh</label>
              <input
                type="text"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://..."
                style={{ width: '100%', padding: '0.75rem', border: '2px solid #e0e0e0', borderRadius: '8px' }}
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Mô tả</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                style={{ width: '100%', padding: '0.75rem', border: '2px solid #e0e0e0', borderRadius: '8px' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button
              onClick={handleSubmit}
              style={{
                flex: 1,
                padding: '1rem',
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {editingId ? '💾 Lưu thay đổi' : '➕ Thêm sản phẩm'}
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

      {/* Products Table */}
      {filteredProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '16px' }}>
          <div style={{ fontSize: '4rem' }}>👕</div>
          <h2 style={{ color: '#2c3e50' }}>Không tìm thấy sản phẩm</h2>
        </div>
      ) : (
        <div style={{
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#7f8c8d' }}>Sản phẩm</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#7f8c8d' }}>Danh mục</th>
                <th style={{ padding: '1rem', textAlign: 'right', color: '#7f8c8d' }}>Giá</th>
                <th style={{ padding: '1rem', textAlign: 'center', color: '#7f8c8d' }}>Tồn kho</th>
                <th style={{ padding: '1rem', textAlign: 'center', color: '#7f8c8d' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <img
                        src={product.image || 'https://via.placeholder.com/50'}
                        alt={product.name}
                        style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }}
                      />
                      <span style={{ fontWeight: '500', color: '#2c3e50' }}>{product.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem', color: '#7f8c8d' }}>{product.category?.name}</td>
                  <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: '#e74c3c' }}>
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '20px',
                      background: product.stock > 10 ? '#27ae6020' : product.stock > 0 ? '#f39c1220' : '#e74c3c20',
                      color: product.stock > 10 ? '#27ae60' : product.stock > 0 ? '#f39c12' : '#e74c3c',
                      fontWeight: '600'
                    }}>
                      {product.stock}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <button
                      onClick={() => handleEdit(product)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: '#4facfe20',
                        color: '#4facfe',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        marginRight: '0.5rem'
                      }}
                    >
                      ✏️ Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: '#fee',
                        color: '#e74c3c',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

export default AdminProductsPage;

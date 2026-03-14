import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import productService from '../../services/productService';
import categoryService from '../../services/categoryService';
import ProductFormModal from '../../components/ProductFormModal';
import Modal from '../../components/Modal';

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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        productService.getAllProducts(),
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.category || !formData.price) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    try {
      const data = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock) || 0,
      };

      if (editingId) {
        await productService.updateProduct(editingId, data);
        setSuccess('Cập nhật sản phẩm thành công');
      } else {
        await productService.createProduct(data);
        setSuccess('Tạo sản phẩm thành công');
      }

      setFormData({
        name: '',
        description: '',
        price: '',
        stock: '',
        image: '',
        category: '',
      });
      setEditingId(null);
      setShowForm(false);
      loadData();
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi lưu sản phẩm');
    }
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      image: product.image,
      category: product.category._id,
    });
    setEditingId(product._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;

    try {
      await productService.deleteProduct(id);
      setSuccess('Xóa sản phẩm thành công');
      loadData();
      setTimeout(() => setSuccess(''), 2000);
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

  if (loading) {
    return (
      <div className="container flex-center" style={{ minHeight: '400px' }}>
        <p>Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>👕 Quản Lý Sản Phẩm</h1>
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
          + Thêm Sản Phẩm
        </button>
      )}

      <ProductFormModal
        isOpen={showForm}
        onClose={handleCancel}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        categories={categories}
        editingId={editingId}
      />

      {products.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Không có sản phẩm nào</p>
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Tên</th>
                <th>Danh Mục</th>
                <th>Giá</th>
                <th>Tồn Kho</th>
                <th>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td>{product.name}</td>
                  <td>{product.category?.name}</td>
                  <td>
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(product.price)}
                  </td>
                  <td>{product.stock}</td>
                  <td>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleEdit(product)}
                      style={{ marginRight: '0.5rem' }}
                    >
                      Sửa
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(product._id)}
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

export default AdminProductsPage;

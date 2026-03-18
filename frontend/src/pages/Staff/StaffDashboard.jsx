import React, { useState, useEffect } from 'react';
import { Link, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import orderService from '../../services/orderService';
import categoryService from '../../services/categoryService';
import productService from '../../services/productService';
import { useAuth } from '../../context/AuthContext';

const StaffDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('products');

  // Products state
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    images: [''],
  });

  // Orders state
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    loadCategories();
    loadProducts();
    loadOrders();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await categoryService.getAllCategories();
      setCategories(res.data.data);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await productService.getAllProducts();
      setProducts(res.data.data);
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      setOrdersLoading(true);
      const res = await orderService.getAllOrders();
      setOrders(res.data.data);
    } catch (err) {
      console.error('Error loading orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        ...productForm,
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock),
        images: productForm.images.filter(img => img.trim() !== ''),
      };

      if (editingProduct) {
        await productService.updateProduct(editingProduct._id, productData);
      } else {
        await productService.createProduct(productData);
      }

      setShowModal(false);
      setEditingProduct(null);
      setProductForm({ name: '', description: '', price: '', stock: '', category: '', images: [''] });
      loadProducts();
    } catch (err) {
      console.error('Error saving product:', err);
      alert(err.response?.data?.message || 'Lỗi khi lưu sản phẩm');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa sản phẩm này?')) return;
    try {
      await productService.deleteProduct(id);
      loadProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
      alert(err.response?.data?.message || 'Lỗi khi xóa sản phẩm');
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    if (!window.confirm(`Cập nhật trạng thái đơn hàng thành "${newStatus}"?`)) return;
    try {
      setUpdatingId(orderId);
      await orderService.updateOrderStatus(orderId, newStatus);
      loadOrders();
    } catch (err) {
      console.error('Error updating order:', err);
      alert(err.response?.data?.message || 'Lỗi khi cập nhật trạng thái');
    } finally {
      setUpdatingId(null);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: { label: '⏳ Chờ xác nhận', color: '#f39c12', bg: '#f39c1220' },
      CONFIRMED: { label: '✅ Đã xác nhận', color: '#3498db', bg: '#3498db20' },
      SHIPPED: { label: '📦 Đã giao ĐVVC', color: '#9b59b6', bg: '#9b59b620' },
      DELIVERING: { label: '🚚 Đang giao', color: '#e67e22', bg: '#e67e2220' },
      ARRIVED: { label: '🏪 Đã đến nơi', color: '#e74c3c', bg: '#e74c3c20' },
      PAID_TO_SHIPPER: { label: '💵 Đã thanh toán', color: '#27ae60', bg: '#27ae6020' },
      COMPLETED: { label: '🎉 Hoàn tất', color: '#27ae60', bg: '#27ae6020' },
      CANCELLED: { label: '❌ Hủy', color: '#e74c3c', bg: '#e74c3c20' },
    };
    const config = statusMap[status] || { label: status, color: '#666', bg: '#eee' };
    return <span style={{ background: config.bg, color: config.color, padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '600' }}>{config.label}</span>;
  };

  const filteredOrders = filterStatus === 'ALL' ? orders : orders.filter(o => o.status === filterStatus);

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem', padding: '2rem', background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', borderRadius: '16px', color: 'white' }}>
        <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: '700' }}>📊 Dashboard Nhân Viên</h1>
        <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9 }}>Chào mừng {user?.name}! Quản lý sản phẩm và đơn hàng</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button
          onClick={() => setActiveTab('products')}
          style={{
            padding: '1rem 2rem',
            background: activeTab === 'products' ? '#667eea' : 'white',
            color: activeTab === 'products' ? 'white' : '#333',
            border: '2px solid #667eea',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '1rem',
          }}
        >
          📦 Quản lý sản phẩm
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          style={{
            padding: '1rem 2rem',
            background: activeTab === 'orders' ? '#667eea' : 'white',
            color: activeTab === 'orders' ? 'white' : '#333',
            border: '2px solid #667eea',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '1rem',
          }}
        >
          📋 Quản lý đơn hàng
        </button>
      </div>

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0, color: '#2c3e50' }}>Danh sách sản phẩm</h2>
            <button
              onClick={() => { setEditingProduct(null); setProductForm({ name: '', description: '', price: '', stock: '', category: '', images: [''] }); setShowModal(true); }}
              style={{ padding: '0.75rem 1.5rem', background: '#667eea', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
            >
              + Thêm sản phẩm
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>Đang tải...</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
              {products.map((product) => (
                <div key={product._id} style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                  <img src={product.images?.[0] || 'https://via.placeholder.com/300'} alt={product.name} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                  <div style={{ padding: '1rem' }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: '700', color: '#e74c3c', fontSize: '1.1rem' }}>{formatCurrency(product.price)}</span>
                      <span style={{ color: product.stock > 0 ? '#27ae60' : '#e74c3c', fontSize: '0.85rem' }}>Kho: {product.stock}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => { setEditingProduct(product); setProductForm({ name: product.name, description: product.description || '', price: product.price.toString(), stock: product.stock.toString(), category: product.category?._id || product.category || '', images: product.images || [''] }); setShowModal(true); }}
                        style={{ flex: 1, padding: '0.5rem', background: '#3498db', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product._id)}
                        style={{ flex: 1, padding: '0.5rem', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0, color: '#2c3e50' }}>Danh sách đơn hàng</h2>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '2px solid #ddd', fontWeight: '600' }}
            >
              <option value="ALL">Tất cả</option>
              <option value="PENDING">Chờ xác nhận</option>
              <option value="CONFIRMED">Đã xác nhận</option>
              <option value="SHIPPED">Đã giao ĐVVC</option>
              <option value="DELIVERING">Đang giao</option>
              <option value="ARRIVED">Đã đến nơi</option>
              <option value="PAID_TO_SHIPPER">Đã thanh toán</option>
              <option value="COMPLETED">Hoàn tất</option>
              <option value="CANCELLED">Hủy</option>
            </select>
          </div>

          {ordersLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>Đang tải...</div>
          ) : filteredOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>Không có đơn hàng nào</div>
          ) : (
            <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #eee' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', color: '#7f8c8d' }}>Mã đơn</th>
                    <th style={{ padding: '1rem', textAlign: 'left', color: '#7f8c8d' }}>Khách hàng</th>
                    <th style={{ padding: '1rem', textAlign: 'left', color: '#7f8c8d' }}>Sản phẩm</th>
                    <th style={{ padding: '1rem', textAlign: 'left', color: '#7f8c8d' }}>Tổng tiền</th>
                    <th style={{ padding: '1rem', textAlign: 'left', color: '#7f8c8d' }}>Trạng thái</th>
                    <th style={{ padding: '1rem', textAlign: 'left', color: '#7f8c8d' }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order._id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{order.orderCode || order._id.slice(-8).toUpperCase()}</div>
                        <div style={{ fontSize: '0.75rem', color: '#999' }}>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: '600' }}>{order.user?.name || 'N/A'}</div>
                        <div style={{ fontSize: '0.85rem', color: '#666' }}>{order.shippingAddress?.phone}</div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontSize: '0.9rem' }}>{order.items?.length} sản phẩm</div>
                      </td>
                      <td style={{ padding: '1rem', fontWeight: '700', color: '#e74c3c' }}>{formatCurrency(order.finalPrice || order.totalPrice)}</td>
                      <td style={{ padding: '1rem' }}>{getStatusBadge(order.status)}</td>
                      <td style={{ padding: '1rem' }}>
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          disabled={updatingId === order._id || order.status === 'COMPLETED' || order.status === 'CANCELLED'}
                          style={{
                            padding: '0.5rem',
                            borderRadius: '6px',
                            border: '2px solid #ddd',
                            fontWeight: '600',
                            cursor: updatingId === order._id || order.status === 'COMPLETED' || order.status === 'CANCELLED' ? 'not-allowed' : 'pointer',
                            opacity: order.status === 'COMPLETED' || order.status === 'CANCELLED' ? 0.6 : 1,
                          }}
                        >
                          <option value="PENDING">⏳ Chờ Xác Nhận</option>
                          <option value="CONFIRMED">✅ Đã Xác Nhận</option>
                          <option value="SHIPPED">📦 Đã Giao ĐVVC</option>
                          <option value="DELIVERING">🚚 Đang Giao</option>
                          <option value="ARRIVED">🏪 Đã Đến Nơi</option>
                          <option value="PAID_TO_SHIPPER">💵 Đã TT Shipper</option>
                          <option value="COMPLETED">🎉 Hoàn Tất</option>
                          <option value="CANCELLED">❌ Hủy</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ margin: '0 0 1.5rem 0' }}>{editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</h2>
            <form onSubmit={handleSaveProduct}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Tên sản phẩm</label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.75rem', border: '2px solid #ddd', borderRadius: '8px' }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Mô tả</label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  rows="3"
                  style={{ width: '100%', padding: '0.75rem', border: '2px solid #ddd', borderRadius: '8px' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Giá (VNĐ)</label>
                  <input
                    type="number"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.75rem', border: '2px solid #ddd', borderRadius: '8px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Số lượng</label>
                  <input
                    type="number"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.75rem', border: '2px solid #ddd', borderRadius: '8px' }}
                  />
                </div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Danh mục</label>
                <select
                  value={productForm.category}
                  onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.75rem', border: '2px solid #ddd', borderRadius: '8px' }}
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Link ảnh</label>
                <input
                  type="text"
                  value={productForm.images[0]}
                  onChange={(e) => setProductForm({ ...productForm, images: [e.target.value] })}
                  placeholder="https://..."
                  style={{ width: '100%', padding: '0.75rem', border: '2px solid #ddd', borderRadius: '8px' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '1rem', background: '#eee', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Hủy</button>
                <button type="submit" style={{ flex: 1, padding: '1rem', background: '#667eea', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;

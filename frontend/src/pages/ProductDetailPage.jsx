import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import productService from '../services/productService';
import { useAuth } from '../context/AuthContext';
import ReviewForm from '../components/ReviewForm';
import ReviewSection from '../components/ReviewSection';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [refreshReviews, setRefreshReviews] = useState(0);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const res = await productService.getProductById(id);
      setProduct(res.data.data);
      setError('');
    } catch (err) {
      setError('Không thể tải sản phẩm');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Lấy giỏ hàng từ localStorage
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');

    // Kiểm tra sản phẩm đã có trong giỏ
    const existingItem = cart.find((item) => item.productId === product._id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity,
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    setSuccess('Đã thêm vào giỏ hàng!');
    window.dispatchEvent(new Event('cartUpdated'));
    setTimeout(() => setSuccess(''), 2000);
  };

  if (loading) {
    return (
      <div className="container flex-center" style={{ minHeight: '400px' }}>
        <p>Đang tải...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container">
        <div className="alert alert-error">{error || 'Sản phẩm không tìm thấy'}</div>
      </div>
    );
  }

  return (
    <div className="container">
      <button className="btn btn-secondary" onClick={() => navigate(-1)}>
        ← Quay Lại
      </button>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
        <div>
          <img
            src={product.image}
            alt={product.name}
            style={{ width: '100%', borderRadius: '4px' }}
          />
        </div>

        <div>
          <h1>{product.name}</h1>
          <p style={{ fontSize: '1.2rem', margin: '1rem 0' }}>
            Danh Mục: <strong>{product.category?.name}</strong>
          </p>

          <h2 style={{ color: '#e74c3c', fontSize: '2rem', margin: '1rem 0' }}>
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
            }).format(product.price)}
          </h2>

          <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
            <strong>Tình Trạng:</strong> {product.stock > 0 ? `✅ Còn ${product.stock} sản phẩm` : '❌ Hết hàng'}
          </p>

          <div style={{ marginBottom: '2rem' }}>
            <h3>Mô Tả</h3>
            <p>{product.description}</p>
          </div>

          {product.stock > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ marginRight: '1rem' }}>
                Số Lượng:
                <input
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  style={{ width: '80px', padding: '0.5rem', marginLeft: '0.5rem' }}
                />
              </label>
            </div>
          )}

          <button
            className={`btn ${product.stock > 0 ? 'btn-primary' : 'btn-secondary'}`}
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}
          >
            {product.stock > 0 ? '🛒 Thêm Vào Giỏ Hàng' : 'Hết Hàng'}
          </button>
        </div>
      </div>

      {/* Reviews Section */}
      <ReviewSection productId={id} refreshTrigger={refreshReviews} />

      {/* Review Form - Only for logged in users */}
      {isAuthenticated && (
        <ReviewForm 
          productId={id} 
          onReviewSubmitted={() => setRefreshReviews(prev => prev + 1)} 
        />
      )}

      {/* Prompt to login if not authenticated */}
      {!isAuthenticated && (
        <div className="alert alert-info" style={{ textAlign: 'center', marginTop: '2rem' }}>
          📝 Vui lòng <a href="/login" style={{ color: '#ff6b35', fontWeight: 'bold' }}>đăng nhập</a> để chia sẻ đánh giá của bạn
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;

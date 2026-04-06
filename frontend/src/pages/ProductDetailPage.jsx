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
  const [selectedImage, setSelectedImage] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    loadProduct();
  }, [id]);

  // Reset khi đổi sản phẩm
  useEffect(() => {
    setQuantity(1);
    setSelectedImage(0);
    setActiveTab('description');
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

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
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
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleQuantityChange = (delta) => {
    setQuantity((prev) => Math.max(1, Math.min(product?.stock || 1, prev + delta)));
  };

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px', height: '48px',
            border: '4px solid #e0e0e0',
            borderTop: '4px solid #4facfe',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: '#999', fontSize: '0.95rem' }}>Đang tải sản phẩm...</p>
        </div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>😕</div>
        <h2 style={{ color: '#333', marginBottom: '0.5rem' }}>{error || 'Sản phẩm không tìm thấy'}</h2>
        <p style={{ color: '#999', marginBottom: '2rem' }}>Có thể sản phẩm này đã bị xóa hoặc không tồn tại.</p>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '0.75rem 2rem',
            background: '#4facfe',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          ← Quay về trang chủ
        </button>
      </div>
    );
  }

  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div style={{ background: '#f5f6fa', minHeight: '100vh', padding: '2rem 0' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: '#999', fontSize: '0.875rem' }}>
          <button
            onClick={() => navigate(-1)}
            style={{ background: 'none', border: 'none', color: '#4facfe', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '600', padding: 0 }}
          >
            Trang chủ
          </button>
          <span>/</span>
          <span>{product.category?.name || 'Sản phẩm'}</span>
          <span>/</span>
          <span style={{ color: '#333' }}>{product.name}</span>
        </div>

        {/* Toast notification */}
        {success && (
          <div style={{
            position: 'fixed', top: '100px', right: '20px', zIndex: 1000,
            background: '#27ae60', color: 'white', padding: '1rem 1.5rem',
            borderRadius: '12px', fontWeight: '600',
            boxShadow: '0 4px 15px rgba(39,174,96,0.3)',
            animation: 'slideIn 0.3s ease'
          }}>
            {success}
          </div>
        )}

        {/* Main Card */}
        <div style={{
          background: 'white', borderRadius: '20px', padding: '2.5rem',
          boxShadow: '0 2px 20px rgba(0,0,0,0.06)', marginBottom: '2rem'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
            {/* ===== LEFT: Images ===== */}
            <div>
              {/* Main image */}
              <div style={{
                position: 'relative', borderRadius: '16px', overflow: 'hidden',
                background: '#f0f0f0', cursor: 'zoom-in', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
              onClick={() => setZoomed(!zoomed)}>
                <img
                  src={product.image || 'https://via.placeholder.com/500?text=No+Image'}
                  alt={product.name}
                  style={{
                    width: '100%', height: '100%', objectFit: 'cover',
                    maxHeight: '500px', transition: 'transform 0.3s ease'
                  }}
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/500?text=No+Image'; }}
                />

                {/* Out of stock overlay */}
                {isOutOfStock && (
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <span style={{
                      background: '#e74c3c', color: 'white', padding: '0.75rem 2rem',
                      borderRadius: '12px', fontWeight: '700', fontSize: '1.2rem', letterSpacing: '1px'
                    }}>
                      HẾT HÀNG
                    </span>
                  </div>
                )}

                {/* Zoom hint */}
                {!isOutOfStock && (
                  <div style={{
                    position: 'absolute', bottom: '1rem', right: '1rem',
                    background: 'rgba(0,0,0,0.6)', color: 'white',
                    padding: '0.4rem 0.8rem', borderRadius: '8px',
                    fontSize: '0.75rem', opacity: '0.7'
                  }}>
                    🔍 Click để phóng to
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {product.images?.length > 1 && (
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                  {product.images.map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      style={{
                        width: '72px', height: '72px', borderRadius: '10px', overflow: 'hidden',
                        border: `3px solid ${selectedImage === idx ? '#4facfe' : 'transparent'}`,
                        cursor: 'pointer', opacity: selectedImage === idx ? 1 : 0.6,
                        transition: 'all 0.2s'
                      }}
                    >
                      <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ===== RIGHT: Info ===== */}
            <div>
              {/* Category badge */}
              <div style={{ marginBottom: '1rem' }}>
                <span style={{
                  background: '#eef6ff', color: '#4facfe',
                  padding: '0.35rem 1rem', borderRadius: '20px',
                  fontSize: '0.8rem', fontWeight: '600'
                }}>
                  {product.category?.name || 'Chưa phân loại'}
                </span>
              </div>

              {/* Product name */}
              <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#1a1a2e', margin: '0 0 1rem 0', lineHeight: '1.3' }}>
                {product.name}
              </h1>

              {/* Rating star placeholder */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} style={{ color: '#f1c40f', fontSize: '1.1rem' }}>★</span>
                  ))}
                </div>
                <span style={{ color: '#999', fontSize: '0.875rem' }}>({product.reviewCount || 0} đánh giá)</span>
              </div>

              {/* Price */}
              <div style={{
                background: '#fff9f0', borderRadius: '16px', padding: '1.5rem',
                marginBottom: '1.5rem', border: '1px solid #ffe8cc'
              }}>
                <div style={{ color: '#999', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Giá bán</div>
                <div style={{ color: '#e74c3c', fontSize: '2.2rem', fontWeight: '800', lineHeight: '1' }}>
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                </div>
                {product.priceBefore && (
                  <div style={{ color: '#999', fontSize: '0.875rem', textDecoration: 'line-through', marginTop: '0.25rem' }}>
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.priceBefore)}
                  </div>
                )}
              </div>

              {/* Stock status */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', padding: '1rem', borderRadius: '12px', background: isOutOfStock ? '#fee' : isLowStock ? '#fff3cd' : '#eafaf1' }}>
                <span style={{ fontSize: '1.4rem' }}>
                  {isOutOfStock ? '🔴' : isLowStock ? '🟡' : '🟢'}
                </span>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.95rem', color: isOutOfStock ? '#c0392b' : isLowStock ? '#d68910' : '#27ae60' }}>
                    {isOutOfStock ? 'Hết hàng' : isLowStock ? `Sắp hết hàng — chỉ còn ${product.stock} sản phẩm` : 'Còn hàng'}
                  </div>
                  <div style={{ color: '#999', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                    {isOutOfStock ? 'Hiện không có sản phẩm này' : `${product.stock} sản phẩm có sẵn`}
                  </div>
                </div>
              </div>

              {/* Quantity + Add to Cart */}
              {!isOutOfStock && (
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap' }}>
                  {/* Quantity selector */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 0, borderRadius: '12px', overflow: 'hidden', border: '2px solid #e0e0e0' }}>
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      style={{
                        width: '44px', height: '44px', background: '#f8f9fa', border: 'none',
                        fontSize: '1.2rem', cursor: 'pointer', fontWeight: '700'
                      }}
                    >−</button>
                    <input
                      type="number"
                      value={quantity}
                      min="1"
                      max={product.stock}
                      onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                      style={{
                        width: '60px', height: '44px', textAlign: 'center',
                        border: 'none', fontSize: '1rem', fontWeight: '600'
                      }}
                    />
                    <button
                      onClick={() => handleQuantityChange(1)}
                      style={{
                        width: '44px', height: '44px', background: '#f8f9fa', border: 'none',
                        fontSize: '1.2rem', cursor: 'pointer', fontWeight: '700'
                      }}
                    >+</button>
                  </div>

                  {/* Add to cart button */}
                  <button
                    onClick={handleAddToCart}
                    style={{
                      flex: 1, padding: '0 2rem', height: '48px',
                      background: 'linear-gradient(135deg, #ff6b35, #ff8e53)',
                      color: 'white', border: 'none', borderRadius: '12px',
                      fontWeight: '700', fontSize: '1rem', cursor: 'pointer',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      minWidth: '200px'
                    }}
                    onMouseOver={(e) => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 6px 20px rgba(255,107,53,0.4)'; }}
                    onMouseOut={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = 'none'; }}
                  >
                    🛒 Thêm Vào Giỏ Hàng
                  </button>

                  {/* Wishlist */}
                  <button
                    onClick={() => {}}
                    title="Yêu thích"
                    style={{
                      width: '48px', height: '48px', borderRadius: '12px',
                      background: 'white', border: '2px solid #e0e0e0',
                      fontSize: '1.2rem', cursor: 'pointer'
                    }}
                  >
                    🤍
                  </button>
                </div>
              )}

              {isOutOfStock && (
                <button
                  disabled
                  style={{
                    width: '100%', padding: '1rem', height: '48px',
                    background: '#ddd', color: '#888',
                    border: 'none', borderRadius: '12px',
                    fontWeight: '700', fontSize: '1rem',
                    marginBottom: '2rem'
                  }}
                >
                  Sản phẩm hiện hết hàng
                </button>
              )}

              {/* Quick info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1.25rem', background: '#f8f9fa', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.1rem' }}>🚚</span>
                  <span style={{ fontSize: '0.875rem', color: '#555' }}>Miễn phí vận chuyển cho đơn từ 500K</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.1rem' }}>↩️</span>
                  <span style={{ fontSize: '0.875rem', color: '#555' }}>Đổi trả trong 7 ngày</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.1rem' }}>✅</span>
                  <span style={{ fontSize: '0.875rem', color: '#555' }}>Cam kết chính hãng 100%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tab: Description & Reviews */}
          <div style={{ marginTop: '2.5rem', borderTop: '1px solid #eee', paddingTop: '2rem' }}>
            {/* Tab header */}
            <div style={{ display: 'flex', gap: 0, marginBottom: '1.5rem', borderBottom: '2px solid #eee' }}>
              {['description', 'info'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'none', border: 'none',
                    borderBottom: `3px solid ${activeTab === tab ? '#4facfe' : 'transparent'}`,
                    color: activeTab === tab ? '#4facfe' : '#999',
                    fontWeight: '700', fontSize: '0.95rem',
                    cursor: 'pointer', marginBottom: '-2px',
                    transition: 'all 0.2s'
                  }}
                >
                  {tab === 'description' ? '📝 Mô Tả Sản Phẩm' : '📋 Thông Tin Chi Tiết'}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {activeTab === 'description' && (
              <div style={{ padding: '0 0.5rem' }}>
                <p style={{ fontSize: '1rem', color: '#555', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
                  {product.description || 'Chưa có mô tả cho sản phẩm này.'}
                </p>
              </div>
            )}

            {activeTab === 'info' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {[
                  ['Danh mục', product.category?.name || '—'],
                  ['Giá', new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)],
                  ['Tồn kho', product.stock + ' sản phẩm'],
                  ['Đã bán', product.soldCount || 0 + ' sản phẩm'],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.875rem 1rem', background: '#f8f9fa', borderRadius: '10px' }}>
                    <span style={{ color: '#999', fontSize: '0.9rem' }}>{label}</span>
                    <span style={{ color: '#333', fontWeight: '600', fontSize: '0.9rem' }}>{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div style={{
          background: 'white', borderRadius: '20px', padding: '2.5rem',
          boxShadow: '0 2px 20px rgba(0,0,0,0.06)'
        }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🌟 Đánh Giá Sản Phẩm
          </h2>
          <ReviewSection productId={id} refreshTrigger={refreshReviews} />

          {isAuthenticated ? (
            <div style={{ marginTop: '2rem' }}>
              <ReviewForm
                productId={id}
                onReviewSubmitted={() => setRefreshReviews((prev) => prev + 1)}
              />
            </div>
          ) : (
            <div style={{
              textAlign: 'center', padding: '2rem',
              background: '#f8f9fa', borderRadius: '12px', marginTop: '1.5rem',
              border: '2px dashed #ddd'
            }}>
              <p style={{ color: '#555', marginBottom: '1rem' }}>📝 Bạn đã mua sản phẩm này?</p>
              <button
                onClick={() => navigate('/login')}
                style={{
                  padding: '0.75rem 2rem', background: '#4facfe', color: 'white',
                  border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer'
                }}
              >
                Đăng nhập để đánh giá
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>
    </div>
  );
};

export default ProductDetailPage;

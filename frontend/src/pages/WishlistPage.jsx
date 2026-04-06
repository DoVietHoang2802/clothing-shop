import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import wishlistService from '../services/wishlistService';
import './WishlistPage.css';

export default function WishlistPage() {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadWishlist();
  }, [currentPage]);

  const loadWishlist = async () => {
    try {
      setLoading(true);
      const res = await wishlistService.getWishlist(currentPage, 12);
      setWishlist(res.data || []);
      setTotalPages(res.pagination?.totalPages || 1);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi tải wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    try {
      await wishlistService.removeFromWishlist(productId);
      setWishlist((prev) => prev.filter((item) => item.product._id !== productId));
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi xóa khỏi wishlist');
    }
  };

  const handleAddToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find((item) => item.productId === product._id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
    alert('✅ Đã thêm vào giỏ hàng!');
  };

  return (
    <div className="container">
      {/* Header */}
      <div style={{
        marginBottom: '2rem',
        padding: '2rem',
        background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
        borderRadius: '16px',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: '700' }}>
            ❤️ Danh sách yêu thích
          </h1>
          <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9 }}>
            {wishlist.length} sản phẩm trong wishlist của bạn
          </p>
        </div>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'white',
            color: '#e74c3c',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          ← Tiếp tục mua sắm
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

      {loading && (
        <div className="flex-center" style={{ minHeight: '400px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '60px',
              height: '60px',
              border: '4px solid #f0f0f0',
              borderTop: '4px solid #e74c3c',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem'
            }} />
            <p style={{ color: '#666' }}>Đang tải wishlist...</p>
          </div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}

      {!loading && wishlist.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        }}>
          <div style={{ fontSize: '5rem', marginBottom: '1rem', animation: 'pulse 2s infinite' }}>💔</div>
          <h2 style={{ color: '#2c3e50', marginBottom: '0.5rem' }}>Danh sách yêu thích trống</h2>
          <p style={{ color: '#7f8c8d', marginBottom: '1.5rem' }}>Bạn chưa thêm sản phẩm yêu thích nào.</p>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '1rem 2rem',
              background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            🛍️ Khám phá sản phẩm
          </button>
          <style>{`
            @keyframes pulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.1); }
            }
          `}</style>
        </div>
      )}

      {!loading && wishlist.length > 0 && (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1.5rem'
          }}>
            {wishlist.map((item) => (
              <div
                key={item._id}
                style={{
                  background: 'white',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                }}
              >
                {/* Remove Button */}
                <button
                  onClick={() => handleRemoveFromWishlist(item.product._id)}
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'rgba(0,0,0,0.5)',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    zIndex: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#e74c3c';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(0,0,0,0.5)';
                  }}
                >
                  ✕
                </button>

                {/* Image */}
                <div
                  style={{
                    width: '100%',
                    height: '180px',
                    overflow: 'hidden',
                    cursor: 'pointer'
                  }}
                  onClick={() => navigate(`/products/${item.product._id}`)}
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                  />
                </div>

                {/* Info */}
                <div style={{ padding: '1rem' }}>
                  <h3
                    style={{
                      margin: '0 0 0.5rem 0',
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: '#2c3e50',
                      cursor: 'pointer',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                    onClick={() => navigate(`/products/${item.product._id}`)}
                  >
                    {item.product.name}
                  </h3>

                  <p style={{ margin: '0 0 0.5rem 0', color: '#7f8c8d', fontSize: '0.85rem' }}>
                    📦 {item.product.category?.name || 'Không xác định'}
                  </p>

                  <p style={{
                    margin: '0 0 0.75rem 0',
                    color: '#e74c3c',
                    fontSize: '1.2rem',
                    fontWeight: '700'
                  }}>
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(item.product.price)}
                  </p>

                  <p style={{
                    margin: '0 0 1rem 0',
                    fontSize: '0.85rem',
                    color: item.product.stock > 0 ? '#27ae60' : '#e74c3c'
                  }}>
                    {item.product.stock > 0 ? `✅ Còn ${item.product.stock} sản phẩm` : '❌ Hết hàng'}
                  </p>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleAddToCart(item.product)}
                      disabled={item.product.stock === 0}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        background: item.product.stock === 0 ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: item.product.stock === 0 ? 'not-allowed' : 'pointer',
                        fontSize: '0.9rem',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      🛒 Thêm vào giỏ
                    </button>
                    <button
                      onClick={() => navigate(`/products/${item.product._id}`)}
                      style={{
                        padding: '0.75rem',
                        background: 'white',
                        color: '#667eea',
                        border: '2px solid #667eea',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      👁️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '1rem',
              marginTop: '2rem'
            }}>
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: currentPage === 1 ? '#f0f0f0' : 'white',
                  color: currentPage === 1 ? '#999' : '#667eea',
                  border: '2px solid #667eea',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                ← Trước
              </button>

              <span style={{ color: '#7f8c8d', fontWeight: '600' }}>
                Trang {currentPage} / {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: currentPage === totalPages ? '#f0f0f0' : 'white',
                  color: currentPage === totalPages ? '#999' : '#667eea',
                  border: '2px solid #667eea',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                Sau →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

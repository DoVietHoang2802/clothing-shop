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
    <div className="container wishlist-container">
      <div className="wishlist-header">
        <h1>❤️ Danh sách yêu thích</h1>
        <button className="btn btn-secondary" onClick={() => navigate('/')}>
          ← Tiếp tục mua sắm
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading && (
        <div className="flex-center" style={{ minHeight: '400px' }}>
          <p>⏳ Đang tải...</p>
        </div>
      )}

      {!loading && wishlist.length === 0 && (
        <div className="empty-wishlist">
          <div className="empty-icon">💔</div>
          <h2>Danh sách yêu thích trống</h2>
          <p>Bạn chưa thêm sản phẩm yêu thích nào.</p>
          <button 
            className="btn btn-primary" 
            onClick={() => navigate('/')}
            style={{ marginTop: '1rem' }}
          >
            🛍️ Khám phá sản phẩm
          </button>
        </div>
      )}

      {!loading && wishlist.length > 0 && (
        <>
          <div className="wishlist-grid">
            {wishlist.map((item) => (
              <div key={item._id} className="wishlist-item">
                <div className="item-image-container">
                  <img 
                    src={item.product.image} 
                    alt={item.product.name}
                    className="item-image"
                    onClick={() => navigate(`/products/${item.product._id}`)}
                    style={{ cursor: 'pointer' }}
                  />
                  <button
                    className="btn-remove-wishlist"
                    onClick={() => handleRemoveFromWishlist(item.product._id)}
                    title="Xóa khỏi danh sách yêu thích"
                  >
                    ✕
                  </button>
                </div>

                <div className="item-info">
                  <h3 
                    className="item-name"
                    onClick={() => navigate(`/products/${item.product._id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    {item.product.name}
                  </h3>

                  <p className="item-category">
                    📦 {item.product.category?.name || 'Không xác định'}
                  </p>

                  <p className="item-price">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(item.product.price)}
                  </p>

                  <p className={`item-stock ${item.product.stock > 0 ? 'in-stock' : 'out-stock'}`}>
                    {item.product.stock > 0 ? `✅ Còn ${item.product.stock}` : '❌ Hết hàng'}
                  </p>

                  <div className="item-actions">
                    <button
                      className="btn btn-primary"
                      onClick={() => handleAddToCart(item.product)}
                      disabled={item.product.stock === 0}
                    >
                      🛒 Thêm vào giỏ
                    </button>
                    <button
                      className="btn btn-outline"
                      onClick={() => navigate(`/products/${item.product._id}`)}
                    >
                      👁️ Xem chi tiết
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="wishlist-pagination">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="btn btn-pagination"
              >
                ← Trước
              </button>

              <span className="page-info">
                Trang {currentPage} / {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="btn btn-pagination"
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

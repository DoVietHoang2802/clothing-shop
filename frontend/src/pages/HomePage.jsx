import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import productService from '../services/productService';
import categoryService from '../services/categoryService';
import reviewService from '../services/reviewService';
import wishlistService from '../services/wishlistService';
import { useAuth } from '../context/AuthContext';
import Carousel from '../components/Carousel';
import FlashSaleTimer from '../components/FlashSaleTimer';

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [search, setSearch] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [latestReviews, setLatestReviews] = useState([]);
  const [wishlistItems, setWishlistItems] = useState(new Set());

  useEffect(() => {
    loadData();
    loadLatestReviews();
  }, [selectedCategory, search, minPrice, maxPrice, page]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        productService.getAllProducts({
          category: selectedCategory,
          search: search,
          minPrice: minPrice,
          maxPrice: maxPrice,
          page: page,
          limit: 12,
        }),
        categoryService.getAllCategories(),
      ]);

      setProducts(productsRes.data.data);
      setPagination(productsRes.data.pagination);
      setCategories(categoriesRes.data.data);
      setError('');
    } catch (err) {
      setError('Không thể tải dữ liệu');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadLatestReviews = async () => {
    try {
      // Lấy một danh sách sản phẩm giới hạn để hiển thị review mới nhất
      const allProductsRes = await productService.getAllProducts({ limit: 20 });
      const allProductsData = allProductsRes.data.data || [];
      const reviews = [];

      const topProducts = allProductsData.slice(0, 5);

      const reviewPromises = topProducts.map((p) =>
        reviewService
          .getProductReviews(p._id, 1, 5)
          .then((reviewsRes) => {
            const list = reviewsRes.data || [];
            list.forEach((r) =>
              reviews.push({
                ...r,
                productName: p.name,
              })
            );
          })
          .catch(() => {
            // Bỏ qua nếu lỗi ở 1 sản phẩm
          })
      );

      await Promise.all(reviewPromises);

      // Sort by newest and take top 3
      reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setLatestReviews(reviews.slice(0, 3));
    } catch (err) {
      console.error('Error loading reviews:', err);
    }
  };

  const loadWishlist = async () => {
    if (!isAuthenticated) return;
    try {
      const wishlistRes = await wishlistService.getWishlist(1, 100);
      const list = wishlistRes.data || [];
      const wishlistIds = new Set(list.map(item => item.product._id));
      setWishlistItems(wishlistIds);
    } catch (err) {
      console.error('Error loading wishlist:', err);
    }
  };

  const toggleWishlist = async (productId) => {
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để sử dụng wishlist');
      return;
    }

    try {
      if (wishlistItems.has(productId)) {
        await wishlistService.removeFromWishlist(productId);
        setWishlistItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
      } else {
        await wishlistService.addToWishlist(productId);
        setWishlistItems(prev => new Set([...prev, productId]));
      }
    } catch (err) {
      console.error('Error toggling wishlist:', err);
      alert(err.response?.data?.message || 'Lỗi khi cập nhật wishlist');
    }
  };

  useEffect(() => {
    loadWishlist();
  }, [isAuthenticated]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadData();
  };

  const handleReset = () => {
    setSearch('');
    setMinPrice('');
    setMaxPrice('');
    setSelectedCategory(null);
    setPage(1);
  };

  return (
    <div>
      {/* Carousel Banner */}
      <Carousel />

      <div className="container">
        {error && (
          <div className="alert alert-error">
            <strong>Lỗi:</strong> {error}
          </div>
        )}

        {/* Flash Sale Banner */}
        <div className="flash-sale-banner">
          <div className="flash-sale-content">
            <h3>🔥 FLASH SALE HÔM NAY</h3>
            <p style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Giảm giá đến 50% cho các sản phẩm điện tử được chọn! Tất cả thiết bị công nghệ hot nhất!</p>
            <FlashSaleTimer saleEndTime={new Date().getTime() + 24 * 60 * 60 * 1000} />
          </div>
          <button className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
            Xem Ngay →
          </button>
        </div>

        {/* Search & Filter Section */}
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          marginBottom: '2rem'
        }}>
          <h3 style={{ marginBottom: '1.5rem', color: '#2c3e50', fontSize: '1.2rem', fontWeight: '600' }}>
            🔍 Tìm Kiếm & Lọc Sản Phẩm
          </h3>
          
          <form onSubmit={handleSearch}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1.2rem',
              marginBottom: '1.5rem'
            }}>
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  padding: '0.9rem 1rem',
                  border: '2px solid #e0e0e0',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  transition: 'border-color 0.3s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3498db'}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
              />
              <input
                type="number"
                placeholder="Giá từ (₫)"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                style={{
                  padding: '0.9rem 1rem',
                  border: '2px solid #e0e0e0',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
              />
              <input
                type="number"
                placeholder="Giá đến (₫)"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                style={{
                  padding: '0.9rem 1rem',
                  border: '2px solid #e0e0e0',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
              />
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                🔎 Tìm Kiếm
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="btn btn-secondary"
                style={{ width: '100%' }}
              >
                ✕ Xóa Bộ Lọc
              </button>
            </div>
          </form>
        </div>

        {/* Categories Section */}
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          marginBottom: '2rem'
        }}>
          <h3 style={{
            marginBottom: '1.5rem',
            color: '#2c3e50',
            fontSize: '1.2rem',
            fontWeight: '600'
          }}>
            📂 Danh Mục Sản Phẩm
          </h3>
          
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <button
              onClick={() => {
                setSelectedCategory(null);
                setPage(1);
              }}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '20px',
                border: 'none',
                cursor: 'pointer',
                background: !selectedCategory 
                  ? 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)' 
                  : '#f0f0f0',
                color: !selectedCategory ? 'white' : '#333',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                boxShadow: !selectedCategory ? '0 4px 8px rgba(255, 107, 53, 0.3)' : 'none'
              }}
            >
              ✓ Tất Cả
            </button>
            
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => {
                  setSelectedCategory(cat._id);
                  setPage(1);
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '20px',
                  border: 'none',
                  cursor: 'pointer',
                  background: selectedCategory === cat._id
                    ? 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)'
                    : '#f0f0f0',
                  color: selectedCategory === cat._id ? 'white' : '#333',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  boxShadow: selectedCategory === cat._id ? '0 4px 8px rgba(255, 107, 53, 0.3)' : 'none'
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products Section */}
        {loading ? (
          <div className="flex-center" style={{
            minHeight: '500px',
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
          }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '1.2rem', color: '#666' }}>⏳ Đang tải sản phẩm...</p>
              <p style={{ fontSize: '0.9rem', color: '#999', marginTop: '0.5rem' }}>Vui lòng chờ</p>
            </div>
          </div>
        ) : (
          <>
            <h3 style={{
              marginBottom: '2rem',
              color: '#2c3e50',
              fontSize: '1.2rem',
              fontWeight: '600'
            }}>
              ✨ Điện Tử Hot ({pagination?.total || 0} sản phẩm)
            </h3>

            <div className="grid">
              {products.length > 0 ? (
                products.map((product) => (
                  <div key={product._id} style={{ position: 'relative' }}>
                    <Link to={`/products/${product._id}`} style={{ textDecoration: 'none' }}>
                      <div className="card product-card">
                        <div style={{ position: 'relative', overflow: 'hidden' }}>
                          <img
                            src={product.image}
                            alt={product.name}
                            className="product-image"
                            style={{ width: '100%', height: '280px', objectFit: 'cover', borderRadius: '8px' }}
                          />
                          {product.stock < 5 && (
                            <div style={{
                              position: 'absolute',
                              top: '10px',
                              right: '10px',
                              background: '#e74c3c',
                              color: 'white',
                              padding: '0.4rem 0.8rem',
                              borderRadius: '20px',
                              fontSize: '0.8rem',
                              fontWeight: '600'
                            }}>
                              🔥 Gần hết
                            </div>
                          )}
                        </div>
                        
                        <div style={{ padding: '1rem 0' }}>
                          <h3 className="product-name">{product.name}</h3>
                          
                          <p className="product-price">
                            {new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: 'VND',
                            }).format(product.price)}
                          </p>

                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '0.9rem',
                            color: '#7f8c8d'
                          }}>
                            <span>
                              📦 Kho: <strong style={{ color: product.stock > 0 ? '#27ae60' : '#e74c3c' }}>
                                {product.stock}
                              </strong>
                            </span>
                            <span style={{
                              background: '#ecf0f1',
                              padding: '0.3rem 0.8rem',
                              borderRadius: '12px',
                              fontSize: '0.85rem'
                            }}>
                              Xem chi tiết →
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                    
                    {/* Heart Button - Wishlist */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        toggleWishlist(product._id);
                      }}
                      style={{
                        position: 'absolute',
                        top: '10px',
                        left: '10px',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        border: 'none',
                        background: wishlistItems.has(product._id)
                          ? 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)'
                          : 'rgba(255, 255, 255, 0.9)',
                        color: wishlistItems.has(product._id) ? 'white' : '#e74c3c',
                        fontSize: '1.2rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        zIndex: 10
                      }}
                      title={wishlistItems.has(product._id) ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
                      onMouseEnter={(e) => {
                        if (!wishlistItems.has(product._id)) {
                          e.target.style.background = 'rgba(255, 255, 255, 1)';
                          e.target.style.transform = 'scale(1.1)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!wishlistItems.has(product._id)) {
                          e.target.style.background = 'rgba(255, 255, 255, 0.9)';
                          e.target.style.transform = 'scale(1)';
                        }
                      }}
                    >
                      {wishlistItems.has(product._id) ? '❤️' : '🤍'}
                    </button>
                  </div>
                ))
              ) : (
                <div style={{
                  gridColumn: '1/-1',
                  textAlign: 'center',
                  padding: '3rem',
                  color: '#7f8c8d'
                }}>
                  <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>😕 Không tìm thấy sản phẩm</p>
                  <p>Thử thay đổi bộ lọc hoặc tìm kiếm khác</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '0.75rem',
                marginTop: '3rem',
                flexWrap: 'wrap',
                padding: '2rem'
              }}>
                {page > 1 && (
                  <button
                    onClick={() => setPage(page - 1)}
                    className="btn btn-primary"
                  >
                    ← Trang Trước
                  </button>
                )}

                {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                  let pageNumber;
                  if (pagination.totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (page <= 3) {
                    pageNumber = i + 1;
                  } else if (page >= pagination.totalPages - 2) {
                    pageNumber = pagination.totalPages - 4 + i;
                  } else {
                    pageNumber = page - 2 + i;
                  }
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setPage(pageNumber)}
                      style={{
                        padding: '0.6rem 0.9rem',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer',
                        background: page === pageNumber
                          ? 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)'
                          : '#f0f0f0',
                        color: page === pageNumber ? 'white' : '#333',
                        fontWeight: page === pageNumber ? '700' : '500',
                        transition: 'all 0.3s ease',
                        boxShadow: page === pageNumber ? '0 4px 8px rgba(255, 107, 53, 0.3)' : 'none'
                      }}
                    >
                      {pageNumber}
                    </button>
                  );
                })}

                {page < pagination.totalPages && (
                  <button
                    onClick={() => setPage(page + 1)}
                    className="btn btn-primary"
                  >
                    Trang Sau →
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {/* Reviews Section */}
        <div className="reviews-section">
          <h3 className="section-title">⭐ Đánh Giá Từ Khách Hàng</h3>
          
          <div style={{ marginTop: '2rem' }}>
            {latestReviews.length > 0 ? (
              latestReviews.map((review) => (
                <div key={review._id} className="review-card">
                  <div className="review-header">
                    <div>
                      <span className="review-author">{review.user.name}</span>
                      <p style={{ fontSize: '0.8rem', color: '#7f8c8d', margin: '0.3rem 0 0 0' }}>
                        Sản phẩm: {review.productName || 'N/A'}
                      </p>
                    </div>
                    <span className="review-stars">
                      {'⭐'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)} {review.rating}/5
                    </span>
                  </div>
                  <p className="review-text">
                    "{review.comment}"
                  </p>
                  <p style={{ fontSize: '0.8rem', color: '#bdc3c7', margin: '0.5rem 0 0 0' }}>
                    {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              ))
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#7f8c8d' }}>
                <p>Chưa có đánh giá nào. Hãy là người đầu tiên chia sẻ!</p>
              </div>
            )}
          </div>
        </div>

        {/* Best Sellers Section */}
        {products.length > 0 && (
          <div style={{ marginBottom: '3rem' }}>
            <h3 className="section-title">🏆 Sản Phẩm Điện Tử Bán Chạy Nhất</h3>
            
            <div className="best-sellers-grid">
              {products.slice(0, 4).map((product) => (
                <Link key={product._id} to={`/products/${product._id}`} style={{ textDecoration: 'none' }}>
                  <div className="card product-card">
                    <div style={{ position: 'relative' }}>
                      <img
                        src={product.image}
                        alt={product.name}
                        className="product-image"
                        style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }}
                      />
                      <div className="product-badge badge-hot">🔥 Bán chạy</div>
                    </div>
                    <h4 style={{ marginTop: '0.75rem', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                      {product.name}
                    </h4>
                    <p style={{ color: '#ff6b35', fontWeight: '700', fontSize: '1.1rem' }}>
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      }).format(product.price)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Newsletter Section */}
        <div className="newsletter-section">
          <h3>📧 Nhận Ưu Đãi Công Nghệ Độc Quyền</h3>
          <p>Đăng ký để nhận những ưu đãi đặc biệt, mã giảm giá, review sản phẩm và tin tức công nghệ mới nhất!</p>
          
          <form
            className="newsletter-form"
            onSubmit={(e) => {
              e.preventDefault();
              // TODO: Implement newsletter signup
              alert('Cảm ơn bạn đã đăng ký! 🎉');
            }}
          >
            <input
              type="email"
              placeholder="Nhập email của bạn..."
              required
              style={{ fontSize: '1rem' }}
            />
            <button type="submit">Đăng Ký</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
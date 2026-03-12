import { useState, useEffect } from 'react';
import reviewService from '../services/reviewService';
import './ReviewSection.css';

export default function ReviewSection({ productId, refreshTrigger }) {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        
        // Fetch reviews
        const reviewsRes = await reviewService.getProductReviews(productId, currentPage, 5);
        setReviews(reviewsRes.data || []);
        setTotalPages(reviewsRes.pagination?.totalPages || 1);

        // Fetch average rating
        const ratingRes = await reviewService.getAverageRating(productId);
        setAverageRating(ratingRes.data || null);
      } catch (err) {
        setError(err.response?.data?.message || 'Lỗi khi tải đánh giá');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [productId, currentPage, refreshTrigger]);

  const renderStars = (rating) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <span key={i} className={i < rating ? 'star-filled' : 'star-empty'}>
          ⭐
        </span>
      ))
      .reduce((prev, curr) => [prev, ' ', curr]);
  };

  return (
    <div className="review-section-container">
      <h3 className="review-section-title">💬 Đánh giá sản phẩm</h3>

      {averageRating && (
        <div className="average-rating">
          <div className="rating-score">
            <span className="score-value">{averageRating.averageRating.toFixed(1)}</span>
            <span className="score-stars">{renderStars(Math.round(averageRating.averageRating))}</span>
            <span className="score-count">({averageRating.totalReviews} đánh giá)</span>
          </div>
        </div>
      )}

      {loading && <div className="loading">⏳ Đang tải đánh giá...</div>}

      {error && <div className="alert alert-error">{error}</div>}

      {!loading && reviews.length === 0 && (
        <div className="no-reviews">Chưa có đánh giá nào. Hãy là người đầu tiên!</div>
      )}

      {!loading && reviews.length > 0 && (
        <div className="reviews-list">
          {reviews.map((review) => (
            <div key={review._id} className="review-item">
              <div className="review-header">
                <div className="review-user">
                  <div className="user-avatar">
                    {review.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-info">
                    <div className="user-name">{review.user.name}</div>
                    <div className="review-date">
                      {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                </div>
                <div className="review-rating">
                  {renderStars(review.rating)}
                </div>
              </div>
              <div className="review-comment">
                {review.comment}
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="review-pagination">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="btn-pagination"
          >
            ← Trước
          </button>

          <span className="page-info">
            Trang {currentPage} / {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="btn-pagination"
          >
            Sau →
          </button>
        </div>
      )}
    </div>
  );
}

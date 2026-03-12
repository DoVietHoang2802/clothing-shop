import { useState } from 'react';
import reviewService from '../services/reviewService';
import './ReviewForm.css';

export default function ReviewForm({ productId, onReviewSubmitted }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!rating) {
      setError('Vui lòng chọn đánh giá');
      return;
    }

    if (comment.trim().length < 10) {
      setError('Bình luận phải từ 10 ký tự trở lên');
      return;
    }

    setLoading(true);

    try {
      await reviewService.createReview(productId, rating, comment);
      setSuccess('Cảm ơn bạn đã đánh giá sản phẩm!');
      setRating(0);
      setComment('');
      setHoverRating(0);

      // Gọi callback để refresh reviews
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }

      // Ẩn thông báo sau 3 giây
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi gửi đánh giá');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="review-form-container">
      <h3 className="review-form-title">📝 Chia sẻ đánh giá của bạn</h3>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit} className="review-form">
        <div className="form-group">
          <label htmlFor="rating" className="form-label">
            Đánh giá:
          </label>
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`star ${star <= (hoverRating || rating) ? 'active' : ''}`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
              >
                ⭐
              </span>
            ))}
          </div>
          <span className="rating-text">
            {rating > 0 ? `${rating} sao` : 'Nhấp để đánh giá'}
          </span>
        </div>

        <div className="form-group">
          <label htmlFor="comment" className="form-label">
            Bình luận:
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này... (tối thiểu 10 ký tự)"
            className="form-textarea"
            rows="4"
            maxLength="500"
          />
          <div className="char-count">
            {comment.length}/500
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-submit"
        >
          {loading ? '⏳ Đang gửi...' : '✓ Gửi đánh giá'}
        </button>
      </form>
    </div>
  );
}

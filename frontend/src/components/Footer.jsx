import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container" style={{ padding: '3rem 2rem' }}>
        <div className="footer-content">
          {/* About */}
          <div className="footer-section">
            <h4>Tech Store</h4>
            <p style={{ fontSize: '0.95rem', color: '#ecf0f1', lineHeight: '1.6' }}>
              Cửa hàng điện tử trực tuyến hàng đầu với các sản phẩm công nghệ chất lượng cao, giá cả cạnh tranh và dịch vụ khách hàng tuyệt vời. Chuyên cung cấp điện thoại, laptop, tablet, smartwatch và các thiết bị công nghệ hiện đại.
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h4>Liên Kết Nhanh</h4>
            <ul>
              <li><Link to="/">Trang Chủ</Link></li>
              <li><Link to="/products">Sản Phẩm</Link></li>
              <li><Link to="/my-orders">Đơn Hàng của Tôi</Link></li>
              <li><Link to="/profile">Hồ Sơ</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="footer-section">
            <h4>Hỗ Trợ</h4>
            <ul>
              <li><a href="#/">Liên Hệ Chúng Tôi</a></li>
              <li><a href="#/">Chính Sách Bảo Hành</a></li>
              <li><a href="#/">Chính Sách Đổi Trả</a></li>
              <li><a href="#/">Điều Khoản Sử Dụng</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-section">
            <h4>Liên Hệ</h4>
            <ul style={{ listStyle: 'none' }}>
              <li style={{ marginBottom: '0.75rem' }}>
                <strong>📞 Hotline:</strong> 1800-1234
              </li>
              <li style={{ marginBottom: '0.75rem' }}>
                <strong>📧 Email:</strong> support@techstore.com
              </li>
              <li style={{ marginBottom: '0.75rem' }}>
                <strong>📍 Địa Chỉ:</strong> 123 Đường Lê Lợi, Q1, TP.HCM
              </li>
              <li>
                <strong>🕐 Giờ Mở Cửa:</strong> 8h - 22h hàng ngày
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2024 Tech Store - Điện Tử Online. Bảo Lưu Mọi Quyền Sáng Tạo. | Thiết Kế Bởi Your Company</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

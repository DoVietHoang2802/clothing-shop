import React, { useState, useEffect } from 'react';

const Carousel = ({ slides = [] }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Default slides - Electronics products
  const defaultSlides = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1505228395891-9a51e7e86e81?w=1200&h=400&fit=crop&q=80',
      title: 'iPhone 15 Pro Max - Công Nghệ Mới Nhất'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1588872657840-790ff3bde726?w=1200&h=400&fit=crop&q=80',
      title: 'Laptop Gaming - Hiệu Năng Đỉnh Cao'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&h=400&fit=crop&q=80',
      title: 'Smartwatch - Kết Nối Thông Minh'
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=1200&h=400&fit=crop&q=80',
      title: 'Tai Nghe Bluetooth - Âm Thanh Tuyệt Vời'
    },
    {
      id: 5,
      image: 'https://images.unsplash.com/photo-1614613535308-eb5fbd8f2c81?w=1200&h=400&fit=crop&q=80',
      title: 'iPad Air - Sáng Tạo không Giới Hạn'
    },
  ];

  const displaySlides = slides.length > 0 ? slides : defaultSlides;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % displaySlides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [displaySlides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="carousel-container">
      {displaySlides.map((slide, index) => (
        <div
          key={slide.id || index}
          className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}
        >
          <img src={slide.image} alt={slide.title} />
        </div>
      ))}

      <div className="carousel-controls">
        {displaySlides.map((_, index) => (
          <button
            key={index}
            className={`carousel-dot ${index === currentSlide ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;

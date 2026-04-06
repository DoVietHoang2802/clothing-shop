import React, { useState, useEffect } from 'react';

const FlashSaleTimer = ({ saleEndTime }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const endTime = new Date(saleEndTime).getTime();
      const diff = endTime - now;

      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / 1000 / 60) % 60),
          seconds: Math.floor((diff / 1000) % 60)
        });
      } else {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [saleEndTime]);

  return (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <div className="countdown-item">
        <div>{String(timeLeft.days).padStart(2, '0')}</div>
        <div>Ngày</div>
      </div>
      <div className="countdown-item">
        <div>{String(timeLeft.hours).padStart(2, '0')}</div>
        <div>Giờ</div>
      </div>
      <div className="countdown-item">
        <div>{String(timeLeft.minutes).padStart(2, '0')}</div>
        <div>Phút</div>
      </div>
      <div className="countdown-item">
        <div>{String(timeLeft.seconds).padStart(2, '0')}</div>
        <div>Giây</div>
      </div>
    </div>
  );
};

export default FlashSaleTimer;

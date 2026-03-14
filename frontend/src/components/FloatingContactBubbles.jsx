import React, { useState, useEffect } from 'react';
import './FloatingContactBubbles.css';

const FloatingContactBubbles = () => {
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    // Load hidden state from localStorage
    const hidden = localStorage.getItem('floating-bubbles-hidden') === 'true';
    setIsHidden(hidden);
  }, []);

  const toggleBubbles = () => {
    const newState = !isHidden;
    setIsHidden(newState);
    localStorage.setItem('floating-bubbles-hidden', newState);
  };

  if (isHidden) {
    return (
      <button className="floating-bubbles-toggle-show" onClick={toggleBubbles}>
        💬
      </button>
    );
  }

  return (
    <div className="floating-bubbles-container">
      {/* Facebook Messenger */}
      <a
        href="https://www.facebook.com/Dvhoang2802"
        target="_blank"
        rel="noopener noreferrer"
        className="floating-bubble facebook-bubble"
        title="Chat trên Facebook"
      >
        <span className="bubble-icon">📘</span>
      </a>

      {/* Phone */}
      <a
        href="tel:0866924119"
        className="floating-bubble phone-bubble"
        title="Gọi điện: 0866924119"
      >
        <span className="bubble-icon">☎️</span>
      </a>

      {/* Gmail */}
      <a
        href="mailto:doviethoang28122002@gmail.com"
        className="floating-bubble email-bubble"
        title="Gửi email"
      >
        <span className="bubble-icon">📧</span>
      </a>

      {/* Toggle Button */}
      <button className="floating-bubbles-toggle" onClick={toggleBubbles} title="Ẩn liên hệ">
        ✕
      </button>
    </div>
  );
};

export default FloatingContactBubbles;

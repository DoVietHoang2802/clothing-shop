import React, { useState, useEffect } from 'react';
import ContactInfoModal from './ContactInfoModal';
import './FloatingContactBubbles.css';

const FloatingContactBubbles = () => {
  const [isHidden, setIsHidden] = useState(false);
  const [activeModal, setActiveModal] = useState(null);

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

  const contactInfo = {
    phone: {
      icon: '☎️',
      title: 'Liên Hệ Điện Thoại',
      label: 'Số điện thoại',
      value: '0866924119',
      description: 'Gọi chúng tôi để được hỗ trợ tốt nhất',
      actionBtn: {
        label: '📞 Gọi Ngay',
        href: 'tel:0866924119',
      },
    },
    email: {
      icon: '📧',
      title: 'Liên Hệ Email',
      label: 'Email',
      value: 'doviethoang28122002@gmail.com',
      description: 'Gửi email cho chúng tôi bất kỳ lúc nào',
      actionBtn: {
        label: '📬 Gửi Email',
        href: 'mailto:doviethoang28122002@gmail.com',
      },
    },
    facebook: {
      icon: '📘',
      title: 'Chat Trên Facebook',
      label: 'Facebook Profile',
      value: 'facebook.com/Dvhoang2802',
      description: 'Chat với chúng tôi trên Messenger',
      actionBtn: {
        label: '💬 Mở Messenger',
        href: 'https://www.facebook.com/Dvhoang2802',
        target: '_blank',
      },
    },
  };

  if (isHidden) {
    return (
      <>
        <button className="floating-bubbles-toggle-show" onClick={toggleBubbles}>
          💬
        </button>
        <ContactInfoModal
          isOpen={activeModal !== null}
          onClose={() => setActiveModal(null)}
          type={activeModal}
          info={contactInfo[activeModal] || {}}
        />
      </>
    );
  }

  return (
    <>
      <div className="floating-bubbles-container">
        {/* Facebook Messenger */}
        <button
          className="floating-bubble facebook-bubble"
          onClick={() => setActiveModal('facebook')}
          title="Chat trên Facebook"
        >
          <span className="bubble-icon">📘</span>
        </button>

        {/* Phone */}
        <button
          className="floating-bubble phone-bubble"
          onClick={() => setActiveModal('phone')}
          title="Gọi điện"
        >
          <span className="bubble-icon">☎️</span>
        </button>

        {/* Gmail */}
        <button
          className="floating-bubble email-bubble"
          onClick={() => setActiveModal('email')}
          title="Gửi email"
        >
          <span className="bubble-icon">📧</span>
        </button>

        {/* Toggle Button */}
        <button className="floating-bubbles-toggle" onClick={toggleBubbles} title="Ẩn liên hệ">
          ✕
        </button>
      </div>

      <ContactInfoModal
        isOpen={activeModal !== null}
        onClose={() => setActiveModal(null)}
        type={activeModal}
        info={contactInfo[activeModal] || {}}
      />
    </>
  );
};

export default FloatingContactBubbles;

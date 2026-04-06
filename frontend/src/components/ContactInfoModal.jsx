import React, { useState } from 'react';
import './ContactInfoModal.css';

const ContactInfoModal = ({ isOpen, onClose, type, info }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(info.value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="contact-modal-overlay" onClick={onClose}>
      <div className="contact-modal" onClick={(e) => e.stopPropagation()}>
        <button className="contact-modal-close" onClick={onClose}>✕</button>

        <div className="contact-modal-header">
          <span className="contact-modal-icon">{info.icon}</span>
          <h2>{info.title}</h2>
        </div>

        <div className="contact-modal-content">
          <div className="contact-info-box">
            <p className="contact-label">{info.label}</p>
            <p className="contact-value">{info.value}</p>
          </div>

          <div className="contact-modal-actions">
            <button
              className="contact-btn contact-btn-copy"
              onClick={handleCopy}
            >
              {copied ? '✓ Đã Sao Chép' : '📋 Sao Chép'}
            </button>

            {info.actionBtn && (
              <a
                href={info.actionBtn.href}
                target={info.actionBtn.target}
                rel="noopener noreferrer"
                className="contact-btn contact-btn-action"
              >
                {info.actionBtn.label}
              </a>
            )}
          </div>

          {info.description && (
            <p className="contact-modal-description">{info.description}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactInfoModal;

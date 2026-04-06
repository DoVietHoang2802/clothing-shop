import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import addressService from '../services/addressService';

const AddressPage = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    ward: '',
    district: '',
    city: '',
    isDefault: false,
    label: 'home',
  });

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const res = await addressService.getAddresses();
      setAddresses(res.data.data || []);
    } catch (err) {
      console.error('Error loading addresses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await addressService.updateAddress(editingId, formData);
      } else {
        await addressService.createAddress(formData);
      }
      setShowForm(false);
      setEditingId(null);
      resetForm();
      loadAddresses();
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleEdit = (addr) => {
    setEditingId(addr._id);
    setFormData({
      fullName: addr.fullName,
      phone: addr.phone,
      address: addr.address,
      ward: addr.ward || '',
      district: addr.district || '',
      city: addr.city || '',
      isDefault: addr.isDefault,
      label: addr.label || 'home',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa địa chỉ này?')) return;
    try {
      await addressService.deleteAddress(id);
      loadAddresses();
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await addressService.setDefaultAddress(id);
      loadAddresses();
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      phone: '',
      address: '',
      ward: '',
      district: '',
      city: '',
      isDefault: false,
      label: 'home',
    });
  };

  const getLabelIcon = (label) => {
    switch (label) {
      case 'home': return '🏠';
      case 'office': return '🏢';
      default: return '📍';
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '2rem' }}>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem', maxWidth: '800px' }}>
      {/* Header */}
      <div style={{
        marginBottom: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#2c3e50' }}>📍 Địa Chỉ Giao Hàng</h1>
          <p style={{ margin: '0.5rem 0 0 0', color: '#7f8c8d' }}>
            Quản lý địa chỉ giao hàng của bạn
          </p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); resetForm(); }}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
          }}
        >
          + Thêm địa chỉ
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#2c3e50' }}>
            {editingId ? '✏️ Sửa địa chỉ' : '➕ Thêm địa chỉ mới'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#666', fontSize: '0.9rem' }}>
                  Họ tên *
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #eee',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#666', fontSize: '0.9rem' }}>
                  Số điện thoại *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #eee',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                  }}
                />
              </div>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#666', fontSize: '0.9rem' }}>
                Địa chỉ (số nhà, đường) *
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
                placeholder="VD: 123 Nguyễn Trãi, Phường Bến Thành"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #eee',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#666', fontSize: '0.9rem' }}>
                  Phường/Xã
                </label>
                <input
                  type="text"
                  value={formData.ward}
                  onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                  placeholder="VD: Bến Thành"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #eee',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#666', fontSize: '0.9rem' }}>
                  Quận/Huyện
                </label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  placeholder="VD: Quận 1"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #eee',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#666', fontSize: '0.9rem' }}>
                  Tỉnh/Thành phố
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="VD: TP.HCM"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #eee',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', alignItems: 'center' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#666', fontSize: '0.9rem' }}>
                  Nhãn
                </label>
                <select
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  style={{
                    padding: '0.75rem',
                    border: '2px solid #eee',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                  }}
                >
                  <option value="home">🏠 Nhà</option>
                  <option value="office">🏢 Văn phòng</option>
                  <option value="other">📍 Khác</option>
                </select>
              </div>
              <div style={{ marginTop: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  />
                  <span style={{ fontSize: '0.9rem', color: '#666' }}>Đặt làm địa chỉ mặc định</span>
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                type="submit"
                style={{
                  padding: '0.75rem 2rem',
                  background: '#27ae60',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                }}
              >
                {editingId ? '💾 Lưu' : '➕ Thêm'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditingId(null); resetForm(); }}
                style={{
                  padding: '0.75rem 2rem',
                  background: '#eee',
                  color: '#666',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Address List */}
      {addresses.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          background: 'white',
          borderRadius: '12px',
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📍</div>
          <h3 style={{ color: '#666', marginBottom: '0.5rem' }}>Chưa có địa chỉ nào</h3>
          <p style={{ color: '#999' }}>Thêm địa chỉ giao hàng để tiết kiệm thời gian khi đặt hàng</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {addresses.map((addr) => (
            <div
              key={addr._id}
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                border: addr.isDefault ? '2px solid #667eea' : '2px solid transparent',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>{getLabelIcon(addr.label)}</span>
                    <span style={{ fontWeight: '700', color: '#2c3e50', fontSize: '1.1rem' }}>
                      {addr.fullName}
                    </span>
                    {addr.isDefault && (
                      <span style={{
                        padding: '0.2rem 0.5rem',
                        background: '#667eea',
                        color: 'white',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: '600',
                      }}>
                        Mặc định
                      </span>
                    )}
                  </div>
                  <p style={{ margin: '0.25rem 0', color: '#666', fontSize: '0.95rem' }}>
                    📞 {addr.phone}
                  </p>
                  <p style={{ margin: '0.25rem 0', color: '#666', fontSize: '0.95rem' }}>
                    📍 {addr.address}
                    {addr.ward && `, ${addr.ward}`}
                    {addr.district && `, ${addr.district}`}
                    {addr.city && `, ${addr.city}`}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {!addr.isDefault && (
                    <button
                      onClick={() => handleSetDefault(addr._id)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: '#f0f0f0',
                        color: '#666',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                      }}
                    >
                      Đặt mặc định
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(addr)}
                    style={{
                      padding: '0.5rem 1rem',
                      background: '#f0f0f0',
                      color: '#666',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                    }}
                  >
                    ✏️ Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(addr._id)}
                    style={{
                      padding: '0.5rem 1rem',
                      background: '#fee',
                      color: '#e74c3c',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                    }}
                  >
                    🗑️ Xóa
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Back link */}
      <div style={{ marginTop: '2rem' }}>
        <Link to="/profile" style={{ color: '#667eea', textDecoration: 'none' }}>
          ← Quay lại trang cá nhân
        </Link>
      </div>
    </div>
  );
};

export default AddressPage;

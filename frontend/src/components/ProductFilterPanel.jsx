import React from 'react';

const ProductFilterPanel = ({
  search,
  setSearch,
  selectedCategory,
  setSelectedCategory,
  categories,
  sortBy,
  setSortBy,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  onApplyFilter,
  onClearFilter
}) => {
  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
      padding: '1.5rem',
      position: 'sticky',
      top: '20px',
      maxHeight: 'calc(100vh - 40px)',
      overflowY: 'auto',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '1.5rem',
        paddingBottom: '1rem',
        borderBottom: '2px solid #f0f0f0'
      }}>
        <span style={{ fontSize: '1.5rem' }}>🔍</span>
        <h3 style={{
          margin: 0,
          fontSize: '1.1rem',
          fontWeight: '700',
          color: '#2c3e50'
        }}>
          Tìm kiếm & Lọc sản phẩm
        </h3>
      </div>

      {/* Search Input */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontWeight: '600',
          color: '#34495e',
          marginBottom: '0.75rem',
          fontSize: '0.95rem'
        }}>
          <span>🔎</span> Tìm theo tên
        </label>
        <input
          type="text"
          placeholder="Nhập tên sản phẩm..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            border: '2px solid #e0e0e0',
            borderRadius: '8px',
            fontSize: '0.95rem',
            transition: 'all 0.3s ease',
            outline: 'none',
            boxSizing: 'border-box'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#3498db';
            e.target.style.boxShadow = '0 0 0 3px rgba(52, 152, 219, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e0e0e0';
            e.target.style.boxShadow = 'none';
          }}
        />
      </div>

      {/* Category Filter */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontWeight: '600',
          color: '#34495e',
          marginBottom: '0.75rem',
          fontSize: '0.95rem'
        }}>
          <span>📦</span> Danh mục
        </label>
        <select
          value={selectedCategory || ''}
          onChange={(e) => setSelectedCategory(e.target.value || null)}
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            border: '2px solid #e0e0e0',
            borderRadius: '8px',
            fontSize: '0.95rem',
            backgroundColor: 'white',
            cursor: 'pointer',
            outline: 'none',
            transition: 'all 0.3s ease'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#3498db';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e0e0e0';
          }}
        >
          <option value="">Tất cả danh mục</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontWeight: '600',
          color: '#34495e',
          marginBottom: '0.75rem',
          fontSize: '0.95rem'
        }}>
          <span>💰</span> Khoảng giá
        </label>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input
            type="number"
            placeholder="Từ"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            style={{
              flex: 1,
              padding: '0.75rem',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '0.9rem',
              outline: 'none',
              width: '100%'
            }}
            onFocus={(e) => e.target.style.borderColor = '#3498db'}
            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
          />
          <span style={{ color: '#999' }}>-</span>
          <input
            type="number"
            placeholder="Đến"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            style={{
              flex: 1,
              padding: '0.75rem',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '0.9rem',
              outline: 'none',
              width: '100%'
            }}
            onFocus={(e) => e.target.style.borderColor = '#3498db'}
            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
          />
        </div>
      </div>

      {/* Sort By */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontWeight: '600',
          color: '#34495e',
          marginBottom: '0.75rem',
          fontSize: '0.95rem'
        }}>
          <span>↕️</span> Sắp xếp theo
        </label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            border: '2px solid #e0e0e0',
            borderRadius: '8px',
            fontSize: '0.95rem',
            backgroundColor: 'white',
            cursor: 'pointer',
            outline: 'none',
            transition: 'all 0.3s ease'
          }}
          onFocus={(e) => e.target.style.borderColor = '#3498db'}
          onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
        >
          <option value="newest">Sản phẩm mới nhất</option>
          <option value="name-asc">Tên A → Z</option>
          <option value="name-desc">Tên Z → A</option>
          <option value="price-asc">Giá: Thấp → Cao</option>
          <option value="price-desc">Giá: Cao → Thấp</option>
        </select>
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        paddingTop: '1rem',
        borderTop: '2px solid #f0f0f0'
      }}>
        <button
          onClick={onApplyFilter}
          style={{
            width: '100%',
            padding: '0.875rem',
            background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 12px rgba(52, 152, 219, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 16px rgba(52, 152, 219, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 12px rgba(52, 152, 219, 0.3)';
          }}
        >
          ✓ Áp dụng bộ lọc
        </button>

        <button
          onClick={onClearFilter}
          style={{
            width: '100%',
            padding: '0.875rem',
            background: 'white',
            color: '#7f8c8d',
            border: '2px solid #e0e0e0',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.borderColor = '#e74c3c';
            e.target.style.color = '#e74c3c';
          }}
          onMouseLeave={(e) => {
            e.target.style.borderColor = '#e0e0e0';
            e.target.style.color = '#7f8c8d';
          }}
        >
          ✕ Xóa bộ lọc
        </button>
      </div>
    </div>
  );
};

export default ProductFilterPanel;

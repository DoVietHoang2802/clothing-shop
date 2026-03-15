import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import userService from '../../services/userService';

const AdminUsersPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [updatingRole, setUpdatingRole] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await userService.getAllUsers();
      setUsers(res.data.data);
      setError('');
    } catch (err) {
      setError('Không thể tải danh sách người dùng');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user._id);
    setSelectedRole(user.role);
  };

  const handleUpdateRole = async () => {
    if (!selectedUser || !selectedRole) return;

    try {
      setUpdatingRole(true);
      await userService.updateUserRole(selectedUser, selectedRole);
      setSuccess('✅ Cập nhật vai trò thành công!');
      setSelectedUser(null);
      setSelectedRole('');
      loadUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Không thể cập nhật vai trò');
      console.error(err);
    } finally {
      setUpdatingRole(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa người dùng này?')) return;

    try {
      await userService.deleteUser(id);
      setSuccess('✅ Xóa người dùng thành công!');
      loadUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Không thể xóa người dùng');
      console.error(err);
    }
  };

  const getRoleBadge = (role) => {
    const roles = {
      ADMIN: { label: '👑 Admin', color: '#667eea', bg: '#667eea20' },
      STAFF: { label: '💼 Nhân viên', color: '#4facfe', bg: '#4facfe20' },
      USER: { label: '👤 Khách hàng', color: '#43e97b', bg: '#43e97b20' }
    };
    return roles[role] || roles.USER;
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container flex-center" style={{ minHeight: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid #f0f0f0',
            borderTop: '4px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: '#666' }}>Đang tải...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Header */}
      <div style={{
        marginBottom: '2rem',
        padding: '2rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '16px',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: '700' }}>👥 Quản Lý Người Dùng</h1>
          <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9 }}>{users.length} người dùng</p>
        </div>
        <button
          onClick={() => navigate('/admin/dashboard')}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'white',
            color: '#667eea',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          ← Quay Lại
        </button>
      </div>

      {error && (
        <div style={{
          padding: '1rem 1.5rem',
          marginBottom: '1.5rem',
          backgroundColor: '#fee',
          color: '#e74c3c',
          borderRadius: '12px',
          borderLeft: '4px solid #e74c3c'
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          padding: '1rem 1.5rem',
          marginBottom: '1.5rem',
          backgroundColor: '#efe',
          color: '#27ae60',
          borderRadius: '12px',
          borderLeft: '4px solid #27ae60',
          animation: 'fadeIn 0.3s ease'
        }}>
          {success}
        </div>
      )}

      {/* Search & Stats */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '1.5rem',
        marginBottom: '1.5rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
      }}>
        <input
          type="text"
          placeholder="🔍 Tìm kiếm theo tên hoặc email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '1rem',
            border: '2px solid #e0e0e0',
            borderRadius: '8px',
            fontSize: '1rem'
          }}
        />
      </div>

      {/* Users Table */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8f9fa' }}>
              <th style={{ padding: '1rem', textAlign: 'left', color: '#7f8c8d', fontWeight: '600' }}>Người dùng</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: '#7f8c8d', fontWeight: '600' }}>Email</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: '#7f8c8d', fontWeight: '600' }}>Vai trò</th>
              <th style={{ padding: '1rem', textAlign: 'center', color: '#7f8c8d', fontWeight: '600' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: '#7f8c8d' }}>
                  Không tìm thấy người dùng nào
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => {
                const roleInfo = getRoleBadge(user.role);
                return (
                  <tr
                    key={user._id}
                    style={{
                      borderBottom: '1px solid #f0f0f0',
                      transition: 'all 0.3s ease',
                      background: selectedUser === user._id ? '#f8f9fa' : 'white'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
                    onMouseLeave={(e) => e.currentTarget.style.background = selectedUser === user._id ? '#f8f9fa' : 'white'}
                  >
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: '600'
                        }}>
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: '500', color: '#2c3e50' }}>{user.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem', color: '#7f8c8d' }}>{user.email}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '20px',
                        background: roleInfo.bg,
                        color: roleInfo.color,
                        fontWeight: '600',
                        fontSize: '0.9rem'
                      }}>
                        {roleInfo.label}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        style={{
                          padding: '0.5rem 1rem',
                          background: '#fee',
                          color: '#e74c3c',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = '#e74c3c';
                          e.target.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = '#fee';
                          e.target.style.color = '#e74c3c';
                        }}
                      >
                        🗑️ Xóa
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Update Role Modal */}
      {selectedUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}
        onClick={() => setSelectedUser(null)}
        >
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 1.5rem 0', color: '#2c3e50' }}>📝 Cập Nhật Vai Trò</h3>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#34495e' }}>
                Chọn vai trò mới:
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                style={{
                  width: '100%',
                  padding: '1rem',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              >
                <option value="USER">👤 USER (Người dùng thường)</option>
                <option value="STAFF">💼 STAFF (Nhân viên)</option>
                <option value="ADMIN">👑 ADMIN (Quản trị viên)</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={handleUpdateRole}
                disabled={updatingRole}
                style={{
                  flex: 1,
                  padding: '1rem',
                  background: updatingRole ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: updatingRole ? 'not-allowed' : 'pointer'
                }}
              >
                {updatingRole ? '⏳ Đang cập nhật...' : '✅ Cập Nhật'}
              </button>
              <button
                onClick={() => setSelectedUser(null)}
                style={{
                  padding: '1rem 2rem',
                  background: 'white',
                  color: '#7f8c8d',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                ❌ Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default AdminUsersPage;

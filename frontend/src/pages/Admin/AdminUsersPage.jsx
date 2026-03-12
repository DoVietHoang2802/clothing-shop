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
      setSuccess('Cập nhật vai trò thành công');
      setSelectedUser(null);
      setSelectedRole('');
      loadUsers();
      setTimeout(() => setSuccess(''), 2000);
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
      setSuccess('Xóa người dùng thành công');
      loadUsers();
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError('Không thể xóa người dùng');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="container flex-center" style={{ minHeight: '400px' }}>
        <p>Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>👥 Quản Lý Người Dùng</h1>
        <button className="btn btn-secondary" onClick={() => navigate('/admin/dashboard')}>
          ← Quay Lại
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {users.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Không có người dùng nào</p>
        </div>
      ) : (
        <>
          <div className="card">
            <table className="table">
              <thead>
                <tr>
                  <th>Tên</th>
                  <th>Email</th>
                  <th>Vai Trò</th>
                  <th>Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} style={{
                    backgroundColor: selectedUser === user._id ? '#f0f0f0' : 'transparent',
                    cursor: 'pointer'
                  }}>
                    <td onClick={() => handleSelectUser(user)}>{user.name}</td>
                    <td onClick={() => handleSelectUser(user)}>{user.email}</td>
                    <td onClick={() => handleSelectUser(user)}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '4px',
                        fontSize: '0.9rem',
                        backgroundColor: user.role === 'ADMIN' ? '#ffe0e0' : user.role === 'STAFF' ? '#e0f0ff' : '#e0ffe0',
                        color: user.role === 'ADMIN' ? '#c00' : user.role === 'STAFF' ? '#00c' : '#0c0',
                      }}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDeleteUser(user._id)}
                        style={{ fontSize: '0.85rem' }}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedUser && (
            <div className="card" style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: '#f9f9f9' }}>
              <h3>Cập Nhật Vai Trò</h3>
              <div style={{
                display: 'flex',
                gap: '1rem',
                alignItems: 'center',
                marginTop: '1rem',
                flexWrap: 'wrap'
              }}>
                <div style={{ flex: '1', minWidth: '200px' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Chọn Vai Trò:
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      border: '1px solid #ccc',
                      fontSize: '1rem'
                    }}
                  >
                    <option value="USER">👤 USER (Người dùng thường)</option>
                    <option value="STAFF">👨‍💼 STAFF (Nhân viên)</option>
                    <option value="ADMIN">👑 ADMIN (Quản trị viên)</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="btn btn-primary"
                    onClick={handleUpdateRole}
                    disabled={updatingRole}
                    style={{
                      opacity: updatingRole ? 0.6 : 1,
                      cursor: updatingRole ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {updatingRole ? '⏳ Đang cập nhật...' : '✅ Cập Nhật'}
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setSelectedUser(null);
                      setSelectedRole('');
                    }}
                  >
                    ❌ Hủy
                  </button>
                </div>
              </div>
              <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
                Chọn vai trò mới cho người dùng và ấn "Cập Nhật"
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminUsersPage;

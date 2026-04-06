import api from './api';

const userService = {
  getProfile: () => {
    return api.get('/users/profile');
  },

  updateProfile: (data) => {
    return api.put('/users/profile', data);
  },

  getAllUsers: () => {
    return api.get('/users');
  },

  updateUserRole: (id, role) => {
    return api.put(`/users/${id}/role`, { role });
  },

  deleteUser: (id) => {
    return api.delete(`/users/${id}`);
  },
};

export default userService;

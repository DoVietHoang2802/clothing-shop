import api from './api';

const adminService = {
  getStats: () => {
    return api.get('/admin/stats');
  },
  getChartData: () => {
    return api.get('/admin/stats/chart');
  },
};

export default adminService;

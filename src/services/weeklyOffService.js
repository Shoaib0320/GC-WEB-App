import api from '@/lib/api';

export const weeklyOffService = {
  // Get all weekly off days
  getAll: async () => {
    const response = await api.get('/weekly-off');
    return response.data;
  },

  // Create weekly off day
  create: async (weeklyOffData) => {
    const response = await api.post('/weekly-off', weeklyOffData);
    return response.data;
  },

  // Update weekly off status
  updateStatus: async (id, isActive) => {
    const response = await api.put('/weekly-off', { id, isActive });
    return response.data;
  },

  // Delete weekly off day
  delete: async (id) => {
    const response = await api.delete(`/weekly-off?id=${id}`);
    return response.data;
  }
};
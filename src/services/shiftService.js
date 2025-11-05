import api from '@/lib/api';

export const shiftService = {
  // Get all shifts with pagination and search
  getAllShifts: async (params = {}) => {
    const response = await api.get('/shifts', { params });
    return response.data;
  },

  // Get shift by ID
  getShiftById: async (id) => {
    const response = await api.get(`/shifts/${id}`);
    return response.data;
  },

  // Create new shift
  createShift: async (shiftData) => {
    const response = await api.post('/shifts', shiftData);
    return response.data;
  },

  // Update shift
  updateShift: async (id, shiftData) => {
    const response = await api.put(`/shifts/${id}`, shiftData);
    return response.data;
  },

  // Delete shift
  deleteShift: async (id) => {
    const response = await api.delete(`/shifts/${id}`);
    return response.data;
  },

  // Get shifts for dropdown (simple list)
  getShiftsForDropdown: async () => {
    const response = await api.get('/shifts?limit=100&page=1');
    return response.data.data || [];
  }
};
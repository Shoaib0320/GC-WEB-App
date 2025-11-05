import api from '@/lib/api';

export const discountService = {
  // Get all discounts
  getAll: async (params = {}) => {
    const response = await api.get('/discounts', { params });
    return response.data;
  },

  // Get discount by ID
  getById: async (id) => {
    const response = await api.get(`/discounts/${id}`);
    return response.data;
  },

  // Create new discount
  create: async (discountData) => {
    const response = await api.post('/discounts', discountData);
    return response.data;
  },

  // Update discount
  update: async (id, discountData) => {
    const response = await api.put(`/discounts/${id}`, discountData);
    return response.data;
  },

  // Delete discount
  delete: async (id) => {
    const response = await api.delete(`/discounts/${id}`);
    return response.data;
  },

  // Apply discount to products
  applyDiscount: async (discountData) => {
    const response = await api.post('/discounts/apply', discountData);
    return response.data;
  },

  // Remove discount from products
  removeDiscount: async (discountId) => {
    const response = await api.delete(`/discounts/remove/${discountId}`);
    return response.data;
  },

  // Get discount statistics
  getStats: async () => {
    const response = await api.get('/discounts/stats');
    return response.data;
  }
};
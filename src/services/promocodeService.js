import api from '@/lib/api';

export const promoCodeService = {
  // Get all promo codes with pagination and search
  getAllPromoCodes: async (params = {}) => {
    const response = await api.get('/promo-codes', { params });
    return response.data;
  },

  // Get promo code by ID
  getPromoCodeById: async (id) => {
    const response = await api.get(`/promo-codes/${id}`);
    return response.data;
  },

  // Create new promo code
  createPromoCode: async (promoData) => {
    const response = await api.post('/promo-codes', promoData);
    return response.data;
  },

  // Update promo code
  updatePromoCode: async (id, promoData) => {
    const response = await api.put(`/promo-codes/${id}`, promoData);
    return response.data;
  },

  // Delete promo code
  deletePromoCode: async (id) => {
    const response = await api.delete(`/promo-codes/${id}`);
    return response.data;
  },

  // Validate promo code
  validatePromoCode: async (promoCode, agentId) => {
    const response = await api.post('/promo-codes/validate', {
      promoCode,
      agentId
    });
    return response.data;
  },

  // Apply promo code
  applyPromoCode: async (promoCode, agentId, amount) => {
    const response = await api.post('/promo-codes/apply', {
      promoCode,
      agentId,
      amount
    });
    return response.data;
  },

  // Get promo codes by agent
  getPromoCodesByAgent: async (agentId) => {
    const response = await api.get(`/promo-codes/agent/${agentId}`);
    return response.data;
  },

  // Update promo code status
  updatePromoCodeStatus: async (id, isActive) => {
    const response = await api.patch(`/promo-codes/${id}/status`, { isActive });
    return response.data;
  }
};
// src/services/agentSalesService.js
import api from '@/lib/api';

export const agentSalesService = {
  // 🔥 WORKING APIs - Tumhare jo URLs work kar rahe hain

  // Get agent's promo codes analytics
  getAgentSalesOverview: async (agentId, params = {}) => {
    const response = await api.get(`/promo-codes/agent/${agentId}/promo-codes/analytics`, { params });
    return response.data;
  },

  // Get agent's conversion rates
  getAgentConversionRates: async (agentId, params = {}) => {
    const response = await api.get(`/promo-codes/agent/${agentId}/conversion-rates`, { params });
    return response.data;
  },

  // Get agent's bookings
  getAgentBookings: async (agentId, params = {}) => {
    const response = await api.get(`/promo-codes/agent/${agentId}/bookings`, { params });
    return response.data;
  },

  // Get agent's booking stats
  getAgentBookingStats: async (agentId, params = {}) => {
    const response = await api.get(`/promo-codes/agent/${agentId}/booking-stats`, { params });
    return response.data;
  },

  // Get agent's promo codes with stats (same as overview)
  getAgentPromoCodesWithStats: async (agentId, params = {}) => {
    const response = await api.get(`/promo-codes/agent/${agentId}/promo-codes/analytics`, { params });
    return response.data;
  },
  // Get agent's monthly stats
  getAgentMonthlyStats: async (agentId, month) => {
    try {
      const response = await api.get(`/promo-codes/agent/${agentId}/monthly-stats`, {
        params: { month }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching monthly stats:', error);
      throw error;
    }
  },
};
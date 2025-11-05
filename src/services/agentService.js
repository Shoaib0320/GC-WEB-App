import api from '@/lib/api';

export const agentService = {
  // Agent Login
  login: async (agentId, password) => {
    const response = await api.post('/agents/login', { agentId, password });
    
    if (response.data.token && typeof window !== 'undefined') {
      localStorage.setItem('agentToken', response.data.token);
      localStorage.setItem('agentData', JSON.stringify(response.data.agent));
    }
    
    return response.data;
  },

  // Agent Logout
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('agentToken');
      localStorage.removeItem('agentData');
    }
  },

  // Get current agent profile
  getProfile: async () => {
    const response = await api.get('/agents/profile');
    return response.data;
  },

  // Update agent profile
  updateProfile: async (profileData) => {
    const response = await api.put('/agents/profile', profileData);
    
    // Update local storage
    if (typeof window !== 'undefined') {
      const currentData = JSON.parse(localStorage.getItem('agentData') || '{}');
      localStorage.setItem('agentData', JSON.stringify({
        ...currentData,
        ...profileData
      }));
    }
    
    return response.data;
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/agents/change-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  },

  // Forgot password
  forgotPassword: async (email) => {
    const response = await api.post('/agents/forgot-password', { email });
    return response.data;
  },

  // Reset password
  resetPassword: async (token, newPassword) => {
    const response = await api.post('/agents/reset-password', {
      token,
      newPassword
    });
    return response.data;
  },

  // Get all agents (for admin)
  getAllAgents: async (params = {}) => {
    const response = await api.get('/agents', { params });
    return response.data;
  },

  // Get agent by ID (for admin)
  getAgentById: async (id) => {
    const response = await api.get(`/agents/${id}`);
    return response.data;
  },

  // Create agent (for admin)
  createAgent: async (agentData) => {
    const response = await api.post('/agents', agentData);
    return response.data;
  },

  // Update agent (for admin)
  updateAgent: async (id, agentData) => {
    const response = await api.put(`/agents/${id}`, agentData);
    return response.data;
  },

  // Delete agent (for admin)
  deleteAgent: async (id) => {
    const response = await api.delete(`/agents/${id}`);
    return response.data;
  },

  // Update agent status (for admin)
  updateAgentStatus: async (id, isActive) => {
    const response = await api.patch(`/agents/${id}/status`, { isActive });
    return response.data;
  },

  // Get agent dashboard data
  getDashboardData: async () => {
    const response = await api.get('/agents/dashboard');
    return response.data;
  },

  // Get agent shifts
  getAgentShifts: async () => {
    const response = await api.get('/agents/shifts');
    return response.data;
  },

  // Get current agent from localStorage
  getCurrentAgent: () => {
    if (typeof window === 'undefined') return null;
    
    const agentData = localStorage.getItem('agentData');
    return agentData ? JSON.parse(agentData) : null;
  },

  // Get auth token
  getToken: () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('agentToken');
  },

  // Check if agent is authenticated
  isAuthenticated: () => {
    if (typeof window === 'undefined') return false;
    
    const token = localStorage.getItem('agentToken');
    if (!token) return false;

    // Basic token expiration check (you can add proper JWT decode)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }
};
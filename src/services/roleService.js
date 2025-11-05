import api from '@/lib/api';

export const roleService = {
  // Get all roles
  getAll: async () => {
    const response = await api.get('/roles');
    return response.data;
  },

  // Get role by ID
  getById: async (id) => {
    const response = await api.get(`/roles/${id}`);
    return response.data;
  },

  // Create role
  create: async (roleData) => {
    const response = await api.post('/roles', roleData);
    return response.data;
  },

  // Update role
  update: async (id, roleData) => {
    const response = await api.put(`/roles/${id}`, roleData);
    return response.data;
  },

  // Delete role
  delete: async (id) => {
    const response = await api.delete(`/roles/${id}`);
    return response.data;
  }
};
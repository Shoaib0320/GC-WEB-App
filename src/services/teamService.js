import api from "../lib/api";

export const teamService = {
  // Get all teams with optional filtering
  getTeams: async (options = {}) => {
    const { isActive, page = 1, limit = 10 } = options;
    
    let query = `?page=${page}&limit=${limit}`;
    if (typeof isActive === 'boolean') {
      query += `&isActive=${isActive}`;
    }
    
    const response = await api.get(`/teams${query}`);
    return response.data;
  },

  // Get single team by ID
  getTeamById: async (teamId) => {
    const response = await api.get(`/teams/${teamId}`);
    return response.data;
  },

  // Create new team member
  createTeam: async (teamData) => {
    const response = await api.post("/teams", teamData);
    return response.data;
  },

  // Update team member
  updateTeam: async (teamId, teamData) => {
    const response = await api.put(`/teams/${teamId}`, teamData);
    return response.data;
  },

  // Delete team member
  deleteTeam: async (teamId) => {
    const response = await api.delete(`/teams/${teamId}`);
    return response.data;
  },

  // Toggle team status (active/inactive)
  toggleStatus: async (teamId, isActive, updatedBy) => {
    const response = await api.patch(`/teams/${teamId}/status`, {
      isActive,
      updatedBy,
    });
    return response.data;
  },

  // Upload team member image
  uploadImage: async (file, folder = 'team-members') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const response = await api.post("/teams/upload", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// import api from '@/lib/api';

// export const adminService = {
//   // 🔹 Users Management
//   users: {
//     // Get all users
//     getAll: async (params = {}) => {
//       const response = await api.get('/users', { params });
//       return response.data;
//     },

//     // Get user by ID
//     getById: async (id) => {
//       const response = await api.get(`/users/${id}`);
//       return response.data;
//     },

//     // Create user
//     create: async (userData) => {
//       const response = await api.post('/users', userData);
//       return response.data;
//     },

//     // Update user
//     update: async (id, userData) => {
//       const response = await api.put(`/users/${id}`, userData);
//       return response.data;
//     },

//     // Delete user
//     delete: async (id) => {
//       const response = await api.delete(`/users/${id}`);
//       return response.data;
//     },

//     // Update user status
//     updateStatus: async (id, isActive) => {
//       const response = await api.patch(`/users/${id}/status`, { isActive });
//       return response.data;
//     }
//   },

//   // 🔹 Agents Management
//   agents: {
//     // Get all agents
//     getAll: async (params = {}) => {
//       const response = await api.get('/agents', { params });
//       return response.data;
//     },

//     // Get agent by ID
//     getById: async (id) => {
//       const response = await api.get(`/agents/${id}`);
//       return response.data;
//     },

//     // Create agent
//     create: async (agentData) => {
//       const response = await api.post('/agents', agentData);
//       return response.data;
//     },

//     // Update agent
//     update: async (id, agentData) => {
//       const response = await api.put(`/agents/${id}`, agentData);
//       return response.data;
//     },

//     // Delete agent
//     delete: async (id) => {
//       const response = await api.delete(`/agents/${id}`);
//       return response.data;
//     },

//     // Update agent status
//     updateStatus: async (id, isActive) => {
//       const response = await api.patch(`/agents/${id}/status`, { isActive });
//       return response.data;
//     }
//   },

//   // 🔹 Shifts Management
//   shifts: {
//     // Get all shifts
//     getAll: async (params = {}) => {
//       const response = await api.get('/shifts', { params });
//       return response.data;
//     },

//     // Get shift by ID
//     getById: async (id) => {
//       const response = await api.get(`/shifts/${id}`);
//       return response.data;
//     },

//     // Create shift
//     create: async (shiftData) => {
//       const response = await api.post('/shifts', shiftData);
//       return response.data;
//     },

//     // Update shift
//     update: async (id, shiftData) => {
//       const response = await api.put(`/shifts/${id}`, shiftData);
//       return response.data;
//     },

//     // Delete shift
//     delete: async (id) => {
//       const response = await api.delete(`/shifts/${id}`);
//       return response.data;
//     },

//     // Get shifts for dropdown
//     getForDropdown: async () => {
//       const response = await api.get('/shifts?limit=100&page=1');
//       return response.data.data || [];
//     }
//   },

//   // 🔹 Attendance Management
//   attendance: {
//     // Get all attendance records
//     getAll: async (params = {}) => {
//       const response = await api.get('/attendance', { params });
//       return response.data;
//     },

//     // Manual attendance entry
//     manualEntry: async (data) => {
//       const response = await api.post('/attendance/admin/manual', data);
//       return response.data;
//     },

//     // Assign leave
//     assignLeave: async (data) => {
//       const response = await api.post('/attendance/admin/leave', data);
//       return response.data;
//     },

//     // Export attendance
//     export: async (params = {}) => {
//       const response = await api.get('/attendance/export', { 
//         params,
//         responseType: 'blob'
//       });
//       return response;
//     }
//   },

//   // 🔹 Leave Requests Management
//   leaveRequests: {
//     // Get all leave requests
//     getAll: async (status = 'all') => {
//       const response = await api.get(`/attendance/leave/admin?status=${status}`);
//       return response.data;
//     },

//     // Update leave request status
//     updateStatus: async (leaveRequestId, data) => {
//       const response = await api.put('/attendance/leave/admin', {
//         leaveRequestId,
//         ...data
//       });
//       return response.data;
//     },

//     // Get leave requests by user/agent
//     getByUser: async (userId, userType = 'user') => {
//       const response = await api.get(`/attendance/leave/request?userType=${userType}`);
//       const allRequests = response.data.data || [];
//       return allRequests.filter(request => 
//         (userType === 'user' && request.user?._id === userId) ||
//         (userType === 'agent' && request.agent?._id === userId)
//       );
//     }
//   },

//   // 🔹 Holidays Management
//   holidays: {
//     // Get all holidays
//     getAll: async (year = new Date().getFullYear()) => {
//       const response = await api.get(`/holidays?year=${year}`);
//       return response.data;
//     },

//     // Create holiday
//     create: async (holidayData) => {
//       const response = await api.post('/holidays', holidayData);
//       return response.data;
//     },

//     // Delete holiday
//     delete: async (id) => {
//       const response = await api.delete(`/holidays?id=${id}`);
//       return response.data;
//     }
//   },

//   // 🔹 Dashboard Stats
//   dashboard: {
//     // Get dashboard statistics
//     getStats: async () => {
//       const response = await api.get('/admin/dashboard');
//       return response.data;
//     }
//   }
// };

// export default adminService;


import api from '@/lib/api';

export const adminService = {
  // Get all users and agents for admin
  getUsersAndAgents: async (type = "all") => {
    const response = await api.get(`/admin/users?type=${type}`);
    return response.data;
  },

  // Get all leave requests for admin
  getLeaveRequests: async (status = "all") => {
    const response = await api.get(`/attendance/leave/requests?status=${status}`);
    return response.data;
  },

  // Update leave request status
  updateLeaveRequest: async (requestId, status, comments = "") => {
    const response = await api.put('/attendance/leave/requests', {
      requestId,
      status,
      comments
    });
    return response.data;
  },

  // Manual attendance entry
  manualAttendance: async (data) => {
    const response = await api.post('/attendance/admin/manual', data);
    return response.data;
  },

  // Assign leave
  assignLeave: async (data) => {
    const response = await api.post('/attendance/admin/leave', data);
    return response.data;
  },
  // Get all attendance records for admin
getAllAttendance: async (params = {}) => {
  const response = await api.get('/attendance', { params });
  return response.data;
},
};
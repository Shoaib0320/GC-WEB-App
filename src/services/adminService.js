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
  updateAttendance: async (data) => {
    const response = await api.put('/attendance/update', data);
    return response.data;
  },

  // Process shift-based auto attendance
  processShiftAutoAttendance: async (date, userType = "all") => {
    const response = await api.post('/attendance/auto-process-shift', { date, userType });
    return response.data;
  }
};
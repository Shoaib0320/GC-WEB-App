import api from '@/lib/api';

export const attendanceService = {
  // Check-in
  checkIn: async (data) => {
    const response = await api.post('/attendance/checkin', data);
    return response.data;
  },

  // Check-out
  checkOut: async (data) => {
    const response = await api.post('/attendance/checkout', data);
    return response.data;
  },

  // Get all attendance records
  getAll: async (params = {}) => {
    const response = await api.get('/attendance', { params });
    return response.data;
  },

  // Get my attendance
  getMyAttendance: async (params = {}) => {
    const response = await api.get('/attendance/my', { params });
    return response.data;
  },

  // Request leave
  requestLeave: async (leaveData) => {
    const response = await api.post('/attendance/leave/request', leaveData);
    return response.data;
  },

  // Get my leave requests
  getMyLeaveRequests: async (userType = 'user') => {
    const response = await api.get(`/attendance/leave/request?userType=${userType}`);
    return response.data;
  },

  // Admin: Get all leave requests
  getAllLeaveRequests: async (status = 'all') => {
    const response = await api.get(`/attendance/leave/admin?status=${status}`);
    return response.data;
  },

  // Admin: Update leave request status
  updateLeaveRequest: async (leaveRequestId, data) => {
    const response = await api.put('/attendance/leave/admin', {
      leaveRequestId,
      ...data
    });
    return response.data;
  },

  // Holiday management
  createHoliday: async (holidayData) => {
    const response = await api.post('/holidays', holidayData);
    return response.data;
  },

  getHolidays: async (year = new Date().getFullYear()) => {
    const response = await api.get(`/holidays?year=${year}`);
    return response.data;
  },

  deleteHoliday: async (id) => {
    const response = await api.delete(`/holidays?id=${id}`);
    return response.data;
  },
    // Auto Absent Processing
  processAutoAttendance: async () => {
    const response = await api.post('/attendance/auto-process');
    return response.data;
  },
    // Update attendance
  updateAttendance: async (data) => {
    const response = await api.put('/attendance/update', data);
    return response.data;
  },

  // Process shift-based auto attendance
  processShiftAutoAttendance: async (date, userType = "all") => {
    const response = await api.post('/attendance/auto-process-shift', { date, userType });
    return response.data;
  },

  // Manual Auto Absent for specific date
  processAutoAttendanceForDate: async (date) => {
    const response = await api.post('/attendance/auto-process', { date });
    return response.data;
  },
    // Check if date is editable (not holiday/weekly off)
  checkDateEditable: async (date) => {
    const response = await api.get(`/attendance/check-editable?date=${date}`);
    return response.data;
  }
};
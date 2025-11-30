// import api from '@/lib/api';

// export const attendanceService = {
//   // Check-in for a shift
//   checkIn: async (checkInData) => {
//     const response = await api.post('/attendance/checkin', checkInData);
//     return response.data;
//   },

//   // Check-out from attendance
//   checkOut: async (checkOutData) => {
//     const response = await api.post('/attendance/checkout', checkOutData);
//     return response.data;
//   },

//   // Get current user's attendance records
//   getMyAttendance: async (params = {}) => {
//     const response = await api.get('/attendance/my', { params });
//     return response.data;
//   },

//   // Get monthly summary for current user
//   getMyMonthlySummary: async (month, year) => {
//     const response = await api.get('/attendance/my', { 
//       params: { month, year } 
//     });
//     return response.data;
//   },

//   // Get all attendance records (for managers/admins)
//   getAllAttendance: async () => {
//     const response = await api.get('/attendance');
//     return response.data;
//   },

//   // Export attendance data
//   exportAttendance: async (month, year) => {
//     const response = await api.get('/attendance/export', {
//       params: { month, year },
//       responseType: 'blob' // Important for file download
//     });
//     return response;
//   },

//   // Get today's check-in status
//   getTodayStatus: async () => {
//     const response = await api.get('/attendance/my?limit=1');
//     if (response.data.success && response.data.data.length > 0) {
//       const today = new Date().toDateString();
//       const todayRecord = response.data.data.find(record => {
//         const recordDate = new Date(record.checkInTime).toDateString();
//         return recordDate === today;
//       });
//       return todayRecord;
//     }
//     return null;
//   },

//   // Update attendance notes
//   updateNotes: async (attendanceId, notes) => {
//     const response = await api.put(`/attendance/${attendanceId}`, { notes });
//     return response.data;
//   },

//   // Get attendance by ID
//   getAttendanceById: async (id) => {
//     const response = await api.get(`/attendance/${id}`);
//     return response.data;
//   }
// };

// export default attendanceService;



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
  processAutoAttendance: async (data = {}) => {
    const response = await api.post('/attendance/auto-process', data);
    return response.data;
  },

  // Manual Auto Absent for specific date
  processAutoAttendanceForDate: async (date) => {
    const response = await api.post('/attendance/auto-process', { date });
    return response.data;
  }
};
// src/services/agentLeaveService.js
import api from '@/lib/api';

export const agentLeaveService = {
  // Submit Leave Request
  async requestLeave(leaveData) {
    try {
      // console.log("📝 Sending Leave Request:", leaveData);
      const response = await api.post('/attendance/leave/request', leaveData);
      console.log("✅ Leave Request Success:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Leave Request Error:", error.response?.data || error.message);
      throw error;
    }
  },

  // Get agent Leave Requests
  async getMyLeaves(agentType = 'agent') {
    try {
      // console.log("📋 Fetching Leave Requests...");
      const response = await api.get(`/attendance/leave/request?agentType=${agentType}`);
      // console.log("✅ Leave Requests Received:", response.data.data?.length || 0);
      return response.data.data || [];
    } catch (error) {
      console.error("❌ Fetch Leaves Error:", error.response?.data || error.message);
      throw error;
    }
  },
};
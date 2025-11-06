// services/agentNotifyService.js
import api from '@/lib/api';

export const agentNotifyService = {
  // Get notifications for specific agent
  getAgentNotifications: async (agentId, params = {}) => {
    const response = await api.get(`/notifications/agent/${agentId}`, { params });
    return response.data;
  },

  // Get my notifications (current logged in agent)
  getMyNotifications: async (params = {}) => {
    const response = await api.get('/notifications/agent/my', { params });
    return response.data;
  },

  // Mark agent notification as read
  markAsRead: async (agentNotificationId) => {
    const response = await api.patch(`/notifications/agent/read/${agentNotificationId}`);
    return response.data;
  },

  // Mark all agent notifications as read
  markAllAsRead: async (agentId) => {
    const response = await api.patch(`/notifications/agent/read-all/${agentId}`);
    return response.data;
  },

  // Get agent notification stats
  getNotificationStats: async (agentId) => {
    const response = await api.get(`/notifications/agent/stats/${agentId}`);
    return response.data;
  },

  // Dismiss agent notification
  dismissNotification: async (agentNotificationId) => {
    const response = await api.patch(`/notifications/agent/dismiss/${agentNotificationId}`);
    return response.data;
  }
};
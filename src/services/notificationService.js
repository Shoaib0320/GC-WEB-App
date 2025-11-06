// services/notificationService.js
import api from '@/lib/api';

export const notificationService = {
  // Create new notification
  createNotification: async (notificationData) => {
    const response = await api.post('/notifications', notificationData);
    return response.data;
  },

  // Get all notifications
  getAllNotifications: async (params = {}) => {
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  // Get notifications for specific user
  getUserNotifications: async (userId, params = {}) => {
    const response = await api.get(`/notifications/user/${userId}`, { params });
    return response.data;
  },

  // Get notifications for specific agent
  getAgentNotifications: async (agentId, params = {}) => {
    const response = await api.get(`/notifications/agent/${agentId}`, { params });
    return response.data;
  },

  // Mark as read
  markAsRead: async (userNotificationId, userId, userType) => {
    const response = await api.patch('/notifications/read', {
      userNotificationId,
      userId, 
      userType
    });
    return response.data;
  },

  // Delete notification
  deleteNotification: async (id) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  }
};
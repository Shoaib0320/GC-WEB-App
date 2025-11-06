// services/userNotifyService.js
import api from '@/lib/api';

export const userNotifyService = {
  // Get notifications for specific user
  getUserNotifications: async (userId, params = {}) => {
    const response = await api.get(`/notifications/user/${userId}`, { params });
    return response.data;
  },

  // Get my notifications (current logged in user)
  getMyNotifications: async (params = {}) => {
    const response = await api.get('/notifications/user/my', { params });
    return response.data;
  },

  // Mark user notification as read
  markAsRead: async (userNotificationId) => {
    const response = await api.patch(`/notifications/user/read/${userNotificationId}`);
    return response.data;
  },

  // Mark all user notifications as read
  markAllAsRead: async (userId) => {
    const response = await api.patch(`/notifications/user/read-all/${userId}`);
    return response.data;
  },

  // Get user notification stats
  getNotificationStats: async (userId) => {
    const response = await api.get(`/notifications/user/stats/${userId}`);
    return response.data;
  },

  // Dismiss user notification
  dismissNotification: async (userNotificationId) => {
    const response = await api.patch(`/notifications/user/dismiss/${userNotificationId}`);
    return response.data;
  }
};
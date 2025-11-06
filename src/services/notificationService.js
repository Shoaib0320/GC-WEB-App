// services/notificationService.js
import api from '@/lib/api';

export const notificationService = {
  // Create new notification
  createNotification: async (notificationData) => {
    const response = await api.post('/notifications', notificationData);
    return response.data;
  },

  // Update notification
  updateNotification: async (id, notificationData) => {
    const response = await api.put(`/notifications/${id}`, notificationData);
    return response.data;
  },

  // Get notification by ID
  getNotification: async (id) => {
    const response = await api.get(`/notifications/${id}`);
    return response.data;
  },

  // Get all notifications (for admin)
  getAllNotifications: async (params = {}) => {
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  // Get my notifications (for users/agents)
  getMyNotifications: async (params = {}) => {
    const response = await api.get('/notifications/my', { params });
    return response.data;
  },

  // Mark as read
  markAsRead: async (notificationId) => {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data;
  },

  // Mark all as read
  markAllAsRead: async () => {
    const response = await api.patch('/notifications/read-all');
    return response.data;
  },

  // Delete notification (admin only)
  deleteNotification: async (id) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },

  // Get notification stats
  getNotificationStats: async () => {
    const response = await api.get('/notifications/stats');
    return response.data;
  },

  // Send immediate notification
  sendImmediateNotification: async (notificationData) => {
    const response = await api.post('/notifications/send-immediate', notificationData);
    return response.data;
  }
};
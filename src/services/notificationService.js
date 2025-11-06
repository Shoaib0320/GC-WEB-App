// services/notificationService.js
import api from '@/lib/api';

export const notificationService = {
  // Create new notification with better error handling
  createNotification: async (notificationData) => {
    try {
      console.log('📨 Creating notification with data:', notificationData);
      
      const response = await api.post('/notifications', notificationData);
      console.log('✅ Notification created successfully:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error creating notification:', error);
      
      // Add more context to the error
      if (error.response?.status === 401) {
        error.message = 'Authentication failed. Please login again.';
      } else if (error.response?.status === 403) {
        error.message = 'You do not have permission to create notifications.';
      } else if (error.response?.data?.error) {
        error.message = error.response.data.error;
      }
      
      throw error;
    }
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
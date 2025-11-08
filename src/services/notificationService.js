// services/notificationService.js
import api from '@/lib/api';

export const notificationService = {
  // GET ALL - Admin ke liye
  getAllNotifications: async () => {
    try {
      const response = await api.get('/notifications');
      return {
        success: true,
        data: response.data,
        message: 'Notifications fetched successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch notifications',
        error: error.response?.data
      };
    }
  },

  // GET User-specific notifications
  getUserNotifications: async () => {
    try {
      const response = await api.get('/notifications/user');
      return {
        success: true,
        data: response.data,
        message: 'User notifications fetched successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch user notifications',
        error: error.response?.data
      };
    }
  },

  // CREATE New Notification
  createNotification: async (notificationData) => {
    try {
      const response = await api.post('/notifications', notificationData);
      return {
        success: true,
        data: response.data,
        message: 'Notification created successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create notification',
        error: error.response?.data
      };
    }
  },

  // UPDATE Notification
  updateNotification: async (id, updateData) => {
    try {
      const response = await api.put(`/notifications/${id}`, updateData);
      return {
        success: true,
        data: response.data,
        message: 'Notification updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update notification',
        error: error.response?.data
      };
    }
  },

  // DELETE Notification
  deleteNotification: async (id) => {
    try {
      const response = await api.delete(`/notifications/${id}`);
      return {
        success: true,
        data: response.data,
        message: 'Notification deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete notification',
        error: error.response?.data
      };
    }
  },

  // MARK AS READ
  markAsRead: async (id) => {
    try {
      const response = await api.patch(`/notifications/${id}/read`);
      return {
        success: true,
        data: response.data,
        message: 'Notification marked as read'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to mark as read',
        error: error.response?.data
      };
    }
  }
};
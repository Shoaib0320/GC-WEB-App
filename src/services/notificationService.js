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

// Additional helper: fetch notifications for a specific agent (no new route required)
// This re-uses the existing GET /notifications and filters client-side by agent id.
// Useful when the backend does not provide a dedicated endpoint but you want
// to fetch notifications relevant to a specific agent.
notificationService.getNotificationsForAgent = async (agentId) => {
  try {
    // Call existing endpoint
    const response = await api.get('/notifications');

    // Normalize different possible response shapes into an array of notifications
    const normalizeArray = (resp) => {
      if (!resp) return [];
      if (Array.isArray(resp)) return resp;
      if (Array.isArray(resp.data)) return resp.data;
      if (Array.isArray(resp.notifications)) return resp.notifications;
      if (Array.isArray(resp.results)) return resp.results;
      // Some APIs wrap the payload under data.data or data.notifications
      if (resp.data && Array.isArray(resp.data.notifications)) return resp.data.notifications;
      return [];
    };

    const all = normalizeArray(response.data || response);

    // Filter notifications that target this specific agent
    const filtered = all.filter((n) => {
      if (!n) return false;
      // if notification targets specific users, check if agentId exists in targetUsers
      if (n.targetType === 'specific' && Array.isArray(n.targetUsers)) {
        // targetUsers may be array of ObjectIds or strings
        return n.targetUsers.some((tid) => String(tid) === String(agentId));
      }
      return false;
    });

    return {
      success: true,
      data: filtered,
      message: 'Notifications for agent fetched successfully'
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch notifications for agent',
      error: error.response?.data
    };
  }
};
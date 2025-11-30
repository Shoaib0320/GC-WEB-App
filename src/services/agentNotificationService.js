import api from '@/lib/api';

export const agentNotificationService = {
    // Generic user notifications (existing)
    async fetchUserNotifications() {
        try {
            const response = await api.get('/notifications'); // Without type=admin
            return response.data || [];
        }
        catch (error) {
            console.error("❌ Fetch User Notifications Error:", error.response?.data || error.message);
            throw error;
        }
    },

    // New: agent-specific fetch (server now supports ?agentId=...)
    // agentIdentifier can be agent _id (24-hex) OR agentId code (SR002)
    async fetchNotificationsForAgent(agentIdentifier) {
        try {
            const response = await api.get(`/notifications?agentId=${encodeURIComponent(agentIdentifier)}`);
            return response.data || [];
        } catch (error) {
            console.error("❌ Fetch Notifications For Agent Error:", error.response?.data || error.message);
            throw error;
        }
    },

    // Mark as read functionality
    async markAsRead(notificationId) {
        try {
            const response = await api.patch(`/notifications/${notificationId}/read`);
            return response.data;
        }
        catch (error) {
            console.error("❌ Mark as read error:", error.response?.data || error.message);
            throw error;
        }
    }
};

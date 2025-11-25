import api from '@/lib/api';

export const agentNotificationService = {
    // ✅ agent-specific notifications ke liye
    async getAgentNotifications(agentId) {
        try {
            const response = await api.get(`/notifications/agent/${agentId}`);
            return response.data || [];
        }
        catch (error) {
            console.error("❌ Fetch agent Notifications Error:", error.response?.data || error.message);
            throw error;
        }
    },

    // ✅ Mark as read functionality
    async markAsRead(notificationId) {
        try {
            const response = await api.patch(`/notifications/${notificationId}/read`);
            return response.data;
        }
        catch (error) {
            console.error("❌ Mark as read error:", error.response?.data || error.message);
            throw error;
        }
    },

    // ✅ Mark all as read functionality
    async markAllAsRead(agentId) {
        try {
            const response = await api.patch(`/notifications/agent/${agentId}/read-all`);
            return response.data;
        }
        catch (error) {
            console.error("❌ Mark all as read error:", error.response?.data || error.message);
            throw error;
        }
    }
};

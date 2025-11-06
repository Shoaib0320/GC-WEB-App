// app/notifications/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { notificationService } from '@/services/notificationService';
import NotificationDialog from '@/components/NotificationDialog';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNotification, setEditingNotification] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
    
    // Listen for notification updates
    const handleNotificationUpdate = () => {
      loadNotifications();
    };
    
    window.addEventListener('notificationUpdated', handleNotificationUpdate);
    return () => window.removeEventListener('notificationUpdated', handleNotificationUpdate);
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getAllNotifications();
      setNotifications(data.notifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (notification) => {
    setEditingNotification(notification);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingNotification(null);
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this notification?')) {
      try {
        await notificationService.deleteNotification(id);
        loadNotifications();
      } catch (error) {
        console.error('Error deleting notification:', error);
      }
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      info: 'blue',
      warning: 'yellow',
      success: 'green',
      error: 'red',
      announcement: 'purple'
    };
    return colors[type] || 'blue';
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'gray',
      scheduled: 'blue',
      active: 'green',
      expired: 'red',
      cancelled: 'orange'
    };
    return colors[status] || 'gray';
  };

  if (loading) {
    return <div>Loading notifications...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Notifications</h1>
        <Button onClick={handleCreate}>
          Create Notification
        </Button>
      </div>

      <div className="grid gap-4">
        {notifications.map(notification => (
          <Card key={notification._id} className="p-4">
            <CardHeader className="p-0 pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{notification.title}</CardTitle>
                  <CardDescription>{notification.message}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge variant={getTypeColor(notification.type)}>
                    {notification.type}
                  </Badge>
                  <Badge variant={getStatusColor(notification.status)}>
                    {notification.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  <div>Recipients: {notification.totalRecipients}</div>
                  <div>Priority: {notification.priority}</div>
                  {notification.expiresAt && (
                    <div>Expires: {new Date(notification.expiresAt).toLocaleString()}</div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(notification)}>
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(notification._id)}>
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <NotificationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        notification={editingNotification}
        users={[]} // Pass actual users data
        agents={[]} // Pass actual agents data
        roles={[]} // Pass actual roles data
      />
    </div>
  );
};

export default NotificationsPage;
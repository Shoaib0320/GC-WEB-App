// components/NotificationDialog.jsx
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { notificationService } from '@/services/notificationService';

const NotificationDialog = ({ open, onOpenChange, notification = null, users = [], agents = [], roles = [] }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
    priority: 'medium',
    recipientType: 'all',
    specificUsers: [],
    specificAgents: [],
    roles: [],
    scheduledAt: '',
    expiresAt: '',
    actionUrl: '',
    actionText: '',
    status: 'draft'
  });

  useEffect(() => {
    if (notification) {
      setFormData({
        title: notification.title || '',
        message: notification.message || '',
        type: notification.type || 'info',
        priority: notification.priority || 'medium',
        recipientType: notification.recipientType || 'all',
        specificUsers: notification.specificUsers || [],
        specificAgents: notification.specificAgents || [],
        roles: notification.roles || [],
        scheduledAt: notification.scheduledAt ? new Date(notification.scheduledAt).toISOString().slice(0, 16) : '',
        expiresAt: notification.expiresAt ? new Date(notification.expiresAt).toISOString().slice(0, 16) : '',
        actionUrl: notification.actionUrl || '',
        actionText: notification.actionText || '',
        status: notification.status || 'draft'
      });
    } else {
      setFormData({
        title: '',
        message: '',
        type: 'info',
        priority: 'medium',
        recipientType: 'all',
        specificUsers: [],
        specificAgents: [],
        roles: [],
        scheduledAt: '',
        expiresAt: '',
        actionUrl: '',
        actionText: '',
        status: 'draft'
      });
    }
  }, [notification]);
//   //
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const submitData = {
//         ...formData,
//         scheduledAt: formData.scheduledAt ? new Date(formData.scheduledAt).toISOString() : null,
//         expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null,
//         specificUsers: formData.specificUsers.map(id => id),
//         specificAgents: formData.specificAgents.map(id => id),
//         roles: formData.roles.map(id => id)
//       };

//       if (notification) {
//         await notificationService.updateNotification(notification._id, submitData);
//       } else {
//         await notificationService.createNotification(submitData);
//       }

//       onOpenChange(false);
//       // Refresh notifications list
//       window.dispatchEvent(new CustomEvent('notificationUpdated'));
//     } catch (error) {
//       console.error('Error saving notification:', error);
//       alert('Error saving notification: ' + error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

// components/NotificationDialog.jsx - Updated submit handler
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    console.log('🔄 Submitting notification form...');
    
    const submitData = {
      ...formData,
      scheduledAt: formData.scheduledAt ? new Date(formData.scheduledAt).toISOString() : null,
      expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null,
      specificUsers: formData.specificUsers.map(id => id),
      specificAgents: formData.specificAgents.map(id => id),
      roles: formData.roles.map(id => id)
    };

    console.log('📤 Sending notification data:', submitData);

    let result;
    if (notification) {
      result = await notificationService.updateNotification(notification._id, submitData);
    } else {
      result = await notificationService.createNotification(submitData);
    }

    console.log('✅ Notification saved successfully:', result);

    onOpenChange(false);
    
    // Show success message
    alert(notification ? 'Notification updated successfully!' : 'Notification created successfully!');
    
    // Refresh notifications list
    window.dispatchEvent(new CustomEvent('notificationUpdated'));
    
  } catch (error) {
    console.error('❌ Error saving notification:', error);
    
    // Show user-friendly error message
    const errorMessage = error.userMessage || error.message || 'Failed to save notification. Please try again.';
    alert(`Error: ${errorMessage}`);
    
  } finally {
    setLoading(false);
  }
};

  const handleArrayChange = (field, value, checked) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value)
    }));
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {notification ? 'Edit Notification' : 'Create New Notification'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter notification title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">
                      <Badge variant="blue">Info</Badge>
                    </SelectItem>
                    <SelectItem value="warning">
                      <Badge variant="yellow">Warning</Badge>
                    </SelectItem>
                    <SelectItem value="success">
                      <Badge variant="green">Success</Badge>
                    </SelectItem>
                    <SelectItem value="error">
                      <Badge variant="red">Error</Badge>
                    </SelectItem>
                    <SelectItem value="announcement">
                      <Badge variant="purple">Announcement</Badge>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Enter notification message"
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Recipient Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Recipient Settings</h3>
            
            <div className="space-y-2">
              <Label htmlFor="recipientType">Send To</Label>
              <Select value={formData.recipientType} onValueChange={(value) => setFormData(prev => ({ ...prev, recipientType: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users & Agents</SelectItem>
                  <SelectItem value="specific_users">Specific Users</SelectItem>
                  <SelectItem value="specific_agents">Specific Agents</SelectItem>
                  <SelectItem value="role_based">Role Based</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.recipientType === 'specific_users' && (
              <div className="space-y-2">
                <Label>Select Users</Label>
                <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-2">
                  {users.map(user => (
                    <div key={user._id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`user-${user._id}`}
                        checked={formData.specificUsers.includes(user._id)}
                        onChange={(e) => handleArrayChange('specificUsers', user._id, e.target.checked)}
                      />
                      <label htmlFor={`user-${user._id}`} className="text-sm">
                        {user.firstName} {user.lastName} ({user.email})
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {formData.recipientType === 'specific_agents' && (
              <div className="space-y-2">
                <Label>Select Agents</Label>
                <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-2">
                  {agents.map(agent => (
                    <div key={agent._id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`agent-${agent._id}`}
                        checked={formData.specificAgents.includes(agent._id)}
                        onChange={(e) => handleArrayChange('specificAgents', agent._id, e.target.checked)}
                      />
                      <label htmlFor={`agent-${agent._id}`} className="text-sm">
                        {agent.agentName} ({agent.email})
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {formData.recipientType === 'role_based' && (
              <div className="space-y-2">
                <Label>Select Roles</Label>
                <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-2">
                  {roles.map(role => (
                    <div key={role._id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`role-${role._id}`}
                        checked={formData.roles.includes(role._id)}
                        onChange={(e) => handleArrayChange('roles', role._id, e.target.checked)}
                      />
                      <label htmlFor={`role-${role._id}`} className="text-sm">
                        {role.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Schedule & Action */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Schedule & Action</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scheduledAt">Scheduled Date & Time</Label>
                <Input
                  id="scheduledAt"
                  type="datetime-local"
                  value={formData.scheduledAt}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduledAt: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiresAt">Expiry Date & Time</Label>
                <Input
                  id="expiresAt"
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="actionUrl">Action URL</Label>
                <Input
                  id="actionUrl"
                  value={formData.actionUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, actionUrl: e.target.value }))}
                  placeholder="https://example.com/action"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="actionText">Action Text</Label>
                <Input
                  id="actionText"
                  value={formData.actionText}
                  onChange={(e) => setFormData(prev => ({ ...prev, actionText: e.target.value }))}
                  placeholder="View Details"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (notification ? 'Update' : 'Create')} Notification
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationDialog;
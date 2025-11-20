// app/notifications/admin/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { notificationService } from "@/services/notificationService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Plus, Edit, Trash2, Bell } from "lucide-react";

export default function NotificationsAdminPage() {
  const { user, hasPermission } = useAuth();

  // States
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotification, setEditingNotification] = useState(null);

  // Form States
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    targetType: "all",
    targetUsers: "",
    type: "announcement"
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch notifications on component mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Fetch all notifications
  const fetchNotifications = async () => {
    setLoading(true);
    setError("");

    const result = await notificationService.getAllNotifications();

    if (result.success) {
      setNotifications(result.data);
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: "",
      message: "",
      targetType: "all",
      targetUsers: "",
      type: "announcement"
    });
    setEditingNotification(null);
  };

  // Open modal for create/edit
  const openModal = (notification = null) => {
    if (notification) {
      // Edit mode
      setEditingNotification(notification);
      setFormData({
        title: notification.title,
        message: notification.message,
        targetType: notification.targetType,
        targetUsers: notification.targetUsers?.join(", ") || "",
        type: notification.type
      });
    } else {
      // Create mode
      resetForm();
    }
    setIsModalOpen(true);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      // Prepare data
      const submitData = {
        ...formData,
        targetUsers: formData.targetType === "specific"
          ? formData.targetUsers.split(',').map(id => id.trim()).filter(id => id)
          : []
      };

      let result;

      if (editingNotification) {
        // Update existing notification
        result = await notificationService.updateNotification(
          editingNotification._id,
          submitData
        );
      } else {
        // Create new notification
        result = await notificationService.createNotification(submitData);
      }

      if (result.success) {
        setSuccess(result.message);
        resetForm();
        setIsModalOpen(false);
        fetchNotifications(); // Refresh list

        // Auto clear success message
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete notification
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this notification?")) {
      return;
    }

    setError("");
    const result = await notificationService.deleteNotification(id);

    if (result.success) {
      setSuccess("Notification deleted successfully");
      fetchNotifications(); // Refresh list
      setTimeout(() => setSuccess(""), 3000);
    } else {
      setError(result.message);
    }
  };

  // // Check admin permissions
  // if (!hasPermission("notifications", "create")) {
  //   return (
  //     <div className="container mx-auto p-6">
  //       <Alert variant="destructive">
  //         <AlertDescription>
  //           You don't have permission to access notifications management.
  //         </AlertDescription>
  //       </Alert>
  //     </div>
  //   );
  // }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications Management</h1>
          <p className="text-muted-foreground">
            Create and manage system notifications
          </p>
        </div>
        <Button onClick={() => openModal()} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Notification
        </Button>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert variant="default" className="bg-green-50 border-green-200">
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Notifications Table */}
      {/* <Card>
        <CardHeader>
          <CardTitle>All Notifications</CardTitle>
          <CardDescription>
            History of all sent notifications in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No notifications found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications.map((notification) => (
                  <TableRow key={notification._id}>
                    <TableCell className="font-medium">{notification.title}</TableCell>
                    <TableCell className="max-w-md truncate">
                      {notification.message}
                    </TableCell>
                    <TableCell>
                      <Badge variant={notification.targetType === "all" ? "default" : "secondary"}>
                        {notification.targetType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {notification.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openModal(notification)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(notification._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card> */}

<Card>
  <CardHeader>
    <CardTitle>All Notifications</CardTitle>
    <CardDescription>
      History of all sent notifications in the system
    </CardDescription>
  </CardHeader>
  <CardContent>
    {loading ? (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    ) : notifications.length === 0 ? (
      <div className="text-center py-8 text-muted-foreground">
        <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No notifications found</p>
      </div>
    ) : (
      <div className="relative">
        {/* Horizontal scroll container */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">Title</TableHead>
                <TableHead className="whitespace-nowrap">Message</TableHead>
                <TableHead className="whitespace-nowrap">Target</TableHead>
                <TableHead className="whitespace-nowrap">Type</TableHead>
                <TableHead className="whitespace-nowrap">Created</TableHead>
                <TableHead className="whitespace-nowrap">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notifications.map((notification) => (
                <TableRow key={notification._id}>
                  <TableCell className="font-medium whitespace-nowrap">
                    {notification.title}
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate" title={notification.message}>
                      {notification.message}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Badge variant={notification.targetType === "all" ? "default" : "secondary"}>
                      {notification.targetType}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Badge variant="outline">
                      {notification.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openModal(notification)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(notification._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    )}
  </CardContent>
</Card>

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingNotification ? "Edit Notification" : "Create New Notification"}
            </DialogTitle>
            <DialogDescription>
              {editingNotification
                ? "Update the notification details below."
                : "Fill in the details to create a new notification."
              }
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Enter notification title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => handleInputChange("message", e.target.value)}
                placeholder="Enter notification message"
                required
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleInputChange("type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="announcement">Announcement</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* <div className="space-y-2">
              <Label htmlFor="targetType">Target Audience</Label>
              <Select
                value={formData.targetType}
                onValueChange={(value) => handleInputChange("targetType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select target" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="specific">Specific Users</SelectItem>
                </SelectContent>
              </Select>
            </div> */}

            {formData.targetType === "specific" && (
              <div className="space-y-2">
                <Label htmlFor="targetUsers">User IDs</Label>
                <Input
                  id="targetUsers"
                  value={formData.targetUsers}
                  onChange={(e) => handleInputChange("targetUsers", e.target.value)}
                  placeholder="Enter user IDs separated by commas (e.g., 123, 456, 789)"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Enter specific user IDs separated by commas
                </p>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {editingNotification ? "Update Notification" : "Create Notification"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}







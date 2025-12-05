// src/app/(dashboard)/dashboard/notifications/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { notificationService } from "@/services/notificationService";
import { agentService } from "@/services/agentService";
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
import { toast } from "sonner";

export default function NotificationsAdminPage() {
  const { user, hasPermission } = useAuth();

  // Permission flags for notifications module
  const canView = hasPermission?.("notification", "view");
  const canCreate = hasPermission?.("notification", "create");
  const canEdit = hasPermission?.("notification", "edit");
  const canDelete = hasPermission?.("notification", "delete");

  // States
  const [notifications, setNotifications] = useState([]);
  const [agents, setAgents] = useState([]);
  const [viewAgent, setViewAgent] = useState('all');
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
    fetchAgents();
  }, []);

  // Fetch all notifications
  const fetchNotifications = async (agentId = null) => {
    setLoading(true);
    setError("");

    let result;
    if (agentId && agentId !== 'all') {
      // Use helper which reuses existing /notifications route and filters client-side
      result = await notificationService.getNotificationsForAgent(agentId);
    } else {
      result = await notificationService.getAllNotifications();
    }

    if (result.success) {
      setNotifications(result.data);
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  const fetchAgents = async () => {
    try {
      const res = await agentService.getAllAgents();
      // agentService returns raw data (response.data), ensure array
      console.log('Agent Response', res);

      setAgents(res.agents);
    } catch (err) {
      console.error('Failed to fetch agents', err);
    }
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
        // set single selected agent id if exists
        targetUsers: (notification.targetUsers && notification.targetUsers.length > 0) ? String(notification.targetUsers[0]) : "",
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
      // Prepare data - ensure targetUsers is an array when specific
      const submitData = {
        ...formData,
        targetUsers: formData.targetType === "specific"
          ? (Array.isArray(formData.targetUsers) ? formData.targetUsers : (formData.targetUsers ? [formData.targetUsers] : []))
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
        toast.success(editingNotification ? "Notification updated successfully" : "Notification created successfully");
        setSuccess(result.message);
        resetForm();
        setIsModalOpen(false);
        // Refresh list - respect current viewAgent filter
        fetchNotifications(viewAgent === 'all' ? null : viewAgent);

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
      toast.success("Notification deleted successfully");
      setSuccess("Notification deleted successfully");
      fetchNotifications(viewAgent === 'all' ? null : viewAgent); // Refresh list
      setTimeout(() => setSuccess(""), 3000);
    } else {
      setError(result.message);
    }
  };

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

        <div className="flex items-center gap-4">
          {/* Agent filter for viewing notifications */}
          <div className="w-56">
            <Label htmlFor="viewAgent" className="sr-only">Filter by agent</Label>
            <Select
              value={viewAgent}
              onValueChange={(val) => {
                setViewAgent(val);
                fetchNotifications(val === 'all' ? null : val);
              }}
            >
              <SelectTrigger id="viewAgent">
                <SelectValue placeholder="View: All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Notifications</SelectItem>
                {agents.map((a) => (
                  <SelectItem key={a._id || a.id} value={a._id || a.id}>
                    {a.agentName || a.name || a.agentId || a.email || a._id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Only show Create button if user has create permission */}
          {canCreate && (
            <Button onClick={() => openModal()} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Notification
            </Button>
          )}
        </div>
      </div>

      {/* Alerts */}
      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
      {success && <Alert variant="default" className="bg-green-50 border-green-200"><AlertDescription className="text-green-800">{success}</AlertDescription></Alert>}

      {/* Notifications Table */}
      <Card className="rounded-lg shadow-md">
        <CardHeader>
          <CardTitle>All Notifications</CardTitle>
          <CardDescription>History of all sent notifications in the system</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !canView ? (
            // If user cannot view notifications but may have other permissions (e.g., create)
            <div className="text-center py-8 text-muted-foreground">
              <p>You don't have permission to view notifications.</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No notifications found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-[600px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">Title</TableHead>
                    <TableHead className="whitespace-nowrap">Message</TableHead>
                    <TableHead className="whitespace-nowrap">Target</TableHead>
                    <TableHead className="whitespace-nowrap">Type</TableHead>
                    <TableHead className="whitespace-nowrap">Created</TableHead>
                    {/* Only show Actions header when edit/delete available */}
                    {(canEdit || canDelete) && (
                      <TableHead className="whitespace-nowrap">Actions</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notifications.map((n) => (
                    <TableRow key={n._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                      <TableCell className="font-medium whitespace-nowrap">{n.title}</TableCell>
                      <TableCell className="max-w-xs truncate" title={n.message}>{n.message}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge variant={n.targetType === "all" ? "default" : "secondary"}>{n.targetType}</Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge variant="outline">{n.type}</Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{new Date(n.createdAt).toLocaleDateString()}</TableCell>
                      {/* Actions cell: only render if edit/delete permissions exist */}
                      {(canEdit || canDelete) && (
                        <TableCell className="whitespace-nowrap">
                          <div className="flex gap-2 flex-wrap">
                            {canEdit && (
                              <Button variant="outline" size="sm" onClick={() => openModal(n)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}

                            {canDelete && (
                              <Button variant="outline" size="sm" onClick={() => handleDelete(n._id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md w-full">
          <DialogHeader>
            <DialogTitle>{editingNotification ? "Edit Notification" : "Create New Notification"}</DialogTitle>
            <DialogDescription>{editingNotification ? "Update the notification details below." : "Fill in the details to create a new notification."}</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={formData.title} onChange={(e) => handleInputChange("title", e.target.value)} placeholder="Enter notification title" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" value={formData.message} onChange={(e) => handleInputChange("message", e.target.value)} placeholder="Enter notification message" required rows={4} />
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

            <div className="space-y-2">
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
                  <SelectItem value="specific">Specific Agent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* {formData.targetType === "specific" && (
              <div className="space-y-2">
                <Label htmlFor="targetUsers">Select Agent</Label>
                <Select
                  value={formData.targetUsers}
                  onValueChange={(val) => handleInputChange('targetUsers', val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {agents.map((a) => (
                      <SelectItem key={a._id || a.id} value={a._id || a.id}>
                        {a.agentName}-({a.agentId})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Choose which agent should receive this notification
                </p>
              </div>
            )} */}

{formData.targetType === "specific" && (
  <div className="space-y-2">
    <Label htmlFor="targetUsers">Select Agent</Label>
    <Select
      value={formData.targetUsers}
      onValueChange={(val) => handleInputChange('targetUsers', val)}
    >
      <SelectTrigger>
        <SelectValue placeholder="Choose agent" />
      </SelectTrigger>
      <SelectContent className="max-h-72 overflow-y-auto">
        <div className="px-2 py-1.5 text-xs text-muted-foreground border-b mb-1">
          {agents.length} agents available
        </div>
        {agents.map((a) => (
          <SelectItem 
            key={a._id || a.id} 
            value={a._id || a.id}
            className="py-2.5"
          >
            <div className="flex flex-col">
              <span className="font-medium">{a.agentName}</span>
              <span className="text-xs text-muted-foreground">
                ID: {a.agentId} | {a.designation || 'Agent'}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    <p className="text-sm text-muted-foreground">
      Choose which agent should receive this notification
    </p>
  </div>
)}
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={submitting}>Cancel</Button>
              <Button type="submit" disabled={submitting} className="flex items-center justify-center gap-2">
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingNotification ? "Update Notification" : "Create Notification"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>

  );
}

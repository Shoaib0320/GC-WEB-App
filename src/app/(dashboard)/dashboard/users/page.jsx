"use client";

import { useState, useEffect } from "react";
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button.jsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.jsx";
import { Alert, AlertDescription } from "@/components/ui/alert.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";
import { User, Shield, CheckSquare, Square, Plus, Trash2, Power, Edit, X } from "lucide-react";
import GlobalData from "@/components/common/GlobalData";
import { userService } from '@/services/userService';
import { roleService } from '@/services/roleService';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Users() {
  const { user, hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Users state
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);

  // Dialog states
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);

  // User form state
  const [userForm, setUserForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    department: '',
    position: '',
    employeeId: '',
    role: ''
  });

  // Edit user state
  const [editingUser, setEditingUser] = useState(null);

  // Role form state
  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    permissions: {
      user: { view: false, create: false, edit: false, delete: false, export: false, approve: false, change_role: false },
      category: { view: false, create: false, edit: false, delete: false, export: false, approve: false },
      product: { view: false, create: false, edit: false, delete: false, export: false, approve: false },
      order: { view: false, create: false, edit: false, delete: false, export: false, approve: false, update_status: false },
      inventory: { view: false, create: false, edit: false, delete: false, export: false, approve: false },
      analytics: { view: false, export: false },
      settings: { view: false, edit: false, manage_roles: false },
      hr: { view: false, create: false, edit: false, delete: false, payroll: false, attendance: false, leave_approve: false },
      finance: { view: false, create: false, edit: false, delete: false, approve_payments: false, export_reports: false },
      crm: {
        clients: { view: false, create: false, edit: false, delete: false, export: false, approve: false },
        leads: { view: false, create: false, edit: false, delete: false, export: false, approve: false },
        tickets: { view: false, create: false, edit: false, delete: false, export: false, approve: false }
      },
      website_bookings: { view: false, edit: false, manage_status: false, export: false, delete: false },
      reports: { sales: false, finance: false, hr: false, performance: false, export_all: false },
      progress: { view_own: false, view_all: false, export: false }
    }
  });

  // Load users and roles
  useEffect(() => {
    loadUsers();
    loadRoles();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
            console.log('User Data', data);
      if (data.success) {
        setUsers(data.data.users || []);
      }
    } catch (error) {
      showMessage('error', 'Failed to load users');
    }
  };

  const loadRoles = async () => {
    try {
      const response = await fetch('/api/roles');
      const data = await response.json();
      if (data.success) {
        setRoles(data.data || []);
      }
    } catch (error) {
      showMessage('error', 'Failed to load roles');
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  // User form handlers
  const handleUserFormChange = (e) => {
    const { name, value } = e.target;
    setUserForm(prev => ({ ...prev, [name]: value }));
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate role selection
      if (!userForm.role) {
        showMessage('error', 'Please select a role');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userForm),
      });

      const data = await response.json();

      console.log('User Data', data);
      

      if (data.success) {
        showMessage('success', 'User created successfully');
        resetUserForm();
        setUserDialogOpen(false);
        loadUsers();
      } else {
        showMessage('error', data.error || 'Failed to create user');
      }
    } catch (error) {
      showMessage('error', 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  // Edit user handlers
  const handleEditUser = (user) => {
    setEditingUser(user);
    setUserForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: '', // Don't fill password for editing
      phone: user.phone || '',
      department: user.department || '',
      position: user.position || '',
      employeeId: user.employeeId || '',
      role: user.role?._id || user.role || ''
    });
    setUserDialogOpen(true);
  };

  const handleEditUserSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/users/${editingUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userForm),
      });

      const data = await response.json();

      if (data.success) {
        showMessage('success', 'User updated successfully');
        resetUserForm();
        setUserDialogOpen(false);
        loadUsers();
      } else {
        showMessage('error', data.error || 'Failed to update user');
      }
    } catch (error) {
      showMessage('error', 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const resetUserForm = () => {
    setUserForm({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: '',
      department: '',
      position: '',
      employeeId: '',
      role: ''
    });
    setEditingUser(null);
  };

  const openUserDialog = () => {
    resetUserForm();
    setUserDialogOpen(true);
  };

  const closeUserDialog = () => {
    setUserDialogOpen(false);
    resetUserForm();
  };

  // Role form handlers
  const handleRoleFormChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith('permissions.')) {
      const [, module, action] = name.split('.');
      setRoleForm(prev => ({
        ...prev,
        permissions: {
          ...prev.permissions,
          [module]: {
            ...prev.permissions[module],
            [action]: type === 'checkbox' ? checked : value
          }
        }
      }));
    } else {
      setRoleForm(prev => ({ ...prev, [name]: value }));
    }
  };

  // Select all permissions for a module
  const handleSelectAll = (module) => {
    setRoleForm(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [module]: Object.keys(prev.permissions[module]).reduce((acc, action) => {
          acc[action] = true;
          return acc;
        }, {})
      }
    }));
  };

  // Deselect all permissions for a module
  const handleDeselectAll = (module) => {
    setRoleForm(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [module]: Object.keys(prev.permissions[module]).reduce((acc, action) => {
          acc[action] = false;
          return acc;
        }, {})
      }
    }));
  };

  const handleRoleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(roleForm),
      });

      const data = await response.json();

      if (data.success) {
        showMessage('success', 'Role created successfully');
        resetRoleForm();
        setRoleDialogOpen(false);
        loadRoles();
      } else {
        showMessage('error', data.error || 'Failed to create role');
      }
    } catch (error) {
      showMessage('error', 'Failed to create role');
    } finally {
      setLoading(false);
    }
  };

  const resetRoleForm = () => {
    setRoleForm({
      name: '',
      description: '',
      permissions: {
        user: { view: false, create: false, edit: false, delete: false, export: false, approve: false, change_role: false },
        category: { view: false, create: false, edit: false, delete: false, export: false, approve: false },
        product: { view: false, create: false, edit: false, delete: false, export: false, approve: false },
        order: { view: false, create: false, edit: false, delete: false, export: false, approve: false, update_status: false },
        inventory: { view: false, create: false, edit: false, delete: false, export: false, approve: false },
        analytics: { view: false, export: false },
        settings: { view: false, edit: false, manage_roles: false },
        hr: { view: false, create: false, edit: false, delete: false, payroll: false, attendance: false, leave_approve: false },
        finance: { view: false, create: false, edit: false, delete: false, approve_payments: false, export_reports: false },
        crm: {
          clients: { view: false, create: false, edit: false, delete: false, export: false, approve: false },
          leads: { view: false, create: false, edit: false, delete: false, export: false, approve: false },
          tickets: { view: false, create: false, edit: false, delete: false, export: false, approve: false }
        },
        website_bookings: { view: false, edit: false, manage_status: false, export: false, delete: false },
        reports: { sales: false, finance: false, hr: false, performance: false, export_all: false },
        progress: { view_own: false, view_all: false, export: false }
      }
    });
  };

  const openRoleDialog = () => {
    resetRoleForm();
    setRoleDialogOpen(true);
  };

  const closeRoleDialog = () => {
    setRoleDialogOpen(false);
    resetRoleForm();
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        showMessage('success', 'User deleted successfully');
        loadUsers();
      } else {
        showMessage('error', data.error || 'Failed to delete user');
      }
    } catch (error) {
      showMessage('error', 'Failed to delete user');
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      const data = await response.json();

      if (data.success) {
        showMessage('success', `User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
        loadUsers();
      } else {
        showMessage('error', data.error || 'Failed to update user status');
      }
    } catch (error) {
      showMessage('error', 'Failed to update user status');
    }
  };

  // Permission module configuration
  const permissionModules = [
    {
      name: 'user',
      title: 'User Management',
      description: 'Manage system users and their roles',
      permissions: ['view', 'create', 'edit', 'delete', 'export', 'approve', 'change_role']
    },
    {
      name: 'category',
      title: 'Category Management',
      description: 'Manage product categories',
      permissions: ['view', 'create', 'edit', 'delete', 'export', 'approve']
    },
    {
      name: 'product',
      title: 'Product Management',
      description: 'Manage products and inventory',
      permissions: ['view', 'create', 'edit', 'delete', 'export', 'approve']
    },
    {
      name: 'order',
      title: 'Order Management',
      description: 'Manage customer orders',
      permissions: ['view', 'create', 'edit', 'delete', 'export', 'approve', 'update_status']
    },
    {
      name: 'inventory',
      title: 'Inventory Management',
      description: 'Manage stock and inventory',
      permissions: ['view', 'create', 'edit', 'delete', 'export', 'approve']
    },
    {
      name: 'analytics',
      title: 'Analytics',
      description: 'View and export reports',
      permissions: ['view', 'export']
    },
    {
      name: 'settings',
      title: 'System Settings',
      description: 'Manage system configuration',
      permissions: ['view', 'edit', 'manage_roles']
    },
    {
      name: 'hr',
      title: 'HR Management',
      description: 'Manage human resources',
      permissions: ['view', 'create', 'edit', 'delete', 'payroll', 'attendance', 'leave_approve']
    },
    {
      name: 'finance',
      title: 'Finance Management',
      description: 'Manage financial operations',
      permissions: ['view', 'create', 'edit', 'delete', 'approve_payments', 'export_reports']
    },
    {
      name: 'crm',
      title: 'CRM Module',
      description: 'Manage customer relationships',
      permissions: ['clients', 'leads', 'tickets']
    },
    {
      name: 'website_bookings',
      title: 'Website Bookings',
      description: 'Manage website booking requests',
      permissions: ['view', 'edit', 'manage_status', 'export', 'delete']
    },
    {
      name: 'reports',
      title: 'Reports',
      description: 'Access various reports',
      permissions: ['sales', 'finance', 'hr', 'performance', 'export_all']
    },
    {
      name: 'progress',
      title: 'Progress Tracking',
      description: 'Track agent and employee progress',
      permissions: ['view_own', 'view_all', 'export']
    }
  ];

  // Columns for GlobalData / DataTable
  const userColumns = [
    {
      label: 'Name',
      key: 'name',
      render: (u) => (
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
              <span className="text-white font-semibold text-sm">{u.firstName?.charAt(0)}{u.lastName?.charAt(0)}</span>
            </div>
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">{u.firstName} {u.lastName}</div>
            <div className="text-xs text-gray-500">{u.department} {u.position ? `• ${u.position}` : ''}</div>
          </div>
        </div>
      ),
    },
    { label: 'Email', key: 'email', render: (u) => <div className="text-sm text-gray-700">{u.email}</div> },
    { label: 'Role', key: 'role', render: (u) => <span className="capitalize text-sm">{u.role?.name}</span> },
    { label: 'Status', key: 'status', render: (u) => (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${u.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
        {u.isActive ? 'Active' : 'Inactive'}
      </span>
    ) },
    {
      label: 'Actions',
      key: 'actions',
      align: 'right',
      render: (u) => (
        <div className="flex items-center justify-end gap-2">
          <button onClick={() => handleEditUser(u)} className="inline-flex items-center px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors border border-blue-200">
            <Edit className="h-4 w-4 mr-1" /> Edit
          </button>
          <button onClick={() => handleToggleUserStatus(u._id, u.isActive)} className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${u.isActive ? 'bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200' : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'}`}>
            <Power className="h-4 w-4 mr-1" /> {u.isActive ? 'Deactivate' : 'Activate'}
          </button>
          {hasPermission('user', 'delete') && (
            <button onClick={() => handleDeleteUser(u._id)} className="inline-flex items-center px-3 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors border border-red-200">
              <Trash2 className="h-4 w-4 mr-1" /> Delete
            </button>
          )}
        </div>
      ),
    },
  ];

  const roleColumns = [
    { label: 'Role', key: 'name', render: (r) => <div className="text-sm font-semibold capitalize">{r.name.replace(/_/g, ' ')}</div> },
    { label: 'Description', key: 'description', render: (r) => <div className="text-sm text-gray-600">{r.description}</div> },
    { label: 'Status', key: 'isActive', render: (r) => (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${r.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
        {r.isActive ? 'Active' : 'Inactive'}
      </span>
    ) },
  ];

  return (
    <div className="min-h-scree bg-white p-4 md:p-6">
      <div className="max-w-7xl overflow-auto mx-auto space-y-6">
        {/* Header Card */}
        <Card className="shadow-lg border-0 bg-white text-black">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <User className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Users & Roles Management</CardTitle>
                <CardDescription className="text-black">
                  Manage users and roles for the admin panel with granular permissions
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Main Content */}
        <Card className="shadow-xl border-0 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b bg-slate-50/50">
              <div className="px-6">
                <TabsList className="grid w-full grid-cols-2 bg-slate-100 p-1 rounded-lg">
                  <TabsTrigger
                    value="users"
                    className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all"
                  >
                    <User className="h-4 w-4" />
                    Users Management
                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">
                      {users.length}
                    </span>
                  </TabsTrigger>
                  {hasPermission('user', 'create') && (
                    <TabsTrigger
                      value="roles"
                      className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all"
                    >
                      <Shield className="h-4 w-4" />
                      Roles & Permissions
                      <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs font-medium">
                        {roles.length}
                      </span>
                    </TabsTrigger>
                  )}
                </TabsList>
              </div>
            </div>

            {/* Message Alert */}
            {message.text && (
              <div className="mx-6 mt-6">
                <Alert
                  variant={message.type === 'success' ? 'default' : 'destructive'}
                  className={message.type === 'success' ? 'bg-green-50 border-green-200' : ''}
                >
                  <AlertDescription className={message.type === 'success' ? 'text-green-800' : ''}>
                    {message.text}
                  </AlertDescription>
                </Alert>
              </div>
            )}

            <div className="p-6">
              {/* Users Tab */}
              {activeTab === 'users' && (
                <div className="space-y-8">
                  {/* Users List Header with Add Button */}
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-4 border-b bg-white/50">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-xl font-semibold text-gray-900">All Users</CardTitle>
                          <CardDescription>
                            Manage existing users and their account status
                          </CardDescription>
                        </div>
                        <Button
                          onClick={openUserDialog}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors shadow-sm flex items-center gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Add User
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <GlobalData
                        title="All Users"
                        icon={User}
                        // unwrap API response which returns { success, data: { pagination, users } }
                        fetcher={async (params) => {
                          const res = await userService.getAll(params);
                          // If API uses res.data.users and res.data.pagination
                          const users = res?.data?.users ?? res?.users ?? [];
                          const pagination = res?.data?.pagination ?? res?.pagination ?? null;
                          if (pagination) {
                            return { data: users, meta: pagination };
                          }
                          // fallback: return array directly
                          return users;
                        }}
                        columns={userColumns}
                        serverSide={true}
                        rowsPerPage={10}
                        searchEnabled={true}
                        onDataFetched={(items, meta) => setUsers(items)}
                      />
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Roles Tab */}
              {activeTab === 'roles' && hasPermission('user', 'create') && (
                <div className="space-y-8">
                  {/* Roles List Header with Add Button */}
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-4 border-b bg-white/50">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-xl font-semibold text-gray-900">All Roles</CardTitle>
                          <CardDescription>
                            Overview of existing roles and their permissions
                          </CardDescription>
                        </div>
                        <Button
                          onClick={openRoleDialog}
                          className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors shadow-sm flex items-center gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Add Role
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <GlobalData
                        title="All Roles"
                        icon={Shield}
                        fetcher={async (params) => await roleService.getAll(params)}
                        columns={roleColumns}
                        serverSide={true}
                        rowsPerPage={12}
                        searchEnabled={true}
                        onDataFetched={(items, meta) => setRoles(items)}
                      />
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </Tabs>
        </Card>
      </div>

      {/* User Dialog */}
      <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              {editingUser ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              {editingUser ? 'Edit User' : 'Create New User'}
            </DialogTitle>
            <DialogDescription>
              {editingUser ? 'Update user information' : 'Add a new user to the system with appropriate role and permissions'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={editingUser ? handleEditUserSubmit : handleUserSubmit} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                First Name *
              </Label>
              <Input
                type="text"
                name="firstName"
                id="firstName"
                required
                value={userForm.firstName}
                onChange={handleUserFormChange}
                className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter first name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                Last Name *
              </Label>
              <Input
                type="text"
                name="lastName"
                id="lastName"
                required
                value={userForm.lastName}
                onChange={handleUserFormChange}
                className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter last name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email *
              </Label>
              <Input
                type="email"
                name="email"
                id="email"
                required
                value={userForm.email}
                onChange={handleUserFormChange}
                className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter email address"
                disabled={editingUser}
              />
            </div>

            {!editingUser && (
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password *
                </Label>
                <Input
                  type="password"
                  name="password"
                  id="password"
                  required
                  minLength="6"
                  value={userForm.password}
                  onChange={handleUserFormChange}
                  className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter password"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                Phone Number
              </Label>
              <Input
                type="text"
                name="phone"
                id="phone"
                value={userForm.phone}
                onChange={handleUserFormChange}
                className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter phone number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm font-medium text-gray-700">
                Role *
              </Label>
              <Select 
                value={userForm.role} 
                onValueChange={(value) => setUserForm(prev => ({ ...prev, role: value }))}
              >
                <SelectTrigger className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Available Roles</SelectLabel>
                    {roles.map((role) => (
                      <SelectItem
                        key={role._id}
                        value={role._id}
                        disabled={!role.isActive}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="capitalize">
                            {role.name.replace(/_/g, ' ')}
                          </span>
                          {!role.isActive && (
                            <span className="text-xs text-red-500 ml-2">(Inactive)</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="sm:col-span-2 lg:col-span-3 pt-4 flex gap-3 justify-end border-t">
              <Button
                type="button"
                variant="outline"
                onClick={closeUserDialog}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2.5 px-6 rounded-lg transition-colors"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed shadow-sm"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {editingUser ? 'Updating User...' : 'Creating User...'}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {editingUser ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    {editingUser ? 'Update User' : 'Create User'}
                  </div>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Role Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Shield className="h-5 w-5" />
              Create New Role
            </DialogTitle>
            <DialogDescription>
              Define a new role with specific permissions and access levels
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleRoleSubmit} className="space-y-6 mt-4">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="roleName" className="text-sm font-medium text-gray-700">
                  Role Name *
                </Label>
                <Input
                  type="text"
                  name="name"
                  id="roleName"
                  required
                  value={roleForm.name}
                  onChange={handleRoleFormChange}
                  className="focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  placeholder="e.g., admin, manager, support"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                  Description *
                </Label>
                <Input
                  type="text"
                  name="description"
                  id="description"
                  required
                  value={roleForm.description}
                  onChange={handleRoleFormChange}
                  className="focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  placeholder="Brief description of the role"
                />
              </div>
            </div>

            {/* Permissions Section */}
            <div className="border-t pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Permissions Configuration</h3>
                  <p className="text-gray-600 mt-1">
                    Select the permissions for this role across different modules
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => permissionModules.forEach(module => handleSelectAll(module.name))}
                    className="flex items-center gap-2 border-green-200 text-green-700 hover:bg-green-50"
                  >
                    <CheckSquare className="h-4 w-4" />
                    Select All
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => permissionModules.forEach(module => handleDeselectAll(module.name))}
                    className="flex items-center gap-2 border-red-200 text-red-700 hover:bg-red-50"
                  >
                    <Square className="h-4 w-4" />
                    Clear All
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 max-h-96 overflow-y-auto p-2">
                {permissionModules.map((module) => (
                  <Card key={module.name} className="border border-gray-200 hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3 bg-slate-50/50">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-semibold capitalize text-gray-900">
                          {module.title}
                        </CardTitle>
                        <div className="flex gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSelectAll(module.name)}
                            className="h-6 px-2 text-xs text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            All
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeselectAll(module.name)}
                            className="h-6 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            None
                          </Button>
                        </div>
                      </div>
                      <CardDescription className="text-xs">
                        {module.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="grid grid-cols-1 gap-2">
                        {module.permissions.map((action) => (
                          <label
                            key={action}
                            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              name={`permissions.${module.name}.${action}`}
                              checked={roleForm.permissions[module.name][action]}
                              onChange={handleRoleFormChange}
                              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 focus:ring-2"
                            />
                            <span className="text-sm font-medium capitalize text-gray-700">
                              {action.replace(/_/g, ' ')}
                            </span>
                          </label>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={closeRoleDialog}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2.5 px-6 rounded-lg transition-colors"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2.5 px-8 rounded-lg transition-colors disabled:bg-purple-400 disabled:cursor-not-allowed shadow-sm"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating Role...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Create Role
                  </div>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}








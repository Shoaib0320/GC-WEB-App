"use client";

import { useState, useEffect } from "react";
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button.jsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.jsx";
import { Alert, AlertDescription } from "@/components/ui/alert.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";
import { User, Shield, CheckSquare, Square, Plus, Trash2, Power, Edit, X, MoreVertical } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export default function Users() {
  const { user, hasPermission } = useAuth();
  // Permission flags for this page (role-level resolved inside hasPermission)
  const canViewUser = hasPermission('user', 'view');
  const canCreateUser = hasPermission('user', 'create');
  const canEditUser = hasPermission('user', 'edit');
  const canDeleteUser = hasPermission('user', 'delete');
  const canChangeRole = hasPermission('user', 'change_role') || hasPermission('role', 'manage_roles') || hasPermission('user', 'edit');

  const canViewRole = hasPermission('role', 'view');
  const canCreateRole = hasPermission('role', 'create');
  const canEditRole = hasPermission('role', 'edit');
  const canDeleteRole = hasPermission('role', 'delete');
  const canManageRoles = hasPermission('role', 'manage_roles');
  const showRolesTab = canViewRole || canCreateRole || canEditRole || canDeleteRole || canManageRoles;
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
  const [viewOnly, setViewOnly] = useState(false);
  // Edit role state
  const [editingRole, setEditingRole] = useState(null);
  // Change user role modal state
  const [roleChangeOpen, setRoleChangeOpen] = useState(false);
  const [roleChangeUser, setRoleChangeUser] = useState(null);
  const [roleChangeValue, setRoleChangeValue] = useState('');

  // Role form state
  const DEFAULT_PERMISSIONS = {
    user: { view: false, create: false, edit: false, delete: false, export: false, approve: false, change_role: false },
    analytics: { view: false, export: false },
    settings: { view: false, edit: false, manage_roles: false },

    // 🆕 NEW: Sales Permissions
    sales: { view: false, create: false, edit: false, delete: false, export: false, approve: false, analytics: false },
    sales_analytics: { view: false, export: false, manage: false },
    // hr: { view: false, create: false, edit: false, delete: false, payroll: false, attendance: false, leave_approve: false },
    // finance: { view: false, create: false, edit: false, delete: false, approve_payments: false, export_reports: false },
    // crm: {
    //   clients: { view: false, create: false, edit: false, delete: false, export: false, approve: false },
    //   leads: { view: false, create: false, edit: false, delete: false, export: false, approve: false },
    //   tickets: { view: false, create: false, edit: false, delete: false, export: false, approve: false }
    // },

    website_bookings: { view: false, edit: false, manage_status: false, export: false, delete: false },
    reports: { sales: false, finance: false, hr: false, performance: false, export_all: false },
    progress: { view_own: false, view_all: false, export: false },
    agent: { view: false, create: false, edit: false, delete: false, export: false, approve: false },
    shift: { view: false, create: false, edit: false, delete: false, export: false, approve: false },
    booking: { view: false, create: false, edit: false, delete: false, export: false, approve: false, update_status: false },
    promoCode: { view: false, create: false, edit: false, delete: false, export: false, approve: false },
    notification: { view: false, create: false, edit: false, delete: false, export: false, approve: false },
    attendance: { view: false, create: false, edit: false, delete: false, export: false, manage_leave: false },
    leaveRequest: { view: false, create: false, edit: false, delete: false, export: false, approve: false },
    holiday: { view: false, create: false, edit: false, delete: false, export: false, approve: false },
    weeklyOff: { view: false, create: false, edit: false, delete: false, export: false, approve: false },
    contact: { view: false, create: false, edit: false, delete: false, export: false, approve: false },
    role: { view: false, create: false, edit: false, delete: false, manage_roles: false }
  };

  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    permissions: JSON.parse(JSON.stringify(DEFAULT_PERMISSIONS))
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
      toast.error('Failed to load users');
      showMessage('error', 'Failed to load users');
    }
  };

  const loadRoles = async () => {
    try {
      const data = await roleService.getAll();
      if (data.success) {
        setRoles(data.data || []);
      }
    } catch (error) {
      toast.error('Failed to load roles');
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

      const data = await userService.create(userForm);

      console.log('User Data', data);

      if (data.success) {
        toast.success('User created successfully');
        showMessage('success', 'User created successfully');
        resetUserForm();
        setUserDialogOpen(false);
        loadUsers();
      } else {
        toast.error('Failed to create user');
        showMessage('error', data.error || 'Failed to create user');
      }
    } catch (error) {
      toast.error('Failed to create user');
      showMessage('error', 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  // Edit user handlers
  const handleEditUser = (user, mode = 'edit') => {
    setEditingUser(user);
    setViewOnly(mode === 'view');
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
      const data = await userService.update(editingUser._id, userForm);

      if (data.success) {
        toast.success('User updated successfully');
        showMessage('success', 'User updated successfully');
        resetUserForm();
        setUserDialogOpen(false);
        loadUsers();
      } else {
        toast.error('Failed to update user');
        showMessage('error', data.error || 'Failed to update user');
      }
    } catch (error) {
      toast.error('Failed to update user');
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
      const parts = name.split('.');
      // supports: permissions.module.action  OR permissions.module.action.subaction
      if (parts.length === 3) {
        const [, module, action] = parts;
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
      } else if (parts.length === 4) {
        const [, module, action, sub] = parts;
        setRoleForm(prev => ({
          ...prev,
          permissions: {
            ...prev.permissions,
            [module]: {
              ...prev.permissions[module],
              [action]: {
                ...(prev.permissions[module]?.[action] || {}),
                [sub]: type === 'checkbox' ? checked : value
              }
            }
          }
        }));
      }
    } else {
      setRoleForm(prev => ({ ...prev, [name]: value }));
    }
  };

  // Select all permissions for a module
  const handleSelectAll = (module) => {
    setRoleForm(prev => {
      const moduleObj = prev.permissions?.[module] || {};
      let keys = Object.keys(moduleObj);
      if (keys.length === 0) {
        const modDef = permissionModules.find(m => m.name === module);
        if (modDef && Array.isArray(modDef.permissions)) keys = modDef.permissions;
      }

      const newModule = keys.reduce((acc, action) => {
        const current = prev.permissions?.[module]?.[action];
        if (current && typeof current === 'object') {
          // set all nested sub-permissions to true
          acc[action] = Object.keys(current).reduce((s, k) => { s[k] = true; return s; }, {});
        } else {
          acc[action] = true;
        }
        return acc;
      }, {});

      return {
        ...prev,
        permissions: {
          ...prev.permissions,
          [module]: newModule
        }
      };
    });
  };

  // Deselect all permissions for a module
  const handleDeselectAll = (module) => {
    setRoleForm(prev => {
      const moduleObj = prev.permissions?.[module] || {};
      let keys = Object.keys(moduleObj);
      if (keys.length === 0) {
        const modDef = permissionModules.find(m => m.name === module);
        if (modDef && Array.isArray(modDef.permissions)) keys = modDef.permissions;
      }

      const newModule = keys.reduce((acc, action) => {
        const current = prev.permissions?.[module]?.[action];
        if (current && typeof current === 'object') {
          acc[action] = Object.keys(current).reduce((s, k) => { s[k] = false; return s; }, {});
        } else {
          acc[action] = false;
        }
        return acc;
      }, {});

      return {
        ...prev,
        permissions: {
          ...prev.permissions,
          [module]: newModule
        }
      };
    });
  };

  const handleRoleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let res;
      // normalize permissions to match DEFAULT_PERMISSIONS shape
      const normalizePermissions = (input) => {
        const out = {};
        for (const modKey of Object.keys(DEFAULT_PERMISSIONS)) {
          const defaultMod = DEFAULT_PERMISSIONS[modKey];
          const currentMod = input?.[modKey];
          if (typeof defaultMod === 'object' && !Array.isArray(defaultMod)) {
            out[modKey] = {};
            for (const actionKey of Object.keys(defaultMod)) {
              const defaultAction = defaultMod[actionKey];
              const currentAction = currentMod?.[actionKey];
              if (typeof defaultAction === 'object' && !Array.isArray(defaultAction)) {
                out[modKey][actionKey] = {};
                for (const subKey of Object.keys(defaultAction)) {
                  out[modKey][actionKey][subKey] = !!(currentAction && currentAction[subKey]);
                }
              } else {
                out[modKey][actionKey] = !!currentAction;
              }
            }
          } else {
            out[modKey] = !!currentMod;
          }
        }
        return out;
      };

      const payload = { ...roleForm, permissions: normalizePermissions(roleForm.permissions) };

      if (editingRole) {
        // update via roleService
        var data = await roleService.update(editingRole._id, payload);
      } else {
        // create via roleService
        var data = await roleService.create(payload);
      }

      if (data.success) {
        toast.success(editingRole ? 'Role updated successfully' : 'Role created successfully');
        showMessage('success', editingRole ? 'Role updated successfully' : 'Role created successfully');
        resetRoleForm();
        setRoleDialogOpen(false);
        setEditingRole(null);
        loadRoles();
      } else {
        toast.error('Failed to save role');
        showMessage('error', data.error || 'Failed to save role');
      }
    } catch (error) {
      toast.error('Failed to save role');
      showMessage('error', 'Failed to save role');
    } finally {
      setLoading(false);
    }
  };

  const resetRoleForm = () => {
    setRoleForm({ name: '', description: '', permissions: JSON.parse(JSON.stringify(DEFAULT_PERMISSIONS)) });
  };

  const openRoleDialog = () => {
    resetRoleForm();
    setRoleDialogOpen(true);
  };

  const handleEditRole = (role) => {
    setEditingRole(role);
    // populate roleForm from role
    setRoleForm(prev => ({
      ...prev,
      name: role.name || '',
      description: role.description || '',
      permissions: role.permissions || prev.permissions
    }));
    setRoleDialogOpen(true);
  };

  const handleDeleteRole = async (roleId) => {
    if (!window.confirm('Delete this role? This cannot be undone.')) return;
    try {
      const data = await roleService.delete(roleId);
      if (data.success) {
        showMessage('success', 'Role deleted');
        loadRoles();
      } else {
        showMessage('error', data.error || 'Failed to delete role');
      }
    } catch (err) {
      showMessage('error', 'Failed to delete role');
    }
  };

  const closeRoleDialog = () => {
    setRoleDialogOpen(false);
    resetRoleForm();
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const data = await userService.delete(userId);
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
      const data = await userService.updateStatus(userId, !currentStatus);
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
      name: 'agent',
      title: 'Agent Management',
      description: 'Manage agents and their profiles',
      permissions: ['view', 'create', 'edit', 'delete', 'export', 'approve']
    },
    // 🆕 NEW: Sales Management
    {
      name: 'sales',
      title: 'Sales Management',
      description: 'Manage sales, orders and transactions',
      permissions: ['view', 'create', 'edit', 'delete', 'export', 'approve', 'analytics']
    },

    // 🆕 NEW: Sales Analytics
    {
      name: 'sales_analytics',
      title: 'Sales Analytics',
      description: 'View detailed sales analytics and reports',
      permissions: ['view', 'export', 'manage']
    },
    {
      name: 'shift',
      title: 'Shift Management',
      description: 'Manage shifts and schedules',
      permissions: ['view', 'create', 'edit', 'delete', 'export', 'approve']
    },
    {
      name: 'booking',
      title: 'Booking Management',
      description: 'Manage bookings and update status',
      permissions: ['view', 'create', 'edit', 'delete', 'export', 'approve', 'update_status']
    },
    {
      name: 'promoCode',
      title: 'Promo Codes',
      description: 'Manage promo codes and discounts',
      permissions: ['view', 'create', 'edit', 'delete', 'export', 'approve']
    },
    {
      name: 'notification',
      title: 'Notifications',
      description: 'Send and manage notifications',
      permissions: ['view', 'create', 'edit', 'delete', 'export', 'approve']
    },
    {
      name: 'attendance',
      title: 'Attendance',
      description: 'Manage attendance, leaves and exports',
      permissions: ['view', 'create', 'edit', 'delete', 'export', 'manage_leave']
    },
    {
      name: 'leaveRequest',
      title: 'Leave Requests',
      description: 'Approve or reject leave requests',
      permissions: ['view', 'create', 'edit', 'delete', 'export', 'approve']
    },
    {
      name: 'holiday',
      title: 'Holidays',
      description: 'Manage system holidays',
      permissions: ['view', 'create', 'edit', 'delete', 'export', 'approve']
    },
    {
      name: 'weeklyOff',
      title: 'Weekly Offs',
      description: 'Manage weekly off days',
      permissions: ['view', 'create', 'edit', 'delete', 'export', 'approve']
    },
    {
      name: 'contact',
      title: 'Contacts / Messages',
      description: 'Manage contact messages',
      permissions: ['view', 'create', 'edit', 'delete', 'export', 'approve']
    },
    {
      name: 'role',
      title: 'Role Management',
      description: 'Manage roles and permissions',
      permissions: ['view', 'create', 'edit', 'delete', 'manage_roles']
    }
  ];

  // Mobile-friendly user columns
  const userColumns = [
    {
      label: 'Name',
      key: 'name',
      render: (u) => (
        <div className="flex items-center gap-4">
          <div className="shrink-0">
            <div className="h-12 w-12 bg-[#10B5DB] rounded-full flex items-center justify-center shadow-sm">
              <span className="text-white font-semibold text-sm">{u.firstName?.charAt(0)}{u.lastName?.charAt(0)}</span>
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-gray-900 truncate">{u.firstName} {u.lastName}</div>
            <div className="text-xs text-gray-500 truncate">{u.email}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-600 capitalize truncate">{u.role?.name}</span>
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs ${u.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {u.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      label: 'Actions',
      key: 'actions',
      align: 'right',
      render: (u) => (
        <div className="flex items-center justify-end gap-2">
          {canEditUser ? (
            <button onClick={() => handleEditUser(u, 'edit')} className="inline-flex items-center px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors border border-blue-200">
              <Edit className="h-4 w-4 mr-1" /> Edit
            </button>
          ) : canViewUser ? (
            <button onClick={() => handleEditUser(u, 'view')} className="inline-flex items-center px-3 py-2 bg-white text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors border border-gray-200">
              <User className="h-4 w-4 mr-1" /> View
            </button>
          ) : null}

          {canEditUser && (
            <button onClick={() => handleToggleUserStatus(u._id, u.isActive)} className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${u.isActive ? 'bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200' : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'}`}>
              <Power className="h-4 w-4 mr-1" /> {u.isActive ? 'Deactivate' : 'Activate'}
            </button>
          )}

          {canDeleteUser && (
            <button onClick={() => handleDeleteUser(u._id)} className="inline-flex items-center px-3 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors border border-red-200">
              <Trash2 className="h-4 w-4 mr-1" /> Delete
            </button>
          )}

          {canChangeRole && (
            <button onClick={() => { setRoleChangeUser(u); setRoleChangeValue(u.role?._id || ''); setRoleChangeOpen(true); }} className="inline-flex items-center px-3 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-sm font-medium transition-colors border border-indigo-200">
              <Shield className="h-4 w-4 mr-1" /> Change Role
            </button>
          )}
        </div>
      ),
    },
  ];

  const roleColumns = [
    { 
      label: 'Role', 
      key: 'name', 
      render: (r) => (
        <div className="min-w-0">
          <div className="text-sm font-semibold capitalize truncate">{r.name.replace(/_/g, ' ')}</div>
          <div className="text-xs text-gray-600 truncate mt-1">{r.description}</div>
        </div>
      ) 
    },
    {
      label: 'Status', 
      key: 'isActive', 
      render: (r) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${r.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {r.isActive ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      label: 'Actions',
      align: 'right',
      render: (r) => (
        <div className="flex items-center justify-end gap-2">
          {canEditRole && (
            <button onClick={() => handleEditRole(r)} className="inline-flex items-center px-2 py-1 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 rounded text-xs font-medium transition-colors border border-yellow-200">
              <Edit className="h-3 w-3 mr-1" /> Edit
            </button>
          )}
          {canDeleteRole && (
            <button onClick={() => handleDeleteRole(r._id)} className="inline-flex items-center px-2 py-1 bg-red-50 text-red-700 hover:bg-red-100 rounded text-xs font-medium transition-colors border border-red-200">
              <Trash2 className="h-3 w-3 mr-1" /> Delete
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Card */}
        <Card className="shadow-lg border-0 bg-white text-black">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <User className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-xl md:text-2xl font-bold truncate">Users & Roles Management</CardTitle>
                <CardDescription className="text-black text-sm md:text-base">
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
              <div className="px-4 md:px-6">
                <TabsList className="grid w-full grid-cols-2 bg-slate-100 p-1 rounded-lg">
                  <TabsTrigger
                    value="users"
                    className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all text-sm"
                  >
                    <User className="h-4 w-4" />
                    <span className="hidden xs:inline">Users</span>
                    <span className="bg-[#10B5DB]/10 text-[#10B5DB] px-2 py-0.5 rounded-full text-xs font-medium">
                      {users.length}
                    </span>
                  </TabsTrigger>
                  {showRolesTab && (
                    <TabsTrigger
                      value="roles"
                      className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all text-sm"
                    >
                      <Shield className="h-4 w-4" />
                      <span className="hidden xs:inline">Roles</span>
                      <span className="bg-[#10B5DB]/10 text-[#10B5DB] px-2 py-0.5 rounded-full text-xs font-medium">
                        {roles.length}
                      </span>
                    </TabsTrigger>
                  )}
                </TabsList>
              </div>
            </div>

            {/* Message Alert */}
            {message.text && (
              <div className="mx-4 md:mx-6 mt-4 md:mt-6">
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

            <div className="p-4 md:p-6">
              {/* Users Tab */}
              {activeTab === 'users' && (
                <div className="space-y-6 md:space-y-8">
                  {/* Users List Header with Add Button */}
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-4 border-b bg-white/50">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-lg md:text-xl font-semibold text-gray-900">All Users</CardTitle>
                          <CardDescription className="text-sm">
                            Manage existing users and their account status
                          </CardDescription>
                        </div>
                        {canCreateUser && (
                          <Button
                            onClick={openUserDialog}
                            className="bg-[#10B5DB] hover:bg-[#10B5DB]/90 text-white font-medium py-2.5 px-4 md:px-6 rounded-lg transition-colors shadow-sm flex items-center gap-2 w-full sm:w-auto justify-center"
                          >
                            <Plus className="h-4 w-4" />
                            Add User
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 md:pt-6 px-0 md:px-6">
                      <div className="overflow-x-auto">
                        <GlobalData
                          title="All Users"
                          icon={User}
                          fetcher={async (params) => {
                            const res = await userService.getAll(params);
                            const users = res?.data?.users ?? res?.users ?? [];
                            const pagination = res?.data?.pagination ?? res?.pagination ?? null;
                            if (pagination) {
                              return { data: users, meta: pagination };
                            }
                            return users;
                          }}
                          columns={userColumns}
                          serverSide={true}
                          rowsPerPage={10}
                          searchEnabled={true}
                          onDataFetched={(items, meta) => setUsers(items)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Roles Tab */}
              {activeTab === 'roles' && showRolesTab && (
                <div className="space-y-6 md:space-y-8">
                  {/* Roles List Header with Add Button */}
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-4 border-b bg-white/50">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-lg md:text-xl font-semibold text-gray-900">All Roles</CardTitle>
                          <CardDescription className="text-sm">
                            Overview of existing roles and their permissions
                          </CardDescription>
                        </div>
                        {canCreateRole && (
                          <Button
                            onClick={openRoleDialog}
                            className="bg-[#10B5DB] hover:bg-[#10B5DB]/90 text-white font-medium py-2.5 px-4 md:px-6 rounded-lg transition-colors shadow-sm flex items-center gap-2 w-full sm:w-auto justify-center"
                          >
                            <Plus className="h-4 w-4" />
                            Add Role
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 md:pt-6 px-0 md:px-6">
                      <div className="overflow-x-auto">
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
                      </div>
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
        <DialogContent className="max-w-[95vw] md:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg md:text-xl">
              {editingUser ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              {editingUser ? 'Edit User' : 'Create New User'}
            </DialogTitle>
            <DialogDescription className="text-sm md:text-base">
              {editingUser ? 'Update user information' : 'Add a new user to the system with appropriate role and permissions'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={editingUser ? handleEditUserSubmit : handleUserSubmit} className="grid grid-cols-1 gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3 mt-4">
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
                disabled={viewOnly}
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
                disabled={viewOnly}
                className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter last name"
              />
            </div>

            <div className="space-y-2 md:col-span-2 lg:col-span-1">
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
                disabled={editingUser || viewOnly}
              />
            </div>

            {!editingUser && (
              <div className="space-y-2 md:col-span-2 lg:col-span-1">
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
                  disabled={viewOnly}
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
                disabled={viewOnly}
                className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter phone number"
              />
            </div>

            <div className="space-y-2 md:col-span-2 lg:col-span-1">
              <Label htmlFor="role" className="text-sm font-medium text-gray-700">
                Role *
              </Label>
              <Select
                value={userForm.role}
                onValueChange={(value) => setUserForm(prev => ({ ...prev, role: value }))}
                disabled={viewOnly}
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
                          <span className="capitalize text-sm">
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

            <div className="md:col-span-2 lg:col-span-3 pt-4 flex flex-col sm:flex-row gap-3 justify-end border-t">
              <Button
                type="button"
                variant="outline"
                onClick={closeUserDialog}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2.5 px-6 rounded-lg transition-colors order-2 sm:order-1 w-full sm:w-auto"
              >
                {viewOnly ? 'Close' : 'Cancel'}
              </Button>
              {!viewOnly && (
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
              )}
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Change User Role Dialog */}
      <Dialog open={roleChangeOpen} onOpenChange={setRoleChangeOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Role</DialogTitle>
            <DialogDescription>Assign a different role to this user</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                <Label className="text-sm">Select Role</Label>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => loadRoles()} className="px-2 py-1 text-xs">Refresh</Button>
                  {canCreateRole && (
                    <Button size="sm" className="px-2 py-1 text-xs" onClick={() => { setRoleDialogOpen(true); setEditingRole(null); setRoleChangeOpen(false); }}>
                      Create Role
                    </Button>
                  )}
                </div>
              </div>
              <Select value={roleChangeValue} onValueChange={(v) => setRoleChangeValue(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Available Roles</SelectLabel>
                    {roles.map((r) => (
                      <SelectItem key={r._id} value={r._id} disabled={!r.isActive}>
                        {r.name.replace(/_/g, ' ')}{!r.isActive ? ' (Inactive)' : ''}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 justify-end">
              <Button variant="outline" onClick={() => setRoleChangeOpen(false)} className="w-full sm:w-auto">Cancel</Button>
              {canChangeRole ? (
                <Button onClick={async () => {
                  if (!roleChangeUser) return;
                  try {
                    const data = await userService.updateRole(roleChangeUser._id, roleChangeValue);
                    if (data.success) {
                      showMessage('success', 'Role updated');
                      setRoleChangeOpen(false);
                      loadUsers();
                    } else {
                      showMessage('error', data.error || 'Failed to update role');
                    }
                  } catch (err) {
                    showMessage('error', 'Failed to update role');
                  }
                }} className="w-full sm:w-auto">Save</Button>
              ) : (
                <div className="w-full sm:w-auto text-sm text-gray-600 flex items-center justify-center">You don't have permission to change role.</div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Role Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent className="max-w-[95vw] md:max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg md:text-xl">
              <Shield className="h-5 w-5" />
              {editingRole ? 'Edit Role' : 'Create New Role'}
            </DialogTitle>
            <DialogDescription className="text-sm md:text-base">
              {editingRole ? 'Update role permissions and settings' : 'Define a new role with specific permissions and access levels'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRoleSubmit} className="space-y-6 mt-4">
            <div className="grid grid-cols-1 gap-4 md:gap-6 md:grid-cols-2">
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
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900">Permissions Configuration</h3>
                  <p className="text-gray-600 mt-1 text-sm md:text-base">
                    Select the permissions for this role across different modules
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => permissionModules.forEach(module => handleSelectAll(module.name))}
                    className="flex items-center gap-2 border-green-200 text-green-700 hover:bg-green-50 text-xs"
                  >
                    <CheckSquare className="h-4 w-4" />
                    Select All
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => permissionModules.forEach(module => handleDeselectAll(module.name))}
                    className="flex items-center gap-2 border-red-200 text-red-700 hover:bg-red-50 text-xs"
                  >
                    <Square className="h-4 w-4" />
                    Clear All
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4 max-h-96 overflow-y-auto p-2">
                {permissionModules.map((module) => (
                  <Card key={module.name} className="border border-gray-200 hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3 bg-slate-50/50">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-semibold capitalize text-gray-900 truncate">
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
                        {module.permissions.map((action) => {
                          const permValue = roleForm.permissions[module.name]?.[action];
                          // If permValue is an object, render its sub-actions
                          if (permValue && typeof permValue === 'object') {
                            return (
                              <div key={action} className="p-2 rounded-lg hover:bg-slate-50 transition-colors">
                                <div className="text-sm font-medium text-gray-800 mb-2 capitalize">{action.replace(/_/g, ' ')}</div>
                                <div className="grid grid-cols-2 gap-2">
                                  {Object.keys(permValue).map((sub) => (
                                    <label key={sub} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                                      <input
                                        type="checkbox"
                                        name={`permissions.${module.name}.${action}.${sub}`}
                                        checked={!!roleForm.permissions[module.name]?.[action]?.[sub]}
                                        onChange={handleRoleFormChange}
                                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 focus:ring-2"
                                      />
                                      <span className="text-xs font-medium capitalize text-gray-700 truncate">{sub.replace(/_/g, ' ')}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            );
                          }

                          // fallback: render simple checkbox
                          return (
                            <label
                              key={action}
                              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                            >
                              <input
                                type="checkbox"
                                name={`permissions.${module.name}.${action}`}
                                checked={!!roleForm.permissions[module.name]?.[action]}
                                onChange={handleRoleFormChange}
                                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 focus:ring-2"
                              />
                              <span className="text-sm font-medium capitalize text-gray-700">{action.replace(/_/g, ' ')}</span>
                            </label>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-end pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={closeRoleDialog}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2.5 px-6 rounded-lg transition-colors w-full sm:w-auto order-2 sm:order-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2.5 px-8 rounded-lg transition-colors disabled:bg-purple-400 disabled:cursor-not-allowed shadow-sm w-full sm:w-auto order-1 sm:order-2"
              >
                {loading ? (
                  <div className="flex items-center gap-2 justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {editingRole ? 'Updating...' : 'Creating...'}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 justify-center">
                    <Shield className="h-4 w-4" />
                    {editingRole ? 'Update Role' : 'Create Role'}
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


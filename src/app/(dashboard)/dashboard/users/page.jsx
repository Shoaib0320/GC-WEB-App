//src/app/(dashboard)/dashboard/users/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button.jsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.jsx";
import { Alert, AlertDescription } from "@/components/ui/alert.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";
import { User, Shield, CheckSquare, Square, Plus, Trash2, Power, Edit, X, MoreVertical, ChevronLeft, ChevronRight, Search } from "lucide-react";
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

  // Users state - ALL data loaded
  const [allUsers, setAllUsers] = useState([]);
  const [allRoles, setAllRoles] = useState([]);
  
  // Pagination states - CLIENT SIDE
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentRolePage, setCurrentRolePage] = useState(1);
  const [totalRoles, setTotalRoles] = useState(0);
  
  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [roleSearchQuery, setRoleSearchQuery] = useState("");
  
  // Status filter states
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleStatusFilter, setRoleStatusFilter] = useState("all");

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
    sales: { view: false, create: false, edit: false, delete: false, export: false, approve: false, analytics: false },
    sales_analytics: { view: false, export: false, manage: false },
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

  // Load ALL users and roles initially
  useEffect(() => {
    loadAllUsers();
    loadAllRoles();
  }, []);

  // Load ALL users data (without pagination)
  const loadAllUsers = async () => {
    try {
      setLoading(true);
      // Load ALL users at once
      const data = await userService.getAll();
      
      if (data.success) {
        const userData = data.data?.users || data.users || [];
        setAllUsers(userData);
        setTotalUsers(userData.length);
      } else {
        setAllUsers([]);
        setTotalUsers(0);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
      setAllUsers([]);
      setTotalUsers(0);
    } finally {
      setLoading(false);
    }
  };

  // Load ALL roles data (without pagination)
  const loadAllRoles = async () => {
    try {
      setLoading(true);
      // Load ALL roles at once
      const data = await roleService.getAll();
      
      if (data.success) {
        const roleData = data.data || data.roles || [];
        setAllRoles(roleData);
        setTotalRoles(roleData.length);
      } else {
        setAllRoles([]);
        setTotalRoles(0);
      }
    } catch (error) {
      console.error('Error loading roles:', error);
      toast.error('Failed to load roles');
      setAllRoles([]);
      setTotalRoles(0);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  // Filter and paginate users CLIENT SIDE
  const getFilteredAndPaginatedUsers = () => {
    // Filter users based on search and status
    let filtered = allUsers;
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user => 
        user.firstName?.toLowerCase().includes(query) ||
        user.lastName?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.phone?.includes(query) ||
        user.role?.name?.toLowerCase().includes(query)
      );
    }
    
    // Apply status filter
    if (statusFilter === "active") {
      filtered = filtered.filter(user => user.isActive === true);
    } else if (statusFilter === "inactive") {
      filtered = filtered.filter(user => user.isActive === false);
    }
    
    // Calculate pagination
    const itemsPerPage = 5;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    // Get current page items
    const paginatedUsers = filtered.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    
    return {
      users: paginatedUsers,
      total: filtered.length,
      totalPages: totalPages
    };
  };

  // Filter and paginate roles CLIENT SIDE
  const getFilteredAndPaginatedRoles = () => {
    // Filter roles based on search and status
    let filtered = allRoles;
    
    // Apply search filter
    if (roleSearchQuery) {
      const query = roleSearchQuery.toLowerCase();
      filtered = filtered.filter(role => 
        role.name?.toLowerCase().includes(query) ||
        role.description?.toLowerCase().includes(query)
      );
    }
    
    // Apply status filter
    if (roleStatusFilter === "active") {
      filtered = filtered.filter(role => role.isActive === true);
    } else if (roleStatusFilter === "inactive") {
      filtered = filtered.filter(role => role.isActive === false);
    }
    
    // Calculate pagination
    const itemsPerPage = 5;
    const startIndex = (currentRolePage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    // Get current page items
    const paginatedRoles = filtered.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    
    return {
      roles: paginatedRoles,
      total: filtered.length,
      totalPages: totalPages
    };
  };

  // Get current users for display
  const { users: currentUsers, total: filteredUserTotal, totalPages: userTotalPages } = getFilteredAndPaginatedUsers();
  
  // Get current roles for display
  const { roles: currentRoles, total: filteredRoleTotal, totalPages: roleTotalPages } = getFilteredAndPaginatedRoles();

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
        loadAllUsers(); // Reload all users
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
        loadAllUsers(); // Reload all users
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
        var data = await roleService.update(editingRole._id, payload);
      } else {
        var data = await roleService.create(payload);
      }

      if (data.success) {
        toast.success(editingRole ? 'Role updated successfully' : 'Role created successfully');
        showMessage('success', editingRole ? 'Role updated successfully' : 'Role created successfully');
        resetRoleForm();
        setRoleDialogOpen(false);
        setEditingRole(null);
        loadAllRoles(); // Reload all roles
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
        loadAllRoles(); // Reload all roles
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
        loadAllUsers(); // Reload all users
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
        loadAllUsers(); // Reload all users
      } else {
        showMessage('error', data.error || 'Failed to update user status');
      }
    } catch (error) {
      showMessage('error', 'Failed to update user status');
    }
  };

  // Handle search - triggers client-side filtering
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleRoleSearch = (e) => {
    e.preventDefault();
    setCurrentRolePage(1); // Reset to first page when searching
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
    {
      name: 'sales',
      title: 'Sales Management',
      description: 'Manage sales, orders and transactions',
      permissions: ['view', 'create', 'edit', 'delete', 'export', 'approve', 'analytics']
    },
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
              <span className="text-xs text-gray-600 capitalize truncate">{u.role?.name || 'No role'}</span>
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
        <div className="flex flex-wrap items-center justify-end gap-2">
          {canEditUser ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEditUser(u, 'edit')}
              className="h-8 w-8 p-0 md:h-auto md:w-auto md:px-3 md:py-2"
            >
              <Edit className="h-4 w-4 md:mr-1" />
              <span className="hidden md:inline">Edit</span>
            </Button>
          ) : canViewUser ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEditUser(u, 'view')}
              className="h-8 w-8 p-0 md:h-auto md:w-auto md:px-3 md:py-2"
            >
              <User className="h-4 w-4 md:mr-1" />
              <span className="hidden md:inline">View</span>
            </Button>
          ) : null}

          {canEditUser && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleToggleUserStatus(u._id, u.isActive)}
              className={`h-8 w-8 p-0 md:h-auto md:w-auto md:px-3 md:py-2 ${u.isActive ? 'text-orange-600 hover:text-orange-700 hover:bg-orange-50' : 'text-green-600 hover:text-green-700 hover:bg-green-50'}`}
            >
              <Power className="h-4 w-4 md:mr-1" />
              <span className="hidden md:inline">{u.isActive ? 'Deactivate' : 'Activate'}</span>
            </Button>
          )}

          {canDeleteUser && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDeleteUser(u._id)}
              className="h-8 w-8 p-0 md:h-auto md:w-auto md:px-3 md:py-2"
            >
              <Trash2 className="h-4 w-4 md:mr-1" />
              <span className="hidden md:inline">Delete</span>
            </Button>
          )}

          {canChangeRole && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setRoleChangeUser(u); setRoleChangeValue(u.role?._id || ''); setRoleChangeOpen(true); }}
              className="h-8 w-8 p-0 md:h-auto md:w-auto md:px-3 md:py-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
            >
              <Shield className="h-4 w-4 md:mr-1" />
              <span className="hidden md:inline">Change Role</span>
            </Button>
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEditRole(r)}
              className="h-8 w-8 p-0 md:h-auto md:w-auto md:px-3 md:py-2 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
            >
              <Edit className="h-4 w-4 md:mr-1" />
              <span className="hidden md:inline">Edit</span>
            </Button>
          )}
          {canDeleteRole && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDeleteRole(r._id)}
              className="h-8 w-8 p-0 md:h-auto md:w-auto md:px-3 md:py-2"
            >
              <Trash2 className="h-4 w-4 md:mr-1" />
              <span className="hidden md:inline">Delete</span>
            </Button>
          )}
        </div>
      )
    }
  ];

  // Pagination component
  const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }) => {
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    const getPageNumbers = () => {
      const pages = [];
      if (totalPages <= 5) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
      } else if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
      return pages;
    };

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 px-4 border-t pt-6">
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium">{startItem}</span> to{" "}
          <span className="font-medium">{endItem}</span> of{" "}
          <span className="font-medium">{totalItems}</span> items
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Previous</span>
          </Button>
          
          <div className="flex items-center gap-1">
            {getPageNumbers().map((page, index) => (
              page === '...' ? (
                <span key={`dots-${index}`} className="px-2 py-1">...</span>
              ) : (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(page)}
                  className={`h-8 w-8 p-0 ${
                    currentPage === page ? 'bg-[#10B5DB] text-white hover:bg-[#10B5DB]' : ''
                  }`}
                >
                  {page}
                </Button>
              )
            ))}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

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
                      {allUsers.length} {/* Show total count */}
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
                        {allRoles.length} {/* Show total count */}
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
                      {/* Search and Filter Controls */}
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 px-4">
                        <div className="relative w-full md:w-64">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                            className="pl-9 w-full"
                          />
                        </div>
                        
                        <select
                          value={statusFilter}
                          onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setCurrentPage(1);
                          }}
                          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-auto"
                        >
                          <option value="all">All Status</option>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>

                      {/* Users Table */}
                      <div className="overflow-x-auto">
                        <div className="min-w-full inline-block align-middle">
                          <div className="overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  {userColumns.map((column) => (
                                    <th
                                      key={column.key}
                                      scope="col"
                                      className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap ${
                                        column.align === 'right' ? 'text-right' : ''
                                      }`}
                                    >
                                      {column.label}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {loading ? (
                                  <tr>
                                    <td colSpan={userColumns.length} className="px-4 py-8 text-center">
                                      <div className="flex justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                      </div>
                                    </td>
                                  </tr>
                                ) : currentUsers.length > 0 ? (
                                  currentUsers.map((user) => (
                                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                                      {userColumns.map((column) => (
                                        <td
                                          key={column.key}
                                          className={`px-4 py-4 whitespace-nowrap ${
                                            column.align === 'right' ? 'text-right' : ''
                                          }`}
                                        >
                                          {column.render(user)}
                                        </td>
                                      ))}
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td colSpan={userColumns.length} className="px-4 py-8 text-center text-gray-500">
                                      No users found
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                      
                      {/* Pagination Controls */}
                      {userTotalPages > 1 && (
                        <Pagination
                          currentPage={currentPage}
                          totalPages={userTotalPages}
                          onPageChange={setCurrentPage}
                          totalItems={filteredUserTotal}
                          itemsPerPage={5}
                        />
                      )}
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
                      {/* Search and Filter Controls */}
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 px-4">
                        <div className="relative w-full md:w-64">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Search roles..."
                            value={roleSearchQuery}
                            onChange={(e) => setRoleSearchQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleRoleSearch(e)}
                            className="pl-9 w-full"
                          />
                        </div>
                        
                        <select
                          value={roleStatusFilter}
                          onChange={(e) => {
                            setRoleStatusFilter(e.target.value);
                            setCurrentRolePage(1);
                          }}
                          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-auto"
                        >
                          <option value="all">All Status</option>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>

                      {/* Roles Table */}
                      <div className="overflow-x-auto">
                        <div className="min-w-full inline-block align-middle">
                          <div className="overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  {roleColumns.map((column) => (
                                    <th
                                      key={column.key || 'actions'}
                                      scope="col"
                                      className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap ${
                                        column.align === 'right' ? 'text-right' : ''
                                      }`}
                                    >
                                      {column.label}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {loading ? (
                                  <tr>
                                    <td colSpan={roleColumns.length} className="px-4 py-8 text-center">
                                      <div className="flex justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                      </div>
                                    </td>
                                  </tr>
                                ) : currentRoles.length > 0 ? (
                                  currentRoles.map((role) => (
                                    <tr key={role._id} className="hover:bg-gray-50 transition-colors">
                                      {roleColumns.map((column) => (
                                        <td
                                          key={column.key || 'actions'}
                                          className={`px-4 py-4 whitespace-nowrap ${
                                            column.align === 'right' ? 'text-right' : ''
                                          }`}
                                        >
                                          {column.render(role)}
                                        </td>
                                      ))}
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td colSpan={roleColumns.length} className="px-4 py-8 text-center text-gray-500">
                                      No roles found
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                      
                      {/* Pagination Controls */}
                      {roleTotalPages > 1 && (
                        <Pagination
                          currentPage={currentRolePage}
                          totalPages={roleTotalPages}
                          onPageChange={setCurrentRolePage}
                          totalItems={filteredRoleTotal}
                          itemsPerPage={5}
                        />
                      )}
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
                    {allRoles.map((role) => (
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
                  <Button size="sm" variant="outline" onClick={() => loadAllRoles()} className="px-2 py-1 text-xs">Refresh</Button>
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
                    {allRoles.map((r) => (
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
                      toast.success('Role updated successfully');
                      showMessage('success', 'Role updated');
                      setRoleChangeOpen(false);
                      loadAllUsers(); // Reload all users
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
// src/app/agents/page.js
"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { agentService } from '@/services/agentService';
import { shiftService } from '@/services/shiftService';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import GlobalData from '@/components/common/GlobalData';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ResetPasswordDialog } from '@/components/ResetPasswordDialog';

export default function AgentsPage() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [viewOnly, setViewOnly] = useState(false);
  const [pagination, setPagination] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const [formData, setFormData] = useState({
    agentName: '',
    agentId: '',
    shift: '',
    email: '',
    password: '',
    monthlyTarget: ''
  });

  const [editFormData, setEditFormData] = useState({
    _id: '',
    agentName: '',
    agentId: '',
    shift: '',
    email: '',
    monthlyTarget: '',
    isActive: true
  });

  const [shifts, setShifts] = useState([]);
  const [shiftsLoading, setShiftsLoading] = useState(false);

  const fetchShifts = async () => {
    setShiftsLoading(true);
    try {
      const response = await shiftService.getShiftsForDropdown();
      setShifts(response);
    } catch (error) {
      console.error('Error fetching shifts:', error);
      toast.error('Error fetching shifts');
    } finally {
      setShiftsLoading(false);
    }
  };

  const fetchAgents = async (page = 1, search = '') => {
    setReloadKey((k) => k + 1);
  };

  const { hasPermission } = useAuth();

  useEffect(() => {
    fetchAgents();
    fetchShifts();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    fetchAgents(1, e.target.value);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'monthlyTarget' ? value.replace(/[^0-9]/g, '') : value
    });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: name === 'monthlyTarget' ? value.replace(/[^0-9]/g, '') : value
    });
  };

  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleEditSelectChange = (name, value) => {
    setEditFormData({
      ...editFormData,
      [name]: value
    });
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, password });
  };

  const handleCreateAgent = async (e) => {
    e.preventDefault();
    if (!formData.shift) {
      toast.warning('Please select a shift');
      return;
    }
    setLoading(true);
    try {
      await agentService.createAgent({
        ...formData,
        monthlyTarget: formData.monthlyTarget ? parseInt(formData.monthlyTarget) : 0
      });
      toast.success('Agent created successfully! Welcome email sent.');
      setShowCreateForm(false);
      setFormData({
        agentName: '',
        agentId: '',
        shift: '',
        email: '',
        password: '',
        monthlyTarget: ''
      });
  fetchAgents(); // Refresh list
    } catch (error) {
      console.error('Error creating agent:', error);
      toast.error(error.response?.data?.error || 'Error creating agent');
    } finally {
      setLoading(false);
    }
  };

  const handleEditAgent = async (e) => {
    e.preventDefault();
    if (!editFormData.shift) {
      toast.warning('Please select a shift');
      return;
    }
    setLoading(true);
    try {
      await agentService.updateAgent(editFormData._id, {
        agentName: editFormData.agentName,
        agentId: editFormData.agentId,
        shift: editFormData.shift,
        email: editFormData.email,
        monthlyTarget: editFormData.monthlyTarget ? parseInt(editFormData.monthlyTarget) : 0,
        isActive: editFormData.isActive
      });
      toast.success('Agent updated successfully!');
      setShowEditForm(false);
      setEditFormData({
        _id: '',
        agentName: '',
        agentId: '',
        shift: '',
        email: '',
        monthlyTarget: '',
        isActive: true
      });
  fetchAgents(); // Refresh list
    } catch (error) {
      console.error('Error updating agent:', error);
      toast.error(error.response?.data?.error || 'Error updating agent');
    } finally {
      setLoading(false);
    }
  };

  // Open edit modal
  const handleOpenEdit = (agent, mode = 'edit') => {
    setEditFormData({
      _id: agent._id,
      agentName: agent.agentName,
      agentId: agent.agentId,
      shift: agent.shift?._id || '',
      email: agent.email,
      monthlyTarget: agent.monthlyTarget?.toString() || '',
      isActive: agent.isActive
    });
    setViewOnly(mode === 'view');
    setShowEditForm(true);
  };

  const handleDeleteAgent = async (agentId) => {
    if (!confirm('Are you sure you want to delete this agent?')) return;
    try {
      await agentService.deleteAgent(agentId);
      toast.success('Agent deleted successfully');
      fetchAgents();
    } catch (error) {
      console.error('Error deleting agent:', error);
      toast.error('Error deleting agent');
    }
  };

  const handleToggleStatus = async (agentId, currentStatus) => {
    try {
      await agentService.updateAgentStatus(agentId, !currentStatus);
      toast.success(`Agent ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchAgents();
    } catch (error) {
      console.error('Error updating agent status:', error);
      toast.error('Error updating status');
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">

      {/* Header */}
      <div className="bg-white shadow rounded-md p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agent Management</h1>
          <p className="text-gray-600 mt-1">Manage all agents and their shifts</p>
        </div>
        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          {hasPermission('agent', 'create') && (
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Create New Agent
              </Button>
            </DialogTrigger>
          )}
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <div className="bg-white p-6 rounded-lg shadow">
              <DialogHeader>
                <DialogTitle>Create New Agent</DialogTitle>
                <DialogDescription>
                  Add a new agent to the system. A welcome email will be sent.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateAgent} className="space-y-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="col-span-1 sm:col-span-2 space-y-2">
                  <Label htmlFor="agentName">Agent Name</Label>
                  <Input
                    id="agentName"
                    name="agentName"
                    value={formData.agentName}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter agent full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="agentId">Agent ID</Label>
                  <Input
                    id="agentId"
                    name="agentId"
                    value={formData.agentId}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter unique agent ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shift">Shift</Label>
                  <Select value={formData.shift} onValueChange={(v) => handleSelectChange('shift', v)} disabled={shiftsLoading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a shift" />
                    </SelectTrigger>
                    <SelectContent>
                      {shiftsLoading ? (
                        <SelectItem value="loading" disabled>Loading shifts...</SelectItem>
                      ) : shifts.length === 0 ? (
                        <SelectItem value="none" disabled>No shifts available</SelectItem>
                      ) : (
                        shifts.map(shift => (
                          <SelectItem key={shift._id} value={shift._id}>{shift.name} ({shift.startTime}-{shift.endTime})</SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter agent email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthlyTarget">Monthly Target</Label>
                  <Input
                    id="monthlyTarget"
                    name="monthlyTarget"
                    type="text"
                    value={formData.monthlyTarget}
                    onChange={handleInputChange}
                    placeholder="Enter monthly target"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="flex gap-2">
                    <Input
                      id="password"
                      name="password"
                      type="text"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                    />
                    <Button type="button" variant="outline" onClick={generatePassword}>Generate</Button>
                  </div>
                </div>
                <div className="col-span-1 sm:col-span-2 flex gap-3 pt-4">
                  <Button type="submit" disabled={loading || shifts.length === 0} className="flex-1 bg-blue-600 hover:bg-blue-700">
                    {loading ? 'Creating...' : 'Create Agent'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Agent Dialog */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Agent</DialogTitle>
            <DialogDescription>
              Update agent information and settings.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleEditAgent} className="space-y-4">
            {/* Agent Name */}
            <div className="space-y-2">
              <Label htmlFor="edit-agentName">Agent Name</Label>
                <Input
                  id="edit-agentName"
                  name="agentName"
                  value={editFormData.agentName}
                  onChange={handleEditInputChange}
                  required
                  placeholder="Enter agent full name"
                  disabled={viewOnly}
                />
            </div>

            {/* Agent ID */}
            <div className="space-y-2">
              <Label htmlFor="edit-agentId">Agent ID</Label>
              <Input
                id="edit-agentId"
                name="agentId"
                value={editFormData.agentId}
                onChange={handleEditInputChange}
                required
                placeholder="Enter unique agent ID"
                disabled={viewOnly}
              />
            </div>

            {/* Shift Selection */}
            <div className="space-y-2">
              <Label htmlFor="edit-shift">Shift</Label>
              <Select 
                value={editFormData.shift} 
                onValueChange={(value) => handleEditSelectChange('shift', value)}
                disabled={shiftsLoading || viewOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a shift" />
                </SelectTrigger>
                <SelectContent>
                  {shiftsLoading ? (
                    <SelectItem value="loading" disabled>Loading shifts...</SelectItem>
                  ) : shifts.length === 0 ? (
                    <SelectItem value="none" disabled>No shifts available</SelectItem>
                    ) : (
                    shifts.map(shift => (
                      <SelectItem key={shift._id} value={shift._id}>
                        {shift.name} ({shift.startTime} - {shift.endTime})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                name="email"
                type="email"
                value={editFormData.email}
                onChange={handleEditInputChange}
                required
                placeholder="Enter agent email address"
                disabled={viewOnly}
              />
            </div>

            {/* Monthly Target */}
            <div className="space-y-2">
              <Label htmlFor="edit-monthlyTarget">Monthly Target</Label>
              <Input
                id="edit-monthlyTarget"
                name="monthlyTarget"
                type="text"
                value={editFormData.monthlyTarget}
                onChange={handleEditInputChange}
                placeholder="Enter monthly target (numbers only)"
                disabled={viewOnly}
              />
              <p className="text-xs text-gray-500">
                Monthly target in numbers (e.g., 1000)
              </p>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select 
                value={editFormData.isActive.toString()} 
                onValueChange={(value) => handleEditSelectChange('isActive', value === 'true')}
                disabled={viewOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-4">
              {!viewOnly && (
                <>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {loading ? 'Updating...' : 'Update Agent'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowEditForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </>
              )}
              {viewOnly && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditForm(false)}
                  className="flex-1"
                >
                  Close
                </Button>
              )}
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Agents List */}
      <Card className="overflow-x-auto">
        <CardHeader>
          <CardTitle>Agents</CardTitle>
          <CardDescription>View and manage all registered agents</CardDescription>
        </CardHeader>
        <CardContent>
          <GlobalData
            key={reloadKey}
            title="Agents"
            serverSide={true}
            fetcher={async (params = {}) => {
              const p = { page: params.page || 1, limit: params.limit || 10, search: params.search || '' };
              const res = await agentService.getAllAgents(p);
              return { data: res.agents || [], meta: res.pagination || { total: res.totalAgents || 0, page: res.pagination?.currentPage || p.page, limit: p.limit } };
            }}
            columns={[
              {
                label: 'Agent Details',
                key: 'agentDetails',
                render: (agent) => (
                  <div className="space-y-1">
                    <div className="font-medium text-gray-900">{agent.agentName}</div>
                    <div className="text-sm text-gray-500">ID: {agent.agentId}</div>
                    <div className="text-sm text-gray-500">{agent.email}</div>
                    <div className="text-xs text-gray-400">Created: {new Date(agent.createdAt).toLocaleDateString()}</div>
                  </div>
                )
              },
              {
                label: 'Shift',
                key: 'shift',
                render: (agent) => agent.shift ? (
                  <Badge className="bg-blue-100 text-blue-800">{agent.shift.name}</Badge>
                ) : (
                  <Badge className="bg-gray-100 text-gray-800">No Shift</Badge>
                )
              },
              {
                label: 'Monthly Target',
                key: 'monthlyTarget',
                render: (agent) => (
                  <div>{agent.monthlyTarget ? agent.monthlyTarget.toLocaleString() : '—'}</div>
                )
              },
              {
                label: 'Status',
                key: 'status',
                render: (agent) => (
                  <Badge className={agent.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {agent.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                )
              },
              {
                label: 'Actions',
                key: 'actions',
                render: (agent) => (
                  <div className="flex justify-end gap-2">
                          {hasPermission('agent', 'edit') && (
                            <Button variant="outline" size="sm" onClick={() => handleOpenEdit(agent, 'edit')} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">Edit</Button>
                          )}
                          {!hasPermission('agent', 'edit') && hasPermission('agent', 'view') && (
                            <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(agent, 'view')} className="text-gray-600 hover:bg-gray-50">View</Button>
                          )}
                          {hasPermission('agent', 'edit') && (
                            <ResetPasswordDialog agent={agent} onSuccess={() => setReloadKey(k => k + 1)} />
                          )}
                          {hasPermission('agent', 'edit') && (
                            <Button variant="outline" size="sm" onClick={() => handleToggleStatus(agent._id, agent.isActive)} className={agent.isActive ? 'text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50' : 'text-green-600 hover:text-green-700 hover:bg-green-50'}>{agent.isActive ? 'Deactivate' : 'Activate'}</Button>
                          )}
                          {hasPermission('agent', 'delete') && (
                            <Button variant="outline" size="sm" onClick={() => handleDeleteAgent(agent._id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">Delete</Button>
                          )}
                  </div>
                )
              }
            ]}
            rowsPerPage={5}
            searchEnabled={true}
            filterKeys={['shift', 'isActive']}
            filterOptionsMap={{
              shift: shifts.map(s => ({ label: s.name, value: s._id })),
              isActive: [{ label: 'Active', value: true }, { label: 'Inactive', value: false }]
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}

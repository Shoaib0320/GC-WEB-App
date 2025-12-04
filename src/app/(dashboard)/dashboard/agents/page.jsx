// src/app/(dashboard)/dashboard/agents/page.jsx
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ResetPasswordDialog } from '@/components/ResetPasswordDialog';
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export default function AgentsPage() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [viewOnly, setViewOnly] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAgents, setTotalAgents] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedShift, setSelectedShift] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

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
  const { hasPermission } = useAuth();

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

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: pageSize,
        search: searchTerm
      };

      const response = await agentService.getAllAgents(params);
      setAgents(response.agents || []);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotalAgents(response.pagination?.total || response.totalAgents || 0);
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast.error('Error fetching agents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [currentPage, pageSize, searchTerm]);

  // Filter agents locally
  const filteredAgents = agents.filter(agent => {
    const matchesShift = selectedShift === 'all' || agent.shift?._id === selectedShift;
    const matchesStatus = selectedStatus === 'all' ||
      (selectedStatus === 'active' && agent.isActive) ||
      (selectedStatus === 'inactive' && !agent.isActive);

    return matchesShift && matchesStatus;
  });

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
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
    setFormData({ ...formData, [name]: value });
  };

  const handleEditSelectChange = (name, value) => {
    setEditFormData({ ...editFormData, [name]: value });
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
      fetchAgents();
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
      fetchAgents();
    } catch (error) {
      console.error('Error updating agent:', error);
      toast.error(error.response?.data?.error || 'Error updating agent');
    } finally {
      setLoading(false);
    }
  };

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
    //
    <div className="container mx-auto p-4 sm:p-6 space-y-6 flex flex-col">
      <div className="bg-white shadow rounded-md p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Agent Management</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage all agents and their shifts</p>
        </div>
        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          {hasPermission('agent', 'create') && (
            <DialogTrigger asChild>
              <Button className="bg-[#10B5DB] hover:bg-[#10B5DB]/90 w-full sm:w-auto">
                Create New Agent
              </Button>
            </DialogTrigger>
          )}
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Agent</DialogTitle>
              <DialogDescription>
                Add a new agent to the system. A welcome email will be sent.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateAgent} className="space-y-4">
              <div className="space-y-2">
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
              <div className="grid grid-cols-2 gap-4">
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
              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={loading || shifts.length === 0} className="flex-1 bg-[#10B5DB] hover:bg-[#10B5DB]/90">
                  {loading ? 'Creating...' : 'Create Agent'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewOnly ? 'View Agent' : 'Edit Agent'}</DialogTitle>
            <DialogDescription>
              {viewOnly ? 'Agent information and settings.' : 'Update agent information and settings.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditAgent} className="space-y-4">
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
            </div>
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
                  <Button type="submit" disabled={loading} className="flex-1 bg-[#10B5DB] hover:bg-[#10B5DB]/90">
                    {loading ? 'Updating...' : 'Update Agent'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowEditForm(false)} className="flex-1">
                    Cancel
                  </Button>
                </>
              )}
              {viewOnly && (
                <Button type="button" variant="outline" onClick={() => setShowEditForm(false)} className="w-full">
                  Close
                </Button>
              )}
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Card className="flex-1 flex flex-col h-full">
        <CardHeader className="pb-4">
          <CardTitle>Agents</CardTitle>
          <CardDescription>View and manage all registered agents</CardDescription>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search agents..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10"
              />
            </div>
            <Select value={selectedShift} onValueChange={setSelectedShift}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by shift" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Shifts</SelectItem>
                {shifts.map(shift => (
                  <SelectItem key={shift._id} value={shift._id}>{shift.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden p-0">
          <div className="overflow-x-auto h-[calc(100vh-30px)]">

            <Table>
              <TableHeader className="sticky top-0 bg-white z-10">
                <TableRow>
                  <TableHead className="min-w-[200px]">Agent Details</TableHead>
                  <TableHead className="min-w-[120px]">Shift</TableHead>
                  <TableHead className="min-w-[120px]">Monthly Target</TableHead>
                  <TableHead className="min-w-[100px]">Status</TableHead>
                  <TableHead className="text-right min-w-[300px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#10B5DB]"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredAgents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      No agents found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAgents.map((agent) => (
                    <TableRow key={agent._id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-gray-900">{agent.agentName}</div>
                          <div className="text-sm text-gray-500">ID: {agent.agentId}</div>
                          <div className="text-sm text-gray-500">{agent.email}</div>
                          <div className="text-xs text-gray-400">
                            Created: {new Date(agent.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {agent.shift ? (
                          <Badge className="bg-[#10B5DB]/10 text-[#10B5DB]">
                            {agent.shift.name}
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800">No Shift</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {agent.monthlyTarget ? agent.monthlyTarget.toLocaleString() : '—'}
                      </TableCell>
                      <TableCell>
                        <Badge className={agent.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {agent.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2 flex-wrap">
                          {hasPermission('agent', 'edit') && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenEdit(agent, 'edit')}
                              className="text-[#10B5DB] hover:text-[#10B5DB]/90 hover:bg-[#10B5DB]/10"
                            >
                              Edit
                            </Button>
                          )}
                          {!hasPermission('agent', 'edit') && hasPermission('agent', 'view') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEdit(agent, 'view')}
                              className="text-gray-600 hover:bg-gray-50"
                            >
                              View
                            </Button>
                          )}
                          {hasPermission('agent', 'edit') && (
                            <ResetPasswordDialog agent={agent} onSuccess={fetchAgents} />
                          )}
                          {hasPermission('agent', 'edit') && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleStatus(agent._id, agent.isActive)}
                              className={agent.isActive ? 'text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50' : 'text-green-600 hover:text-green-700 hover:bg-green-50'}
                            >
                              {agent.isActive ? 'Deactivate' : 'Activate'}
                            </Button>
                          )}
                          {hasPermission('agent', 'delete') && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteAgent(agent._id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              Delete
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>

        <div className="border-t px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{filteredAgents.length > 0 ? ((currentPage - 1) * pageSize) + 1 : 0}</span> to{' '}
            <span className="font-medium">{Math.min(currentPage * pageSize, totalAgents)}</span> of{' '}
            <span className="font-medium">{totalAgents}</span> results
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-1">
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className={currentPage === pageNum ? "bg-[#10B5DB] hover:bg-[#10B5DB]/90" : ""}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>

          {/* <Select value={pageSize.toString()} onValueChange={(v) => {
            setPageSize(parseInt(v));
            setCurrentPage(1);
          }}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 / page</SelectItem>
              <SelectItem value="10">10 / page</SelectItem>
              <SelectItem value="20">20 / page</SelectItem>
              <SelectItem value="50">50 / page</SelectItem>
            </SelectContent>
          </Select> */}
        </div>
      </Card>
    </div>
  );
}
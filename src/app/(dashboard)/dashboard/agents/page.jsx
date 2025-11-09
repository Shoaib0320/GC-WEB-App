'use client';
import { useState, useEffect } from 'react';
import { agentService } from '@/services/agentService';
import { shiftService } from '@/services/shiftService';
import { toast } from 'sonner';

// Shadcn UI Components
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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

export default function AgentsPage() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [pagination, setPagination] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    agentName: '',
    agentId: '',
    shift: '',
    email: '',
    password: ''
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

  // Available shifts (backend se fetch hongi)
  const [shifts, setShifts] = useState([]);
  const [shiftsLoading, setShiftsLoading] = useState(false);

  // Fetch shifts from backend
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

  // Fetch agents
  const fetchAgents = async (page = 1, search = '') => {
    setLoading(true);
    try {
      const response = await agentService.getAllAgents({
        page,
        limit: 10,
        search
      });
      setAgents(response.agents);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast.error('Error fetching agents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
    fetchShifts();
  }, []);

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    fetchAgents(1, e.target.value);
  };

  // Handle form input change
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handle edit form input change
  const handleEditInputChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value
    });
  };

  // Handle select change
  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle edit select change
  const handleEditSelectChange = (name, value) => {
    setEditFormData({
      ...editFormData,
      [name]: value
    });
  };

  // Generate random password
  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, password });
  };

  // Create new agent
  const handleCreateAgent = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.shift) {
      toast.warning('Please select a shift');
      return;
    }

    setLoading(true);
    try {
      await agentService.createAgent(formData);
      toast.success('Agent created successfully! Welcome email sent.');
      setShowCreateForm(false);
      setFormData({
        agentName: '',
        agentId: '',
        shift: '',
        email: '',
        password: ''
      });
      fetchAgents(); // Refresh list
    } catch (error) {
      console.error('Error creating agent:', error);
      toast.error(error.response?.data?.error || 'Error creating agent');
    } finally {
      setLoading(false);
    }
  };

  // Edit agent
  const handleEditAgent = async (e) => {
    e.preventDefault();

    // Validation
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
        monthlyTarget: editFormData.monthlyTarget,
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
  const handleOpenEdit = (agent) => {
    setEditFormData({
      _id: agent._id,
      agentName: agent.agentName,
      agentId: agent.agentId,
      shift: agent.shift?._id || '',
      email: agent.email,
      monthlyTarget: agent.monthlyTarget || 0,
      isActive: agent.isActive
    });
    setShowEditForm(true);
  };

  // Delete agent
  const handleDeleteAgent = async (agentId) => {
    if (!confirm('Are you sure you want to delete this agent?')) return;

    try {
      await agentService.deleteAgent(agentId);
      toast.success('Agent deleted successfully');
      fetchAgents(); // Refresh list
    } catch (error) {
      console.error('Error deleting agent:', error);
      toast.error('Error deleting agent');
    }
  };

  // Toggle agent status
  const handleToggleStatus = async (agentId, currentStatus) => {
    try {
      await agentService.updateAgentStatus(agentId, !currentStatus);
      toast.success(`Agent ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchAgents(); // Refresh list
    } catch (error) {
      console.error('Error updating agent status:', error);
      toast.error('Error updating status');
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agent Management</h1>
          <p className="text-gray-600 mt-1">Manage all agents and their shifts</p>
        </div>
        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Create New Agent
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Agent</DialogTitle>
              <DialogDescription>
                Add a new agent to the system. A welcome email will be sent with login credentials.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateAgent} className="space-y-4">
              {/* Agent Name */}
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

              {/* Agent ID */}
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

              {/* Shift Selection */}
              <div className="space-y-2">
                <Label htmlFor="shift">Shift</Label>
                <Select
                  value={formData.shift}
                  onValueChange={(value) => handleSelectChange('shift', value)}
                  disabled={shiftsLoading}
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
                {shifts.length === 0 && !shiftsLoading && (
                  <p className="text-red-500 text-sm">
                    No shifts available. Please create shifts first.
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter agent email address"
                />
              </div>

              {/* Monthly Target */}
              <div className="space-y-2">
                <Label htmlFor="monthlyTarget">Monthly Target</Label>
                <Input
                  id="monthlyTarget"
                  name="monthlyTarget"
                  type="number"
                  value={formData.monthlyTarget || ''}
                  onChange={handleInputChange}
                  placeholder="Enter monthly sales target"
                  min="0"
                />
              </div>

              {/* Password */}
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
                    placeholder="Generate or enter password"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generatePassword}
                  >
                    Generate
                  </Button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={loading || shifts.length === 0}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? 'Creating...' : 'Create Agent'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
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
              />
            </div>

            {/* Shift Selection */}
            <div className="space-y-2">
              <Label htmlFor="edit-shift">Shift</Label>
              <Select
                value={editFormData.shift}
                onValueChange={(value) => handleEditSelectChange('shift', value)}
                disabled={shiftsLoading}
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
              />
            </div>

            {/* Monthly Target */}
            <div className="space-y-2">
              <Label htmlFor="edit-monthlyTarget">Monthly Target</Label>
              <Input
                id="edit-monthlyTarget"
                name="monthlyTarget"
                type="number"
                value={editFormData.monthlyTarget}
                onChange={handleEditInputChange}
                placeholder="Enter monthly sales target"
                min="0"
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={editFormData.isActive.toString()}
                onValueChange={(value) => handleEditSelectChange('isActive', value === 'true')}
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
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Search Bar */}
      {/* <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search agents by name, ID, or email..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </CardContent>
      </Card> */}

      {/* Agents List */}
      {/* <Card>
        <CardHeader>
          <CardTitle>Agents</CardTitle>
          <CardDescription>
            View and manage all registered agents in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading agents...</p>
            </div>
          ) : agents.length === 0 ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No agents</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new agent.
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent Details</TableHead>
                    <TableHead>Shift</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agents.map((agent) => (
                    <TableRow key={agent._id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-gray-900">
                            {agent.agentName}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {agent.agentId}
                          </div>
                          <div className="text-sm text-gray-500">
                            {agent.email}
                          </div>
                          <div className="text-xs text-gray-400">
                            Created: {new Date(agent.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {agent.shift ? (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            {agent.shift.shiftName}
                            <span className="ml-1 text-xs">
                              ({agent.shift.startTime} - {agent.shift.endTime})
                            </span>
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-100 text-gray-800">
                            No Shift
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={agent.isActive ? "default" : "secondary"}
                          className={agent.isActive
                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                            : "bg-red-100 text-red-800 hover:bg-red-100"
                          }
                        >
                          {agent.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEdit(agent)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleStatus(agent._id, agent.isActive)}
                            className={
                              agent.isActive
                                ? 'text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50'
                                : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                            }
                          >
                            {agent.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteAgent(agent._id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{(pagination.currentPage - 1) * 10 + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(pagination.currentPage * 10, pagination.totalAgents)}
                </span> of{' '}
                <span className="font-medium">{pagination.totalAgents}</span> agents
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchAgents(pagination.currentPage - 1, searchTerm)}
                  disabled={!pagination.hasPrev}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchAgents(pagination.currentPage + 1, searchTerm)}
                  disabled={!pagination.hasNext}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card> */}
      <Card>
  <CardHeader>
    <CardTitle>Agents</CardTitle>
    <CardDescription>
      View and manage all registered agents in the system
    </CardDescription>
  </CardHeader>

  <CardContent>
    {loading ? (
      <div className="text-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-2">Loading agents...</p>
      </div>
    ) : agents.length === 0 ? (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No agents found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by creating a new agent.
        </p>
      </div>
    ) : (
      <div className="rounded-lg border bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="font-semibold text-gray-800">Agent Info</TableHead>
              <TableHead className="font-semibold text-gray-800">Shift</TableHead>
              <TableHead className="font-semibold text-gray-800">Monthly Target</TableHead>
              <TableHead className="font-semibold text-gray-800">Status</TableHead>
              <TableHead className="text-right font-semibold text-gray-800">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {agents.map((agent) => (
              <TableRow
                key={agent._id}
                className="hover:bg-gray-50 transition-all duration-150"
              >
                {/* Agent Info */}
                <TableCell className="py-4">
                  <div className="space-y-1">
                    <div className="font-medium text-gray-900 text-base">
                      {agent.agentName}
                    </div>
                    <div className="text-sm text-gray-500">
                      ID: <span className="font-mono">{agent.agentId}</span>
                    </div>
                    <div className="text-sm text-gray-500">{agent.email}</div>
                    <div className="text-xs text-gray-400">
                      Created:{" "}
                      {new Date(agent.createdAt).toLocaleDateString("en-GB")}
                    </div>
                  </div>
                </TableCell>

                {/* Shift */}
                <TableCell className="py-4">
                  {agent.shift ? (
                    <Badge
                      variant="secondary"
                      className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-md"
                    >
                      {agent.shift.shiftName}
                      <span className="ml-1 text-xs text-gray-500">
                        ({agent.shift.startTime} - {agent.shift.endTime})
                      </span>
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-gray-100 text-gray-700 border-gray-300 px-3 py-1"
                    >
                      No Shift
                    </Badge>
                  )}
                </TableCell>

                {/* Monthly Target */}
                <TableCell className="py-4">
                  <div className="font-semibold text-gray-800">
                    {agent.monthlyTarget ? agent.monthlyTarget : "—"}
                  </div>
                  <div className="text-xs text-gray-500">Target / Month</div>
                </TableCell>

                {/* Status */}
                <TableCell className="py-4">
                  <Badge
                    variant={agent.isActive ? "default" : "secondary"}
                    className={
                      agent.isActive
                        ? "bg-green-50 text-green-700 border border-green-200 px-3 py-1"
                        : "bg-red-50 text-red-700 border border-red-200 px-3 py-1"
                    }
                  >
                    {agent.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>

                {/* Actions */}
                <TableCell className="py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEdit(agent)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      Edit
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleToggleStatus(agent._id, agent.isActive)
                      }
                      className={
                        agent.isActive
                          ? "text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                          : "text-green-600 hover:text-green-700 hover:bg-green-50"
                      }
                    >
                      {agent.isActive ? "Deactivate" : "Activate"}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteAgent(agent._id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )}

    {/* Pagination */}
    {pagination.totalPages > 1 && (
      <div className="flex items-center justify-between space-x-2 py-6 px-1">
        <div className="text-sm text-gray-700">
          Showing{" "}
          <span className="font-medium">
            {(pagination.currentPage - 1) * 10 + 1}
          </span>{" "}
          to{" "}
          <span className="font-medium">
            {Math.min(
              pagination.currentPage * 10,
              pagination.totalAgents
            )}
          </span>{" "}
          of <span className="font-medium">{pagination.totalAgents}</span>{" "}
          agents
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              fetchAgents(pagination.currentPage - 1, searchTerm)
            }
            disabled={!pagination.hasPrev}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              fetchAgents(pagination.currentPage + 1, searchTerm)
            }
            disabled={!pagination.hasNext}
          >
            Next
          </Button>
        </div>
      </div>
    )}
  </CardContent>
</Card>

    </div>
  );
}
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
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  Eye,
  Edit,
  Trash2,
  Key,
  UserCheck,
  UserX,
  Plus,
  Filter,
  Download,
  Mail,
  Phone,
  Calendar,
  Target,
  Clock,
  Hash,
  DollarSign,
  Building,
  Briefcase,
  Shield
} from 'lucide-react';

// Constants
const EMPLOYEE_TYPES = [
  { value: 'Permanent', label: 'Permanent' },
  { value: 'Contract', label: 'Contract' },
  { value: 'Temporary', label: 'Temporary' },
  { value: 'Probation', label: 'Probation' },
  { value: 'Intern', label: 'Intern' }
];

const DESIGNATIONS = [
  { value: 'Sales Agent', label: 'Sales Agent' },
  { value: 'Senior Agent', label: 'Senior Agent' },
  { value: 'Team Lead', label: 'Team Lead' },
  { value: 'Supervisor', label: 'Supervisor' },
  { value: 'Manager', label: 'Manager' },
  { value: 'Executive', label: 'Executive' },
  { value: 'Trainee', label: 'Trainee' }
];

const TARGET_TYPES = [
  { value: 'none', label: 'No Target' },
  { value: 'digit', label: 'Digit Target (Quantity)' },
  { value: 'amount', label: 'Amount Target (Revenue)' },
  { value: 'both', label: 'Both Targets' }
];

const CURRENCIES = [
  { value: 'PKR', label: 'PKR' },
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
  { value: 'GBP', label: 'GBP' }
];

const PAGE_SIZES = [
  { value: 5, label: '5 / page' },
  { value: 10, label: '10 / page' },
  { value: 20, label: '20 / page' },
  { value: 50, label: '50 / page' }
];

export default function AgentsPage() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAgents, setTotalAgents] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedShift, setSelectedShift] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedEmployeeType, setSelectedEmployeeType] = useState('all');
  const [selectedTargetType, setSelectedTargetType] = useState('all');

  // Form states
  const [formData, setFormData] = useState({
    agentName: '',
    agentId: '',
    shift: '',
    email: '',
    phone: '',
    password: '',
    monthlyTargetType: 'none',
    monthlyDigitTarget: '',
    monthlyAmountTarget: '',
    targetCurrency: 'PKR',
    employeeType: 'Permanent',
    designation: 'Sales Agent'
  });

  const [editFormData, setEditFormData] = useState({
    _id: '',
    agentName: '',
    agentId: '',
    shift: '',
    email: '',
    phone: '',
    monthlyTargetType: 'none',
    monthlyDigitTarget: '',
    monthlyAmountTarget: '',
    targetCurrency: 'PKR',
    employeeType: 'Permanent',
    designation: 'Sales Agent',
    isActive: true
  });

  const [shifts, setShifts] = useState([]);
  const [shiftsLoading, setShiftsLoading] = useState(false);
  const { hasPermission } = useAuth();

  // Agent ID validation
  const validateAgentId = (agentId) => {
    const regex = /^[A-Za-z]{2}\d{4}$/;
    return regex.test(agentId);
  };

  // Fetch shifts
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

  // Filter agents
  const filteredAgents = agents.filter(agent => {
    const matchesShift = selectedShift === 'all' || agent.shift?._id === selectedShift;
    const matchesStatus = selectedStatus === 'all' ||
      (selectedStatus === 'active' && agent.isActive) ||
      (selectedStatus === 'inactive' && !agent.isActive);
    const matchesEmployeeType = selectedEmployeeType === 'all' || 
      agent.employeeType === selectedEmployeeType;
    const matchesTargetType = selectedTargetType === 'all' || 
      agent.monthlyTargetType === selectedTargetType;

    return matchesShift && matchesStatus && matchesEmployeeType && matchesTargetType;
  });

  // Event handlers
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    let newValue = value;
    
    if (name === 'agentId') {
      newValue = value.toUpperCase().replace(/\s/g, '');
    } else if (name === 'monthlyDigitTarget') {
      newValue = value.replace(/[^0-9]/g, '');
    } else if (name === 'monthlyAmountTarget') {
      newValue = value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    }
    
    setFormData({
      ...formData,
      [name]: newValue
    });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    
    let newValue = value;
    
    if (name === 'agentId') {
      newValue = value.toUpperCase().replace(/\s/g, '');
    } else if (name === 'monthlyDigitTarget') {
      newValue = value.replace(/[^0-9]/g, '');
    } else if (name === 'monthlyAmountTarget') {
      newValue = value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    }
    
    setEditFormData({
      ...editFormData,
      [name]: newValue
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
    
    // Validations
    if (!formData.shift) {
      toast.warning('Please select a shift');
      return;
    }
    
    if (!validateAgentId(formData.agentId)) {
      toast.warning('Agent ID must be in format: 2 letters + 4 digits (e.g., AB1234)');
      return;
    }
    
    setLoading(true);
    try {
      await agentService.createAgent({
        ...formData,
        monthlyDigitTarget: formData.monthlyDigitTarget ? parseInt(formData.monthlyDigitTarget) : 0,
        monthlyAmountTarget: formData.monthlyAmountTarget ? parseFloat(formData.monthlyAmountTarget) : 0,
        agentId: formData.agentId.toUpperCase()
      });
      toast.success('Agent created successfully!');
      setShowCreateForm(false);
      setFormData({
        agentName: '',
        agentId: '',
        shift: '',
        email: '',
        phone: '',
        password: '',
        monthlyTargetType: 'none',
        monthlyDigitTarget: '',
        monthlyAmountTarget: '',
        targetCurrency: 'PKR',
        employeeType: 'Permanent',
        designation: 'Sales Agent'
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
    
    if (!validateAgentId(editFormData.agentId)) {
      toast.warning('Agent ID must be in format: 2 letters + 4 digits (e.g., AB1234)');
      return;
    }
    
    setLoading(true);
    try {
      await agentService.updateAgent(editFormData._id, {
        agentName: editFormData.agentName,
        agentId: editFormData.agentId.toUpperCase(),
        shift: editFormData.shift,
        email: editFormData.email,
        phone: editFormData.phone,
        monthlyTargetType: editFormData.monthlyTargetType,
        monthlyDigitTarget: editFormData.monthlyDigitTarget ? parseInt(editFormData.monthlyDigitTarget) : 0,
        monthlyAmountTarget: editFormData.monthlyAmountTarget ? parseFloat(editFormData.monthlyAmountTarget) : 0,
        targetCurrency: editFormData.targetCurrency,
        employeeType: editFormData.employeeType,
        designation: editFormData.designation,
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
        phone: '',
        monthlyTargetType: 'none',
        monthlyDigitTarget: '',
        monthlyAmountTarget: '',
        targetCurrency: 'PKR',
        employeeType: 'Permanent',
        designation: 'Sales Agent',
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

  const handleOpenEdit = (agent) => {
    setEditFormData({
      _id: agent._id,
      agentName: agent.agentName,
      agentId: agent.agentId,
      shift: agent.shift?._id || '',
      email: agent.email,
      phone: agent.phone || '',
      monthlyTargetType: agent.monthlyTargetType || 'none',
      monthlyDigitTarget: agent.monthlyDigitTarget?.toString() || '',
      monthlyAmountTarget: agent.monthlyAmountTarget?.toString() || '',
      targetCurrency: agent.targetCurrency || 'PKR',
      employeeType: agent.employeeType || 'Permanent',
      designation: agent.designation || 'Sales Agent',
      isActive: agent.isActive
    });
    setShowEditForm(true);
  };

  const handleViewAgent = (agent) => {
    setSelectedAgent(agent);
    setShowViewModal(true);
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

  // Effects
  useEffect(() => {
    fetchShifts();
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [currentPage, pageSize, searchTerm]);

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="h-7 w-7 text-[#10B5DB]" />
            Agent Management
          </h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage all agents and their targets</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Export
          </Button>
          
          {hasPermission('agent', 'create') && (
            <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
              <DialogTrigger asChild>
                <Button className="blue-button gap-2">
                  <Plus className="h-4 w-4" />
                  Create New Agent
                </Button>
              </DialogTrigger>
              
              <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Agent</DialogTitle>
                  <DialogDescription>
                    Add a new agent to the system. A welcome email will be sent.
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleCreateAgent} className="space-y-4">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="agentName">Agent Name *</Label>
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
                      <Label htmlFor="agentId">Agent ID * <span className="text-xs text-muted-foreground">(e.g., AB1234)</span></Label>
                      <Input
                        id="agentId"
                        name="agentId"
                        value={formData.agentId}
                        onChange={handleInputChange}
                        required
                        placeholder="AB1234"
                        maxLength={6}
                        className={formData.agentId && !validateAgentId(formData.agentId) ? "border-red-500" : ""}
                      />
                      {formData.agentId && !validateAgentId(formData.agentId) && (
                        <p className="text-xs text-red-500">Format: 2 letters + 4 digits (e.g., AB1234)</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="agent@example.com"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+92 300 1234567"
                      />
                    </div>
                  </div>

                  {/* Employee Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="employeeType">Employee Type</Label>
                      <Select 
                        value={formData.employeeType} 
                        onValueChange={(v) => handleSelectChange('employeeType', v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {EMPLOYEE_TYPES.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="designation">Designation</Label>
                      <Select 
                        value={formData.designation} 
                        onValueChange={(v) => handleSelectChange('designation', v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DESIGNATIONS.map(designation => (
                            <SelectItem key={designation.value} value={designation.value}>
                              {designation.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Target Settings */}
                  <div className="border-t pt-4 mt-2">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Monthly Target Settings
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="monthlyTargetType">Target Type</Label>
                        <Select 
                          value={formData.monthlyTargetType} 
                          onValueChange={(v) => handleSelectChange('monthlyTargetType', v)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TARGET_TYPES.map(type => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Digit Target */}
                        {(formData.monthlyTargetType === 'digit' || formData.monthlyTargetType === 'both') && (
                          <div className="space-y-2">
                            <Label htmlFor="monthlyDigitTarget" className="flex items-center gap-2">
                              <Hash className="h-4 w-4" />
                              Digit Target (Quantity)
                            </Label>
                            <Input
                              id="monthlyDigitTarget"
                              name="monthlyDigitTarget"
                              value={formData.monthlyDigitTarget}
                              onChange={handleInputChange}
                              placeholder="e.g., 100"
                            />
                            <p className="text-xs text-muted-foreground">Number of items (calls, settlements, etc.)</p>
                          </div>
                        )}

                        {/* Amount Target */}
                        {(formData.monthlyTargetType === 'amount' || formData.monthlyTargetType === 'both') && (
                          <div className="space-y-2">
                            <Label htmlFor="monthlyAmountTarget" className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4" />
                              Amount Target (Revenue)
                            </Label>
                            <div className="flex gap-2">
                              <Select 
                                value={formData.targetCurrency} 
                                onValueChange={(v) => handleSelectChange('targetCurrency', v)}
                                className="w-24"
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {CURRENCIES.map(currency => (
                                    <SelectItem key={currency.value} value={currency.value}>
                                      {currency.value}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Input
                                id="monthlyAmountTarget"
                                name="monthlyAmountTarget"
                                value={formData.monthlyAmountTarget}
                                onChange={handleInputChange}
                                placeholder="e.g., 500000"
                                className="flex-1"
                              />
                            </div>
                            <p className="text-xs text-muted-foreground">Revenue or sales amount</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Shift & Password */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="shift" className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Shift *
                      </Label>
                      <Select 
                        value={formData.shift} 
                        onValueChange={(v) => handleSelectChange('shift', v)} 
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
                                {shift.name} ({shift.startTime}-{shift.endTime})
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password" className="flex items-center gap-2">
                        <Key className="h-4 w-4" />
                        Password *
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="password"
                          name="password"
                          type="text"
                          value={formData.password}
                          onChange={handleInputChange}
                          required
                          placeholder="Enter password"
                        />
                        <Button type="button" variant="outline" onClick={generatePassword} className="whitespace-nowrap">
                          Generate
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="submit"
                      disabled={loading || shifts.length === 0 || !validateAgentId(formData.agentId)}
                      className="flex-1 blue-button gap-2"
                    >
                      {loading ? 'Creating...' : (
                        <>
                          <Plus className="h-4 w-4" />
                          Create Agent
                        </>
                      )}
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
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit Agent
            </DialogTitle>
            <DialogDescription>
              Update agent information and settings.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleEditAgent} className="space-y-4">
            {/* Edit Form Structure - Similar to Create Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-agentName">Agent Name *</Label>
                <Input
                  id="edit-agentName"
                  name="agentName"
                  value={editFormData.agentName}
                  onChange={handleEditInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-agentId">Agent ID *</Label>
                <Input
                  id="edit-agentId"
                  name="agentId"
                  value={editFormData.agentId}
                  onChange={handleEditInputChange}
                  required
                  className={editFormData.agentId && !validateAgentId(editFormData.agentId) ? "border-red-500" : ""}
                />
                {editFormData.agentId && !validateAgentId(editFormData.agentId) && (
                  <p className="text-xs text-red-500">Format: 2 letters + 4 digits (e.g., AB1234)</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  name="email"
                  type="email"
                  value={editFormData.email}
                  onChange={handleEditInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone Number</Label>
                <Input
                  id="edit-phone"
                  name="phone"
                  value={editFormData.phone}
                  onChange={handleEditInputChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-employeeType">Employee Type</Label>
                <Select
                  value={editFormData.employeeType}
                  onValueChange={(value) => handleEditSelectChange('employeeType', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EMPLOYEE_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-designation">Designation</Label>
                <Select
                  value={editFormData.designation}
                  onValueChange={(value) => handleEditSelectChange('designation', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DESIGNATIONS.map(designation => (
                      <SelectItem key={designation.value} value={designation.value}>
                        {designation.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Target Settings */}
            <div className="border-t pt-4 mt-2">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Target className="h-5 w-5" />
                Monthly Target Settings
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-monthlyTargetType">Target Type</Label>
                  <Select
                    value={editFormData.monthlyTargetType}
                    onValueChange={(value) => handleEditSelectChange('monthlyTargetType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TARGET_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(editFormData.monthlyTargetType === 'digit' || editFormData.monthlyTargetType === 'both') && (
                    <div className="space-y-2">
                      <Label htmlFor="edit-monthlyDigitTarget" className="flex items-center gap-2">
                        <Hash className="h-4 w-4" />
                        Digit Target
                      </Label>
                      <Input
                        id="edit-monthlyDigitTarget"
                        name="monthlyDigitTarget"
                        value={editFormData.monthlyDigitTarget}
                        onChange={handleEditInputChange}
                      />
                    </div>
                  )}

                  {(editFormData.monthlyTargetType === 'amount' || editFormData.monthlyTargetType === 'both') && (
                    <div className="space-y-2">
                      <Label htmlFor="edit-monthlyAmountTarget" className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Amount Target
                      </Label>
                      <div className="flex gap-2">
                        <Select
                          value={editFormData.targetCurrency}
                          onValueChange={(value) => handleEditSelectChange('targetCurrency', value)}
                          className="w-24"
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CURRENCIES.map(currency => (
                              <SelectItem key={currency.value} value={currency.value}>
                                {currency.value}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          id="edit-monthlyAmountTarget"
                          name="monthlyAmountTarget"
                          value={editFormData.monthlyAmountTarget}
                          onChange={handleEditInputChange}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-shift" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Shift *
                </Label>
                <Select
                  value={editFormData.shift}
                  onValueChange={(value) => handleEditSelectChange('shift', value)}
                  disabled={shiftsLoading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {shifts.map(shift => (
                      <SelectItem key={shift._id} value={shift._id}>
                        {shift.name} ({shift.startTime} - {shift.endTime})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-status" className="flex items-center gap-2">
                  {editFormData.isActive ? (
                    <UserCheck className="h-4 w-4 text-green-600" />
                  ) : (
                    <UserX className="h-4 w-4 text-red-600" />
                  )}
                  Status
                </Label>
                <Select
                  value={editFormData.isActive.toString()}
                  onValueChange={(value) => handleEditSelectChange('isActive', value === 'true')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={loading || !validateAgentId(editFormData.agentId)}
                className="flex-1 blue-button gap-2"
              >
                {loading ? 'Updating...' : (
                  <>
                    <Edit className="h-4 w-4" />
                    Update Agent
                  </>
                )}
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

      {/* View Agent Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          {selectedAgent && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-[#10B5DB]" />
                  Agent Details
                </DialogTitle>
                <DialogDescription>
                  Complete information about {selectedAgent.agentName}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Agent Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#10B5DB] to-blue-600 flex items-center justify-center text-white font-bold text-xl">
                    {selectedAgent.agentName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedAgent.agentName}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className="bg-blue-100 text-blue-800">
                        ID: {selectedAgent.agentId}
                      </Badge>
                      <Badge className={selectedAgent.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {selectedAgent.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span className="font-medium">Email:</span>
                    </div>
                    <p className="text-gray-900">{selectedAgent.email}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span className="font-medium">Phone:</span>
                    </div>
                    <p className="text-gray-900">{selectedAgent.phone || 'Not provided'}</p>
                  </div>
                </div>

                {/* Employment Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Building className="h-4 w-4" />
                      <span className="font-medium">Employee Type:</span>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">
                      {selectedAgent.employeeType}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Briefcase className="h-4 w-4" />
                      <span className="font-medium">Designation:</span>
                    </div>
                    <p className="text-gray-900">{selectedAgent.designation}</p>
                  </div>
                </div>

                {/* Shift Information */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">Shift:</span>
                  </div>
                  {selectedAgent.shift ? (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{selectedAgent.shift.name}</span>
                        <Badge className="bg-[#10B5DB]/10 text-[#10B5DB]">
                          {selectedAgent.shift.startTime} - {selectedAgent.shift.endTime}
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">No shift assigned</p>
                  )}
                </div>

                {/* Target Information */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Target className="h-4 w-4" />
                    <span className="font-medium">Monthly Targets:</span>
                  </div>
                  
                  {selectedAgent.monthlyTargetType === 'none' ? (
                    <p className="text-gray-500">No targets set</p>
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Target Type:</span>
                        <Badge className={
                          selectedAgent.monthlyTargetType === 'digit' ? 'bg-blue-100 text-blue-800' :
                          selectedAgent.monthlyTargetType === 'amount' ? 'bg-green-100 text-green-800' :
                          'bg-purple-100 text-purple-800'
                        }>
                          {selectedAgent.monthlyTargetType === 'digit' ? 'Digit Target' :
                           selectedAgent.monthlyTargetType === 'amount' ? 'Amount Target' : 'Both Targets'}
                        </Badge>
                      </div>
                      
                      {(selectedAgent.monthlyTargetType === 'digit' || selectedAgent.monthlyTargetType === 'both') && 
                       selectedAgent.monthlyDigitTarget > 0 && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Hash className="h-4 w-4 text-gray-500" />
                            <span>Digit Target:</span>
                          </div>
                          <span className="font-bold text-lg">
                            {selectedAgent.monthlyDigitTarget.toLocaleString()}
                          </span>
                        </div>
                      )}
                      
                      {(selectedAgent.monthlyTargetType === 'amount' || selectedAgent.monthlyTargetType === 'both') && 
                       selectedAgent.monthlyAmountTarget > 0 && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-gray-500" />
                            <span>Amount Target:</span>
                          </div>
                          <span className="font-bold text-lg">
                            {selectedAgent.monthlyAmountTarget.toLocaleString()} {selectedAgent.targetCurrency}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Account Information */}
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-700 mb-3">Account Information</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <div className="text-sm text-gray-600">Account Created:</div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900">
                          {new Date(selectedAgent.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="text-sm text-gray-600">Last Updated:</div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900">
                          {new Date(selectedAgent.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6">
                <Button
                  variant="outline"
                  onClick={() => handleOpenEdit(selectedAgent)}
                  className="gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
                <Button
                  onClick={() => setShowViewModal(false)}
                  className="blue-button"
                >
                  Close
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Main Content Card */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Agents List</CardTitle>
              <CardDescription>
                Showing {filteredAgents.length} of {totalAgents} agents
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-600">
                Page size:
              </div>
              <Select 
                value={pageSize.toString()} 
                onValueChange={(v) => {
                  setPageSize(parseInt(v));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZES.map(size => (
                    <SelectItem key={size.value} value={size.value.toString()}>
                      {size.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-4">
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name, ID, email..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedShift} onValueChange={setSelectedShift}>
              <SelectTrigger>
                <SelectValue placeholder="All Shifts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Shifts</SelectItem>
                {shifts.map(shift => (
                  <SelectItem key={shift._id} value={shift._id}>
                    {shift.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedEmployeeType} onValueChange={setSelectedEmployeeType}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {EMPLOYEE_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedTargetType} onValueChange={setSelectedTargetType}>
              <SelectTrigger>
                <SelectValue placeholder="All Targets" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Targets</SelectItem>
                {TARGET_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Agent</TableHead>
                  <TableHead className="w-[150px]">Details</TableHead>
                  <TableHead className="w-[120px]">Targets</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[180px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#10B5DB]"></div>
                        <p className="text-sm text-gray-500">Loading agents...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredAgents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="text-gray-400">
                          <Search className="h-12 w-12" />
                        </div>
                        <p className="text-gray-500 font-medium">No agents found</p>
                        <p className="text-sm text-gray-400">Try changing your search or filters</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAgents.map((agent) => (
                    <TableRow key={agent._id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-semibold text-gray-900">{agent.agentName}</div>
                          <div className="text-sm text-gray-500">ID: {agent.agentId}</div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="h-3 w-3" />
                            <span className="truncate">{agent.email}</span>
                          </div>
                          {agent.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="h-3 w-3" />
                              <span>{agent.phone}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <Badge variant="outline" className={
                            agent.monthlyTargetType === 'none' ? 'text-gray-400' :
                            agent.monthlyTargetType === 'digit' ? 'text-blue-600' :
                            agent.monthlyTargetType === 'amount' ? 'text-green-600' :
                            'text-purple-600'
                          }>
                            {agent.monthlyTargetType === 'none' ? 'No Target' :
                             agent.monthlyTargetType === 'digit' ? 'Digit' :
                             agent.monthlyTargetType === 'amount' ? 'Amount' : 'Both'}
                          </Badge>
                          
                          {agent.monthlyTargetType !== 'none' && (
                            <div className="text-xs space-y-0.5">
                              {(agent.monthlyTargetType === 'digit' || agent.monthlyTargetType === 'both') && 
                               agent.monthlyDigitTarget > 0 && (
                                <div className="flex items-center gap-1">
                                  <Hash className="h-3 w-3" />
                                  <span>{agent.monthlyDigitTarget.toLocaleString()}</span>
                                </div>
                              )}
                              
                              {(agent.monthlyTargetType === 'amount' || agent.monthlyTargetType === 'both') && 
                               agent.monthlyAmountTarget > 0 && (
                                <div className="flex items-center gap-1">
                                  <DollarSign className="h-3 w-3" />
                                  <span>{agent.monthlyAmountTarget.toLocaleString()} {agent.targetCurrency}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge className={
                          agent.isActive 
                            ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                            : 'bg-red-100 text-red-800 hover:bg-red-100'
                        }>
                          {agent.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          {/* View Button - Always Visible */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewAgent(agent)}
                            className="h-8 w-8 p-0 text-gray-600 hover:text-[#10B5DB] hover:bg-[#10B5DB]/10"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {/* Edit Button */}
                          {hasPermission('agent', 'edit') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEdit(agent)}
                              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              title="Edit Agent"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {/* Reset Password */}
                          {hasPermission('agent', 'edit') && (
                            <ResetPasswordDialog 
                              agent={agent} 
                              onSuccess={fetchAgents}
                              trigger={
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                                  title="Reset Password"
                                >
                                  <Key className="h-4 w-4" />
                                </Button>
                              }
                            />
                          )}
                          
                          {/* Activate/Deactivate */}
                          {hasPermission('agent', 'edit') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleStatus(agent._id, agent.isActive)}
                              className={`h-8 w-8 p-0 ${
                                agent.isActive 
                                  ? 'text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50' 
                                  : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                              }`}
                              title={agent.isActive ? 'Deactivate' : 'Activate'}
                            >
                              {agent.isActive ? (
                                <UserX className="h-4 w-4" />
                              ) : (
                                <UserCheck className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                          
                          {/* Delete Button */}
                          {hasPermission('agent', 'delete') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteAgent(agent._id)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Delete Agent"
                            >
                              <Trash2 className="h-4 w-4" />
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

        {/* Pagination */}
        <div className="border-t px-6 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              Showing <span className="font-medium">{Math.min(((currentPage - 1) * pageSize) + 1, totalAgents)}</span> to{' '}
              <span className="font-medium">{Math.min(currentPage * pageSize, totalAgents)}</span> of{' '}
              <span className="font-medium">{totalAgents}</span> agents
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0"
                title="First Page"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0"
                title="Previous Page"
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
                  
                  if (pageNum > 0 && pageNum <= totalPages) {
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`h-8 w-8 p-0 ${
                          currentPage === pageNum
                            ? "blue-button"
                            : ""
                        }`}
                      >
                        {pageNum}
                      </Button>
                    );
                  }
                  return null;
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0"
                title="Next Page"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0"
                title="Last Page"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
// // src/app/agents/page.js
// "use client";
// import React, { useState, useEffect } from 'react';
// import { useAuth } from '@/context/AuthContext';
// import { agentService } from '@/services/agentService';
// import { shiftService } from '@/services/shiftService';
// import { toast } from 'sonner';

// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from '@/components/ui/dialog';
// import GlobalData from '@/components/common/GlobalData';
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import { ResetPasswordDialog } from '@/components/ResetPasswordDialog';

// export default function AgentsPage() {
//   const [agents, setAgents] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [showCreateForm, setShowCreateForm] = useState(false);
//   const [showEditForm, setShowEditForm] = useState(false);
//   const [viewOnly, setViewOnly] = useState(false);
//   const [pagination, setPagination] = useState({});
//   const [searchTerm, setSearchTerm] = useState('');
//   const [reloadKey, setReloadKey] = useState(0);

//   const [formData, setFormData] = useState({
//     agentName: '',
//     agentId: '',
//     shift: '',
//     email: '',
//     password: '',
//     monthlyTarget: ''
//   });

//   const [editFormData, setEditFormData] = useState({
//     _id: '',
//     agentName: '',
//     agentId: '',
//     shift: '',
//     email: '',
//     monthlyTarget: '',
//     isActive: true
//   });

//   const [shifts, setShifts] = useState([]);
//   const [shiftsLoading, setShiftsLoading] = useState(false);

//   const fetchShifts = async () => {
//     setShiftsLoading(true);
//     try {
//       const response = await shiftService.getShiftsForDropdown();
//       setShifts(response);
//     } catch (error) {
//       console.error('Error fetching shifts:', error);
//       toast.error('Error fetching shifts');
//     } finally {
//       setShiftsLoading(false);
//     }
//   };

//   const fetchAgents = async (page = 1, search = '') => {
//     setReloadKey((k) => k + 1);
//   };

//   const { hasPermission } = useAuth();

//   useEffect(() => {
//     fetchAgents();
//     fetchShifts();
//   }, []);

//   const handleSearch = (e) => {
//     setSearchTerm(e.target.value);
//     fetchAgents(1, e.target.value);
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({
//       ...formData,
//       [name]: name === 'monthlyTarget' ? value.replace(/[^0-9]/g, '') : value
//     });
//   };

//   const handleEditInputChange = (e) => {
//     const { name, value } = e.target;
//     setEditFormData({
//       ...editFormData,
//       [name]: name === 'monthlyTarget' ? value.replace(/[^0-9]/g, '') : value
//     });
//   };

//   const handleSelectChange = (name, value) => {
//     setFormData({
//       ...formData,
//       [name]: value
//     });
//   };

//   const handleEditSelectChange = (name, value) => {
//     setEditFormData({
//       ...editFormData,
//       [name]: value
//     });
//   };

//   const generatePassword = () => {
//     const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
//     let password = '';
//     for (let i = 0; i < 12; i++) {
//       password += chars.charAt(Math.floor(Math.random() * chars.length));
//     }
//     setFormData({ ...formData, password });
//   };

//   const handleCreateAgent = async (e) => {
//     e.preventDefault();
//     if (!formData.shift) {
//       toast.warning('Please select a shift');
//       return;
//     }
//     setLoading(true);
//     try {
//       await agentService.createAgent({
//         ...formData,
//         monthlyTarget: formData.monthlyTarget ? parseInt(formData.monthlyTarget) : 0
//       });
//       toast.success('Agent created successfully! Welcome email sent.');
//       setShowCreateForm(false);
//       setFormData({
//         agentName: '',
//         agentId: '',
//         shift: '',
//         email: '',
//         password: '',
//         monthlyTarget: ''
//       });
//   fetchAgents(); // Refresh list
//     } catch (error) {
//       console.error('Error creating agent:', error);
//       toast.error(error.response?.data?.error || 'Error creating agent');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleEditAgent = async (e) => {
//     e.preventDefault();
//     if (!editFormData.shift) {
//       toast.warning('Please select a shift');
//       return;
//     }
//     setLoading(true);
//     try {
//       await agentService.updateAgent(editFormData._id, {
//         agentName: editFormData.agentName,
//         agentId: editFormData.agentId,
//         shift: editFormData.shift,
//         email: editFormData.email,
//         monthlyTarget: editFormData.monthlyTarget ? parseInt(editFormData.monthlyTarget) : 0,
//         isActive: editFormData.isActive
//       });
//       toast.success('Agent updated successfully!');
//       setShowEditForm(false);
//       setEditFormData({
//         _id: '',
//         agentName: '',
//         agentId: '',
//         shift: '',
//         email: '',
//         monthlyTarget: '',
//         isActive: true
//       });
//   fetchAgents(); // Refresh list
//     } catch (error) {
//       console.error('Error updating agent:', error);
//       toast.error(error.response?.data?.error || 'Error updating agent');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Open edit modal
//   const handleOpenEdit = (agent, mode = 'edit') => {
//     setEditFormData({
//       _id: agent._id,
//       agentName: agent.agentName,
//       agentId: agent.agentId,
//       shift: agent.shift?._id || '',
//       email: agent.email,
//       monthlyTarget: agent.monthlyTarget?.toString() || '',
//       isActive: agent.isActive
//     });
//     setViewOnly(mode === 'view');
//     setShowEditForm(true);
//   };

//   const handleDeleteAgent = async (agentId) => {
//     if (!confirm('Are you sure you want to delete this agent?')) return;
//     try {
//       await agentService.deleteAgent(agentId);
//       toast.success('Agent deleted successfully');
//       fetchAgents();
//     } catch (error) {
//       console.error('Error deleting agent:', error);
//       toast.error('Error deleting agent');
//     }
//   };

//   const handleToggleStatus = async (agentId, currentStatus) => {
//     try {
//       await agentService.updateAgentStatus(agentId, !currentStatus);
//       toast.success(`Agent ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
//       fetchAgents();
//     } catch (error) {
//       console.error('Error updating agent status:', error);
//       toast.error('Error updating status');
//     }
//   };

//   return (
//     <div className="container mx-auto p-6 space-y-6">

//       {/* Header */}
//       <div className="bg-white shadow rounded-md p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">Agent Management</h1>
//           <p className="text-gray-600 mt-1">Manage all agents and their shifts</p>
//         </div>
//         <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
//           {hasPermission('agent', 'create') && (
//             <DialogTrigger asChild>
//               <Button className="bg-[#10B5DB] hover:bg-[#10B5DB]/90">
//                 Create New Agent
//               </Button>
//             </DialogTrigger>
//           )}
//           <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
//             <div className="bg-white p-6 rounded-lg shadow">
//               <DialogHeader>
//                 <DialogTitle>Create New Agent</DialogTitle>
//                 <DialogDescription>
//                   Add a new agent to the system. A welcome email will be sent.
//                 </DialogDescription>
//               </DialogHeader>
//               <form onSubmit={handleCreateAgent} className="space-y-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <div className="col-span-1 sm:col-span-2 space-y-2">
//                   <Label htmlFor="agentName">Agent Name</Label>
//                   <Input
//                     id="agentName"
//                     name="agentName"
//                     value={formData.agentName}
//                     onChange={handleInputChange}
//                     required
//                     placeholder="Enter agent full name"
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="agentId">Agent ID</Label>
//                   <Input
//                     id="agentId"
//                     name="agentId"
//                     value={formData.agentId}
//                     onChange={handleInputChange}
//                     required
//                     placeholder="Enter unique agent ID"
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="shift">Shift</Label>
//                   <Select value={formData.shift} onValueChange={(v) => handleSelectChange('shift', v)} disabled={shiftsLoading}>
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select a shift" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {shiftsLoading ? (
//                         <SelectItem value="loading" disabled>Loading shifts...</SelectItem>
//                       ) : shifts.length === 0 ? (
//                         <SelectItem value="none" disabled>No shifts available</SelectItem>
//                       ) : (
//                         shifts.map(shift => (
//                           <SelectItem key={shift._id} value={shift._id}>{shift.name} ({shift.startTime}-{shift.endTime})</SelectItem>
//                         ))
//                       )}
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="email">Email</Label>
//                   <Input
//                     id="email"
//                     name="email"
//                     type="email"
//                     value={formData.email}
//                     onChange={handleInputChange}
//                     required
//                     placeholder="Enter agent email"
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="monthlyTarget">Monthly Target</Label>
//                   <Input
//                     id="monthlyTarget"
//                     name="monthlyTarget"
//                     type="text"
//                     value={formData.monthlyTarget}
//                     onChange={handleInputChange}
//                     placeholder="Enter monthly target"
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="password">Password</Label>
//                   <div className="flex gap-2">
//                     <Input
//                       id="password"
//                       name="password"
//                       type="text"
//                       value={formData.password}
//                       onChange={handleInputChange}
//                       required
//                     />
//                     <Button type="button" variant="outline" onClick={generatePassword}>Generate</Button>
//                   </div>
//                 </div>
//                 <div className="col-span-1 sm:col-span-2 flex gap-3 pt-4">
//                   <Button type="submit" disabled={loading || shifts.length === 0} className="flex-1 bg-[#10B5DB] hover:bg-[#10B5DB]/90">
//                     {loading ? 'Creating...' : 'Create Agent'}
//                   </Button>
//                   <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)} className="flex-1">
//                     Cancel
//                   </Button>
//                 </div>
//               </form>
//             </div>
//           </DialogContent>
//         </Dialog>
//       </div>

//       {/* Edit Agent Dialog */}
//       <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
//         <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
//           <DialogHeader>
//             <DialogTitle>Edit Agent</DialogTitle>
//             <DialogDescription>
//               Update agent information and settings.
//             </DialogDescription>
//           </DialogHeader>
          
//           <form onSubmit={handleEditAgent} className="space-y-4">
//             {/* Agent Name */}
//             <div className="space-y-2">
//               <Label htmlFor="edit-agentName">Agent Name</Label>
//                 <Input
//                   id="edit-agentName"
//                   name="agentName"
//                   value={editFormData.agentName}
//                   onChange={handleEditInputChange}
//                   required
//                   placeholder="Enter agent full name"
//                   disabled={viewOnly}
//                 />
//             </div>

//             {/* Agent ID */}
//             <div className="space-y-2">
//               <Label htmlFor="edit-agentId">Agent ID</Label>
//               <Input
//                 id="edit-agentId"
//                 name="agentId"
//                 value={editFormData.agentId}
//                 onChange={handleEditInputChange}
//                 required
//                 placeholder="Enter unique agent ID"
//                 disabled={viewOnly}
//               />
//             </div>

//             {/* Shift Selection */}
//             <div className="space-y-2">
//               <Label htmlFor="edit-shift">Shift</Label>
//               <Select 
//                 value={editFormData.shift} 
//                 onValueChange={(value) => handleEditSelectChange('shift', value)}
//                 disabled={shiftsLoading || viewOnly}
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select a shift" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {shiftsLoading ? (
//                     <SelectItem value="loading" disabled>Loading shifts...</SelectItem>
//                   ) : shifts.length === 0 ? (
//                     <SelectItem value="none" disabled>No shifts available</SelectItem>
//                     ) : (
//                     shifts.map(shift => (
//                       <SelectItem key={shift._id} value={shift._id}>
//                         {shift.name} ({shift.startTime} - {shift.endTime})
//                       </SelectItem>
//                     ))
//                   )}
//                 </SelectContent>
//               </Select>
//             </div>

//             {/* Email */}
//             <div className="space-y-2">
//               <Label htmlFor="edit-email">Email</Label>
//               <Input
//                 id="edit-email"
//                 name="email"
//                 type="email"
//                 value={editFormData.email}
//                 onChange={handleEditInputChange}
//                 required
//                 placeholder="Enter agent email address"
//                 disabled={viewOnly}
//               />
//             </div>

//             {/* Monthly Target */}
//             <div className="space-y-2">
//               <Label htmlFor="edit-monthlyTarget">Monthly Target</Label>
//               <Input
//                 id="edit-monthlyTarget"
//                 name="monthlyTarget"
//                 type="text"
//                 value={editFormData.monthlyTarget}
//                 onChange={handleEditInputChange}
//                 placeholder="Enter monthly target (numbers only)"
//                 disabled={viewOnly}
//               />
//               <p className="text-xs text-gray-500">
//                 Monthly target in numbers (e.g., 1000)
//               </p>
//             </div>

//             {/* Status */}
//             <div className="space-y-2">
//               <Label htmlFor="edit-status">Status</Label>
//               <Select 
//                 value={editFormData.isActive.toString()} 
//                 onValueChange={(value) => handleEditSelectChange('isActive', value === 'true')}
//                 disabled={viewOnly}
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select status" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="true">Active</SelectItem>
//                   <SelectItem value="false">Inactive</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>

//             <div className="flex gap-3 pt-4">
//               {!viewOnly && (
//                 <>
//                   <Button
//                     type="submit"
//                     disabled={loading}
//                     className="flex-1 bg-[#10B5DB] hover:bg-[#10B5DB]/90"
//                   >
//                     {loading ? 'Updating...' : 'Update Agent'}
//                   </Button>
//                   <Button
//                     type="button"
//                     variant="outline"
//                     onClick={() => setShowEditForm(false)}
//                     className="flex-1"
//                   >
//                     Cancel
//                   </Button>
//                 </>
//               )}
//               {viewOnly && (
//                 <Button
//                   type="button"
//                   variant="outline"
//                   onClick={() => setShowEditForm(false)}
//                   className="flex-1"
//                 >
//                   Close
//                 </Button>
//               )}
//             </div>
//           </form>
//         </DialogContent>
//       </Dialog>

//       {/* Agents List */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Agents</CardTitle>
//           <CardDescription>View and manage all registered agents</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="overflow-auto max-h-[70vh]">
//             <GlobalData
//             key={reloadKey}
//             title="Agents"
//             serverSide={true}
//             fetcher={async (params = {}) => {
//               const p = { page: params.page || 1, limit: params.limit || 10, search: params.search || '' };
//               const res = await agentService.getAllAgents(p);
//               return { data: res.agents || [], meta: res.pagination || { total: res.totalAgents || 0, page: res.pagination?.currentPage || p.page, limit: p.limit } };
//             }}
//             columns={[
//               {
//                 label: 'Agent Details',
//                 key: 'agentDetails',
//                 render: (agent) => (
//                   <div className="space-y-1">
//                     <div className="font-medium text-gray-900">{agent.agentName}</div>
//                     <div className="text-sm text-gray-500">ID: {agent.agentId}</div>
//                     <div className="text-sm text-gray-500">{agent.email}</div>
//                     <div className="text-xs text-gray-400">Created: {new Date(agent.createdAt).toLocaleDateString()}</div>
//                   </div>
//                 )
//               },
//               {
//                 label: 'Shift',
//                 key: 'shift',
//                 render: (agent) => agent.shift ? (
//                   <Badge className="bg-[#10B5DB]/10 text-[#10B5DB]">{agent.shift.name}</Badge>
//                 ) : (
//                   <Badge className="bg-gray-100 text-gray-800">No Shift</Badge>
//                 )
//               },
//               {
//                 label: 'Monthly Target',
//                 key: 'monthlyTarget',
//                 render: (agent) => (
//                   <div>{agent.monthlyTarget ? agent.monthlyTarget.toLocaleString() : '—'}</div>
//                 )
//               },
//               {
//                 label: 'Status',
//                 key: 'status',
//                 render: (agent) => (
//                   <Badge className={agent.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
//                     {agent.isActive ? 'Active' : 'Inactive'}
//                   </Badge>
//                 )
//               },
//               {
//                 label: 'Actions',
//                 key: 'actions',
//                 render: (agent) => (
//                   <div className="flex justify-end gap-2">
//                           {hasPermission('agent', 'edit') && (
//                             <Button variant="outline" size="sm" onClick={() => handleOpenEdit(agent, 'edit')} className="text-[#10B5DB] hover:text-[#10B5DB]/90 hover:bg-[#10B5DB]/10">Edit</Button>
//                           )}
//                           {!hasPermission('agent', 'edit') && hasPermission('agent', 'view') && (
//                             <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(agent, 'view')} className="text-gray-600 hover:bg-gray-50">View</Button>
//                           )}
//                           {hasPermission('agent', 'edit') && (
//                             <ResetPasswordDialog agent={agent} onSuccess={() => setReloadKey(k => k + 1)} />
//                           )}
//                           {hasPermission('agent', 'edit') && (
//                             <Button variant="outline" size="sm" onClick={() => handleToggleStatus(agent._id, agent.isActive)} className={agent.isActive ? 'text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50' : 'text-green-600 hover:text-green-700 hover:bg-green-50'}>{agent.isActive ? 'Deactivate' : 'Activate'}</Button>
//                           )}
//                           {hasPermission('agent', 'delete') && (
//                             <Button variant="outline" size="sm" onClick={() => handleDeleteAgent(agent._id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">Delete</Button>
//                           )}
//                   </div>
//                 )
//               }
//             ]}
//             rowsPerPage={5}
//             searchEnabled={true}
//             filterKeys={['shift', 'isActive']}
//             filterOptionsMap={{
//               shift: shifts.map(s => ({ label: s.name, value: s._id })),
//               isActive: [{ label: 'Active', value: true }, { label: 'Inactive', value: false }]
//             }}
//           />
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }






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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Search,
  MoreVertical,
  Eye,
  Edit,
  User,
  Calendar,
  Target,
  CheckCircle,
  XCircle,
  Filter,
  ChevronLeft,
  ChevronRight,
  Download,
  RefreshCw,
} from 'lucide-react';

export default function AgentsPage() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [viewOnly, setViewOnly] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalAgents: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedShift, setSelectedShift] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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

  // Initialize and fetch shifts
  useEffect(() => {
    fetchShifts();
  }, []);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch agents when filters or pagination changes
  useEffect(() => {
    fetchAgents();
  }, [pagination.currentPage, debouncedSearch, selectedShift, selectedStatus, itemsPerPage]);

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
    setIsSearching(true);
    try {
      const params = {
        page: pagination.currentPage,
        limit: itemsPerPage,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(selectedShift && { shift: selectedShift }),
        ...(selectedStatus && { status: selectedStatus })
      };

      const response = await agentService.getAllAgents(params);
      
      setAgents(response.agents || []);
      
      setPagination({
        currentPage: response.pagination?.currentPage || 1,
        totalPages: response.pagination?.totalPages || 1,
        totalAgents: response.totalAgents || 0,
        hasNextPage: response.pagination?.hasNextPage || false,
        hasPrevPage: response.pagination?.hasPrevPage || false
      });
      
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast.error('Error fetching agents');
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search input
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // Handle shift filter change
  const handleShiftChange = (value) => {
    setSelectedShift(value);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // Handle status filter change
  const handleStatusChange = (value) => {
    setSelectedStatus(value);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // Handle page change
  const handlePageChange = (page) => {
    if (page < 1 || page > pagination.totalPages) return;
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  // Handle items per page change
  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(parseInt(value));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedShift('');
    setSelectedStatus('');
    setPagination({
      currentPage: 1,
      totalPages: 1,
      totalAgents: 0,
      hasNextPage: false,
      hasPrevPage: false
    });
  };

  // Input change handlers
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

  // Generate random password
  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, password });
  };

  // Create agent
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

  // Edit agent
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

  // Delete agent
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

  // Toggle agent status
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

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (pagination.totalPages <= maxVisiblePages) {
      // Show all pages if total pages are less than max visible
      for (let i = 1; i <= pagination.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      // Calculate start and end of visible pages
      let start = Math.max(2, pagination.currentPage - 1);
      let end = Math.min(pagination.totalPages - 1, pagination.currentPage + 1);
      
      // Adjust if we're near the beginning
      if (pagination.currentPage <= 3) {
        end = 4;
      }
      
      // Adjust if we're near the end
      if (pagination.currentPage >= pagination.totalPages - 2) {
        start = pagination.totalPages - 3;
      }
      
      // Add ellipsis after first page if needed
      if (start > 2) {
        pages.push('ellipsis1');
      }
      
      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (end < pagination.totalPages - 1) {
        pages.push('ellipsis2');
      }
      
      // Always show last page
      pages.push(pagination.totalPages);
    }
    
    return pages;
  };

  // Mobile Agent Card Component
  const MobileAgentCard = ({ agent }) => (
    <div className="bg-white rounded-lg border p-4 space-y-3 mb-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-[#10B5DB]" />
            <span className="font-semibold text-gray-900 text-base">{agent.agentName}</span>
          </div>
          <div className="text-sm text-gray-600">ID: {agent.agentId}</div>
          <div className="text-sm text-gray-600 truncate">{agent.email}</div>
        </div>
        <Badge className={`${agent.isActive ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}>
          {agent.isActive ? 'Active' : 'Inactive'}
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-3 pt-2">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className="text-sm">
            {agent.shift ? (
              <Badge variant="outline" className="border-[#10B5DB] text-[#10B5DB] text-xs">
                {agent.shift.name}
              </Badge>
            ) : (
              <span className="text-gray-500 text-sm">No Shift</span>
            )}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium">
            {agent.monthlyTarget ? agent.monthlyTarget.toLocaleString() : '—'}
          </span>
        </div>
      </div>
      
      <div className="flex justify-between items-center pt-3 border-t">
        <div className="text-xs text-gray-500">
          Created: {formatDate(agent.createdAt)}
        </div>
        <div className="flex gap-1">
          {hasPermission('agent', 'edit') && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleOpenEdit(agent, 'edit')}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {!hasPermission('agent', 'edit') && hasPermission('agent', 'view') && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleOpenEdit(agent, 'view')}
              className="h-8 w-8 p-0"
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {hasPermission('agent', 'edit') && (
                <>
                  <div className="px-2 py-1.5">
                    <ResetPasswordDialog agent={agent} onSuccess={fetchAgents} />
                  </div>
                  <DropdownMenuItem onClick={() => handleToggleStatus(agent._id, agent.isActive)}>
                    {agent.isActive ? (
                      <>
                        <XCircle className="mr-2 h-4 w-4" />
                        Deactivate Agent
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Activate Agent
                      </>
                    )}
                  </DropdownMenuItem>
                </>
              )}
              {hasPermission('agent', 'delete') && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => handleDeleteAgent(agent._id)}
                    className="text-red-600 focus:text-red-600"
                  >
                    Delete Agent
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Agent Management</h1>
            <p className="text-gray-600 mt-1 text-sm md:text-base">Manage all agents and their shifts</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={fetchAgents}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
              {hasPermission('agent', 'create') && (
                <DialogTrigger asChild>
                  <Button className="bg-[#10B5DB] hover:bg-[#10B5DB]/90">
                    Create New Agent
                  </Button>
                </DialogTrigger>
              )}
            </Dialog>
          </div>
        </div>
      </div>

      {/* Create Agent Dialog */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Select 
                  value={formData.shift} 
                  onValueChange={(v) => handleSelectChange('shift', v)} 
                  disabled={shiftsLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select shift" />
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
                  placeholder="Enter password"
                />
                <Button type="button" variant="outline" onClick={generatePassword} className="whitespace-nowrap">
                  Generate
                </Button>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button 
                type="submit" 
                disabled={loading || shifts.length === 0} 
                className="flex-1 bg-[#10B5DB] hover:bg-[#10B5DB]/90"
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

      {/* Edit Agent Dialog */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewOnly ? 'View Agent' : 'Edit Agent'}</DialogTitle>
            <DialogDescription>
              {viewOnly ? 'View agent details' : 'Update agent information'}
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
                disabled={viewOnly}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-agentId">Agent ID</Label>
                <Input
                  id="edit-agentId"
                  name="agentId"
                  value={editFormData.agentId}
                  onChange={handleEditInputChange}
                  required
                  disabled={viewOnly}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-shift">Shift</Label>
                <Select 
                  value={editFormData.shift} 
                  onValueChange={(v) => handleEditSelectChange('shift', v)}
                  disabled={shiftsLoading || viewOnly}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select shift" />
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
                disabled={viewOnly}
              />
            </div>
            {!viewOnly && (
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select 
                  value={editFormData.isActive.toString()} 
                  onValueChange={(v) => handleEditSelectChange('isActive', v === 'true')}
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
            )}
            <div className="flex gap-3 pt-4">
              {!viewOnly && (
                <>
                  <Button 
                    type="submit" 
                    disabled={loading} 
                    className="flex-1 bg-[#10B5DB] hover:bg-[#10B5DB]/90"
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

      {/* Main Content */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Filters Section */}
        <div className="p-4 md:p-6 border-b">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Agents List</h2>
              <p className="text-sm text-gray-600 mt-1">
                Showing {(pagination.currentPage - 1) * itemsPerPage + 1} to{' '}
                {Math.min(pagination.currentPage * itemsPerPage, pagination.totalAgents)} of{' '}
                {pagination.totalAgents} agents
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Label htmlFor="itemsPerPage" className="text-sm whitespace-nowrap">Show:</Label>
                <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                  <SelectTrigger className="w-[80px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search agents..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10"
              />
            </div>

            {/* Shift Filter */}
            <Select value={selectedShift} onValueChange={handleShiftChange}>
              <SelectTrigger>
                <SelectValue placeholder="All Shifts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Shifts</SelectItem>
                {shifts.map(shift => (
                  <SelectItem key={shift._id} value={shift._id}>
                    {shift.name} ({shift.startTime}-{shift.endTime})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={selectedStatus} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            {/* Reset Button */}
            <Button
              variant="outline"
              onClick={handleResetFilters}
              className="flex items-center justify-center gap-2"
              disabled={!searchTerm && !selectedShift && !selectedStatus}
            >
              <Filter className="h-4 w-4" />
              Reset Filters
            </Button>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Agent Details</TableHead>
                  <TableHead>Shift</TableHead>
                  <TableHead>Monthly Target</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isSearching ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#10B5DB]"></div>
                        <p className="text-sm text-gray-500">Loading agents...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : agents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <User className="h-12 w-12 text-gray-300" />
                        <p className="text-gray-500">No agents found</p>
                        <p className="text-sm text-gray-400">Try adjusting your filters</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  agents.map((agent) => (
                    <TableRow key={agent._id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-gray-900">{agent.agentName}</div>
                          <div className="text-sm text-gray-600">ID: {agent.agentId}</div>
                          <div className="text-sm text-gray-600">{agent.email}</div>
                          <div className="text-xs text-gray-500">
                            Created: {formatDate(agent.createdAt)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {agent.shift ? (
                          <Badge className="bg-[#10B5DB]/10 text-[#10B5DB] hover:bg-[#10B5DB]/20">
                            {agent.shift.name}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-600">
                            No Shift
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {agent.monthlyTarget ? agent.monthlyTarget.toLocaleString() : '—'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={agent.isActive ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'}>
                          {agent.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          {hasPermission('agent', 'edit') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEdit(agent, 'edit')}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {!hasPermission('agent', 'edit') && hasPermission('agent', 'view') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEdit(agent, 'view')}
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              {hasPermission('agent', 'edit') && (
                                <>
                                  <div className="px-2 py-1.5">
                                    <ResetPasswordDialog agent={agent} onSuccess={fetchAgents} />
                                  </div>
                                  <DropdownMenuItem onClick={() => handleToggleStatus(agent._id, agent.isActive)}>
                                    {agent.isActive ? (
                                      <>
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Deactivate Agent
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Activate Agent
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                </>
                              )}
                              {hasPermission('agent', 'delete') && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteAgent(agent._id)}
                                    className="text-red-600 focus:text-red-600"
                                  >
                                    Delete Agent
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden p-4">
          {isSearching ? (
            <div className="flex flex-col items-center justify-center space-y-3 py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#10B5DB]"></div>
              <p className="text-sm text-gray-500">Loading agents...</p>
            </div>
          ) : agents.length === 0 ? (
            <div className="flex flex-col items-center justify-center space-y-2 py-12">
              <User className="h-12 w-12 text-gray-300" />
              <p className="text-gray-500">No agents found</p>
              <p className="text-sm text-gray-400">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="space-y-3">
              {agents.map((agent) => (
                <MobileAgentCard key={agent._id} agent={agent} />
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 0 && (
          <div className="p-4 md:p-6 border-t">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Pagination Info */}
              <div className="text-sm text-gray-600">
                Showing <span className="font-medium">{(pagination.currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(pagination.currentPage * itemsPerPage, pagination.totalAgents)}
                </span>{' '}
                of <span className="font-medium">{pagination.totalAgents}</span> agents
              </div>

              {/* Pagination Controls */}
              <Pagination>
                <PaginationContent>
                  {/* Previous Button */}
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      className={!pagination.hasPrevPage ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>

                  {/* Page Numbers */}
                  {getPageNumbers().map((page, index) => {
                    if (page === 'ellipsis1' || page === 'ellipsis2') {
                      return (
                        <PaginationItem key={`ellipsis-${index}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }

                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => handlePageChange(page)}
                          isActive={pagination.currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                  {/* Next Button */}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      className={!pagination.hasNextPage ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>

              {/* Go to Page */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 whitespace-nowrap">Go to page:</span>
                <Input
                  type="number"
                  min="1"
                  max={pagination.totalPages}
                  value={pagination.currentPage}
                  onChange={(e) => {
                    const page = parseInt(e.target.value);
                    if (page >= 1 && page <= pagination.totalPages) {
                      handlePageChange(page);
                    }
                  }}
                  className="w-20"
                />
                <span className="text-sm text-gray-600 whitespace-nowrap">
                  of {pagination.totalPages}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
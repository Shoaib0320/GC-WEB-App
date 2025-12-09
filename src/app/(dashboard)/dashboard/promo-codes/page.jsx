//src/app/(dashboard)/dashboard/promo-codes/page.jsx
'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { promoCodeService } from '@/services/promocodeService';
import { agentService } from '@/services/agentService';
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
  SelectLabel,
  SelectGroup,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Icons
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Power,
  Tag,
  Percent,
  User,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';

export default function PromoCodesPage() {
  const [allPromoCodes, setAllPromoCodes] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewOnly, setViewOnly] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [agentFilter, setAgentFilter] = useState('all');

  // Form states
  const [formData, setFormData] = useState({
    promoCode: '',
    discountPercentage: '',
    agentId: '',
    isActive: true
  });

  const [editFormData, setEditFormData] = useState({
    _id: '',
    promoCode: '',
    discountPercentage: '',
    agentId: '',
    isActive: true
  });

  const { hasPermission } = useAuth();

  // Load ALL data initially
  useEffect(() => {
    loadAllPromoCodes();
    loadAllAgents();
  }, []);

  const loadAllPromoCodes = async () => {
    try {
      setLoading(true);
      // Load ALL promo codes at once
      const response = await promoCodeService.getAllPromoCodes({ limit: 1000 });
      setAllPromoCodes(response.data || []);
    } catch (error) {
      console.error('Error fetching promo codes:', error);
      toast.error('Failed to load promo codes');
      setAllPromoCodes([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAllAgents = async () => {
    try {
      const response = await agentService.getAllAgents({ limit: 100 });
      setAgents(response.agents || []);
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast.error('Failed to fetch agents');
      setAgents([]);
    }
  };

  // Client-side filtering and pagination
  const getFilteredAndPaginatedPromoCodes = () => {
    let filtered = [...allPromoCodes];
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(promo => 
        promo.promoCode?.toLowerCase().includes(query) ||
        promo.agentId?.agentName?.toLowerCase().includes(query) ||
        promo.agentId?.agentId?.toLowerCase().includes(query)
      );
    }
    
    // Apply status filter
    if (statusFilter === 'active') {
      filtered = filtered.filter(promo => promo.isActive === true);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter(promo => promo.isActive === false);
    }
    
    // Apply agent filter
    if (agentFilter !== 'all') {
      filtered = filtered.filter(promo => promo.agentId?._id === agentFilter);
    }
    
    // Calculate pagination
    const itemsPerPage = 5;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    // Get current page items
    const paginatedPromoCodes = filtered.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    
    return {
      promoCodes: paginatedPromoCodes,
      total: filtered.length,
      totalPages: totalPages
    };
  };

  // Get current promo codes for display
  const { promoCodes: currentPromoCodes, total: filteredTotal, totalPages } = getFilteredAndPaginatedPromoCodes();

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  // Generate random promo code
  const generatePromoCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, promoCode: code }));
  };

  // Create new promo code
  const handleCreatePromoCode = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await promoCodeService.createPromoCode(formData);
      toast.success('Promo code created successfully!');
      setCreateDialogOpen(false);
      setFormData({
        promoCode: '',
        discountPercentage: '',
        agentId: '',
        isActive: true
      });
      await loadAllPromoCodes();
    } catch (error) {
      console.error('Error creating promo code:', error);
      toast.error(error.response?.data?.message || 'Error creating promo code');
    } finally {
      setLoading(false);
    }
  };

  // Edit promo code
  const handleEditPromoCode = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await promoCodeService.updatePromoCode(editFormData._id, {
        promoCode: editFormData.promoCode,
        discountPercentage: editFormData.discountPercentage,
        agentId: editFormData.agentId,
        isActive: editFormData.isActive
      });
      toast.success('Promo code updated successfully!');
      setEditDialogOpen(false);
      setEditFormData({
        _id: '',
        promoCode: '',
        discountPercentage: '',
        agentId: '',
        isActive: true
      });
      await loadAllPromoCodes();
    } catch (error) {
      console.error('Error updating promo code:', error);
      toast.error(error.response?.data?.message || 'Error updating promo code');
    } finally {
      setLoading(false);
    }
  };

  // Open edit modal
  const handleOpenEdit = (promo, mode = 'edit') => {
    setEditFormData({
      _id: promo._id,
      promoCode: promo.promoCode,
      discountPercentage: promo.discountPercentage,
      agentId: promo.agentId?._id || promo.agentId || '',
      isActive: promo.isActive
    });
    setEditDialogOpen(true);
    setViewOnly(mode === 'view');
  };

  // Delete promo code
  const handleDeletePromoCode = async (id) => {
    if (!confirm('Are you sure you want to delete this promo code?')) return;

    try {
      await promoCodeService.deletePromoCode(id);
      toast.success('Promo code deleted successfully');
      await loadAllPromoCodes();
    } catch (error) {
      console.error('Error deleting promo code:', error);
      toast.error('Error deleting promo code');
    }
  };

  // Toggle promo code status
  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await promoCodeService.updatePromoCodeStatus(id, !currentStatus);
      toast.success('Promo code status updated');
      await loadAllPromoCodes();
    } catch (error) {
      console.error('Error updating promo code status:', error);
      toast.error('Error updating status');
    }
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  // Pagination component
  const Pagination = ({ currentPage, totalPages, onPageChange, totalItems }) => {
    const itemsPerPage = 5;
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
          <span className="font-medium">{totalItems}</span> promo codes
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
                    currentPage === page ? 'bg-blue-600 text-white hover:bg-blue-700' : ''
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

  // Summary statistics
  const summaryStats = {
    total: allPromoCodes.length,
    active: allPromoCodes.filter(p => p.isActive === true).length,
    inactive: allPromoCodes.filter(p => p.isActive === false).length,
    totalAgents: new Set(allPromoCodes.map(p => p.agentId?._id)).size
  };

  return (
    <div className="min-h-screen bg-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Card */}
        <Card className="shadow-lg border-0 bg-white text-black">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Tag className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-xl md:text-2xl font-bold truncate">Promo Code Management</CardTitle>
                <CardDescription className="text-black text-sm md:text-base">
                  Create and manage promotional codes for agents
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Promo Codes</p>
                  <p className="text-2xl font-bold mt-2">{summaryStats.total}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Tag className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Codes</p>
                  <p className="text-2xl font-bold mt-2">{summaryStats.active}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Percent className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Inactive Codes</p>
                  <p className="text-2xl font-bold mt-2">{summaryStats.inactive}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <Tag className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Agents with Codes</p>
                  <p className="text-2xl font-bold mt-2">{summaryStats.totalAgents}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <User className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Card */}
        <Card className="shadow-xl border-0 overflow-hidden">
          <CardHeader className="pb-4 border-b bg-white/50">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="min-w-0 flex-1">
                <CardTitle className="text-lg md:text-xl font-semibold text-gray-900">All Promo Codes</CardTitle>
                <CardDescription className="text-sm">
                  Manage promotional codes and their status
                </CardDescription>
              </div>
              
              {/* Search and Filter Controls */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search promo codes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                    className="pl-9 w-full sm:w-64"
                  />
                </div>
                
                <Select
                  value={statusFilter}
                  onValueChange={(value) => {
                    setStatusFilter(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Status Filter</SelectLabel>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>

                <Select
                  value={agentFilter}
                  onValueChange={(value) => {
                    setAgentFilter(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="All Agents" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Agent Filter</SelectLabel>
                      <SelectItem value="all">All Agents</SelectItem>
                      {agents.map(agent => (
                        <SelectItem key={agent._id} value={agent._id}>
                          {agent.agentName}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>

                {hasPermission('promoCode', 'create') && (
                  <Button
                    onClick={() => setCreateDialogOpen(true)}
                    className="blue-button flex items-center gap-2 w-full sm:w-auto justify-center"
                  >
                    <Plus className="h-4 w-4" />
                    Add Promo Code
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0 md:p-6">
            {/* Promo Codes Table */}
            <div className="overflow-x-auto">
              <div className="min-w-full inline-block align-middle">
                <div className="overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                          Promo Code Details
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                          Agent
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                          Status
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {loading ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center">
                            <div className="flex justify-center">
                              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                            </div>
                          </td>
                        </tr>
                      ) : currentPromoCodes.length > 0 ? (
                        currentPromoCodes.map((promo) => (
                          <tr key={promo._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-4">
                              <div className="min-w-0">
                                <div className="flex items-center gap-3">
                                  <div className="shrink-0">
                                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                      <Tag className="h-5 w-5 text-blue-600" />
                                    </div>
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="text-sm font-semibold text-gray-900 truncate">
                                      {promo.promoCode}
                                    </div>
                                    <div className="text-xs text-gray-500 truncate">
                                      <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                                        {promo.discountPercentage}% OFF
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              {promo.agentId ? (
                                <div className="flex items-center gap-3">
                                  <div className="shrink-0">
                                    <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                                      <User className="h-4 w-4 text-purple-600" />
                                    </div>
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="text-sm font-medium text-gray-900 truncate">
                                      {promo.agentId.agentName}
                                    </div>
                                    <div className="text-xs text-gray-500 truncate">
                                      {promo.agentId.agentId}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-sm text-gray-500">Unassigned</span>
                              )}
                            </td>
                            <td className="px-4 py-4">
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                promo.isActive 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {promo.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {hasPermission('promoCode', 'edit') ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleOpenEdit(promo, 'edit')}
                                    className="h-8 w-8 p-0 md:h-auto md:w-auto md:px-3 md:py-2"
                                  >
                                    <Edit className="h-4 w-4 md:mr-1" />
                                    <span className="hidden md:inline">Edit</span>
                                  </Button>
                                ) : hasPermission('promoCode', 'view') ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleOpenEdit(promo, 'view')}
                                    className="h-8 w-8 p-0 md:h-auto md:w-auto md:px-3 md:py-2"
                                  >
                                    <Eye className="h-4 w-4 md:mr-1" />
                                    <span className="hidden md:inline">View</span>
                                  </Button>
                                ) : null}

                                {hasPermission('promoCode', 'edit') && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleToggleStatus(promo._id, promo.isActive)}
                                    className={`h-8 w-8 p-0 md:h-auto md:w-auto md:px-3 md:py-2 ${
                                      promo.isActive 
                                        ? 'text-orange-600 hover:text-orange-700 hover:bg-orange-50' 
                                        : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                                    }`}
                                  >
                                    <Power className="h-4 w-4 md:mr-1" />
                                    <span className="hidden md:inline">{promo.isActive ? 'Deactivate' : 'Activate'}</span>
                                  </Button>
                                )}

                                {hasPermission('promoCode', 'delete') && (
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDeletePromoCode(promo._id)}
                                    className="h-8 w-8 p-0 md:h-auto md:w-auto md:px-3 md:py-2"
                                  >
                                    <Trash2 className="h-4 w-4 md:mr-1" />
                                    <span className="hidden md:inline">Delete</span>
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                            {searchQuery || statusFilter !== 'all' || agentFilter !== 'all' 
                              ? "No matching promo codes found" 
                              : "No promo codes found"}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={filteredTotal}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Promo Code Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-[95vw] md:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg md:text-xl">
              <Plus className="h-5 w-5" />
              Create New Promo Code
            </DialogTitle>
            <DialogDescription className="text-sm md:text-base">
              Create a new promotional code with discount percentage and assign to an agent
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleCreatePromoCode} className="space-y-4">
            {/* Promo Code */}
            <div className="space-y-2">
              <Label htmlFor="promoCode" className="text-sm font-medium text-gray-700">
                Promo Code *
              </Label>
              <div className="flex gap-2">
                <Input
                  id="promoCode"
                  name="promoCode"
                  value={formData.promoCode}
                  onChange={handleInputChange}
                  required
                  className="flex-1 uppercase focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="e.g., SUMMER25"
                />
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={generatePromoCode}
                  className="text-sm"
                >
                  Generate
                </Button>
              </div>
            </div>

            {/* Discount Percentage */}
            <div className="space-y-2">
              <Label htmlFor="discountPercentage" className="text-sm font-medium text-gray-700">
                Discount Percentage *
              </Label>
              <Input
                id="discountPercentage"
                name="discountPercentage"
                type="number"
                value={formData.discountPercentage}
                onChange={handleInputChange}
                // min="1"
                max="100"
                required
                className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter discount percentage"
              />
            </div>

            {/* Agent Selection */}
            <div className="space-y-2">
              <Label htmlFor="agentId" className="text-sm font-medium text-gray-700">
                Agent *
              </Label>
              <Select 
                value={formData.agentId} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, agentId: value }))}
              >
                <SelectTrigger className="w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                  <SelectValue placeholder="Select an agent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Available Agents</SelectLabel>
                    {agents.map(agent => (
                      <SelectItem key={agent._id} value={agent._id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{agent.agentName}</span>
                          <span className="text-xs text-gray-500 ml-2">({agent.agentId})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2.5 px-6 rounded-lg transition-colors order-2 sm:order-1 w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="blue-button w-full sm:w-auto order-1 sm:order-2"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Create Promo Code
                  </div>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Promo Code Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-[95vw] md:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg md:text-xl">
              <Edit className="h-5 w-5" />
              {viewOnly ? 'View Promo Code' : 'Edit Promo Code'}
            </DialogTitle>
            <DialogDescription className="text-sm md:text-base">
              {viewOnly ? 'View promo code details' : 'Update promotional code information'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleEditPromoCode} className="space-y-4">
            {/* Promo Code */}
            <div className="space-y-2">
              <Label htmlFor="edit-promoCode" className="text-sm font-medium text-gray-700">
                Promo Code *
              </Label>
              <Input
                id="edit-promoCode"
                name="promoCode"
                value={editFormData.promoCode}
                onChange={handleEditInputChange}
                required
                className="uppercase focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="e.g., SUMMER25"
                disabled={viewOnly}
              />
            </div>

            {/* Discount Percentage */}
            <div className="space-y-2">
              <Label htmlFor="edit-discountPercentage" className="text-sm font-medium text-gray-700">
                Discount Percentage *
              </Label>
              <Input
                id="edit-discountPercentage"
                name="discountPercentage"
                type="number"
                value={editFormData.discountPercentage}
                onChange={handleEditInputChange}
                min="1"
                max="100"
                required
                className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter discount percentage"
                disabled={viewOnly}
              />
            </div>

            {/* Agent Selection */}
            <div className="space-y-2">
              <Label htmlFor="edit-agentId" className="text-sm font-medium text-gray-700">
                Agent *
              </Label>
              <Select 
                value={editFormData.agentId} 
                onValueChange={(value) => setEditFormData(prev => ({ ...prev, agentId: value }))}
                disabled={viewOnly}
              >
                <SelectTrigger className="w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                  <SelectValue placeholder="Select an agent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Available Agents</SelectLabel>
                    {agents.map(agent => (
                      <SelectItem key={agent._id} value={agent._id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{agent.agentName}</span>
                          <span className="text-xs text-gray-500 ml-2">({agent.agentId})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="edit-status" className="text-sm font-medium text-gray-700">
                Status
              </Label>
              <Select 
                value={editFormData.isActive.toString()} 
                onValueChange={(value) => setEditFormData(prev => ({ ...prev, isActive: value === 'true' }))}
                disabled={viewOnly}
              >
                <SelectTrigger className="w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Status Options</SelectLabel>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2.5 px-6 rounded-lg transition-colors order-2 sm:order-1 w-full sm:w-auto"
              >
                {viewOnly ? 'Close' : 'Cancel'}
              </Button>
              {!viewOnly && (
                <Button
                  type="submit"
                  disabled={loading}
                  className="blue-button w-full sm:w-auto order-1 sm:order-2"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Updating...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Edit className="h-4 w-4" />
                      Update Promo Code
                    </div>
                  )}
                </Button>
              )}
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}


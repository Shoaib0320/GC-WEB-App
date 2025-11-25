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
import { Textarea } from '@/components/ui/textarea';
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
import { Progress } from '@/components/ui/progress';

export default function PromoCodesPage() {
  const [promoCodes, setPromoCodes] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [viewOnly, setViewOnly] = useState(false);
  const [pagination, setPagination] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    promoCode: '',
    discountPercentage: '',
    agentId: '',
    // maxUsage: 1,
    // validUntil: '',
    // description: ''
  });

  const [editFormData, setEditFormData] = useState({
    _id: '',
    promoCode: '',
    discountPercentage: '',
    agentId: '',
    // maxUsage: 1,
    // validUntil: '',
    // description: '',
    isActive: true
  });

  // Fetch agents and promo codes
  const fetchAgents = async () => {
    try {
      const response = await agentService.getAllAgents({ limit: 100 });
      setAgents(response.agents || []);
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast.error('Failed to fetch agents');
    }
  };

  const fetchPromoCodes = async (page = 1, search = '') => {
    setLoading(true);
    try {
      const response = await promoCodeService.getAllPromoCodes({
        page,
        limit: 10,
        search
      });
      setPromoCodes(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error fetching promo codes:', error);
      toast.error('Error fetching promo codes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromoCodes();
    fetchAgents();
  }, []);

  const { hasPermission } = useAuth();

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    fetchPromoCodes(1, e.target.value);
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

  // Generate random promo code
  const generatePromoCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, promoCode: code });
  };

  // Create new promo code
  const handleCreatePromoCode = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await promoCodeService.createPromoCode(formData);
      toast.success('Promo code created successfully!');
      setShowCreateForm(false);
      setFormData({
        promoCode: '',
        discountPercentage: '',
        agentId: '',
        // maxUsage: 1,
        // validUntil: '',
        // description: ''
      });
      fetchPromoCodes(); // Refresh list
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
        // maxUsage: editFormData.maxUsage,
        // validUntil: editFormData.validUntil,
        // description: editFormData.description,
        isActive: editFormData.isActive
      });
      toast.success('Promo code updated successfully!');
      setShowEditForm(false);
      setEditFormData({
        _id: '',
        promoCode: '',
        discountPercentage: '',
        agentId: '',
        // maxUsage: 1,
        // validUntil: '',
        // description: '',
        isActive: true
      });
      fetchPromoCodes(); // Refresh list
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
      agentId: promo.agentId?._id || promo.agentId,
      // maxUsage: promo.maxUsage,
      // validUntil: new Date(promo.validUntil).toISOString().slice(0, 16),
      // description: promo.description || '',
      isActive: promo.isActive
    });
    setShowEditForm(true);
    setViewOnly(mode === 'view');
  };

  // Delete promo code
  const handleDeletePromoCode = async (id) => {
    if (!confirm('Are you sure you want to delete this promo code?')) return;

    try {
      await promoCodeService.deletePromoCode(id);
  toast.success('Promo code deleted successfully');
  fetchPromoCodes(); // Refresh list
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
      fetchPromoCodes(); // Refresh list
    } catch (error) {
      console.error('Error updating promo code status:', error);
      toast.error('Error updating status');
    }
  };

  // Check if promo code is expired
  const isExpired = (validUntil) => {
    return new Date(validUntil) < new Date();
  };

  // Get usage percentage
  const getUsagePercentage = (usedCount, maxUsage) => {
    return (usedCount / maxUsage) * 100;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Promo Code Management</h1>
          <p className="text-gray-600 mt-1">Create and manage promotional codes for agents</p>
        </div>
        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
            {hasPermission('promoCode', 'create') && (
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  Create New Promo Code
                </Button>
              </DialogTrigger>
            )}
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Promo Code</DialogTitle>
              <DialogDescription>
                Create a new promotional code with discount percentage and assign to an agent.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleCreatePromoCode} className="space-y-4">
              {/* Promo Code */}
              <div className="space-y-2">
                <Label htmlFor="promoCode">Promo Code</Label>
                <div className="flex gap-2">
                  <Input
                    id="promoCode"
                    name="promoCode"
                    value={formData.promoCode}
                    onChange={handleInputChange}
                    required
                    className="flex-1 uppercase"
                    placeholder="e.g., SUMMER25"
                  />
                  {/* <Button 
                    type="button" 
                    variant="outline" 
                    onClick={generatePromoCode}
                  >
                    Generate
                  </Button> */}
                </div>
              </div>

              {/* Discount Percentage */}
              <div className="space-y-2">
                <Label htmlFor="discountPercentage">Discount Percentage</Label>
                <Input
                  id="discountPercentage"
                  name="discountPercentage"
                  type="number"
                  value={formData.discountPercentage}
                  onChange={handleInputChange}
                  min="1"
                  max="100"
                  required
                  placeholder="Enter discount percentage"
                />
              </div>

              {/* Agent Selection */}
              <div className="space-y-2">
                <Label htmlFor="agentId">Agent</Label>
                <Select 
                  value={formData.agentId} 
                  onValueChange={(value) => handleSelectChange('agentId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {agents.map(agent => (
                      <SelectItem key={agent._id} value={agent._id}>
                        {agent.agentName} ({agent.agentId})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Max Usage */}
              {/* <div className="space-y-2">
                <Label htmlFor="maxUsage">Max Usage</Label>
                <Input
                  id="maxUsage"
                  name="maxUsage"
                  type="number"
                  value={formData.maxUsage}
                  onChange={handleInputChange}
                  min="1"
                  placeholder="Maximum usage count"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="validUntil">Valid Until</Label>
                <Input
                  id="validUntil"
                  name="validUntil"
                  type="datetime-local"
                  value={formData.validUntil}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Enter promo code description (optional)"
                />
              </div> */}

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {loading ? 'Creating...' : 'Create Promo Code'}
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

      {/* Edit Promo Code Dialog */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Promo Code</DialogTitle>
            <DialogDescription>
              Update promotional code information and settings.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleEditPromoCode} className="space-y-4">
            {/* Promo Code */}
            <div className="space-y-2">
              <Label htmlFor="edit-promoCode">Promo Code</Label>
              <Input
                id="edit-promoCode"
                name="promoCode"
                value={editFormData.promoCode}
                onChange={handleEditInputChange}
                required
                className="uppercase"
                placeholder="e.g., SUMMER25"
                disabled={viewOnly}
              />
            </div>

            {/* Discount Percentage */}
            <div className="space-y-2">
              <Label htmlFor="edit-discountPercentage">Discount Percentage</Label>
              <Input
                id="edit-discountPercentage"
                name="discountPercentage"
                type="number"
                value={editFormData.discountPercentage}
                onChange={handleEditInputChange}
                min="1"
                max="100"
                required
                placeholder="Enter discount percentage"
                disabled={viewOnly}
              />
            </div>

            {/* Agent Selection */}
            <div className="space-y-2">
              <Label htmlFor="edit-agentId">Agent</Label>
              <Select 
                value={editFormData.agentId} 
                onValueChange={(value) => handleEditSelectChange('agentId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an agent" />
                </SelectTrigger>
                <SelectContent>
                  {agents.map(agent => (
                    <SelectItem key={agent._id} value={agent._id}>
                      {agent.agentName} ({agent.agentId})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Max Usage */}
            {/* <div className="space-y-2">
              <Label htmlFor="edit-maxUsage">Max Usage</Label>
              <Input
                id="edit-maxUsage"
                name="maxUsage"
                type="number"
                value={editFormData.maxUsage}
                onChange={handleEditInputChange}
                min="1"
                placeholder="Maximum usage count"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-validUntil">Valid Until</Label>
              <Input
                id="edit-validUntil"
                name="validUntil"
                type="datetime-local"
                value={editFormData.validUntil}
                onChange={handleEditInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                name="description"
                value={editFormData.description}
                onChange={handleEditInputChange}
                rows="3"
                placeholder="Enter promo code description (optional)"
              />
            </div> */}

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
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {loading ? 'Updating...' : 'Update Promo Code'}
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

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search promo codes by code or description..."
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
      </Card>

      {/* Promo Codes List */}
      <Card>
        <CardHeader>
          <CardTitle>Promo Codes</CardTitle>
          <CardDescription>
            Manage all promotional codes and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading promo codes...</p>
            </div>
          ) : promoCodes.length === 0 ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No promo codes</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new promo code.
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Promo Code</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Agent</TableHead>
                    {/* <TableHead>Usage</TableHead> */}
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {promoCodes.map((promo) => (
                    <TableRow key={promo._id}>
                      <TableCell>
                        <div>
                          <div className="font-mono font-bold text-gray-900">
                            {promo.promoCode}
                          </div>
                          {promo.description && (
                            <div className="text-sm text-gray-500 mt-1">
                              {promo.description}
                            </div>
                          )}
                          {/* <div className="text-xs text-gray-400 mt-1">
                            Valid until: {new Date(promo.validUntil).toLocaleDateString()}
                          </div> */}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          {promo.discountPercentage}% OFF
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">
                            {promo.agentId?.agentName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {promo.agentId?.agentId}
                          </div>
                        </div>
                      </TableCell>
                      {/* <TableCell>
                        <div className="space-y-2">
                          <div className="text-sm">
                            {promo.usedCount} / {promo.maxUsage}
                          </div>
                          <Progress 
                            value={getUsagePercentage(promo.usedCount, promo.maxUsage)} 
                            className="h-2"
                          />
                        </div>
                      </TableCell> */}
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge 
                            variant={promo.isActive ? "default" : "secondary"}
                            className={promo.isActive 
                              ? "bg-green-100 text-green-800 hover:bg-green-100" 
                              : "bg-red-100 text-red-800 hover:bg-red-100"
                            }
                          >
                            {promo.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          {/* <Badge 
                            variant={isExpired(promo.validUntil) ? "destructive" : "outline"}
                            className={isExpired(promo.validUntil) 
                              ? "bg-red-100 text-red-800 hover:bg-red-100" 
                              : "bg-green-100 text-green-800 hover:bg-green-100"
                            }
                          >
                            {isExpired(promo.validUntil) ? 'Expired' : 'Valid'}
                          </Badge> */}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          {hasPermission('promoCode', 'edit') && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenEdit(promo, 'edit')}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              Edit
                            </Button>
                          )}
                          {!hasPermission('promoCode', 'edit') && hasPermission('promoCode', 'view') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEdit(promo, 'view')}
                              className="text-gray-600 hover:bg-gray-50"
                            >
                              View
                            </Button>
                          )}
                          {hasPermission('promoCode', 'edit') && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleStatus(promo._id, promo.isActive)}
                              className={
                                promo.isActive 
                                  ? 'text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50' 
                                  : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                              }
                            >
                              {promo.isActive ? 'Deactivate' : 'Activate'}
                            </Button>
                          )}
                          {hasPermission('promoCode', 'delete') && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeletePromoCode(promo._id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              Delete
                            </Button>
                          )}
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
            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{(pagination.currentPage - 1) * 10 + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(pagination.currentPage * 10, pagination.totalPromoCodes)}
                </span> of{' '}
                <span className="font-medium">{pagination.totalPromoCodes}</span> promo codes
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchPromoCodes(pagination.currentPage - 1, searchTerm)}
                  disabled={!pagination.hasPrev}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchPromoCodes(pagination.currentPage + 1, searchTerm)}
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
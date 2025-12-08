'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { TeamFormDialog } from '@/components/TeamFormDialog';
import { TeamCard } from '@/components/TeamCard';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { teamService } from '@/services/teamService';

export default function TeamsPage() {
  const { user, loading: authLoading, isAuthenticated, hasPermission } = useAuth();

  // Permission flags
  const canViewTeam = hasPermission('team', 'view');
  const canCreateTeam = hasPermission('team', 'create');
  const canEditTeam = hasPermission('team', 'edit');
  const canDeleteTeam = hasPermission('team', 'delete');
  
  const [teams, setTeams] = useState([]);
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState(null);
  const [isTogglingId, setIsTogglingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);

  // Filter teams helper
  const filterTeamsHelper = useCallback((teamsList, search, status) => {
    let filtered = teamsList;

    // Filter by status
    if (status === 'active') {
      filtered = filtered.filter(team => team.isActive);
    } else if (status === 'inactive') {
      filtered = filtered.filter(team => !team.isActive);
    }

    // Filter by search query
    if (search.trim()) {
      filtered = filtered.filter(team =>
        team.name.toLowerCase().includes(search.toLowerCase()) ||
        team.email.toLowerCase().includes(search.toLowerCase()) ||
        team.position.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredTeams(filtered);
  }, []);

  // Fetch teams using teamService
  const fetchTeams = useCallback(async (status = 'all') => {
    setLoading(true);
    try {
      const options = {};
      if (status === 'active') {
        options.isActive = true;
      } else if (status === 'inactive') {
        options.isActive = false;
      }

      const response = await teamService.getTeams(options);
      
      if (response.success) {
        setTeams(response.data);
        filterTeamsHelper(response.data, searchQuery, status);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to load teams');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filterTeamsHelper]);

  // Initial load
  useEffect(() => {
    fetchTeams(filterStatus);
  }, []);

  // Handle search
  const handleSearch = (value) => {
    setSearchQuery(value);
    filterTeamsHelper(teams, value, filterStatus);
  };

  // Handle status filter
  const handleStatusFilter = (status) => {
    setFilterStatus(status);
    fetchTeams(status);
  };

  // Handle add/edit submit using teamService
  const handleSubmit = async (formData) => {
    if (!user) {
      toast.error('Please log in first');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        createdBy: editingTeam ? editingTeam.createdBy._id : user.id,
        updatedBy: user.id,
      };

      let response;
      if (editingTeam) {
        response = await teamService.updateTeam(editingTeam._id, payload);
      } else {
        response = await teamService.createTeam(payload);
      }

      if (response.success) {
        toast.success(response.message);
        setEditingTeam(null);
        setFormOpen(false);
        await fetchTeams(filterStatus);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save team member');
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit
  const handleEdit = (team) => {
    setEditingTeam(team);
    setFormOpen(true);
  };

  // Handle delete using teamService
  const handleDelete = async (teamId) => {
    setIsDeletingId(teamId);
    try {
      const response = await teamService.deleteTeam(teamId);

      if (response.success) {
        toast.success('Team member deleted successfully');
        await fetchTeams(filterStatus);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete team member');
      console.error('Delete error:', error);
    } finally {
      setIsDeletingId(null);
    }
  };

  // Handle toggle status using teamService
  const handleToggleStatus = async (teamId, newStatus) => {
    setIsTogglingId(teamId);
    try {
      const response = await teamService.toggleStatus(teamId, newStatus, user?.id);

      if (response.success) {
        toast.success(response.message);
        await fetchTeams(filterStatus);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update status');
      console.error('Toggle error:', error);
    } finally {
      setIsTogglingId(null);
    }
  };

  // Close form
  const handleFormClose = (open) => {
    if (!open) {
      setEditingTeam(null);
    }
    setFormOpen(open);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Team Members
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage your company team members and their profiles
              </p>
            </div>
            <div className="flex gap-2">
              {canCreateTeam && (
                <Button
                  onClick={() => {
                    setEditingTeam(null);
                    setFormOpen(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus size={18} className="mr-2" />
                  Add Team Member
                </Button>
              )}
              <Button
                onClick={() => fetchTeams(filterStatus)}
                variant="outline"
                size="icon"
              >
                <RotateCw size={18} />
              </Button>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Search by name, email, or position..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Tabs value={filterStatus} onValueChange={handleStatusFilter}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="inactive">Inactive</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </Card>

        {/* Teams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            // Loading skeletons
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-32 w-full" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </Card>
            ))
          ) : filteredTeams.length > 0 ? (
            filteredTeams.map(team => (
              <TeamCard
                key={team._id}
                team={team}
                onEdit={canEditTeam ? handleEdit : null}
                onDelete={canDeleteTeam ? handleDelete : null}
                onToggleStatus={canEditTeam ? handleToggleStatus : null}
                isDeleting={isDeletingId === team._id}
                canEdit={canEditTeam}
                canDelete={canDeleteTeam}
              />
            ))
          ) : (
            <div className="col-span-full">
              <Card className="p-12 text-center">
                <div className="text-gray-500 dark:text-gray-400">
                  <p className="text-lg font-medium mb-2">No team members found</p>
                  <p className="text-sm mb-4">
                    {searchQuery
                      ? 'Try adjusting your search criteria'
                      : 'Start by adding your first team member'}
                  </p>
                  {!searchQuery && canCreateTeam && (
                    <Button
                      onClick={() => {
                        setEditingTeam(null);
                        setFormOpen(true);
                      }}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus size={18} className="mr-2" />
                      Add First Team Member
                    </Button>
                  )}
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Stats Footer */}
        {!loading && (
          <Card className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <div className="flex flex-col sm:flex-row justify-between text-sm text-gray-700 dark:text-gray-300">
              <span>Total Members: <strong>{teams.length}</strong></span>
              <span>Active: <strong className="text-green-600">{teams.filter(t => t.isActive).length}</strong></span>
              <span>Inactive: <strong className="text-gray-600">{teams.filter(t => !t.isActive).length}</strong></span>
            </div>
          </Card>
        )}
      </div>

      {/* Form Dialog */}
      <TeamFormDialog
        open={formOpen}
        onOpenChange={handleFormClose}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
        initialData={editingTeam}
      />
    </div>
  );
}

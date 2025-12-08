'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, RotateCw, LayoutGrid, List, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { projectService } from '@/services/projectService';
import { ProjectCard } from '@/components/ProjectCard';
import { ProjectFormDialog } from '@/components/ProjectFormDialog';

export default function ProjectsPage() {
  const { user, hasPermission } = useAuth();

  // Permission flags
  const canViewProject = hasPermission('project', 'view');
  const canCreateProject = hasPermission('project', 'create');
  const canEditProject = hasPermission('project', 'edit');
  const canDeleteProject = hasPermission('project', 'delete');

  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const categories = ['all', ...projectService.getCategories()];

  // Filter projects helper
  const filterProjectsHelper = useCallback((projectsList, search, status, category, featuredOnly) => {
    let filtered = projectsList;

    // Filter by status
    if (status === 'active') {
      filtered = filtered.filter(p => p.isActive);
    } else if (status === 'inactive') {
      filtered = filtered.filter(p => !p.isActive);
    }

    // Filter by category
    if (category && category !== 'all') {
      filtered = filtered.filter(p => p.category === category);
    }

    // Filter by featured
    if (featuredOnly) {
      filtered = filtered.filter(p => p.isFeatured);
    }

    // Filter by search query
    if (search.trim()) {
      const lowerSearch = search.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(lowerSearch) ||
        p.shortDescription.toLowerCase().includes(lowerSearch) ||
        p.technologies?.some(t => t.toLowerCase().includes(lowerSearch)) ||
        p.frameworks?.some(f => f.toLowerCase().includes(lowerSearch)) ||
        p.category.toLowerCase().includes(lowerSearch)
      );
    }

    setFilteredProjects(filtered);
  }, []);

  // Fetch projects
  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const response = await projectService.getProjects({ limit: 100 });

      if (response.success) {
        setProjects(response.data);
        filterProjectsHelper(response.data, searchQuery, filterStatus, filterCategory, showFeaturedOnly);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to load projects');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filterStatus, filterCategory, showFeaturedOnly, filterProjectsHelper]);

  // Initial load
  useEffect(() => {
    fetchProjects();
  }, []);

  // Apply filters when they change
  useEffect(() => {
    filterProjectsHelper(projects, searchQuery, filterStatus, filterCategory, showFeaturedOnly);
  }, [searchQuery, filterStatus, filterCategory, showFeaturedOnly, projects, filterProjectsHelper]);

  // Handle search
  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  // Handle submit (create/update)
  const handleSubmit = async (formData) => {
    if (!user) {
      toast.error('Please log in first');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        createdBy: editingProject ? editingProject.createdBy._id : user.id,
        updatedBy: user.id,
      };

      let response;
      if (editingProject) {
        response = await projectService.updateProject(editingProject._id, payload);
      } else {
        response = await projectService.createProject(payload);
      }

      if (response.success) {
        toast.success(response.message);
        setEditingProject(null);
        setFormOpen(false);
        await fetchProjects();
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save project');
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit
  const handleEdit = (project) => {
    setEditingProject(project);
    setFormOpen(true);
  };

  // Handle delete
  const handleDelete = async (projectId) => {
    setIsDeletingId(projectId);
    try {
      const response = await projectService.deleteProject(projectId);

      if (response.success) {
        toast.success('Project deleted successfully');
        await fetchProjects();
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete project');
      console.error('Delete error:', error);
    } finally {
      setIsDeletingId(null);
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (projectId, newStatus) => {
    try {
      const response = await projectService.toggleStatus(projectId, newStatus, user?.id);

      if (response.success) {
        toast.success(response.message);
        await fetchProjects();
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update status');
      console.error('Toggle error:', error);
    }
  };

  // Handle toggle featured
  const handleToggleFeatured = async (projectId, newFeatured) => {
    try {
      const response = await projectService.toggleFeatured(projectId, newFeatured, user?.id);

      if (response.success) {
        toast.success(response.message);
        await fetchProjects();
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update featured status');
      console.error('Toggle featured error:', error);
    }
  };

  // Close form
  const handleFormClose = (open) => {
    if (!open) {
      setEditingProject(null);
    }
    setFormOpen(open);
  };

  // Stats
  const stats = {
    total: projects.length,
    active: projects.filter(p => p.isActive).length,
    inactive: projects.filter(p => !p.isActive).length,
    featured: projects.filter(p => p.isFeatured).length,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Portfolio Projects
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage your portfolio projects and showcase your work
              </p>
            </div>
            <div className="flex gap-2">
              {canCreateProject && (
                <Button
                  onClick={() => {
                    setEditingProject(null);
                    setFormOpen(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus size={18} className="mr-2" />
                  Add Project
                </Button>
              )}
              <Button
                onClick={fetchProjects}
                variant="outline"
                size="icon"
              >
                <RotateCw size={18} />
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            <p className="text-sm text-gray-500">Total Projects</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            <p className="text-sm text-gray-500">Active</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-600">{stats.inactive}</p>
            <p className="text-sm text-gray-500">Inactive</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{stats.featured}</p>
            <p className="text-sm text-gray-500">Featured</p>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Search by title, description, or technology..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Tabs value={filterStatus} onValueChange={setFilterStatus}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="inactive">Inactive</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* More Filters */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter size={18} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuCheckboxItem
                  checked={showFeaturedOnly}
                  onCheckedChange={setShowFeaturedOnly}
                >
                  Featured Only
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Active Filters Display */}
          {(filterCategory !== 'all' || showFeaturedOnly || filterStatus !== 'all') && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
              <span className="text-sm text-gray-500">Active filters:</span>
              {filterStatus !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  Status: {filterStatus}
                </Badge>
              )}
              {filterCategory !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  {filterCategory}
                </Badge>
              )}
              {showFeaturedOnly && (
                <Badge variant="secondary" className="gap-1">
                  Featured
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilterStatus('all');
                  setFilterCategory('all');
                  setShowFeaturedOnly(false);
                }}
                className="h-6 text-xs"
              >
                Clear all
              </Button>
            </div>
          )}
        </Card>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            // Loading skeletons
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <Skeleton className="h-8 w-full" />
                </div>
              </Card>
            ))
          ) : filteredProjects.length > 0 ? (
            filteredProjects.map(project => (
              <ProjectCard
                key={project._id}
                project={project}
                onEdit={canEditProject ? handleEdit : null}
                onDelete={canDeleteProject ? handleDelete : null}
                onToggleStatus={canEditProject ? handleToggleStatus : null}
                onToggleFeatured={canEditProject ? handleToggleFeatured : null}
                isDeleting={isDeletingId === project._id}
                canEdit={canEditProject}
                canDelete={canDeleteProject}
              />
            ))
          ) : (
            <div className="col-span-full">
              <Card className="p-12 text-center">
                <div className="text-gray-500 dark:text-gray-400">
                  <LayoutGrid size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No projects found</p>
                  <p className="text-sm mb-4">
                    {searchQuery || filterCategory !== 'all' || showFeaturedOnly
                      ? 'Try adjusting your search or filters'
                      : 'Start by adding your first project'}
                  </p>
                  {!searchQuery && filterCategory === 'all' && !showFeaturedOnly && canCreateProject && (
                    <Button
                      onClick={() => {
                        setEditingProject(null);
                        setFormOpen(true);
                      }}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus size={18} className="mr-2" />
                      Add First Project
                    </Button>
                  )}
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Results Count */}
        {!loading && filteredProjects.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-500">
            Showing {filteredProjects.length} of {projects.length} projects
          </div>
        )}
      </div>

      {/* Form Dialog */}
      <ProjectFormDialog
        open={formOpen}
        onOpenChange={handleFormClose}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
        initialData={editingProject}
      />
    </div>
  );
}

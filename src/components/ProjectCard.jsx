'use client';

import React from 'react';
import { ExternalLink, Github, Eye, EyeOff, Trash2, Edit, Star, StarOff, Play } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function ProjectCard({ project, onEdit, onDelete, onToggleStatus, onToggleFeatured, isDeleting, canEdit = true, canDelete = true }) {
  const [showDeleteAlert, setShowDeleteAlert] = React.useState(false);

  const handleDelete = () => {
    setShowDeleteAlert(true);
  };

  const confirmDelete = () => {
    onDelete(project._id);
    setShowDeleteAlert(false);
  };

  // Get all tech stack items
  const allTech = [
    ...(project.technologies || []),
    ...(project.frameworks || []),
  ].slice(0, 4);

  return (
    <>
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
        {/* Thumbnail Container */}
        <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-800">
          <img
            src={project.thumbnail?.url}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Overlay with links */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
            {project.liveUrl && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-white rounded-full hover:bg-blue-500 hover:text-white transition-colors"
                    >
                      <ExternalLink size={20} />
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>Live Preview</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {project.githubUrl && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-white rounded-full hover:bg-gray-800 hover:text-white transition-colors"
                    >
                      <Github size={20} />
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>GitHub Repo</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {project.demoVideoUrl && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href={project.demoVideoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-white rounded-full hover:bg-red-500 hover:text-white transition-colors"
                    >
                      <Play size={20} />
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>Watch Demo</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          {/* Badges */}
          <div className="absolute top-2 left-2 flex gap-1">
            {project.isFeatured && (
              <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">
                <Star size={12} className="mr-1" />
                Featured
              </Badge>
            )}
            <Badge
              className={`${
                project.isActive
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-gray-500 hover:bg-gray-600'
              } text-white`}
            >
              {project.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          {/* Category Badge */}
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="bg-white/90 text-gray-800">
              {project.category}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Title */}
          <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-1 mb-1">
            {project.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
            {project.shortDescription}
          </p>

          {/* Tech Stack */}
          <div className="flex flex-wrap gap-1 mb-3">
            {allTech.map((tech, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tech}
              </Badge>
            ))}
            {(project.technologies?.length + project.frameworks?.length) > 4 && (
              <Badge variant="outline" className="text-xs">
                +{(project.technologies?.length + project.frameworks?.length) - 4}
              </Badge>
            )}
          </div>

          {/* Project Info */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
            <span>{project.projectType}</span>
            {project.duration && <span>{project.duration}</span>}
          </div>

          {/* Actions */}
          <div className="flex gap-1 pt-3 border-t border-gray-200 dark:border-gray-700">
            {canEdit && onEdit && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onEdit(project)}
                      className="flex-1"
                    >
                      <Edit size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Edit</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {canEdit && onToggleStatus && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onToggleStatus(project._id, !project.isActive)}
                    >
                      {project.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {project.isActive ? 'Deactivate' : 'Activate'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {canEdit && onToggleFeatured && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onToggleFeatured(project._id, !project.isFeatured)}
                      className={project.isFeatured ? 'text-yellow-500' : ''}
                    >
                      {project.isFeatured ? <StarOff size={16} /> : <Star size={16} />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {project.isFeatured ? 'Remove Featured' : 'Mark Featured'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {canDelete && onDelete && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleDelete}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      disabled={isDeleting}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{project.title}</strong>? This action cannot be
              undone. All images will also be removed from the cloud.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

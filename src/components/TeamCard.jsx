'use client';

import React from 'react';
import { Github, Linkedin, Mail, Eye, EyeOff, Trash2, Edit } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';

export function TeamCard({ team, onEdit, onDelete, onToggleStatus, isDeleting, canEdit = true, canDelete = true }) {
  const [showDeleteAlert, setShowDeleteAlert] = React.useState(false);

  const handleDelete = () => {
    setShowDeleteAlert(true);
  };

  const confirmDelete = () => {
    onDelete(team._id);
    setShowDeleteAlert(false);
  };

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
        {/* Image Container with Background Color */}
        <div
          className="h-40 relative overflow-hidden flex items-center justify-center"
          style={{ backgroundColor: team.backgroundColour }}
        >
          {/* Profile Image - Circular with padding to show background */}
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white/30 shadow-lg">
            <img
              src={team.profileImage}
              alt={team.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Status Badge */}
          <div className="absolute top-2 right-2">
            <Badge
              className={`${
                team.isActive
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-gray-500 hover:bg-gray-600'
              } text-white`}
            >
              {team.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Name and Position */}
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">
            {team.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {team.position}
          </p>

          {/* Email */}
          <div className="flex items-center gap-2 mb-3 text-sm text-gray-700 dark:text-gray-300">
            <Mail size={16} />
            <a
              href={`mailto:${team.email}`}
              className="hover:text-blue-600 dark:hover:text-blue-400 truncate"
            >
              {team.email}
            </a>
          </div>

          {/* Social Links */}
          <div className="flex gap-3 mb-4">
            {team.github && (
              <a
                href={team.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                title="GitHub"
              >
                <Github size={18} />
              </a>
            )}
            {team.linkedin && (
              <a
                href={team.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                title="LinkedIn"
              >
                <Linkedin size={18} />
              </a>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
            {canEdit && onEdit && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onEdit(team)}
                className="flex-1"
              >
                <Edit size={16} className="mr-1" />
                Edit
              </Button>
            )}
            {canEdit && onToggleStatus && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onToggleStatus(team._id, !team.isActive)}
                className="flex-1"
              >
                {team.isActive ? (
                  <>
                    <EyeOff size={16} className="mr-1" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <Eye size={16} className="mr-1" />
                    Activate
                  </>
                )}
              </Button>
            )}
            {canDelete && onDelete && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDelete}
                className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                disabled={isDeleting}
              >
                <Trash2 size={16} className="mr-1" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{team.name}</strong>? This action cannot be
              undone. The profile image will also be removed from the cloud.
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

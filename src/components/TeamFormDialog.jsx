'use client';

import React, { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { teamService } from '@/services/teamService';

export function TeamFormDialog({ open, onOpenChange, onSubmit, isLoading, initialData = null }) {
  const [formData, setFormData] = useState(
    initialData || {
      name: '',
      email: '',
      position: '',
      github: '',
      linkedin: '',
      backgroundColour: '#3B82F6',
    }
  );

  const [profileImage, setProfileImage] = useState(initialData?.profileImage || null);
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  React.useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setProfileImage(initialData.profileImage || null);
    }
  }, [initialData, open]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const uploadImage = async () => {
    if (!imageFile) return profileImage;

    setUploading(true);
    try {
      const response = await teamService.uploadImage(imageFile, 'team-members');
      
      if (response.success) {
        return response.data.url;
      }
      throw new Error('Failed to upload image');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to upload image');
      console.error('Upload error:', error);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name || !formData.email || !formData.position) {
      toast.error('Please fill all required fields');
      return;
    }

    if (!profileImage) {
      toast.error('Please upload a profile image');
      return;
    }

    try {
      // Upload image if new file was selected
      let imageUrl = profileImage;
      if (imageFile) {
        imageUrl = await uploadImage();
        if (!imageUrl) return;
      }

      // Call onSubmit with image URL
      await onSubmit({
        ...formData,
        profileImage: imageUrl,
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        position: '',
        github: '',
        linkedin: '',
        backgroundColour: '#3B82F6',
      });
      setProfileImage(null);
      setImageFile(null);
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to submit form');
      console.error('Submit error:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Team Member' : 'Add New Team Member'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="profile-image">Profile Image</Label>
            <div className="flex gap-4">
              {profileImage && (
                <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-gray-200">
                  <img
                    src={profileImage}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setProfileImage(null);
                      setImageFile(null);
                    }}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="profile-image"
                />
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                  variant="outline"
                  disabled={uploading}
                >
                  <Upload className="mr-2" size={16} />
                  {uploading ? 'Uploading...' : 'Upload Image'}
                </Button>
              </div>
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter team member name"
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter email address"
              required
            />
          </div>

          {/* Position */}
          <div className="space-y-2">
            <Label htmlFor="position">Position *</Label>
            <Input
              id="position"
              name="position"
              value={formData.position}
              onChange={handleInputChange}
              placeholder="Enter position (e.g., Senior Developer)"
              required
            />
          </div>

          {/* GitHub */}
          <div className="space-y-2">
            <Label htmlFor="github">GitHub Link</Label>
            <Input
              id="github"
              name="github"
              value={formData.github}
              onChange={handleInputChange}
              placeholder="https://github.com/username"
            />
          </div>

          {/* LinkedIn */}
          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn Link</Label>
            <Input
              id="linkedin"
              name="linkedin"
              value={formData.linkedin}
              onChange={handleInputChange}
              placeholder="https://linkedin.com/in/username"
            />
          </div>

          {/* Background Color */}
          <div className="space-y-2">
            <Label htmlFor="backgroundColour">Background Color</Label>
            <div className="flex gap-2">
              <input
                id="backgroundColour"
                type="color"
                name="backgroundColour"
                value={formData.backgroundColour}
                onChange={handleInputChange}
                className="w-16 h-10 rounded cursor-pointer border border-gray-300"
              />
              <Input
                type="text"
                value={formData.backgroundColour}
                onChange={handleInputChange}
                name="backgroundColour"
                placeholder="#3B82F6"
                className="flex-1"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || uploading}
            >
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

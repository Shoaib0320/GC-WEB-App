'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Plus, GripVertical, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { projectService } from '@/services/projectService';

export function ProjectFormDialog({ open, onOpenChange, onSubmit, isLoading, initialData = null }) {
  const [activeTab, setActiveTab] = useState('basic');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    fullDescription: '',
    category: 'Web Application',
    projectType: 'Client Project',
    technologies: [],
    frameworks: [],
    databases: [],
    tools: [],
    liveUrl: '',
    githubUrl: '',
    demoVideoUrl: '',
    documentationUrl: '',
    client: { name: '', country: '' },
    duration: '',
    teamSize: 1,
    features: [],
    displayOrder: 0,
    isFeatured: false,
    metaTitle: '',
    metaDescription: '',
  });

  // Images state
  const [thumbnail, setThumbnail] = useState(null);
  const [images, setImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);

  // Tech stack input states
  const [techInput, setTechInput] = useState('');
  const [frameworkInput, setFrameworkInput] = useState('');
  const [dbInput, setDbInput] = useState('');
  const [toolInput, setToolInput] = useState('');

  // Feature input states
  const [featureTitle, setFeatureTitle] = useState('');
  const [featureDesc, setFeatureDesc] = useState('');

  // Reset form when dialog opens/closes or initialData changes
  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({
          title: initialData.title || '',
          shortDescription: initialData.shortDescription || '',
          fullDescription: initialData.fullDescription || '',
          category: initialData.category || 'Web Application',
          projectType: initialData.projectType || 'Client Project',
          technologies: initialData.technologies || [],
          frameworks: initialData.frameworks || [],
          databases: initialData.databases || [],
          tools: initialData.tools || [],
          liveUrl: initialData.liveUrl || '',
          githubUrl: initialData.githubUrl || '',
          demoVideoUrl: initialData.demoVideoUrl || '',
          documentationUrl: initialData.documentationUrl || '',
          client: initialData.client || { name: '', country: '' },
          duration: initialData.duration || '',
          teamSize: initialData.teamSize || 1,
          features: initialData.features || [],
          displayOrder: initialData.displayOrder || 0,
          isFeatured: initialData.isFeatured || false,
          metaTitle: initialData.metaTitle || '',
          metaDescription: initialData.metaDescription || '',
        });
        setThumbnail(initialData.thumbnail || null);
        setImages(initialData.images || []);
      } else {
        resetForm();
      }
    }
  }, [open, initialData]);

  const resetForm = () => {
    setFormData({
      title: '',
      shortDescription: '',
      fullDescription: '',
      category: 'Web Application',
      projectType: 'Client Project',
      technologies: [],
      frameworks: [],
      databases: [],
      tools: [],
      liveUrl: '',
      githubUrl: '',
      demoVideoUrl: '',
      documentationUrl: '',
      client: { name: '', country: '' },
      duration: '',
      teamSize: 1,
      features: [],
      displayOrder: 0,
      isFeatured: false,
      metaTitle: '',
      metaDescription: '',
    });
    setThumbnail(null);
    setImages([]);
    setNewFiles([]);
    setActiveTab('basic');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value },
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Tech stack handlers
  const addTech = (type, value, setter) => {
    if (!value.trim()) return;
    const fieldMap = {
      tech: 'technologies',
      framework: 'frameworks',
      db: 'databases',
      tool: 'tools',
    };
    const field = fieldMap[type];
    if (!formData[field].includes(value.trim())) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()],
      }));
    }
    setter('');
  };

  const removeTech = (type, index) => {
    const fieldMap = {
      tech: 'technologies',
      framework: 'frameworks',
      db: 'databases',
      tool: 'tools',
    };
    const field = fieldMap[type];
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  // Feature handlers
  const addFeature = () => {
    if (!featureTitle.trim()) return;
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, { title: featureTitle.trim(), description: featureDesc.trim() }],
    }));
    setFeatureTitle('');
    setFeatureDesc('');
  };

  const removeFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  // Image handlers
  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = [];
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image`);
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is larger than 10MB`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    // Create previews
    const previews = await Promise.all(
      validFiles.map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve({
              file,
              preview: reader.result,
              isNew: true,
            });
          };
          reader.readAsDataURL(file);
        });
      })
    );

    setNewFiles(prev => [...prev, ...previews]);

    // Set first image as thumbnail if none exists
    if (!thumbnail && previews.length > 0) {
      setThumbnail({
        url: previews[0].preview,
        isNew: true,
        file: previews[0].file,
      });
    }
  };

  const removeImage = (index, isNew = false) => {
    if (isNew) {
      setNewFiles(prev => prev.filter((_, i) => i !== index));
    } else {
      setImages(prev => prev.filter((_, i) => i !== index));
    }
  };

  const setAsThumbnail = (image, isNew = false) => {
    if (isNew) {
      setThumbnail({
        url: image.preview,
        isNew: true,
        file: image.file,
      });
    } else {
      setThumbnail({
        url: image.url,
        publicId: image.publicId,
        isNew: false,
      });
    }
    toast.success('Thumbnail set successfully');
  };

  // Upload images
  const uploadNewImages = async () => {
    if (newFiles.length === 0) return [];

    setUploading(true);
    try {
      const files = newFiles.map(f => f.file);
      const response = await projectService.uploadImages(files, 'portfolio-projects');

      if (response.success) {
        return response.data.images;
      }
      throw new Error('Failed to upload images');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to upload images');
      console.error('Upload error:', error);
      return null;
    } finally {
      setUploading(false);
    }
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast.error('Title is required');
      setActiveTab('basic');
      return;
    }
    if (!formData.shortDescription.trim()) {
      toast.error('Short description is required');
      setActiveTab('basic');
      return;
    }
    if (!thumbnail) {
      toast.error('Please select a thumbnail');
      setActiveTab('images');
      return;
    }

    try {
      // Upload new images if any
      let uploadedImages = [];
      if (newFiles.length > 0) {
        uploadedImages = await uploadNewImages();
        if (uploadedImages === null) return;
      }

      // Prepare thumbnail
      let finalThumbnail = thumbnail;
      if (thumbnail.isNew) {
        // Find the uploaded thumbnail
        const thumbIndex = newFiles.findIndex(f => f.preview === thumbnail.url);
        if (thumbIndex !== -1 && uploadedImages[thumbIndex]) {
          finalThumbnail = {
            url: uploadedImages[thumbIndex].url,
            publicId: uploadedImages[thumbIndex].publicId,
          };
        }
      }

      // Combine existing and new images
      const allImages = [
        ...images.map((img, i) => ({ ...img, order: i })),
        ...uploadedImages.map((img, i) => ({ ...img, order: images.length + i })),
      ];

      // Prepare final data
      const finalData = {
        ...formData,
        thumbnail: finalThumbnail,
        images: allImages,
      };

      await onSubmit(finalData);
      resetForm();
    } catch (error) {
      toast.error('Failed to save project');
      console.error('Submit error:', error);
    }
  };

  const categories = projectService.getCategories();
  const projectTypes = projectService.getProjectTypes();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>{initialData ? 'Edit Project' : 'Add New Project'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-6">
              <TabsList className="w-full grid grid-cols-5">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="tech">Tech Stack</TabsTrigger>
                <TabsTrigger value="images">Images</TabsTrigger>
                <TabsTrigger value="links">Links</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="h-[55vh] px-6 mt-4">
              {/* Basic Info Tab */}
              <TabsContent value="basic" className="space-y-4 mt-0">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter project title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shortDescription">Short Description *</Label>
                  <Textarea
                    id="shortDescription"
                    name="shortDescription"
                    value={formData.shortDescription}
                    onChange={handleInputChange}
                    placeholder="Brief description (max 300 characters)"
                    maxLength={300}
                    rows={2}
                  />
                  <p className="text-xs text-gray-500">{formData.shortDescription.length}/300</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullDescription">Full Description</Label>
                  <Textarea
                    id="fullDescription"
                    name="fullDescription"
                    value={formData.fullDescription}
                    onChange={handleInputChange}
                    placeholder="Detailed project description"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Project Type</Label>
                    <Select
                      value={formData.projectType}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, projectType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {projectTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.isFeatured}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFeatured: checked }))}
                    />
                    <Label>Featured Project</Label>
                  </div>
                </div>
              </TabsContent>

              {/* Tech Stack Tab */}
              <TabsContent value="tech" className="space-y-4 mt-0">
                {/* Technologies */}
                <div className="space-y-2">
                  <Label>Technologies / Languages</Label>
                  <div className="flex gap-2">
                    <Input
                      value={techInput}
                      onChange={(e) => setTechInput(e.target.value)}
                      placeholder="e.g., JavaScript, Python"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTech('tech', techInput, setTechInput))}
                    />
                    <Button type="button" onClick={() => addTech('tech', techInput, setTechInput)}>
                      <Plus size={16} />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.technologies.map((tech, i) => (
                      <Badge key={i} variant="secondary" className="gap-1">
                        {tech}
                        <X size={14} className="cursor-pointer" onClick={() => removeTech('tech', i)} />
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Frameworks */}
                <div className="space-y-2">
                  <Label>Frameworks / Libraries</Label>
                  <div className="flex gap-2">
                    <Input
                      value={frameworkInput}
                      onChange={(e) => setFrameworkInput(e.target.value)}
                      placeholder="e.g., React, Next.js, Django"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTech('framework', frameworkInput, setFrameworkInput))}
                    />
                    <Button type="button" onClick={() => addTech('framework', frameworkInput, setFrameworkInput)}>
                      <Plus size={16} />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.frameworks.map((fw, i) => (
                      <Badge key={i} variant="secondary" className="gap-1">
                        {fw}
                        <X size={14} className="cursor-pointer" onClick={() => removeTech('framework', i)} />
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Databases */}
                <div className="space-y-2">
                  <Label>Databases</Label>
                  <div className="flex gap-2">
                    <Input
                      value={dbInput}
                      onChange={(e) => setDbInput(e.target.value)}
                      placeholder="e.g., MongoDB, PostgreSQL"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTech('db', dbInput, setDbInput))}
                    />
                    <Button type="button" onClick={() => addTech('db', dbInput, setDbInput)}>
                      <Plus size={16} />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.databases.map((db, i) => (
                      <Badge key={i} variant="secondary" className="gap-1">
                        {db}
                        <X size={14} className="cursor-pointer" onClick={() => removeTech('db', i)} />
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Tools */}
                <div className="space-y-2">
                  <Label>Tools / Services</Label>
                  <div className="flex gap-2">
                    <Input
                      value={toolInput}
                      onChange={(e) => setToolInput(e.target.value)}
                      placeholder="e.g., Docker, AWS, Vercel"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTech('tool', toolInput, setToolInput))}
                    />
                    <Button type="button" onClick={() => addTech('tool', toolInput, setToolInput)}>
                      <Plus size={16} />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tools.map((tool, i) => (
                      <Badge key={i} variant="secondary" className="gap-1">
                        {tool}
                        <X size={14} className="cursor-pointer" onClick={() => removeTech('tool', i)} />
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Images Tab */}
              <TabsContent value="images" className="space-y-4 mt-0">
                {/* Thumbnail Preview */}
                <div className="space-y-2">
                  <Label>Thumbnail *</Label>
                  {thumbnail ? (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-blue-500">
                      <img
                        src={thumbnail.url}
                        alt="Thumbnail"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-blue-500">Thumbnail</Badge>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-48 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                      <p className="text-gray-500">Upload images and select a thumbnail</p>
                    </div>
                  )}
                </div>

                {/* Upload Button */}
                <div className="space-y-2">
                  <Label>Project Images</Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                    disabled={uploading}
                  >
                    <Upload className="mr-2" size={16} />
                    {uploading ? 'Uploading...' : 'Upload Images'}
                  </Button>
                </div>

                {/* Existing Images */}
                {images.length > 0 && (
                  <div className="space-y-2">
                    <Label>Existing Images ({images.length})</Label>
                    <div className="grid grid-cols-4 gap-3">
                      {images.map((img, i) => (
                        <div key={i} className="relative group rounded-lg overflow-hidden border">
                          <img
                            src={img.url}
                            alt={`Image ${i + 1}`}
                            className="w-full h-24 object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              onClick={() => setAsThumbnail(img, false)}
                              title="Set as thumbnail"
                            >
                              <ImageIcon size={14} />
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              onClick={() => removeImage(i, false)}
                            >
                              <X size={14} />
                            </Button>
                          </div>
                          {thumbnail?.url === img.url && (
                            <div className="absolute top-1 left-1">
                              <Badge className="bg-blue-500 text-xs">Thumb</Badge>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Images Preview */}
                {newFiles.length > 0 && (
                  <div className="space-y-2">
                    <Label>New Images ({newFiles.length})</Label>
                    <div className="grid grid-cols-4 gap-3">
                      {newFiles.map((file, i) => (
                        <div key={i} className="relative group rounded-lg overflow-hidden border border-green-500">
                          <img
                            src={file.preview}
                            alt={`New ${i + 1}`}
                            className="w-full h-24 object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              onClick={() => setAsThumbnail(file, true)}
                              title="Set as thumbnail"
                            >
                              <ImageIcon size={14} />
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              onClick={() => removeImage(i, true)}
                            >
                              <X size={14} />
                            </Button>
                          </div>
                          {thumbnail?.url === file.preview && (
                            <div className="absolute top-1 left-1">
                              <Badge className="bg-blue-500 text-xs">Thumb</Badge>
                            </div>
                          )}
                          <div className="absolute top-1 right-1">
                            <Badge className="bg-green-500 text-xs">New</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Links Tab */}
              <TabsContent value="links" className="space-y-4 mt-0">
                <div className="space-y-2">
                  <Label htmlFor="liveUrl">Live URL</Label>
                  <Input
                    id="liveUrl"
                    name="liveUrl"
                    value={formData.liveUrl}
                    onChange={handleInputChange}
                    placeholder="https://your-project.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="githubUrl">GitHub URL</Label>
                  <Input
                    id="githubUrl"
                    name="githubUrl"
                    value={formData.githubUrl}
                    onChange={handleInputChange}
                    placeholder="https://github.com/username/repo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="demoVideoUrl">Demo Video URL</Label>
                  <Input
                    id="demoVideoUrl"
                    name="demoVideoUrl"
                    value={formData.demoVideoUrl}
                    onChange={handleInputChange}
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="documentationUrl">Documentation URL</Label>
                  <Input
                    id="documentationUrl"
                    name="documentationUrl"
                    value={formData.documentationUrl}
                    onChange={handleInputChange}
                    placeholder="https://docs.your-project.com"
                  />
                </div>
              </TabsContent>

              {/* Details Tab */}
              <TabsContent value="details" className="space-y-4 mt-0">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="client.name">Client Name</Label>
                    <Input
                      id="client.name"
                      name="client.name"
                      value={formData.client.name}
                      onChange={handleInputChange}
                      placeholder="Client or company name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client.country">Client Country</Label>
                    <Input
                      id="client.country"
                      name="client.country"
                      value={formData.client.country}
                      onChange={handleInputChange}
                      placeholder="e.g., USA, UK, Pakistan"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Project Duration</Label>
                    <Input
                      id="duration"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      placeholder="e.g., 3 months, 6 weeks"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="teamSize">Team Size</Label>
                    <Input
                      id="teamSize"
                      name="teamSize"
                      type="number"
                      min="1"
                      value={formData.teamSize}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="displayOrder">Display Order</Label>
                  <Input
                    id="displayOrder"
                    name="displayOrder"
                    type="number"
                    min="0"
                    value={formData.displayOrder}
                    onChange={handleInputChange}
                    placeholder="Lower number = higher priority"
                  />
                </div>

                {/* Features */}
                <div className="space-y-2">
                  <Label>Key Features</Label>
                  <div className="flex gap-2">
                    <Input
                      value={featureTitle}
                      onChange={(e) => setFeatureTitle(e.target.value)}
                      placeholder="Feature title"
                      className="flex-1"
                    />
                    <Input
                      value={featureDesc}
                      onChange={(e) => setFeatureDesc(e.target.value)}
                      placeholder="Description (optional)"
                      className="flex-1"
                    />
                    <Button type="button" onClick={addFeature}>
                      <Plus size={16} />
                    </Button>
                  </div>
                  <div className="space-y-2 mt-2">
                    {formData.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <GripVertical size={16} className="text-gray-400" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{feature.title}</p>
                          {feature.description && (
                            <p className="text-xs text-gray-500">{feature.description}</p>
                          )}
                        </div>
                        <Button type="button" size="sm" variant="ghost" onClick={() => removeFeature(i)}>
                          <X size={14} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

              </TabsContent>
            </ScrollArea>
          </Tabs>

          <DialogFooter className="p-6 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || uploading}>
              {isLoading || uploading ? 'Saving...' : 'Save Project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

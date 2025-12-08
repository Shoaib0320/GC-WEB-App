# Teams Management System Documentation

## Overview

This is a complete Teams management system that allows you to manage company team members with their profiles, images, and social links.

## Features

✅ **Add Team Members** - Create new team member profiles
✅ **Edit Team Members** - Update existing team member information
✅ **Delete Team Members** - Remove team members (with image cleanup)
✅ **Activate/Deactivate** - Toggle team member status
✅ **Image Upload** - Upload profile images to Cloudinary
✅ **Social Links** - Add GitHub and LinkedIn profiles
✅ **Background Color** - Customize profile card background color
✅ **Search & Filter** - Find team members by name, email, or position
✅ **Status Filtering** - View active, inactive, or all team members
✅ **Responsive Design** - Mobile-friendly UI with Tailwind CSS
✅ **Dark Mode** - Full dark mode support

## File Structure

```
src/
├── Models/
│   └── Team.js                          # Mongoose schema for Team
├── app/
│   ├── api/
│   │   └── teams/
│   │       ├── route.js                 # GET all, POST create
│   │       ├── upload/
│   │       │   └── route.js             # POST upload image
│   │       └── [id]/
│   │           ├── route.js             # GET single, PUT update, DELETE
│   │           └── status/
│   │               └── route.js         # PATCH toggle status
│   └── (dashboard)/
│       └── dashboard/
│           └── teams/
│               └── page.jsx             # Main teams page
├── components/
│   ├── TeamFormDialog.jsx               # Add/Edit form dialog
│   └── TeamCard.jsx                     # Team card component
└── lib/
    └── cloudinary.js                    # Enhanced Cloudinary service
```

## Database Schema

### Team Model

```javascript
{
  // Basic Information
  name: String (required)                 // Team member name
  email: String (required, unique)        // Email address
  position: String (required)             // Job position/title

  // Professional Links
  github: String                          // GitHub profile URL
  linkedin: String                        // LinkedIn profile URL

  // Image Information
  profileImage: String (required)         // Cloudinary image URL
  imagePublicId: String                   // Cloudinary public ID (for deletion)
  backgroundColour: String                // Hex color code (default: #3B82F6)

  // Status
  isActive: Boolean (default: true)       // Active/Inactive status

  // Metadata
  createdBy: ObjectId (ref: User)         // Creator user ID
  updatedBy: ObjectId (ref: User)         // Last editor user ID
  timestamps: true                        // createdAt, updatedAt
}
```

## API Endpoints

### Get All Teams
```
GET /api/teams
Query Parameters:
  - isActive: boolean (optional)          // Filter by status
  - page: number (default: 1)             // Pagination
  - limit: number (default: 10)           // Items per page

Response: { success, data: Team[], pagination }
```

### Get Single Team
```
GET /api/teams/[id]
Response: { success, data: Team }
```

### Create Team Member
```
POST /api/teams
Body: {
  name: string (required)
  email: string (required)
  position: string (required)
  github?: string
  linkedin?: string
  profileImage: string (required)         // Cloudinary URL
  backgroundColour?: string               // Hex color
  createdBy: ObjectId (required)
}
Response: { success, message, data: Team }
```

### Update Team Member
```
PUT /api/teams/[id]
Body: {
  name?: string
  email?: string
  position?: string
  github?: string
  linkedin?: string
  profileImage?: string
  backgroundColour?: string
  imagePublicId?: string
  updatedBy?: ObjectId
}
Response: { success, message, data: Team }
```

### Delete Team Member
```
DELETE /api/teams/[id]
Response: { success, message }
```

### Toggle Status
```
PATCH /api/teams/[id]/status
Body: {
  isActive: boolean (required)
  updatedBy?: ObjectId
}
Response: { success, message, data: Team }
```

### Upload Image
```
POST /api/teams/upload
FormData: {
  file: File (required)                   // Image file
  folder?: string (default: team-members)
}
Response: { success, data: { url, publicId, originalUrl } }
```

## Cloudinary Service

The enhanced `cloudinaryService` includes:

### `uploadImage(file, folder)`
Upload a single image to Cloudinary

```javascript
const result = await cloudinaryService.uploadImage(file, 'team-members');
// Returns: { secure_url, public_id, url }
```

### `uploadImages(files, folder)`
Upload multiple images to Cloudinary

```javascript
const results = await cloudinaryService.uploadImages([file1, file2], 'products');
// Returns: [{ secure_url, public_id, url }, ...]
```

### `deleteImage(publicId)`
Delete a single image from Cloudinary

```javascript
const success = await cloudinaryService.deleteImage('team-members/abc123');
```

### `deleteImages(publicIds)`
Delete multiple images from Cloudinary

```javascript
const success = await cloudinaryService.deleteImages(['id1', 'id2']);
```

### `getOptimizedUrl(url, width, height, quality)`
Get an optimized Cloudinary URL with transformations

```javascript
const optimizedUrl = cloudinaryService.getOptimizedUrl(url, 400, 400, 'auto');
```

## Usage Example

### Frontend

```javascript
// In your component
import { TeamFormDialog } from '@/components/TeamFormDialog';
import { TeamCard } from '@/components/TeamCard';

// Fetch teams
const response = await fetch('/api/teams');
const { data: teams } = await response.json();

// Create team member
const response = await fetch('/api/teams', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    position: 'Senior Developer',
    github: 'https://github.com/johndoe',
    linkedin: 'https://linkedin.com/in/johndoe',
    profileImage: 'https://cloudinary.com/.../image.jpg',
    createdBy: userId,
  }),
});

// Update status
const response = await fetch(`/api/teams/${teamId}/status`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    isActive: true,
    updatedBy: userId,
  }),
});
```

### Image Upload

```javascript
const formData = new FormData();
formData.append('file', file);
formData.append('folder', 'team-members');

const response = await fetch('/api/teams/upload', {
  method: 'POST',
  body: formData,
});

const { data } = await response.json();
console.log(data.url);      // Cloudinary URL
console.log(data.publicId); // For deletion later
```

## Environment Variables

Make sure these are set in your `.env.local`:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Components Guide

### TeamFormDialog

Add/Edit form with image upload support

```jsx
<TeamFormDialog
  open={open}
  onOpenChange={setOpen}
  onSubmit={handleSubmit}
  isLoading={isLoading}
  initialData={teamToEdit}  // Optional for edit mode
/>
```

### TeamCard

Display team member card with actions

```jsx
<TeamCard
  team={teamData}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onToggleStatus={handleToggleStatus}
  isDeleting={false}
/>
```

## Validation Rules

- **Name**: Required, max 100 characters
- **Email**: Required, unique, valid email format
- **Position**: Required, max 100 characters
- **GitHub**: Optional, valid GitHub URL format
- **LinkedIn**: Optional, valid LinkedIn URL format
- **Background Color**: Valid hex color code (#RRGGBB)
- **Image**: Required, max 5MB, image file only

## Accessibility Features

- Proper semantic HTML
- ARIA labels for dialogs
- Keyboard navigation support
- Dark mode support
- Responsive design
- Alt text for images

## Security Features

- Input validation on frontend and backend
- Email uniqueness check
- File type validation for images
- File size validation (max 5MB)
- User authentication tracking (createdBy, updatedBy)

## Performance Optimizations

- Image optimization via Cloudinary (auto quality, fetch format)
- Lazy loading for team cards
- Pagination support for large team lists
- Efficient database queries with indexing
- Search and filter on client-side for better UX

## Future Enhancements

- [ ] Bulk import team members (CSV)
- [ ] Export team directory (PDF)
- [ ] Team member statistics
- [ ] Custom role assignment
- [ ] Skill tags/badges
- [ ] Email notifications
- [ ] Activity history/audit log
- [ ] Team groups/departments

---

Created with ❤️ using Next.js, shadcn/ui, Tailwind CSS, and Cloudinary
